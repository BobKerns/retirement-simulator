/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { actuary, ActuaryDatum } from "../actuary";
import { person_1, person_2 } from "./samples";

describe("Actuary", () => {
    test("age male", () => expect(actuary(1, 'male')).toEqual({n: 99370, p: 0.000426, years: 75.45}));
    test("age female", () => expect(actuary(1, 'female')).toEqual({n: 99477, p: 0.000342, years: 80.39}));

    const january = new Date(2022, 0, 1);
    const july = new Date(2022, 6, 3); // Midyear
    test("person male", () => expect(actuary(person_2, january)).toEqual({n: 89345, p: 0.007766, years: 25.5}));
    test("person female", () => expect(actuary(person_1, january)).toEqual({n: 93755, p: 0.004813, years: 28.81}));

    const round = (n: number, f: number) => Math.round(n * f) / f;
    const roundDatum = (d: ActuaryDatum) => ({n: round(d.n, 0.5), p: round(d.p, 1000), years: round(d.years, 100)});

    test("person male interpolate", () => expect(roundDatum(actuary(person_2, july))).toEqual({n: 88996, p: 0.008, years: 25.1}));
    test("person female interpolate", () => expect(roundDatum(actuary(person_1, july))).toEqual({n: 93530, p: 0.005, years: 28.37}));
});