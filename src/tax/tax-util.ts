/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Throw } from "../utils";
import { Person } from "../model";
import { Age, asMoney, IAge, Money, TaxRate, Year } from "../tagged";

export type TaxStatus = 'single' | 'married' | 'separately' | 'head';

export type TaxTableItem = {
    [k in TaxStatus]?: Money;
} & {
    rate: TaxRate;
};

/**
 * Different age groups often have different thresholds.
 */
type AgeGroups = {
    regular: Money,
    senior?: Money,
    dependent?: Money,
    age: Age
};

export type AgeGroup = Exclude<keyof AgeGroups, 'age'>;

type Deductions = {
    [k in TaxStatus]?: AgeGroups;
};

/**
 * The basic categories of income.
 */
interface TaxIncome {
    regular?: Money;
    socialSecurity?: Money;
    capitalGains?: Money;
}

export type TaxIncomeCategory = keyof TaxIncome;

/**
 * Data for computing taxes.
 */
export interface TaxData  {
    income: TaxIncome;
    deductions: Money;
    year: Year;
    status: TaxStatus;
    spouse1: Person;
    spouse2?: Person;
    dependents?: number
}

/**
 * Detailed results of computing taxes.
 */
export interface TaxResult {
    year: Year;
    income: Money;
    agi: Money;
    sources: TaxIncome;
    deductions: Money;
    std_deductions: Money;
    spouse1Age: IAge;
    spouse2Age: IAge;
    tax: Money;
}

/**
 * The calculation for a {@link TaxYearTable}. The table is in `this`.
 */
export type TaxCalculation = (data: TaxData) => TaxResult;

/**
 * Tax table data for a particular year.
 */
export interface TaxYearTable {
    year: Year;
    table: TaxTableItem[];
    rates: {
        [k in TaxIncomeCategory]?: TaxRate;
    };
    deductions: Deductions,
    calculate: TaxCalculation;
}

/**
 * Tax table data for multiple years.
 */
export interface TaxYearTables {
    [year: number]: TaxYearTable;
    default: Year;
}

/**
 * This looks up a tax in a classic federal-style tax table.
 * @param income
 * @param status
 * @param table
 * @returns
 */
export const lookupTax = (income: Money, status: TaxStatus, table: TaxTableItem[]) => {
  let remaining: number = income;
  let tax = 0;
  for (const line of table) {
    const threshold = line[status] ?? Throw(`No data for status ${status}.`);
    const atRate = remaining - threshold;
    if (atRate > 0) {
      tax += atRate * line.rate;
      remaining -= atRate;
    }
  }
  return asMoney(tax);
};
