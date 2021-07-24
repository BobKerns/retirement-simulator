/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { CashFlow } from "./cashflow";
import { IIncome, Row } from "./types";

export class Income extends CashFlow<'income'> implements IIncome {
    constructor(row: Row<'income'>) {
        super(row);
    }
}