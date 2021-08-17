/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Calendar range, an iterable {@link CalendarPeriod}, incrementing by the supplied step size.
 *
 * The size is specified as either a {@link CalendarStep} or a {@link CalendarUnit} and count.
 *
 * @module
 */
import { Sync } from "genutils";
import { CalendarUnit } from "../enums";
import { as, asInteger, Integer, Relaxed, TagOf } from "../tagged";
import { CalendarPeriod } from "./calendar-period";
import { CalendarStep } from "./calendar-step";
import { asCalendarInterval, CalendarInterval, decodeCalendarInterval, incrementDate, isCalendarUnit, toDate } from "./calendar-utils";

/**
 * Base class for {@link @CalendarRange} before mixing in array-like enhancements.
 */
class CalendarRangeBase extends CalendarPeriod implements Iterable<CalendarStep> {
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
    constructor(start: Date, end: Date, unit: CalendarUnit, n: Integer) {
        super(start, end);
        this.interval = {[unit]: n ?? 1};
        this.unit = unit;
        this.n = n ?? 1;
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
 * A {@link CalendarRange} is a {@link CalendarPeriod} that is divided up by increments of time into
 * a series of {@link CalendarStep} segments. These segments can be iterated over in a `for` loop:
 *
 * ```typescript
 * for (const step in calendarRange) {
 *      console.log(step.start, step.end, JSON.stringify(step.length));
 * }
 * ```
 */
export class CalendarRange extends Sync.Mixin(CalendarRangeBase) {
    constructor(start: Date|string, end: Date|string, unit: CalendarUnit, n?: Integer);
    constructor(start: Date|string, end: Date|string, interval: Relaxed<CalendarInterval, TagOf<Integer>>);
    constructor(
            start: Date|string, end: Date|string,
            interval: Relaxed<CalendarInterval, TagOf<Integer>> | CalendarUnit,
            n?: Relaxed<Integer>
        ) {
        super(
            toDate(start), toDate(end),
            CalendarRange.#getUnit(interval),
            CalendarRange.#getN(interval, n)
        );
    }

    static #getUnit(interval: Relaxed<CalendarInterval, TagOf<Integer>> | CalendarUnit) {
        if (isCalendarUnit(interval)) {
            return interval;
        }
        const [unit, n] = decodeCalendarInterval(asCalendarInterval(interval));
        return unit;
    }

    static #getN(interval: Relaxed<CalendarInterval, TagOf<Integer>> | CalendarUnit, n?: Relaxed<Integer>) {
        if (isCalendarUnit(interval)) {
            return asInteger(n ?? 1);
        } else {
            const [unit, n] = decodeCalendarInterval(asCalendarInterval(interval));
            return n;
        }
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
export function calendarRange(start: Date|string, end: Date|string, unit: CalendarUnit, n?: Relaxed<Integer>): CalendarRange;
export function calendarRange(start: Date|string, end: Date|string, interval: Relaxed<CalendarInterval, TagOf<Integer>>): CalendarRange;
export function calendarRange(
        start: Date|string, end: Date|string,
        interval: Relaxed<CalendarInterval, TagOf<Integer>> | CalendarUnit,
        n?: Relaxed<Integer>
    ): CalendarRange {
    return new CalendarRange(start, end, interval as CalendarUnit, n === undefined ? undefined : asInteger(n));
}
