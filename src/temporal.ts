/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */
/*
 * A utility container that allows looking up items by date.
 *
 * @module
 */


import { TemporalItem, Type } from "./types";
import { makeSort } from "./utils";

const numericalCmp = (a: number, b: number) =>
    a < b
        ? -1
        : a === b
            ? 0
            : 1;

export const temporalCmp = <T extends Type>(a: TemporalItem<T>, b: TemporalItem<T>) =>
    numericalCmp(a.start?.valueOf() ?? 0, b.start?.valueOf() ?? 0);

export const temporalSort = makeSort<TemporalItem<Type>>(temporalCmp);

/**
 * An immutable, temporally-sorted-and-indexed collection of {@link TemporalItem} instances.
 *
 * Supports the methods on `Array` that make sense for an immutable object. Note that rather than integers, the
 * indexes are uniformly `Date` objects.
 */
export class Temporal<T extends TemporalItem<Type>> {
    readonly items: readonly T[];
    constructor(items: T[]) {
        this.items = Object.freeze(temporalSort(items));
    }

    onDate(date: Date): T | undefined {
        const v = date.valueOf();
        if (this.items.length === 0) return undefined;
        const nextIdx = this.items.findIndex(i => i.start.valueOf() > v);
        if (nextIdx === -1) {
            const next = this.items[this.items.length - 1];
            if (next.end) return undefined;
            return next;
        }
        const current = this.items[nextIdx - 1];
        if (current?.end) return undefined;
        return current;
    }

    get first() { return this.items[0]; }
    get last() { return this.items[this.items.length - 1]; }

    map<V, This = undefined>(fn: (this: This, i: T, idx: Date, temporal: this) => V, thisArg: This): V[] {
        return this.items.map(i => fn.call(thisArg!, i, i.start, this));
    }

    forEach<V, This = undefined>(fn: (this: This, i: T, idx: Date, temporal: this) => V, thisArg?: This): void {
        return this.items.forEach(i => fn.call(thisArg!, i, i.start, this));
    }

    reduce<This = undefined>(callbackfn: (this: This, previousValue: T, currentValue: T, currentIndex: Date, array: this) => T, thisArg?: This): T;
    reduce<This = undefined>(callbackfn: (this: This, previousValue: T, currentValue: T, currentIndex: Date, array: this) => T, initialValue: T, thisArg?: This): T;
    reduce<U, This = undefined>(callbackfn: (this: This, previousValue: U, currentValue: T, currentIndex: Date, array: this) => U, initialValue: U, thisArg?: This): U;
    reduce<U, This = undefined>(callbackfn: (this: This, previousValue: U|T, currentValue: T, currentIndex: Date, array: this) => U|T, initialValue?: U|T, thisArg?: This): U|T {
        return this.items.reduce((a, i) => callbackfn.call(thisArg!, a!, i, i.start, this), initialValue)!;
    }

    reduceRight<This = undefined>(callbackfn: (this: This, previousValue: T, currentValue: T, currentIndex: Date, array: this) => T, thisArg?: This): T;
    reduceRight<This = undefined>(callbackfn: (this: This, previousValue: T, currentValue: T, currentIndex: Date, array: this) => T, initialValue: T, thisArg?: This): T;
    reduceRight<U, This = undefined>(callbackfn: (this: This, previousValue: U, currentValue: T, currentIndex: Date, array: this) => U, initialValue: U, thisArg?: This): U;
    reduceRight<U, This = undefined>(callbackfn: (this: This, previousValue: U|T, currentValue: T, currentIndex: Date, array: this) => U|T, initialValue?: U|T, thisArg?: This): U|T {
        return this.items.reduceRight((a, i) => callbackfn.call(thisArg!, a!, i, i.start, this), initialValue)!;
    }

    flatMap<U, This = undefined>(
        callback: (this: This, value: T, index: Date, array: this) => U | ReadonlyArray<U>,
        thisArg?: This
    ): U[]{
        return this.items.flatMap(v => callback.call(thisArg!, v, v.start, this), thisArg)
    }

    find<This = undefined>(
        callback: (this: This, value: T, index: Date, array: this) => boolean,
        thisArg?: This
    ) {
        return this.items.find(v => callback.call(thisArg!, v, v.start, this));
    }

    entries() {
        const t = this;
        function* keys() {
            for (let i = 0; i < t.items.length; i++) {
                const item = t.items[i];
                yield [item.start, item];
            }
        }
    }

    values() {
        return this.items.values();
    }

    keys() {
        const t = this;
        function* keys() {
            for (let i = 0; i < t.items.length; i++) {
                yield t.items[i].start;
            }
        }
        return keys();
    }

    slice(start?: Date, end?: Date) {
        const startTime = start?.valueOf();
        const endTime = end?.valueOf();
        const inRange = (i: T) => {
            const istart = i.start.valueOf();
            return (!startTime || istart >= startTime) && (!endTime || istart < endTime);
        }
        const subset = this.items.filter(inRange)
        return new Temporal(subset);
    }

    get length() {
        return this.items.length;
    }

    [Symbol.iterator]() {
        return this.items[Symbol.iterator]();
    }
}