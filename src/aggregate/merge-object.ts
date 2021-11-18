/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Higher Order {@link Merge} operator to merge objects or tuples.
 *
 * @module
 */

import { ExtractorFn, MergeFn } from './aggregate-types';
import { keys } from '../utils';
import { Merge } from './merge';
import { extractor } from './aggregate';

export type MergeObjectSpec<
        K,
        V extends Record<keyof any, any>,
        I extends Record<keyof V, any>,
        R extends Record<keyof V, any>
    > = {
    [F in keyof V]: MergeFn<K, I[F], R[F]> | [F, MergeFn<K, I[F], R[F]>]
};

type Mergers<K, I extends Record<keyof any, any>, R extends Record<keyof I, any>> = {
    [F in keyof I]: Merge<K, I[F], R[F]>
};


type MergerFns<K, I extends Record<keyof any, any>, R extends Record<keyof I, any>> = {
    [F in keyof I]: MergeFn<K, I[F], R[F]>
};

type Extractors<V extends Record<keyof any, any>, I extends Record<keyof V, any>> = {
    [F in keyof V]: ExtractorFn<V, I[F]>
};


type Results<I extends any, R extends Record<keyof I, any>> = {
    [F in keyof I]: R[F];
};

type MergeFns<K, V extends any, R extends Record<keyof V, any>> = {[F in keyof V]: MergeFn<K, V[F], R[F]>};

export enum UnequalAction { END_ON_FIRST, END_ON_LAST, ERROR};
class MergeObject<
        K,
        V extends Record<keyof any, any>,
        I extends Record<keyof V, any>,
        R extends Record<keyof I, any>
    > extends Merge<K, V, R> {

    #mergers: Mergers<K, I, R>;
    readonly #fields: Array<keyof I>;

    readonly #extractors: Extractors<V, R>;

    readonly #onUnequal: UnequalAction;

    readonly #arrayResult: boolean;
    constructor(
        key: K,
        fields: Array<keyof V>,
        mergerfns: MergerFns<K, I, R>,
        extractors: Extractors<V, I>,
        arrayResult: boolean,
        onUnequal: UnequalAction
    ) {
        super(key);
        this.#fields = fields;
        const mergers = {} as Mergers<K, I, R>;
        for (const field of fields) {
            mergers[field] = mergerfns[field](key);
        }
        this.#mergers = mergers as Mergers<K, V, R>;
        this.#extractors = extractors;
        this.#arrayResult = arrayResult;
        this.#onUnequal = onUnequal;
    }

    add(item: V) {
        for (const field of this.#fields) {
            const merger = this.#mergers[field];
            const extractor = this.#extractors[field];
            const value = extractor(item);
            merger.add(value);
        }
    }

    value(): Iterable<R> {
        const values = {} as { [K in keyof R]: Iterator<R[K]> | undefined };
        for (const field of this.#fields) {
            const merger = this.#mergers[field];
            values[field as keyof R] = merger.value()[Symbol.iterator]();
        }

        const fields = this.#fields;
        const onUnequal = this.#onUnequal;
        const arrayResult = this.#arrayResult;
        function* valueGen(): Generator<R> {
            let active = true;
            let finishing = false;
            while (active) {
                active = false;
                let result = (arrayResult ? [] : {}) as R;
                for (const field of fields) {
                    const v = values[field]?.next();
                    if (v) {
                        if (v.done) {
                            delete values[field];
                            if (onUnequal === UnequalAction.END_ON_FIRST) return;
                            finishing = true;
                        } else {
                            active = true;
                            result[field] = v.value;
                        }
                    }
                }
                if (active) {
                    if (finishing) {
                        if (onUnequal === UnequalAction.ERROR) {
                            throw new Error('Unmatched result lengths in object aggregation merge');
                        }
                    }
                    yield result;
                }
            }
        }
        return valueGen();
    }
}

/**
 * Higher order {@link Merge} operator. This takes a specification object and an optional
 * _onUnequal_ action.
 *
 * The result is a {@link Merge} operator that performs each supplied merge in parallel,
 * and producing a result object with the results of the sub-merges indicated by the
 * specification object.
 *
 * The specification object is an object with a field for each field of the result.
 *
 * Each field value of the specification object is either a {@link MergeFn}, or a tuple of
 * \[_extractor_, {@link MergeFn}].
 *
 * If an _extractor_ is supplied, it is either a field to be extracted, or a function that takes
 * the value supplied to the parent merge and produces the value to be merged by the sub-merge.
 *
 * If the specification is an array, the result of the merge will be an array of the same size.
 */
export const mergeObject = <
        K,
        V extends Record<keyof any, any>,
        I extends Record<keyof V, any>,
        R extends Record<keyof V, any>
    >(spec: MergeObjectSpec<K, V, I, R>, onUnequal: UnequalAction = UnequalAction.ERROR) => {

    const mergerfns = {} as MergerFns<K, V, R>;
    const extractors = {} as Extractors<V, I>;
    const fields = keys<keyof V>(spec);
    for (const field of fields) {
        const fspec = spec[field];
        if (Array.isArray(fspec)) {
            const [f, m] = fspec;
            mergerfns[field] = m;
            extractors[field] = extractor(f);
        } else {
            mergerfns[field] = fspec as MergeFn<K, I[keyof V], R[keyof V]>;
            extractors[field] = extractor(field);
        }
    }
    const arrayResult = Array.isArray(spec);
    return (key: K) => new MergeObject<K, V, R, typeof spec>(
        key,
        fields,
        mergerfns,
        extractors,
        arrayResult,
        onUnequal
    );
};
