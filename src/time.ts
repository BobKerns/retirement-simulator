/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { range } from "genutils";
import { Age, asAge } from "./tagged";

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
export const isLeapYear = (year: number) => {
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
export const yearDays = (year: number) => isLeapYear(year) ? 366 : 365;
const MONTH_START = [
    [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365],
    [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366]
]; //=

/**
 * The day of the year.
 * @param date
 * @returns
 */
export const dayOfYear = (date: Date) => {
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    return MONTH_START[isLeapYear(date.getUTCFullYear()) ? 1 : 0][month] + day;
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
    const bleap = isLeapYear(birth.getUTCFullYear());
    const tleap = isLeapYear(thisDate.getUTCFullYear());
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
    const days = yearDays(bday < 60 ? year - 1 : year);
    const frac = (tday - bday) / days;
    return asAge(diff + frac);
};