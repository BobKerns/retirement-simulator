/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { CashFlow } from "./cashflow";
import { StateMixin } from "./state-mixin";
import { StateCode } from "../states";
import { IFScenario, IIncomeTax, ItemImpl, ItemState, RowType } from "../types";
import { classChecks } from "../utils";

/**
 * A tax on income, state or federal.
 */
export class IncomeTax extends CashFlow<'incomeTax'> implements IIncomeTax {
    readonly state: StateCode;
    constructor(row: RowType<'incomeTax'>) {
        super(row);
        this.state = row.state;
    }
}


export class IncomeTaxState extends StateMixin(IncomeTax) {
    constructor(row: ItemImpl<'incomeTax'>, scenario: IFScenario, state: ItemState<'incomeTax'>) {
        super(row, scenario, state);
    }
}
export const [isIncomeTax, toIncomeTax, asIncomeTax] = classChecks(IncomeTax);
