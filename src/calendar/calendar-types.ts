/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Integer } from "../tagged";

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

/**
 * A specification of a length of time in units specified as {@link CalendarUnit}.
 * e.g.:
 *
 * ```typescript
 * const interval = {month: 3}; // 3 months
 * ```
 */
export type CalendarInterval = {
    /**
     * The desired units and count in those units.
     */
    [k in keyof typeof CalendarUnit]?: Integer;
};


export interface ICalendarRange {
    /**
     * The amount to increment the dates in the range.
     */
    readonly interval: CalendarInterval;
    /**
     * The units of increment. Duplicates the information in {@link interval} for convenience
     * and to avoid recomputing.
     */
    readonly unit: CalendarUnit;
    /**
     * The number of units of increment. Duplicates the information in {@link interval} for convenience
     * and to avoid recomputing.
     */
    readonly n: Integer;
}