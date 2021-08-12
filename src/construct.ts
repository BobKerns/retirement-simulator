/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Type, RowType, ItemType, IItem, AnyRow, TemporalItem } from './types';
import { Asset } from './asset';
import { Expense } from './expense';
import { Liability } from './liability';
import { Income } from './income';
import { IncomeStream } from './income-stream';
import { IncomeTax } from './income-tax';
import { Person } from './person';
import { assertRow, makeSort } from './utils';
import { TextItem } from './text';
import { Year } from './tagged';
import { Temporal } from './temporal';

/**
 * Construct an item from a row object
 * @param item The row describing the item
 * @param type The type of item (defaulted from the item)
 * @returns the constructed instance.
 */
export const construct = <T extends Type>(items: Array<RowType<T>>, type: T, dataset: Array<RowType<Type>>, end_year: Year)
    : ItemType<T> => {
    const builder = (): ((i: RowType<T>) => AnyRow & TemporalItem) => {
        switch (type) {
            case "asset":
                return (i: RowType<T>) => new Asset(assertRow(i, 'asset'));
            case "expense":
                return (i: RowType<T>) => new Expense(assertRow(i, 'expense'));
            case "liability":
                return (i: RowType<T>) => new Liability(assertRow(i, 'liability'));
            case "income":
                return (i: RowType<T>) => new Income(assertRow(i, 'income'));
            case "incomeStream":
                return (i: RowType<T>) => new IncomeStream(assertRow(i, 'incomeStream'));
            case "incomeTax":
                return (i: RowType<T>) => new IncomeTax(assertRow(i, 'incomeTax'));
            case "person":
                return (i: RowType<T>) => new Person(assertRow(i, 'person'));
            case "text":
                return (i: RowType<T>) => new TextItem(assertRow(i, 'text'));
            case "scenario":
                return (i: RowType<T>) => new (construct as any).Scenario(assertRow(i, 'scenario'), dataset, end_year);
            default:
                throw new Error(`Unrecognized item type: ${type}`);
        }
    }
    const tItems = items.map(builder());
    const temporal = new Temporal(tItems);
    tItems.forEach(i => i.temporal = temporal);
    return temporal.first as unknown as ItemType<T>;
};
