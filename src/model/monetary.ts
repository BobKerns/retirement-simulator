/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Item } from "./item";
import { Money } from "../tagged";
import { RowType, MonetaryType, IMonetaryItem, IFScenario } from "../types";

/**
 * An item with a monetary value, supplied as `value`.
 */
export class Monetary<T extends MonetaryType> extends Item<T> implements IMonetaryItem<T> {
    readonly value: Money;
    constructor(row: RowType<T>, scenario: IFScenario) {
        super(row, scenario);
        this.value = row.value;
    }
}