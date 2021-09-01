# Contributing

This project is presently early stage, and focused on personal needs,
but if it can benefit others, that would be great!

Contributions are always welcome.

You can submit suggestions or ask questions via the [issue tracker](https://github.com/BobKerns/retirement-simulator/issues).

Clone this repository and the `retirement-data` repository for your data (do not push your data back to GitHub!)
Create a pull request with your changes. It is best if your submission is broken into a series of commits that each
do one thing, at the level of fix one bug or add one feature.

You can use `git rebase -i` to clean up your commit history to make it easier to follow, but do not feel obligated
to collapse it all down to one commit. You do not need to rebase onto the latest branch, you should merge in the latest
and ensure it builds, tests, and works before submitting.

## Code of Conduct

See the [Code of Conduct](CODE_OF_CONDUCT.md) for this project.

## Project Details

### Continuous Integration Integration

Further information about the continuous integration for this project can be found at [the template's documntation](https://github.com/BobKerns/npm-typescript-rollup-template#continuous-integration-integration).

### /lib/

This holds the built Javascript files. By default, three versions are built, for compatibility with various module systems.
Ultimately, the world is moving toward the ECMAScript module format, but in the meantime,

#### /lib/esm

This holds files in the ECMAScript module format.

#### /lib/cjs

This uses the CommonJS used traditionally by node.

#### /lib/umd

This holds files in the UMD format, a flat file loadable by web browsers.

### [/assets](/assets/README.md)

Data files to be used in documentation or runtime in the application.

### [/config](/config/README.md)

This holds files used to globally configure the project. These are often redirected from the project root,
to place them in one place, and to enable the use of typescript rather than javascript.

### [/devtools](/devtools/README.md)

This holds code used to to build the main project. It is built before the main project is configured.

It is initially empty.

### /docs

A generated directory with documentation. Some content may be installed from [/assets](/assets/README.md)

#### /docs/api

The generated API documentation via [typedoc](https://typedoc.org)

#### [/src](/src/README.md)

This hierarchy contains the project's source code and related tests.
