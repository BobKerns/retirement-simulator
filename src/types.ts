/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import type { StateCode } from "./states";
import type { Age, Money, Probability, Rate, Tagged, Year } from "./tagged";
import type { Temporal } from "./sim";
import type { RateType, Types } from "./enums";
import { CalendarStep, CalendarUnit } from "./calendar";

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };
export type Initable<T> = { -readonly [P in keyof T]?: T[P] };

export type Name = string;
export type AssetName = Name;
export type IncomeName = Name;
export type LiabilityName = Name;
export type ExpenseName = Name;
export type IncomeStreamName = Name;
export type ScenarioName = Name;
export type SeriesName = Name;

/**
 * A named and typed item in our model schema.
 */
export interface Named<T extends Type = Type> {
    readonly type: T;
    readonly name: Name;
    prettyName?: string;
}

export type ItemTypeOf<I extends Named> = I extends Named<infer T> ? T : never;

/**
 * A non-specific object which satisfies @{link Named}. Useful for object literals in test cases
 */
export interface AnyNamed extends Named {
    [k:  string]: any | undefined;
}


export interface NamedIndex<T extends Named> {
    [k: string]: T;
}

export type BalanceType = 'asset' | 'liability';
export type CashFlowType = 'income' | 'expense' | 'incomeStream' | 'incomeTax';
export type MonetaryType = BalanceType | CashFlowType;
export type IncomeSourceType = BalanceType | 'income';

export type PayableType = 'expense' | 'liability' | 'incomeTax';
export type Type = `${Types}`;

export interface ItemMethods<T extends Type> {
    hasCategory(category: Category): boolean;
    inScenario(scenario: ScenarioName): boolean;
    stepper(step: CalendarStep, ctx: SimContext): Stepper<T>;
};

/**
 * Additional fields found in specific implementation types.
 */
interface ItemImplFieldDefs {
    person: {
        readonly survivalProbabilities:  Probability[];
    }
    scenario: {
        readonly byId: {[k: string]: IItem};
        readonly spouse1: IFPerson;
        readonly spouse2: IFPerson | null
        readonly person_list: IFPerson[];
        readonly asset_list: IFAsset[];
        readonly liability_list: IFLiability[];
        readonly income_list: IFIncome[];
        readonly expense_list: IFExpense[];
        readonly tax_list: IFIncomeTax[];
        readonly incomeStream_list: IFIncomeStream[];
        readonly text_list: IFText[];

        readonly people: NamedIndex<IFPerson>;
        readonly assets: NamedIndex<IFAsset>;
        readonly liabilities: NamedIndex<IFLiability>;
        readonly incomes: NamedIndex<IFIncome>;
        readonly incomeStreams: NamedIndex<IFIncomeStream>;
        readonly expenses: NamedIndex<IFExpense>;
        readonly taxes: NamedIndex<IFIncomeTax>;
        readonly texts: NamedIndex<IFText>;

        readonly scenario: IFScenario;

        readonly dateRange: [start: Date, end: Date];
    };
};

interface ItemImplMethodDefs {
    person: {
        /**
         * Get the fractional age on the date of interest.
         * @param date the date of interest.
         */
        age(date: Date): Age;
        /**
         * Obtain the integer age reached on the birthday occurring in the specified year.
         * @param year Year as an integer
         */
        age(year: Year): Age;
    };
    scenario: {
        findItem<T extends Type>(name: Name, type: T): ItemImpl<T> | undefined;
        findItems<T extends Type>(type: T): Iterable<ItemImpl<T>> | undefined;
        findText(name: Name): string;
    };

    incomeStream: {
        withdraw(value: Money, purpose: string, states: ItemStates): WithdrawalEvent;
    };
}

/**
 * Additional fields found in specific implementation types.
 */
export type ItemImplFields<T extends Type> = T extends keyof ItemImplFieldDefs ? ItemImplFieldDefs[T] : {};
export type ItemImplMethods<T extends Type> = T extends keyof ItemImplMethodDefs ? ItemImplMethodDefs[T] : {};

export type Id<T extends Type> = `${T}/${Name}`;

/**
 * The model implementation for each {@link Type}.
 */
export type ItemImpl<T extends Type> =
    RowType<T>
    & ItemMethods<T>
    & ItemImplFields<T>
    & ItemImplMethods<T>
    & TemporalItemImpl<T>
    & {
    id: Id<T>;
    prettyName: string;
    scenario: ItemImpl<'scenario'>;
};

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
 * Common fields for item states.
 * */
