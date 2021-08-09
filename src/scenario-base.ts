/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Item } from "./item";
import { IFAsset, IFExpense, IFIncome, IFIncomeStream, IFIncomeTax, IFLiability, IFScenario, IScenario, IScenarioBase, NamedIndex } from "./types";

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
    /**
     * A list of {@link Asset}. See also {@link assets}.
     */
    abstract asset_list: IFAsset[];
    /**
     * A list of {@link Loan}. See also {@link loans}.
     */
    abstract liability_list: IFLiability[];
    /**
     * A list of {@link Income}. See also {@link incomes}.
     */
    abstract income_list: IFIncome[];
    /**
     * A list of {@link Expense}. See also {@link expenses}.
     */
    abstract expense_list: IFExpense[];
    /**
     * A list of {@link IncomeTax}. See also {@link taxes}.
     */
    abstract tax_list: IFIncomeTax[];
    /**
     * A list of {@link IncomeStream}. See also {@link incomeStreams}.
     */
    abstract incomeStream_list: IFIncomeStream[];

    /**
     * A lookup table of {@link Asset} for convenient lookup by name.
     * See also {@link asset_list}.
     */
    abstract assets: NamedIndex<IFAsset>;

    /**
     * A lookup table of {@link Loan} for convenient lookup by name.
     * See also {@link loan_list}.
     */
    abstract liabilities: NamedIndex<IFLiability>;

    /**
     * A lookup table of {@link Income} for convenient lookup by name.
     * See also {@link income_list}.
     */
    abstract incomes: NamedIndex<IFIncome>;

    /**
     * A lookup table of {@link IncomeStream} for convenient lookup by name.
     * See also {@link incomeStream_list}.
     */
    abstract incomeStreams: NamedIndex<IFIncomeStream>;

    /**
     * A lookup table of {@link Expense} for convenient lookup by name.
     * See also {@link expense_list}.
     */
    abstract expenses: NamedIndex<IFExpense>;

    /**
     * A lookup table of {@link IncomeTax} for convenient lookup by name.
     * See also {@link tax_list}.
     */
    abstract taxes: NamedIndex<IFIncomeTax>;

    /**
     * Get the associated {@link Scenario}
     */
    abstract readonly scenario: IFScenario;

    constructor(row: IScenario) {
        super(row);
    }

    /**
     * Get the sources of income for potential income streams. This does not include loans;
     * if borrowing is part of the strategy, as in a revolving line of credit or a reverse mortgage,
     * use an {@link Asset} with negative balance.
     */
    get sources() {
        return [...this.asset_list, ...this.income_list];
    }

    /**
     * Calculate the total net value of assets.
     */
    get net_assets() {
        return Math.round(
            this.asset_list.reduce((a, i) => a + i.value, 0) -
            this.liability_list.reduce((a, i) => a + i.value, 0)
        );
    }

    /**
     * Get the total expenses
     */
    get total_expenses() {
        return Math.round(this.expense_list.reduce((a, i) => a + i.value, 0));
    }
}