/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { ExpenseName, IFScenario, ILiability, ItemImpl, ItemState, RowType, SeriesName, Type } from "../types";
import { Monetary } from "./monetary";
import { asMoney, Money, Rate } from "../tagged";
import { StateMixin } from "./state-mixin";
import { classChecks } from "../utils";
import { asCalendarUnit, CalendarStep, CalendarUnit } from "../calendar";
import { convertInterestPerPeriod } from "../interest";

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
    constructor(row: RowType<'liability'>, scenario: IFScenario) {
        super(row, scenario);
        this.rate = row.rate ?? 0;
        this.rateType = row.rateType || CalendarUnit.year;
        this.payment = asMoney(row.payment ?? 0);
        this.paymentPeriod = row.paymentPeriod ?? CalendarUnit.month;
    }

    *states<T extends Type>(start: CalendarStep): Generator<ItemState<'liability'>, any, ItemState<'liability'>> {
        let item: ItemImpl<'liability'> | null = this as  ItemImpl<'liability'>;
        let step = start;
        let value = this.value;
        const rate = convertInterestPerPeriod(this.rate, asCalendarUnit(this.rateType), this.paymentPeriod)
        while (true) {
            const interest = asMoney(value * rate);
            value = asMoney(value + interest);
            const payment = asMoney(Math.min(this.value, this.payment ?? 0));
            const principal = asMoney(payment - interest);
            value = asMoney(value - payment);
            const next = yield {item, step, value, interest, principal, payment, rate};
            step = next.step;
            value = next.value;
            item = (item.temporal.onDate(step.start) as this) ?? null;
            if (item === null) return;
        }
    }
}


export class LiabilityState extends StateMixin(Liability) {
    constructor(row: ItemImpl<'liability'>, scenario: IFScenario, state: ItemState<'liability'>) {
        super(row, scenario, state);
    }
}
export const [isLiability, toLiability, asLiability] = classChecks(Liability);
