/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Monetary } from "./monetary";
import { IAsset, Row } from "./types";

/**
 * An item with a monetary value. If _growth_ is supplied and not equal to `1.0`, the asset value
 * will change by that factor each period (currently, always annually, pro-rated).
 */
export class Asset extends Monetary<'asset'> implements IAsset {
    growth: number;
    constructor(row: Row<'asset'>) {
        super(row);
        this.growth = row.growth ?? 1;
    }
}
