/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { range } from "genutils";
import { incrementDate, calendarRange, fmt_date, CalendarPeriod, parseDate, isDate, UTC, CalendarUnit } from "../calendar";

describe('Calendar', () => {
    describe('CalendarPeriod', () => {
        describe('length', () => {
            test('0', () =>
                expect(new CalendarPeriod('2021-08-04', '2021-08-04').length).toStrictEqual({totalDays: 0}));
            test('1 day', () =>
                expect(new CalendarPeriod('2021-08-04', '2021-08-05').length).toStrictEqual({day: 1, totalDays: 1}));

            test('7 day', () =>
                expect(new CalendarPeriod('2021-08-04', '2021-08-11').length).toStrictEqual({week: 1, totalDays: 7}));

            test('1 month', () =>
                expect(new CalendarPeriod('2021-12-11', '2022-01-11').length).toEqual({month: 1, totalDays: 31}));


            test('year wrap', () =>
                expect(new CalendarPeriod('2021-12-11', '2022-01-11').length).toEqual({month: 1, totalDays: 31}));

        });
    });

    describe('incrementDate', () => {
        const date = '2021-08-01'; // August 2021
        describe('day', () => {
            test('1 day', () =>
                expect(incrementDate(date, CalendarUnit.day, 1).getUTCDate()).toBe(2));
        });
        describe('week', () => {
            test('1 week', () =>
               expect(incrementDate(date, CalendarUnit.week, 1).getUTCDate()).toBe(8));
        });

        describe('month', () => {
            test('0 month', () =>
                expect(incrementDate(date, CalendarUnit.month, 0).getUTCMonth()).toBe(7));
            test('1 month', () =>
                expect(incrementDate(date, CalendarUnit.month, 1).getUTCMonth()).toBe(8));
            test('2 month', () =>
                expect(incrementDate(date, CalendarUnit.month, 2).getUTCMonth()).toBe(9));
            test('3 month', () =>
                expect(incrementDate(date, CalendarUnit.month, 3).getUTCMonth()).toBe(10));
            test('4 month', () =>
                expect(incrementDate(date, CalendarUnit.month, 4).getUTCMonth()).toBe(11));
            test('5 month', () =>
                expect(incrementDate(date, CalendarUnit.month, 5).getUTCMonth()).toBe(0));
            test('6 month', () =>
                expect(incrementDate(date, CalendarUnit.month, 6).getUTCMonth()).toBe(1));
            test('7 month', () =>
                expect(incrementDate(date, CalendarUnit.month, 7).getUTCMonth()).toBe(2));
            test('8 month', () =>
                expect(incrementDate(date, CalendarUnit.month, 8).getUTCMonth()).toBe(3));
            test('9 month', () =>
                expect(incrementDate(date, CalendarUnit.month, 9).getUTCMonth()).toBe(4));
            test('10 month', () =>
                expect(incrementDate(date, CalendarUnit.month, 10).getUTCMonth()).toBe(5));
            test('11 month', () =>
                expect(incrementDate(date, CalendarUnit.month, 11).getUTCMonth()).toBe(6));
            test('12 month', () =>
                expect(incrementDate(date, CalendarUnit.month, 12).getUTCMonth()).toBe(7));


            test('0 month day', () =>
                expect(incrementDate(date, CalendarUnit.month, 0).getUTCDate()).toBe(1));
            test('1 month day', () =>
                expect(incrementDate(date, CalendarUnit.month, 1).getUTCDate()).toBe(1));
            test('2 month day', () =>
                expect(incrementDate(date, CalendarUnit.month, 2).getUTCDate()).toBe(1));
            test('3 month day', () =>
                expect(incrementDate(date, CalendarUnit.month, 3).getUTCDate()).toBe(1));
            test('4 month day', () =>
                expect(incrementDate(date, CalendarUnit.month, 4).getUTCDate()).toBe(1));
            test('5 month day', () =>
                expect(incrementDate(date, CalendarUnit.month, 5).getUTCDate()).toBe(1));
            test('6 month day', () =>
                expect(incrementDate(date, CalendarUnit.month, 6).getUTCDate()).toBe(1));
            test('7 month day', () =>
                expect(incrementDate(date, CalendarUnit.month, 7).getUTCDate()).toBe(1));
            test('8 month day', () =>
                expect(incrementDate(date, CalendarUnit.month, 8).getUTCDate()).toBe(1));
            test('9 month day', () =>
                expect(incrementDate(date, CalendarUnit.month, 9).getUTCDate()).toBe(1));
            test('10 month day', () =>
                expect(incrementDate(date, CalendarUnit.month, 10).getUTCDate()).toBe(1));
            test('11 month day', () =>
                expect(incrementDate(date, CalendarUnit.month, 11).getUTCDate()).toBe(1));
            test('12 month day', () =>
                expect(incrementDate(date, CalendarUnit.month, 12).getUTCDate()).toBe(1));


            test('0 month->year', () =>
                expect(incrementDate(date, CalendarUnit.month, 0).getUTCFullYear()).toBe(2021));
            test('1 month->year', () =>
                expect(incrementDate(date, CalendarUnit.month, 1).getUTCFullYear()).toBe(2021));
            test('2 month->year', () =>
                expect(incrementDate(date, CalendarUnit.month, 2).getUTCFullYear()).toBe(2021));
            test('3 month->year', () =>
                expect(incrementDate(date, CalendarUnit.month, 3).getUTCFullYear()).toBe(2021));
            test('4 month->year', () =>
                expect(incrementDate(date, CalendarUnit.month, 4).getUTCFullYear()).toBe(2021));
            test('5 month->year', () =>
                expect(incrementDate(date, CalendarUnit.month, 5).getUTCFullYear()).toBe(2022));
            test('6 month->year', () =>
                expect(incrementDate(date, CalendarUnit.month, 6).getUTCFullYear()).toBe(2022));
            test('7 month->year', () =>
                expect(incrementDate(date, CalendarUnit.month, 7).getUTCFullYear()).toBe(2022));
            test('8 month->year', () =>
                expect(incrementDate(date, CalendarUnit.month, 8).getUTCFullYear()).toBe(2022));
            test('9 month->year', () =>
                expect(incrementDate(date, CalendarUnit.month, 9).getUTCFullYear()).toBe(2022));
            test('10 month->year', () =>
                expect(incrementDate(date, CalendarUnit.month, 10).getUTCFullYear()).toBe(2022));
            test('11 month->year', () =>
                expect(incrementDate(date, CalendarUnit.month, 11).getUTCFullYear()).toBe(2022));
            test('12 month->year', () =>
                expect(incrementDate(date, CalendarUnit.month, 12).getUTCFullYear()).toBe(2022));
            });
        describe('semimonthly', () => {
            test('even 1', () =>
                expect(fmt_date(incrementDate('2021-01-01', CalendarUnit.semimonthly, 2)))
                    .toEqual('2021-02-01'));
            test('even 15', () =>
                expect(fmt_date(incrementDate('2021-01-15', CalendarUnit.semimonthly, 2)))
                    .toEqual('2021-02-15'));
            test('odd 1', () =>
                expect(fmt_date(incrementDate('2021-01-01', CalendarUnit.semimonthly, 3)))
                    .toEqual('2021-02-15'));
            test('odd 15', () =>
                expect(fmt_date(incrementDate('2021-01-15', CalendarUnit.semimonthly, 3)))
                    .toEqual('2021-03-01'));

        });

    });
    describe('timeSeries', () => {
        const start = '2021-08';
        const end = '2021-09';
        test('days', () =>
            expect(calendarRange(start, end, CalendarUnit.day, 1)
                .map(d => d.start)
                .map(fmt_date).asArray())
                .toEqual(range(1, 32).map(d => `${2021}-08-${String(d).padStart(2, '0')}`).asArray()));
    });

    describe('parseDate', () => {
        test('isDate', () =>
            expect(isDate(parseDate('2021-07-04'))).toBe(true));

        test('Full', () =>
            expect(parseDate('2021-08-13')).toEqual(UTC(2021, 7, 13)));
        test('Month', () =>
            expect(parseDate('2021-08')).toEqual(UTC(2021, 7, 1)));
        test('Day', () =>
            expect(parseDate('2021')).toEqual(UTC(2021, 0, 1)));

    });
});