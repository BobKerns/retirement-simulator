/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import Heap from "heap";
import { AllItems, ScenarioBase } from "./scenario-base";
import { Snapshot } from "./snapshot";
import { calendarRange, CalendarStep, incrementDate, TODAY, YEAR } from "../calendar";
import {
    IItem, Name, NamedIndex, Type,
    TimeLineItem, RowType, ItemType, ScenarioName,
    Category, IFLiability, IFAsset, IFIncome,
    IFExpense, IFIncomeTax, IFIncomeStream, IFPerson,
    IFText,
    IFScenario,
    ItemStates,
    ItemMethods,
    ItemState,
    StateItem,
    ItemImpl
    } from "../types";
import { classChecks, heapgen, indexByName, Throw, total } from "../utils";
import type { construct } from "../construct";
import { as, asMoney, Year } from "../tagged";
import { START } from "../input";

/**
 * Category of assets that do not contribute to retirement income streams.
 */
const NON_INCOME_ASSET: Category = as("non-income");

type foo = ItemMethods<'scenario'>['states']

/**
 * A particular scenario.
 */
export class Scenario extends ScenarioBase implements IFScenario {
    static construct: typeof construct;
    readonly data: Array<RowType<Type>>;

    spouse1: IFPerson;
    spouse2: IFPerson | null;
    asset_list: IFAsset[];
    liability_list: IFLiability[];
    income_list: IFIncome[];
    expense_list: IFExpense[];
    tax_list: IFIncomeTax[];
    incomeStream_list: IFIncomeStream[];
    text_list: IFText[];

    readonly people: NamedIndex<IFPerson>;
    assets: NamedIndex<IFAsset>;
    liabilities: NamedIndex<IFLiability>;
    incomes: NamedIndex<IFIncome>;
    incomeStreams: NamedIndex<IFIncomeStream>;
    expenses: NamedIndex<IFExpense>;
    taxes: NamedIndex<IFIncomeTax>;
    texts: NamedIndex<IFText>;

    allItems: AllItems;

    /**
     * @internal
     */
    #timeline: Heap<TimeLineItem>;
    /**
     * @internal
     */
    #snapshots?: Array<Snapshot>;
    /**
     * @internal
     */
    #final?: Snapshot;
    /**
     * @internal
     */
    #end_year: Year;

    static scenarios: NamedIndex<Scenario> = {};

    constructor(row: RowType<'scenario'>, dataset: Array<RowType<Type>>, end_year: Year) {
        super(row, undefined as unknown as IFScenario);
        this.data = dataset.filter(i => i.name && i.scenarios?.find(s => s === this.name));
        this.#end_year = end_year;
        const spouse1 = this.#construct_spouse("spouse1") ?? Throw("No spouse1 specified");
        const spouse2 = this.#construct_spouse("spouse2");
        this.spouse1 = spouse1;
        this.spouse2 = spouse2;
        this.people = {
            spouse1: spouse1,
            [spouse1.name]: spouse1,
            ...spouse2 && {
                spouse2: spouse2,
                [spouse2?.name]: spouse2
            },
        };
        this.asset_list = this.#construct_items("asset");
        this.assets = indexByName(this.asset_list);
        this.expense_list = this.#construct_items("expense");
        this.expenses = indexByName(this.expense_list);
        this.liability_list = this.#construct_items("liability");
        /*
        this.liability_list.forEach(
            (l) => (l.payment = this.expenses[l.name]?.value)
        );
        */
        this.liabilities = indexByName(this.liability_list);
        this.income_list = this.#construct_items("income");
        this.incomes = indexByName(this.income_list);
        this.tax_list = this.#construct_items("incomeTax");
        this.taxes = indexByName(this.tax_list);
        this.incomeStream_list = this.#construct_items("incomeStream");
        this.incomeStreams = indexByName(this.incomeStream_list);
        this.text_list = this.#construct_items("text");
        this.texts = indexByName(this.text_list);

        const timelineCmp = (a: TimeLineItem, b: TimeLineItem) =>
            a.date.valueOf() < b.date.valueOf()
                ? -1
                : a.date.valueOf() === b.date.valueOf()
                    ? a.item.type < b.item.type
                        ? -1
                        : a.item.type === b.item.type
                        ? a.item.name < b.item.name
                            ? -1
                            : 0
                    : -1
                : 1;

        // Compute the intial timeline.
        const timeline = new Heap(timelineCmp);
        timeline.push({ date: TODAY, action: "begin", item: this });
        const scan = (list: Array<IItem>) =>
            list.forEach((item) => {
                if (item && item.start) {
                    timeline.push({ date: item.start, action: "begin", item });
                }
                if (item && item.end) {
                    timeline.push({ date: item.start, action: "end", item });
                }
            });
        this.spouse1 && scan([this.spouse1]);
        this.spouse2 && scan([this.spouse2]);
        scan(this.asset_list);
        scan(this.expense_list);
        scan(this.liability_list);
        scan(this.income_list);
        scan(this.tax_list);
        scan(this.incomeStream_list);
        this.#timeline = timeline;
       this. allItems = {
            asset: this.assets,
            expense: this.expenses,
            incomeStream: this.incomeStreams,
            incomeTax: this.taxes,
            income: this.incomes,
            liability: this.liabilities,
            person: this.people,
            scenario: {[this.name]: this as IFScenario},
            text: this.texts
        };
    }

