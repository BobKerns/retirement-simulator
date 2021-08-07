/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { indexByName, makeSort, uniq } from "../utils";

describe("Utils", () => {
    test('uniq', () =>
        expect(uniq(['a', 'c', 'a', 'c', 'd'])).toEqual(['a', 'c', 'd']));

    test('Natural sort', () =>
        expect(makeSort()(['c', 'b', [77], {}, [88], 32])).toEqual([32, [77], [88], {}, 'b', 'c']));

    const array = ['a', 'b', 'c'];
    test('Sort copies', () =>
        expect(makeSort()(array)).not.toBe(array));

    test('Sort copies equal', () =>
        expect(makeSort()(array)).toEqual(array));

    test('indexByName', () =>
        expect(indexByName([{name: 'x', v: 5}, {name: 'y', v: 8}])).toEqual({x: {name: 'x', v: 5}, y: {name: 'y', v: 8}}));

});