/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Sync } from "genutils";
import { CalendarUnit } from "../enums";
import { as, floor, Integer, isInteger, Year } from "../tagged";
import { typeChecks } from "../utils";

/*
 * General calendar utilities.
 *
 * @module
 */

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


export type CalendarLength = {
    [k in keyof typeof CalendarUnit]?: Integer
} & {
    totalDays: Integer
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

export type CalendarStep = CalendarLength & {
    date: Date;
    step: Integer;
};

export const isCalendarStep = (a: any): a is CalendarStep =>
        isCalendarLength(a)
        && isDate((a as any).date)
        && isInteger((a as any).step);

export const [toCalendarStep, asCalendarStep] = typeChecks(isCalendarStep, 'a CalendarStep');

export const isDate = (d: any): d is Date => d instanceof Date && !isNaN(d.valueOf());
export const [toDate, asDate] = typeChecks(isDate, 'is not a Date', d => new Date(d));

/**
 * Increment a time by a specified period of time.
 *
 * The returned value is truncated to the beginning of the UTC day.
 * @param date The date to be incremented
 * @param unit The units to increment by
 * @param n The number of units to increment by
 * @returns
 */
export const incrementDate = (date: Date, unit: CalendarUnit, n: Integer = as(1)) => {
    const month = date.getUTCMonth();
    const step = () => {
        const nmonths = (n: number) => {
                const nm = month + n;
                const y = floor(nm / 12);
                const m = nm % 12;
                return [y, m, 0];
            };
        switch (unit) {
            case CalendarUnit.year: return [n, 0, 0];
            case CalendarUnit.quarter: return nmonths(n * 3);
            case CalendarUnit.month: return nmonths(n);
            case CalendarUnit.week: return [0, 0, 7 * n];
            case CalendarUnit.day: return [0, 0, n];
        }
        throw new Error(`Unknown TimeInterval: ${unit}`);
    }

    const [iYear, iMonth, iDay] = step();
    if (iDay) {
        return new Date(date.getTime() + iDay * 24 * 60 * 60 * 1000);
    } else {
        return new Date(
            date.getUTCFullYear() + iYear,
            iMonth,
            date.getUTCDate(),
            0, 0, 0, 0
        );
    }
};

/**
 *  Left-pad with '0'  to 2 digits.
 * @param n A number or a string representation of a number
 * @returns
 */
const p2 = (n: any) => String(n).padStart(2, '0');

/**
 * Format the date as year-mo
 * @param date
 * @returns
 */
export const fmt_month = (date: Date) =>
    `${date.getUTCFullYear()}-${p2(date.getUTCMonth() + 1)}`;


/**
 * Format the date as year-mo-dd
 * @param date
 * @returns
 */
export const fmt_date = (date: Date) =>
    `${date.getUTCFullYear()}-${p2(date.getUTCMonth() + 1)}-${p2(date.getUTCDate())}`;


/**
 * Format the time as HH:MM:SS
 * @param date
 * @returns
 */
export const fmt_time = (date: Date) =>
    `${p2(date.getUTCHours())}:${p2(date.getUTCMinutes() + 1)}:${p2(date.getUTCSeconds())}`;

/**
 * Format the time as year-mo-dd HH:MM:SS
 * @param date
 * @returns
 */
export const fmt_datetime = (date: Date) =>
    `${fmt_date(date)} ${fmt_time(date)}`;


/**
 *
 * @param start
 * @param end
 * @param timeUnit
 * @param n
 * @returns
 */
export const calendarSteps = (start: Date, end: Date, timeUnit: CalendarUnit, n: Integer) => {
    const startTime = start.getTime();
    const day = (24 * 60 * 60 * 1000);
    function *calendarSteps(): Generator<CalendarStep, void, void> {
        let step: Integer = as(0);
        let date = start;
        while (date <= end) {
            const totalDays: Integer = floor((date.getTime() - startTime)/day);
            yield {step, date, [timeUnit]: n,  totalDays};
            step++;
            date = incrementDate(date, timeUnit, n);
        }
    }
    return Sync.enhance(calendarSteps());
}

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