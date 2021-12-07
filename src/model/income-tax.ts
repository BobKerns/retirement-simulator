/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { CashFlow } from "./cashflow";
import { StateMixin } from "./state-mixin";
import { StateCode, TAX_TABLES, TaxResult, TaxData, TaxStatus } from "../tax";
import { IFScenario, IFPerson, IIncomeTax, ItemImpl, ItemState, RowType, SimContext, Stepper, IncomeStreamName } from "../types";
import { classChecks, Throw } from "../utils";
import { CalendarStep, UTC } from "../calendar";
import { $$, $0, $div, $mul, iAge, IAge, Year } from '../tagged';

/**
 * A tax on income, state or federal.
 */
export class IncomeTax extends CashFlow<'incomeTax'> implements IIncomeTax {
    readonly state: StateCode;
    readonly fromStream: IncomeStreamName;
    readonly filingStatus: TaxStatus;
    constructor(row: RowType<'incomeTax'>, scenario: IFScenario) {
        super(row, scenario);
        this.state = row.state;
        this.fromStream = row.fromStream;
        this.filingStatus = row.filingStatus;
    }

    *stepper(start: CalendarStep, ctx: SimContext): Stepper<'incomeTax'> {
        let step = start;
        let date = start.start;
        const yearEnd = UTC(date.getUTCFullYear(), 11, 31);
        const age = (p: IFPerson | undefined) => p ? iAge(p.age(yearEnd)) : 0 as IAge;
        let spouse1 = this.scenario.spouse1;
        let spouse2 = this.scenario.spouse2 ?? undefined;
        let value: TaxResult = {
            year: start.start.getUTCFullYear() as Year,
            income: $0,
            agi: $0,
            sources: {
                regular: $0,
                capitalGains: $0,
                socialSecurity: $0
            },
            deductions: $0,
            credits: $0,
            std_deductions: $0,
            spouse1Age: age(spouse1),
            spouse2Age: age(spouse2),
            tax: $0
        };
        while (true) {
            const next = yield value;
            const taxtables = TAX_TABLES[this.state] ?? Throw(`No tax table for ${this.state}`);
            const table = taxtables[taxtables.default];
            const data: TaxData = {
                year: next.year,
                income: {
                    regular: $mul(next.income, 12),
                    capitalGains: $0,
                    socialSecurity: $0
                },
                deductions: $mul(next.deductions, 12),
                credits: $mul(next.credits, 12),
                status: this.filingStatus,
                spouse1,
                spouse2
            };
            value = table.calculate(data);
            value = {...value, income: $div(value.income, 12)}
            step = next.step;
            date = next.date;
        }
    }
}


export class IncomeTaxState extends StateMixin(IncomeTax) {
    constructor(row: ItemImpl<'incomeTax'>, scenario: IFScenario, state: ItemState<'incomeTax'>) {
        super(row, scenario, state);
    }
}
export const [isIncomeTax, toIncomeTax, asIncomeTax] = classChecks(IncomeTax);
