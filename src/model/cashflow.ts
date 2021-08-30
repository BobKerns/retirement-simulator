/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Monetary } from "./monetary";
import { asRate, Rate } from "../tagged";
import { day_of_year, YEAR } from "../calendar";
import { START } from '../input';
import { CashFlowType, ICashFlowItem, IFScenario, RowType } from "../types";

/**
 * An expense or income; that is, money flowing in or out.
 */
export abstract class CashFlow<T extends CashFlowType> extends Monetary<T> implements ICashFlowItem<T> {
    fraction: Rate;
    constructor(row: RowType<T>, scenario: IFScenario) {
        super(row, scenario);
        this.fraction = this.#item_fraction();
    }

    /**
     * @internal
     * @returns The fraction of the year this applies to.
     */
    #item_fraction() {
        const this_year = YEAR;
        const next_year = YEAR + 1;
        const start = this.start ?? this.scenario?.start ?? START;
        const start_year = start.getUTCFullYear();
        const end = undefined // this.end;
        const end_year = undefined // end?.getUTCFullYear();
        return asRate(
            (start.getUTCFullYear() > next_year
            ? 0
            : start_year < this_year
            ? 1.0
            : (366 - day_of_year(start)) / 366) -
            (!end
            ? 0
            : end_year! > next_year
            ? 0
            : end_year! < this_year
            ? 1.0
            : 1 - day_of_year(end) / 366)
        );
    }
}