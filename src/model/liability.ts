/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { ExpenseName, IFScenario, ILiability, ItemImpl, ItemState, RowType, SeriesName, SimContext, Stepper, Type } from "../types";
import { Monetary } from "./monetary";
import { $$, $0, $max, $min, Money, Rate } from "../tagged";
import { StateMixin } from "./state-mixin";
import { classChecks } from "../utils";
import { asCalendarUnit, CalendarStep, CalendarUnit } from "../calendar";
import { convertInterestPerPeriod } from "../sim/interest";

/**
 * A liability (generally, a loan or mortgage).
 *
 * **Key fields:**
 * * {@link value}
 * * {@link rate}
 * * {@link rateType}
 * * {@link paymentPeriod}
 * * {@link paymentPeriod}
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
        this.payment = row.payment ?? $0;
        this.paymentPeriod = row.paymentPeriod ?? CalendarUnit.month;
    }

    *stepper<T extends Type>(start: CalendarStep, ctx: SimContext): Stepper<'liability'> {
        let step = start;
        let value = $0;
        let date = start.start;
        let rate = convertInterestPerPeriod(this.rate, asCalendarUnit(this.rateType), CalendarUnit.month);
                let started = false;
        while (true) {
            const active = date >= this.start;
            if (!started && active) {
                value = this.value;
                started = true;
            }
            if (started && value <= 0) return;
            const interest: Money = $$(rate * value);
            const payment = $min(value + interest, this.payment ?? $0);
            const principal = $$(payment - interest);
            const balance = active ? $$(value + interest - principal) : $0;
            if (active) {
                ctx.addTimeLine('pay', date, this, { amount: payment, balance: value });
                ctx.addTimeLine('interest', date, this, { amount: interest, balance });
            }
            const next = yield {value, interest, principal, payment, rate};
            value = $max(next.value - principal, $0);
            date = next.date;
        }
    }
}


export class LiabilityState extends StateMixin(Liability) {
    constructor(row: ItemImpl<'liability'>, scenario: IFScenario, state: ItemState<'liability'>) {
        super(row, scenario, state);
    }
}
export const [isLiability, toLiability, asLiability] = classChecks(Liability);
