/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import {default as Heap} from 'heap';
import {Sync} from 'genutils';
import { MonetaryType, IMonetaryItem, IItem, Named, NamedIndex, SortFn, Type, IBalanceItem, BalanceType, Row, ItemType, AnyRow } from './types';
import { Asset } from './asset';
import { Expense } from './expense';
import { Loan } from './loan';
import { Income } from './income';
import { IncomeStream } from './income-stream';
import { IncomeTax } from './income-tax';
import { Person } from './person';

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

  export const assertNever = (x: never, msg: string = `Unexpected ${x}`): never => Throw(msg);

  export const checkRow = <T extends Type>(row: Row, type: T): row is Row<T> => row.type === type;
  export const assertRow = <T extends Type>(row: Row, type: T): Row<T> => checkRow(row, type) ? row : Throw(`Row not of type ${type}.`);

  export const construct = <T extends Type>(item: Row<T>, type: T = item.type): ItemType<T> => {
  if (!item) return item;
  switch (type) {
    case "asset":
      return new Asset(assertRow(item, 'asset')) as unknown as ItemType<T>;
    case "expense":
      return new Expense(assertRow(item, 'expense')) as unknown as ItemType<T>;
    case "loan":
      return new Loan(assertRow(item, 'loan')) as unknown as ItemType<T>;
    case "income":
      return new Income(assertRow(item, 'income')) as unknown as ItemType<T>;
    case "incomeStream":
      return new IncomeStream(assertRow(item, 'incomeStream')) as unknown as ItemType<T>;
    case "incomeTax":
      return new IncomeTax(assertRow(item, 'incomeTax')) as unknown as ItemType<T>;
    case "person":
      return new Person(assertRow(item, 'person')) as unknown as ItemType<T>;
    default:
      throw new Error(`Unrecognized item type: ${item.type}`);
  }
};


