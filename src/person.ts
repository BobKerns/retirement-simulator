/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Item } from "./item";
import { Age, asAge, asIAge, floor, IAge, Year } from "./tagged";
import { calculate_age } from "./time";
import { IPerson, Row, Sex } from "./types";

/**
 * A person (typically a spouse or domestic partner). Birth date and sex must be specified
 * for correct actuarial data.
 */
export class Person extends Item<'person'> implements IPerson {
    birth: Date;
    sex: Sex;
    constructor(row: Row<'person'>) {
        super(row);
        this.birth = row.birth;
        this.sex = row.sex;
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