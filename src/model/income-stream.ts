/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { CashFlow } from "./cashflow";
import { StateMixin } from "./state-mixin";
import { IFScenario, IIncomeStream, IncomeStreamSpec, ItemImpl, ItemState, ItemStates, RowType } from "../types";
import { classChecks, Throw } from "../utils";
import { isString, Money } from "../tagged";

/**
 * A composite stream of money used to pay expenses (or potentially, to contribute to assets, NYI).
 */
export class IncomeStream extends CashFlow<'incomeStream'> implements IIncomeStream {
    spec: IncomeStreamSpec;
    constructor(row: RowType<'incomeStream'>, scenario: IFScenario) {
        super(row, scenario);
        let spec = row.spec;
        this.spec = this.parse(spec);
    }

    /**
     * @internal
     * @param spec
     * @returns
     */
    parse(spec: string | IncomeStreamSpec): IncomeStreamSpec {
        if (typeof spec === 'string') {
            // Fix curly-quotes
            const nspec = spec.replace(/[“”]/g, '"');
            if (/^["\[{]/.test(nspec)) {
                try {
                    spec = JSON.parse(nspec);
                } catch (e) {
                    throw new Error(`Error parsing incomeStream ${this.name}: ${e.message}`);
                }
            }
        }
        const bind = (spec: any): IncomeStreamSpec => {
            const id = (spec: string) => (
                    this.scenario.incomes[spec]
                    ?? this.scenario.assets[spec]
                    ?? this.scenario.liabilities[spec]
                )?.id
                ?? Throw(`There is no income source named "${spec}"`);
            if (isString(spec)) {
                if (spec.startsWith('@')) {
                    const name = spec.substring(1);
                    return this.scenario.incomeStreams[name].id;
                }
                return id(spec);
            } else if (Array.isArray(spec)) {
                return spec.map(bind);
            } else if (typeof spec === 'object') {
                const result: {[k: string]: IncomeStreamSpec} = {};
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
        return bind(spec);
    }

    withdraw(value: Money, id: string, state: ItemStates) {
        const withdrawFrom = (amount: number, spec: IncomeStreamSpec) => {
            if (isString(spec)) {
                const current = state[spec].current as {value: number};
                const amt = Math.min(amount, current.value);
                current.value -= amt;
                return amt;
            } else if (Array.isArray(spec)) {
                let total = 0;
                for (const k of spec) {
                    total +=  withdrawFrom(Math.max(amount - total, 0), k);
                    if (total >= amount) {
                        break;
                    }
                }
                return total;
            } else if (typeof spec === 'object') {
                const shares: {[k: string]: number} = spec;
                let total = 0;
                for (const k in spec) {
                    total += withdrawFrom(amount * shares[k], k);
                }
                return total;
            }
            throw new Error(`Unknown spec: ${spec}`);
        }
        return withdrawFrom(value, this.spec);
    }
}


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