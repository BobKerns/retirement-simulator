/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Monetary } from "./monetary";
import { day_of_year, TODAY, YEAR } from "./time";
import { CashFlowType, ICashFlowItem, Row } from "./types";

export abstract class CashFlow<T extends CashFlowType> extends Monetary<T> implements ICashFlowItem<T> {
    fraction: number;
    constructor(row: Row<T>) {
        super(row);
        this.fraction = this.#item_fraction();
    }

    /**
     *
     * @returns The fraction of the year this applies to.
     */
    #item_fraction() {
        const this_year = YEAR;
        const next_year = YEAR + 1;
        const start = this.start ?? TODAY;
        const start_year = start.getUTCFullYear();
        const end = this.end;
        const end_year = end?.getUTCFullYear();
        return (
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