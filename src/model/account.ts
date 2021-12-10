/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Representation of an account.
 *
 * @module
 */

import { MonetaryType } from "../types";
import { Monetary } from "./monetary";


export abstract class Account<T extends MonetaryType> extends Monetary<T> {

}
