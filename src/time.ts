/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { UTC } from "./calendar";

/**
 * The default simulation time period
 *
 * @module
 */


const start = new Date();
/**
 * The default start date is the start of the next month.
 */
export let START = start.getUTCDate() === 1
    ? UTC(start.getUTCFullYear(), start.getUTCMonth())
    : start.getUTCMonth() <= 11
        ? UTC(start.getUTCFullYear(), start.getUTCMonth() + 1)
        : UTC(start.getUTCFullYear() + 1, 0);

/**
 * The default end date is 50 years from the start.
 */
export let END = UTC(START.getUTCFullYear() + 50, START.getUTCMonth());
