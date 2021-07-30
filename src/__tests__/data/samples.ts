/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { asMoney, asRate, asUnit } from "../../tagged";
import { IExpense, IPerson } from "../../types";

export const expense_1: IExpense = {
    name: 'Expense',
    type: 'expense' as const,
    fromStream: 'from',
    sort: 1,
    value: asMoney(100.00),
    categories: ['fred'],
    scenarios: [],
    fraction: asRate(1)
};

export const person_1: IPerson = {
    name: 'Person 1',
    type: 'person' as const,
    sort: 1,
    categories: [],
    scenarios: [],
    birth: new Date("1967-01-01"),
    sex: 'female'
};

export const person_2: IPerson = {
    name: 'Person 2',
    type: 'person' as const,
    sort: 1,
    categories: [],
    scenarios: [],
    birth: new Date("1967-01-01"),
    sex: 'male'
};