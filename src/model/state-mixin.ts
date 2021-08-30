/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { IItem, IState, Type , IFScenario, ItemState, RowType, ItemImpl, ItemStates, StateItem} from "../types";

/**
 * Mixin and support for fields that vary over time.
 * @module
 */


export type Constructor<T extends {}, P extends any[] = any[]> = abstract new (...args: P) => T;

export type State<T extends Type> = ItemImpl<T> & IState<T>;

export type StateMixinConstructor<
    T extends Type, Base extends Constructor<ItemImpl<T>, [ItemImpl<T>, ...any[]]>,
    P extends [ItemImpl<T>, ...any[]] = [ItemImpl<T>, ...any[]]
    >
    = Constructor<InstanceType<Base> & IState<T> & { [Symbol.toStringTag]: string; }, P>;

export function StateMixin<
    T extends Type,
    P extends [row: ItemImpl<T>, scenario: IFScenario, state: ItemState<T>] = [row: ItemImpl<T>, scenario: IFScenario, state: ItemState<T>]
    >(Base: abstract new (row: RowType<T>, ...args: any[]) => IItem<T>):
        StateMixinConstructor<T, abstract new (row: ItemImpl<T>, ...args: any[]) => ItemImpl<T>, P> {
    abstract class StateMixin extends Base implements IState<T> {
        readonly state: ItemState<T>;
        readonly scenario: IFScenario;
        readonly item: ItemImpl<T>;
        #tag?: string = undefined;
        constructor(row: ItemImpl<T>, scenario: IFScenario, state: ItemState<T>) {
            super(row, scenario, state);
            this.item = row;
            this.scenario = scenario;
            this.state = state;
        }

        /**
         * Tag instances with the type and name for easy recognition.
         * @internal
         */
        get [Symbol.toStringTag]() {
            try {
                return this.#tag
                    ?? (this.#tag = `${this.type}State[${this.name} #${this.state?.step?.step ?? '??'}]`);
            } catch {
                // This can happen when viewing the prototype, because #tag isn't declared
                // on the prototype. That screws up ObservableHQ's inspector, which gets an unhandled
                // failed promise and never completes if you try to expand the real instance, because
                // it died on the prototype.
                return `${this.type}State.prototype`;
            }
        }
    }
    return StateMixin as unknown as StateMixinConstructor<T, abstract new (row: ItemImpl<T>, ...args: any[]) => ItemImpl<T>, P>;
}
