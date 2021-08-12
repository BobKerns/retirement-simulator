/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Common enumerations. Separated from types.ts to minimize exposure to dependency loops.
 * @module
 */

/**
 * Type of interest rate compounding.
 */
export enum RateType {
    /**
     * Fixed yield (yield only available at maturity)
     */
    fixed = 'FIXED',
    /**
     * Interest expressed as Annual Percentage Rage
     */
    apr = 'APR',
    /**
     * Interest expressed as Monthly Percentage Rage
     */
    mpr = 'MPR',
    /**
     * Interest expressed as Daily Percentage Rage
     */
    dpr = 'DPR',
    /**
     * Interest expressed as Annual Percentage Rage
     */
    compound = 'COMPOUND'
}

/**
 * Units of time intervals.
 */
export enum CalendarUnit {
    year = 'year',
    quarter = 'quarter',
    month = 'month',
    week = 'week',
    day = 'day'
};
