/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * A set of utilities for working with calendar time.
 * @module
 */

import { range } from "genutils";
import { day, isLeapYear, MONTH_START, UTC } from "./calendar-utils";
import { Age, asAge, asYear, Relaxed, Year } from "../tagged";

/**
 * Obtain the day number of a given `Date`
 * @param d The given `Date`.
 * @returns number of days since January 1
 */
export const day_of_year = (d: Date) =>
  (d.valueOf() - year(d).valueOf()) /
  (24 * 60 * 60 * 1000);

/**
 * Return the `Date` for January 1 in the year of the supplied date.
 * @param d the date
 */
export const year = (d: Date) =>
    years[d.getUTCFullYear()] ?? UTC(d.getUTCFullYear());

/**
 * The number of days in a particular year.
 * @param year The year as a number
 * @returns 365 or 366
 */
export const yearDays = (year: Relaxed<Year>) => isLeapYear(year) ? 366 : 365;

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

/**
 * Today as a `Date`, starting at midnite (UTC).
 */
export const TODAY = day(new Date());

/**
 * This year as a 4-digit number.
 */

export const YEAR = asYear(TODAY.getUTCFullYear());

/**
 * Default to 50 years.
 */
export let END_YEAR = asYear(YEAR + 50);

/**
 * `Date` a century in the future.
 */
export const END_OF_TIME = UTC(YEAR + 100);

/**
 * Year number a century in the future.
 */
export const END_OF_YEARS = asYear(END_OF_TIME.getUTCFullYear() + 1);

/**
 * The year boundaries for the next century.
 */
const years = range(YEAR, END_OF_YEARS).map(v => UTC(v)).asArray();

/**
 * This year as a `Date` referring to January 1.
 */
export const THIS_YEAR = year(TODAY);