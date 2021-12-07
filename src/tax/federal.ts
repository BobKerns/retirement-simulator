/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Throw } from "../utils";
import { asAge, $$, asTaxRate, asYear, $0, iAge, IAge } from "../tagged";
import { lookupTax, TaxYearTable, TaxYearTables } from "./tax-util";
import { IFPerson } from "../types";
import { UTC } from '../calendar';

export const FEDERAL_TAX: TaxYearTables = {
    2021: {
        year: asYear(2021),
        table: [
            { single: $$(0), married: $$(0), rate: asTaxRate(0.1) },
            { single: $$(9950), married: $$(19900), rate: asTaxRate(0.12) },
            { single: $$(40525), married: $$(81050), rate: asTaxRate(0.22) },
            { single: $$(86375), married: $$(172750), rate: asTaxRate(0.24) },
            { single: $$(164925), married: $$(329850), rate: asTaxRate(0.32) },
            { single: $$(209425), married: $$(418850), rate: asTaxRate(0.35) },
            { single: $$(523600), married: $$(628300), rate: asTaxRate(0.37) }
        ].sort((a, b) =>
            a.single < b.single ? 1 : a.single === b.single ? 0 : -1
        ),
        rates: {
            regular: asTaxRate(1),
            capitalGains: asTaxRate(0.5),
            socialSecurity: asTaxRate(0.85)
        },
        deductions: {
            single: {
                regular: $$(12550),
                senior: $$(1700),
                age: asAge(65)
            },
            married: {
                regular: $$(25100),
                senior: $$(1350),
                age: asAge(65)
            }
        },
        calculate(this: TaxYearTable, {
            income: {
                regular,
                socialSecurity,
                capitalGains
                },
            status,
            spouse1,
            spouse2,
            year,
            deductions,
            credits
    }   ) {
            const income =
                $$((regular ?? $0) +
                 (socialSecurity ?? $0) * (this.rates.socialSecurity ?? 1) +
                 (capitalGains ?? $0) * (this.rates.capitalGains ?? 1)
                );
            const info = this.deductions[status]
                ?? Throw(`No data for filing status ${status}`);
            const yearEnd = UTC(year, 11, 31);
            const age = (p: IFPerson | undefined) => p ? iAge(p.age(yearEnd)) : 0 as IAge;
            const spouse1Age = age(spouse1);
            const spouse2Age = age(spouse2);
            const std_deductions =
                $$(info.regular +
                    (spouse1Age >= info.age ? info.senior ?? $0: $0) +
                    (spouse2Age >= info.age ? info.senior ?? $0 : $0));
            const agi = $$(income - (deductions ?? std_deductions));
            return {
                year: this.year,
                income,
                sources: {
                    regular: regular ?? $0,
                    socialSecurity: socialSecurity ?? $0,
                    capitalGains: capitalGains ?? $0
                },
                deductions: deductions ?? std_deductions,
                std_deductions,
                agi,
                spouse1Age,
                spouse2Age,
                credits,
                tax: $$(lookupTax(agi, status, this.table) - credits)
            };
        }
    },
    default: asYear(2021)
};
