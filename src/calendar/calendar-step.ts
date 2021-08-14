/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Integer } from "../tagged";
import { classChecks } from "../utils";
import { CalendarPeriod } from "./calendar-period";

/**
 * One step of a {@link CalendarRange}. Includes a step number.
 *
 * @module
 */

/**
 * A {@link CalendarStep} is a {@link CalendarPeriod} augmented with a {@link CalendarStep.step | step} number.
 */
export class CalendarStep extends CalendarPeriod {
    /**
     * The step number in the iteration.
     */
    readonly step: Integer;
    /**
     *
     * @param start The start `Date` of the time period
     * @param end The end `Date` of the time period
     * @param step The iteration counter value.
     */
    constructor(start: Date|string, end: Date|string, step: Integer) {
        super(start, end);
        this.step = step;
    }
}

export const [isCalendarStep, toCalendarStep, asCalendarStep] = classChecks(CalendarStep);
