# Retirement Simulator Source Code

Source code for the retirement-simulator library.

## Key Modelling Concepts

* [[Asset]]
* [[Loan]]
* [[Expense]]
* [[Income]]
* [[IncomeStream]] connects sources ([[Income]] or withdrawal from [[Asset]]) to [[Expense]]
* [[IncomeTax]] a tax based on income. Other taxes are an [[Expense]].
* [[Scenario]] a particular configuration of the above
* [[Snapshot]] the state of a scenario at a point in time.

## Other Facilities

* [[color]] Provides a stable set of colors for graphing.
