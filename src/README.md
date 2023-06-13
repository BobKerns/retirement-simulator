# Retirement Simulator

Retirement-simulator library. It is intended to be used in an exploratory manner in an
[ObservableHQ](https://observablehq.com) notebook.

## Key Modelling Concepts

### Balance Sheet

These concepts are what you have; together, they determine your _net worth_.

```javascript
let net_worth = assets - liabilities
```

* [[Asset]]: What you own
* [[Liability]]: What you owe. Loans, mortages, debts.

### Cash Flow

Cash flow is money in or out. Together, they determine your _net income_, which can be positive or negative.

```javascript
let net_income = income - expense
```

* [[Expense]]
* [[Income]]

While technically, asset growth is reinvested investment income, we do not need to model it
that way, as it would complicate the picture with details. With investments in a protected tax-deferred retirement account,
with dividends and interest automatically reinvested, it is simpler to model as compound growth. However, nothing prevents
you from modeling it as an income stream adding to the asset.

### Other

* [[Transfer]] connects sources ([[Income]] or withdrawal from [[Asset]]) to [[Expense]]
* [[IncomeTax]] a tax based on income. Other taxes are an [[Expense]].
* [[Person]] A person, primarily used for taxes and age computations
* [[Scenario]] a particular configuration of the above
* [[Snapshot]] the state of a scenario at a point in time.

## Interfaces

The key modeling classes have corresponding interface types, to facilitate working with the raw data without instantiation
as a class instance.

* [[IAsset]]
* [[ILiability]]
* [[IExpense]]
* [[IIncome]]
* [[ITransfer]] connects sources ([[Income]] or withdrawal from [[Asset]]) to [[Expense]]
* [[IIncomeTax]] a tax based on income. Other taxes are an [[Expense]].
* [[IPerson]] A person, primarily used for taxes and age computations
* [[IScenario]] a particular configuration of the above
* [[ISnapshot]] the state of a scenario at a point in time.

## Other Facilities

* [[color]] Provides a stable set of colors for graphing.
* Interpolated [[actuary]] data [[SS_2020_2023]].
* [[calendar]] provides utilities for working with time in relevant ways.
