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
export * from './asset';
export * from './color';
export * from './construct';
export * from './expense';
export * from './income';
export * from './income-stream';
export * from './income-tax';
export * from './item';
export * from './liability';
export * from './monetary';
export * from './person';
export * from './scenario';
export * from './snapshot';
export * from './state-mixin';
export * from './states';
export * from './tagged';
export * from './tax/index';
export * from './text';
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
