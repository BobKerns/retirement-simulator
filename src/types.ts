/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */



export type Name = 'Fred' | 'Bill' | 'Sally';
export type AssetName = Name;
export type IncomeName = Name;
export type LoanName = Name;
export type ExpenseName = Name;
export type IncomeStreamName = Name;

export interface Named {
    name: Name;
    prettyName?: string;
}

export interface NamedIndex<T extends Named> {
    [k: string]: T;
}

export type MonetaryType = 'asset' | 'loan' | 'income' | 'expense';
export type Type = MonetaryType | 'person' | 'text' | 'incomeStream' | 'incomeTax' | 'scenario';

export type Category = string;

/**
 * Sex for actuarial purposes.
 */
export type Sex = 'male' | 'female';

/**
 * A basic data item, with a value.
 */
export interface Item<T extends Type> extends Named {
    type: T;
    sort: number,
    start?: Date;
    end?: Date;
    categories: Category[];
    notes?: string;
}

export interface IMonetaryItem<T extends MonetaryType> extends Item<T> {
    value: number;
    /**
     * Multiplicative factor. Will need to canonicalize compounding periods (APR vs simple, etc.)
     * Non interest-bearing assets or loans use a value of `1.0`;
     */
    growth: number;
}

/**
 * Generally, a spouse. Potentially a dependent.
 */
export interface IPerson extends Item<'person'> {
    /**
     * For actuarial and Social Security calculationpurposes.
     */
    birth: Date;

    /**
     * For actuarial purposes.
     */
    sex: Sex;
}

export interface IText extends Item<'text'> {
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

export interface IIncomeStream extends Item<'incomeStream'> {

}

export type SortFn<T> = (a: T, b: T) => -1 | 0 | 1;