# Our Data Model

Our simulation operates on one or more scenarios. Each scenario contains information about
how [[Income]] and [[Expense|Expenses]]]] vary with time (cash flow), and what [[Asset|Assets]]
and [[Liabilities]] we have available (net worth).

These are connected via [[IncomeStream|IncomeStreams]], which represent strategies for moving
funds between destinations.

In addition, a scenario contains information about the [[Person|People]] involved,
[[TextItem|Text Items]] used to construct explanations that vary over time, as well
as allowing personalized explanations while maintaining privacy and security.

This diagram shows how these elements relate. You can click on the items for more information.

<!-- Note: Blank lines cannot be used below! -->
```mermaid
flowchart LR
    I((Outside)) ===>|receive| Income
    direction TB
    subgraph inside [" "]
        subgraph ScenarioContent1 [" "]
            direction LR
            Person
            Text
        end
    Scenario ==>|contains| ScenarioContent & Person & Text
            Person{{Person}}
            Text[/Text/]
    subgraph ScenarioContent [" "]
        direction TB
        subgraph NetWorth
            direction LR
            Asset[(Asset)] -.->|interest|Asset
            Liability[(Liability)] -.->|interest| Liability
        end
        subgraph expenses [" "]
            direction TB
            Expense
            IncomeTax[/IncomeTax\]
        end
        IncomeStream -.->|withdraw| IncomeStream
        IncomeStream <-.-|deposit| IncomeStream
        Asset -->|withdraw| IncomeStream
        IncomeStream -->|deposit| Asset
        Liability -->|borrow| IncomeStream
        IncomeStream -->|pay| Liability
        Income ==>|withdraw| IncomeStream
        IncomeStream>IncomeStream] ==>|pay| Expense & IncomeTax
    end
  end
  IncomeTax & Expense ==> E((Outside))
style Asset fill:#8f8,color:#00f
style Income fill:#8f8,color:#00f
style Liability fill:#f79,color:#00f
style Expense fill:#f79,color:#00f
style IncomeTax fill:#f4c,color:#00f
style IncomeStream fill:#ff8,color:#00f
style I fill:#ef2,color:#000
style E fill:#fd2,color:#000
style Person fill:#fd6,color:#00f
style Text fill:#fff,color:#00f
style Scenario fill:#eef,color:#00f
click Asset "../classes/model_asset.Asset.html" "Asset class"
click Liability "../classes/model_liability.Liability.html" "Liability class"
click Income "../classes/model_income.Income.html" "Income class"
click Expense "../classes/model_expense.Expense.html" "Expense class"
click IncomeStream "../classes/model_income_stream.IncomeStream.html" "IncomeStream class"
click IncomeTax "../classes/model_income_tax.IncomeTax.html" "IncomeTax class"
click Person "../classes/model_person.Person.html" "Person class"
click Text "../classes/model_text.TextItem.html" "TextItem class"
linkStyle 0 stroke-width:6,stroke:#0f0
linkStyle 1 stroke-width:4,stroke:#77f
linkStyle 2 stroke-width:4,stroke:#77f
linkStyle 3 stroke-width:4,stroke:#77f
linkStyle 4 stroke-width:2,stroke:#0f0
linkStyle 5 stroke-width:2,stroke:#f00
linkStyle 6 stroke-width:2,stroke:#000
linkStyle 7 stroke-width:2,stroke:#000
linkStyle 8 stroke-width:2,stroke:#f00
linkStyle 9 stroke-width:2,stroke:#0f0
linkStyle 10 stroke-width:2,stroke:#f00
linkStyle 11 stroke-width:2,stroke:#0f0
linkStyle 12 stroke-width:6,stroke:#0f0
linkStyle 13 stroke-width:6,stroke:#f00
linkStyle 14 stroke-width:6,stroke:#f00
linkStyle 15 stroke-width:6,stroke:#f00
linkStyle 16 stroke-width:6,stroke:#f00
style inside fill:#aaf
style expenses fill:#fcc,stroke:#eef
style ScenarioContent fill:#eef,color:#000
style ScenarioContent1 fill:#eef,color:#000
style NetWorth fill:#eff,color:#000,font-style:italic
style engine fill:none,stroke:none,color:#eef,font-style:italic
classDef edgeLabel color:#000,background:#fed
```

## The Model Elements

* [[Scenario]] A distinct scenario to be simulated.
  * [[Snapshot]] captures the state of an entire [[Scenario]] at a point in time.
* [[Person]], typically individual or spouses or domestic partners.
* [[Income]], a source of new income
* [[Expense]], something that costs money
* [[Asset]], something that we own. This can be something that can be potentially sold, such as a house or car, or an investment.
* [[Liability]], something that we need to pay in the future or over time. This can be loan, or
  a committed expense, such as needed maintenance.
* [[IncomeStream]], a plan combining [[Income]] and drawing down [[Asset|Assets]],
  to supply funds to meet [[Expense|Expenses]].
* [[IncomeTax]], information to estimate income-based taxes that will need to be paid.
* [[TextItem]], arbitrary user-supplied text to be used where needed.
