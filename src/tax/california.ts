/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { UTC } from "../calendar";
import { asAge, iAge, $$, asTaxRate, asYear, $0, IAge } from "../tagged";
import { IFPerson } from "../types";
import { Throw } from "../utils";
import { lookupTax, TaxYearTables } from "./tax-util";

export const CALIFORNIA_TAX: TaxYearTables = ({
  2020: {
    year: asYear(2020),
    table: [
      { single: $$(0), married: $$(0), head: $$(0), rate: asTaxRate(0.01) },
      { single: $$(8932), married: $$(17864), head: $$(17864), rate: asTaxRate(0.02) },
      { single: $$(21175), married: $$(42350), head: $$(42353), rate: asTaxRate(0.04) },
      { single: $$(33421), married: $$(66842), head: $$(54597), rate: asTaxRate(0.06) },
      { single: $$(46394), married: $$(92788), head: $$(67569), rate: asTaxRate(0.08) },
      { single: $$(58634), married: $$(117268), head: $$(79812), rate: asTaxRate(0.093) },
      { single: $$(299508), married: $$(599016), head: $$(407329), rate: asTaxRate(0.103) },
      { single: $$(359407), married: $$(718814), head: $$(488796), rate: asTaxRate(0.113) },
      { single: $$(599012), married: $$(1198024), head: $$(814658), rate: asTaxRate(0.123) }
    ].sort((a, b) =>
      a.single < b.single ? 1 : a.single === b.single ? 0 : -1
    ),
    rates: {
        capitalGains: asTaxRate(0.5),
        socialSecurity: asTaxRate(0.85),
    },
    deductions: {
      single: {
        regular: $$(4601),
        senior: $$(122),
        dependent: $$(383),
        age: asAge(65)
      },
      married: {
        regular: $$(9202),
        senior: $$(248),
        dependent: $$(383),
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
      deductions,
      credits
    }) {
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
            $$(
                info.regular +
                (spouse1Age >= info.age ? info.senior ??  $0: $0) +
                (spouse2Age >= info.age ? info.senior ?? $0 : $0) +
                dependents * (info.dependent ?? $0)
            );
      deductions = $$(deductions ?? std_deductions);
      const agi = $$(income - deductions);
      return {
        year: this.year,
        income,
        sources: {
          regular: regular ?? $0,
          socialSecurity: socialSecurity ?? $0,
          capitalGains: capitalGains ?? $0
        },
        deductions,
        credits,
        std_deductions,
        agi,
        spouse1Age,
        spouse2Age,
        tax: $$(lookupTax(agi, status, this.table) - credits)
      };
    }
  },
  default: asYear(2020)
});
