/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { IExpense, IncomeStreamName, Row } from "./types";
import { CashFlow } from "./cashflow";
import { Throw } from "./utils";

/**
 * A flow of money out.
 *
 * The `fromStream` parameter must be specified; it is the other end of the flow, where the money to
 * pay the expense comes from (an {@link IncomeStream}).
 */
export class Expense extends CashFlow<'expense'> implements IExpense {
    fromStream: IncomeStreamName;
    constructor(row: Row<'expense'>) {
        super(row);
        this.fromStream = row.fromStream ?? Throw(`fromStream must be specified for ${this.name}.`);
    }
}