/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import {Expense} from '../model/expense';
import { construct as bareConstruct } from '../construct';
import { dataset, expense_1, scenario_1 } from './data/samples';
import { as, asYear } from '../tagged';
import { Scenario } from '../model';

const construct = (row: any) => bareConstruct(row, row[0].type, [], asYear(2021));

describe("Expense", () => {
    const scenario = new Scenario(scenario_1, dataset, as(2030));
    test("Create", () => expect(new Expense(expense_1, scenario).fromStream).toEqual(expense_1.fromStream));
    test("Construct", () => expect(construct([expense_1]).categories).toEqual(['fred']));
    test("Default scenario", () => expect(construct([expense_1]).scenarios).toEqual(['Default']));
})
