/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { IExpense, IFScenario, IncomeStreamName, ItemImpl, ItemState, RowType, Type } from "../types";
import { CashFlow } from "./cashflow";
import { classChecks, Throw } from "../utils";
import { StateMixin } from "./state-mixin";
import { CalendarStep, CalendarUnit } from "../calendar";
import { convertPeriods } from "../sim/interest";

/**
 * A flow of money out.
 *
 * The `fromStream` parameter must be specified; it is the other end of the flow, where the money to
 * pay the expense comes from (an {@link IncomeStream}).
 *
 * **Key fields:**
 * * {@link value}
 * * {@link fromStream}
 */
export class Expense extends CashFlow<'expense'> implements IExpense {
    fromStream: IncomeStreamName;
    constructor(row: RowType<'expense'>, scenario: IFScenario) {
        super(row, scenario);
        this.fromStream = row.fromStream ?? Throw(`fromStream must be specified for ${this.name}.`);
    }
    *step<T extends Type>(start: CalendarStep): Generator<ItemState<'expense'>, any, ItemState<'expense'>> {
        let item: ItemImpl<'expense'> | null = this as  ItemImpl<'expense'>;
        let step = start;
        let value = convertPeriods(this.value, this.paymentPeriod, CalendarUnit.month);
        while (true) {
            const next = yield this.makeState(step, { value });
            if (step.start >= this.start) {
                step = next.step;
                value = next.value;
                item = (item.temporal.onDate(step.start) as this) ?? null;
                if (item === null) return;
            }
        }
    }
}

export class ExpenseState extends StateMixin(Expense) {
    constructor(row: ItemImpl<'expense'>, scenario: IFScenario, state: ItemState<'expense'>) {
        super(row, scenario, state);
    }
}
export const [isExpense, toExpense, asExpense] = classChecks(Expense);
