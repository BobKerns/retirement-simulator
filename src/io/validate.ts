/*
 * Copyright 2021 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

import { TypeCoercion } from "../tagged";

export type ValidationSpec<T extends any> = {
    [k in keyof T & string]: TypeCoercion<T[k]>;
};

/**
 *
 * @param spec A specification of the validation/coercion to be performed.
 * @returns
 */
export const validator = <T>(spec: ValidationSpec<T>) =>
    (obj: any): T => {
        const result: any = {};
        for (const k in spec) {
            const c = spec[k as keyof T & string];
            const v = obj[k];
            if (Array.isArray(c)) {
                const validate = validator(c[0]);
                result[k] = v.map(validate);
            } else if (v.constructor === Object) {
                const validate = validator(c);
                result[k] = validate(v);
            } else {
                result[k] = c(v);
            }
        }
        return result as T;
    };
