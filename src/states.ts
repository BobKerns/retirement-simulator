/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * US State postal codes, plus US = Federal
 */
export const STATES = {
    "US": "Federal" as const,
    "AL": "Alabama" as const,
    "AK": "Alaska" as const,
    "AS": "American Samoa" as const,
    "AZ": "Arizona" as const,
    "AR": "Arkansas" as const,
    "CA": "California" as const,
    "CO": "Colorado" as const,
    "CT": "Connecticut" as const,
    "DE": "Delaware" as const,
    "DC": "District of Columbia" as const,
    "FM": "Federated States of Micronesia" as const,
    "FL": "Florida" as const,
    "GA": "Georgia" as const,
    "GU": "Guam" as const,
    "HI": "Hawaii" as const,
    "ID": "Idaho" as const,
    "IL": "Illinois" as const,
    "IN": "Indiana" as const,
    "IA": "Iowa" as const,
    "KS": "Kansas" as const,
    "KY": "Kentucky" as const,
    "LA": "Louisiana" as const,
    "ME": "Maine" as const,
    "MH": "Marshall Islands" as const,
    "MD": "Maryland" as const,
    "MA": "Massachusetts" as const,
    "MI": "Michigan" as const,
    "MN": "Minnesota" as const,
    "MS": "Mississippi" as const,
    "MO": "Missouri" as const,
    "MT": "Montana" as const,
    "NE": "Nebraska" as const,
    "NV": "Nevada" as const,
    "NH": "New Hampshire" as const,
    "NJ": "New Jersey" as const,
    "NM": "New Mexico" as const,
    "NY": "New York" as const,
    "NC": "North Carolina" as const,
    "ND": "North Dakota" as const,
    "MP": "Northern Mariana Islands" as const,
    "OH": "Ohio" as const,
    "OK": "Oklahoma" as const,
    "OR": "Oregon" as const,
    "PW": "Palau" as const,
    "PA": "Pennsylvania" as const,
    "PR": "Puerto Rico" as const,
    "RI": "Rhode Island" as const,
    "SC": "South Carolina" as const,
    "SD": "South Dakota" as const,
    "TN": "Tennessee" as const,
    "TX": "Texas" as const,
    "UT": "Utah" as const,
    "VT": "Vermont" as const,
    "VI": "Virgin Islands" as const,
    "VA": "Virginia" as const,
    "WA": "Washington" as const,
    "WV": "West Virginia" as const,
    "WI": "Wisconsin" as const,
    "WY": "Wyoming" as const
};

export type StateCode = keyof typeof STATES;
export type StateName = (typeof STATES)[StateCode];