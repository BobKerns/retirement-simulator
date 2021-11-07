/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Various math utility functions
 *
 * @module
 */

import { makeSummer } from './utils';
import type {Integer} from './tagged';
import { asInteger } from './tagged';

/**
 * {@link Integer} version of `Math.floor`
 */
export const floor = Math.floor as <T extends number>(n: T) => Integer & T;
/**
 * {@link Integer} version of `Math.ciel`
 */
export const ceil = Math.ceil as <T extends number>(n: T) => Integer & T;
/**
 * {@link Integer} version of `Math.round`
 */
export const round = Math.round as <T extends number>(n: T) => Integer & T;

export const max = Math.max as <T extends number>(...n: T[]) => T;

export const min = Math.min as <T extends number>(...n: T[]) => T;

/**
 * A higher-order-function that produces a rounding function that rounds to the nearest _n_.
 * @param n scale of rounding
 * @param arg The number being rounded
 * @returns
 */
export const roundTo = (n: number) => <T extends number>(arg: T) => (round(arg / n) * n) as T;
/**
 * {@link Integer} version of `Math.trunc`
 */
export const trunc = Math.trunc as <T extends number>(n: T) => Integer & T;

/**
 * {@link Integer} version of `n % m`
 */
export const imod = (n: Integer, m: Integer) => trunc(n % m);

/**
 * {@link Integer} division.
 */
export const idiv = (n: Integer, d: Integer) => trunc(n / d);

/**
 * {@link Integer} increment
 */
export const incr = (n: Integer) => asInteger(n + 1);
/**
 * {@link Integer} decrement
 */
export const decr = (n: Integer) => asInteger(n - 1);

/**
 * We need to defer the deinition of isummer2 until the module system is fully loaded.
 * @returns the isum function
 */
const makeIsum = () => {
    let isummer2: (l: Integer[]) => Integer;
    return (...n: Integer[]) => {
        if (!isummer2) {
            isummer2 = makeSummer<Integer, Integer>(asInteger, asInteger);
        }
        return isummer2(n);
    }
}

/**
 * Sum the {@link Integer} arguments as an {@link Integer}
 */
export const isum = makeIsum();
