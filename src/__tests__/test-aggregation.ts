/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { aggregate, mergeList } from "../aggregate";

describe('Aggregation basics', () => {
    test('Empty list', () => expect(aggregate<any, any>({
        merge: mergeList
    })(
        [
        ]
    ).asArray()).toEqual([
    ]));

    test('simple list', () => expect(aggregate<any, any>({
        merge: mergeList
    })(
        [
            1
        ]
    ).asArray()).toEqual([
        [1]
    ]));
});
