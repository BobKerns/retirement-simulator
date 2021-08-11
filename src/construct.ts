/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Type, RowType, ItemType } from './types';
import { Asset } from './asset';
import { Expense } from './expense';
import { Liability } from './liability';
import { Income } from './income';
import { IncomeStream } from './income-stream';
import { IncomeTax } from './income-tax';
import { Person } from './person';
import { assertRow } from './utils';
import { Scenario } from './scenario';
import { TextItem } from './text';
import { Year } from './tagged';

/**
 * Construct an item from a row object
 * @param item The row describing the item
 * @param type The type of item (defaulted from the item)
 * @returns the constructed instance.
 */
export const construct = <T extends Type>(item: RowType<T>, type: T = item.type, dataset: Array<RowType<Type>>, end_year: Year): ItemType<T> => {
    if (!item)
        return item;
    switch (type) {
        case "asset":
            return new Asset(assertRow(item, 'asset')) as unknown as ItemType<T>;
        case "expense":
            return new Expense(assertRow(item, 'expense')) as unknown as ItemType<T>;
        case "liability":
            return new Liability(assertRow(item, 'liability')) as unknown as ItemType<T>;
        case "income":
            return new Income(assertRow(item, 'income')) as unknown as ItemType<T>;
        case "incomeStream":
            return new IncomeStream(assertRow(item, 'incomeStream')) as unknown as ItemType<T>;
        case "incomeTax":
            return new IncomeTax(assertRow(item, 'incomeTax')) as unknown as ItemType<T>;
        case "person":
            return new Person(assertRow(item, 'person')) as unknown as ItemType<T>;
        case "text":
            return new TextItem(assertRow(item, 'text')) as unknown as ItemType<T>;
        case "scenario":
            return new (construct as any).Scenario(assertRow(item, 'scenario').name, dataset, end_year) as unknown as ItemType<T>;
        default:
            throw new Error(`Unrecognized item type: ${item.type}`);
    }
};
