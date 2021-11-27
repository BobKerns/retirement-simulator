/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * [[include:src/tax/README.md]]
 *
 * @module tax
 */

import { TAX_TABLES } from './tax-tables';
import { StateCode } from './states';
import { Year } from '../tagged';
import { Throw } from '../utils';
import { TaxData } from './tax-util';

export * from './states';
export * from './tax-util';
export * from './tax-tables';

/**
 * Parameters to pass to {@link computeTax}.
 */
export type ComputeTaxParams = {
    /**
     * The state to compute
     */
    state: StateCode;
    /**
     * The tax year to estimate.
     */
    year: Year;
    /**
     * Other options.
     */
    [k: string]: any
} & TaxData;

/**
 *
 * @param param A {@link ComputeTaxParams}
 * @returns
 */
export const computeTax = ({ state = "US", year, ...options }: ComputeTaxParams) => {
    const state_tables = TAX_TABLES[state] ?? Throw(`No tax tables are entererd for state ${state}.`)
    const tables =
        state_tables[year]
            ?? state_tables[state_tables.default]
            ?? Throw(`State tabled got ${state} do not specify a defauilt: <year>.`)
    return tables.calculate({year, ...options});
}
