/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Name } from './types';
import raw_color_scheme from './data/color_scheme.json';
import { Scenario } from './scenario';

import { scaleOrdinal } from 'd3-scale';
import { sort as d3Sort } from 'd3-array';
import { Throw } from './utils';

/**
 * Colors are strings in the form _#rrggbb_.
 */
export type Color = `#${string}`;

const isColor = (c: string): c is Color => /^#[0-9a-f]{6}$/i.test(c);
const verifyColor = (c: string) => isColor(c) ? c : Throw(`Invalid color: ${c}`);

/**
 * The supplied color scheme.
 */
export const color_scheme: Array<Color> = raw_color_scheme.map(verifyColor);

/**
 * Compute a set of color mappings for items in a given set of scenarios.
 * A higher-order function. Supply _color_scheme_ (and optionally _unknown_), and it will return a
 * a function that accepts a list of scenarios
 * @param color_scheme a list of colors in '#rrggbb' format.
 * @param unknown the color to use for unknown keys
 * @returns a d3 ordinal interpolator.
 */
export const compute_colors =
    (color_scheme: Array<Color>, unknown = "#000000") =>
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
 * @returns a d3 ordinal interpolator.
 */
export const colorsFor = (color_scheme: Color[], unknown: string = "#000000") => (keys: string[]) => {
    return scaleOrdinal<Name, Color, Name>(
        d3Sort(keys),
        color_scheme
    ).unknown(unknown);
}
