/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Name } from './types';
import raw_color_scheme from './data/color_scheme.json';
import { Scenario } from './model';
import { Throw, uniq } from './utils';
import { asByte, asDegrees, asUnit, Byte, Degrees, isByte, isDegrees, isUnit, Tag, Tagged, Unit } from './tagged';
import { naturalSort } from './sort';
import { scaleOrdinal, ScaleOrdinal } from 'd3';
/**
 * Colors are strings in the form _#rrggbb_.
 */
export type Color = Tagged<'Color', `#${string}`>;

/**
 * Typecheck that a string is a valid {@link Color} value.
 * @param n
 * @returns
 */
export const asColor = (c: string): Color =>
    isColor(c)
        ? c
        : Throw(`${c} is not a Color.`);


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
                ...s.asset_list.map((d) => d.id),
                ...s.income_list.map((d) => d.id),
                ...s.expense_list.map((d) => d.id),
                ...s.liability_list.map((d) => d.id),
                ...s.tax_list.map((d) => d.id),
                ...s.incomeStream_list.map((d) => d.id),
                ...s.person_list.map(d => d.id)
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
export const subcolors = (colors: d3.ScaleOrdinal<Name, Color, Color>, subdomain: Name[]): d3.ScaleOrdinal<Name, Color, Color> => {
    let uniq_domain = uniq(subdomain);
    let range = subdomain.map(colors);
    return scaleOrdinal(uniq_domain, range);
};

/**
 * Compute a set of color mappings for items in a given set of keys.
 * A higher-order function. Supply _color_scheme_ (and optionally _unknown_), and it will return a
 * a function that accepts a list of keys
 * @param color_scheme a list of colors in '#rrggbb' format.
 * @param unknown the color to use for unknown keys
 * @returns an object equivalent to a d3 ordinal interpolator.
 */
export const colorsFor = (color_scheme: Color[], unknown: Color = asColor("#000000")) => (keys: Iterable<Name>) => {
    const map = new Map();
    const ordered = naturalSort(keys);
    const range = ordered.map((k, i) => color_scheme[i % color_scheme.length]);
    return scaleOrdinal<Name,Color,Color>(ordered, range).unknown(unknown);
}
