# Changes for Retirement Simulator

## Version 0.2.0

__date: 2021-11-26__

* New simulation driver.
* Use pnpm as package manager.
* Fix [#15] Supply observable context
* Add rounded money functions
* New aggregation facility
* naturalCMP now works properly with dates.

## Version 0.1.17

__date: 2021-09-02__

* FIX [#4](https://github.com/BobKerns/retirement-simulator/issues/20) Document the model.
* FIX [#16](https://github.com/BobKerns/retirement-simulator/issues/20) Add plot routines to library.
* BUILD: We only need to build in Node 16.x. This way we can find build problems more quickly.

## Version 0.1.16

__date: 2021-09-01__

* Fix [#20](https://github.com/BobKerns/retirement-simulator/issues/20), implementing time series everywhere and
  making the actuary data available via the snapshots.

## Version 0.1.15

__date: 2021-09-01__

* FIX: [#19](https://github.com/BobKerns/retirement-simulator/issues/19), Time series items are
  only picking up the last one.
* FIX: Actuary probability data was starting with future age, rather than current.
* DOCS: Add [CODE_OF_CONDUCT.md](ODE_OF_CONDUCT.md)
* DOCS: Add [CONTRIBUTING.md](CONTRIBUTING.md)

### Work in Progress

Internal changes toward future enhancements.

* WIP: [#21](https://github.com/BobKerns/retirement-simulator/issues/21), Scenario Inheritance
* WIP: [#14](https://github.com/BobKerns/retirement-simulator/issues/14), Support min/max amounts in incomeStream

## Version 0.1.14

__date: 2021-08-31__

* Revert update node-fetch library (change to ES modules breaks doc publishing.

## Version 0.1.13

__date: 2021-08-31__

* Bring in the rest of the actuary functionality.
* Fix how expenses and income handle their start dates
* Make the snapshots update on Scenario.setEnd(_date_)
* Update node-fetch library.

## Version 0.1.12

__date: 2021-08-30__

* BUILD" Make `toStringTag` on items survive minification

## Version 0.1.11

__date: 2021-08-30__

* FIX: Loans end when paid off.

## Version 0.1.10

__date: 2021-08-30__

* BUILD: Use `git worktree` to bring the `gh-pages` branch into the CI build.
* Point the NPM homepage link to our Github Pages site.
* BUILD: Update typedoc

## Version 0.1.9

__date: 2021-08-30__

* BUILD: put the landing page in the right place
* BUILD: Use `git workflow` to pull in the `gh-pages` branch for local builds
* BUILD: Investigate using `git workflow` for the CI builds as well.

## Version 0.1.8

__date: 2021-08-29__

* Use the right start date.

## Version 0.1.7

__date: 2021-08-29__

* Let the formatters handle `undefined` and empty strings.
* Fix circular dependency.

## Version 0.1.6

__date: 2021-08-29__

* Fix some format glitches.

## Version 0.1.5

__date: 2021-08-29__

* Add Fmt.date and ColTypes.date

## Version 0.1.4

__date: 2021-08-29__

* `START` and `END` are now controllable parameters
* More and better sort functions
* Formatting and table facilities.
* DOC: Fix bad link and other glitches

## Version 0.1.3

__date: 2021-08-29__

* Forgot to add the landing page to git in the build.

## Version 0.1.2

__date: 2021-08-29__

* Add a landing page at the root of the documentation site.

## Version 0.1.1

__date: 2021-08-28__

* Documentation build didn't get invoked on release.

## Release 0.1.0

__date: 2021-08-28__

Initial baseline release.
