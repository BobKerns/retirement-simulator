/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { subcolors, Color } from "./color";
import { box } from "./box";
import {O} from '../observablehq';
import { uniq } from 'ramda';
import type {ScaleOrdinal} from 'd3';
import { isFunction, Throw } from "../utils";
import { Name } from '../types';
import { Formatter, Fmt } from "./format";
import { Channel, Offset } from "./plot";
import { isString } from "../tagged";

type LabelFormatter = (x: string) => string;

export interface StackPlotOptions {
    caption?: string,
    x?: Channel,
    y: Channel;
    z: Channel;
    fill: Channel;
    offset?: Offset;
    title?: Channel;
    tickFormat?: string;
    colors: ScaleOrdinal<Name,Color,Color>;
    years: number;
    width: number;
    xformat?: Formatter;
    labelFormat: LabelFormatter;
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
    const { caption, y = "value", x = "date", z = 'id', fill = z, offset = null, title = "name", tickFormat = "",
        colors, years = 25, xformat = Fmt.month,
        labelFormat = x => x } = options;
    const value = isFunction(y)
        ? (s: any) => y(s)
        : isString(y)
        ? (s: any) => s[y]
        : Throw(`Bad y channel: ${y}`);
    const validValue = (v: any) => y !== null && y !== undefined;
    const valid = (v: any) => validValue(value(v));
    return box(O.md`${O.swatches({
        color: subcolors(colors, uniq(series.filter(valid).map((s: any) => isFunction(z) ? z(s) : (s[z as string] ?? s.id)))),
        format: labelFormat
    })}
${O.Plot.plot({
        caption,
        style: {
            "max-width": O.width - 20
        },
        width: O.width - 20,
        "margin-left": "40px",
        "margin-bottom": "0px",
        x: {
            label: "date",
            grid: true,
            tickFormat: xformat
        },
        y: {
            grid: true,
            label: "$1K",
            transform: (n: number) => n / 1000
        },
        color: {
            range: colors.range(),
            domain: colors.domain()
        },
        marks: [
            O.Plot.areaY(
                series,
                O.Plot.stackY({
                    x, y, z, fill, title, offset
                })
            )
        ]
    })}`)
};
