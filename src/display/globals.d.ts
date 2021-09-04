/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Global ObservableHQ modules.
 *
 * @module
 */

declare var width: number;

declare var now: number;

declare var invalidation: Promise<void>;

declare function visibility<T>(value?: T): T;

declare function md(template: TemplateStringsArray, ...args: any[]): Element;

declare function html(template: TemplateStringsArray, ...args: any[]): Element;

declare function svg(template: TemplateStringsArray, ...args: any[]): Element;

declare function dot(template: TemplateStringsArray, ...args: any[]): Element;

declare function tex(template: TemplateStringsArray, ...args: any[]): Element;
