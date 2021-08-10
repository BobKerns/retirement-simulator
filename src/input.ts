/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { AnyRow, Category, RowLabel } from "./types";
import { identity } from "./utils";

export type Converters = {
    [T in RowLabel]: (a: any) => AnyRow[T];
}

export const or = <T>(dflt: T) => (a: T):T => a ? a : dflt;

const start = new Date();
export let START = new Date(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());

export const split = <T>(dflt: T[]) => (c: any): T[] => (!c
        ? dflt
        : String(c).split(/\s*,\s*/g) as unknown as T[]
        );

export const converters: Converters = {
    name: identity,
    type: identity,
    prettyName: or(undefined),
    expense: or(undefined),
    start: or(START),
    end: or(undefined),
    text: or(undefined),
    value: or(undefined),
    sort: or(0),
    categories: split([]),
    scenarios: split(["Default"]),
    notes: or(undefined),
    growth: or(undefined),
    payment: or(undefined),
    fromStream: or(undefined),
    fraction: or(undefined),
    spec: or(undefined),
    state: or(undefined),
    birth: or(undefined),
    sex: or(undefined),
};