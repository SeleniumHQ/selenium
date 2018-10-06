# [Later](http://bunkat.github.io/later/) [![Build Status](https://travis-ci.org/bunkat/later.svg)](https://travis-ci.org/bunkat/later)

_Later_ is a library for describing recurring schedules and calculating their future occurrences.  It supports a very flexible schedule definition including support for composite schedules and schedule exceptions. Create new schedules manually, via Cron expression, via text expressions, or using a fully chainable API.

Types of schedules supported by _Later_:

* Run a report on the last day of every month at 12 AM except in December
* Install patches on the 2nd Tuesday of every month at 4 AM
* Gather CPU metrics every 10 mins Mon - Fri and every 30 mins Sat - Sun
* Send out a scary e-mail at 13:13:13 every Friday the 13th

####For complete documentation visit [http://bunkat.github.io/later/](http://bunkat.github.io/later/).


## Installation
Using npm:

    $ npm install later

Using bower:

    $ bower install later

## Building

To build the minified javascript files for _later_, run `npm install` to install dependencies and then:

    $ make all

## Running tests

To run the tests for _later_, run `npm install` to install dependencies and then:

    $ make test

## Versioning

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

And constructed with the following guidelines:

* Breaking backward compatibility bumps the major (and resets the minor and patch)
* New additions without breaking backward compatibility bumps the minor (and resets the patch)
* Bug fixes and misc changes bumps the patch

For more information on SemVer, please visit [http://semver.org/](http://semver.org/).

## Bug tracker

Have a bug or a feature request? [Please open a new issue](https://github.com/bunkat/later/issues).

## Change Log

### Later v1.2.0
* Implemented predefined scheduling definitions for cron
  - @yearly, @annually, @monthly, @weekly, @daily, and @hourly are now parsed correctly
  - Submitted by pekeler (thanks!)

### Later v1.1.8, v1.1.9

* Fixed npm and bower entry points

### Later v1.1.7

* Various bug fixes

### Later v1.1.3

* Merge consecutive ranges when using composite schedules (fixes issues #27)

### Later v1.1.1 and v1.1.2

* Fixed handling of ranged schedules which never go invalid. End date is undefined for these types of schedules.

### Later v1.1.0

* Implemented fullDate (fd) constraint to specify a specific occurrence (or exception)
    - `later.parse.recur().on(new Date(2013,3,21,10,30,0)).fullDate()`

### Later v1.0.0

* Refactored core engine so that it could be better tested
    - Added over 41,500 tests and fixed hundreds of edge cases that were unfortunately broken in v0.0.20
* Core engine is now extensible via custom time periods and custom modifiers
    - Full examples included in the documentation
* Added support for finding valid ranges as well as valid instances of schedules
    - _Later_ can now be used to schedule activities and meetings as well as point in time occurrences
* Improved support for finding past ranges and instances
    - Searching forward or backward now produces the same valid occurrences
* No more need to specify a resolution!
    - _Later_ now automatically handles this internally, you no longer need to specify your desired resolution. 'Every 5 minutes' now does exactly what you would expect it to :)
* Changing between UTC and local time has changed.
    - Use `later.date.UTC()` and `later.date.localTime()` to switch between the two.
* API for parsers has changed.
    - Recur is now at `later.parse.recur()`
    - Cron is now at `later.parse.cron(expr)`
    - Text is now at `later.parse.text(expr)`
* API for calculating occurrences has changed.
    - Schedules are now compiled using `later.schedule(schedule)`
    - getNext is now `later.schedule(schedule).next(count, start, end)`
    - getPrev is now `later.schedule(schedule).prev(count, start, end)`
* `After` meaning 'don't start until after this amount of time' has been deprecated.
    - This was a hack since people had a hard time with resolutions. With resolutions gone, this is no longer needed and is deprecated since it produced non-deterministic schedules.

**Note:** Schedule definitions did not change (unless you were using `after` constraints which have been deprecated). If you stored any schedule definitions from v0.0.20, they should continue to work unchanged in v1.0.0.
