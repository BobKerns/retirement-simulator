/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { TYPES } from "./item-types";
import { toMoney, toRate } from "./tagged";
import { toDate } from "./time";
import { AnyRow, RowType, RowLabel, Type, InputRow, Writeable, InputColumn, ItemType, Initable } from "./types";
import { identity } from "./utils";

export type Converters = {
    [T in RowLabel ]: (a: any) => AnyRow[T];
} & {
    src: (a: any) => string | undefined;
}

export const or = <T>(dflt: T) =>
    (a: any):T =>
        (a !== undefined && a !== '') ? a : dflt;

export const optional = <T>(fn: (a: any) => T) =>
    <D>(dflt: D) =>
        (a: any) =>
            (a !== undefined && a !== "")
            ? fn(a)
            : dflt;

const start = new Date();
export let START = new Date(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());

export const split = <T>(dflt: T[]) => (c: any): T[] =>
    ((c === undefined || c === '')
        ? dflt
        : String(c).split(/\s*,\s*/g) as unknown as T[]
        );

export const optionalDate = optional(toDate);
export const optionalMoney = optional(t => toMoney(Number(t)));
export const optionalRate = optional(t => toRate(1 + Number(t)/100));
export const optionalNumber = optional(Number);

export const converters: Converters = {
    name: identity,
    type: identity,
    prettyName: or(undefined),
    expense: or(undefined),
    start: optionalDate(START),
    end: optionalDate(undefined),
    text: or(undefined),
    value: optionalMoney(undefined),
    sort: optionalNumber(0),
    categories: split([]),
    scenarios: split(["Default"]),
    notes: or(undefined),
    growth: optionalRate(undefined),
    payment: optionalMoney(undefined),
    fromStream: or('default'),
    spec: or(undefined),
    state: or(undefined),
    birth: optionalDate(undefined),
    sex: or(undefined),
    src: or(undefined)
};

/**
 *
 * @param row
 * @returns
 */
export const convert = <T extends Type>(row: InputRow) => {
    const result: Initable<AnyRow> = {};
    const upcase =  (l: string) => l.substr(0, 1).toUpperCase() + l.substr(1) as keyof InputRow;
    for (const k in converters) {
        const l = upcase(k);
        try {
            const cvt = converters[k as keyof typeof converters];
            if (cvt) {
                const nval: any = cvt(row[l]);
                if (nval !== undefined) {
                    result[k as keyof typeof result] = nval;
                }
            }
        } catch (e) {
            throw new Error(`Could not convert field '${l}' of row ${row.Type ?? '<missing type>'} ${row.Name ?? '<missing name>'} : ${e.constructor.name}: ${e.messagee}`);
        }
    }
    const checkRequired = (list?: Array<keyof AnyRow>) => {
        if (list) {
            for (const k of list) {
                if (result[k] === undefined || result[k] === '') {
                    const l = upcase(k);
                    throw new Error(`Row ${result.type ?? '<missing type>'} ${result.name ?? '<missing name>'} is missing required key '${l}'`)
                }
            }
        }
    };
    checkRequired(TYPES[result.type!].required);
    return result as AnyRow;
};