export type IItemState<T extends Type> = {
    date: Date;
    type: T;
    id: Id<T>;
    item: ItemImpl<T>;
    step: CalendarStep;
}

export interface StateItem<T extends Type> {
    generator: Stepper<T> | null;
    item: ItemImpl<T>;
    current: ItemState<T>;
}

export interface ItemStates {
    [k: string]: StateItem<Type>;
}

/**
 * An item's full state.
 */
export type ItemState<T extends Type = Type> = IItemState<T> & StepperState<T>;

/**
 * The type returned by a {@link stepper} function. This includes just the state provided by
 * the stepper function; the full state is {@link StateItem}.
 */
export type StepperState<T extends Type = Type> = {
    asset: {
        value: Money;
        interest: Money;
        rate: Rate;
        used?: Money;
    };
    liability: {
        value: Money;
        payment: Money;
        principal: Money;
        interest: Money;
        rate: Rate;
        used?: Money;
    };
    expense: {
        value: Money;
        payment: Money;
    };
    income: {
        value: Money;
        payment: Money;
        used?: Money;
    };
    person: {
        age: Age;
        n: number;
        mortality: Probability;
        survival: Probability;
        expected: number;
    };
    incomeStream: {};
    incomeTax: {};
    text: {
        text: string;
    };
    scenario: {};
}[T];

/**
 * A generator that produces updated item states,
 */
export type Stepper<T extends Type> = Generator<StepperState<T>, void, ItemState<T>>;


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
export interface IItem<T extends Type = Type> extends Named<T>, TemporalItem<T> {
    id: Id<T>;
    sort: number,
    categories: Category[];
    scenarios: ScenarioName[];
    notes?: string;
}

/**
 * Common parts between scenarios and snapshots.
 */
export interface IScenarioBase extends IItem<'scenario'> {
}

/**
 * Interface for a scenario. Describes the processed input item, and becomes part of the
 * {@link IFScenario} interface describing the {@link Scenario} implementation.
 */
export interface IScenario extends IScenarioBase {

}

/**
 * Interface for a snapshot. As snapshots are not input, not directly used, but part of the
 * {@link IFSnapshot} interface describing the {@link Snapshot} implementation.
 */
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
     * Interest rate, per payment period. Will need to canonicalize compounding periods (APR vs simple, etc.)
     * Non interest-bearing assets, or loans use a value of `1.0,`;
     */
    readonly rate: Rate;
    /**
     * Type of interest rate calculation, or the name of a time series calculator.
     */
    readonly rateType: CalendarUnit | RateType | SeriesName;

    /**
     * Payment frequency
     */
    readonly paymentPeriod: CalendarUnit;
}

/**
 * Items which represent flows of money.
 */
