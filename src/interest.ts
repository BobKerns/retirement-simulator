/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Sync } from "genutils/lib/esm/sync";
import { ANNUAL_PAYMENT_PERIODS, isCalendarUnit } from "./calendar";
import { CalendarUnit } from "./enums";
import { Money, Rate } from "./tagged";

/*
 * Interest calculations.
 *
 * @module
 */

export const interestCalculator = () => undefined;

/**
 *
 * @param ivalue Initial value of the asset or liability
 * @param r Annual simple rate to apply
 * @param payment  Nominal payment amount
 * @returns
 */
export const applyRateSimpleMonthly = (ivalue: Money, r: Rate, payment: Money) => {
    // Need to hanle different payment periods, canonicalizing the rate, etc.
    function *applyRateSimpleMonthly() {
        const round = (dollars: number) => (Math.round(dollars * 100) / 100);
        const monthlyRate = (r - 1) / 12;
        const monthlyPmt = payment / 12;
        let payments = 0;
        let principal = 0;
        let interest = 0;
        let value: number = ivalue;
        while (value !== 0) {
            const mInterest = round(value * monthlyRate);
            const nvalue = value + mInterest;
            const mPrincipal = Math.min(nvalue, Math.max(0, monthlyPmt - mInterest));
            const pmt = Math.min(monthlyPmt, nvalue);
            value = round(value - mPrincipal);
            principal += mPrincipal;
            interest += mInterest;
            payments += pmt;
            yield {
                principal: mPrincipal as Money,
                interest: mInterest as Money,
                payment: pmt as Money
            };
        }
        return {
            value: value as Money,
            principal: principal as Money,
            interest: interest as Money,
            payments: payments as Money
        };
    }
    return Sync.enhance(applyRateSimpleMonthly());
}

/**
 * Convert interest rates between different compounding periods.
 * @param rate The rate _per year_ in the original compounding period.
 * @param fromPeriod The number of periods per year for the original compounding period, or the corresponding {@link CalendarUnit}.
 * @param newPeriod  The number of periods per year for the new compounding period, or the corresponding {@link CalendarUnit}.
 * @returns The effective rate _per year_ at the new compounding period.
 */

export const convertInterest = (rate: Rate, fromPeriod: number|CalendarUnit, newPeriod: number|CalendarUnit): Rate => {
    if (isCalendarUnit(fromPeriod)) {
        return convertInterest(rate, ANNUAL_PAYMENT_PERIODS[fromPeriod], newPeriod);
    } else if (isCalendarUnit(newPeriod)) {
        return convertInterest(rate, fromPeriod, ANNUAL_PAYMENT_PERIODS[newPeriod]);
    }
    return newPeriod * (Math.pow(1 + rate / fromPeriod, fromPeriod / newPeriod) - 1) as Rate;
}
