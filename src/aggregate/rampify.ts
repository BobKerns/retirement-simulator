/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Take a series of keyed values and produce a series with zeros before and after.
 *
 * @module
 */

import { Sync } from 'genutils';
import { comparator } from 'ramda';
import { extractor } from '.';
import { naturalCMP } from '../sort';
import { SortFn } from '../types';
import { KeyFn, ValueFn } from './aggregate-types';
import { Merge } from './merge';

export type RampifyKeys<SEQ> = {
    pre?: SEQ,
    post?: SEQ,
    cmp?: SortFn<SEQ>
};

export const rampify = <
        T extends object,
        TK extends keyof T = keyof T,
        VK extends keyof T = keyof T,
        SK extends keyof T = keyof T,
        KEY extends T[TK] & keyof any= T[TK] & keyof any,
        SEQ extends T[SK] = T[SK]
    >(
         keyField: TK | KeyFn<T, KEY>,
         seqField: SK,
         valueField: VK
    ) => {
        const keyFn = extractor(keyField);
        return ({pre, post, cmp = naturalCMP}: RampifyKeys<SEQ> = {}) => {
            return (list: Iterable<T>) => {
                function* rampify(): Generator<T, void, T> {
                    let previous: { [k in KEY]?: T } = {};
                    let current: { [k in KEY]?: T } = {};
                    let previousSeq: SEQ | undefined;
                    // Start off as if processing our given pre-sequence ID, if any.
                    let currentSeq: SEQ | undefined = pre;
                    for (const v of list) {
                        const key = keyFn(v);
                        const seq = v[seqField] as SEQ;
                        // is this the same sequence ID we've been processing, or our first time?
                        if (currentSeq === undefined || cmp(seq, currentSeq) !== 0) {
                            // new sequence ID.
                            // Send out the ones we've seen for our current key
                            for (const tkey in current) {
                                yield current[tkey]!;
                            }
                            // Current becomes previous
                            previous = current;
                            previousSeq = currentSeq;
                            // Current starts anew
                            current = {};
                            currentSeq = seq;
                        }
                        //  If this key hasn't been seen previously for this sequence ID,
                        // emit a 0-value now
                        if (previousSeq !== undefined && previous[key] === undefined) {
                            yield { ...v, [seqField]: previousSeq, [valueField]: 0 };
                        }
                        // And remember this, to emit when the key changes or we reach the end.
                        current[key] = v;
                    }
                    // Emit the ones from the last sequence ID
                    for (const key in current) {
                        yield current[key]!;
                    }
                    // If we've been given a post sequence ID
                    if (post !== undefined) {
                        for (const key in current) {
                            const v = current[key]!;
                            yield{ ...v, [seqField]: post, [valueField]: 0 };
                        }
                    }
                }
                return Sync.enhance(rampify());
            };
    };
};

export class MergeRamp<K, V, KK extends keyof V, VK extends keyof V> extends Merge<K, V, V> {
    /**
     * The actual key being ramped over. The aggregation key is typically a constant.
     * Should return a string, number, or Symbol.
     */
    #keyFn: KeyFn<V, KK>;
    #valueField: VK;
    #valueFn: ValueFn<V, V[VK]>;


    constructor(key: K, keyFn: KeyFn<V, KK>, valueField: VK, valueFn?: ValueFn<V, V[VK]>) {
        super(key);
        this.#keyFn = keyFn;
        this.#valueField = valueField;
        this.#valueFn = valueFn ?? extractor(valueField);
    }

    add(item: V) {
        const key = this.#keyFn(item);
        const value = this.#valueFn(item);
    }

    value(): V[] {
        return [];
    }
}

export const mergeRamp = <
        T extends any,
        KT extends keyof T,
        KV extends keyof T
    >(keyFn: KeyFn<T, KT>, valueField: KV, valueFn: ValueFn<T, T[KV]>) =>
        (key: keyof any) => new MergeRamp(key, keyFn, valueField, valueFn);
