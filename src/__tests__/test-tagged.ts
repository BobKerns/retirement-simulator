/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { as, isInteger, isum, isUnit } from "../tagged";

describe('Tagged', () => {
    describe('Unit', () => {
        test('neg', () =>
            expect(isUnit(-0.5)).toBe(false));
        test('0', () =>
            expect(isUnit(0)).toBe(true));
        test('1', () =>
            expect(isUnit(1)).toBe(true));
        test('0.5', () =>
            expect(isUnit(0.5)).toBe(true));
        test('1.001', () =>
            expect(isUnit(1.001)).toBe(false));

    });
    describe('Integer', () => {
        test('0', () =>
            expect(isInteger(0)).toBe(true));
        test('1', () =>
            expect(isInteger(1)).toBe(true));
        test('0.5', () =>
            expect(isInteger(0.5)).toBe(false));


        test('isum', () =>
            expect(isum(as(3),as(5), as(8))).toBe(16));

    });
});