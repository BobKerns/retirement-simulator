/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Typings for ObservableHQ Plot
 *
 * @module
 */

type Pixels = `${string}px`;
type PlotResult = Element;

export interface Mark {
    plot(options?: PlotOptions): PlotResult;
};

export type Channel = string | Scale | ((a: any) => any);

export type Side = 'top' | 'bottom' | 'left' | 'right';
export interface Scale {
    domain?: any[];
    range?: any[];
    reverse?: boolean;
    clamp?: boolean;
    nice?: boolean | number;
    zero?: boolean;
    percent?: true;
    inset?: number;
    round?: boolean;
    padding?: number;
    align?: number;
    paddingInner?: number;
    paddingOuter?: number;
    axis?: Side | null;
    ticks?: number;
    tickSize?: number;
    tickPadding?: number;
    tickFormat?: string | Function;
    tickRotate?: number;
    grid?: boolean;
    line?: boolean;
    label?: string;
    labelAnchor?: Side;
    labelOffset?: number;
    scheme?: string;
    interpolate?: Function;
    pivot?: number;
    sort?: { [scale: string]: string; };
    transform?: Function;
}

export type Offset = 'expand' | 'normalize' | 'center' | 'silhouette' | 'whiggle' | null;;

export interface PlotOptions {
    marks?: Mark[];
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    width?: number;
    height?: number;
    caption?: string | Element;
    x?: Channel;
    y?: Channel;
    r?: Channel;
    z?: Channel;
    color?: Channel;
    opacity?: Channel;
    fill?: Channel;
    style?: {
        "max-width"?: number;
    };
    "margin-left"?: Pixels;
    "margin-bottom"?: Pixels;
    title?: Channel;
    offset?: Offset;
}

export interface Plot {
    plot(options: PlotOptions): PlotResult;
    plotX(options: PlotOptions): Mark;
    plotY(options: PlotOptions): Mark;
    line(data: any[], options: PlotOptions): Mark;

    ruleX(values: any): Mark;
    ruleY(values: any): Mark;

    areaX(data: any[], options: PlotOptions): Mark;
    areaY(data: any[], options: PlotOptions): Mark;

    stackX(options: PlotOptions): PlotOptions;
    stackY(options: PlotOptions): PlotOptions;

    // Many more

}
