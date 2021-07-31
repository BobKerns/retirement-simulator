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
import { Liability } from "./liability";
import { ScenarioBase } from "./scenario-base";
import { NamedIndex } from "./types";
import { indexByName } from "./utils";

/**
 * A snapshot at a point in time of a {@link Scenario}.
 */
export class Snapshot extends ScenarioBase {
    year: number;
    asset_list: Asset[];
    liability_list: Liability[];
    income_list: Income[];
    expense_list: Expense[];
    tax_list: IncomeTax[];
    incomeStream_list: IncomeStream[];
    assets: NamedIndex<Asset>;
    liabilities: NamedIndex<Liability>;
    incomes: NamedIndex<Income>;
    expenses: NamedIndex<Expense>;
    incomeStreams: NamedIndex<IncomeStream>;
    taxes: NamedIndex<IncomeTax>;

    constructor(scenario: ScenarioBase, year: number, previous: ScenarioBase) {
        super(scenario);
        this.year = year;
        this.asset_list = scenario.asset_list.map(a => new Asset(a));
        this.liability_list = scenario.liability_list.map(a => new Liability(a));
        this.income_list = scenario.income_list.map(a => new Income(a));
        this.expense_list = scenario.expense_list.map(a => new Expense(a));
        this.tax_list = scenario.tax_list.map(a => new IncomeTax(a));
        this.incomeStream_list = scenario.incomeStream_list.map(a => new IncomeStream(a));
        this.assets = indexByName(this.asset_list);
        this.liabilities = indexByName(this.liability_list);
        this.incomes = indexByName(this.income_list);
        this.expenses = indexByName(this.expense_list);
        this.incomeStreams = indexByName(this.incomeStream_list);
        this.taxes = indexByName(this.tax_list);
    }
}