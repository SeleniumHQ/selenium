
## 2018-09-21 - 3.0.2
- Fixed npe with rejectTLD option (#33)

## 2017-06-21 - 3.0.0

Note: There is a major version bump because of two things: changes to the typescript definition and changes to the results returned for "group" addresses.

- Full typescript definition (#30, a12b003)
- Fixed typescript "typings" field in package.json (#32)
- Proper results for groups (#31). Previously a "group" "address" would show its results as a single address, but it is now returned as a list. See the typescript definition for full return type.
- Support for parsing RFC6854 originator fields (#31). This adds new functions: parseFrom, parseSender, parseReplyTo. It also adds a new option "startAt". See source for possible values of "startAt".

## 2016-04-30 -

- minified version

## 2015-12-28 - 2.0.2

- Improves type definition #18
- Adds TypeScript definition file and declares in package.json #17
- remove inaccurate comment on obs-FWS
- add bower.json


## 2014-11-02 - 2.0.1

- properly parse unquoted names with periods (version 2.0.1)


## 2014-10-14 - 2.0.0

- add rejectTLD option, off by default
- add proper unicode support (rfc 6532)
- improve 'semantic interpretation' of names


## 2014-09-08 - 1.1.2

- document the return values more
- for 'address', 'local', and 'domain' convenience methods return semantic content
- update readme to show results from current code
- fix invalid reference to address node introduced in 51836f1
- support loading in the browser #4


# 2014-01-10 - 1.1.1

- return name and other fields with whitespace collapsed properly (closes #2)
- readme: add "why use this" and "installation"
- readme: link to @dominicsayers #1


## 2013-09-10 - 1.1.0

- Initial commit
