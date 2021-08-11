/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Data loading code that Jest cannot handle (due to ESM modules, etc.)
 * @module
 */

import { csvParse, DSVRowArray } from 'd3-dsv';
import { convert } from './input';
import { isString } from './tagged';
import { InputRow, Type } from './types';

export const parse = (text: string) => {
    return csvParse(text);
}

export interface Requested {
    text(): Promise<string> | string;
}

/**
 * Load data from the specified URL.
 * @param url URL to load the data from
 */
export async function loadFrom(url: string | Promise<string>, src: string, type: Type | 'index'): Promise<DSVRowArray>;
export async function loadFrom(request: Requested | Promise<Requested>, src: string, type: Type | 'index'): Promise<DSVRowArray>;
export async function loadFrom(urlOrRequest: string | Requested | Promise<string> | Promise<Requested>, src: string, type: Type | 'index'): Promise<any[]> {
    const url = await urlOrRequest;
    if (isString(url)) {
        const req = await fetch(url);
        if (!req.ok) {
            if (req.status) {
                throw new Error(`Could not load ${src}: ${req.status} ${req.statusText}`);
            } else {
                throw new Error(`CORS or netwoirk error loading ${src}`);
            }
        }
        return await loadFrom(req, src, type)
    }
    return parse(await url.text()).map(r => ({Type: type, ...r, Src: src}));
};

export const loadData = async (url: string) => {
    const base = url.replace(/[/][^/]+$/, '');
    const files = await loadFrom(url, url, 'index');
    const load = (f: any) => loadFrom(`${base}/${f.File}`, f.File!, f.Type as Type);
    const tables = await Promise.all(files.map(load));
    return tables
        .flatMap(i  => i as unknown as InputRow)
        .map(convert);
}

