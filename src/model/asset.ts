/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Assets and related.
 *
 * @module
 */

import { Monetary } from "./monetary";
import { StateMixin } from "./state-mixin";
import { asMoney, Rate } from "../tagged";
import { IAsset, IFScenario, ItemImpl, ItemState, RowType, SeriesName, Type } from "../types";
import { classChecks } from "../utils";
import { CalendarStep, CalendarUnit } from "../calendar";

/**
 * An item with a monetary value. If _growth_ is supplied and not equal to `1.0`, the asset value
 * will change by that factor each period (currently, always annually, pro-rated).
 *
 * **Key fields:**
 * * {@link value}
 * * {@link rate}
 * * {@link rateType}
 * * {@link paymentPeriod}
 */
export class Asset extends Monetary<'asset'> implements IAsset, ItemImpl<'asset'> {
    rate: Rate;
    rateType: CalendarUnit | SeriesName;
    paymentPeriod: CalendarUnit;
    constructor(row: RowType<'asset'>, scenario: IFScenario) {
        super(row, scenario);
        this.rate = row.rate ?? 0;
        this.rateType = row.rateType || CalendarUnit.year;
        this.paymentPeriod = row.paymentPeriod || CalendarUnit.year;
    }

    *states<T extends Type>(start: CalendarStep): Generator<ItemState<'asset'>, any, ItemState<'asset'>> {
        let item: ItemImpl<'asset'> | null = this as  ItemImpl<'asset'>;
        let step = start;
        let value = this.value;
        while (true) {
            value = asMoney(value * (1 + this.rate));
            const next = yield {item, step, value};
            step = next.step;
            value = next.value;
            item = (item.temporal.onDate(step.start) as this) ?? null;
            if (item === null) return;
        }
    }
}

export class AssetState extends StateMixin<'asset'>(Asset) {
    constructor(row: ItemImpl<'asset'>, scenario: IFScenario, state: ItemState<'asset'>) {
        super(row, scenario, state);
    }
}

export const [isAsset, toAsset, asAsset] = classChecks(Asset);
