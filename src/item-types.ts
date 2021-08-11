/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Type } from "./types";

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
    incomeStream: {
        required: ['name', 'spec']
    },
    incomeTax: {
        required: ['name', 'state']
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