    /**
     * Get the full timeline in sorted order as a generator.
     */
    get timeline() {
        return heapgen(this.#timeline);
    }

    /**
     * Get the snapshots for the scenario period.
     */
    get snapshots() {
        return this.#snapshots || (this.#snapshots = this.run());
    }

    /**
     * Get the last snapshot for the scenario period.
     */
    get final() {
        return this.#final || ((ss) => ss[ss.length - 1])(this.snapshots);
    }

    get sourcesFlat() {
        return this.snapshots.flatMap((s) => [...s.asset_list, ...s.income_list]);
    }

    /**
     * Get the net worth at the final snapshot
     */
    get net_assets_final() {
        return this.final.net_assets;
    }

    get total_retirement_income() {
        return Math.round(
            this.asset_list
                .filter((a) => !a.hasCategory(NON_INCOME_ASSET))
                .reduce((acc, a) => acc + a.value * a.rate, 0) +
                total(this.income_list)
            );
    }

    get total_retirement_income_with_fixed() {
        return Math.round(
            this.asset_list.reduce((acc, a) => acc + a.value * a.rate, 0) +
            this.income_list.reduce((acc, a) => acc + a.value, 0)
        );
    }

    get [Symbol.toStringTag]() {
        return `Scenario[${this.name}]`;
    }

    #construct_items<T extends Type>(type: T, all: boolean = false): Array<ItemType<T>> {
        const items: Array<ItemType<T>> = [];
        this.data.forEach((r) => {
            if (r.type === type && (all || r.scenarios?.find((rs) => rs === this.name))) {
                items.push(Scenario.construct([r as RowType<T>], type, this, this.#end_year));
            }
        });
        return items;
    }

    #construct_item<T extends Type>(name: Name, type: T, all = false): ItemType<T> | null {
        const items = this.data.filter(
            (r: RowType) =>
                r.name === name &&
                r.type === type &&
                (all || r.scenarios?.find((rs: ScenarioName) => rs === this.name))
        );
        if (items.length) {
            return Scenario.construct(items as Array<RowType<T>>, type, this, this.#end_year);
        }
        return null;
    }

    #construct_spouse(name: Name): IFPerson | null {
        const item = this.#construct_item(name, 'person');
        if (!item) return null;
        const birth = item.birth ?? Throw(`Birth date for person ${name} is not specified`);
        const age = YEAR - birth.getUTCFullYear();
        const sex = item?.sex ?? Throw("Sex is not specified");
        const years = this.#end_year - YEAR;
        const categories = item?.categories ?? [];
        const scenarios = item?.scenarios ?? ['Default'];
        const prettyName = item?.prettyName ?? name;
        const id = `person/${name}`;
        const row = {
            name,
            type: 'person' as const,
            id,
            prettyName,
            start: item?.start ?? TODAY,
            birth,
            sex,
            sort: item?.sort ?? 0,
            categories,
            scenarios
        };
        const x =  Scenario.construct([row], "person", this, this.#end_year);
        return x;
    }

    *states() {}

    /**
     * Run the simulation for the scenario's period.
     * @returns
     */
    run() {
        const previous = this;
        let state: ItemStates = {};
        const start = new CalendarStep(START, START, as(0));
        this.items().forEach(i => {
            const generator = i.states(start);
            const current = generator.next().value;
            state[i.id] = {generator, current};
        });
        const snapshots = [];
        for (const period of calendarRange(START, incrementDate(START, {year: 50}), {month: 1})) {
            snapshots.push(new Snapshot(this, period, previous, state));
            // Walk each asset, liability, income, or expense through their internal evolution.
            // This includes both rate-base calculations and multiple time-based entries.
            const update = <T extends Type, L extends Array<ItemImpl<T>>>(list: L) => {
                for (const item of list) {
                    const itemState = state[item.id] as StateItem<T>;
                    const {current, generator} = itemState;
                    if (current) {
                        const next = generator.next(current);
                        if (next.done) {
                            delete state[item.id];
                        } else {
                            itemState.current = next.value;
                        }
                    }
                }
            };
            update(this.income_list);
            update(this.asset_list);
            update(this.expense_list);
            update(this.liability_list);
            for (const expense of this.expense_list) {
                const inStream = this.incomeStreams[expense.fromStream]
                    ?? Throw(`There is no IncomeStream named ${expense.fromStream}`);
                const current = (state[expense.id].current) as ItemState<'expense'>;
                if (current) {
                    current.value = asMoney(current.value = inStream.withdraw(current.value, expense.id, state));
                }
            }
        }
        return snapshots;
    }
}


export const [isScenario, toScenario, asScenario] = classChecks(Scenario);
