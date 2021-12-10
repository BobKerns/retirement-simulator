/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import Heap from "heap";
import { AllItems, ScenarioBase } from "./scenario-base";
import { Snapshot } from "./snapshot";
import { CalendarStep, YEAR } from "../calendar";
import {
    IItem, Name, NamedIndex, Type,
    RowType, ItemType,
    Category, IFLiability, IFAsset, IFIncome,
    IFExpense, IFIncomeTax, IFTransfer, IFPerson,
    IFText,
    IFScenario,
    SimContext,
    Stepper
    } from "../types";
import { classChecks, id as makeId, indexByName, Throw, total } from "../utils";
import type { construct } from "../construct";
import { as, $$, Year, $0 } from "../tagged";
import { START, END } from "../time";
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
    transfer_list: IFTransfer[];
    text_list: IFText[];

    readonly people: NamedIndex<IFPerson>;
    assets: NamedIndex<IFAsset>;
    liabilities: NamedIndex<IFLiability>;
    incomes: NamedIndex<IFIncome>;
    transfers: NamedIndex<IFTransfer>;
    expenses: NamedIndex<IFExpense>;
    taxes: NamedIndex<IFIncomeTax>;
    texts: NamedIndex<IFText>;

    allItems: AllItems;

    /**
     * @internal
     */
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
    readonly byId: { [k: string]: IItem<Type>; } = {};

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
        this.transfer_list = this.#construct_items("transfer");
        this.transfers = indexByName(this.transfer_list);
        this.text_list = this.#construct_items("text");
        this.texts = indexByName(this.text_list);

        // Compute the intial timeline.
        const scan = (list: Array<IItem>) =>
            list.forEach((item) => {
                if (!this.byId[item.id]) {
                    this.byId[item.id] = item;
                }
            });
        this.spouse1 && scan([this.spouse1]);
        this.spouse2 && scan([this.spouse2]);
        scan(this.asset_list);
        scan(this.expense_list);
        scan(this.liability_list);
        scan(this.income_list);
        scan(this.tax_list);
        scan(this.transfer_list);
       this. allItems = {
            asset: this.assets,
            expense: this.expenses,
            transfer: this.transfers,
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

    get total_retirement_income() {
        return $$(
            this.asset_list
                .filter((a) => !a.hasCategory(NON_INCOME_ASSET))
                .reduce((acc, a) => $$(acc + a.value * a.rate), $0) +
                total(this.income_list)
            );
    }

    get total_retirement_income_with_fixed() {
        return $$(
            this.asset_list.reduce((acc, a) => $$(acc + a.value * a.rate), $0) +
            this.income_list.reduce((acc, a) => $$(acc + a.value), $0)
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
        const id = makeId('person', name);
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

    *stepper(start: CalendarStep, ctx: SimContext): Stepper<'scenario'> {
        while (true) {
            const next = yield {};
        }
    }
}


export const [isScenario, toScenario, asScenario] = classChecks(Scenario);
