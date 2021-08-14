/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { CalendarUnit } from "../enums";
import { Monetary } from "./monetary";
import { StateMixin } from "./state-mixin";
import { Rate } from "../tagged";
import { IAsset, RowType, SeriesName } from "../types";
import { classChecks } from "../utils";

/**
 * An item with a monetary value. If _growth_ is supplied and not equal to `1.0`, the asset value
 * will change by that factor each period (currently, always annually, pro-rated).
 */
export class Asset extends Monetary<'asset'> implements IAsset {
    rate: Rate;
    rateType: CalendarUnit | SeriesName;
    paymentPeriod: CalendarUnit;
    constructor(row: RowType<'asset'>) {
        super(row);
        this.rate = row.rate ?? 1;
        this.rateType = row.rateType || CalendarUnit.year;
        this.paymentPeriod = row.paymentPeriod || CalendarUnit.year;
    }
}

export class AssetState extends StateMixin(Asset) {
    constructor(row: RowType<'asset'>) {
        super(row);
    }
}
export const [isAsset, toAsset, asAsset] = classChecks(Asset);
