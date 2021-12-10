/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { CashFlow } from "./cashflow";
import { StateMixin } from "./state-mixin";
import {
    Constraint, IFScenario, Id,
    SourceType, ITransfer, TransferBoundSpec, TransferId, TransferName, TransferSpec,
    ItemImpl, ItemState, ItemStates, MonetaryType, RowType, SimContext, Type, WithdrawalEvent, Writeable
    } from "../types";
import { classChecks, entries, isMonetary, Throw } from "../utils";
import { $$, $0, $max, $min, isString, Money } from "../tagged";
import { Monetary } from "./monetary";
import { CalendarStep } from "../calendar";
import { Category, Sources, PayableType, Stepper } from "../types";


export const addSubSources = (sources: Sources, subsources: Sources) => {
    for (const [k, v] of entries(subsources)) {
        sources[k] = $$((sources[k] ?? $0) + (v ?? $0));
    }
};

/**
 * A composite stream of money used to pay expenses (or potentially, to contribute to assets, NYI).
 */
export class Transfer extends CashFlow<'transfer'> implements ITransfer {

    #rawSpec: TransferSpec;
    #boundSpec?: TransferBoundSpec;

    constructor(row: RowType<'transfer'>, scenario: IFScenario) {
        super(row, scenario);
        this.#rawSpec = Transfer.parse(row.spec);
    }

    /**
     * @internal
     * @param spec
     * @param name
     * @returns
     */
    static parse(spec: string | TransferSpec, name?: TransferName): TransferSpec {
        if (typeof spec === 'string') {
            // Fix curly-quotes
            const nspec = spec.replace(/[“”]/g, '"');
            if (/^["\[{]/.test(nspec)) {
                try {
                    return JSON.parse(nspec);
                } catch (e: any) {
                    throw new Error(`Error parsing transfer ${name ?? `unknown`}: ${e.message}`);
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
    get spec(): TransferBoundSpec {
        return this.#boundSpec ?? (this.#boundSpec = this.bind(this.#rawSpec));
    }

    /**
     * @internal
     * @param spec
     * @returns an {@link TransferSpec} with all the references resolved to IDs and the weights/constraints canonicalized.
     */
    bind(spec: TransferSpec): TransferBoundSpec {
        const id = (spec: string) =>
            spec.startsWith('@')
                ? this.scenario.transfers[spec.substring(1)].id as TransferId
                ?? Throw(`There is no Transfer named ${spec.substring(1)}`)
                : (
                    this.scenario.incomes[spec]
                    ?? this.scenario.assets[spec]
                    ?? this.scenario.liabilities[spec]
                )?.id as TransferId
                ?? Throw(`There is no income, asset, or liability named "${spec}"`);
        if (isString(spec)) {
            if (spec.startsWith('@')) {
                const name = spec.substring(1);
                return this.scenario.transfers[name].id as TransferId;
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
            throw new Error(`Unknown transfer spec: ${spec}`);
        }
    }

    withdraw(value: Money, id: Id<PayableType>, state: ItemStates): WithdrawalEvent {
        const sources: Sources = {};
        let taxable = $0;
        let deductable = $0;
        const isTaxable = (item: ItemImpl<Type>) => !item.hasCategory('nontaxable' as Category)
        const alloc = (id: Id<SourceType>, amount: Money) => sources[id] = $$((sources[id] ?? $0) + amount);
        const withdrawFrom = (raw_amt: Money, spec: TransferBoundSpec): Money => {
            if (isString(spec)) {
                const current = state[spec]?.current;
                if (current) {
                    if (isTransfer(current.item)) {
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
                            if (isTaxable(item)) {
                                const status = current as ItemState<'liability'>;
                                deductable = $$(deductable + status.interest);
                            }
                        } else {
                            current.value = $$(current.value - amt);
                            if (isTaxable(item)) {
                                taxable = $$(taxable + amt);
                            }
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
                    total += withdrawFrom($$(raw_amt * shares[k].weight), k as TransferId);
                }
                return $$(total);
            }
            throw new Error(`Unknown spec: ${spec}`);
        }
        return {id, amount: withdrawFrom(value, this.spec), sources, taxable, deductable};
    }

    *stepper<T extends Type>(start: CalendarStep, ctx: SimContext): Stepper<'transfer'> {
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

export const isIncomeSource = <T extends SourceType>(a: any): a is Writeable<ItemState<'asset'  | 'liability' | 'income'>> => a.item && (a.item.type === 'asset' || a.item.type === 'liability' || a.item.type === 'income');

export class TransferState extends StateMixin(Transfer) {
    constructor(row: ItemImpl<'transfer'>, scenario: IFScenario, state: ItemState<'transfer'>) {
        super(row, scenario, state);
    }
    /**
     * @internal
     * @param spec
     * @returns
     */

    parse(spec: string | TransferSpec): TransferSpec {
        return spec as TransferSpec;
    }
}
export const [isTransfer, toTransfer, asTransfer] = classChecks(Transfer);
