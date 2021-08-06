/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { CashFlow } from "./cashflow";
import { IIncomeStream, IncomeStreamSpec, Row } from "./types";

/**
 * A composite stream of money used to pay expenses (or potentially, to contribute to assets, NYI).
 */
export class IncomeStream extends CashFlow<'incomeStream'> implements IIncomeStream {
    spec: IncomeStreamSpec;
    constructor(row: Row<'incomeStream'>) {
        super(row);
        let spec = row.spec;
        this.spec = this.#parse(spec);
    }

    /**
     * @internal
     * @param spec
     * @returns
     */
    #parse(spec: string | IncomeStreamSpec): IncomeStreamSpec {
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
        return spec;
    }
}