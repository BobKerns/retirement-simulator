/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Various math utility functions
 *
 * @module
 */

import { makeSummer, Throw } from './utils';
import type {DomainFns, Integer, Tagged, TypeCoercion, TypeGuard } from './tagged';

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
 * Produce a predicate for a tagged number range, optionally with some modulus. The choice of implementations
 * depends on the combination of arguments supplied.
 * @param {min, max, mod, minEx, maxEx}
 * @returns a suitable is* typeguard function for {@link Tagged|Tagged<T>}
 */
const chooseIs = <T extends string>({ min, max, mod, minEx, maxEx }: NumberDomain) => {
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
export const numberRange = <T extends string>(tag: T, range: NumberDomain): DomainFns<T, number> => {
    const is = chooseIs<T>(range);
    const as = (n: number): Tagged<T> =>
        is(n) ? n : Throw(`${n} is not a valid ${tag}.`);
    const to = (n: any) =>
        isNumber(n) ? as(n) : as(Number(n));
    return { is, as, to };
};

// Duplicate definitio (from tagged.ts) to avoid circularity.

const { is: isInteger, as: asInteger, to: toInteger } = numberRange('Integer', { mod: 1 });

/**
 * {@link Integer} version of `Math.floor`
 */
export const floor = Math.floor as <T extends number>(n: T) => Integer & T;
/**
 * {@link Integer} version of `Math.ciel`
 */
export const ceil = Math.ceil as <T extends number>(n: T) => Integer & T;
/**
 * {@link Integer} version of `Math.round`
 */
export const round = Math.round as <T extends number>(n: T) => Integer & T;

export const max = Math.max as <T extends number>(...n: T[]) => T;

export const min = Math.min as <T extends number>(...n: T[]) => T;

/**
 * A higher-order-function that produces a rounding function that rounds to the nearest _n_.
 * @param n scale of rounding
 * @param arg The number being rounded
 * @returns
 */
export const roundTo = (n: number) => <T extends number>(arg: T) => (round(arg / n) * n) as T;
/**
 * {@link Integer} version of `Math.trunc`
 */
export const trunc = Math.trunc as <T extends number>(n: T) => Integer & T;

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

/**
 * We need to defer the deinition of isummer2 until the module system is fully loaded.
 * @returns the isum function
 */
const makeIsum = () => {
    let isummer2: (l: Integer[]) => Integer;
    return (...n: Integer[]) => {
        if (!isummer2) {
            isummer2 = makeSummer<Integer, Integer>(asInteger, asInteger);
        }
        return isummer2(n);
    }
}

/**
 * Sum the {@link Integer} arguments as an {@link Integer}
 */
export const isum = makeIsum();

/**
 * Simple sum of numbers. Errors on values not coercable to numbers.
 * @param n
 * @returns
 */
export const sum = (...n: number[]) => n.reduce((acc, i) => acc + asNumber(i), 0);

export const _add = <T extends number>(a: T, b: T) => (a + b) as T;
export const _sub = <T extends number>(a: T, b: T) => (a - b) as T;

export const _mul = <T extends number>(a: T, b: T) => (a * b) as T;

export const _div = <T extends number>(a: T, b: T) => (a / b) as T
