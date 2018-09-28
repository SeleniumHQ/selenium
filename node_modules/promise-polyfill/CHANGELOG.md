# Changelog
## 6.1.0
- Bug fix for non-array values in `Promise.all()`
- Small optimization checking for making sure `Promise` is called with `new`


## 6.0.0 Deprecated `Promise._setImmediateFn` and `Promise._setUnhandledRejectionFn`
This allows subclassing Promise without rewriting functions
- `Promise._setImmediateFn(<immediateFn>)` has been deprecated. Use `Promise._immediateFn = <immediateFn>` instead.
- `Promise._setUnhandledRejectionFn(<rejectionFn>)` has been deprecated. Use `Promise._unhandledRejectionFn = <rejectionFn>` instead.
These functions will be removed in the next major version.

### 5.2.1 setTimeout to 0
Fixed bug where setTimeout was set to 1 instead of 0 for async execution

### 5.2.0 Subclassing
Allowed Subclassing. [#27](https://github.com/taylorhakes/promise-polyfill/pull/27)

### 5.1.0 Fixed reliance on setTimeout
Changed possibly unhanded warnings to use asap function instead of setTimeout

## 5.0.0 Removed multiple params from Promise.all
Removed non standard functionality of passing multiple params to Promise.all. You must pass an array now. You must change this code
```js
Promise.all(prom1, prom2, prom3);
```
to this
```js
Promise.all([prom1, prom2, prom3]);
```

### 4.0.4 IE8 console.warn fix
IE8 does not have console, unless you open the developer tools. This fix checks to makes sure console.warn is defined before calling it.

### 4.0.3 Fix case in bower.json
bower.json had Promise.js instead of promise.js

### 4.0.2 promise.js case fix in package.json
Fixed promise.js in package.json. It was accidently published as Promise.js

## 4.0.1 Unhandled Rejections and Other Fixes
- Added unhandled rejection warnings to the console
- Removed Grunt, jasmine and other unused code
- Renamed Promise.js to lowercase promise.js in multiple places

### 3.0.1 Fixed shadowing issue on setTimeout
New version fixing this major bug https://github.com/taylorhakes/promise-polyfill/pull/17

## 3.0.0 Updated setTimeout to not be affected by test mocks
This is considered a breaking change because people may have been using this functionality. If you would like to keep version 2 functionality, set Promise._setImmediateFn on `promise-polyfill` like the code below.

```js
var Promise = require('promise-polyfill');
Promise._setImmedateFn(function(fn) {
  setTimeout(fn, 1);
});
```

### 2.1.0 Promise._setImmedateFn
Removed dead code Promise.immedateFn and added Promise._setImmediateFn(fn);

### 2.0.2 Simplified Global detection
Simplified attaching to global object

### 2.0.1 Webworker bugfixes
Fixed Webworkers missing window object

## 2.0.0 
**Changed the following line**
```
module.exports = root.Promise ? root.Promise : Promise;
```
to
```
module.exports = Promise;
```

This means the library will not use built-in Promise by default. This allows for more consistency.

You can easily add the functionality back.
```
var Promise = window.Promise || require('promise-polyfill');
```

**Added Promise.immediateFn to allow changing the setImmedate function**
```
Promise.immediateFn = window.setAsap;
```

### 1.1.4 Updated Promise to use correct global object in Browser and Node

### 1.1.3 Fixed browserify issue with `this`

### 1.1.2 Updated Promise.resolve to resolve with original Promise

### 1.1.0 Performance Improvements for Modern Browsers

## 1.0.1 Update README.md
