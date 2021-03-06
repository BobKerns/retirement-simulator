/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */
/**
 * Teach the compiler about type checking for constrained types.
 *
 * @module
 */


import { floor, isNumber, max, min, numberRange, round, roundTo } from "./math";


const typetag = Symbol("typetag");

/**
 * Create a tag for a tagged type. A tagged type is a compile-time-only thing that limits
 * the intensional use of a type, and traces type validations.
 */
export type Tag<T extends string> = {[typetag]: T};
/**
 * Create a taggged type. A tagged type is is a compile-time-only thing that limits
 * the intensional use of a type, and traces type validations.
 */
export type Tagged<TagType extends string, Base = number> = Base & Tag<TagType>;

/**
 * Relax the type checking on tagged types. You can use typeguards and validators to convert back
 * to the unrelaxed version by checking.
 * @typeParam T the type being relaxed.
 * @typeParam Tag the tag being removed. Defaults for simple types, must be supplied for recursive.
 */
export type Relaxed<T, Tag extends string = TagOf<T>> =
    T extends Tagged<Tag, infer Base>
    ? Base
    : T extends Tagged<Tag, infer Base>
    ? Base | undefined
    : T extends {}
    ? {
        [k in keyof T]: Relaxed<T[k], Tag>;
      }
    : T

/**
 * The base type of _T_ without the {@link Tag}.
 */
export type Untag<T extends Tag<string>> = Omit<T, typeof typetag>;

/**
 * The tag (as a string literal type) of a tagged type.
 */
export type TagOf<T> = T extends Tag<infer Tag> ? Tag : never;

/**
 * A type guard. Returns `true` if the argument _n_ satisfies the conditions to be of
 * type _T_, and informs the compiler's type inferencing engine.
 */
export type TypeGuard<T> = (n: any) => n is T;
/**
 * Assert that the argument _n_ is of the type {@link Tagged|Tagged<T,B>}.
 * The compiler's type inferencing is informed that the return value has been validated to be
 * of that type.
 */
export type TypeAssertion<T extends string, B> = (n: B) => Tagged<T, B>;

/**
 * A function that coerces to a specified type.
 */
export type TypeCoercion<T> = (n: any) => T;


/**
 * Type guard for strings.
 * @param n
 * @returns `true` if the argument _n_ is a string.
 */
export const isString: TypeGuard<string> = (n): n is string =>
    typeof n === 'string';

/**
 * Coerce an unknown value to a string. Numbers will be converted.
 * @param n a number, or something coerced to a number
 * @returns
 */
export const asString: TypeCoercion<string> = n => {
    if (isString(n)) {
        return n;
    }
    if (isNumber(n)) {
        return String(n);
    }
    throw new Error(`${n} is not a valid string.`);
}


/**
 * Functions for testing and asserting membership in a tagged number range.
 * See {@link Tagged}.
 *
 * @typeParam T a string-literal type to tag this with.
 * @typeParam B the base type being tagged. This becomes the argument type for the {@link as} function
 *              which should only be passed objects of the base.
 */
export interface DomainFns<T extends string, B> {
    /**
     * A type guard that tests for membership in the domain of the tagged type {@link Tagged|Tagged<T,B>}.
     */
    is: TypeGuard<Tagged<T, B>>;
    /**
     * An assertion that tests and casts. Throws if not suitable.
     */
    as: TypeAssertion<T, B>;
    /**
     * A coercion to this type.
     */
    to: TypeCoercion<Tagged<T, B>>;
}

/**
 * A number between 0 and 360, inclusive of 0, exclusive of 360.
 *
 * Other values are mathematically valid, but are constrained here for
 * implementation convenience and reliability. Use {@link mod360} to coerce
 * to this range.
 */
export type Degrees = Tagged<'Degrees'>;
export const {is: isDegrees, as: asDegrees, to: toDegrees } =
    numberRange('Degrees', {min: 0, max: 360, maxEx: true});

/**
 * Coerce a number to the range between 0 and 360, inclusive of 0, exclusive of 360.
 * @param n
 * @returns the number, coerced to the range (0,360], typed as {@link Degrees}
 */
export const mod360 = (n: number) => {
    if (typeof n !== 'number' || isNaN(n) || !isFinite(n)) {
        throw `${n} is not a valid number of degrees.`;
    }
    const remainder = n % 360;
    return remainder < 0
        ? remainder + 360 as Degrees
        : remainder as Degrees;
}

/**
 * The unit interval: a number between 0 and 1, inclusive.
 */
export type Unit = Tagged<'Unit'>;
export const { is: isUnit, as: asUnit, to: toUnit } = numberRange('Unit', { min: 0, max: 1 });
/**
 * The unit interval: a number between 0 and 1, inclusive.
 */

