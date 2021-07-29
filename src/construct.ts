/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Type, Row, ItemType } from './types';
import { Asset } from './asset';
import { Expense } from './expense';
import { Loan } from './loan';
import { Income } from './income';
import { IncomeStream } from './income-stream';
import { IncomeTax } from './income-tax';
import { Person } from './person';
import { assertRow } from './utils';

/**
 * Construct an item from a row object
 * @param item The row describing the item
 * @param type The type of item (defaulted from the item)
 * @returns the constructed instance.
 */
export const construct = <T extends Type>(item: Row<T>, type: T = item.type): ItemType<T> => {
    if (!item)
        return item;
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
