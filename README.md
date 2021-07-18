# Project Retirement Simulator

This library is code originally written for and will be used by an [ObservableHQ](https://observablehq.com) notebook.

## Features

* Secure—your data lives only in a .csv file that you create and your browser; nothing is sent to any server.
* Supports multiple scenarios
* Basic support for loan and mortgage amortization schedules.

## Continuous Integration Integration

Further information about the continuous integration for this project can be found at [the template's documntation](https://github.com/BobKerns/npm-typescript-rollup-template#continuous-integration-integration).

## /lib/

This holds the built Javascript files. By default, three versions are built, for compatibility with various module systems. Ultimately, the world is moving toward the ECMAScript module format, but in the meantime,

### /lib/esm

This holds files in the ECMAScript module format.

### /lib/cjs

This uses the CommonJS used traditionally by node.

### /lib/umd

This holds files in the UMD format, a flat file loadable by web browsers.

## [/assets](/assets/README.md)

Data files to be used in documentation or runtime in the application.

## [/config](/config/README.md)

This holds files used to globally configure the project. These are often redirected from the project root, to place them in one place, and to enable the use of typescript rather than javascript.

## [/devtools](/devtools/README.md)

This holds code used to to build the main project. It is built before the main project is configured.

It is initially empty.

## /docs

A generated directory with documentation. Some content may be installed from [/assets](/assets/README.md)

### /docs/api

The generated API documentation via [typedoc](https://typedoc.org)

### [/src](/src/README.md)

This hierarchy contains the project's source code and related tests.
