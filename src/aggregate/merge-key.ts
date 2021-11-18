/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * {@link Merge} operator to produce the merge key
 *
 * @module
 */

import { Merge } from './merge';

class MergeKey<K> extends Merge<K, any, K> {
    constructor(key: K) {
        super(key);
    }

    add(item: any) {
        // do nothing.
    }

    value() {
        return [this.key];
    }
}

export const mergeKey = <K>(key: K) => new MergeKey(key);
