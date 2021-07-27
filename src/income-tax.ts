/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { CashFlow } from "./cashflow";
import { StateCode } from "./states";
import { IIncomeTax, Row } from "./types";

/**
 * A tax on income, state or federal.
 */
export class IncomeTax extends CashFlow<'incomeTax'> implements IIncomeTax {
    state: StateCode;
    constructor(row: Row<'incomeTax'>) {
        super(row);
        this.state = row.state;
    }
}