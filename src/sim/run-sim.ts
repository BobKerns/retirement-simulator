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

import { EnhancedGenerator, Sync } from "genutils";
import { calendarRange, CalendarStep } from "../calendar";
import { Scenario, ScenarioBase, Snapshot } from "../model";
import { asMoney } from "../tagged";
import { Id, IItem, ItemImpl, ItemState, ItemStates, StateItem, Type } from "../types";
import { Throw } from "../utils";

export const initStates = (scenario: Scenario, init: CalendarStep) =>
    scenario.items().reduce((states, i: ItemImpl<Type>) => {
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

export const stepItemState = <T extends Type>(itemState: StateItem<T>, step: CalendarStep): StateItem<T> | null => {
    if (itemState) {
        const { current, generator, item } = itemState;
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
    return null;
};

/**
 * Walk each itewm through their internal evolution.
 * This includes both rate-base calculations and multiple time-based entries
 * @param step The step for this update
 * @param list List of items to update.
 * @internal
 */
const updateState = <T extends Type, L extends Iterable<ItemImpl<T>>>(states: ItemStates, step: CalendarStep, list: L) => {
    for (const i of list) {
        const itemState = stepItemState(states[i.id] as StateItem<T>, step);
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
                delete states[item.id];
            }
        } else {
            delete states[i.id];
        }
    }
};

const payExpenses = (scenario: Scenario, states: ItemStates) => {
    for (const expense of scenario.expense_list) {
        const inStream = scenario.incomeStreams[expense.fromStream]
            ?? Throw(`There is no IncomeStream named ${expense.fromStream}`);
        const current = (states[expense.id]?.current) as ItemState<'expense'> | undefined;
        if (current) {
            const used = inStream.withdraw(current.value, expense.id, states);
            current.value = asMoney(current.value - used);
        }
    }
}

export const runSim = (scenario: Scenario, start: Date, end: Date): EnhancedGenerator<Snapshot, void, void> => {
    function *runSim() {
        const prerollStart = scenario.items().reduce((a, i: IItem<Type>) => a < i.start ? i.start : a, start);
        const range = calendarRange(prerollStart, end, { month: 1 });
        const init = range[Symbol.iterator]().next().value ?? Throw(`Empty time range`);
        const states: ItemStates = initStates(scenario, init);
        let previous: ScenarioBase = scenario;
        for (const period of range) {
            if (period.start < start) {
                // During preroll, we just advance the states to the current time.
                updateState(states, period, scenario);
            } else {
                // Regular Operation
                updateState(states, period, scenario);
                payExpenses(scenario, states);
                yield previous = new Snapshot(scenario, period, previous, states);
            }
        }
    }
    return Sync.enhance(runSim());
}
