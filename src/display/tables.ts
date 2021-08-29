/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Tables. Currently, markdown-based.
 *
 * @module
 */

import { isString } from '../tagged';
import { isObject, isBoolean, typeChecks } from '../utils';
import { Fmt, Formatter, isFormatter, asFormatter } from './format';

/**
 * Desired alignment of text in table columns.
 */
export enum Align {
    left = 'left',
    center = 'center',
    right = 'right'
};

export const isAlign = (a: any): a is Align => a in Align;
export const [toAlign, asAlign] = typeChecks(isAlign, 'a column alignment');

/**
 * A {@link ColumnType} describes how text in a column should be handled.
 */
export interface ColumnType {
    align: Align;
    format: Formatter;
    fixed?: boolean;
}

export const isColumnType = (ct: any): ct is ColumnType => isObject(ct) && isAlign(ct.align) && isFormatter(ct.format);
export const [toColumnType, asColumnType] = typeChecks(
    isColumnType, 'a column type',
    (c: any) => isFormatter(c)
        ? {align: Align.center, format: c}
        : isAlign(c)
        ? {align: c, format: Fmt.string}
        : isBoolean(c)
        ? {align: Align.center, format: Fmt.string, fixed: c}
        : undefined
);

export interface ColumnSpec extends ColumnType {
    name: string;
};

export const isColumnSpec = (cs: any): cs is ColumnSpec => isString(cs.name) && isColumnType(cs);
export const [toColumnSpec, asColumnSpec] = typeChecks(
    isColumnSpec, 'a column spec',
    (c: any) => isString(c)
        ? {name: c, align: Align.center, format: Fmt.string}
        : Array.isArray(c)
        ? c.length === 1
            ?  {name: c[0], align: Align.center, format: Fmt.string}
            : c.length === 2
            ? isColumnType(c[1])
                ? {name: c[0], ...c[1]}
                : {name: c[0], ...toColumnType(c[1])}
            : c.length === 3
            ? {
                name: c[0],
                format: asFormatter(c[1]),
                align: isAlign(c[2]) ? c[2] : Align.center,
                fixed: isBoolean(c[2]) ? c[2] : false
                }
            :undefined
        :undefined
);

/**
 * Description of a table column
 */
export type Column = string
    | [name: string]
    | [name: string, type: ColumnType]
    | [name: string, align: Align]
    | [name: string, format: Formatter]
    | [name: string, fixed: boolean]
    | [name: string, format: Formatter, align: Align]
    | [name: string, format: Formatter, fixed: boolean]
    | ColumnSpec;

export const isColumn = (c: any): c is Column =>
    isString(c)
    || isColumnSpec(c)
    || (
        Array.isArray(c)
        && isString(c[0])
        && (
            c.length === 1
            || (c.length === 2 && (isColumnType(c[1]) || isAlign(c[1] || isFormatter(c[1]) || isBoolean(c[1]))))
            || (c.length === 3 && (isFormatter(c[1] && (isAlign(c[2] || isBoolean(c[2]))))))
        )
    );
export const [toColumn, asColumn] = typeChecks(isColumn, 'a column specification');

const alignString = (a: Align) => {
    switch (a) {
        case Align.left: return ' :---- ';
        case Align.center: return ' ---- ';
        case Align.right: return ' ----: ';
    }
};

/**
 * Format a row of values in a Markdown table.
 *
 * @param args Array of values for the cells in the row
 * @returns a markdown-formatted string
 */
export const row = (...args: any[]) => `|${args.join("|")}|`;

type ColMap = {[k: string]: Column};

export const formatCell = (v: any, col: ColumnSpec): string => {
        if (v === undefined) return '-?-';
        const str = col.format(v);
        if (v === '') return '---';
        return col.fixed ? `\`${str}\`` : str;
};

export const table = (columns: Column[] | ColMap, ...rows: any) => {
    const keys = Object.keys(columns);
    const specs = keys.map(k => toColumnSpec((columns as ColMap)[k])!);
    const header = row(...specs.map(s => s.name));
    const header2 = row(...specs.map(s => alignString(s.align)));
    const format = (r: any) => (k: string, i: number) => formatCell(r[k], specs[i]);
    const toRow = (r: any) =>
        !r || isString(r) ? (r || ' ') : row(...keys.map(format(r)));
    return [header, header2, ...rows.map(toRow).filter((r: any) => !!r)].join("\n");
}

const coltypes = {
    money: {format: Fmt.money, align: Align.right, fixed: true},
    dollars: {format: Fmt.dollars, align: Align.right, fixed: true},
    percent: {format: Fmt.percent, align: Align.right, fixed: true},
    number: {format: Fmt.number, align: Align.right, fixed: true},
    left: {format: Fmt.string, align: Align.left},
    center: {format: Fmt.string, align: Align.center},
    right: {format: Fmt.string, align: Align.right},
    date: {format: Fmt.date, align: Align.right, fixed: true}
};

export const ColTypes: {[K in keyof typeof coltypes]: ColumnType} = coltypes;
