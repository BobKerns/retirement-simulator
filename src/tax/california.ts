/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { asAge, asIAge, asMoney, asTaxRate, asYear } from "../tagged";
import { Throw } from "../utils";
import { lookupTax, TaxYearTables } from "./tax-util";

export const CALIFORNIA_TAX: TaxYearTables = ({
  2020: {
    year: asYear(2020),
    table: [
      { single: asMoney(0), married: asMoney(0), head: asMoney(0), rate: asTaxRate(0.01) },
      { single: asMoney(8932), married: asMoney(17864), head: asMoney(17864), rate: asTaxRate(0.02) },
      { single: asMoney(21175), married: asMoney(42350), head: asMoney(42353), rate: asTaxRate(0.04) },
      { single: asMoney(33421), married: asMoney(66842), head: asMoney(54597), rate: asTaxRate(0.06) },
      { single: asMoney(46394), married: asMoney(92788), head: asMoney(67569), rate: asTaxRate(0.08) },
      { single: asMoney(58634), married: asMoney(117268), head: asMoney(79812), rate: asTaxRate(0.093) },
      { single: asMoney(299508), married: asMoney(599016), head: asMoney(407329), rate: asTaxRate(0.103) },
      { single: asMoney(359407), married: asMoney(718814), head: asMoney(488796), rate: asTaxRate(0.113) },
      { single: asMoney(599012), married: asMoney(1198024), head: asMoney(814658), rate: asTaxRate(0.123) }
    ].sort((a, b) =>
      a.single < b.single ? 1 : a.single === b.single ? 0 : -1
    ),
    rates: {
        capitalGains: asTaxRate(0.5),
        socialSecurity: asTaxRate(0.85),
    },
    deductions: {
      single: {
        regular: asMoney(4601),
        senior: asMoney(122),
        dependent: asMoney(383),
        age: asAge(65)
      },
      married: {
        regular: asMoney(9202),
        senior: asMoney(248),
        dependent: asMoney(383),
        age: asAge(65)
      }
    },
    calculate({
      income: {
          regular,
        socialSecurity,
        capitalGains
      },
      status,
      spouse1,
      spouse2,
      year,
      dependents = 0,
      deductions
    }) {
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
            asMoney(
                info.regular +
                (spouse1Age >= info.age ? info.senior ??  0: 0) +
                (spouse2Age >= info.age ? info.senior ?? 0 : 0) +
                dependents * (info.dependent ?? 0)
            );
      deductions = asMoney(deductions ?? std_deductions);
      const agi = asMoney(income - deductions);
    const zero = asMoney(0);
      return {
        year: this.year,
        income,
        sources: {
          regular: regular ?? zero,
          socialSecurity: socialSecurity ?? zero,
          capitalGains: capitalGains ?? zero
        },
        deductions,
        std_deductions,
        agi,
        spouse1Age,
        spouse2Age,
        tax: lookupTax(agi, status, this.table)
      };
    }
  },
  default: asYear(2020)
});