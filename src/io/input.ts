/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Input processing, invoked by {@link loadData}. A separate file because {@link loadData} triggers loading problems
 * for jest unit tests.
 *
 * @module
 */

import { TYPES } from "../item-types";
import { toMoney, toRate } from "../tagged";
import { toCalendarUnit, toDate, UTC } from "../calendar";
import { AnyRow, RowLabel, Type, InputRow, Initable, TemporalItem } from "../types";
import { identity, toBoolean } from "../utils";
import { Temporal } from "../sim";
import { START } from "../time";

export type Converters = {
    [T in RowLabel ]: (a: any) => AnyRow[T];
} & {
    src: (a: any) => string | undefined;
    temporal: (a: any) => Temporal<TemporalItem> | undefined;
}
/**
 * A higher-order function that returns a @{link Converters} provides a default in cases where a value is not supplied in the input.
 * @param dflt Default value
 * @returns
 */
export const or = <T>(dflt: T) =>
    (a: any):T =>
        (a !== undefined && a !== '') ? a : dflt;

/**
 * A higher-order function that takes a converter function and gives a higher-order function that takes a default,
 * which returns a converter that uses the default when no value is supplied, instead of invoking the converter.
 * @param fn a converter function
 * @returns
 */
export const optional = <T>(fn: (a: any) => T) =>
    <D>(dflt: D) =>
        (a: any) =>
            (a !== undefined && a !== "")
            ? fn(a)
            : dflt;

/**
 * Split a comma-separated field.
 * @param dflt
 * @returns
 */
export const split = <T>(dflt: T[]) => (c: any): T[] =>
    ((c === undefined || c === '')
        ? dflt
        : String(c).split(/\s*,\s*/g) as unknown as T[]
        );

export const optionalDate = optional(toDate);
export const optionalMoney = optional(t => toMoney(Number(t)));
export const optionalRate = optional(t => toRate(Number(t)/100));
export const optionalNumber = optional(Number);

/**
 * Map of fields to converters to convert to the proper type (e.g. number, date, etc.)
 */
export const converters: Converters = {
    name: identity,
    type: identity,
    prettyName: or(undefined),
    expense: or(undefined),
    start: optionalDate(START),
    end: optional(toBoolean)(false),
    text: or(undefined),
    value: optionalMoney(undefined),
    sort: optionalNumber(0),
    categories: split([]),
    scenarios: split(["Default"]),
    notes: or(undefined),
    rate: optionalRate(undefined),
    rateType: or(undefined),
    payment: optionalMoney(undefined),
    paymentPeriod: optional(toCalendarUnit)(undefined),
    fromStream: or('default'),
    spec: or(undefined),
    state: or(undefined),
    birth: optionalDate(undefined),
    sex: or(undefined),
    src: or(undefined),
    temporal: or(undefined)
};

/**
 * Conveert an {@link InputRow} to an {@link AnyRow}, that is, parse and validate fields for
 * each type of object.
 *
 * {@link InputRow} objects differ from {@link AnyRow} objects, in that the field names are capitalized.
 * This is convenient for column headings in editing the CSV files, and also helps to distinguish between
 * unprocessed {@link InputRow} and processed {@link AnyRow} objects.
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
        } catch (e: any) {
            const type = row.Type ?? '<missing type>';
            const name = row.Name ?? '<missing name>';
            const start =row.Start ?? '';
            const field = `'${l}' of row ${type} ${name} ${start}`;
            throw new Error(`Could not convert field ${field} (${row[l]}): ${e.constructor.name}: ${e.message}`);
        }
    }
    const checkRequired = (list?: Array<keyof AnyRow>) => {
        if (list && !result.end && result.name) {
            for (const k of list) {
                if (result[k] === undefined || result[k] === '') {
                    const l = upcase(k);
                    const type = row.Type ?? '<missing type>';
                    const name = row.Name ?? '<missing name>';
                    const start =row.Start ?? '';
                    const field = `'${l}' of row ${type}/${name}@${start}`;
                    throw new Error(`Column ${field} is missing required key '${l}' in ${(row as any).Src}`);
                }
            }
        }
    };
    checkRequired(TYPES[result.type!].required);
    return result as AnyRow;
};