export type Probability = Tagged<'Probability'>;
export const { is: isProbability, as: asProbability, to: toProbability } = numberRange('Probability', { min: 0, max: 1 });

/**
 * An integer.
 */
export type Integer = Tagged<'Integer'>;
export const {is: isInteger, as: asInteger, to: toInteger} = numberRange('Integer', {mod: 1});

export const _1 = 1 as Integer;
export const _0 = 0 as Integer;

/**
 * An integer between 0 and 255, inclusive.
 */
export type Byte = Tagged<'Byte'> | Tagged<'Integer'>;
export const {is: isByte, as: asByte, to: toByte} = numberRange('Byte', {min: 0, max: 255, mod: 1});

/**
 * An amount of money.
 */
export type Money = Tagged<'Money'>;
export const {is: isMoney, as: asMoney, to: toMoney} = numberRange('Money', {});

const roundMoney = roundTo(0.01);
/**
 * Cast (and check) a numerical value as {@link Money}, rounded to the penny.
 * @param n A number to be interpreted as a monetary value
 * @returns the number, typed as {@link Money}
 */
export const $$ = (n: number): Money => asMoney(roundMoney(asMoney(n)));

/**
* Cast (and check) a numerical value as {@link Money}, rounding to the nearest dollar.
* @param n A number to be interpreted as a monetary value
* @returns the number, typed as {@link Money}
*/
export const $$$ = (n: number): Money => asMoney(round(n));

/**
 * Cast a set of numbers as {@link Money} and return the largest.
 * @param n
 * @returns
 */
export const $max = (...n: number[]): Money => $$(max(...n));

/**
 * Cast a set of numbers as {@link Money} and return the the smallest.
 * @param n
 * @returns
 */
export const $min = (...n: number[]): Money => $$(min(...n));

/**
 * Zero {@link Money}.
 */
export const $0 = $$(0);

export const $add = (a: Money, b: Money) => (a + b) as Money;
export const $sub = (a: Money, b: Money) => (a - b) as Money;

export const $mul = (a: Money, b: number) => (a * b) as Money;

export const $div = (a: Money, b: number) => (a / b) as Money;

/**
 * Interest/growth rate as a fraction (not percent).
 */
export type Rate = Tagged<'Rate'>;
export const {is: isRate, as: asRate, to: toRate} = numberRange('Rate', {min: -2, max: 2, minEx: true});

/**
 * A tax rate (as a fraction, not percentage).
 */
export type TaxRate = Tagged<'TaxRate'>;
export const {is: isTaxRate, as: asTaxRate, to: toTaxRate} =
    numberRange('TaxRate', {min: 0, max: 1});

/**
 * Year as an integer.
 */
export type Year = Tagged<'Year'>;
export const {is: isYear, as: asYear, to: toYear} = numberRange('Year', {min: 1900, max: 2300, mod: 1});

/**
 * Age (usually of people)
 */
export type Age = Tagged<'Age'>;
export const {is: isAge, as: asAge, to: toAge} = numberRange('Age', {min: 0, max: 130});

/**
 * Integer age (usually of people)
 */
export type IAge = Tagged<'IAge'>;
export const {is: isIAge, as: asIAge, to: toIAge} = numberRange('IAge', {min: 0, max: 130, mod: 1});

export const iAge = (n: Age) => toIAge(floor(n));

/**
 * Convert a {@link TypeGuard} for type _T_ into one for `T | undefined`.
 * @param guard an existing typeguard.
 * @returns
 */
export const widenIs = <T>(guard: TypeGuard<T>) =>
    (n: any): n is (T | undefined) =>
        (n === undefined) || guard(n);

/**
 * Convert a {@link TypeAssertion} for type _T_ into one for `T | undefined`.
 * @param guard an existing typeguard.
 * @returns
 */
export const widenAs = <T>(guard: TypeGuard<T>): TypeGuard<T|undefined> =>
    (n: any): n is (T | undefined) =>
        (n === undefined) || guard(n);

/**
 * Convert a {@link TypeCoercion} for type _T_ into one for `T | undefined`.
 * @param guard an existing typeguard.
 * @returns
 */
export const widenTo = <T>(coerce: TypeCoercion<T>): TypeCoercion<T|undefined> =>
    (n: any): (T | undefined) =>
        (n === undefined) ? undefined : coerce(n);

/**
 * A type-inferred cast to a {@link Tagged} type. This is primarily intended for use with constants, where
 * supplying the correct type can be determined by inspection
 *
 * Generally the type parameters will be inferred.
 *
 * ```typescript
 * let foo: Integer = as(1);
 * ```
 *
 * @typeParam T the tag type
 * @typeParam B the base (untagged) type.
 * @param n a value in the base type
 * @returns `n` cast to be of the expected {@link Tagged|Tagged<T,B>} type.
 */
export const as = <T extends string,B>(n: B) => n as Tagged<T,B>;
