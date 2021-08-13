/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * General utilities, without runtime dependencies on other parts of the system.
 *
 * @module
 */



import {default as HeapIn} from 'heap';
import {Sync} from 'genutils';
import type { MonetaryType, IMonetaryItem, Named, NamedIndex, SortFn, Type, IBalanceItem, BalanceType, RowType, IMonetary } from './types';

export const Heap = HeapIn;

/**
 * Function that throws its argument.
 * @param s a string or an `Error`.
 */
export const Throw = (s: string | Error) => {
    if (s instanceof Error) {
        throw s;
    }
  throw new Error(s);
}

/**
 * Throws with a message that something is not yet implemented.
 * @internal
 * @param s
 * @returns
 */
export const nyi = (s?: string) =>
    Throw(s ? `Not yet implemented: ${s}` : `Not yet implemented.`);

/**
 * Given a `Heap`, give a generator to the (sorted) values in the heap.
 * @param heap
 * @returns
 */
export const heapgen = <T>(heap: Heap<T>) => {
  function* heapgen(heap: Heap<T>) {
    while (heap.size() > 0) {
      yield heap.pop();
    }
  }
  return Sync.enhance(heapgen(heap));
}

/**
 * Produce an index to a list of {@link Named objects.
 * @param list A list of {@link Named} objects
 * @returns An index of the objects by name.
 */
export const indexByName = <T extends Named>(list: Array<T>) =>
  list.reduce((acc: NamedIndex<T>, item) => ((acc[item.name] = item), acc), {});

/**
 * Collection of sort functions.
 */
export const Sort = {
    byValue: <T extends MonetaryType, I extends IMonetaryItem<T> = IMonetaryItem<T>>(a: I, b: I) => (a.value < b.value ? 1 : a.value === b.value ? 0 : -1),
    byRate: <T extends BalanceType, I extends IBalanceItem<T> = IBalanceItem<T>>(a: I, b: I) => (a.rate < b.rate ? 1 : a.rate === b.rate ? 0 : -1)
};

/**
 * Format a row of values in a Markdown table.
 *
 * @param args Array of values for the cells in the row
 * @returns a markdown-formatted string
 */
export const row = (...args: any[]) => `|${["", ...args, ""].join("|")}|`;

/**
 * Format a number as US currency.
 *
 * @param d Format a number as US currency
 * @param frac 0 or 2 (default = 2) positions for cents
 * @returns
 */
export const fmt_usd = (d: number, frac = 2 | 0) =>
  d.toLocaleString("en", {
    minimumFractionDigits: frac,
    maximumFractionDigits: frac,
    currency: "USD",
    style: "currency"
  });

/**
 * Assert that the call in the argument cannot return.
 * @param x
 * @param msg
 * @returns
 */
export const assertNever = (x: never, msg: string = `Unexpected ${x}`): never => Throw(msg);

/**
 * Check that the supplied {@link Row} is of the specified {@link Type}
 * @param row The {@link Row} to check
 * @param type the {@link Type} the row should be.
 * @returns
 */
export const checkRow = <T extends Type>(row: RowType, type: T): row is RowType<T> => row.type === type;

/**
 * Check that the supplied {@link Row} is of the desired {@link Type}, returning it as that type,
 * or throwing an exception if it is not.
 * @param row The {@link Row} to check
 * @param type
 * @returns
 */
export const assertRow = <T extends Type>(row: RowType, type: T): RowType<T> =>
    checkRow(row, type) ? row : Throw(`Row not of type ${type}.`);

/**
 * Freeze an object and all its object descendants.
 * @internal
 * @param obj The object to be deep-frozen.
 * @returns
 */
export const deepFreeze = (obj: any) => {
    if (obj instanceof Object) {
        for (const v of Object.values(obj)) {
            try {
                Object.freeze(obj);
            } catch {
                // ignore
            }
            deepFreeze(v);
        }
    }
    return obj;
  };

/**
 * Returns the unique values, as compared by ===
 * @param l a list of strings or other values to be compared by ===
 * @returns
 */
export const uniq = <T>(l: Array<T>) =>
    [
        ...l.reduce((acc: Set<T>, e: T) =>
            (acc.add(e), acc), new Set<T>())
        .keys()
];

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

/**
 * Higher-order function, that creates summing functions.
 *
 * @param f a function that takes an item and returns a number.
 * @param v a function that validates that the result is of type `V`.
 * @returns a function that takes a list of items and returns the sum of the values returned by applying _f_.
 */
export const makeSummer = <T, V extends number>(f: (item: T) => V, v?: (n: V) => V) =>
    v
        ? (l: T[]) =>
            v(l.reduce((acc, a: T) => (acc + f(a)) as V, 0 as V))
        : (l: T[]) =>
            l.reduce((acc, a: T) => (acc + f(a)) as V, 0 as V);

/**
 * Get the monetary value of an item.
 * @param i a {@link IMonetaryItem}
 * @returns
 */
export const monetaryValue = (i: IMonetary) => i.value;

/**
 * Get the total value of a list of monetary items.
 * @param l a list of {@link IMonetaryItem} items.
 */
export const total = makeSummer(monetaryValue);

/**
 * Construct a family of type functions: a type guard, a coersion, and a checked cast.
 *
 * * The type guard ("is") tests membership and lets the compiler know the type. Same as an instanceof check,
 *   but can be passed as a function.
 * * The coercion ("to") checks to see if it is already of the type. If not, and a coercion function was supplied,
 *   the suplied coercion function will be applied, and the test retried with a checked cast.
 * * The checked cast ("as") checks the object, returning it as being the right type, or throwing an exception if not.
 * @param cls A class constructor
 * @param coerce an optional coercion function to be tried in the to* (coercion) variant
 * @returns [is, to, as]
 */
export const classChecks = <T>(cls: new (...args: any[]) => T, coerce?: (a: any) => T):
  [(a: any) => a is T, (a: any) => T, (a: any) => T] => {
    const is = (a: any): a is T => a instanceof cls;
    const as = (a: any): T => a instanceof cls
        ? a
        : Throw(`${a} is not an instance of ${a.name}`);
    const c = coerce
        ? (a: any): T => a instanceof cls
            ? a
            : as(coerce(a))
        : as;
    return [is, c, as];
};

/**
 * Construct a family of type functions: a type guard, a coersion, and a checked cast.
 *
 * * The type guard ("is") tests membership and lets the compiler know the type. Same as an instanceof check,
 *   but can be passed as a function.
 * * The coercion ("to") checks to see if it is already of the type. If not, and a coercion function was supplied,
 *   the suplied coercion function will be applied, and the test retried with a checked cast.
 * * The checked cast ("as") checks the object, returning it as being the right type, or throwing an exception if not.
 * @param is A type guard.
 * @param isNot A string for error messages, when the type guard fails
 * @param coerce an optional coercion function to be tried in the to* (coercion) variant
 * @returns [is, to, as]
 */
export const typeChecks = <T>(is: (a: any) => a is T, isNot: string, coerce?: (a: any) => T):
  [(a: any) => T, (a: any) => T] => {
    const as = (a: any) => is(a)
        ? a
        : Throw(`${a} is not ${isNot}`);
    const c = coerce
        ? (a: any): T => is(a)
            ? a
            : as(coerce(a))
        : as;
    return [c, as];
  };

/**
 * Simple type-aware identity function.
 * @param a
 * @returns a
 */
export const identity = <T>(a: T): T => a;
