/*
 * Copyright © 2021 by Bob Kerns. Licensed under MIT license.
 */

// noinspection JSUnusedGlobalSymbols
export default {
    preset: 'ts-jest',
    testMatch: [
        "**/__tests__/*.ts"
    ],
    "transformIgnorePatterns": [
        "/node_modules/(?!d3-[^/]+)/"
    ],
    testPathIgnorePatterns: [
        "/node_modules/",
        "/build/"
    ],
    rootDir: "src",
    "maxConcurrency": 10
};
