/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Kerenl to construct a running average
 *
 * @module
 */

import { Integer } from '..';
import { sum } from '../math';
import { Kernel } from './kernel';

export class KernelAverage extends Kernel<number> {
    #pre?: number;
    #post?: number;

    constructor(window: Integer, pre?: number, post?: number) {
        super(window);
        this.#pre = pre;
        this.#post = post;
    }

    preroll(): void {
        while (this.queue.length < this.window) {
            this.queue.unshift(this.#pre ?? this.queue[0]);
        }
    }
    active() {
        return sum(...this.queue)/this.window;
    }

    postroll(): number {
        const result = this.#post ?? this.active();
        this.queue.push(result); // Extend the average
        return result;
    }
}
