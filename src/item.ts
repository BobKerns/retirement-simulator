/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Category, IItem, Name, RowType, ScenarioName, Type } from "./types";
import { TODAY } from "./calendar";

/**
 * Base class for all items. Holds all the common fields.
 */
export class Item<T extends Type> implements IItem<T> {
    readonly name: Name;
    readonly type: T;
    readonly start: Date;
    readonly end?: Date;
    readonly categories: Category[];
    readonly scenarios: ScenarioName[];
    notes?: string;
    prettyName: string;
    /**
     * @internal
     */
    #tag?: string;

    /**
     * Sort order
     */
    sort: number;

    constructor(row: RowType<T>) {
        this.type = row.type;
        this.name = row.name;
        this.prettyName = row.prettyName ?? row.name;
        this.start = row.start ?? TODAY;
        this.end = row.end;
        this.categories = row.categories ?? [];
        this.scenarios = row.scenarios?.length ? row.scenarios : ['Default'];
        this.notes = row.notes;
        this.sort = Number(row.sort || 0)

    }

    /**
     * Tag instances with the type and name for easy recognition.
     * @internal
     */
    get [Symbol.toStringTag]() {
        try {
            return (
                this.#tag ?? (this.#tag = `${this.constructor.name}[${this.name}]`)
            );
        } catch {
            return `${this.constructor.name}.prototype`;
        }
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