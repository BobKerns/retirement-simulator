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


import { makeSummer, Throw } from "./utils";


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

export type TypeCoercion<T> = (n: any) => T;


/**
 * Type guard for numbers.
 * @param n
 * @returns `true` if the argument _n_ is a number, not a `NaN`, and finite.
 */
export const isNumber: TypeGuard<number> = (n): n is number =>
    typeof n === 'number'
        && !isNaN(n)
        && isFinite(n);

/**
 * Coerce an unknown value to a number. Strings and other things coercible to numbers will be converted.
 * An error will be thrown if the result does not satisfy {@link isNumber}.
 * @param n a number, or something coerced to a number
 * @returns
 */
export const asNumber: TypeCoercion<number> = n => {
    if (isNumber(n)) {
        return n;
    }
    const nn = Number(n);
    if (isNumber(nn)) {
        return nn;
    }
    throw new Error(`${n} is not a valid number.`);
}

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
 * A specification for a numerical domain.
 */
export interface NumberDomain {
    /**
     * The minimum. Default = no minimum
     */
    min?: number;
    /**
     * The maximum. Default = no maximum
     */
    max?: number;
    /**
     * `true` if the domain excludes the minimum.
     */
    minEx?: boolean;
    /**
     * `true` if the domain excludes the maximum.
     */
    maxEx?: boolean;
    /**
     * Enforce that the number is 0 mod _mod_.
     */
    mod?: number;
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
 * Produce a predicate for a tagged number range, optionally with some modulus.
 * @param {min, max, mod, minEx, maxEx}
 * @returns a suitable is* typeguard function for {@link Tagged|Tagged<T>}
 */
const chooseIs = <T extends string>({min, max, mod, minEx, maxEx}: NumberDomain) => {
    const n = 0
        | (min !== undefined ? 1 : 0)
        | (max !== undefined ? 2 : 0)
        | (minEx ? 4 : 0)
        | (maxEx ? 8 : 0)
        | (mod !== undefined ? 16 : 0);
    switch (n) {
        case 0:
        case 4:
        case 8:
        case 12:
            return isNumber as (n: any) => n is Tagged<T>;
        case 1:
        case 9:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && n >= min!;
        case 2:
        case 6:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && n <= max!;
        case 3:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && n >= min!
                && n <= max!;
        case 5:
        case 13:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && n > min!;
        case 10:
        case 14:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && n < max!;
        case 7:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && n > min!
                && n <= max!;
        case 11:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && n >= min!
                && n < max!;
        case 15:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && n > min!
                && n < max!;
        case 16:
        case 20:
        case 24:
        case 28:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && (n / mod!) % 1 === 0;
        case 17:
        case 25:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && n >= min!
                && (n / mod!) % 1 === 0;
        case 18:
        case 22:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && n <= max!
                && (n / mod!) % 1 === 0;
        case 19:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && n >= min!
                && n <= max!
                && (n / mod!) % 1 === 0;
        case 21:
        case 29:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && n > min!
                && (n / mod!) % 1 === 0;
        case 26:
        case 30:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && n < max!
                && (n / mod!) % 1 === 0;
        case 23:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && n > min!
                && n <= max!
                && (n / mod!) % 1 === 0;
        case 27:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && n >= min!
                && n < max!
                && (n / mod!) % 1 === 0;
        case 31:
            return (n: any): n is Tagged<T> =>
                isNumber(n)
                && n > min!
                && n < max!
                && (n / mod!) % 1 === 0;
        default:
            // All the cases should be covered above.
            throw new Error(`Impossible ${n}`);
    }
}

/**
 * Create functions to test and assert membership in a tagged numerical range.
 * @param tag the type tag
 * @param range the specification of the range to be enforced.
 * @returns a {@link DomainFns} with the test and assert functions.
 */
export const numberRange = <T extends string>(tag: T, range: NumberDomain): DomainFns<T,number> => {
    const is = chooseIs<T>(range);
    const as = (n: number): Tagged<T> =>
        is(n) ? n : Throw(`${n} is not a valid ${tag}.`);
    const to = (n: any) =>
        isNumber(n) ? as(n) : as(Number(n));
    return {is, as, to};
};

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
export const {is: isUnit, as: asUnit, to: toUnit} = numberRange('Unit', {min: 0, max: 1});

/**
 * An integer.
 */
export type Integer = Tagged<'Integer'>;
export const {is: isInteger, as: asInteger, to: toInteger} = numberRange('Integer', {mod: 1});

/**
 * An integer between 0 and 255, inclusive.
 */
export type Byte = Tagged<'Byte'> | Tagged<'Integer'>;
export const {is: isByte, as: asByte, to: toByte} = numberRange('Byte', {min: 0, max: 255, mod: 1});

export type Money = Tagged<'Money'>;
export const {is: isMoney, as: asMoney, to: toMoney} = numberRange('Money', {});

/**
 * Interest/growth rate as a multiplier. Cannot be zero.
 */
export type Rate = Tagged<'Rate'>;
export const {is: isRate, as: asRate, to: toRate} = numberRange('Rate', {min: 0, minEx: true});

export type TaxRate = Tagged<'TaxRate'>;
export const {is: isTaxRate, as: asTaxRate, to: toTaxRate} =
    numberRange('TaxRate', {min: 0, max: 1});

/**
 * Year as an integer.
 */
export type Year = Tagged<'Year'>;
export const {is: isYear, as: asYear, to: toYear} = numberRange('Year', {min: 1900, max: 2300, mod: 1});

export type Age = Tagged<'Age'>;
export const {is: isAge, as: asAge, to: toAge} = numberRange('Age', {min: 0, max: 130});

export type IAge = Tagged<'IAge'>;
export const {is: isIAge, as: asIAge, to: toIAge} = numberRange('IAge', {min: 0, max: 130, mod: 1});

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

/**
 * {@link Integer} version of `Math.floor`
 */
export const floor = Math.floor as (n: number) => Integer;
/**
 * {@link Integer} version of `Math.ciel`
 */
export const ceil = Math.ceil as (n: number) => Integer;
/**
 * {@link Integer} version of `Math.round`
 */
export const round = Math.round as (n: number) => Integer;
/**
 * {@link Integer} version of `Math.trunc`
 */
export const trunc = Math.trunc as (n: number) => Integer;

/**
 * {@link Integer} version of `n % m`
 */
export const imod = (n: Integer, m: Integer) => trunc(n % m);

/**
 * {@link Integer} division.
 */
export const idiv = (n: Integer, d: Integer) => trunc(n / d);

/**
 * {@link Integer} increment
 */
export const incr = (n: Integer) => asInteger(n + 1);
/**
 * {@link Integer} decrement
 */
export const decr = (n: Integer) => asInteger(n - 1);

const isummer2 = makeSummer<Integer, Integer>(asInteger, asInteger);

/**
 * Sum the {@link Integer} arguments as an {@link Integer}
 */
export const isum = (...n: Integer[]) => isummer2(n);
