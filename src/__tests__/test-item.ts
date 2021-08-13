/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import {Expense} from '../model/expense';
import { construct as bareConstruct } from '../construct';
import { CAT_FRED, CAT_SALLY, expense_1 } from './data/samples';
import { as } from '../tagged';


const construct = (row: any) => bareConstruct(row, row[0].type, [], as(2021));

describe("Items", () => {
    test("Category yes", () => expect(new Expense(expense_1).hasCategory(CAT_FRED)).toBeTruthy());
    test("Category no", () => expect(new Expense(expense_1).hasCategory(CAT_SALLY)).toBeFalsy());
    test("Default scenario", () => expect(construct([expense_1]).scenarios).toEqual(['Default']));
    test("Non-Default scenario", () => expect(construct([{...expense_1, scenarios: ['rich', 'poor']}]).scenarios).toEqual(['rich', 'poor']));
});
