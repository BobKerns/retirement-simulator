/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import {aggregate, mergeList, rampify} from "../aggregate";

interface TestData {
    key: string,
    seq: string,
    value: number;
    other?: any;
}

describe('Ramp', () => {
    const ramp = rampify<TestData>('key', 'seq', 'value');
    const rampNoInit = ramp();
    const rampInit = ramp({ pre: 'init' });
    const rampFinal = ramp({ post: 'final' });
    const rampAll = ramp({ pre: 'init', post: 'final' });
    const firstA = { key: 'A', seq: 'first', value: 3, other: false};
    const secondA = { key: 'A', seq: 'second', value: 9, other: true};
    const initA = {...firstA, key: 'A', seq: 'init', value: 0 };
    const final1A = {...firstA, seq: 'final', value: 0 };
    const final2A = { ...secondA, seq: 'final', value: 0 };
    const firstB = { key: 'B', seq: 'first', value: 3, other: false };
    const secondB = { key: 'B', seq: 'second', value: 9, other: true };
    const initB = { ...firstB, seq: 'init', value: 0 };
    const final2B = { ...secondB, seq: 'final', value: 0 };
    test('empty', () => expect(rampNoInit([]).asArray()).toEqual([]));

    test('noInit', () => expect(rampNoInit([
            firstA
        ]).asArray())
        .toEqual([
            firstA
        ]));

    test('with init', () => expect(rampInit([
            firstA
        ]).asArray())
        .toEqual([
            initA,
            firstA
        ]));

    test('with final', () => expect(rampFinal([
            firstA
        ]).asArray())
        .toEqual([
            firstA,
            final1A
        ]));

    test('with all', () => expect(rampAll([
            firstA,
            secondA
        ]).asArray())
        .toEqual([
            initA,
            firstA,
            secondA,
            final2A
    ]));

    test('multikey', () => expect(rampAll([
            firstA,
            firstB,
            secondB,
            secondA
        ]).asArray())
        .toEqual([
            initA,
            initB,
            firstA,
            firstB,
            secondB,
            secondA,
            final2B,
            final2A
        ]));

});
