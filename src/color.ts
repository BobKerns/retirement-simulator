/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Name } from './types';
import raw_color_scheme from './data/color_scheme.json';
import { Scenario } from './scenario';
import { Throw, uniq, naturalSort, assertNever, nyi } from './utils';

const typetag = Symbol.for("typetag");
export type Tag<T extends string> = {[typetag]: T};
/**
 * Colors are strings in the form _#rrggbb_.
 */
export type Color = `#${string}` & Tag<'Color'>;

/**
 * Typecheck that a string is a valid {@link Color} value.
 * @param n
 * @returns
 */
export const asColor = (c: string): Color =>
    isColor(c)
        ? c
        : Throw(`${c} is not a Color.`);
/**
 * A number between 0 and 360, inclusive of 0, exclusive of 360.
 *
 * Other values are mathematically valid, but are constrained here for
 * implementation convenience and reliability. Use {@link mod360} to coerce
 * to this range.
 */
export type Degrees = number & Tag<'Degrees'>;

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
export type Unit = number & Tag<'Unit'>;

const isUnit = (n: number): n is Unit =>
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
export type Integer = number & Tag<'Integer'>;

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
export type Byte = Integer & Tag<'Byte'>;

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


export type RGBSpec = {r: number, g: number, b: number};
export type RGB = {r: Byte, g: Byte, b: Byte} & Tag<'RGB'>;
export const asRGB = (rgb: RGBSpec) =>
    (asByte(rgb.r), asByte(rgb.g), asByte(rgb.b), rgb as RGB);

export const isRGB = (c: RGBSpec | HSVSpec | Color): c is RGB =>
    typeof c === 'object'
        && isByte((c as any).r)
        && isByte((c as any).g)
        && isByte((c as any).b);

export const rgb = (c: Color | HSVSpec | RGBSpec | string): RGB => {
    switch (typeof c) {
        case 'object':
            if (isRGB(c)) return c;
            if (isHSV(c)) return HSVtoRGB(c);
            throw new Error(`${JSON.stringify(c)} is not a valid Color or HSV value`);
        case 'string':
            const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c);
            if (!match) {
                throw new Error(`${JSON.stringify(c)} is not a valid Color or HSV value`);
            }
            return asRGB({
                r: asByte(Number.parseInt(match[1], 16)),
                g: asByte(Number.parseInt(match[2], 16)),
                b: asByte(Number.parseInt(match[3], 16)),
            });
    }
    throw new Error(`${c} is not a valid Color or HSV value`);
}

export type HSVSpec = {h: number, s: number, v: number};

export type HSV = {h: Degrees, s: Unit, v: Unit} & Tag<'HSV'>;

export const hsv = (c: Color | HSVSpec | RGBSpec | string): HSV => {
    switch (typeof c) {
        case 'object':
            if (isHSV(c)) return c;
            if (isRGB(c)) return RGBtoHSV(c);
            throw new Error(`${JSON.stringify(c)} is not a valid Color or HSV value`);
        case 'string':
            return RGBtoHSV(rgb(asColor(c)));
        default:
            throw new Error(`${c} is not a valid Color or HSV value`);;
    }
}

export const isHSV = (c: HSVSpec | RGBSpec | Color): c is HSV =>
    typeof c === 'object'
        && isDegrees((c as any).h)
        && isUnit((c as any).s)
        && isUnit((c as any).v);

export const asHSV = (c: HSV | HSVSpec): HSV =>
    (asDegrees(c.h), asUnit(c.s), asUnit(c.v), c as HSV);

export const RGBtoHSV = (c: RGBSpec): HSV => {
    const rp = c.r / 255;
    const gp = c.g / 255;
    const bp = c.b / 255;
    const cmax = Math.max(rp, gp, bp);
    const cmin = Math.min(rp, gp, bp);
    const delta = cmax - cmin;
    const h = delta === 0
        ? 0
        : cmax === rp
            ? 60 * ((gp - bp) / delta % 6)
            : cmax === gp
                ? 60 * ((bp - rp) / delta + 2)
                : 60 * ((rp - gp) / delta + 4);
    const s = cmax === 0
        ? 0
        : delta / cmax;
    const v = cmax;
    return asHSV({h, s, v});
};

