/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { ExpenseName, ILiability, Row } from "./types";
import {Monetary} from "./monetary";
import { Money, Rate } from "./tagged";
import { StateMixin } from "./state-mixin";

/**
 * A liability (generally, a loan or mortgage). If not interest-free, `growth` should be supplied with
 * 1 + the simple annual interest rate.
 */
export class Liability extends Monetary<'liability'> implements ILiability {
    growth: Rate;
    payment?: Money;
    expense?: ExpenseName;
    constructor(row: Row<'liability'>) {
        super(row);
        this.growth = row.growth ?? 1;
    }
}

export const LiabilityState = StateMixin(Liability);
