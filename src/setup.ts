 /*
  * Copyright 2021 by Bob Kerns. Licensed under MIT license.
  *
  * Github: https://github.com/BobKerns/retirement-simulator
  */

 /**
  * Handle interfacing with the ObservableHQ environment.
  *
  * @module
  */

import type * as D3 from 'd3';
import { loadData } from '.';
import { Plot } from './display/plot';

type Inputable<T> = EventTarget & ({
    value: T;
} | {
    valueAsDate: T;
} | {
    checked: T;
} | {
    multiple: true;
    files: [T, ...any[]];
} | {
    multiple: false;
    files: T;
});

export type DisposeFn<T> = (value: T) => void;
export type ChangeFn<T> = (value: T) => (void | DisposeFn<void>);
export interface Generators {
    disposable: <T>(value: T, dispose: DisposeFn<T>) => Generator<T, T, void>;
    filter: <T>(iterator: Iterator<T>, test: (v: T) => boolean) => Generator<T>;
    input: <T>(elt: Inputable<T>) => Generator<T>;
    map: <T, V>(iterator: Iterator<T>, transform: (v: T, index: number) => V) => Generator<V>;
    observe: <T>(initialize: ChangeFn<T>) => Generator<T>;
    queue: <T>(initialize: ChangeFn<T>) => Generator<T>;
    range: (start: number, stop?: number, step?: number) => Generator<number>;
    valueAt: <T>(iterator: Iterator<T>, index: number) => T;
    worker: (source: string) => Worker;
};

export interface O {
    d3: typeof D3;
    swatches(options: SwatchesOptions): Element;
    width: number;
    nvalidation: Promise<void>;
    visibility<T>(value?: T): T;
    md(template: TemplateStringsArray, ...args: any[]): Element;

    html(template: TemplateStringsArray, ...args: any[]): Element;

    svg(template: TemplateStringsArray, ...args: any[]): Element;

    dot(template: TemplateStringsArray, ...args: any[]): Element;

    tex(template: TemplateStringsArray, ...args: any[]): Element;
    Generators: Generators;
    Promises: {
        delay: <T>(duration: number, value?: T) => T;
        tick: <T>(duration: number, value?: T) => T;
        when: <T>(duration: Date, value?: T) => T;
    };
    Plot: Plot;
    // DOM, File, FileAttachments, require, SQLite
}


type Pixels = `${string}px`;
type FormatFn = (x: string) => string;

interface SwatchesOptions {
    color: any; // ScaleOrdinal<Name, Color, Name>;
    columns?: Pixels | null;
    format?: FormatFn;
    swatchSize?: number;
    swatchWidth?: number;
    swatchHeight?: number;
    mamrginLeft?: number;
}

/**
 * Our interface to the Observable world. This must be set before
 */
 export let O: O = undefined as unknown as O;

/**
 * Initialize our world and connect it to the ObservableHQ world.
 * @param o the O interface to our ObservableHQ environment
 * @returns the {@link loadData} function, ready for use.
 */
export const setup = (o: O) => (O = o, {loadData});
