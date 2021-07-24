/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Item } from "./item";
import { IText, Row } from "./types";

export class TextItem extends Item<'text'> implements IText {
    text: string;
    constructor(row: Row<'text'>) {
        super(row);
        this.text = row.text;
    }
}