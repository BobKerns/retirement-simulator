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
    transfer = 'transfer',
    incomeTax = 'incomeTax',
    person = 'person',
    text = 'text',
    scenario = 'scenario'
}

export enum RateType {
    simpleMonthly = 'simpleMonthly'
};
