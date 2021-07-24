/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Item } from "./item";
import { Monetary } from "./monetary";
import { IAsset, Row } from "./types";

export class Asset extends Monetary<'asset'> implements IAsset {
    growth: number;
    constructor(row: Row<'asset'>) {
        super(row);
        this.growth = row.growth ?? 1;
    }
}
