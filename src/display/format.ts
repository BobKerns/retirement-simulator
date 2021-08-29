/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { fmt_pct, fmt_usd, typeChecks } from "../utils";
import { isNumber, round } from "../tagged";
import { fmt_date, isDate } from "../calendar";

/**
 * Formatters
 *
 * @module
 */

export type Formatter = (arg: any) => string;

const bad = (arg: any) => arg === undefined
    ? '---'
    : isNaN(arg)
    ? '-NaN-'
    : '-?-';

/**
 * A higher-order-function that produces a rounding function that rounds to the nearest _n_.
 * @param n scale of rounding
 * @param arg The number being rounded
 * @returns
 */
export const roundTo = (n: number) => (arg: number) => round(arg / n) * n;

const fmt = {
    string: (arg: any) => String(arg ?? ''),
    null: (arg: any) => '',
    number: (arg: any) => isNumber(arg) ? roundTo(0.0001)(arg).toLocaleString("en", {maximumFractionDigits: 4}) : bad(arg),
    money: (arg: any) => isNumber(arg) ? fmt_usd(roundTo(0.01)(arg)) : bad(arg),
    dollars: (arg: any) => isNumber(arg) ? fmt_usd(round(arg), 0) : bad(arg),
    percent: (arg: any) => isNumber(arg) ? fmt_pct(roundTo(0.0001)(arg)) : bad(arg),
    pct0: (arg: any) => isNumber(arg) ? fmt_pct(round(arg), 0) : bad(arg),
    pct1: (arg: any) => isNumber(arg) ? fmt_pct(roundTo(0.1)(arg), 1) : bad(arg),
    pct2: (arg: any) => isNumber(arg) ? fmt_pct(roundTo(0.01)(arg), 2) : bad(arg),
    pct3: (arg: any) => isNumber(arg) ? fmt_pct(roundTo(0.001)(arg), 3) : bad(arg),
    pct4: (arg: any) => isNumber(arg) ? fmt_pct(roundTo(0.0001)(arg), 4) : bad(arg),
    date: (arg: any) => isDate(arg) ? fmt_date(arg) : bad(arg)
};

/**
 * Prepackaged formatters.
 */
export const Fmt: {[K in keyof typeof fmt]: Formatter} = fmt;

export const isFormatter = (f: any): f is Formatter => typeof f === 'function' && f.length === 1;
export const [toFormatter, asFormatter] = typeChecks(isFormatter, 'a formatter function');