export interface ICashFlowItem<T extends CashFlowType> extends IMonetaryItem<T> {
    /**
     * Payment frequency
     */
    readonly paymentPeriod: CalendarUnit;
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

export type Weight = number;

/**
 * An object in an {@link IncomeStreamSpec} represents a set of constraints. On input,
 * a single number is equivalent to a {@link Constraint} with only {@link Constraint.weight|weight}
 * specified.
 */
export interface Constraint {
    min?: Money,
    max?: Money,
    weight: Weight
}

export type Sources = {
    [k in Id<IncomeSourceType>]?: Money;
};

export interface WithdrawalEvent {
    id: Id<PayableType>;
    amount: Money;
    sources: Sources;
}

/**
 * Specs are prrovided as JSON. This describes the input form. See {@link IncomeStreamBoundSpec}
 * for the bound form.
 */
export type IncomeStreamSpec = IncomeName | AssetName | LiabilityName
    | Reference<IncomeStreamName>
    | Array<IncomeStreamSpec>
    | {[k in Reference<IncomeName|AssetName|LiabilityName|IncomeStreamName>]: Weight | Constraint};

export type IncomeStreamId = `income/${IncomeName}` | `asset/${AssetName}` | `liability/${LiabilityName}` | `incomeStream/${IncomeStreamName}`;

export type IncomeStreamBoundSpec = IncomeStreamId
    | Array<IncomeStreamBoundSpec>
    | {[K in IncomeStreamId]: Constraint};

export interface IIncomeStream extends ICashFlowItem<'incomeStream'> {
    readonly spec: IncomeStreamSpec;
}

type OmitKeys = 'id' | 'type' | 'name' ;

export type AnyRow = Partial<Omit<IAsset, OmitKeys>>
    & Partial<Omit<ILiability, OmitKeys>>
    & Partial<Omit<IExpense, OmitKeys>>
    & Partial<Omit<IIncome, OmitKeys>>
    & Partial<Omit<IIncomeStream, OmitKeys>>
    & Partial<Omit<IIncomeTax, OmitKeys>>
    & Partial<Omit<IText, OmitKeys>>
    & Partial<Omit<IPerson, OmitKeys>>
    & Omit<IItem, OmitKeys>
    & {
        type: Type;
        name: Name;
    };

export interface TemporalItem<T extends Type = Type> {
    readonly start: Date;
    readonly end?: boolean;
}

export interface TemporalItemImpl<T extends Type = Type> extends TemporalItem<T> {
    temporal: Temporal<ItemImpl<T>>;
}

export type RowLabel = keyof AnyRow;
export type ItemType<T extends Type = Type> = ItemTypes[T] & {type: T};
export type RowType<T extends Type = Type> = RowTypes[T];

export type InputColumn = Capitalize<RowLabel>;

export type InputRow = {
    [k in Capitalize<RowLabel>]: AnyRow[Uncapitalize<k>]
}

export type SortFn<T> = (a: T, b: T) => -1 | 0 | 1;

export type TimeLineAction = "begin" | "end" | 'receive' | 'deposit' | 'withdraw' | 'interest' | 'pay' | 'age';

export type ActionItem<A extends TimeLineAction> = A extends ('begin' | 'end')
    ? IItem
    : A extends 'receive'
    ? IItem<'income'>
    : A extends 'deposit'
    ? IItem<'asset'>
    : A extends 'interest'
    ? IItem<'asset' | 'liability'>
    : A extends ('withdraw' | 'deposit')
    ? IItem<'asset' | 'income' | 'liability'>
    : A extends 'pay'
    ? IItem<'expense' | 'liability' | 'incomeTax'>
    : A extends 'age'
    ? IItem<'person'>
    : never;

interface TransferAction {
    amount: Money;
    balance?: Money;
};

interface AgeAction {
    age: number;
    expectancy: number;
};

export type ActionData<A extends TimeLineAction> = A extends ('begin' | 'end')
    ? {}
    : A extends ('receive' | 'deposit' | 'withdraw' | 'interest' | 'pay')
    ? TransferAction
    : A extends 'age'
    ? AgeAction
    : never;


export interface TimeLineItemBase<A extends TimeLineAction> {
    readonly date: Date;
    readonly action: A;
    readonly item: ActionItem<A>;
}

export type TimeLineItem<A extends TimeLineAction = TimeLineAction> = TimeLineItemBase<A> & ActionData<A>;

export interface IState<T extends Type> {
    readonly scenario: IFScenario;
    readonly item: RowType<T>;
    readonly state: ItemState<T>;
}

export type IFAsset = ItemImpl<'asset'>;
export type IFLiability = ItemImpl<'liability'>;
export type IFIncome = ItemImpl<'income'>
export type IFExpense = ItemImpl<'expense'>;
export type IFIncomeStream = ItemImpl<'incomeStream'>;
export type IFIncomeTax = ItemImpl<'incomeTax'>;
export type IFPerson = ItemImpl<'person'>;
export type IFText = ItemImpl<'text'>;

export interface IFScenarioBase {
    findItem<T extends Type>(name: Name, type: T): ItemImpl<T>;
    findItems<T extends Type>(type: T): Iterable<ItemImpl<T>>;
    findText(name: Name): string;
}

export type IFScenario = ItemImpl<'scenario'>;

/**
 * Interest applied to an account.
 */
export interface AppliedInterest {
    /**
     * The resulting value after this payment.
     */
    value: Money;
    /**
     * The interest applied.
     */
    interest: Money
}

/**
 * Record of a loan paymenmt.
 */
export interface AppliedLoanPayment extends AppliedInterest {
    /**
     * How much of this payment is repayment of principal
     */
    principal: Money,
    /**
     * Total amount of the payment.
     */
    payment: Money
}

export interface ItemTableType<T extends Type> {
    [k: Name]: ItemImpl<T>;
}

export type ItemTable = {
    [K in Type]: ItemTableType<K>;
}

export interface SimContext {
    addTimeLine<A extends TimeLineAction>(action: A, date: Date, item: ActionItem<A>, data: ActionData<A>): void;
}
