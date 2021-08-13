/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { range } from "genutils";
import { as, asInteger } from "../tagged";
import { incrementDate, calendarSteps, fmt_date } from "../calendar-utils";
import { CalendarPeriod } from '../calendar-period';
import { CalendarUnit } from "../enums";

describe('Calendar', () => {
    describe('CalendarPeriod', () => {
        describe('length', () => {
            test('0', () =>
                expect(new CalendarPeriod(new Date(2021, 7, 4), new Date(2021, 7, 4)).length).toStrictEqual({totalDays: 0}));
            test('1 day', () =>
                expect(new CalendarPeriod(new Date(2021, 7, 4), new Date(2021, 7, 5)).length).toStrictEqual({day: 1, totalDays: 1}));

            test('7 day', () =>
                expect(new CalendarPeriod(new Date(2021, 7, 4), new Date(2021, 7, 11)).length).toStrictEqual({week: 1, totalDays: 7}));

            test('1 month', () =>
                expect(new CalendarPeriod(new Date(2021, 12, 11), new Date(2022, 1, 11)).length).toEqual({month: 1, totalDays: 31}));


            test('year wrap', () =>
                expect(new CalendarPeriod(new Date(2021, 11, 11, 0, 0, 0, 0), new Date(2022, 0, 11, 0, 0, 0, 0)).length).toEqual({month: 1, totalDays: 31}));

        });
    });

    describe('incrementDate', () => {
        const date = new Date(2021, 7, 1); // August 2021

        test('1 day', () =>
            expect(incrementDate(date, CalendarUnit.day, as(1)).getUTCDate()).toBe(2));

        test('1 week', () =>
            expect(incrementDate(date, CalendarUnit.week, as(1)).getUTCDate()).toBe(8));

        test('0 month', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(0)).getUTCMonth()).toBe(7));
        test('1 month', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(1)).getUTCMonth()).toBe(8));
        test('2 month', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(2)).getUTCMonth()).toBe(9));
        test('3 month', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(3)).getUTCMonth()).toBe(10));
        test('4 month', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(4)).getUTCMonth()).toBe(11));
        test('5 month', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(5)).getUTCMonth()).toBe(0));
        test('6 month', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(6)).getUTCMonth()).toBe(1));
        test('7 month', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(7)).getUTCMonth()).toBe(2));
        test('8 month', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(8)).getUTCMonth()).toBe(3));
        test('9 month', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(9)).getUTCMonth()).toBe(4));
        test('10 month', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(10)).getUTCMonth()).toBe(5));
        test('11 month', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(11)).getUTCMonth()).toBe(6));
        test('12 month', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(12)).getUTCMonth()).toBe(7));


        test('0 month day', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(0)).getUTCDate()).toBe(1));
        test('1 month day', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(1)).getUTCDate()).toBe(1));
        test('2 month day', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(2)).getUTCDate()).toBe(1));
        test('3 month day', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(3)).getUTCDate()).toBe(1));
        test('4 month day', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(4)).getUTCDate()).toBe(1));
        test('5 month day', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(5)).getUTCDate()).toBe(1));
        test('6 month day', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(6)).getUTCDate()).toBe(1));
        test('7 month day', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(7)).getUTCDate()).toBe(1));
        test('8 month day', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(8)).getUTCDate()).toBe(1));
        test('9 month day', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(9)).getUTCDate()).toBe(1));
        test('10 month day', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(10)).getUTCDate()).toBe(1));
        test('11 month day', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(11)).getUTCDate()).toBe(1));
        test('12 month day', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(12)).getUTCDate()).toBe(1));


        test('0 month->year', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(0)).getUTCFullYear()).toBe(2021));
        test('1 month->year', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(1)).getUTCFullYear()).toBe(2021));
        test('2 month->year', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(2)).getUTCFullYear()).toBe(2021));
        test('3 month->year', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(3)).getUTCFullYear()).toBe(2021));
        test('4 month->year', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(4)).getUTCFullYear()).toBe(2021));
        test('5 month->year', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(5)).getUTCFullYear()).toBe(2022));
        test('6 month->year', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(6)).getUTCFullYear()).toBe(2022));
        test('7 month->year', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(7)).getUTCFullYear()).toBe(2022));
        test('8 month->year', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(8)).getUTCFullYear()).toBe(2022));
        test('9 month->year', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(9)).getUTCFullYear()).toBe(2022));
        test('10 month->year', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(10)).getUTCFullYear()).toBe(2022));
        test('11 month->year', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(11)).getUTCFullYear()).toBe(2022));
        test('12 month->year', () =>
            expect(incrementDate(date, CalendarUnit.month, asInteger(12)).getUTCFullYear()).toBe(2022));

    });
    describe('timeSeries', () => {
        const start = new Date(2021, 7);
        const end = new Date(2021, 8);
        test('days', () =>
            expect(calendarSteps(start, end, CalendarUnit.day, as(1))
                .map(d => d.date)
                .map(fmt_date).asArray())
                .toEqual([...range(1, 32).map(d => `${2021}-08-${String(d).padStart(2, '0')}`), '2021-09-01']));
    });
});