/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { MonetaryType, IMonetaryItem } from ".";
import { Item } from "./item";
import { Name, Row } from "./types";

/**
 * An item with a monetary value, supplied as `value`.
 */
export class Monetary<T extends MonetaryType> extends Item<T> implements IMonetaryItem<T> {
    value: number;
    constructor(row: Row<T>) {
        super(row);
        this.type = row.type;
        this.value = row.value;
    }
}