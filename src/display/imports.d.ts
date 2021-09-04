/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Values expected to be imported into the notebook.
 *
 * @module
 */
/*
import type {ScaleOrdinal} from 'd3';
import type { Color } from '../color';
import type { Name } from '../types';
*/
declare type Pixels = `${string}px`;
declare type FormatFn = (x: string) => string;

declare interface SwatchesOptions {
    color: any // ScaleOrdinal<Name, Color, Name>;
    columns?: Pixels | null;
    format?: FormatFn;
    swatchSize?: number;
    swatchWidth?: number;
    swatchHeight?: number;
    mamrginLeft?: number;
}
declare function swatches(options: SwatchesOptions): Element;
