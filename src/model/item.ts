/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Category, IItem, Name, RowType, ScenarioName, Type } from "../types";
import { TODAY } from "../calendar";
import { Temporal } from "../temporal";
import { Throw } from "../utils";

/**
 * Base class for all items. Holds all the common fields.
 */
export class Item<T extends Type> implements IItem<T> {
    readonly name: Name;
    readonly type: T;
    readonly start: Date;
    readonly end?: boolean;
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

    #temporal?: Temporal<this> = undefined;

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

    set temporal(value: Temporal<this>) {
        if (this.#temporal) throw new Error(`Cannot reset .temporal`);
        this.#temporal = value;
    }

    get temporal() {
        return this.#temporal ?? Throw(`.temporal has not been set.`);
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