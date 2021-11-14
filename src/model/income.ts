/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { CashFlow } from "./cashflow";
import { StateMixin } from "./state-mixin";
import { IFScenario, IIncome, ItemImpl, ItemState, RowType, Stepper, Type } from "../types";
import { classChecks } from "../utils";
import { CalendarStep } from "../calendar";
import { $$, $0, Money } from "../tagged";

/**
 * An income item. By default, annual, but can be constrained to a particular period of time.
 *
 *
 * **Key fields:**
 * * {@link value}
 */
export class Income extends CashFlow<'income'> implements IIncome {
    constructor(row: RowType<'income'>, scenario: IFScenario) {
        super(row, scenario);
    }

    *stepper<T extends Type>(start: CalendarStep): Stepper<'income'> {
        let amt: Money = this.value;
        let date = start.start;
        while (true) {
            const value = date >= this.start ? amt : $0;
            const payment = value;
            let next = yield { value, payment };
            amt = $$(this.value + next.value);
            date = next.date;
        }
    }
}



export class IncomeState extends StateMixin(Income) {
    constructor(row: ItemImpl<'income'>, scenario: IFScenario, state: ItemState<'income'>) {
        super(row, scenario, state);
    }
}
export const [isIncome, toIncome, asIncome] = classChecks(Income);
