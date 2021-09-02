/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { CashFlow } from "./cashflow";
import { StateMixin } from "./state-mixin";
import { StateCode } from "../states";
import { IFScenario, IIncomeTax, ItemImpl, ItemState, RowType, Type } from "../types";
import { classChecks } from "../utils";
import { CalendarStep } from "../calendar";

/**
 * A tax on income, state or federal.
 */
export class IncomeTax extends CashFlow<'incomeTax'> implements IIncomeTax {
    readonly state: StateCode;
    constructor(row: RowType<'incomeTax'>, scenario: IFScenario) {
        super(row, scenario);
        this.state = row.state;
    }

    *states<T extends Type>(start: CalendarStep): Generator<ItemState<'incomeTax'>, any, ItemState<'incomeTax'>> {
        let item: ItemImpl<'incomeTax'> | null = this as ItemImpl<'incomeTax'>;
        let step = start;
        while (true) {
            const next = yield { item, step };
            step = next.step;
            item = (item.temporal.onDate(step.start) as this) ?? null;
            if (item === null) return;
        }
    }
}


export class IncomeTaxState extends StateMixin(IncomeTax) {
    constructor(row: ItemImpl<'incomeTax'>, scenario: IFScenario, state: ItemState<'incomeTax'>) {
        super(row, scenario, state);
    }
}
export const [isIncomeTax, toIncomeTax, asIncomeTax] = classChecks(IncomeTax);
