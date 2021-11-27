/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Assets and related.
 *
 * @module
 */

import { Monetary } from "./monetary";
import { StateMixin } from "./state-mixin";
import { Rate, Money, $$, $0 } from "../tagged";
import { IAsset, IFScenario, ItemImpl, ItemState, RowType, SeriesName, SimContext, Stepper, Type } from "../types";
import { classChecks } from "../utils";
import { asCalendarUnit, CalendarStep, CalendarUnit } from "../calendar";
import { convertInterestPerPeriod } from "../sim/interest";

/**
 * An item with a monetary value. If _growth_ is supplied and not equal to `1.0`, the asset value
 * will change by that factor each period (currently, always annually, pro-rated).
 *
 * **Key fields:**
 * * {@link value}
 * * {@link rate}
 * * {@link rateType}
 * * {@link paymentPeriod}
 */
export class Asset extends Monetary<'asset'> implements IAsset, ItemImpl<'asset'> {
    rate: Rate;
    rateType: CalendarUnit | SeriesName;
    paymentPeriod: CalendarUnit;
    constructor(row: RowType<'asset'>, scenario: IFScenario) {
        super(row, scenario);
        this.rate = row.rate ?? 0;
        this.rateType = row.rateType || CalendarUnit.year;
        this.paymentPeriod = row.paymentPeriod || CalendarUnit.year;
    }

    *stepper<T extends Type>(start: CalendarStep, ctx: SimContext): Stepper<'asset'> {
        let amt = this.value;
        let date = start.start;
        let rate = convertInterestPerPeriod(this.rate, asCalendarUnit(this.rateType), CalendarUnit.month)
        let interest: Money = $0;
        while (true) {
            const value = date >= this.start ? amt : $0;
            ctx.addTimeLine('interest', date, this, { amount: interest, balance: amt })
            const next = yield { value: amt, interest, rate };
            rate = next.rate;
            interest = $$(rate * amt);
            amt = $$(next.value + interest);
            date = next.date;
        }
    }
}

export class AssetState extends StateMixin<'asset'>(Asset) {
    constructor(row: ItemImpl<'asset'>, scenario: IFScenario, state: ItemState<'asset'>) {
        super(row, scenario, state);
    }
}

export const [isAsset, toAsset, asAsset] = classChecks(Asset);
