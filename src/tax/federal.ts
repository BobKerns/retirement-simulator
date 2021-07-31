/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Throw } from "../utils";
import { asAge, asIAge, asMoney, asTaxRate, asYear } from "../tagged";
import { lookupTax, TaxYearTable, TaxYearTables } from "./tax-util";

export const FEDERAL_TAX: TaxYearTables = {
    2021: {
        year: asYear(2021),
        table: [
            { single: asMoney(0), married: asMoney(0), rate: asTaxRate(0.1) },
            { single: asMoney(9950), married: asMoney(19900), rate: asTaxRate(0.12) },
            { single: asMoney(40525), married: asMoney(81050), rate: asTaxRate(0.22) },
            { single: asMoney(86375), married: asMoney(172750), rate: asTaxRate(0.24) },
            { single: asMoney(164925), married: asMoney(329850), rate: asTaxRate(0.32) },
            { single: asMoney(209425), married: asMoney(418850), rate: asTaxRate(0.35) },
            { single: asMoney(523600), married: asMoney(628300), rate: asTaxRate(0.37) }
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
                regular: asMoney(12550),
                senior: asMoney(1700),
                age: asAge(65)
            },
            married: {
                regular: asMoney(25100),
                senior: asMoney(1350),
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
            deductions
    }   ) {
            const income =
                asMoney((regular ?? 0) +
                 (socialSecurity ?? 0) * (this.rates.socialSecurity ?? 1) +
                 (capitalGains ?? 0) * (this.rates.capitalGains ?? 1)
                );
            const info = this.deductions[status]
                ?? Throw(`No data for filing status ${status}`);
            const spouse1Age = spouse1.iage(year);
            const spouse2Age = spouse2?.iage(year) ?? asIAge(0);
            const std_deductions =
                asMoney(info.regular +
                    (spouse1Age >= info.age ? info.senior ?? 0: 0) +
                    (spouse2Age >= info.age ? info.senior ?? 0 : 0));
            const agi = asMoney(income - (deductions ?? std_deductions));
            const zero = asMoney(0);
            return {
                year: this.year,
                income,
                sources: {
                    regular: regular ?? zero,
                    socialSecurity: socialSecurity ?? zero,
                    capitalGains: capitalGains ?? zero
                },
                deductions: deductions ?? std_deductions,
                std_deductions,
                agi,
                spouse1Age,
                spouse2Age,
                tax: lookupTax(agi, status, this.table)
            };
        }
    },
    default: asYear(2021)
};