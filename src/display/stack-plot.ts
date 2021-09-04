/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { subcolors, Color } from "../color";
import { box } from "./box";
import { areaY, plot, stackY } from '@observablehq/plot';
import { uniq } from 'Ramda';
import type {ScaleOrdinal} from 'd3';
import { isFunction } from "../utils";
import { Name, Named } from '../types';

export interface StackPlotOptions {
    caption?: string,
    x?: string,
    y: string | ((a: any) => number | undefined);
    offset?: number | null;
    title?: string;
    tickFormat?: string;
    colors: ScaleOrdinal<Name,Color,Color>;
    years: number;
}

/**
 * Create our stacked plots
 *
 * @module
 */

export const stackPlot = (
    series: any[],
    options: StackPlotOptions
) => {
    const { caption, y, x = "year", offset = null, title = "name", tickFormat = "",
        colors, years } = options;
    const yFn = (a: any) => {
        const v = isFunction(y) ? y(a) : a[y];
        return v === undefined ? v : v / 1000;
    };
    return box(md`${swatches({
        color: subcolors(colors, uniq(series.filter(yFn).map((s) => s.name)))
    })}
${plot({
        caption,
        style: {
            "max-width": width - 20
        },
        width: width - 20,
        "margin-left": "40px",
        "margin-bottom": "0px",
        x: {
            transform: (y: number) => (years > 35 ? y - 2000 : y),
            tickFormat
        },
        y: {
            grid: true,
            label: "$1K"
        },
        color: {
            range: colors.range(),
            domain: colors.domain()
        },
        marks: [
            areaY(
                series,
                stackY({
                    x,
                    y: yFn,
                    fill: "name",
                    title: title,
                    offset
                })
            )
        ]
    })}`)
};
