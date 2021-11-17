/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 *
 * {@link Merge} operator to merge to a list of values.
 * @module
 */

import { Merge } from "./merge";

/**
 * {@link Merge} class to merge to a list of values.
 */
class MergeList<K, V, R extends V[]> extends Merge<K, V, R> {
    readonly list: R = [] as never as R;

    override add(item: V) {
        this.list.push(item);
    }

    override value() {
        return [this.list] as Iterable<R>;
    }
}

/**
 * Merge operator to merge to a list of values.
 * @param key Key for the merged items. Ignored.
 * @returns {@link Merge} object that merges to a list of values.
 */
export const mergeList = <K, V, R extends V[]>(key: K) => new MergeList<K, V, R>(key);
