/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Item } from "./item";
import { StateMixin } from "./state-mixin";
import { IFScenario, ItemImpl, ItemState, IText, RowType, SimContext, Stepper, Type } from "../types";
import { classChecks } from "../utils";
import { CalendarStep } from "../calendar";
/**
 * A configured item of text used in model explanations, etc.
 *
 * **Key fields:**
 * * {@link text}
 */
export class TextItem extends Item<'text'> implements IText {
    text: string;
    constructor(row: RowType<'text'>, scenario: IFScenario) {
        super(row, scenario);
        this.text = row.text;
    }


    *stepper<T extends Type>(start: CalendarStep, ctx: SimContext): Stepper<'text'> {
        let date = start.start;
        while (true) {
            let text = date >= this.start ? this.text : '';
            const next = yield { text };
            date = next.date;
        }
    }
}

export class TextItemState extends StateMixin(TextItem) {
    constructor(row: ItemImpl<'text'>, scenario: IFScenario, state: ItemState<'text'>) {
        super(row, scenario, state);
    }
}

export const [isTextItem, toTextItem, asTextItem] = classChecks(TextItem);
