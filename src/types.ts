/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { StateCode } from "./states";
import { Money, Rate, Tagged } from "./tagged";

export type Name = string;
export type AssetName = Name;
export type IncomeName = Name;
export type LiabilityName = Name;
export type ExpenseName = Name;
export type IncomeStreamName = Name;
export type ScenarioName = Name;

export interface Named {
    readonly name: Name;
    prettyName?: string;
}

export interface NamedIndex<T extends Named> {
    [k: string]: T;
}

export type BalanceType = 'asset' | 'liability';
export type CashFlowType = 'income' | 'expense' | 'incomeStream' | 'incomeTax';
export type MonetaryType = BalanceType | CashFlowType;
export type Type = MonetaryType | 'person' | 'text' | 'scenario';

export interface ItemMethods {
    hasCategory(category: Category): boolean;
    inScenario(scenario: ScenarioName): boolean;
};

type ItemImpl<T extends Type> = RowType<T> & ItemMethods;

type ItemTypes = {
    [T in keyof RowTypes]: ItemImpl<T>;
};

type RowTypes = {
    asset: IAsset;
    liability: ILiability;
    income: IIncome;
    expense: IExpense;
    person: IPerson;
    text: IText;
    incomeStream: IIncomeStream;
    incomeTax: IIncomeTax;
    scenario: IScenario;
};

/**
 * Extract the {@link Type} keyword from an IITem-based type.
 */
export type ItemKey<I extends IItem<Type>> = I extends IItem<infer T> ? T : never;

/**
 * {link @Tagged} type for category names.
 */
export type Category = Tagged<'Category', string>;

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
    readonly asset_list: IFAsset[];
    readonly liability_list: IFLiability[];
    readonly income_list: IFIncome[];
    readonly expense_list: IFExpense[];
    readonly tax_list: IFIncomeTax[];
    readonly incomeStream_list: IFIncomeStream[];

    readonly assets: NamedIndex<IFAsset>;
    readonly liabilities: NamedIndex<IFLiability>;
    readonly incomes: NamedIndex<IFIncome>;
    readonly incomeStreams: NamedIndex<IFIncomeStream>;
    readonly expenses: NamedIndex<IFExpense>;
    readonly taxes: NamedIndex<IFIncomeTax>;

    readonly scenario: IFScenario;
}


export interface IScenario extends IScenarioBase {

}



export interface ISnapshot extends IScenarioBase {

}

/**
 * An object with monetary value.
 */
export interface IMonetary {
    readonly value: Money;
}

/**
 * An item of {@link MonetaryType} with monetary value.
 */
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
    readonly growth: Rate;
}

/**
 * Items which represent flows of money.
 */
export interface ICashFlowItem<T extends CashFlowType> extends IMonetaryItem<T> {
    /**
     * The fraction of a year this expense item applies to, for expenses which start or end midyear.
     */
    readonly fraction: Rate;
}

/**
 * An asset is something with monetary value.
 */
export interface IAsset extends IBalanceItem<'asset'> {}

/**
 * A loan. Repayment will appear as an {@link IExpense}.
 */
export interface ILiability extends IBalanceItem<'liability'> {
    readonly payment?: Money;
    readonly expense?: ExpenseName;
}

/**
 * Income, either ongoing or one-time.
 */
export interface IIncome extends ICashFlowItem<'income'> {}

/**
 * An expense, either ongoing or one-time.
 */
export interface IExpense extends ICashFlowItem<'expense'> {
    readonly fromStream: IncomeStreamName;
}

/**
 * Income Tax is an {@Link ICashFlowItem} that is computed from tax tables.
 * It can only be computed after the taxable income for the previous year is computed.
 */
export interface IIncomeTax extends ICashFlowItem<'incomeTax'> {
    /**
     * A state postal code or 'US' for federal income tax. This controls what tax tables are used.
     */
    readonly state: StateCode;
}

/**
 * Generally, a spouse. Potentially a dependent.
 */
export interface IPerson extends IItem<'person'> {
    /**
     * For actuarial and Social Security calculation purposes.
     */
    readonly birth: Date;

    /**
     * For actuarial purposes.
     */
    sex: Sex;
}

/**
 * Text provides the ability to provide specific text for a scenario. Because it is part of the data, it does not become
 * part of the displaying page, so more sensitive data can be dsiplayed from a text row, and referenced from the scenario.
 * It can also be varied by scenario.
 */
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
export type IncomeStreamSpec = IncomeName | AssetName | LiabilityName | Array<IncomeStreamSpec> | {[k in Reference<IncomeStreamName>]: number};

export interface IIncomeStream extends IMonetaryItem<'incomeStream'> {
    readonly spec: IncomeStreamSpec;
}

type IItemKeys = keyof IItem;

export type AnyRow = Partial<Omit<IAsset, IItemKeys>>
    & Partial<Omit<ILiability, IItemKeys>>
    & Partial<Omit<IExpense, IItemKeys>>
    & Partial<Omit<IIncome, IItemKeys>>
    & Partial<Omit<IIncomeStream, IItemKeys>>
    & Partial<Omit<IIncomeTax, IItemKeys>>
    & Partial<Omit<IText, IItemKeys>>
    & Partial<Omit<IPerson, IItemKeys>>
    & IItem;

export type RowLabel = keyof AnyRow;
export type ItemType<T extends Type = Type> = ItemTypes[T] & {type: T};
export type RowType<T extends Type = Type> = RowTypes[T] & {type: T};

export type InputColumns = Capitalize<RowLabel>;

export type InputRow = {
    [k in Capitalize<RowLabel>]: AnyRow[Uncapitalize<k>]
}

export type SortFn<T> = (a: T, b: T) => -1 | 0 | 1;

export type TimeLIneAction = "begin" | "end";

export interface TimeLineItem {
    readonly date: Date;
    readonly action: TimeLIneAction;
    readonly item: IItem;
}

export interface IState<T extends Type> {
    readonly scenario: IFScenario;
    readonly item: IItem<T>;
}

export type IFAsset = ItemImpl<'asset'>;
export type IFLiability = ItemImpl<'liability'>;
export type IFIncome = ItemImpl<'income'>
export type IFExpense = ItemImpl<'expense'>;
export type IFIncomeStream = ItemImpl<'incomeStream'>;
export type IFIncomeTax = ItemImpl<'incomeTax'>;
export type IFPerson = ItemImpl<'person'>;
export type IFText = ItemImpl<'text'>;
export type IFScenario = ItemImpl<'scenario'>;
