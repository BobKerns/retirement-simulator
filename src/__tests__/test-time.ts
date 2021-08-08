/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { range } from "genutils";
import { fmt_date } from "..";
import { as, asInteger } from "../tagged";
import { incrementDate, TimePeriod, timeSteps, TimeUnit } from "../time";

describe('Time', () => {
    describe('TimePeriod', () => {
        describe('length', () => {
            test('0', () =>
                expect(new TimePeriod(new Date(2021, 7, 4), new Date(2021, 7, 4)).length).toStrictEqual({totalDays: 0}));
            test('1 day', () =>
                expect(new TimePeriod(new Date(2021, 7, 4), new Date(2021, 7, 5)).length).toStrictEqual({day: 1, totalDays: 1}));

            test('7 day', () =>
                expect(new TimePeriod(new Date(2021, 7, 4), new Date(2021, 7, 11)).length).toStrictEqual({week: 1, totalDays: 7}));
        });
    });

    describe('incrementDate', () => {
        const date = new Date(2021, 7); // August 2021

        test('1 day', () =>
            expect(incrementDate(date, TimeUnit.day, as(1)).getUTCDate()).toBe(2));

        test('1 week', () =>
            expect(incrementDate(date, TimeUnit.week, as(1)).getUTCDate()).toBe(8));

        test('0 month', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(0)).getUTCMonth()).toBe(7));
        test('1 month', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(1)).getUTCMonth()).toBe(8));
        test('2 month', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(2)).getUTCMonth()).toBe(9));
        test('3 month', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(3)).getUTCMonth()).toBe(10));
        test('4 month', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(4)).getUTCMonth()).toBe(11));
        test('5 month', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(5)).getUTCMonth()).toBe(0));
        test('6 month', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(6)).getUTCMonth()).toBe(1));
        test('7 month', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(7)).getUTCMonth()).toBe(2));
        test('8 month', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(8)).getUTCMonth()).toBe(3));
        test('9 month', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(9)).getUTCMonth()).toBe(4));
        test('10 month', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(10)).getUTCMonth()).toBe(5));
        test('11 month', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(11)).getUTCMonth()).toBe(6));
        test('12 month', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(12)).getUTCMonth()).toBe(7));


        test('0 month->year', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(0)).getUTCFullYear()).toBe(2021));
        test('1 month->year', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(1)).getUTCFullYear()).toBe(2021));
        test('2 month->year', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(2)).getUTCFullYear()).toBe(2021));
        test('3 month->year', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(3)).getUTCFullYear()).toBe(2021));
        test('4 month->year', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(4)).getUTCFullYear()).toBe(2021));
        test('5 month->year', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(5)).getUTCFullYear()).toBe(2022));
        test('6 month->year', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(6)).getUTCFullYear()).toBe(2022));
        test('7 month->year', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(7)).getUTCFullYear()).toBe(2022));
        test('8 month->year', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(8)).getUTCFullYear()).toBe(2022));
        test('9 month->year', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(9)).getUTCFullYear()).toBe(2022));
        test('10 month->year', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(10)).getUTCFullYear()).toBe(2022));
        test('11 month->year', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(11)).getUTCFullYear()).toBe(2022));
        test('12 month->year', () =>
            expect(incrementDate(date, TimeUnit.month, asInteger(12)).getUTCFullYear()).toBe(2022));
    });
    describe('timeSeries', () => {
        const start = new Date(2021, 7);
        const end = new Date(2021, 8);
        test('days', () =>
            expect(timeSteps(start, end, TimeUnit.day, as(1))
                .map(d => d.date)
                .map(fmt_date).asArray())
                .toEqual([...range(1, 32).map(d => `${2021}-08-${String(d).padStart(2, '0')}`), '2021-09-01']));
    });
});