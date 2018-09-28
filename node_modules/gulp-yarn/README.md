<p align="center">
  <a href="https://github.com/warapitiya/gulp-yarn">
    <img alt="Gulp-Yarn" src="https://github.com/warapitiya/assets/blob/master/gulp-yarn.png?raw=true" width="546">
  </a>
</p>

<p align="center">
  Automatically install node modules using Yarn.
</p>
<p  align="center">
Because we <img alt="emoji=heart" src="https://github.com/warapitiya/assets/blob/master/heart-emoji.png?raw=true" width="15"> Yarn!</p>

<p align="center">
  <a href="https://travis-ci.org/warapitiya/gulp-yarn"><img alt="Travis Status" src="https://travis-ci.org/warapitiya/gulp-yarn.svg?branch=master"></a>
  <a href='https://coveralls.io/github/warapitiya/gulp-yarn?branch=master'><img src='https://coveralls.io/repos/github/warapitiya/gulp-yarn/badge.svg?branch=master' alt='Coverage Status' /></a>
  <a href="https://www.npmjs.com/package/gulp-yarn"><img src="https://img.shields.io/npm/v/gulp-yarn.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/gulp-yarn"><img src="https://img.shields.io/npm/dt/gulp-yarn.svg" alt="npm downloads"></a>
  <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-5ed9c7.svg" alt="xo"></a>
  <a href="https://greenkeeper.io/"><img src="https://badges.greenkeeper.io/warapitiya/gulp-yarn.svg" alt="Greenkeeper badge"></a>
</p>

---

## Installation

```bash
# npm
$ npm install gulp-yarn --save-dev

# yarn
$ yarn add gulp-yarn -D
```

## Quick Start
**BASIC:** Better performance when in same directory.

```javascript
var gulp = require('gulp');
var yarn = require('gulp-yarn');

gulp.task('yarn', function() {
    return gulp.src(['./package.json'])
        .pipe(yarn());
});

```

**PRO:** Remember to include `yarn.lock` file.

```javascript
var gulp = require('gulp');
var yarn = require('gulp-yarn');

gulp.task('yarn', function() {
    return gulp.src(['./package.json', './yarn.lock'])
        .pipe(gulp.dest('./dist'))
        .pipe(yarn({
            production: true
        }));
});
```

## Options
| Option        | Description                                                                                                                                                            | Type    |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| production    | Using the `--production` flag, or when the NODE_ENV environment variable is set to production, Yarn will not install any package listed in devDependencies.            | Boolean |
| dev           | Yarn will only install listed devDependencies.                                                                                                                         | Boolean |
| flat          | Only allow one version of a package. On the first run this will prompt you to choose a single version for each package that is depended on at multiple version ranges. | Boolean |
| force         | This refetches all packages, even ones that were previously installed.                                                                                                 | Boolean |
| ignoreEngines | Ignore all the required engines force by some packages.                                                                                                                | Boolean |
| noBinLinks    | None of `node_module` bin links getting created.                                                                                                                       | Boolean |
| noProgress    | Disable progress bar                                                                                                                                                   | Boolean |
| noLockfile    | Don't read or generate a lockfile                                                                                                                                      | Boolean |
| ignoreScripts | Don't run npm scripts during installation                                                                                                                              | Boolean |
| nonInteractive| Using the '--non-interactive' flag of yarn to avoid that during the resolution (yarn install) a user input is needed. [2770](https://github.com/yarnpkg/yarn/pull/2770)| Boolean | 
| args          | Pass any argument with `--` to execute with yarn                                                                                                                       | String/Array |

## Test
```sh
#run mocha test with istanbul
yarn test
```

## Contribute
Contributions are always welcome, no matter how large or small.
