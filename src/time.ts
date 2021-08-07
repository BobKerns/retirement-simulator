/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { range } from "genutils";
import { fmt_date } from "./utils";
import { Age, as, asAge, Integer, isString, Year } from "./tagged";

/**
 * Obtain the day number of a given `Date`
 * @param d The given `Date`.
 * @returns number of days since January 1
 */
export const day_of_year = (d: Date) =>
  (d.valueOf() - year(d).valueOf()) /
  (24 * 60 * 60 * 1000);

/**
 * Get the beginning of the supplied day (using UTC for consistency).
 * @param d The date
 * @returns
 */
export const day = (d: Date) => {
    return new Date(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate()
    );
};

/**
 * Today as a `Date`, starting at midnite (UTC).
 */
export const TODAY = day(new Date());

/**
 * This year as a 4-digit number.
 */

export const YEAR = TODAY.getUTCFullYear();

/**
 * `Date` a century in the future.
 */
export const END_OF_TIME = new Date(YEAR + 100, 0);

/**
 * Year number a century in the future.
 */
export const END_OF_YEARS = END_OF_TIME.getUTCFullYear() + 1;

/**
 * The year boundaries for the next century.
 */
const years = range(YEAR, END_OF_YEARS).map(v => new Date(v, 0)).asArray();


/**
 * Return the `Date` for January 1 in the year of the supplied date.
 * @param d the date
 */
export const year = (d: Date) =>
    years[d.getUTCFullYear()] ?? new Date(d.getUTCFullYear(), 0);

/**
 * Return `true` iff the supplied year is a leap year.
 * @param year The year as a number
 * @returns
 */
export function isLeapYear(year: Year): boolean;
export function isLeapYear(year: Date): boolean;
export function isLeapYear(year: Year | Date): boolean {
    if (year instanceof Date) {
        return isLeapYear(as(year.getUTCFullYear()));
    }
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
 * The number of days in a particular year.
 * @param year The year as a number
 * @returns 365 or 366
 */
export const yearDays = (year: Year) => isLeapYear(year) ? 366 : 365;
const MONTH_START = [
    [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365],
    [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366]
];

const MONTH_LEMGTH = [
    [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

]

/**
 * The day of the year.
 * @param date
 * @returns
 */
export const dayOfYear = (date: Date) => {
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    return MONTH_START[isLeapYear(as(date.getUTCFullYear())) ? 1 : 0][month] + day;
};

/**
 * This year as a `Date` referring to January 1.
 */
export const THIS_YEAR = year(TODAY);

/**
 * Calculate the difference between two dates, in fractional years.
 */
export const calculate_age = (birth: Date, thisDate: Date): Age => {
    const bday = day_of_year(birth);
    const tday = day_of_year(thisDate);
    const bleap = isLeapYear(as(birth.getUTCFullYear()));
    const tleap = isLeapYear(as(thisDate.getUTCFullYear()));
    const bdayLeap = bday < 60
        ? bday
        : bleap
            ? bday - 1
            : bday;
    const tdayLeap = tday < 60
        ? tday
        : tleap
            ? tday - 1
            : tday;
    const year = thisDate.getUTCFullYear();
    const diff = year - birth.getUTCFullYear();
    const days = yearDays(as(bday < 60 ? year - 1 : year));
    const frac = (tday - bday) / days;
    return asAge(diff + frac);
};
/**
 * Units of time intervals.
 */
export enum TimeUnit {
    year = 'year',
    quarter = 'quarter',
    month = 'month',
    week = 'week',
    day = 'day'
};

export type TimeLength = {
    [k in keyof typeof TimeUnit]?: Integer
} & {
    totalDays: Integer
};

export class TimePeriod {
    readonly start: Date;
    readonly end: Date;

    constructor(start: Date, end: Date);
    constructor(start: Date, interval: TimeUnit, n: Integer);
    constructor(start: Date, endOrInterval: Date | TimeUnit, n?: Integer) {
        this.start = start;
        if (isString(endOrInterval)) {
            this.end = incrementDate(start, endOrInterval, n ?? as(1));
        } else {
            this.end = endOrInterval;
        }
    }

    get length(): TimeLength {
        const years = this.end.getUTCFullYear() - this.start.getUTCFullYear();
        const months = this.end.getUTCMonth() - this.start.getUTCMonth();
        const days = this.end.getUTCDate() - this.start.getUTCDate();
        const isLeap = isLeapYear(this.end);
        const [imonths, idays] = days < 0
            ? [months - 1, days + MONTH_LEMGTH[isLeap ? 1 : 0][this.end.getUTCMonth()]]
            : [months, days];
        const [kyears, kmonths] = imonths < 0
            ? [years - 1, imonths + 1]
            : [years, imonths];
        const iweeks = Math.floor(days / 7);
        const fdays = idays - iweeks * 7;
        return {
            ...(years && {year: as(kyears)}),
            ...(months && {month: as(kmonths)}),
            ...(iweeks && {week: as(iweeks)}),
            ...(fdays && {day: as(fdays)}),
            totalDays: as(Math.floor((this.end.getTime() - this.start.getTime()) / (24 * 60 * 60 * 1000)))
        };

    }

    toString() {
        return `${fmt_date(this.start)} to ${fmt_date(this.end)}`;
    }
}

/**
 * Increment a time by a specified period of time.
 * @param date The date to be incremented
 * @param unit The units to increment by
 * @param n The number of units to increment by
 * @returns
 */
export const incrementDate = (date: Date, unit: TimeUnit, n: Integer = as(1)) => {
    const month = date.getUTCMonth();
    const step = () => {
        const nmonths = (n: number) => {
                const nm = month + n;
                const y = Math.floor(nm / 12);
                const m = nm % 12;
                return [y, m, 0];
            };
        switch (unit) {
            case TimeUnit.year: return [n, 0, 0];
            case TimeUnit.quarter: return nmonths(n * 3);
            case TimeUnit.month: return nmonths(n);
            case TimeUnit.week: return [0, 0, 7 * n];
            case TimeUnit.day: return [0, 0, n];
        }
        throw new Error(`Unknown TimeInterval: ${unit}`);
    }

    const [iYear, iMonth, iDay] = step();
    if (iDay) {
        return new Date(date.getTime() + iDay * 7 * 24 * 60 * 60 * 1000);
    } else {
        return new Date(
            date.getUTCFullYear() + iYear,
            iMonth,
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
            date.getUTCMilliseconds()
        );
    }
}

Reflect.defineProperty(TimePeriod.prototype, Symbol.toStringTag, {
    value: "TimePeriod",
    enumerable: false
});