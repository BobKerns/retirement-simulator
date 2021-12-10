/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Monetary } from "./monetary";
import { CalendarUnit } from "../calendar";
import { CashFlowType, ICashFlowItem, IFScenario, RowType } from "../types";
import { Throw } from "../utils";

/**
 * An expense or income; that is, money flowing in or out.
 */
export abstract class CashFlow<T extends CashFlowType> extends Monetary<T> implements ICashFlowItem<T> {
    paymentPeriod: CalendarUnit;
    constructor(row: RowType<T>, scenario: IFScenario) {
        super(row, scenario);
        const noPaymentPeriod = (this.end || this.type === 'transfer' || this.type === 'incomeTax');
        this.paymentPeriod = row.paymentPeriod ?? (noPaymentPeriod ? CalendarUnit.month : Throw(`Missing payment period in ${this.id}`));
    }
}
