/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 *
 *
 *
 * @module
 */

import { SortFn } from "../types";
import type { Merge } from './merge';

/**
 * For aggregation, k
 */
export type MergeFn<K, V, R> = (key: K) => Merge<K, V, R>;
/**
 * Aggregation types
 *
 * @module
 */

export type ExtractorFn<T, K> = (item: T) => K;

/**
 * Specification for the aggregation to be performed.
 * @type T the type being aggregatred over.
 * @type R the type of the aggregated results.
 * @type K the type of the keys partitioning the aggregated results
 * @type V the type of value extracted to be passed to the {@link MergeFn}
 */
export interface AggregationSpec<T, R, K, V> {
    /**
     * Function to extract the aggregation key, or the name of a field. Defaults to the identity function.
     */
    key?: keyof T | ExtractorFn<T, K>;
    /**
     * Comparision function for the keys. Defaults to {@link naturalCMP}.
     */
    compare?: SortFn<K>;
    /**
     * Extract the values to be merged (passed to the {@link Merge} object). Defaults to
     * the identity function.
     */
    value?: keyof T | ExtractorFn<T, V>;
    /**
     * The merge function. Accepts the current merge key, and returs a {@link Merge} object
     */
    merge: MergeFn<K, V, R>;
}