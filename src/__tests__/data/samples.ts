/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { UTC } from "../../calendar";
import { START } from "../../time";
import { $$, as } from "../../tagged";
import { Category, IFExpense, IFScenario, IItem, IPerson, RowType, Type } from "../../types";

export const CAT_FRED: Category = as('fred');
export const CAT_SALLY: Category = as('sally');

/**
 * Fill in the`id` field.
 */
export const id = <T extends IItem<Type>>(spec: Partial<T> & any): T =>
    ({
        sort: 1,
        categories: [],
        scenarios: ['Default'],
        ...spec as any,
        id: `${spec.type}/${spec.name}`
        } as T);

export const scenario_1: IFScenario = id({
    name: 'Default',
    type: 'scenario',
});

export const expense_1: IFExpense = id({
    name: 'Expense',
    type: 'expense' as const,
    start: START,
    from: 'from',
    sort: 1,
    paymentPeriod: 'month',
    value: $$(100.00),
    categories: [CAT_FRED],
    scenarios: []
});

export const person_1: IPerson = id({
    name: 'spouse1',
    type: 'person' as const,
    sort: 1,
    categories: [],
    birth: UTC("1967-01-01"),
    start: UTC("1967-01-01"),
    sex: 'female'
});

export const person_2: IPerson = id({
    name: 'spouse2',
    type: 'person' as const,
    sort: 1,
    categories: [],
    birth: UTC("1967-01-01"),
    start: UTC("1967-01-01"),
    sex: 'male'
});


export const dataset: RowType[] = [
    scenario_1,
    expense_1,
    person_1,
    person_2
    ] as RowType[];
