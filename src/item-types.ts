/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Tools for working with the various types of items.
 *
 * @module
 */

import { Type } from "./types";

/**
 * Type validation and conversion support data.
 */
export const TYPES: {[k in Type]: any} = {
    asset: {
        required: ['name', 'value']
    },
    expense: {
        required: ['name', 'value']
    },
    income: {
        required: ['name', 'value']
    },
    transfer: {
        required: ['name', 'spec']
    },
    incomeTax: {
        required: ['name', 'state', 'filingStatus', 'from']
    },
    liability: {
        required: ['name', 'value']
    },
    person: {
        required: ['name', 'birth', 'sex']
    },
    scenario: {
        required: ['name']
    },
    text: {
        required: ['name', 'text']
    }
}
