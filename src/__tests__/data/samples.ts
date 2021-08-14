/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { UTC } from "../../calendar";
import { START } from "../../input";
import { as, asMoney } from "../../tagged";
import { Category, IExpense, IPerson } from "../../types";

export const CAT_FRED: Category = as('fred');
export const CAT_SALLY: Category = as('sally');

export const expense_1: IExpense = {
    name: 'Expense',
    type: 'expense' as const,
    start: START,
    fromStream: 'from',
    sort: 1,
    value: asMoney(100.00),
    categories: [CAT_FRED],
    scenarios: []
};

export const person_1: IPerson = {
    name: 'Person 1',
    type: 'person' as const,
    sort: 1,
    categories: [],
    scenarios: [],
    birth: UTC("1967-01-01"),
    start: UTC("1967-01-01"),
    sex: 'female'
};

export const person_2: IPerson = {
    name: 'Person 2',
    type: 'person' as const,
    sort: 1,
    categories: [],
    scenarios: [],
    birth: UTC("1967-01-01"),
    start: UTC("1967-01-01"),
    sex: 'male'
};