/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Item } from "./item";
import { Age, asAge, asIAge, IAge, Probability, Year } from "../tagged";
import { floor } from '../math';
import { calculate_age, CalendarStep, END_YEAR, TODAY, YEAR } from "../calendar";
import { IFPerson, IFScenario, ItemImpl, ItemState, RowType, Sex, SimContext, Stepper, Type } from "../types";
import { classChecks } from "../utils";
import { range } from "genutils";
import { actuary, compute_probabilities, SS_TABLE } from "../sim/actuary";
import { StateMixin } from "./state-mixin";

/**
 * A person (typically a spouse or domestic partner). Birth date and sex must be specified
 * for correct actuarial data.
 *
 * **Key fields:**
 * * {@link prettyName}
 * * {@link birth}
 * * {@link sex}
 */
export class Person extends Item<'person'> implements IFPerson {
    birth: Date;
    sex: Sex;
    expectency: number;
    expectencies: number[];
    #survivalProbabilities?: Probability[];
    constructor(row: RowType<'person'>, scenario: IFScenario) {
        super(row, scenario);
        this.birth = row.birth;
        this.sex = row.sex;
        const age = floor(this.age(TODAY));
        this.expectency = SS_TABLE.data[age]?.[this.sex].years;
        this.expectencies = range(0, END_YEAR - YEAR + 1)
            .map((y) => SS_TABLE.data[asIAge(age + y)]?.[this.sex].years)
                .asArray()
    }

    *stepper<T extends Type>(start: CalendarStep, ctx: SimContext): Stepper<'person'> {
        const survivalProbabilities = this.survivalProbabilities;
        let step = start;
        let date = start.start;
        while (true) {
            const age = this.age(step.start);
            const survival = survivalProbabilities[step.step];
            const {n, p, years} = actuary(this, step.start);
            ctx.addTimeLine('age', date, this, { age, expectancy: years});
            const next: ItemState<'person'> = yield { age, survival, n, mortality: p, expected: years };
            step = next.step;
            date = next.date;
            if (step.start >= this.start) {
                if (n === 0 && p === 1 && years === 0) return;
            }
        }
    }

    /**
     * Get the fractional age on the date of interest.
     * @param date the date of interest.
     */
    age(date: Date): Age;
    /**
     * Obtain the integer age reached on the birthday occurring in the specified year.
     * @param year Year as an integer
     */
    age(year: Year): Age;
    age(date: Date | Year): Age {
        if (date instanceof Date) {
           return calculate_age(this.birth, date);
        }
        return asAge(date - this.birth.getUTCFullYear());
    }

    /**
     * An array of the probabilities of dying in the nth subsequent year.
     */
    get survivalProbabilities(): Probability[] {
        const [start, end] = this.scenario.dateRange;
        return this.#survivalProbabilities ?? (this.#survivalProbabilities = compute_probabilities(this, end));
    }

    /**
     * Obtain the integer age on a specified date. This is used for things like tax computation
     * where the age is treated as a year-based threshold or as a table index.
     * @param date Date of interest
     */
    iage(date: Date): IAge;
    /**
     * Obtain the integer age reached on the birthday occurring in the specified year.
     * @param year Year as an integer
     */
    iage(year: Year): IAge;
    iage(date: Date | Year): IAge {
        if (date instanceof Date) {
           return asIAge(floor(calculate_age(this.birth, date)));
        }
        return asIAge(date - this.birth.getUTCFullYear());
    }
}


export class PersonState extends StateMixin(Person) {
    constructor(row: ItemImpl<'person'>, scenario: IFScenario, state: ItemState<'person'>) {
        super(row, scenario, state);
    }
}

export const [isPerson, toPerson, asPerson] = classChecks(Person);
