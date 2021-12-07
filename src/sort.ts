/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Sorting routines
 *
 * @module Sort
 */

import { IItem, Named, SortFn } from "./types";

export const comparator = Symbol.for('compare');

/**
 * A comparator that sorts according to the "natural" order. First by type, then by string or numerical
 * ordering if a string, number, boolean, or symbol.
 */
export const naturalCMP = <T>(a: T, b: T): -1 | 0 | 1 => {
    const typea = typeof a;
    const typeb = typeof b;
    if (typea < typeb) return -1;
    if (typeb < typea) return 1;
    switch (typea) {
        case 'number':
        case 'string':
        case 'boolean':
            if (a < b) return -1;
            if (a > b) return 1;
            break;
        case 'symbol':
            return naturalCMP((a as unknown as Symbol).description, (b as unknown as Symbol).description)
        case 'object':
            if (!a && b) return -1;
            if (!b && a) return 1;
            if (b === a) return 0;
            if (a instanceof Date && b instanceof Date) {
                return naturalCMP(a.getTime(), b.getTime());
            }
            const aCnst = (a as Object).constructor;
            const bCnst = (b as Object).constructor;
            if (aCnst === bCnst) {
                const cmp = (aCnst as any)[comparator] ?? nullCMP as SortFn<T>;
                return cmp(a, b);
            }
            return naturalCMP(aCnst.name, bCnst.name)
    }
    return 0;
}

/**
 * A comparator that does not alter the sort order. It regards everything as equal, and thus Javascript's
 * stable sort leaves the ordering unchanged.
 * @param a
 * @param b
 * @returns 0
 */
export const nullCMP = <T>(a: T, b: T): -1 | 0 | 1 => 0;

/**
 * Compose multiple sort functions into one.
 * @param fn The first sort function
 * @param fns Additional sort functions to compose, if the previous return 0 for equality.
 * @returns
 */
export const composeSorts = <T>(fn: SortFn<T>, ...fns: Array<SortFn<T>>): SortFn<T> => {
    if (fns.length === 0) return fn;
    const rest = composeSorts(fns[0], ...fns.slice(1));
    return (a: T, b: T) => {
        const v = fn(a, b);
        return v === 0 ? rest(a, b) : v;
    };
};

export const sortBy = <T extends string | number | symbol, V extends {[K in T]: any}>(field: T): SortFn<V> =>
    (a: V, b: V) => naturalCMP(a[field], b[field]);

const byValue = sortBy('value');

const byRate = sortBy('rate');

const byName =  sortBy('name');

const byType =  sortBy('type');

const byStart = sortBy('start');

const byDate = sortBy('date');

const bySort = sortBy('sort');

/**
 * Invert the direction of sorting of a sort comparator function.
 * @param fn A sort comparator function
 * @returns A sort comparator function that sorts in the opposite direction
 */
export const invertSort = <T>(fn: SortFn<T>): SortFn<T> => (a: T, b: T) => fn(b, a);

/**
 * Collection of sort comparator functions.
 */
export const Sort = {
    byValue: composeSorts<any>(invertSort(byValue), byType, byName),
    byRate: composeSorts<any>(invertSort(byRate), byType, byName),
    byName: composeSorts<Named>(byName, byType),
    byType: composeSorts<Named>(byType, byName),
    byStart: composeSorts<any>(byStart, byType, byName),
    bySort: composeSorts<IItem>(bySort, byType, byName),
    byDate: composeSorts<any>(byDate, bySort, byType, byName),
    null: nullCMP,
    natural: naturalCMP
};

/**
 * A higher-order function that returs a sort function.
 * @param cmp a comparator
 * @returns a sort function that sorts a list according to _cmp_
 * @param list
 * @returns a copy of _list_ in sorted order.
 */
export const makeSort = <T>(cmp: SortFn<T> = naturalCMP) => <I extends T>(l: Iterable<I>) => [...l].sort(cmp);

/**
 * A function that sorts according to natural order. See {@link naturalCMP}.
 * @param list
 * @returns a copy of _list_ in sorted order.
 */
export const naturalSort = makeSort();
