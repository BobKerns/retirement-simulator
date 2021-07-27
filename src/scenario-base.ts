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
import { IScenarioBase, NamedIndex, Row } from "./types";

/**
 * The base for both {@link Scenario} and {@link Snapshot} instances. The fields are the same
 * but are interpreted slightly differntly.
 *
 * * For a {@link Scenario}, they are the full set that
 * apply to the scenario, with any monetary values being the initial values for the scenario period.
 *
 * * For a {@link Snapshot}, they are the subset that apply during the snapshot period, together
 * with their values during that snapshot period.
 */
export abstract class ScenarioBase extends Item<'scenario'> implements IScenarioBase {
    abstract asset_list: Array<Asset>;
    abstract loan_list: Array<Loan>;
    abstract income_list: Income[];
    abstract expense_list: Expense[];
    abstract tax_list: IncomeTax[];
    abstract incomeStream_list: IncomeStream[];
    abstract assets: NamedIndex<Asset>;
    abstract loans: NamedIndex<Loan>;
    abstract incomes: NamedIndex<Income>;
    abstract incomeStreams: NamedIndex<IncomeStream>;
    abstract expenses: NamedIndex<Expense>;
    abstract taxes: NamedIndex<IncomeTax>;
    
    constructor(row: Row<'scenario'>) {
        super(row);
    }

    get total_assets() {
        return Math.round(
            this.asset_list.reduce((a, i) => a + i.value, 0) -
            this.loan_list.reduce((a, i) => a + i.value, 0)
        );
    }

}