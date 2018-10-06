# Luxon

[![MIT License][license-image]][license] [![Build Status][travis-image]][travis-url] [![NPM version][npm-version-image]][npm-url] [![Coverage Status][test-coverage-image]][test-coverage-url] [![Doc coverage][doc-coverage-image]][doc-url] [![PRs welcome][contributing-image]][contributing-url]

Luxon is a library for working with dates and times in Javascript.

```js
DateTime.local().setZone('America/New_York').minus({ weeks: 1 }).endOf('day').toISO();
```

## Features
 * DateTime, Duration, and Interval types.
 * Immutable, chainable, unambiguous API.
 * Parsing and formatting for common and custom formats.
 * Native time zone and Intl support (no locale or tz files).

## Download/install

[Download/install instructions](https://moment.github.io/luxon/docs/manual/install.html)

## Documentation

* [General documentation][doc-url]
* [API docs](https://moment.github.io/luxon/docs/identifiers.html)
* [Quick tour](https://moment.github.io/luxon/docs/manual/tour.html)
* [For Moment users](https://moment.github.io/luxon/docs/manual/moment.html)
* [Why does Luxon exist?](https://moment.github.io/luxon/docs/manual/why.html)
* [A quick demo](https://moment.github.io/luxon/demo/global.html)

## Development

See [contributing](contributing.md).

![Phasers to stun][phasers-image]

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg
[license]: license.txt

[travis-url]: http://travis-ci.org/moment/luxon
[travis-image]: https://api.travis-ci.org/moment/luxon.svg?branch=master

[npm-url]: https://npmjs.org/package/luxon
[npm-version-image]: https://badge.fury.io/js/luxon.svg

[doc-url]: https://moment.github.io/luxon/docs/
[doc-coverage-image]: https://moment.github.io/luxon/docs/badge.svg

[test-coverage-url]: https://codecov.io/gh/moment/luxon
[test-coverage-image]: https://codecov.io/gh/moment/luxon/branch/master/graph/badge.svg

[contributing-url]: https://moment.github.io/luxon/docs/manual/contributing.html
[contributing-image]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg

[phasers-image]: https://img.shields.io/badge/phasers-stun-brightgreen.svg
