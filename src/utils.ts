/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import {default as Heap} from 'heap';
import {Sync} from 'genutils';
import { MonetaryType, IMonetaryItem, IItem, Named, NamedIndex, SortFn, Type, IBalanceItem, BalanceType, Row } from './types';

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
    byGrowth: <T extends BalanceType, I extends IBalanceItem<T> = IBalanceItem<T>>(a: I, b: I) => (a.growth < b.growth ? 1 : a.growth === b.growth ? 0 : -1)
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
 * Format the date as year-mo
 * @param date
 * @returns
 */
  export const fmt_date = (date: Date) =>
    `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;

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
  export const checkRow = <T extends Type>(row: Row, type: T): row is Row<T> => row.type === type;

  /**
   * Check that the supplied {@link Row} is of the desired {@link Type}, returning it as that type,
   * or throwing an exception if it is not.
   * @param row The {@link Row} to check
   * @param type
   * @returns
   */
  export const assertRow = <T extends Type>(row: Row, type: T): Row<T> => checkRow(row, type) ? row : Throw(`Row not of type ${type}.`);

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

export const sort = <T>(cmp: SortFn<T> = naturalCMP) => <I extends T>(l: Iterable<I>) => [...l].sort(cmp);

export const naturalSort = sort();
