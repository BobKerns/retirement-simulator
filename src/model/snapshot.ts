/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { AssetState } from "./asset";
import { ExpenseState } from "./expense";
import { IncomeState } from "./income";
import { IncomeStreamState } from "./income-stream";
import { IncomeTaxState } from "./income-tax";
import { LiabilityState } from "./liability";
import { ScenarioBase } from "./scenario-base";
import { TextItemState } from "./text";
import { IFAsset, IFExpense, IFIncome, IFIncomeStream, IFIncomeTax, IFLiability, IFScenario, IFText, IItem, ItemStates, NamedIndex }from "../types";
import { classChecks, indexByName } from "../utils";
import { CalendarStep, fmt_date } from "../calendar";

/**
 * A snapshot at a point in time of a {@link Scenario}.
 *
 * A snapshot captures the time, together with the {@link State|StateMixin} of vhe various monetary
 * factors. A series of snapshots give a bulk time series of the financial state,
 * from which graphs, tables, and interactive tools can be constructed.
 */
export class Snapshot extends ScenarioBase {
    get spouse1() { return this.scenario.spouse1; }
    get spouse2() { return this.scenario.spouse2; }
    get person_list() { return this.scenario.person_list; }
    period: CalendarStep;
    asset_list: IFAsset[];
    liability_list: IFLiability[];
    income_list: IFIncome[];
    expense_list: IFExpense[];
    tax_list: IFIncomeTax[];
    incomeStream_list: IFIncomeStream[];
    text_list: IFText[];

    get people() { return this.scenario.people; }
    assets: NamedIndex<IFAsset>;
    liabilities: NamedIndex<IFLiability>;
    incomes: NamedIndex<IFIncome>;
    expenses: NamedIndex<IFExpense>;
    incomeStreams: NamedIndex<IFIncomeStream>;
    taxes: NamedIndex<IFIncomeTax>;
    texts: NamedIndex<IFText>;

    readonly scenario: IFScenario;

    constructor(scenario: IFScenario, period: CalendarStep, previous: ScenarioBase, states: ItemStates) {
        super(scenario, previous.scenario);
        this.scenario = scenario;
        this.period = period;
        const next = (item: IItem) => {
            const state = states[item.id];
            const {current, generator} = state;
            const val = generator.next({...current, step: period});
            return state.current = val.value;
        };
        this.asset_list = scenario.asset_list.map(a => new AssetState(a, scenario, next(a)));
        this.liability_list = scenario.liability_list.map(a => new LiabilityState(a, scenario, next(a)));
        this.income_list = scenario.income_list.map(a => new IncomeState(a, scenario, next(a)));
        this.expense_list = scenario.expense_list.map(a => new ExpenseState(a, scenario, next(a)));
        this.tax_list = scenario.tax_list.map(a => new IncomeTaxState(a, scenario, next(a)));
        this.incomeStream_list = scenario.incomeStream_list.map(a => new IncomeStreamState(a, scenario, next(a)));
        this.text_list = scenario.text_list.map(a => new TextItemState(a, scenario, next(a)));
        this.assets = indexByName(this.asset_list);
        this.liabilities = indexByName(this.liability_list);
        this.incomes = indexByName(this.income_list);
        this.expenses = indexByName(this.expense_list);
        this.taxes = indexByName(this.tax_list);
        this.incomeStreams = indexByName(this.incomeStream_list);
        this.texts = indexByName(this.text_list);
    }

    #tag?: string;
    get [Symbol.toStringTag]() {
        try {
            return this.#tag ?? (this.#tag = `Snap(${this.name})[#${this.period.step} ${fmt_date(this.period.start)}]`);
        } catch {
            return `Snapshot.prototype`;
        }
    }
}

export const [isSnapshot, toSnapshot, asSnapshot] = classChecks(Snapshot);
