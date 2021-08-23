/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Type, RowType, ItemType, AnyRow, TemporalItem } from './types';
import { Asset, Expense, Liability, Income, IncomeStream, IncomeTax, Person, TextItem, Scenario } from './model';
import { assertRow } from './utils';
import { Year } from './tagged';
import { Temporal } from './temporal';

/**
 * Construct an item from a row object
 * @param item The row describing the item
 * @param type The type of item (defaulted from the item)
 * @returns the constructed instance.
 */
export const construct = <T extends Type>(items: Array<RowType<T>>, type: T, dataset: Array<RowType<Type>> | Scenario, end_year: Year)
    : ItemType<T> => {
        const data = dataset as Array<RowType<Type>>;
        const scenario = dataset as Scenario;
    const builder = (): ((i: RowType<T>) => AnyRow & TemporalItem) => {
        switch (type) {
            case "asset":
                return (i: RowType<T>) => new Asset(assertRow(i, 'asset'), scenario );
            case "expense":
                return (i: RowType<T>) => new Expense(assertRow(i, 'expense'), scenario);
            case "liability":
                return (i: RowType<T>) => new Liability(assertRow(i, 'liability'), scenario);
            case "income":
                return (i: RowType<T>) => new Income(assertRow(i, 'income'), scenario);
            case "incomeStream":
                return (i: RowType<T>) => new IncomeStream(assertRow(i, 'incomeStream'), scenario);
            case "incomeTax":
                return (i: RowType<T>) => new IncomeTax(assertRow(i, 'incomeTax'), scenario);
            case "person":
                return (i: RowType<T>) => new Person(assertRow(i, 'person'), scenario);
            case "text":
                return (i: RowType<T>) => new TextItem(assertRow(i, 'text'), scenario);
            case "scenario":
                return (i: RowType<T>) => new Scenario(assertRow(i, 'scenario'), data, end_year);
            default:
                throw new Error(`Unrecognized item type: ${type}`);
        }
    }
    const tItems = items.map(builder());
    const temporal = new Temporal(tItems);
    tItems.forEach(i => i.temporal = temporal);
    return temporal.first as unknown as ItemType<T>;
};

// Avoid circular dependencies.
Scenario.construct = construct;
