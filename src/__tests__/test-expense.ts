/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import {Expense} from '../model/expense';
import { construct as bareConstruct } from '../construct';
import { expense_1 } from './data/samples';
import { as } from '../tagged';

const construct = (row: any) => bareConstruct(row, row[0].type, [], as(2021));

describe("Expense", () => {
    test("Create", () => expect(new Expense(expense_1).fromStream).toEqual(expense_1.fromStream));
    test("Construct", () => expect(construct([expense_1]).categories).toEqual(['fred']));
    test("Default scenario", () => expect(construct([expense_1]).scenarios).toEqual(['Default']));
})