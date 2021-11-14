/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { ExpenseName, IFScenario, ILiability, ItemImpl, ItemState, RowType, SeriesName, Stepper, Type } from "../types";
import { Monetary } from "./monetary";
import { $$, $0, $min, Money, Rate } from "../tagged";
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

    *stepper<T extends Type>(start: CalendarStep): Stepper<'liability'> {
        let step = start;
        let amt = this.value;
        let date = start.start;
        let rate = convertInterestPerPeriod(this.rate, asCalendarUnit(this.rateType), CalendarUnit.month);
        while (true) {
            if (amt <= 0) return;
            const payment = $min(amt, this.payment ?? $0);
            const interest: Money = $$(rate * amt);
            const principal = $$(payment - interest);
            const value = date >= this.start ? amt : $0;
            const next = yield {value, interest, principal, payment, rate};
            amt = $$(next.value - principal);
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
