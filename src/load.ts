/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { DSVRowArray } from 'd3';
import { csvParse } from 'd3-dsv';
import { isString } from './tagged';

export const parse = (text: string) => {
    return csvParse(text);
}

export interface Requestable {
    text(): Promise<string> | string;
}

/**
 * Load data from the specified URL.
 * @param url URL to load the data from
 */
export async function loadFrom(url: string | Promise<string>): Promise<DSVRowArray>;
export async function loadFrom(request: Requestable | Promise<Requestable>): Promise<DSVRowArray>;
export async function loadFrom(urlOrRequest: string | Requestable | Promise<string> | Promise<Requestable>): Promise<DSVRowArray> {
    const src = await urlOrRequest;
    if (isString(src)) {
        return loadFrom(fetch(src))
    }
    return parse(await src.text());
};
