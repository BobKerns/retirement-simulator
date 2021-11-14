/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { CashFlow } from "./cashflow";
import { StateMixin } from "./state-mixin";
import {
    Constraint, IFScenario, Id,
    IncomeSourceType, IIncomeStream, IncomeStreamBoundSpec, IncomeStreamId, IncomeStreamName, IncomeStreamSpec,
    ItemImpl, ItemState, ItemStates, MonetaryType, RowType, Type, WithdrawalEvent, Writeable
    } from "../types";
import { classChecks, entries, isMonetary, Throw } from "../utils";
import { $$, $0, $max, $min, isString, Money } from "../tagged";
import { Monetary } from "./monetary";
import { CalendarStep } from "../calendar";
import { Sources, PayableType, Stepper  } from "../types";


export const addSubSources = (sources: Sources, subsources: Sources) => {
    for (const [k, v] of entries(subsources)) {
        sources[k] = $$((sources[k] ?? $0) + (v ?? $0));
    }
};

/**
 * A composite stream of money used to pay expenses (or potentially, to contribute to assets, NYI).
 */
export class IncomeStream extends CashFlow<'incomeStream'> implements IIncomeStream {

    #rawSpec: IncomeStreamSpec;
    #boundSpec?: IncomeStreamBoundSpec;

    constructor(row: RowType<'incomeStream'>, scenario: IFScenario) {
        super(row, scenario);
        this.#rawSpec = IncomeStream.parse(row.spec);
    }

    /**
     * @internal
     * @param spec
     * @param name
     * @returns
     */
    static parse(spec: string | IncomeStreamSpec, name?: IncomeStreamName): IncomeStreamSpec {
        if (typeof spec === 'string') {
            // Fix curly-quotes
            const nspec = spec.replace(/[“”]/g, '"');
            if (/^["\[{]/.test(nspec)) {
                try {
                    return JSON.parse(nspec);
                } catch (e: any) {
                    throw new Error(`Error parsing incomeStream ${name ?? `unknown`}: ${e.message}`);
                }
            }
        }
        return spec;
    };

    /**
     * @internal
     * @param spec
     * @returns
     */
    get spec(): IncomeStreamBoundSpec {
        return this.#boundSpec ?? (this.#boundSpec = this.bind(this.#rawSpec));
    }

    /**
     * @internal
     * @param spec
     * @returns an IncomeStreamSpec with all the references resolved to IDs and the weights/constraints canonicalized.
     */
    bind(spec: IncomeStreamSpec): IncomeStreamBoundSpec {
        const id = (spec: string) =>
            spec.startsWith('@')
                ? this.scenario.incomeStreams[spec.substring(1)].id as IncomeStreamId
                ?? Throw(`There is no IncomeStream named ${spec.substring(1)}`)
                : (
                    this.scenario.incomes[spec]
                    ?? this.scenario.assets[spec]
                    ?? this.scenario.liabilities[spec]
                )?.id as IncomeStreamId
                ?? Throw(`There is no income, asset, or liability named "${spec}"`);
        if (isString(spec)) {
            if (spec.startsWith('@')) {
                const name = spec.substring(1);
                return this.scenario.incomeStreams[name].id as IncomeStreamId;
            }
            return id(spec);
        } else if (Array.isArray(spec)) {
            return spec.map(s => this.bind(s));
        } else if (typeof spec === 'object') {
            const result: { [k: string]: Constraint; } = {};
            let total = 0;
            for (const k in spec) {
                total += (spec as any)[k];
            }
            for (const k in spec) {
                const src = id(k);
                // Normalized fraction
                result[src] = { weight: (spec as any)[k] / total };
            }
            return result;
        } else {
            throw new Error(`Unknown income stream spec: ${spec}`);
        }
    }

    withdraw(value: Money, id: Id<PayableType>, state: ItemStates): WithdrawalEvent {
        const sources: Sources = {};
        const alloc = (id: Id<IncomeSourceType>, amount: Money) => sources[id] = $$((sources[id] ?? $0) + amount);
        const withdrawFrom = (raw_amt: Money, spec: IncomeStreamBoundSpec): Money => {
            if (isString(spec)) {
                const current = state[spec]?.current;
                if (current) {
                    if (isIncomeStream(current.item)) {
                        const { amount, sources: subSources } = current.item.withdraw(raw_amt, id, state);
                        addSubSources(sources, subSources);
                        return amount;
                    } else if (isIncomeSource(current)) {
                        const item = current.item;
                        const amt = $min(raw_amt, current.value);
                        current.used = $$((current.used ?? $0) + amt);
                        if (item.type === 'liability') {
                            // Really should flip the sign on liabilities and expenses.
                            current.value = $$(current.value + amt);
                        } else {
                            current.value = $$(current.value - amt);
                        }
                        alloc(item.id, amt);
                        return amt;
                    } else {
                        throw new Error(`${spec} is not a valid source of income.`);
                    }
                } else {
                    console.log(`The income source ${spec} is not available at ${state.date}.`);
                    return $0;
                }
            } else if (Array.isArray(spec)) {
                let total = 0;
                for (const k of spec) {
                    total += withdrawFrom($max(raw_amt - total, $0), k);
                    if (total >= raw_amt) {
                        break;
                    }
                }
                return $$(total);
            } else if (typeof spec === 'object') {
                const shares: {[k: string]: Constraint} = spec;
                // TODO: Enforce min and max
                // First apply min amounts, subtracting from amount to distribute.
                // Then apply max amounts (if met), and add excess to the amount to
                // distribute.
                // Repeat (w/ higher distribution) until no new stream max amounts are met.
                // Then distribute by weight.
                let total = 0;
                for (const k in spec) {
                    total += withdrawFrom($$(raw_amt * shares[k].weight), k as IncomeStreamId);
                }
                return $$(total);
            }
            throw new Error(`Unknown spec: ${spec}`);
        }
        return {id, amount: withdrawFrom(value, this.spec), sources};
    }

    *stepper<T extends Type>(start: CalendarStep): Stepper<'incomeStream'> {
        while (true) {
            const next = yield {};
        }
    }
}

/**
 * @internal
 * @param a
 * @returns
 */
export const isMonetaryState = <T extends MonetaryType>(a: any): a is Writeable<Monetary<T>> => a.item && isMonetary(a);

export const isIncomeSource = <T extends IncomeSourceType>(a: any): a is Writeable<ItemState<'asset'  | 'liability' | 'income'>> => a.item && (a.item.type === 'asset' || a.item.type === 'liability' || a.item.type === 'income');

export class IncomeStreamState extends StateMixin(IncomeStream) {
    constructor(row: ItemImpl<'incomeStream'>, scenario: IFScenario, state: ItemState<'incomeStream'>) {
        super(row, scenario, state);
    }
    /**
     * @internal
     * @param spec
     * @returns
     */

    parse(spec: string | IncomeStreamSpec): IncomeStreamSpec {
        return spec as IncomeStreamSpec;
    }
}
export const [isIncomeStream, toIncomeStream, asIncomeStream] = classChecks(IncomeStream);
