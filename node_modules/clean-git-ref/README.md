# clean-git-ref

[![Build Status](https://travis-ci.org/TheSavior/clean-git-ref.svg)](https://travis-ci.org/TheSavior/clean-git-ref)

Clean an input string into a usable git ref. 

For more reference, read https://git-scm.com/docs/git-check-ref-format

## Installation

```sh
$ npm install clean-git-ref --save-dev
```

## API Usage

### clean(string input) -> string output
```
var cleanGitRef = require('clean-git-ref');

assert.stricEqual(cleanGitRef.clean('bad git ref formats/'), bad-git-ref-formats');
```
