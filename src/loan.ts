/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { IExpense, ILoan, Row } from "./types";
import {Monetary} from "./monetary";

/**
 * A loan. If not interest-free, `growth` should be supplied with 1 + the simple annual interest rate.
 */
export class Loan extends Monetary<'loan'> implements ILoan {
    growth: number;
    payment?: number;
    expense?: IExpense;
    constructor(row: Row<'loan'>) {
        super(row);
        this.growth = row.growth ?? 1;
    }
}