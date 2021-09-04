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

declare type TemplateLiteralArg0 = string[] & {raw: string};
declare type TemplateLiteral<T> = (template: TemplateLiteralArg0, ...args: any[]) => T;
declare function md(template: TemplateLiteralArg0, ...args: any[]): Element;

declare function html(template: TemplateLiteralArg0, ...args: any[]): Element;

declare function svg(template: TemplateLiteralArg0, ...args: any[]): Element;

declare function dot(template: TemplateLiteralArg0, ...args: any[]): Element;

declare function tex(template: TemplateLiteralArg0, ...args: any[]): Element;
