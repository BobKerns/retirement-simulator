/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import * as d3 from 'd3';
import {uniq} from 'ramda';
import { Name } from './types';
import * as raw_color_scheme from './data/color_scheme.json';
import { Scenario } from './scenario';


export const color_scheme: Array<Color> = raw_color_scheme;

export type Color = string;

export const compute_colors =
    (color_scheme: Array<Color>, unknown = "#000000") =>
    (scenario_list: Scenario[]) =>
    d3.scaleOrdinal<Name, Color, Name>(
        d3.sort(
            scenario_list.flatMap((s) => [
            ...s.asset_list.map((d) => d.name),
            ...s.income_list.map((d) => d.name),
            ...s.expense_list.map((d) => d.name),
            ...s.loan_list.map((d) => d.name),
            ...s.tax_list.map((d) => d.name),
            ...s.incomeStream_list.map((d) => d.name)
            ])
        ),
        color_scheme
    ).unknown(unknown);

export const default_colors = compute_colors(color_scheme);

export const subcolors = (colors: d3.ScaleOrdinal<Name, Color, Name>, domain: Color[]) => {
  const uniq_domain = uniq(domain);
  const subcolors = (color: Color) => {
    return colors(color);
  };
  subcolors.domain = () => uniq_domain;
  subcolors.range = () => domain.map(colors);
  return subcolors;
};