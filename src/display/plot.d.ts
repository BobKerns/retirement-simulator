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


declare module '@observablehq/plot' {
    export type Pixels = `${string}px`;
    export type PlotResult = Element;
    export interface Mark {
        plot(options?: PlotOptions): PlotResult;
    }

    export type Extractor = string | Scale | ((a: any) => any);

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
        sort?: {[scale: string]: string};
        transform?: Function;
    }

    export interface PlotOptions {
        marks?: Mark[];
        marginTop?: number;
        marginRight?: number;
        marginBottom?: number;
        marginLeft?: number;
        width?: number;
        height?: number;
        caption?: string | Element;
        x?: Extractor;
        y?: Extractor
        r?: Extractor;
        color?: Extractor;
        opacity?: Extractor;
        fill?: Extractor;
        style?: {
            "max-width"?: number;
        }
        "margin-left"?: Pixels;
        "margin-bottom"?: Pixels;
        title?: Extractor;
        offset?: number | null;
    }

    export function plot(options: PlotOptions): PlotResult;
    export function plotX(options: PlotOptions): Mark;
    export function plotY(options: PlotOptions): Mark;
    export function line(data: any[], options: PlotOptions): Mark;

    export function ruleX(values: any): Mark;
    export function ruleY(values: any): Mark;

    export function areaX(data: any[], options: PlotOptions): Mark;
    export function areaY(data: any[], options: PlotOptions): Mark;

    export function stackX(options: PlotOptions): PlotOptions;
    export function stackY(options: PlotOptions): PlotOptions;

}
