/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import * as SS_2017_raw from './data/SS_2017.json';
import { IPerson, Sex } from './types';


export type ActuaryDatum = {
    /**
     * Probability of surviving one year (birthday to next birthday).
     */
    p: number,
    /**
     * Number of people surviving to this age.
     */
    n: number,
    /**
     * Life expectency from this birthday.
     */
    years: number
};

/**
 * Actuary data for one age, for both sexes.
 */
export type ActuaryAnnualData = {
    age: number,
    male: ActuaryDatum,
    female: ActuaryDatum
};

/**
 * Actuary data from the Social Security Administration based on mortality in calendar year 2017.
 *
 * Source: [Actuarial Life Table](https://www.ssa.gov/oact/STATS/table4c6.html) [Archive](https://web.archive.org/web/20210719152530/https://www.ssa.gov/oact/STATS/table4c6.html)
 */
export const SS_2017: Array<ActuaryAnnualData> = SS_2017_raw;

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

export const yearDays = (year: number) => isLeapYear(year) ? 366 : 365;

const MONTH_START = [
    [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365],
    [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366]
]; //=

export const dayOfYear = (date: Date) => {
    const month = date.getUTCMonth();
    const day =  date.getUTCDate();
    return MONTH_START[isLeapYear(date.getUTCFullYear()) ? 1 : 0][month] + day;
}

export const age = (birthday: Date, date: Date) => {
    const offset = dayOfYear(date) > dayOfYear(birthday) ? -1 : 0
    return date.getUTCFullYear() - birthday.getUTCFullYear() + offset;
}

export function actuary(spouse: IPerson, date: Date): ActuaryDatum;
export function actuary(age: number, sex: Sex): ActuaryDatum;
export function actuary(spouseOrAge: IPerson | number, dateOrSex: Date | Sex): ActuaryDatum {
    if (typeof spouseOrAge == 'number') {
        return SS_2017[Math.round(spouseOrAge)]?.[dateOrSex as Sex];
    } else {
        const birth = spouseOrAge.birth;
        const date = (dateOrSex as Date);
        const days = (date.getTime() - birth.getTime()) / (24 * 60 * 60 * 1000);
        const age = 5;
        return actuary(age, spouseOrAge.sex)
    }
}
