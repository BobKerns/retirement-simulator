/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import SS_2017_raw from './data/SS_2017.json';
import { floor } from './tagged';
import { calculate_age } from './time';
import { IPerson, Sex } from './types';
import { Throw } from './utils';


export type ActuaryDatum = {
    /**
     * Probability of surviving one year (birthday to next birthday).
     */
    readonly p: number,
    /**
     * Number of people surviving to this age.
     */
    readonly n: number,
    /**
     * Life expectency from this birthday.
     */
    readonly years: number
};

/**
 * Actuary data for one age, for both sexes.
 */
export type ActuaryAnnualData = {
    readonly age: number,
    readonly male: ActuaryDatum,
    readonly female: ActuaryDatum
};

/**
 * Actuary data from the Social Security Administration based on mortality in calendar year 2017.
 *
 * Source: [Actuarial Life Table](https://www.ssa.gov/oact/STATS/table4c6.html) ([Archive](https://web.archive.org/web/20210719152530/https://www.ssa.gov/oact/STATS/table4c6.html))
 */
export const SS_2017: Array<ActuaryAnnualData> = SS_2017_raw;

/**
 * Obtain actuarial data for a person on a particular date.
 *
 * Interpolates from the actuarial tables. (Linear interpolation for now, although that is not strictly correct),
 * @param spouse
 * @param date The date on which the age is desired.
 */
export function actuary(spouse: IPerson, date: Date): ActuaryDatum;
/**
 * Obtain actuarial data for a specified age and sex.
 *
 * Interpolates from the actuarial tables. (Linear interpolation for now, although that is not strictly correct),
 * @param age
 * @param sex
 */
export function actuary(age: number, sex: Sex): ActuaryDatum;
export function actuary(spouseOrAge: IPerson | number, dateOrSex: Date | Sex): ActuaryDatum {
    if (typeof spouseOrAge == 'number') {
        const idx = floor(spouseOrAge);
        const frac = spouseOrAge - idx;
        const sex = dateOrSex as Sex;
        const base = SS_2017[idx]?.[sex] ?? Throw(`No data for age ${idx}.`);
        if (frac <= 0.003) return base;
        const next = SS_2017[idx + 1]?.[sex] ?? Throw(`No data for age ${idx + 1}.`);
        const interpolate = (a: number, b: number, frac: number) => (a * (1 - frac) + b * frac);
        return {
            p: interpolate(base.p, next.p, frac),
            n: Math.round(interpolate(base.n, next.n, frac)),
            years: interpolate(base.years, next.years, frac)
        };
    } else {
        const birth = spouseOrAge.birth;
        const date = (dateOrSex as Date);
        const age = calculate_age(birth, date);
        return actuary(age, spouseOrAge.sex)
    }
}
