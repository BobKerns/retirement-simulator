/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * General calendar utilities. Dates are represented with `Date` objects constrained to `00:00:00.000 UTC`.
 * Consistent use of [UTC](https://www.timeanddate.com/time/aboututc.html) avoids issues with timezones
 * and possible differing behavior.
 *
 * @module
 */
import { asInteger, asYear, floor, Integer, isInteger, isString, Relaxed, TagOf, toInteger, Year } from "../tagged";
import { Throw, typeChecks } from "../utils";
import { CalendarInterval, CalendarUnit } from "./calendar-types";

/**
 * For each {@link CalendarUnit}, the number of occurrances of that unit per year.
 */
export const ANNUAL_PAYMENT_PERIODS: {[k in CalendarUnit]: number} = {
    year: 1,
    semiannually: 2,
    quarter: 4,
    month: 12,
    semimonthly: 24,
    biweekly: 365.25 / 14,
    week: 365.25 / 7,
    day: 365.25
};

/**
 * Parse a [UTC](https://www.timeanddate.com/time/aboututc.html) date.
 * @see {@link parseDate}
 * @param date a string.
 * @returns a `Date`, constrained to `00:00:00.000 UTC`.
 */
export function UTC(date: string): Date
/**
 * Construct a [UTC](https://www.timeanddate.com/time/aboututc.html) Date
 * @param year
 * @param month (0-11), default = 0 (January)
 * @param day (1-31), default = 1
 * @returns a `Date`, constrained to `00:00:00.000 UTC`.
 */
export function UTC(year: Relaxed<Integer>|string, month?: Relaxed<Integer>, day?: Relaxed<Integer>): Date;
export function UTC(year: Relaxed<Integer>|string, month: Relaxed<Integer> = 0, day: Relaxed<Integer> = 1): Date {
    if (isString(year)) return parseDate(year);
    return new Date(Date.UTC(toInteger(year), toInteger(month), toInteger(day), 0, 0, 0, 0));
}
/**
 * The starting day of each month, 0-origin, for non-leap and leap years.
 */
export const MONTH_START = [
    [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365],
    [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366]
];

/**
 * The length of each month, 0-origin, for non-leap and leap years.
 */
export const MONTH_LEMGTH = [
    [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

]

export const isCalendarUnit = (u: any): u is CalendarUnit => u in CalendarUnit;
export const [toCalendarUnit, asCalendarUnit] = typeChecks(isCalendarUnit, 'a calendar unit');

/**
 * Type guard that determines if the argument is a valid {@link CalendarInterval}.
 * @param i The object under test
 * @returns
 */
export const isCalendarInterval = (i: any): i is CalendarInterval => {
    if (i instanceof Object) {
        const keys = Object.keys(i);
        switch (keys.length) {
            case 0: return false;
            case 1: return isCalendarUnit(keys[0]) && isInteger(i[keys[0]]);
            case 2: return (isCalendarUnit(keys[0]) && isInteger(i[keys[0]])
                             && keys[1] === 'totalDays' && isInteger(i.totalDays))
                        || (isCalendarUnit(keys[1]) && isInteger(i[keys[1]])
                             && keys[0] === 'totalDays' && isInteger(i.totalDays));
            default: return false;
        }
    }
    return false;
};

/**
 * Coercer and caster to {@link CalendarInterval}. There is no coercion, so both
 * perform the same function: verifying and asserting the type.
 */
export const [toCalendarInterval, asCalendarInterval] = typeChecks(isCalendarInterval, 'a CalendarInterval');

/**
 * Decode a {@link CalendarInterval} into `[`{@link CalendarUnit}, _count_`]`.
 */
export const decodeCalendarInterval = (i: CalendarInterval): [CalendarUnit, Integer] =>
    i.year
        ? [CalendarUnit.year, i.year]
        : i.semiannually
        ? [CalendarUnit.semiannually, i.semiannually]
        : i.quarter
        ? [CalendarUnit.quarter, i.quarter]
        : i.month
        ? [CalendarUnit.month, i.month]
        : i.semimonthly
        ? [CalendarUnit.semimonthly, i.semimonthly]
        : i.biweekly
        ? [CalendarUnit.biweekly, i.biweekly]
        : i.week
        ? [CalendarUnit.week, i.week]
        : i.day
        ? [CalendarUnit.day, i.day]
        : Throw(`${JSON.stringify(i)} is not a CalendarInterval`);

/**
 * Measured length of time. This incorporates a {@link CalenderInterval} and adds a measured
 * {@link CalendarLength.totalDays} that measures the exact number of days.
 */
export type CalendarLength = CalendarInterval & {
    /**
     * The total number of days represented by this interval.
     */
    totalDays: Integer;
};

export const isCalendarLength = (a: any): a is CalendarLength => {
    if (typeof a === 'object' && isDate(a.date) && isInteger(a.totalDays)) {
        for (const tu in CalendarUnit) {
            if (isInteger(a[tu])) return true;
        }
    }
    return false;
}

export const [toCalendarLength, asCalendarLength] = typeChecks(isCalendarLength, 'a valid CalendarLength')

/**
 * Increment a time by a specified period of time.
 *
 * The returned value is truncated to the beginning of the [UTC](https://www.timeanddate.com/time/aboututc.html) day.
 * @param date The date to be incremented
 * @param interval A CalendarInterval denoting how much to increment by.
 * @returns
 */
export function incrementDate(date: Date|string, interval: Relaxed<CalendarInterval, TagOf<Integer>>): Date;
/**
 * Increment a time by a specified period of time.
 *
 * The returned value is truncated to the beginning of the [UTC](https://www.timeanddate.com/time/aboututc.html) day.
 * @param date The date to be incremented
 * @param unit The units to increment by
 * @param n The number of units to increment by
 * @returns
 */
export function incrementDate(date: Date|string, unitOrInterval: CalendarUnit, n?: Relaxed<Integer>): Date;
export function incrementDate(date: Date|string, unitOrInterval: CalendarUnit|Relaxed<CalendarInterval, TagOf<Integer>>, num: Relaxed<Integer> = 1) {
    if (isCalendarInterval(unitOrInterval)) {
        const [unit, n] = decodeCalendarInterval(unitOrInterval);
        return incrementDate(date, unit, n);
    }
    const unit = unitOrInterval;
    const ndate = toDate(date);
    const year = ndate.getUTCFullYear();
    const month = ndate.getUTCMonth();
    const day = ndate.getUTCDate();
    const n = asInteger(num);
    const step = () => {
        const nmonths = (n: number) => {
                const nm = month + n;
                const y = floor(nm / 12);
                const m = nm % 12;
                return [y, m - month, 0];
            };
        const nsemimonths = (n: number) => {
                const nm = month + floor(n / 2);
                const y = floor(nm / 12);
                const m = day >= 15 && n & 1
                    ? nm % 12 + 1
                    : nm % 12;
                const d = day >= 15
                    ? n & 1
                        ? - day + 1// Wrapped to next month
                        : 0
                    : n & 1
                        ? 14
                        : 0;
                return [y, m - month, d];
            };
        switch (unit) {
            case CalendarUnit.year: return [n, 0, 0];
            case CalendarUnit.semiannually: return nmonths(n * 6);
            case CalendarUnit.quarter: return nmonths(n * 3);
            case CalendarUnit.month: return nmonths(n);
            case CalendarUnit.semimonthly: return nsemimonths(n);
            case CalendarUnit.biweekly: return [0, 0, 14 * n];
            case CalendarUnit.week: return [0, 0, 7 * n];
            case CalendarUnit.day: return [0, 0, n];
        }
        throw new Error(`Unknown TimeInterval: ${unit}`);
    }

    const [iYear, iMonth, iDay] = step();
    const idate = UTC(
        year + iYear,
        month + iMonth,
        day
    );
    if (iDay) {
        return new Date(idate.getTime() + iDay * 24 * 60 * 60 * 1000);
    } else {
        return idate;
    }
};

/**
 *  Left-pad with `'0'` to 2 digits.
 * @param n A number or a string representation of a number
 * @returns
 */
const p2 = (n: any) => String(n).padStart(2, '0');

/**
 * Format the date as _year-mo_
 * @param date
 * @returns
 */
export const fmt_month = (date: Date|string): string =>
    isDate(date)
        ? `${date.getUTCFullYear()}-${p2(date.getUTCMonth() + 1)}`
        : fmt_month(toDate(date));


/**
 * Format the date as _year-mo-dd_
 * @param date
 * @returns
 */
export const fmt_date = (date: Date|string): string =>
    isDate(date)
        ? `${date.getUTCFullYear()}-${p2(date.getUTCMonth() + 1)}-${p2(date.getUTCDate())}`
        : fmt_date(toDate(date));

/**
 * Format the time as _HH:MM:SS_
 * @param date
 * @returns
 */
export const fmt_time = (date: Date|string): string =>
    isDate(date)
        ? `${p2(date.getUTCHours())}:${p2(date.getUTCMinutes() + 1)}:${p2(date.getUTCSeconds())}`
        :  fmt_time(toDate(date));

/**
 * Format the time as _year-mo-dd HH:MM:SS_
 * @param date
 * @returns
 */
export const fmt_datetime = (date: Date): string =>
    isDate(date)
        ? `${fmt_date(date)} ${fmt_time(date)}`
        : fmt_datetime(toDate(date));

/**
 * Return `true` iff the supplied year is a leap year.
 * @param year The year as a number
 * @returns
 */
export function isLeapYear(year: Relaxed<Year>): boolean;
export function isLeapYear(year: Date): boolean;
export function isLeapYear(yearOrDate: Relaxed<Year> | Date): boolean {
    if (yearOrDate instanceof Date) {
        return isLeapYear(yearOrDate.getUTCFullYear());
    }
    const year = asYear(yearOrDate);
    if ((year % 4) !== 0) {
        return false;
    } else if ((year % 100) !== 0) {
        return true;
    } else if ((year % 400) !== 0) {
        return false;
    } else {
        return true;
    }
};

/**
 * Rolls back time to the start of a year, quarter, month, or day. Higher-order function that
 * returns a function for the specific time period to truncate to.
 * @param unit Unit of time to truncate to (must not be 'week').
 * @returns (date: {@link Date}) => {@link Date}
 */
export const truncateDate = (unit: CalendarUnit) => {
    switch (unit) {
        case CalendarUnit.year: return (date: Date) =>
            UTC(date.getUTCFullYear());
        case CalendarUnit.quarter: return (date: Date) =>
            UTC(
                date.getUTCFullYear(),
                floor(date.getUTCMonth()/3) * 3
            );
        case CalendarUnit.month: return (date: Date) =>
            UTC(
                date.getUTCFullYear(),
                date.getUTCMonth()
            );
        case CalendarUnit.week: throw new Error(`'week' is not a meaningful unit to truncate a date to.`);
        case CalendarUnit.day: return (date: Date) =>
            UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate()
            );
    }
    throw new Error(`Unknown TimeInterval: ${unit}`);
};

export const isDate = (d: any): d is Date =>
    d instanceof Date
    && !isNaN(d.valueOf())
    && d.getUTCHours() === 0
    && d.getUTCMinutes() === 0
    && d.getUTCSeconds() === 0
    && d.getUTCMilliseconds() === 0;

const truncateToDay = truncateDate(CalendarUnit.day);
const coerceDate = (d: Date | string) =>
        (d instanceof Date)
            ? truncateToDay(d)
            : UTC(d);

export const [toDate, asDate] = typeChecks(isDate, 'is not a UTC Date', coerceDate);

/**
 * Get the beginning of the supplied day (using [UTC](https://www.timeanddate.com/time/aboututc.html) for consistency).
 * @param d The date
 * @returns
 */
export const day = truncateDate(CalendarUnit.day);

/**
 * Parse a [UTC](https://www.timeanddate.com/time/aboututc.html) date, in one of the following forms:
 *
 * * `2021-08-13`
 * * `2021-08`    // Same as `2021-08-01`
 * * `2021`       // Same as `2021-01-01`
 *
 * Leading zeros on month and day are optional. Two-year year abbreviations are _not_ allowed.
 *
 * @param date A string in the form _YYYY-MMM-dd_
 * @returns a Date at `00:00:00.000 UTC`.
 */
export const parseDate = (date: string): Date => {
    const match = /^\s*(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?\s*$/.exec(date);
    if (!match) {
        throw new Error(`${date} is not a valid date. Must be in the form YYYY-01-23. Month and day are optional, default to 01.`);
    }
    const year = Number(match[1]);
    const month = Number(match[2] ?? 1);
    const day = Number(match[3] ?? 1);
    return UTC(year, month - 1, day);
}