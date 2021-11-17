/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Run the simulation
 *
 * @module
 */

import { Sync } from "genutils";
import Heap from "heap";
import { END, START } from "../time";
import { calendarRange, CalendarStep } from "../calendar";
import { addSubSources, Scenario, ScenarioBase, Snapshot } from "../model";
import { $$ } from "../tagged";
import { ActionData, ActionItem, IItem, ItemImpl, ItemState, ItemStates, Sources, StateItem, Type, IncomeSourceType, TimeLineAction, TimeLineItem } from "../types";
import { entries, Throw } from "../utils";


const timelineOrder: { [k in TimeLineAction]: Number } = {
    begin: 0,
    receive: 1,
    withdraw: 2,
    pay: 3,
    end: 4
};

const actionCmp = (a: TimeLineAction, b: TimeLineAction) =>
    a === b
        ? 0
        : timelineOrder[a] < timelineOrder[b]
            ? 1
            : -1;

export const timelineCmp = (a: TimeLineItem, b: TimeLineItem) =>
    a.date.valueOf() < b.date.valueOf()
        ? -1
        : a.date.valueOf() === b.date.valueOf()
            ? (actionCmp(a.action, b.action)
                || (a.item.type < b.item.type
                    ? -1
                    : a.item.type === b.item.type
                        ? a.item.name < b.item.name
                            ? -1
                            : a.item.name === b.item.name
                                ? 0
                                : 1
                        : 1
                ))
            : 1;

export class Sim {
    scenario: Scenario;
    start: Date;
    end: Date;

    prerollStart: Date;

    #snapshots?: Snapshot[];
    /**
     * @internal
     */
    #timeline: Heap<TimeLineItem>;

    #timelineArray?: TimeLineItem[];

    states?: ItemStates;

    constructor(scenario: Scenario, start?: Date, end?: Date) {
        this.scenario = scenario;
        this.start = start ?? scenario.start ?? START;
        this.end = end ?? END;
        this.#timeline = new Heap(timelineCmp);
        this.prerollStart = scenario.items().reduce((a, i: IItem<Type>) => i.start < a ? i.start : a, this.start);
    }
    get snapshots() {
        return this.#runSim();
    }


    /**
     * Get the full timeline in sorted order as an array.
     */
    get timeline() {
        if (!this.#timelineArray)
        {
            this.#runSim();
            this.#timelineArray = this.#timeline.toArray();
        }
        return this.#timelineArray;
    }


    addTimeLine<A extends TimeLineAction>(action: A, date: Date, item: ActionItem<A>, data: ActionData<A>) {
        const tlItem: TimeLineItem<A> = { action, date, item, ...data };
        this.#timeline.insert(tlItem);
    }

    initStates(init: CalendarStep) {
        return this.scenario.items().reduce((states, i: ItemImpl<Type>) => {
            const item = i.temporal.onDate(init.start) ?? i;
            const generator = item.stepper(init);
            const nxt = generator.next();
            if (nxt.done) {
                return states;
            }
            const current = {
                date: init.start,
                id: item.id,
                ...nxt.value,
                type: item.type,
                item,
                step: init
            };
            states[i.id] = {
                generator,
                current,
                item
            };
            return states;
        },
            {} as ItemStates
        );
    }

    payExpenses(period: CalendarStep) {
        const allSources: Sources = {};
        for (const expense of this.scenario.expense_list) {
            const inStream = this.scenario.incomeStreams[expense.fromStream]
                ?? Throw(`There is no IncomeStream named ${expense.fromStream}`);
            const current = (this.states?.[expense.id]?.current) as ItemState<'expense'> | undefined;
            if (current && current.value) {
                const { amount, sources } = inStream.withdraw(current.value, expense.id, this.states!);
                addSubSources(allSources, sources);
                this.addTimeLine('pay', period.start, expense, { amount });
                current.value = $$(current.value - amount);
            }
        }
        for (const [id, amount] of entries(allSources)) {
            if (amount) {
                this.addTimeLine(
                    'withdraw', period.start,
                    this.states?.[id].item as IItem<IncomeSourceType>,
                    { amount }
                );
            }
        }
    }

    stepItemState<T extends Type>(itemState: StateItem<T>, step: CalendarStep): StateItem<T> | null {
        if (itemState) {
            const { current, generator, item } = itemState;
            if (item.start > step.start) {
                // Hasn't started yet.
                return itemState;
            } else {
                if (generator) {
                    const nitem = item.temporal.onDate(step.start) as never as ItemImpl<T>;
                    if (!nitem) {
                        // This item has terminated.
                        generator.return();
                        itemState.generator = null;
                    } else if (nitem !== item) {
                        // The item has stepped to a new set of values.
                        // Reinitialize
                        itemState.item = nitem;
                        generator.return();
                        itemState.generator = nitem.stepper(step);
                    }
                    return itemState;
                }
            }
        }
        return null;
    }

    /**
     * Walk a single item through its internal evolution.
     * This includes both rate-base calculations and multiple time-based entries
     * @param step The step for this update
     * @param list List of items to update.
     * @internal
     */
    updateState<T extends Type, I extends ItemImpl<T> = ItemImpl<T>>(
        states: ItemStates,
        step: CalendarStep,
        item: I
    ) {
        const itemState = this.stepItemState(states[item.id] as StateItem<T>, step);
        if (itemState) {
            const { item, generator, current } = itemState;
            if (generator) {
                // Don't step until we reach the start of this item.
                if (item.start <= step.start) {
                    const next = generator.next(current);
                    if (next.done) {
                        delete states[item.id];
                    } else {
                        const nextState = {
                            date: step.start,
                            id: item.id,
                            ...next.value,
                            type: item.type,
                            item,
                            step
                        } as ItemState<T>;
                        itemState.current = nextState;
                    }
                }
            } else {
                this.addTimeLine('end', step.start, item, {});
                delete states[item.id];
            }
        } else {
            this.addTimeLine('end', step.start, item, {});
            delete states[item.id];
        }
    }

    /**
     * Walk each item through their internal evolution.
     * This includes both rate-base calculations and multiple time-based entries
     * @param step The step for this update
     * @param list List of items to update.
     * @internal
     */
    updateStates<T extends Type, L extends Iterable<ItemImpl<T>>>(
        states: ItemStates,
        step: CalendarStep,
        list: L
    ) {
        for (const item of list) {
           this.updateState<T>(states, step, item);
        }
    }

    copyStates(states: ItemStates): ItemStates {
        return entries(states).reduce((acc, [id, s]) => (acc[id] = s, acc), {} as ItemStates);
    }

    #runSim(): Snapshot[] {
        if (this.#snapshots) {
            return this.#snapshots;
        }
        const self = this;
        const scenario = this.scenario;
        const start = this.start;
        const end = this.end;
        const range = calendarRange(self.prerollStart, end, { month: 1 });
        const init = range[Symbol.iterator]().next().value ?? Throw(`Empty time range`);
        const states = this.states = this.initStates(init);
        function* runSim() {
            let previous: ScenarioBase = scenario;
            for (const period of range) {
                if (period.start < start) {
                    // During preroll, we just advance the states to the current time.
                    self.updateStates(states, period, scenario);
                } else {
                    // Regular Operation
                    self.updateStates(states, period, scenario);
                    self.payExpenses(period);
                    yield previous = new Snapshot(scenario, period, previous, self.copyStates(states));
                }
            }
        }
        return this.#snapshots = Sync.enhance(runSim()).asArray();
    }
}

export const runSim = (scenario: Scenario, start?: Date, end?: Date) => {
   return new Sim(scenario, start, end);
}