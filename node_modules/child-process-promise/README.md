child-process-promise
=====================

[![Build Status](https://travis-ci.org/patrick-steele-idem/child-process-promise.svg?branch=master)](https://travis-ci.org/patrick-steele-idem/child-process-promise)
[![NPM](https://img.shields.io/npm/v/child-process-promise.svg)](https://www.npmjs.com/package/child-process-promise)
[![Downloads](https://img.shields.io/npm/dm/child-process-promise.svg)](http://npm-stat.com/charts.html?package=child-process-promise)

Simple wrapper around the `child_process` module that makes use of promises

# Installation
```
npm install child-process-promise --save
```

# Usage

## exec
```javascript
var exec = require('child-process-promise').exec;

exec('echo hello')
    .then(function (result) {
        var stdout = result.stdout;
        var stderr = result.stderr;
        console.log('stdout: ', stdout);
        console.log('stderr: ', stderr);
    })
    .catch(function (err) {
        console.error('ERROR: ', err);
    });
```

## spawn
```javascript
var spawn = require('child-process-promise').spawn;

var promise = spawn('echo', ['hello']);

var childProcess = promise.childProcess;

console.log('[spawn] childProcess.pid: ', childProcess.pid);
childProcess.stdout.on('data', function (data) {
    console.log('[spawn] stdout: ', data.toString());
});
childProcess.stderr.on('data', function (data) {
    console.log('[spawn] stderr: ', data.toString());
});

promise.then(function () {
        console.log('[spawn] done!');
    })
    .catch(function (err) {
        console.error('[spawn] ERROR: ', err);
    });
```
### Options

#### capture
Type: `Array`  
Default: `[]`

Pass an additional `capture` option to buffer the result of `stdout` and/or `stderr`

```javascript
var spawn = require('child-process-promise').spawn;

spawn('echo', ['hello'], { capture: [ 'stdout', 'stderr' ]})
    .then(function (result) {
        console.log('[spawn] stdout: ', result.stdout.toString());
    })
    .catch(function (err) {
        console.error('[spawn] stderr: ', err.stderr);
    });
```
