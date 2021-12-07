/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Perform averaging on an object field
 *
 * @module
 */

import { T } from 'ramda';
import { extractor } from './aggregate';
import { naturalCMP } from '..';
import { asInteger, Integer } from '../tagged';
import { keys } from '../utils';
import { KeyFn } from './aggregate-types';
import { Kernel } from './kernel';

type GroupItem<T, K extends keyof T, F extends keyof T> = [key: K, value: T[F], kernel: Kernel<T[F]>, item: T];

export class KernelObject<
        T extends object,
        F extends keyof T = keyof T,
        K extends keyof T = keyof T
    > extends Kernel<T>
{    readonly #keyfn: KeyFn<T, K>;
    readonly #field: F;
    readonly #subkernelFn: (window: Integer) => Kernel<T[F]>;
    readonly #itemLists = {} as Record<K, T[]>;
    readonly #kernels = {} as Record<K, Kernel<T[F]>>;
    readonly #input = [] as GroupItem<T,K, F>[];
    #results?: Generator<T, void, void>;
    constructor(window: Integer, field: F, subkernel: (window: Integer) => Kernel<T[F]>, key: K | KeyFn<T, K> = '' as K) {
        super(window);
        this.#field = field;
        this.#subkernelFn = subkernel;
        this.#keyfn = extractor(key);
    }

    #index(item: T): void {
        const key = this.#keyfn(item);
        const itemList = this.#itemLists[key] ?? (this.#itemLists[key] = []);
        const kernel = this.#kernels[key] ?? (this.#kernels[key] = this.#subkernelFn(this.window));
        const value = item[this.#field];
        this.#input.push([key, value, kernel, item]);
        itemList.push(item);
    }

    next(): T;
    next(item: T):T | null;
    next(item?: T) {
        if (item !== undefined) {
            // We do an entire setup pass first, so we can process them by group but return the results
            // in the same order as presented.
            this.#index(item);
            return null;
        }

        const field = this.#field;
        const kernels = this.#kernels;
        const input = this.#input;
        const itemLists = this.#itemLists;

        function* objects(
            items: GroupItem<T, K, F>[],
            field: F,
            kernels: Record<K, Kernel<T[F]>>,
            itemLists: Record<K, T[]>
        ):
            Generator<T, void, void>
        {
            const ids = keys(kernels);
            let remaining = items.length;
            let timeout = remaining * 2; // To avoid infinite loops in the event of a bug.
            for (const entry of items) {
                const [id, oldValue, kernel, item] = entry;
                const value = kernel.next(oldValue);
                if (value !== null) {
                    const oitem = itemLists[id].shift();
                    yield {...oitem!, [field]: value};
                    --remaining;
                }
            }
            while (remaining > 0) {
                for (const id of ids) {
                    const kernel = kernels[id];
                    const value = kernel.next();
                    if (value !== null) {
                        const oitem = itemLists[id].shift();
                        yield {...oitem!, [field]: value};
                        --remaining;
                    }
                }
                if (--timeout < 0) {
                    throw new Error(`Underpop`);;
                }
            }
        }
        const results = this.#results
            ?? (this.#results = objects(input, field, kernels, itemLists));
        const result = results.next();
        if (result.done) {
            throw new Error(`Overpop`);
        }
        return result.value;
    }
}
