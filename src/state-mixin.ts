/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { Asset, Type } from ".";
import { Item } from "./item";
import { ItemKey } from "./types";

/**
 * Mixin and support for fields that vary over time.
 * @module
 */


type AConstructor<T extends {}> = abstract new (...args: any[]) => T;


function State<SBase extends AConstructor<Item<Type>>>(Base: SBase) {
    abstract class GState {
        readonly frobule: number;
        constructor(...args: any[]) {
            //super(...args)
            this.frobule = 3;
        }

    }
    return GState;
}

// export const SAsset = State(Asset);
