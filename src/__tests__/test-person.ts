/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { construct } from "../construct";
import { asYear } from "../tagged";
import { person_1 } from "./data/samples";

describe('Person', () => {
    test('Simple', () =>
        expect(construct(
            [person_1],
            'person', [], asYear(2080)
        ))
        .toBeDefined());

});