/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { IExpense, IFScenario, TransferName, ItemImpl, ItemState, RowType, SimContext, Stepper, Type } from "../types";
import { CashFlow } from "./cashflow";
import { classChecks, Throw } from "../utils";
import { StateMixin } from "./state-mixin";
import { CalendarStep, CalendarUnit } from "../calendar";
import { convertPeriods } from "../sim/interest";
import { $$, $0 } from "../tagged";

/**
 * A flow of money out.
 *
 * The `from` parameter must be specified; it is the other end of the flow, where the money to
 * pay the expense comes from (a {@link Transfer}).
 *
 * **Key fields:**
 * * {@link value}
 * * {@link from}
 */
export class Expense extends CashFlow<'expense'> implements IExpense {
    from: TransferName;
    constructor(row: RowType<'expense'>, scenario: IFScenario) {
        super(row, scenario);
        this.from = row.from ?? Throw(`from must be specified for ${this.name}.`);
    }
    *stepper<T extends Type>(start: CalendarStep, ctx: SimContext): Stepper<'expense'> {
        let amt = convertPeriods(this.value, this.paymentPeriod, CalendarUnit.month);
        let date = start.start;
        let value = $0;
        while (true) {
            value = $$(value + (date >= this.start ? amt : $0));
            const payment = value;
            ctx.addTimeLine('pay', date, this, { amount: payment, balance: value });
            const next = yield { value, payment };
            value = next.value;
            date = next.date;
        }
    }
}

export class ExpenseState extends StateMixin(Expense) {
    constructor(row: ItemImpl<'expense'>, scenario: IFScenario, state: ItemState<'expense'>) {
        super(row, scenario, state);
    }
}
export const [isExpense, toExpense, asExpense] = classChecks(Expense);