export const HSVtoRGB = (c: HSVSpec): RGB => {
    const {h, s, v} = c;
    const C = v * s;
    const X = C * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - C;
    const scale = (n: number) => (n + m) * 255;
    const [rp, gp, bp] =
        h < 60
            ? [C, X, 0]
            : h < 120
            ? [X, C, 0]
            : h < 180
            ? [0, C, X]
            : h < 240
            ? [0, X, C]
            : h < 300
            ? [X, 0, C]
            : [C, 0, X];
    return asRGB({
        r: scale(rp),
        g: scale(gp),
        b: scale(bp)
    });
};

/**
 * Test that a string is a valid {@link Color} value.
 * @param c A string
 * @returns
 */
const isColor = (c: string): c is Color => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);

/**
 * The supplied color scheme.
 */
export const color_scheme: Array<Color> = raw_color_scheme.map(asColor);

/**
 * Compute a set of color mappings for items in a given set of scenarios.
 * A higher-order function. Supply _color_scheme_ (and optionally _unknown_), and it will return a
 * a function that accepts a list of scenarios
 * @param color_scheme a list of colors in '#rrggbb' format.
 * @param unknown the color to use for unknown keys
 * @returns a d3 ordinal interpolator.
 */
export const compute_colors =
    (color_scheme: Array<Color>, unknown: Color = asColor("#000000")) =>
    (scenario_list: Scenario[]) =>
    colorsFor(color_scheme, unknown)(
            scenario_list.flatMap((s) => [
                ...s.asset_list.map((d) => d.name),
                ...s.income_list.map((d) => d.name),
                ...s.expense_list.map((d) => d.name),
                ...s.loan_list.map((d) => d.name),
                ...s.tax_list.map((d) => d.name),
                ...s.incomeStream_list.map((d) => d.name)
            ]));

/**
 * Accept a list of scenarios, and return the default color scheme to use.
 * @param scenarios
 */
export const default_colors = compute_colors(color_scheme);


/**
 * Subset a color interpolator to a subdomain. This is used to allow genenrating a swatch for
 * just the relevant items.
 * @param colors
 * @param subdomain
 * @returns a d3 ordinal interpolator.
 */
export const subcolors = (colors: d3.ScaleOrdinal<Name, Color, Name>, subdomain: Color[]) => {
  const uniq_domain = uniq(subdomain);
  const subcolors = (color: Color) => {
    return colors(color);
  };
  subcolors.domain = () => uniq_domain;
  subcolors.range = () => subdomain.map(colors);
  return subcolors;
};

/**
 * Compute a set of color mappings for items in a given set of keys.
 * A higher-order function. Supply _color_scheme_ (and optionally _unknown_), and it will return a
 * a function that accepts a list of keys
 * @param color_scheme a list of colors in '#rrggbb' format.
 * @param unknown the color to use for unknown keys
 * @returns an object equivalent to a d3 ordinal interpolator.
 */
export const colorsFor = (color_scheme: Color[], unknown: Color = asColor("#000000")) => <T>(keys: Iterable<T>) => {
    const map = new Map();
    const ordered = naturalSort(keys);
    ordered.forEach((k, i) => map.set(k, color_scheme[i % color_scheme.length]))
    const color = (k: T) => {
        let val = map.get(k);
        if (val === undefined) {
            map.set(k, val = unknown);
        }
        return val;
    };
    color.range = () => [...map.values()];
    color.domain = () => ordered;
    color.unknown = (nv?: Color) => {
        if (nv !== undefined) {
            unknown = nv;
        }
        return unknown;
    };
    return color;
}
