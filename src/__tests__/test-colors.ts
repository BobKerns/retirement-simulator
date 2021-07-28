/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { asHSV, HSV, hsv, rgb } from "../color";

const round = (c: HSV) => asHSV({
    h: Math.round(c.h * 100) / 100,
    s: Math.round(c.s * 100) / 100,
    v: Math.round(c.v * 100) / 100
});

describe('Colors', () => {

    describe('rgb', () => {
        test('black', () =>
            expect(rgb("#000000")).toEqual({r: 0, g: 0, b: 0}));

        test('gray', () =>
            expect(rgb("#808080")).toEqual({r: 128, g: 128, b: 128}));

        test('white', () =>
            expect(rgb("#ffffff")).toEqual({r: 255, g: 255, b: 255}));
    });

    describe('hsv', () => {

        test('black', () =>
            expect(hsv("#000000")).toEqual({h: 0, s: 0, v: 0}));

        test('gray', () =>
            expect(round(hsv("#808080"))).toEqual({h: 0, s: 0, v: 0.5}));

        test('red', () =>
            expect(hsv("#ff0000")).toEqual({h: 0, s: 1, v: 1}));

        test('green', () =>
            expect(hsv("#00ff00")).toEqual({h: 120, s: 1, v: 1}));

        test('blue', () =>
            expect(hsv("#0000ff")).toEqual({h: 240, s: 1, v: 1}));

        test('pale red', () =>
            expect(round(hsv("#ff8080"))).toEqual({h: 0, s: 0.5, v: 1}));

        test('pale green', () =>
            expect(round(hsv("#80ff80"))).toEqual({h: 120, s: 0.5, v: 1}));

        test('pale blue', () =>
            expect(round(hsv("#8080ff"))).toEqual({h: 240, s: 0.5, v: 1}));

        test('dark red', () =>
            expect(round(hsv("#800000"))).toEqual({h: 0, s: 1, v: 0.5}));

        test('dark green', () =>
            expect(round(hsv("#008000"))).toEqual({h: 120, s: 1, v: 0.5}));

        test('dark blue', () =>
            expect(round(hsv("#000080"))).toEqual({h: 240, s: 1, v: 0.5}));

        test('white', () =>
            expect(hsv("#ffffff")).toEqual({h: 0, s: 0, v: 1}));

    });
});