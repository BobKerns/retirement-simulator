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
import type { MonetaryType, IMonetaryItem, NamedIndex, Type, RowType, IMonetary, AnyNamed, Named, Name, Id } from './types';

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
export const indexByName = <T extends AnyNamed>(list: Array<T>) =>
  list.reduce((acc: NamedIndex<T>, item) => ((acc[item.name] = item), acc), {});

/**
 * Format a number as US currency.
 *
 * @param d a number as US currency
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
 * Format a number as a percentage.
 *
 * @param d Format a number as
 * @param frac 0 or 2 (default = 2) positions for cents
 * @returns
 */
export const fmt_pct = (d: number, frac: 4 | 3 | 2 | 1 | 0 = 3) =>
  `${(d * 100).toLocaleString("en", {
    minimumFractionDigits: frac,
    maximumFractionDigits: frac
  })}%`;

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
 * @returns [to, as]
 */
export const typeChecks = <T>(is: (a: any) => a is T, isNot: string, coerce?: (a: any) => T | undefined):
  [(a: any) => T, (a: any) => T] => {
    const as = (a: any) => is(a)
        ? a
        : Throw(`${a} is not ${isNot}`);
    const to = coerce
        ? (a: any): T => is(a)
            ? a
            : as(coerce(a))
        : as;
    return [to, as];
  };

export const isFunction = (f: any): f is Function => typeof f === 'function';

/**
 * Simple type-aware identity function.
 * @param a
 * @returns a
 */
export const identity = <T>(a: T): T => a;

/**
 * Type guard to determine if the argument has a monetary `.value` field.
 * @param a
 * @returns
 */
export const isMonetary = <T extends MonetaryType>(a: any): a is IMonetaryItem<T> => typeof a.value === 'number';
export const [toMonetary, asMonetary] = typeChecks(isMonetary, "a monetary item");

export const isObject = (o: any): o is {[k: string]: any} => typeof o === 'object';

export const [toObject, asObject] = typeChecks(isObject, 'an object');

export const isBoolean = (a: any): a is boolean => a === true || a === false;
export const [toBoolean, asBoolean] =
    typeChecks(
        isBoolean,
        "true or false",
        a => /^\s*(?:false|f)\s*$/i.test(a) ? false : /^\s*(?:true|t)\s*$/i.test(a) ? true : undefined
        );

export function id<T extends Type>(type: T): (name: Name) => Id<T>;
export function id<T extends Type>(type: T, name: Name): Id<T>;
export function id<T extends Type>(type: T, name?: Name): ((name: Name) => Id<T>) | Id<T> {
    if (name) {
        return `${type}/${name}`;
    }
    return (name: Name): Id<T> => `${type}/${name}`;
}

export const entries = <K extends keyof any, V extends any>(o: Record<K,V>) =>
    Object.entries<V>(o) as [K, V][];

export const keys = <K extends keyof any>(o: Record<K, any>) =>
    Object.keys(o) as K[];

export const values = <K extends keyof any, V extends any>(o: Record<K, V>) =>
    Object.values<V>(o) as V[];
