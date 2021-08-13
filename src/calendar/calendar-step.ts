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

export class CalendarStep extends CalendarPeriod {
    readonly step: Integer;
    constructor(start: Date, end: Date, step: Integer) {
        super(start, end);
        this.step = step;
    }
}

export const [isCalendarStep, toCalendarStep, asCalendarStep] = classChecks(CalendarStep);
