/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Sync } from "genutils";
import { ANNUAL_PAYMENT_PERIODS, CalendarUnit, isCalendarUnit } from "../calendar";
import { $$, Money, Rate } from "../tagged";
import { AppliedInterest, AppliedLoanPayment } from "../types";

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
export function applyRateSimpleMonthly(ivalue: Money, r: Rate): Generator<AppliedInterest>;
export function applyRateSimpleMonthly(ivalue: Money, r: Rate, paymenmt: Money): Generator<AppliedLoanPayment>;
export function applyRateSimpleMonthly(ivalue: Money, r: Rate, payment?: Money): Generator<AppliedInterest | AppliedLoanPayment> {
    // Need to handle different payment periods, canonicalizing the rate, etc.
    function *applyRateSimpleMonthly(): Generator<AppliedInterest | AppliedLoanPayment> {
        const round = (dollars: number) => (Math.round(dollars * 100) / 100);
        const monthlyRate = (r - 1) / 12;
        let payments = 0;
        let principal = 0;
        let interest = 0;
        let value: number = ivalue;
        while (value !== 0) {
            const mInterest = round(value * monthlyRate);
            const nvalue = value + mInterest;
            interest += mInterest;
            if (payment !== undefined) {
                const mPrincipal = Math.min(nvalue, Math.max(0, payment - mInterest));
                const pmt = Math.min(payment, nvalue);
                value = round(nvalue - mPrincipal);
                principal += mPrincipal;
                payments += pmt;
                yield {
                    value: value as Money,
                    interest: mInterest as Money,
                    principal: mPrincipal as Money,
                    payment: pmt as Money
                };
            } else {
                value = round(nvalue);
                return {
                    value: value as Money,
                    interest: interest as Money
                }
            }
        }
        // Return value probably won't be used. Returns the final value and total
        // principal, interest, and payments.
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
    return newPeriod * convertInterestPerPeriod(rate, fromPeriod, newPeriod) as Rate;
}


/**
 * Convert interest rates between different compounding periods.
 * @param rate The rate _per year_ in the original compounding period.
 * @param fromPeriod The number of periods per year for the original compounding period, or the corresponding {@link CalendarUnit}.
 * @param newPeriod  The number of periods per year for the new compounding period, or the corresponding {@link CalendarUnit}.
 * @returns The effective rate _per period_ at the new compounding period.
 */
export const convertInterestPerPeriod = (rate: Rate, fromPeriod: number|CalendarUnit, newPeriod: number|CalendarUnit): Rate => {
    if (isCalendarUnit(fromPeriod)) {
        return convertInterestPerPeriod(rate, ANNUAL_PAYMENT_PERIODS[fromPeriod], newPeriod);
    } else if (isCalendarUnit(newPeriod)) {
        return convertInterestPerPeriod(rate, fromPeriod, ANNUAL_PAYMENT_PERIODS[newPeriod]);
    }
    return (Math.pow(1 + rate / fromPeriod, fromPeriod / newPeriod) - 1) as Rate;
};

export const convertPeriods = (amt: Money, fromPeriod: number | CalendarUnit, newPeriod: number | CalendarUnit): Money => {
    if (isCalendarUnit(fromPeriod)) {
        return convertPeriods(amt, ANNUAL_PAYMENT_PERIODS[fromPeriod], newPeriod);
    } else if (isCalendarUnit(newPeriod)) {
        return convertPeriods(amt, fromPeriod, ANNUAL_PAYMENT_PERIODS[newPeriod]);
    }
    return $$(amt * fromPeriod / newPeriod);
};
