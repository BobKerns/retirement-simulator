/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { IItem, IState, Type } from "./types";
import { TimeLength, TimeStep } from "./time";
import { Scenario } from "./scenario";

/**
 * Mixin and support for fields that vary over time.
 * @module
 */


export type AConstructor<T extends {}> = abstract new (...args: any[]) => T;
export type Constructor<T extends {}> = new (...args: any[]) => T;

export type State<T extends Type> = IItem<T> & IState<T>;

export type StateMixin<T extends Type> = Constructor<State<T>>;


export function StateMixin<T extends Type>(Base: AConstructor<IItem<T>>): StateMixin<T> {
    class StateMixinImpl extends Base implements IState<T> {
        readonly period: TimeStep;
        readonly interval: TimeLength;
        readonly scenario: Scenario;
        readonly item: IItem<T>;
        #tag?: string = undefined;
        constructor(...args: any[]) {
            super(...args)
            this.item = args[0];
            this.scenario = args[1] as Scenario
            this.period = args[2] as TimeStep;
            this.interval = args[3] as TimeLength;
        }

        /**
         * Tag instances with the type and name for easy recognition.
         * @internal
         */
        get [Symbol.toStringTag]() {
            return this.#tag
                ?? (this.#tag = `#${this.period?.step ?? '??'}: ${Base.name}[${this.name}]`);
        }

    }
    return StateMixinImpl;
}

