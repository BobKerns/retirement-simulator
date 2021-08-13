/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * [[include:src/README.md]]
 *
 * @packageDocumentation
 * @preferred
 * @module Index
 */

export * from './actuary';
export * from './calendar';
export * from './color';
export * from './construct';
export * from './enums';
export * from "./input";
export * from './load';
export * from "./model";
export * from './states';
export * from './tagged';
export * from './tax';
export * from './temporal';
export * from './types';
export * from './utils';

/**
 * This is substituted at build time.
 */
const REPLACE_VERSION = {
    version: '0.0.0',
    mode: 'development'
};
/**
 * Information about this version.
 */
export const VERSION = Object.freeze(REPLACE_VERSION);
