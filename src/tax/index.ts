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
import { StateCode } from '../states';
import { Year } from '../tagged';
import { Throw } from '../utils';
import { TaxData } from './tax-util';

export * from './tax-util';
export * from './tax-tables';

type ComputerTaxParams = {
    state: StateCode;
    year: Year;
    [k: string]: any
}

export const computeTax = ({ state = "US", year, ...options }: {state: StateCode, year: Year} & TaxData) => {
    const state_tables = TAX_TABLES[state] ?? Throw(`No tax tables are entererd for state ${state}.`)
    const tables =
        state_tables[year]
            ?? state_tables[state_tables.default]
            ?? Throw(`State tabled got ${state} do not specify a defauilt: <year>.`)
    return tables.calculate({year, ...options});
}