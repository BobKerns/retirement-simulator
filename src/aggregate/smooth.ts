/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Smoothing operation
 *
 * @module
 */

import { EnhancedGenerator, Sync } from 'genutils';
import { Kernel } from './kernel';

export const smooth = <T>(kernel: Kernel<T>) => {
    return (list: Iterable<T>): EnhancedGenerator<T, void, void> => {
        function* smooth(list: Iterable<T>) {
            let preroll = 0;
            for (const item of list) {
                const result = kernel.next(item);
                if (result === null) {
                    preroll++;
                } else {
                    yield result;
                }
            }
            for (let i = 0; i < preroll; i++) {
                yield kernel.next();
            }
        }
        return Sync.enhance(smooth(list));
    }
};
