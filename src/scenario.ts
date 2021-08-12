/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { range } from "genutils";
import Heap from "heap";
import { actuary, SS_2017 } from "./actuary";
import { ScenarioBase } from "./scenario-base";
import { Snapshot } from "./snapshot";
import { TODAY, YEAR } from "./calendar";
import { IItem, Name, NamedIndex, Type, TimeLineItem, RowType, ItemType, ScenarioName, Category, IFLiability, IFAsset, IFIncome, IFExpense, IFIncomeTax, IFIncomeStream, IFPerson, IFText } from "./types";
import { assertRow, classChecks, heapgen, indexByName, Throw, total } from "./utils";
import { construct } from "./construct";
import { as, Year } from "./tagged";
import { StateMixin } from "./state-mixin";


/**
 * Category of assets that do not contribute to retirement income streams.
 */
const NON_INCOME_ASSET: Category = as("non-income");

/**
 * A particular scenario.
 */
export class Scenario extends ScenarioBase {
    readonly data: Array<RowType<Type>>;

    spouse1: IFPerson;
    spouse2: IFPerson | null;
    readonly people: NamedIndex<IFPerson>;

    asset_list: IFAsset[];
    liability_list: IFLiability[];
    income_list: IFIncome[];
    expense_list: IFExpense[];
    tax_list: IFIncomeTax[];
    incomeStream_list: IFIncomeStream[];
    text_list: IFText[];

    assets: NamedIndex<IFAsset>;
    liabilities: NamedIndex<IFLiability>;
    incomes: NamedIndex<IFIncome>;
    incomeStreams: NamedIndex<IFIncomeStream>;
    expenses: NamedIndex<IFExpense>;
    taxes: NamedIndex<IFIncomeTax>;
    texts: NamedIndex<IFText>;

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

    constructor(name: Name, dataset: Array<RowType<Type>>, end_year: Year) {
        super(assertRow(dataset.find(i => i.name === name && i.type === 'scenario') ?? Throw(`Scenario ${name} not found.`), 'scenario'));
        this.data = dataset.filter(i => i.scenarios?.find(s => s === this.name));
        this.#end_year = end_year;
        const spouse1 = this.#find_spouse("spouse1") ?? Throw("No spouse1 specified");
        const spouse2 = this.#find_spouse("spouse2");
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
        this.asset_list = this.#find_items("asset");
        this.assets = indexByName(this.asset_list);
        this.expense_list = this.#find_items("expense");
        this.expenses = indexByName(this.expense_list);
        this.liability_list = this.#find_items("liability");
        /*
        this.liability_list.forEach(
            (l) => (l.payment = this.expenses[l.name]?.value)
        );
        */
        this.liabilities = indexByName(this.liability_list);
        this.income_list = this.#find_items("income");
        this.incomes = indexByName(this.income_list);
        this.tax_list = this.#find_items("incomeTax");
        this.taxes = indexByName(this.tax_list);
        this.incomeStream_list = this.#find_items("incomeStream");
        this.incomeStreams = indexByName(this.incomeStream_list);
        this.text_list = this.#find_items("text");
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
                    timeline.push({ date: item.end, action: "end", item });
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
    }

    get scenario(): this { return this; }

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
                .reduce((acc, a) => acc + a.value * (a.rate - 1), 0) +
                total(this.income_list)
            );
    }

    get total_retirement_income_with_fixed() {
        return Math.round(
            this.asset_list.reduce((acc, a) => acc + a.value * (a.rate - 1), 0) +
            this.income_list.reduce((acc, a) => acc + a.value, 0)
        );
    }

    get [Symbol.toStringTag]() {
        return `Scenario[${this.name}]`;
    }

    #find_items<T extends Type>(type: T, all: boolean = false): Array<ItemType<T>> {
        const items: Array<ItemType<T>> = [];
        this.data.forEach((r) => {
            if (r.type === type && (all || r.scenarios?.find((rs) => rs === this.name))) {
                items.push(construct(r as RowType<T>, type, this.data, this.#end_year));
            }
        });
        return items;
    }

    #find_item<T extends Type>(name: Name, type: T, all = false): ItemType<T> | null {
        const item = this.data.find(
            (r: RowType) =>
                r.name === name &&
                r.type === type &&
                (all || r.scenarios?.find((rs: ScenarioName) => rs === this.name))
        );
        if (item) {
            return construct(item as RowType<T>, type, this.data, this.#end_year);
        }
        return null;
    }

    #find_spouse(name: Name): IFPerson | null {
        const item = this.#find_item(name, 'person');
        if (!item) return null;
        const birth = item.birth ?? Throw(`Birth date for person ${name} is not specified`);
        const age = YEAR - birth.getUTCFullYear();
        const sex = item?.sex ?? Throw("Sex is not specified");
        const years = this.#end_year - YEAR;
        const categories = item?.categories ?? [];
        const scenarios = item?.scenarios ?? ['Default'];
        const row = {
            name,
            prettyName: item?.prettyName ?? name,
            type: 'person' as const,
            start: item?.start ?? TODAY,
            birth,
            sex,
            sort: item?.sort ?? 0,
            categories,
            scenarios,
            expectency: SS_2017[age]?.[sex].years,
            expectencies: range(0, years + 1)
                .map((y) => SS_2017[age + y]?.[sex].years)
                .asArray(),
            probabilities: this.#compute_probabilities(item)
        };
        const x =  construct(row, "person", this.data, this.#end_year);
        return x;
    }

    /**
     * Run the simulation for the scenario's period.
     * @returns
     */
    run() {
        const previous = this;
        return range(YEAR, this.#end_year + 1).reduce(
        ({ list, previous}: {list: Array<Snapshot>, previous: (Snapshot|Scenario)}, year: number) => {
            const snapshot = new Snapshot(this, year, previous);
            list.push(snapshot);
            return {
            list,
            previous: snapshot
            };
        },
        { list: [], previous } as {list: Array<Snapshot>, previous: (Snapshot|Scenario)}
        ).list;
    }

    #compute_probabilities(spouse: IFPerson) {
        if (!spouse) return undefined;
        const { birth, sex } = spouse;
        const age = TODAY.getUTCFullYear() - birth.getUTCFullYear();
        const years = this.#end_year - YEAR;
        let p = 1;
        return range(0, years + 1)
            .map((y) => {
                const nyear = new Date(YEAR + y, 0);
                p *= 1 - actuary(spouse, nyear)?.p ?? 0;
                return p;
            })
            .asArray();
    }
}


export const [isScenario, toScenario, asScenario] = classChecks(Scenario);
// Passed this way to avoid circular loading dependencies.
(StateMixin as any).asScenario = asScenario;
// And a simpler circular dependency:
(construct as any).Scenario = Scenario;
