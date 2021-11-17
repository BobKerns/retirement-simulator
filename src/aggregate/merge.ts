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
