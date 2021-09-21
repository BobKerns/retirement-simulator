/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Item } from "./item";
import {
    IFAsset, IFExpense, IFIncome, IFIncomeStream,
    IFIncomeTax, IFLiability, IFPerson, IFScenario, IFText,
    IItem,
    IScenarioBase, ItemImpl, ItemTableType, Name, NamedIndex, RowType, Type
    } from "../types";
import { Sync } from "genutils";

export type AllItems = {
    [K in Type]: ItemTableType<K>;
};

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
abstract class ScenarioBaseSimple extends Item<'scenario'> implements IScenarioBase {
    abstract spouse1: IFPerson;
    abstract spouse2: IFPerson | null;
    get person_list() {
        return this.spouse2
            ? [this.spouse1, this.spouse2]
            : [this.spouse1];
    }
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
     * List of text messages
     */
    abstract text_list: IFText[];

    /**
     * A lookup table of {@link Person} by name.
     */
    abstract people: NamedIndex<IFPerson>;

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
     * A lookup table of {@link IncomeTax} for convenient lookup by name.
     * See also {@link tax_list}.
     */
    abstract texts: NamedIndex<IFText>;

    abstract allItems: AllItems;

    abstract readonly dateRange: [start: Date, end: Date];

    abstract readonly byId: { [k: string]: IItem<Type>; };

    constructor(row: RowType<'scenario'>, scenario: IFScenario) {
        super(row, scenario);
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

    /**
     *
     * @returns all the items in a scenario as an enhanced iterator
     */
    items() {
        return Sync.concat<ItemImpl<Type>, unknown, unknown>(
            [this as ItemImpl<any>],
            this.person_list,
            this.asset_list,
            this.liability_list,
            this.income_list,
            this.expense_list,
            this.incomeStream_list,
            this.tax_list,
            this.text_list
        );
    }


    findItem<T extends Type>(name: Name, type: T): ItemImpl<T> | undefined {
        return this.allItems[type]?.[name] as unknown as ItemImpl<T>
    }
    findItems<T extends Type, R extends Array<ItemImpl<T>>>(type: T): R {
        switch (type) {
            case 'asset': return this.asset_list as unknown as R;
            case 'expense': return this.expense_list as unknown as R;
            case 'incomeStream': return this.incomeStream_list as unknown as R;
            case 'incomeTax': return this.tax_list as unknown as R;
            case 'income': return this.income_list as unknown as R;
            case 'liability': return this.liability_list as unknown as R;
            case 'person': return this.person_list as unknown as R;
            case 'scenario': return [this as IFScenario] as unknown as R;
            case 'text': return this.text_list as unknown as R;
        }
        throw new Error(`Unknown record type: ${type}`);
    }
    findText(name: Name): string {
        return this.findItem(name, 'text')?.text ?? '';
    }

    [Symbol.iterator]() {
        return this.items();
    }
}

export abstract class ScenarioBase extends Sync.Mixin(ScenarioBaseSimple) {
    constructor(row: RowType<'scenario'>, scenario: IFScenario) {
        super(row, scenario);
    }
}
