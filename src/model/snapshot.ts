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
import { AllItems, ScenarioBase } from "./scenario-base";
import { TextItemState } from "./text";
import { IFAsset, IFExpense, IFIncome, IFIncomeStream,
        IFIncomeTax, IFLiability, IFPerson, IFScenario,
        IFText, ItemImpl, ItemState, ItemStates,
        ItemTypeOf, NamedIndex, SimContext, Type
} from "../types";
import { classChecks, indexByName } from "../utils";
import { CalendarStep, fmt_date } from "../calendar";
import { PersonState } from "./person";

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
    #person_list: IFPerson[];
    get person_list() { return this.#person_list; }
    period: CalendarStep;
    asset_list: IFAsset[];
    liability_list: IFLiability[];
    income_list: IFIncome[];
    expense_list: IFExpense[];
    tax_list: IFIncomeTax[];
    incomeStream_list: IFIncomeStream[];
    text_list: IFText[];

    #people: NamedIndex<IFPerson>;
    get people() { return this.#people; }
    assets: NamedIndex<IFAsset>;
    liabilities: NamedIndex<IFLiability>;
    incomes: NamedIndex<IFIncome>;
    expenses: NamedIndex<IFExpense>;
    incomeStreams: NamedIndex<IFIncomeStream>;
    taxes: NamedIndex<IFIncomeTax>;
    texts: NamedIndex<IFText>;

    readonly scenario: IFScenario;

    allItems: AllItems;

    constructor(scenario: IFScenario, period: CalendarStep, previous: ScenarioBase, states: ItemStates) {
        super(scenario, previous.scenario);
        this.scenario = scenario;
        this.period = period;
        const active = <I extends ItemImpl<Type>, S extends ItemState<ItemTypeOf<I>>>(a: I): [[I, S]] | [] => {
            const state = states[a.id]
            if (!state) return [];
            const current = {...state.current};
            return [[a, current as S]];
        };

        this.asset_list = scenario.asset_list.flatMap(active).map(([a, n]) => new AssetState(a, scenario, n));
        this.liability_list = scenario.liability_list.flatMap(active).map(([a, n]) => new LiabilityState(a, scenario, n));
        this.income_list = scenario.income_list.flatMap(active).map(([a, n]) => new IncomeState(a, scenario, n));
        this.expense_list = scenario.expense_list.flatMap(active).map(([a, n]) => new ExpenseState(a, scenario, n));
        this.tax_list = scenario.tax_list.flatMap(active).map(([a, n]) => new IncomeTaxState(a, scenario, n));
        this.incomeStream_list = scenario.incomeStream_list.flatMap(active).map(([a, n]) => new IncomeStreamState(a, scenario, n));
        this.text_list = scenario.text_list.flatMap(active).map(([a, n]) => new TextItemState(a, scenario, n))
        this.#person_list = scenario.person_list.flatMap(active).map(([a, n]) => new PersonState(a, scenario, n));
        this.assets = indexByName(this.asset_list);
        this.liabilities = indexByName(this.liability_list);
        this.incomes = indexByName(this.income_list);
        this.expenses = indexByName(this.expense_list);
        this.taxes = indexByName(this.tax_list);
        this.incomeStreams = indexByName(this.incomeStream_list);
        this.texts = indexByName(this.text_list);
        this.#people = indexByName(this.#person_list);

       this. allItems = {
            asset: this.assets,
            expense: this.expenses,
            incomeStream: this.incomeStreams,
            incomeTax: this.taxes,
            income: this.incomes,
            liability: this.liabilities,
            person: this.people,
            scenario: {[this.scenario.name]: this.scenario},
            text: this.texts
        };
    }


    get dateRange(): [start: Date, end: Date] {
        return this.scenario.dateRange;
    }

    get byId() {
        return this.scenario.byId;
    }

    #tag?: string;
    get [Symbol.toStringTag]() {
        try {
            return this.#tag ?? (this.#tag = `Snap(${this.name})[#${this.period.step} ${fmt_date(this.period.start)}]`);
        } catch {
            return `Snapshot.prototype`;
        }
    }

    *stepper(start: CalendarStep, ctx: SimContext) {

    }
}

export const [isSnapshot, toSnapshot, asSnapshot] = classChecks(Snapshot);
