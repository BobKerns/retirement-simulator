/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Item } from "./item";
import { StateMixin } from "./state-mixin";
import { IFScenario, ItemImpl, ItemState, IText, RowType, Type } from "../types";
import { classChecks } from "../utils";
import { CalendarStep } from "../calendar";
/**
 * A configured item of text used in model explanations, etc.
 */
export class TextItem extends Item<'text'> implements IText {
    text: string;
    constructor(row: RowType<'text'>, scenario: IFScenario) {
        super(row, scenario);
        this.text = row.text;
    }


    *states<T extends Type>(start: CalendarStep): Generator<ItemState<'text'>, any, ItemState<'text'>> {
        let item: ItemImpl<'text'> | null = this as ItemImpl<'text'>;
        let step = start;
        while (true) {
            let text = this.text;
            const next = yield { item, step, text };
            step = next.step;
            item = (item.temporal.onDate(step.start) as this) ?? null;
            if (item === null) return;
        }
    }
}

export class TextItemState extends StateMixin(TextItem) {
    constructor(row: ItemImpl<'text'>, scenario: IFScenario, state: ItemState<'text'>) {
        super(row, scenario, state);
    }
}

export const [isTextItem, toTextItem, asTextItem] = classChecks(TextItem);
