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
import { Loan } from "./loan";
import { ScenarioBase } from "./scenario-base";
import { NamedIndex } from "./types";
import { indexByName } from "./utils";

export class Snapshot extends ScenarioBase {
    year: number;
    asset_list: Asset[];
    loan_list: Loan[];
    income_list: Income[];
    expense_list: Expense[];
    tax_list: IncomeTax[];
    incomeStream_list: IncomeStream[];
    assets: NamedIndex<Asset>;
    loans: NamedIndex<Loan>;
    incomes: NamedIndex<Income>;
    expenses: NamedIndex<Expense>;
    incomeStreams: NamedIndex<IncomeStream>;
    taxes: NamedIndex<IncomeTax>;

    constructor(scenario: ScenarioBase, year: number, previous: ScenarioBase) {
        super(scenario);
        this.year = year;
        this.asset_list = scenario.asset_list.map(a => new Asset(a));
        this.loan_list = scenario.loan_list.map(a => new Loan(a));
        this.income_list = scenario.income_list.map(a => new Income(a));
        this.expense_list = scenario.expense_list.map(a => new Expense(a));
        this.tax_list = scenario.tax_list.map(a => new IncomeTax(a));
        this.incomeStream_list = scenario.incomeStream_list.map(a => new IncomeStream(a));
        this.assets = indexByName(this.asset_list);
        this.loans = indexByName(this.loan_list);
        this.incomes = indexByName(this.income_list);
        this.expenses = indexByName(this.expense_list);
        this.incomeStreams = indexByName(this.incomeStream_list);
        this.taxes = indexByName(this.tax_list);
    }
}