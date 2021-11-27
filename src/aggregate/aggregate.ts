/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { AggregationSpec, ExtractorFn } from "./aggregate-types";
import { naturalCMP } from "../sort";
import { Merge } from "./merge";
import { Sync } from "genutils";


/**
 * Mark indicating there is no previous key value.
 */
const INIT_MARK = Symbol('MARK');
type INIT_MARK = typeof INIT_MARK;

const identity = <T, K>(item: T) => item as unknown as K;

/**
 * Coerce a field name or {@link ExtractorFn} to an {@link ExtractorFn}.
 * @param k field name or {@link ExtractorFn}
 * @returns a {@link ExtractorFn}
 */
export const extractor = <T, V>(k: keyof T | ExtractorFn<T, V>): ExtractorFn<T, V> =>
    typeof k === 'string'
        ? (item: T) => item[k] as unknown as V
        : k as ExtractorFn<T, V>;

/**
 *
 * @param spec Specification for the aggregation to be performed.
 * @returns
 */
export const aggregate = <T, R, K = T, V = T>(spec: AggregationSpec<T, R, K, V>) => {
    const { key = identity, value = identity, compare = naturalCMP, merge } = spec;
    const keyFn: ExtractorFn<T, K> = extractor(key);
    const valueFn: ExtractorFn<T, V> = extractor(value);
    return (l: Iterable<T>) => {
        function* aggregate() {
            let previousKey: K | INIT_MARK = INIT_MARK;
            let merger: Merge<K, V, R> | null = null;
            for (const i of l) {
                const currentKey = keyFn(i);
                const currentValue = valueFn(i);
                if (merger === null || previousKey === INIT_MARK) {
                    // Initial pass
                    merger =  merge(currentKey);
                    merger.add(currentValue);
                } else if (!compare(previousKey, currentKey)) {
                    merger.add(currentValue);
                } else {
                    yield* merger.value();
                    merger = merge(currentKey);
                    merger.add(currentValue);
                }
                previousKey = currentKey;
            }
            if (merger) {
                yield* merger.value();
            }
        }
        return Sync.enhance<R,void,void>(aggregate());
    };
};
