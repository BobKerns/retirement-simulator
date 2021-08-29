/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Name } from "../types";
import { indexByName, uniq } from "../utils";
import { makeSort } from '../sort';

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

    const tc = (name: Name, rest: any = {}) => ({...rest, name, type: 'text'});
    test('indexByName', () =>
        expect(indexByName([tc('x', {v: 5}), tc('y', {v: 8})]))
            .toEqual({x: tc('x', {v: 5}), y: tc('y', {v: 8})}));

});