/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import Heap from "heap";
import { AllItems, ScenarioBase } from "./scenario-base";
import { Snapshot } from "./snapshot";
import { calendarRange, CalendarStep, toDate, TODAY, YEAR } from "../calendar";
import {
    IItem, Name, NamedIndex, Type,
    TimeLineItem, RowType, ItemType,
    Category, IFLiability, IFAsset, IFIncome,
    IFExpense, IFIncomeTax, IFIncomeStream, IFPerson,
    IFText,
    IFScenario,
    ItemStates,
    ItemState,
    StateItem,
    ItemImpl
    } from "../types";
import { classChecks, heapgen, indexByName, Throw, total } from "../utils";
import type { construct } from "../construct";
import { as, asMoney, Year } from "../tagged";
import { START, END } from "../input";
import { Item } from "./item";

/**
 * Category of assets that do not contribute to retirement income streams.
 */
const NON_INCOME_ASSET: Category = as("non-income");

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
    #start: Date;
    /**
     * @internal
     */
    #end: Date;
    /**
     * @internal
     */
    #currentEnd?: Date;
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
        this.#start = START;
        this.#end = END;
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
        timeline.push({ date: START, action: "begin", item: this });
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

    get dateRange(): [start: Date, end: Date] {
        return [this.#start, this.#end];
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
        if (!this.#snapshots) {
            this.#snapshots = this.#run();
            this.#currentEnd = this.#end;
        }
        return this.#snapshots;
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
        const groups = this.data.reduce(
            (acc: Record<Name, Array<RowType<T>>>, d): Record<Name, Array<RowType<T>>> => {
                if (d.type === type && Item.inScenario(this.name, d)) {
                    const list = (acc[d.name] || (acc[d.name] = []));
                    list.push(d as RowType<T>);
                }
                return acc;
            },
            {});
        return Object.values(groups).map(items => Scenario.construct(items, type, this, this.#end_year));
    }

    #construct_item<T extends Type>(name: Name, type: T): ItemType<T> | null {
        const items = this.data.filter(
            (r: RowType): r is RowType<T> =>
                r.name === name &&
                r.type === type &&
                Item.inScenario(this.name, r)
        );
        if (items.length) {
            return Scenario.construct(items, type, this, this.#end_year);
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
            start: item?.start ?? START,
            birth,
            sex,
            sort: item?.sort ?? 0,
            categories,
            scenarios
        };
        const x =  Scenario.construct([row], "person", this, this.#end_year);
        return x;
    }

    setEnd(end: Date) {
        this.#end = toDate(end);
        this.#snapshots = undefined;
        return this.snapshots;
    }

    *states() {}

    /**
     * Run the simulation for the scenario's period.
     * @returns
     */
    #run() {
        let previous: ScenarioBase = this;
        let states: ItemStates = {};
        const start = new CalendarStep(TODAY, this.#start, as(0));
        this.items().forEach(i => {
            const generator = i.states(start);
            const current = generator.next().value;
            states[i.id] = {generator, current};
        });
        // preroll would go here.
        const snapshots = [];
        if (TODAY !== this.#start) {
            snapshots.push(previous = new Snapshot(this, start, previous, states));
        }
        for (const period of calendarRange(this.#start, this.#end, {month: 1})) {
            // Walk each asset, liability, income, or expense through their internal evolution.
            // This includes both rate-base calculations and multiple time-based entries.
            const update = <T extends Type, L extends Array<ItemImpl<T>>>(list: L) => {
                for (const item of list) {
                    const itemState = states[item.id] as StateItem<T>;
                    if (itemState) {
                        const {current, generator} = itemState;
                        if (current) {
                            const next = generator.next(current);
                            if (next.done) {
                                delete states[item.id];
                            } else {
                                itemState.current = next.value;
                            }
                        }
                    }
                }
            };
            update(this.income_list);
            update(this.asset_list);
            update(this.expense_list);
            update(this.liability_list);
            // Needs to handle tax and loan payments.
            for (const expense of this.expense_list) {
                const inStream = this.incomeStreams[expense.fromStream]
                    ?? Throw(`There is no IncomeStream named ${expense.fromStream}`);
                const current = (states[expense.id]?.current) as ItemState<'expense'> | undefined;
                if (current) {
                    const used = inStream.withdraw(current.value, expense.id, states);
                    current.value = asMoney(current.value - used)
                }
            }
            // Income sweep goes here.
            snapshots.push(previous = new Snapshot(this, period, previous, states));

            const next = (item: IItem) => {
                const state = states[item.id];
                if (state) {
                    const { current, generator } = state;
                    const val = generator.next({ ...current, step: period });
                    return state.current = val.value;
                }
            };
            this.items().forEach(next);
        }
        return snapshots;
    }
}


export const [isScenario, toScenario, asScenario] = classChecks(Scenario);
