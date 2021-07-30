/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Asset } from "./asset";
import { Expense } from "./expense";
import { Income } from "./income";
import { IncomeStream } from "./income-stream";
import { IncomeTax } from "./income-tax";
import { Loan } from "./loan";
import { Person } from "./person";
import { Scenario } from "./scenario";
import { StateCode } from "./states";
import { Money, Rate, Unit } from "./tagged";
import { TextItem } from "./text";

export type Name = string;
export type AssetName = Name;
export type IncomeName = Name;
export type LoanName = Name;
export type ExpenseName = Name;
export type IncomeStreamName = Name;
export type ScenarioName = Name;

export interface Named {
    name: Name;
    prettyName?: string;
}

export interface NamedIndex<T extends Named> {
    [k: string]: T;
}

export type BalanceType = 'asset' | 'loan';
export type CashFlowType = 'income' | 'expense' | 'incomeStream' | 'incomeTax';
export type MonetaryType = BalanceType | CashFlowType;
export type Type = MonetaryType | 'person' | 'text' | 'scenario';

type ItemTypes = {
    asset: Asset;
    loan: Loan;
    income: Income;
    expense: Expense;
    person: Person;
    text: TextItem;
    incomeStream: IncomeStream;
    incomeTax: IncomeTax;
    scenario: Scenario;
};

type RowTypes = {
    asset: IAsset;
    loan: ILoan;
    income: IIncome;
    expense: IExpense;
    person: IPerson;
    text: IText;
    incomeStream: IIncomeStream;
    incomeTax: IIncomeTax;
    scenario: IScenario;
};

export type ItemType<T extends Type> = (ItemTypes)[T];


export type Category = string;

/**
 * Sex for actuarial purposes.
 */
export type Sex = 'male' | 'female';

/**
 * A basic data item, with a value.
 */
export interface IItem<T extends Type = Type> extends Named {
    type: T;
    sort: number,
    start?: Date;
    end?: Date;
    categories: Category[];
    scenarios: ScenarioName[];
    notes?: string;
}

export interface IScenarioBase extends IItem<'scenario'> {
    asset_list: Array<Asset>;
    loan_list: Array<Loan>;
    income_list: Array<Income>;
    expense_list: Array<Expense>;
    tax_list: Array<IncomeTax>;
    incomeStream_list: Array<IncomeStream>;

    assets: NamedIndex<Asset>;
    loans: NamedIndex<Loan>;
    incomes: NamedIndex<Income>;
    incomeStreams: NamedIndex<IncomeStream>;
    expenses: NamedIndex<Expense>;
    taxes: NamedIndex<IncomeTax>;
}


export interface IScenario extends IScenarioBase {

}

export interface IMonetary {
    value: Money;
}

export interface IMonetaryItem<T extends MonetaryType> extends IItem<T>, IMonetary {
}

/**
 * Items which represent pools of money (or negative, i.e. loans).
 */
export interface IBalanceItem<T extends BalanceType> extends IMonetaryItem<T> {
    /**
     * Multiplicative factor. Will need to canonicalize compounding periods (APR vs simple, etc.)
     * Non interest-bearing assets, or loans use a value of `1.0,`;
     */
    growth: Rate;
}

/**
 * Items which represent flows of money.
 */
export interface ICashFlowItem<T extends CashFlowType> extends IMonetaryItem<T> {
    /**
     * The fraction of a year this expense item applies to, for expenses which start or end midyear.
     */
    fraction: Rate;
}

/**
 * An asset is something with monetary value.
 */
export interface IAsset extends IBalanceItem<'asset'> {}

/**
 * A loan. Repayment will appear as an {@link IExpense}.
 */
export interface ILoan extends IBalanceItem<'loan'> {
    payment?: Money;
    expense?: IExpense;
}

/**
 * Income, either ongoing or one-time.
 */
export interface IIncome extends ICashFlowItem<'income'> {}

/**
 * An expense, either ongoing or one-time.
 */
export interface IExpense extends ICashFlowItem<'expense'> {
    fromStream: IncomeStreamName;
}

/**
 * Income Tax is an {@Link ICashFlowItem} that is computed from tax tables.
 * It can only be computed after the taxable income for the previous year is computed.
 */
export interface IIncomeTax extends ICashFlowItem<'incomeTax'> {
    /**
     * A state postal code or 'US' for federal income tax. This controls what tax tables are used.
     */
    state: StateCode;
}

/**
 * Generally, a spouse. Potentially a dependent.
 */
export interface IPerson extends IItem<'person'> {
    /**
     * For actuarial and Social Security calculation purposes.
     */
    birth: Date;

    /**
     * For actuarial purposes.
     */
    sex: Sex;
}

export interface IText extends IItem<'text'> {
    text: string;
}

/**
 * A reference to an asset, income, or loan.
 *
 * Because names are not costrained, the compiler won't actually enforce this;
 * it only serves to document it for humans.
 */
export type Reference<Str extends string> = `@${Str}`;

/**
 * Specs are prrovided as JSON.
 */
export type IncomeStreamSpec = IncomeName | AssetName | LoanName | Array<IncomeStreamSpec> | {[k in Reference<IncomeStreamName>]: number};

export interface IIncomeStream extends IMonetaryItem<'incomeStream'> {
    spec: IncomeStreamSpec;
}

export type AnyRow = Omit<IAsset, 'type'>
    & Omit<ILoan, 'type'>
    & Omit<IExpense, 'type'>
    & Omit<IIncome, 'type'>
    & Omit<IIncomeStream, 'type'>
    & Omit<IIncomeTax, 'type'>
    & Omit<IText, 'type'>
    & Omit<IPerson, 'type'>
    & Omit<IScenario, 'type'>
    & {type: Type};

export type RowLabel = keyof AnyRow;
export type RowItem<T extends Type = Type> = ItemTypes[T] & {type: T};
export type Row<T extends Type = Type> = RowTypes[T] & {type: T};

export type InputRow = {
    [k in Capitalize<RowLabel>]: AnyRow[Uncapitalize<k>]
}

export type SortFn<T> = (a: T, b: T) => -1 | 0 | 1;

export type TimeLIneAction = "begin" | "end";

export interface TimeLineItem {
    date: Date;
    action: TimeLIneAction;
    item: IItem;
}