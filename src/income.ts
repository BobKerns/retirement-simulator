/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { CashFlow } from "./cashflow";
import { StateMixin } from "./state-mixin";
import { IIncome, Row } from "./types";

/**
 * An income item. By default, annual, but can be constrained to a particular period of time.
 */
export class Income extends CashFlow<'income'> implements IIncome {
    constructor(row: Row<'income'>) {
        super(row);
    }
}


export const IncomeState = StateMixin(Income);
