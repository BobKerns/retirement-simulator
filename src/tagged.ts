/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Throw } from "./utils";


const typetag = Symbol.for("typetag");

/**
 * Create a tag for a tagged type. A tagged type is a compile-time-only thing that limits
 * the intensional use of a type, and traces type validations.
 */
export type Tag<T extends string> = {[typetag]: T};

export type Tagged<TagType extends string, Base = number> = Base & Tag<TagType>;


/**
 * A number between 0 and 360, inclusive of 0, exclusive of 360.
 *
 * Other values are mathematically valid, but are constrained here for
 * implementation convenience and reliability. Use {@link mod360} to coerce
 * to this range.
 */
export type Degrees = Tagged<'Degrees'>;

export const isDegrees = (n: number): n is Degrees =>
    (typeof n === 'number')
    && (n < 360 && n >= 0);

/**
 * Typecheck that a number is a valid {@link Degrees} value.
 * @param n
 * @returns
 */
export const asDegrees = (n: number): Degrees =>
    (n < 360 && n >= 0)
        ? n as Degrees
        : Throw(`${n} is not a valid number of degrees.`);

/**
 * Coerce a number to the range between 0 and 360, inclusive of 0, exclusive of 360.
 * @param n
 * @returns the number, coerced to the range (0,360], typed as {@link Degrees}
 */
export const mod360 = (n: number) => {
    if (isNaN(n)) throw `${n} is not a valid number of degrees.`;
    const remainder = n % 360;
    return remainder < 0
        ? remainder + 360 as Degrees
        : remainder as Degrees;
}
/**
 * A number between 0 and 1, inclusive.
 */
export type Unit = Tagged<'Unit'>;

/**
 * Test that a number is a number in the range (0, 1) inclusive.
 * @param n a number
 * @returns true if in the range (0, 1) inclusive.
 */
export const isUnit = (n: number): n is Unit =>
    typeof n === 'number' && (n <= 1 && n >= 0);

/**
 * Typecheck that a number is a valid {@link Unit} value.
 * @param n
 * @returns a {@link Unit}
 */
export const asUnit = (n: number): Unit =>
    isUnit(n)
        ? n
        : Throw(`${n} is not a number between 0 and 1.`);

/**
 * An integer.
 */
export type Integer = Tagged<'Integer'>;

/**
 * Test that a number is an integer
 * @param n
 * @returns
 */
export const isInteger = (n: number): n is Integer => typeof n === 'number' && (n % 1) === 0;

/**
 * Typecheck that a number is a valid {@link Integer} value.
 * @param n
 * @returns a {@link Byte}
 */
export const asInteger = (n: number) =>
    isInteger(n)
        ? n as Integer
        : Throw(`${n} is not an Integer.`);

/**
 * An integer between 0 and 255, inclusive.
 */
export type Byte = Tagged<'Byte', Integer>;

/**
 * Test that a number is a byte value
 * @param n
 * @returns
 */
export const isByte = (n: number): n is Byte =>
    typeof n === 'number'
    && n >= 0 && n < 256
    && isInteger(n);

/**
 * Typecheck that a number is a valid {@link Byte} value.
 * @param n
 * @returns a {@link Byte}
 */
export const asByte = (n: number): Byte =>
    isByte(n)
        ? n
        : Throw(`${n} is not an integer between 0 and 255`)

export type Money = Tagged<'Money'>;
export const isMoney = (n: number): n is Money =>
    typeof n === 'number'
    && !isNaN(n);
export const asMoney = (n: number) =>
    isMoney(n) ? n : Throw(`${n} is not a valid amount of Money`);

export type Rate = Tagged<'Rate'>;
export const isRate = (n: number): n is Rate =>
    isUnit(n) && n !== 0;
export const asRate = (n: number) =>
    isRate(n) ? n : Throw(`${n} is not a valid Rate`);

