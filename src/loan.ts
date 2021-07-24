/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { IExpense, ILoan, Row } from "./types";
import {Monetary} from "./monetary";

export class Loan extends Monetary<'loan'> implements ILoan {
    growth: number;
    payment?: number;
    expense?: IExpense;
    constructor(row: Row<'loan'>) {
        super(row);
        this.growth = row.growth ?? 1;
    }
}