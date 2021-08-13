/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Calendar range, an iterable {@link CalendarPeriod}, incrementing by the supplied step size.
 *
 * The size is specified as either a {@link CalenderStep} or a {@link CalendarUnit} and count.
 *
 * @module
 */
import { Sync } from "genutils/lib/esm/sync";
import { CalendarUnit } from "../enums";
import { as, Integer } from "../tagged";
import { CalendarPeriod } from "./calendar-period";
import { CalendarStep } from "./calendar-step";
import { CalendarInterval, CalendarLength, decodeCalendarInterval, incrementDate, isCalendarInterval, isCalendarUnit } from "./calendar-utils";

/**
 * A {@link CalendarRange} is a {@link CalendarPeriod} that is divided up by increments of time into
 * a series of {@link CalendarStep} segments. These segments can be iterated over in a `for` loop:
 *
 * ```typescript
 * for (const step in calendarRange) {
 *      console.log(step.start, step.end, JSON.stringify(step.length));
 * }
 * ```
 */
export class CalendarRange extends CalendarPeriod implements Iterable<CalendarStep> {
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

    /**
     * Construct a {@link CalendarRange}.
     * @param start The start `Date`.
     * @param end The end `Date`.
     * @param unit The units of increment.
     * @param n The number of units.
     */
    constructor(start: Date, end: Date, unit: CalendarUnit, n?: Integer);
    constructor(start: Date, end: Date, interval: CalendarLength);
    constructor(start: Date, end: Date, interval: CalendarLength | CalendarUnit, n?: Integer) {
        super(start, end);
        if (isCalendarInterval(interval)) {
            this.interval = interval;
            const [unit, n] = decodeCalendarInterval(interval);
            this.unit = unit;
            this.n = n;
        } else if (isCalendarUnit(interval)) {
            this.interval = {[interval]: n ?? as(1)};
            this.unit = interval;
            this.n = n ?? as(1);
        } else {
            throw new Error(`${JSON.stringify(interval)} is not a CalendarStep or CalenderUnit`);
        }
    }

    /**
     * Iterate over the range by the increment. Returns an enhanced iterator that allows many array-like
     * operations such as `map` and `filter`.
     */
    [Symbol.iterator]() {
        const t = this;
        function *CalendarIterator() {
            let current = t.start;
            let i: Integer = as(0);
            while (current < t.end) {
                const next = incrementDate(current, t.unit, t.n)
                yield new CalendarStep(current, next, i);
                current = next;
                i++;
            }
        }
        return Sync.enhance(CalendarIterator());
    }
}

/**
 * Construct a {@link CalendarRange}.
 *
 * A {@link CalendarRange} is a {@link CalendarPeriod} that is divided up by increments of time into
 * a series of {@link CalendarStep} segments. These segments can be iterated over in a `for` loop:
 *
 * ```typescript
 * for (const step in calendarRange) {
 *      console.log(step.start, step.end, JSON.stringify(step.length));
 * }
 * ```
 * @param start The start `Date`.
 * @param end The end `Date`.
 * @param unit The units of increment.
 * @param n The number of units.
 */
export function calendarRange(start: Date, end: Date, unit: CalendarUnit, n?: Integer): CalendarRange;
export function calendarRange(start: Date, end: Date, interval: CalendarLength): CalendarRange;
export function calendarRange(start: Date, end: Date, interval: CalendarLength | CalendarUnit, n?: Integer) {
    return new CalendarRange(start, end, interval as CalendarUnit, n);
}
