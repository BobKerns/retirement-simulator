/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { CashFlow } from "./cashflow";
import { StateMixin } from "./state-mixin";
import { IFScenario, IIncome, ItemImpl, ItemState, RowType, Type } from "../types";
import { classChecks } from "../utils";
import { CalendarStep } from "../calendar";
import { $$, Money } from "../tagged";
import { StepperState } from "..";

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

    *stepper<T extends Type>(start: CalendarStep): Generator<StepperState<'income'>, any, ItemState<'income'>> {
        let value: Money = this.value;
        while (true) {
            let next = yield { value };
            value = $$(this.value + next.value);
        }
    }
}



export class IncomeState extends StateMixin(Income) {
    constructor(row: ItemImpl<'income'>, scenario: IFScenario, state: ItemState<'income'>) {
        super(row, scenario, state);
    }
}
export const [isIncome, toIncome, asIncome] = classChecks(Income);
