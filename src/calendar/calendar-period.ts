/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * A period of time, with a {@link CalendarPeriod.start | start},
 * {@link CalendarPeriod.end | end}, and {@link CalendarPeriod.length | length}
 * @module
 */


import { CalendarUnit } from "../enums";
import { as, floor, Integer } from "../tagged";
import { classChecks } from "../utils";
import { truncateDate } from "./calendar-fns";
import { asDate, isLeapYear, CalendarLength, MONTH_LEMGTH, incrementDate, fmt_date, isCalendarUnit, CalendarInterval, isCalendarInterval, decodeCalendarInterval } from "./calendar-utils";

const trunc = truncateDate(CalendarUnit.day);
/**
 * A defined period of time between a {@link CalendarPeriod.start} date and a {@link CalendarPeriod.end} date.
 */
export class CalendarPeriod {
    /**
     * The starting date of the period.
     */
    readonly start: Date;
    /**
     * The end date of the period, exclusive.
     */
    readonly end: Date;

    constructor(start: Date, end: Date);
    constructor(start: Date, interval: CalendarInterval);
    constructor(start: Date, interval: CalendarUnit, n?: Integer);
    constructor(start: Date, endOrInterval: Date | CalendarUnit | CalendarInterval, n?: Integer) {
        this.start = trunc(asDate(start));
        if (isCalendarUnit(endOrInterval)) {
            this.end = incrementDate(start, endOrInterval, n ?? as(1));
        } else if (isCalendarInterval(endOrInterval)) {
            const [unit, n] = decodeCalendarInterval(endOrInterval);
            this.end = incrementDate(start, unit, n);
        } else {
            this.end = trunc(asDate(endOrInterval));
        }
    }

    /**
     * Get the length of this {@link CalendarPeriod} as a {@link CalendarLength}.
     */
    get length(): CalendarLength {
        const years = this.end.getUTCFullYear() - this.start.getUTCFullYear();
        const months = this.end.getUTCMonth() - this.start.getUTCMonth();
        const days = this.end.getUTCDate() - this.start.getUTCDate();
        const isLeap = isLeapYear(this.end);
        const [imonths, idays] = days < 0
            ? [months - 1, days + MONTH_LEMGTH[isLeap ? 1 : 0][this.end.getUTCMonth()]]
            : [months, days];
        const [kyears, kmonths] = imonths < 0
            ? [years - 1, imonths + 12]
            : [years, imonths];
        const iweeks = floor(days / 7);
        const fdays = idays - iweeks * 7;
        return {
            ...(kyears && { year: as(kyears) }),
            ...(kmonths && { month: as(kmonths) }),
            ...(iweeks && { week: iweeks }),
            ...(fdays && { day: as(fdays) }),
            totalDays: floor((this.end.getTime() - this.start.getTime()) / (24 * 60 * 60 * 1000))
        };

    }

    toString() {
        return `${fmt_date(this.start)} to ${fmt_date(this.end)}`;
    }
}

export const [isCalendarPeriod, toCalendarPeriod, asCalendarPeriod] = classChecks(CalendarPeriod);