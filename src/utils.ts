/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import {default as Heap} from 'heap';
import {Sync} from 'genutils';
import { MonetaryType, IMonetaryItem, Item, Named, NamedIndex, SortFn } from './types';

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

export const indexByName = <T extends Named>(list: Array<T>) =>
  list.reduce((acc: NamedIndex<T>, item) => ((acc[item.name] = item), acc), {});

/**
 * Collection of sort functions.
 */
export const Sort = {
    byValue: <T extends MonetaryType, I extends IMonetaryItem<T> = IMonetaryItem<T>>(a: I, b: I) => (a.value < b.value ? 1 : a.value === b.value ? 0 : -1),
    byGrowth: <T extends MonetaryType, I extends IMonetaryItem<T> = IMonetaryItem<T>>(a: I, b: I) => (a.growth < b.growth ? 1 : a.growth === b.growth ? 0 : -1)
};

/**
 * Format a row of values in a Markdown table.
 *
 * @param args Array of values for the cells in the row
 * @returns a markdown-formatted string
 */
const row = (...args: any[]) => `|${["", ...args, ""].join("|")}|`;

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