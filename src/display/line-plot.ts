/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Display a line plot.
 *
 * @module
 */

import { ScaleOrdinal } from 'd3';
import { Formatter, Fmt } from './format';
import { subcolors, Color } from './color';
import { O } from '../observablehq';
import { Name } from '../types';
import {box} from './box';
import { PlotOptions } from './plot';

type LabelFormatter = (x: string) => string;

export interface LinePlotOptions {
    caption?: string;
    label?: string;
    options: PlotOptions;
    names?: Name[];
    tickformat?: string;
    years?: number;
    width?: number;
    colors: ScaleOrdinal<Name,Color,Color>;
    xformat?: Formatter;
    labelFormat: LabelFormatter;
};

export const linePlot = (data: any[][], { caption, label, options, names, years = 25, colors, xformat = Fmt.month, labelFormat = x => x}: LinePlotOptions) => {
    const doPlot = () => O.Plot.plot({
        caption,
        style: {
            "max-width": O.width - 20
        },
        width: O.width - 20,
        x: {
            tickFormat: xformat
        },
        y: {
            grid: true,
            label
        },
        marks: [...data.map(m => O.Plot.line(m, options)), O.Plot.ruleY([0])]
    });
    return box(
        O.md`${names
                ? O.swatches({
                    color: subcolors(colors, names),
                    format: labelFormat
                })
                : ""
            }${doPlot()}`
    )
};
