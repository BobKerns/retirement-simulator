/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * {@link Merge} operator to merge to a sum of numbers.
 *
 * @module
 */

import { Merge } from "./merge";

/**
 * Merge class to merge to a sum of numbers.
 */
class MergeSum<K, V extends number, R extends V> extends Merge<K, V, R> {
    #value: number = 0;
    constructor(key: K) {
        super(key);
        this.#value
    }

    override add(item: V) {
        this.#value += item;
    }

    override value() {
        return [this.#value] as Iterable<R>;
    }
}

/**
 * {@link Merge} operator to sum a set of numbers.
 * @param key The merge key. Ignored
 * @returns the sum of the numbers supplied
 */
export const mergeSum = <K, V extends number, R extends V>(key: K) => new MergeSum<K, V, R>(key);
