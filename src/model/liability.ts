/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { ExpenseName, IFScenario, ILiability, ItemImpl, ItemState, RowType, SeriesName } from "../types";
import { Monetary } from "./monetary";
import { Money, Rate } from "../tagged";
import { StateMixin } from "./state-mixin";
import { classChecks } from "../utils";
import { CalendarUnit } from "../enums";

/**
 * A liability (generally, a loan or mortgage). If not interest-free, `rate` should be supplied with
 * 1 + the simple annual interest rate.
 */
export class Liability extends Monetary<'liability'> implements ILiability {
    rate: Rate;
    rateType: CalendarUnit | SeriesName;
    payment?: Money;
    paymentPeriod: CalendarUnit;
    expense?: ExpenseName;
    constructor(row: RowType<'liability'>) {
        super(row);
        this.rate = row.rate ?? 1;
        this.rateType = row.rateType || CalendarUnit.year;
        this.paymentPeriod = row.paymentPeriod || CalendarUnit.month;
    }
}


export class LiabilityState extends StateMixin(Liability) {
    constructor(row: ItemImpl<'liability'>, scenario: IFScenario, state: ItemState<'liability'>) {
        super(row, scenario, state);
    }
}
export const [isLiability, toLiability, asLiability] = classChecks(Liability);
