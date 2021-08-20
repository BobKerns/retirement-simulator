# Our Data Model

This needs some diagrams and explanation.

## The Model Elements

* [[Scenario]] A distinct scenario to be simulated.
  * [[Snapshot]] captures the state of an entire [[Scenario]] at a point in time.
* [[Person]], typically individual or spouses or domestic partners.
* [[Income]], a source of new income
* [[Expense]], something that costs money
* [[Asset]], something that we own. This can be something that can be potentially sold, such as a house or car, or an investment.
* [[Liability]], something that we need to pay in the future or over time. This can be loan, or a committed expense, such as needed maintenance.
* [[IncomeStream]], a plan combining [[Income]] and drawing down [[Asset|Assets]], to supply funds to meet [[Expense|Expenses]].
* [[IncomeTax]], information to estimate income-based taxes that will need to be paid.
* [[Text]], arbitrary user-supplied text to be used where needed.
