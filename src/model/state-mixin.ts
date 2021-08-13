/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { IItem, IState, Type , IFScenario} from "../types";
import { asCalendarStep, CalendarStep } from "../calendar";
import { as } from "../tagged";
import type { asScenario } from "./scenario";
import { ConstructorType } from "genutils";

/**
 * Mixin and support for fields that vary over time.
 * @module
 */


export type AConstructor<T extends {}> = abstract new (...args: any[]) => T;
export type Constructor<T extends {}> = new (...args: any[]) => T;

export type State<T extends Type> = IItem<T> & IState<T>;

//export type StateMixin<T extends Type> = Constructor<State<T>>;

type AConstructorType<T extends abstract new (...args: any[]) => any> = T extends abstract new (...args: any[]) => infer R ? R : never;
export type StateMixinConstructor<T extends Type, Base extends AConstructor<IItem<T>>> = Constructor<AConstructorType<Base> & IState<T>>;

export function StateMixin<T extends Type>(Base: AConstructor<IItem<T>>): StateMixinConstructor<T, typeof Base> {
    class StateMixin extends Base implements IState<T> {
        readonly period: CalendarStep;
        readonly scenario: IFScenario;
        readonly item: IItem<T>;
        #tag?: string = undefined;
        constructor(...args: any[]) {
            super(...args)
            this.item = args[0];
            this.scenario = as(args[1])
            this.period = asCalendarStep(args[2]);
        }

        /**
         * Tag instances with the type and name for easy recognition.
         * @internal
         */
        get [Symbol.toStringTag]() {
            try {
                return this.#tag
                    ?? (this.#tag = `${Base.name}State[${this.name} #${this.period?.step ?? '??'}]`);
            } catch {
                // This can happen when viewing the prototype, because #tag isn't declared
                // on the prototype. That screws up ObservableHQ's inspector, which gets an unhandled
                // failed promise and never completes if you try to expand the real instance, because
                // it died on the prototype.
                return `${Base.name}State.prototype`;
            }
        }

    }
    return StateMixin;
}
