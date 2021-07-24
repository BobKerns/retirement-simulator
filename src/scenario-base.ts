/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Asset } from "./asset";
import { Expense } from "./expense";
import { Income } from "./income";
import { IncomeStream } from "./income-stream";
import { IncomeTax } from "./income-tax";
import { Item } from "./item";
import { Loan } from "./loan";
import { IScenario, NamedIndex, Row } from "./types";

export abstract class ScenarioBase extends Item<'scenario'> implements IScenario {
    abstract asset_list: Array<Asset>;
    abstract loan_list: Array<Loan>;
    abstract income_list: Array<Income>;
    abstract expense_list: Array<Expense>;
    abstract tax_list: Array<IncomeTax>;
    abstract incomeStream_list: Array<IncomeStream>;

    abstract assets: NamedIndex<Asset>;
    abstract loans: NamedIndex<Loan>;
    abstract incomes: NamedIndex<Income>;
    abstract incomeStreams: NamedIndex<IncomeStream>;
    abstract expenses: NamedIndex<Expense>;
    abstract taxes: NamedIndex<IncomeTax>;

    constructor(row: Row<'scenario'>) {
        super(row);
    }

}