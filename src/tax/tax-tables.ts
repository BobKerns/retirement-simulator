/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { StateCode } from "../states";
import { CALIFORNIA_TAX } from "./california";
import { FEDERAL_TAX } from "./federal";
import { TaxYearTables } from "./tax-util";

/**
 * Tax tables.
 */
export const TAX_TABLES: Partial<{[k in StateCode]: TaxYearTables }> = {
    US: FEDERAL_TAX,
    CA: CALIFORNIA_TAX
};
