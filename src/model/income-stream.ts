/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { CashFlow } from "./cashflow";
import { StateMixin } from "./state-mixin";
import { IFScenario, IIncomeStream, IncomeStreamSpec, ItemImpl, ItemState, ItemStates, MonetaryType, RowType, Writeable } from "../types";
import { classChecks, isMonetary, Throw } from "../utils";
import { asMoney, isString, Money } from "../tagged";
import { Monetary } from "./monetary";

/**
 * A composite stream of money used to pay expenses (or potentially, to contribute to assets, NYI).
 */
export class IncomeStream extends CashFlow<'incomeStream'> implements IIncomeStream {

    #rawSpec: IncomeStreamSpec;
    #boundSpec?: IncomeStreamSpec;

    constructor(row: RowType<'incomeStream'>, scenario: IFScenario) {
        super(row, scenario);
        const parse = (spec: string | IncomeStreamSpec): IncomeStreamSpec => {
            if (typeof spec === 'string') {
                // Fix curly-quotes
                const nspec = spec.replace(/[“”]/g, '"');
                if (/^["\[{]/.test(nspec)) {
                    try {
                        return JSON.parse(nspec);
                    } catch (e: any) {
                        throw new Error(`Error parsing incomeStream ${this.name}: ${e.message}`);
                    }
                }
            }
            return spec;
        };
        this.#rawSpec = parse(row.spec);
    }

    /**
     * @internal
     * @param spec
     * @returns
     */
    get spec(): IncomeStreamSpec {
        const bind = (spec: any): IncomeStreamSpec => {
            const id = (spec: string) =>
                spec.startsWith('@')
                    ? this.scenario.incomeStreams[spec.substring(1)].id
                        ?? Throw(`There is no IncomeStream named ${spec.substring(1)}`)
                    : (
                        this.scenario.incomes[spec]
                        ?? this.scenario.assets[spec]
                        ?? this.scenario.liabilities[spec]
                      )?.id
                      ?? Throw(`There is no income, asset, or liability named "${spec}"`);
            if (isString(spec)) {
                if (spec.startsWith('@')) {
                    const name = spec.substring(1);
                    return this.scenario.incomeStreams[name].id;
                }
                return id(spec);
            } else if (Array.isArray(spec)) {
                return spec.map(bind);
            } else if (typeof spec === 'object') {
                const result: {[k: string]: number} = {};
                let total = 0;
                for (const k in spec) {
                    total += spec[k];
                }
                for (const k in spec) {
                    const src = id(k);
                    // Normalized fraction
                    result[src] = spec[k] / total;
                }
                return result;
            } else {
                throw new Error(`Unknown income stream spec: ${spec}`);
            }
        };
        return this.#boundSpec ?? (this.#boundSpec = bind(this.#rawSpec));
    }

    withdraw(value: Money, id: string, state: ItemStates): Money {
        const withdrawFrom = (amount: number, spec: IncomeStreamSpec) => {
            if (isString(spec)) {
                const current = state[spec].current;
                if (current) {
                    const item = current.item;
                    if (isIncomeStream(item)) {
                        return item.withdraw(asMoney(amount), id, state);
                    } else if (isMonetaryState(current)) {
                        const amt = Math.min(amount, current.value);
                        current.value = asMoney(current.value - amt);
                        return asMoney(amt);
                    } else {
                        throw new Error(`${spec} is not a valid source of income.`);
                    }
                } else {
                    throw new Error(`IncomeStream spec ${spec} was not found.`);
                }
            } else if (Array.isArray(spec)) {
                let total = 0;
                for (const k of spec) {
                    total +=  withdrawFrom(Math.max(amount - total, 0), k);
                    if (total >= amount) {
                        break;
                    }
                }
                return asMoney(total);
            } else if (typeof spec === 'object') {
                const shares: {[k: string]: number} = spec;
                let total = 0;
                for (const k in spec) {
                    total += withdrawFrom(amount * shares[k], k);
                }
                return asMoney(total);
            }
            throw new Error(`Unknown spec: ${spec}`);
        }
        return withdrawFrom(value, this.spec);
    }
}

/**
 * @internal
 * @param a
 * @returns
 */
export const isMonetaryState = <T extends MonetaryType>(a: any): a is Writeable<Monetary<T>> => a.item && isMonetary(a);

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