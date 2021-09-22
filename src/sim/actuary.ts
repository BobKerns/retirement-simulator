/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import SS_2017_raw from '../data/SS_2017.json';
import { as, asProbability, floor } from '../tagged';
import { calculate_age } from '../calendar';
import { IFPerson, IPerson, Sex } from '../types';
import { START, END } from '../time';
import { range } from 'genutils';
import { Probability } from '..';


export type ActuaryDatum = {
    /**
     * Probability of surviving one year (birthday to next birthday).
     */
    readonly p: Probability,
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
export const SS_2017: Array<ActuaryAnnualData> = SS_2017_raw as Array<ActuaryAnnualData>;

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
    const eol: ActuaryDatum = {p: as(0), n: 0, years: 0};
    if (typeof spouseOrAge == 'number') {
        const idx = floor(spouseOrAge);
        const frac = spouseOrAge - idx;
        const sex = dateOrSex as Sex;
        const base = SS_2017[idx]?.[sex];
        if (!base) return eol;
        if (frac <= 0.003) return base;
        const next = SS_2017[idx + 1]?.[sex];
        if (!next) return eol;
        const interpolate = (a: number, b: number, frac: number) => (a * (1 - frac) + b * frac);
        return {
            p: asProbability(interpolate(base.p, next.p, frac)),
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

export function compute_probabilities(spouse: IFPerson, date: Date): Probability[];
export function compute_probabilities(spouse: undefined, date: Date): undefined;
export function compute_probabilities(spouse: IFPerson | undefined, date: Date = END): Probability[] | undefined {
    if (!spouse) return undefined;
    const age = spouse.age(START);
    let p = asProbability(1);
    let years = date.getUTCFullYear() - START.getUTCFullYear();
    return range(0, years + 1)
        .map((y) => {
            p = as(p * (1 - actuary(age + y, spouse.sex)?.p ?? 1));
            return p;
        })
        .asArray();
}
