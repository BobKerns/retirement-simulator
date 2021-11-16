/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { SortFn } from "./types";


/**
 * For aggregation, k
 */
export type Merger<T, R> = () => Generator<R | undefined, void, T | AGGREGATION_MARK>;
/**
 * Aggregation reoutines
 *
 * @module
 */

export const AGGREGATION_MARK = Symbol('MARK');
export type AGGREGATION_MARK = typeof AGGREGATION_MARK;

export const aggregate = <T, R>(cmp: SortFn<T>, merge: Merger<T, R>) => (l: Iterable<T>) => {
    function* aggregate() {
        let previous: T | null = null;
        let merger: Generator<R | undefined, void, T | AGGREGATION_MARK> | null = null;
        for (const i of l) {
            if (merger == null) {
                merger =  merge();
                merger.next(i);
            } else if (!cmp(previous!, i)) {
                merger.next(i);
            } else {
                const v = merger.next(AGGREGATION_MARK);
                if (v.done) return;
                yield v.value;
                merger.return();
                merger = merge();
                merger.next(i);
            }
            previous = i;
        }
        if (merger) {
            const v = merger.next(AGGREGATION_MARK);
            if (v.done) return;
            yield v.value;
        }
    }
    return aggregate();
};

export function* mergeList<T>(): Generator<T[] | undefined, void, T | AGGREGATION_MARK> {
    const list: T[] = [];
    while (true) {
        const i: T | AGGREGATION_MARK  = yield;
        if (i === AGGREGATION_MARK) {
            yield list;
            return;
        } else {
            list.push(i);
        }
    }
}

export const mergeSum = <T extends number>(field: string) => {
    function *mergeSum(): Generator<T | undefined, void, T | AGGREGATION_MARK> {
        let v = 0;
        while (true) {
            const i: T | AGGREGATION_MARK = yield;
            if (i === AGGREGATION_MARK) {
                yield v as T;
                return;
            } else {
                v += (i as any)[field] as number;
            }
        }
    }
    return mergeSum;
}
