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
import { as, asMoney, Money } from "../tagged";

/**
 * An income item. By default, annual, but can be constrained to a particular period of time.
 */
export class Income extends CashFlow<'income'> implements IIncome {
    constructor(row: RowType<'income'>, scenario: IFScenario) {
        super(row, scenario);
    }

    *states<T extends Type>(start: CalendarStep): Generator<ItemState<'income'>, any, ItemState<'income'>> {
        let item: ItemImpl<'income'> | null = this as  ItemImpl<'income'>;
        let step = start;
        let value: Money = as(0);
        while (true) {
            value = asMoney(value + this.value);
            let next = yield {item, step, value};
            step = next.step;
            value = next.value;
            if (step.start < this.start) {
                next = yield {item, step, value};
            } else {
                item = (item.temporal.onDate(step.start) as this) ?? null;
                if (item === null) return;
            }
        }
    }
}



export class IncomeState extends StateMixin(Income) {
    constructor(row: ItemImpl<'income'>, scenario: IFScenario, state: ItemState<'income'>) {
        super(row, scenario, state);
    }
}
export const [isIncome, toIncome, asIncome] = classChecks(Income);
