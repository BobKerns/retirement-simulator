/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Category, IItem, Name, Row, ScenarioName, Type } from "./types";
import { TODAY } from "./time";

/**
 * Base class for all items. Holds all the common fields.
 */
export class Item<T extends Type> implements IItem<T> {
    name: Name;
    type: T;
    start: Date;
    end?: Date;
    categories: Category[];
    scenarios: ScenarioName[];
    notes?: string;
    prettyName: string;
    #tag?: string;
    sort: number;

    constructor(row: Row<T>) {
        this.type = row.type;
        this.name = row.name;
        this.prettyName = row.prettyName ?? row.name;
        this.start = row.start ?? TODAY;
        this.end = row.end;
        this.categories = row.categories ?? [];
        this.scenarios = row.scenarios?.length ? row.scenarios : ['Default'];
        this.notes = row.notes;
        this.sort = Number(row.sort) ?? 0
    }

    /**
     * Tag instances with the type and name for easy recognition.
     */
    get [Symbol.toStringTag]() {
      return (
        this.#tag ?? (this.#tag = `${this.constructor.name}[${this.name} ${this.name}]`)
      );
    }

    /**
     * Determine if an item is in a specified category.
     * @param category
     * @returns
     */
    hasCategory(category: Category): boolean {
        return !!this.categories.find(s => s === category);
    }

    /**
     * Determine if an item is in a specified scenario.
     */
    inScenario(scenario: ScenarioName): boolean {
        return !!this.scenarios.find(s => s === scenario);
    }
}