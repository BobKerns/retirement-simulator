/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { ExpenseName, IFScenario, ILiability, ItemImpl, ItemState, RowType, SeriesName, Type } from "../types";
import { Monetary } from "./monetary";
import { asMoney, Money, Rate, roundTo } from "../tagged";
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
        this.payment = asMoney(row.payment ?? 0);
        this.paymentPeriod = row.paymentPeriod ?? CalendarUnit.month;
    }

    *step<T extends Type>(start: CalendarStep): Generator<ItemState<'liability'>, any, ItemState<'liability'>> {
        let item: ItemImpl<'liability'> | null = this as  ItemImpl<'liability'>;
        let step = start;
        let value = this.value;
        let rate = convertInterestPerPeriod(this.rate, asCalendarUnit(this.rateType), CalendarUnit.month);
        while (true) {
            if (value <= 0) return;
            const payment = asMoney(Math.min(value, this.payment ?? 0));
            const interest: Money = asMoney(roundTo(0.01)(rate * value));
            const principal = asMoney(payment - interest);
            const next = yield this.makeState(step, {value, interest, principal, payment, rate});
            step = next.step;
            if (step.start >= this.start) {
                value = asMoney(next.value - principal);
                rate = next.rate;
                const nitem: ItemImpl<'liability'> | null = (item.temporal.onDate(step.start) as this) ?? null;
                if (nitem === null) return;
                if (nitem !== item) {
                    item = nitem;
                    rate = convertInterestPerPeriod(nitem.rate, asCalendarUnit(nitem.rateType), CalendarUnit.month)
                }
            }
        }
    }
}


export class LiabilityState extends StateMixin(Liability) {
    constructor(row: ItemImpl<'liability'>, scenario: IFScenario, state: ItemState<'liability'>) {
        super(row, scenario, state);
    }
}
export const [isLiability, toLiability, asLiability] = classChecks(Liability);
