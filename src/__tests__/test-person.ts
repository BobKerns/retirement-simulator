/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { UTC } from "../calendar";
import { construct } from "../construct";
import { asYear } from "../tagged";

describe('Person', () => {
    test('Simple', () =>
        expect(construct([{
                name: 'spouse1',
                prettyName: "Bob",
                type: 'person',
                sex: 'male',
                categories: [],
                scenarios: ['Default'],
                sort: 0,
                start: UTC(1950),
                birth: UTC('1950')
            }],
            'person', [], asYear(2080)))
            .toBeDefined());

});