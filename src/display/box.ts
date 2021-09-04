/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Box wrapper
 *
 * @module
 */

/**
 * NOP for the moment. Replaces:
 *
 * ```javascript
 * html`<div style='border: 1px solid blue; padding: 5px; margin-right: 1px;'> ${content} </div>`
 * ```
 *
 * @param e
 * @returns
 */
export const box = (content: Element | string) =>
    html`<div style='border: 1px solid blue; padding: 5px; margin-right: 1px;'> ${content} </div>`;
