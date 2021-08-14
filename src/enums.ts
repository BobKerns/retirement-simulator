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
 * Units of time intervals.
 */
export enum CalendarUnit {
    year = 'year',
    quarter = 'quarter',
    month = 'month',
    week = 'week',
    day = 'day'
};
