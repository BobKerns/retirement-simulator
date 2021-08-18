/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { CashFlow } from "./cashflow";
import { StateMixin } from "./state-mixin";
import { IFScenario, IIncome, ItemImpl, ItemState, RowType } from "../types";
import { classChecks } from "../utils";

/**
 * An income item. By default, annual, but can be constrained to a particular period of time.
 */
export class Income extends CashFlow<'income'> implements IIncome {
    constructor(row: RowType<'income'>) {
        super(row);
    }
}



export class IncomeState extends StateMixin(Income) {
    constructor(row: ItemImpl<'income'>, scenario: IFScenario, state: ItemState<'income'>) {
        super(row, scenario, state);
    }
}
export const [isIncome, toIncome, asIncome] = classChecks(Income);
