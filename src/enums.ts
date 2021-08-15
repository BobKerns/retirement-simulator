/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Common enumerations. Separated from types.ts to minimize exposure to dependency loops.
 * @module
 */

export enum Types {
    asset = 'asset',
    liability = 'liability',
    income = 'income',
    expense = 'expense',
    incomeStream = 'incomeStream',
    incomeTax = 'incomeTax',
    person = 'person',
    text = 'text',
    scenario = 'scenario'
}

/**
 * Units of time intervals.
 */
export enum CalendarUnit {
    year = 'year',
    semiannually = 'semiannually',
    quarter = 'quarter',
    month = 'month',
    semimonthly = 'semimonthly',
    biweekly = 'biweekly',
    week = 'week',
    day = 'day'
};
