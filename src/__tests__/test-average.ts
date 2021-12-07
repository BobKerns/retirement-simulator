/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { KernelAverage, KernelObject, smooth } from "../aggregate";
import { asInteger, Integer } from '../tagged';

interface TestObj {
    key: string;
    value: number;
}

describe('Running Average', () => {
    describe('bare', () => {
        const doit = (width: number) =>
            (...seq: any[]) =>
                smooth(new KernelAverage(asInteger(width)))(seq).asArray();
        test('empty', () =>
            expect(doit(1)()).toEqual([]));
        test('one/one', () =>
            expect(doit(1)(3)).toEqual([3]));

        test('one/two', () =>
            expect(doit(1)(3, 5)).toEqual([3, 5]));

        test('two/two', () =>
            expect(doit(2)(3, 5)).toEqual([3, 4]));

        test('two/three', () =>
            expect(doit(2)(3, 5, 5)).toEqual([3, 4, 5]));

        test('three/three', () =>
            expect(doit(3)(3, 5, 5)).toEqual([3, 11 / 3, 13/3]));
    });

    describe('embedded', () => {
        const doit = (width: number) =>
            <T extends TestObj>(...seq: T[]) =>
                smooth(new KernelObject<TestObj>(asInteger(width), 'value', (width: Integer) => new KernelAverage(width)))(seq).asArray();
        test('empty', () =>
            expect(doit(3)()).toEqual([]));


        test('list', () =>
            expect(doit(3)(
                {key: 'one', value: 10},
                {key: 'two', value: 30},
                { key: 'three', value: 20 },
                { key: 'four', value: 15 },
                { key: 'five', value: 15 },
                { key: 'six', value: 15 }
            )).toEqual([
                {key: 'one', value:  10},
                {key: 'two', value: (50 / 3)},
                {key: 'three', value: 20},
                {key: 'four', value: (65 / 3)},
                {key: 'five', value: (50 / 3)},
                {key: 'six', value: 15}
            ]));

    });
});
