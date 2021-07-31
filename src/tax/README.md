# Income Tax Estimator

This is a limited-purpose income tax estimator for estimating taxes in retirement planning.

Since I live in California, I'm only implementing federal and California taxes, but feel free to offer additions.

The real complexity comes in determining the correct data to feed into these calculations:

* What retirement income is taxable.
* What capital gains will apply to; these must be supplied separately.
* What deductions you can take.
* Etc.

For example, depreciation, business expenses, etc. must be calculated separately and supplied
here as deductions. This then determines whether the standard deduction should be used instead.

Consult a tax or retirement planning professional if you need more precision or to understand
how (or whether) to use this in your situation.

## Main entry point

The main entry point is the [[computeTax]] function.

## An example call

```typescript
const exampleResult = computeTax({
  state: "california",
  income: {
    regular: 70000,
    socialSecurity: 30000
  },
  deductions: 2600,
  status: "married",
  spouse1,
  spouse2,
  dependents: 0,
  year: 2021
})
```
