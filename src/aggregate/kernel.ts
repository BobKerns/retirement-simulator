/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Integer } from "../tagged";
import { Throw } from "../utils";

/**
 * Data filtering kernels.
 *
 * @module
 */

const enum KernelState {
    PREROLL, ACTIVE, POSTROLL
};

/**
 * An object that processes each item, producing new items, possibly with a
 * delay to account for considering neighboring items.
 */
export abstract class Kernel<T> {
    readonly window: Integer;
    readonly queue: T[] = [];

    #state: KernelState = KernelState.PREROLL;

    constructor(window: Integer) {
        this.window = window;
    }

    next(item: T): T | null;
    next(): T;
    next(item?: T): T | null {
        switch (this.#state) {
            case KernelState.PREROLL: {
                if (item === undefined) {
                    this.#state = KernelState.POSTROLL;
                    return this.next();
                }
                this.queue.push(item);
                this.preroll();
                if (this.queue.length === this.window) {
                    this.#state = KernelState.ACTIVE;
                    return this.active();
                }
                return null;
            }
            break;
            case KernelState.ACTIVE: {
                if (item === undefined) {
                    this.#state = KernelState.POSTROLL;
                    return this.next();
                }
                this.queue.shift();
                this.queue.push(item);
                return this.active();
            }
            break;
            case KernelState.POSTROLL: {
                const result = this.postroll();
                this.queue.shift() ?? Throw(`Overpop`);
                return result;
            }
            break;
        }
    }

    active(): T {
        return this.queue[0] ?? Throw(`Overpop`);
    }

    preroll() {
    }

    postroll() {
        return this.queue[0] ?? Throw(`Overpop`);
    }
}
