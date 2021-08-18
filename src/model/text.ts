/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Item } from "./item";
import { StateMixin } from "./state-mixin";
import { IFScenario, ItemImpl, ItemState, IText, RowType } from "../types";
import { classChecks } from "../utils";
/**
 * A configured item of text used in model explanations, etc.
 */
export class TextItem extends Item<'text'> implements IText {
    text: string;
    constructor(row: RowType<'text'>) {
        super(row);
        this.text = row.text;
    }
}

export class TextItemState extends StateMixin(TextItem) {
    constructor(row: ItemImpl<'text'>, scenario: IFScenario, state: ItemState<'text'>) {
        super(row, scenario, state);
    }
}
export const [isTextItem, toTextItem, asTextItem] = classChecks(TextItem);
