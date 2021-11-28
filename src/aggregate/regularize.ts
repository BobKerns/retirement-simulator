/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Take a sequence and ensure that all values are present for each combination date and id
 *
 * @module
 */

import { aggregate } from './aggregate';
import { mergeList } from './merge-list';
import { Id, Type} from '../types';
import { naturalCMP } from '../sort';
import { keys } from '../utils';
import {  ItemImpl } from '..';
import { EnhancedGenerator } from 'genutils';

type NumberField<T extends object, K extends keyof T = keyof T> = K extends string ? T[K] extends number ? K : never : never;

let foo: NumberField<{a: 5}>;

export type Regularizable = { id: Id, type?: Type, name?: string, prettyName?: string, sort?: number, item?: ItemImpl<Type>, date: Date; };

const collect = aggregate<Regularizable, Regularizable[]>({key: 'date', merge: mergeList}) as
    (<T extends Regularizable>(seq: Iterable<T>) => EnhancedGenerator<T[], void, void>);

export const regularize = <T extends Regularizable, K extends NumberField<T> = NumberField<T>>(key: K) => {
    return (seq: Iterable<T>) => {
        const names: { [k in Id]: string } = {};
        const prettyNames: { [k in Id]: string } = {};
        const types: { [k in Id]: Type } = {};
        const sorts: { [k in Id]: number } = {};
        const items: { [k in Id]: ItemImpl<Type> } = {};
        for (const i of seq) {
            const id = i.id ?? i.item?.id;
            const name = i.name ?? i.item?.name;
            const prettyName = i.prettyName ?? i.item?.prettyName;
            const type = i.type ?? i.item?.type;
            const sort = i.sort ?? i.item?.sort;
            sorts[id] = sorts[id] ?? sort ?? 0;
            if (i.item) {
                items[id] = items[id] ?? i.item;
            }
            if (name) {
                names[id] = names[id] ?? name;
            }
            if (prettyName) {
                prettyNames[id] = prettyNames[id] ?? prettyName;
            }
            if (type) {
                types[id] = types[id] ?? type;
            }
        }
        const bySort = (a: Id, b: Id) =>
            a ===  b
            ? 0
            : naturalCMP(sorts[a] ?? 0, sorts[b] ?? 0)
                || naturalCMP(types[a], types[b])
                || naturalCMP(a, b);
        const ids = keys<Id>(sorts).sort(bySort);
        return collect(seq)
            .flatMap(l => {
                if (!l.length) return [];
                const date = l[0].date;
                const o = l.reduce((acc, t) => ((acc[t.id] = t), acc), {} as {[id: Id]: T});
                return ids.map(id => {
                    const name = names[id];
                    const prettyName = prettyNames[id];
                    const type = types[id];
                    const sort = sorts[id];
                    const item = items[id];
                    const value = o[id]?.[key] ?? 0;
                    return {
                        id, date,
                        ...(name ? {name} : {}),
                        [key]: value,
                        ...(type ? {type} : {}),
                        ...(prettyName ? {prettyName} : {}),
                        ...(sort !== undefined ? {sort} : {}),
                        ...(item ? {item} : {})
                    };
                });
            });
    };
};
