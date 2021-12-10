/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * [[include:src/README.md]]
 *
 * @module Index
 */

export * from './aggregate';
export * from './calendar';
export * from './construct';
export * from './display';
export * from './enums';
export * as G from 'genutils';
export * from "./io";
export * from './math';
export * from "./model";
export * from './observablehq';
export * from './sort';
export * from './tagged';
export * from './sim';
export * from './tax';
export * from './time';
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
