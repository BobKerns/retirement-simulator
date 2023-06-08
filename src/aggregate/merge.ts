/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Merge a series of entries
 *
 * @module
 */

/**
 * {@link Merge} operator instance base class
 *
 * @type K the type of the keys partitioning the aggregated results
 * @type V the type of value extracted to be passed to the {@link MergeFn}
 * @type R the type of the aggregated results.
 */
export abstract class Merge<K, V, R> {
    readonly key: K;
    constructor(key: K) {
        this.key = key;
    }

    /**
     * Add an item to be merged.
     * @param item Item to be added
     */
    abstract add(item: V): void;

    /**
     * Obtain the merged value.
     */
    abstract value(): Iterable<R>;
}
