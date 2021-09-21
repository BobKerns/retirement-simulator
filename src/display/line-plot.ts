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
import { subcolors, Color } from '../color';
import { O } from '../setup';
import { Name } from '../types';
import {box} from './box';
import { PlotOptions } from './plot';

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
};
export const linePlot = (data: any[][], { caption, label, options, names, years = 25, width = 800, colors}: LinePlotOptions) => {
    const doPlot = () => O.Plot.plot({
        caption,
        style: {
            "max-width": width - 20
        },
        width: width - 20,
        x: {
            transform: (y: number) => (years ?? 0 > 35 ? y - 2000 : y)
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
                    color: subcolors(colors, names)
                })
                : ""
            }${doPlot()}`
    )
};
