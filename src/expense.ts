/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { IExpense, IncomeStreamName, Row } from "./types";
import { CashFlow } from "./cashflow";

export class Expense extends CashFlow<'expense'> implements IExpense {
    fromStream: IncomeStreamName;
    constructor(row: Row<'expense'>) {
        super(row);
        this.fromStream = row.fromStream;
    }
}