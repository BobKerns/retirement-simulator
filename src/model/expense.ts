/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { IExpense, IFScenario, IncomeStreamName, ItemImpl, ItemState, RowType } from "../types";
import { CashFlow } from "./cashflow";
import { classChecks, Throw } from "../utils";
import { StateMixin } from "./state-mixin";

/**
 * A flow of money out.
 *
 * The `fromStream` parameter must be specified; it is the other end of the flow, where the money to
 * pay the expense comes from (an {@link IncomeStream}).
 */
export class Expense extends CashFlow<'expense'> implements IExpense {
    fromStream: IncomeStreamName;
    constructor(row: RowType<'expense'>) {
        super(row);
        this.fromStream = row.fromStream ?? Throw(`fromStream must be specified for ${this.name}.`);
    }
}

export class ExpenseState extends StateMixin(Expense) {
    constructor(row: ItemImpl<'expense'>, scenario: IFScenario, state: ItemState<'expense'>) {
        super(row, scenario, state);
    }
}
export const [isExpense, toExpense, asExpense] = classChecks(Expense);