/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * A set of utilities for working with calendar time.
 * @module
 */

import { Sync, range } from "genutils";
import { CalendarPeriod } from "./calendar-period";
import { isLeapYear, MONTH_START } from "./calendar-utils";
import { CalendarUnit } from "./enums";
import { Age, as, asAge, floor, Year } from "./tagged";
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
 * The number of days in a particular year.
 * @param year The year as a number
 * @returns 365 or 366
 */
export const yearDays = (year: Year) => isLeapYear(year) ? 366 : 365;

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
 * Rolls back time to the start of a year, quarter, month, or day. Higher-order function that
 * returns a function for the specific time period to truncate to.
 * @param unit Unit of time to truncate to (must not be 'week').
 * @returns (date: {@link Date}) => {@link Date}
 */
export const truncateDate = (unit: CalendarUnit) => {
    switch (unit) {
        case CalendarUnit.year: return (date: Date) =>
            new Date(date.getUTCFullYear(), 0, 0, 0, 0, 0, 0);
        case CalendarUnit.quarter: return (date: Date) =>
            new Date(
                date.getUTCFullYear(),
                floor(date.getUTCMonth()/3) * 3,
                0, 0, 0, 0, 0
            );
        case CalendarUnit.month: return (date: Date) =>
            new Date(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                0, 0, 0, 0, 0
            );
        case CalendarUnit.week: throw new Error(`'week' is not a meaningful unit to truncate a date to.`);
        case CalendarUnit.day: return (date: Date) =>
            new Date(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate(),
                0, 0, 0, 0
            );
    }
    throw new Error(`Unknown TimeInterval: ${unit}`);
};

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
