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

import * as Plot from '@observablehq/plot';
import { ScaleOrdinal } from 'd3';
import { subcolors, Color } from '../color';
import { Name } from '../types';
import {box} from './box';

export interface LinePlotOptions {
    caption?: string;
    label?: string;
    options: Plot.PlotOptions;
    names?: Name[];
    tickformat?: string;
    years?: number;
    width?: number;
    colors: ScaleOrdinal<Name,Color,Color>
};
export const linePlot = (data: any[][], { caption, label, options, names, years = 25, width = 800, colors}: LinePlotOptions) => {
    const doPlot = () => Plot.plot({
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
        marks: [...data.map(m => Plot.line(m, options)), Plot.ruleY([0])]
    });
    return box(
        md`${names
                ? swatches({
                    color: subcolors(colors, names)
                })
                : ""
            }${doPlot()}`
    )
};
