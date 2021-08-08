/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * Tax tables by state.
 */

import { StateCode } from "../states";
import { CALIFORNIA_TAX } from "./california";
import { FEDERAL_TAX } from "./federal";
import { TaxYearTables } from "./tax-util";

/**
 * Tax tables by state.
 */
export const TAX_TABLES: Partial<{[k in StateCode]: TaxYearTables }> = {
    /**
     * Federal tax tables
     */
    US: FEDERAL_TAX,
    /**
     * California state tax tables.
     */
    CA: CALIFORNIA_TAX
};
