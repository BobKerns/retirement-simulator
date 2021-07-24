/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Item } from "./item";
import { IPerson, Row, Sex } from "./types";

export class Person extends Item<'person'> implements IPerson {
    birth: Date;
    sex: Sex;
    constructor(row: Row<'person'>) {
        super(row);
        this.birth = row.birth;
        this.sex = row.sex;
    }
}