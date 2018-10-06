[![build status](https://secure.travis-ci.org/lmaccherone/node-localstorage.png)](http://travis-ci.org/lmaccherone/node-localstorage)
[![bitHound Score](https://www.bithound.io/github/lmaccherone/node-localstorage/badges/score.svg)](https://www.bithound.io/github/lmaccherone/node-localstorage)
# node-localstorage #

Copyright (c) 2012, Lawrence S. Maccherone, Jr.

_A drop-in substitute for the browser native localStorage API that runs on node.js._

### Fully implements the localStorage specfication including: ###

* All methods in the [localStorage spec](http://www.w3.org/TR/webstorage/#storage) 
  interface including:
  * length
  * setItem(key, value)
  * getItem(key)
  * removeItem(key)
  * key(n)
  * clear()  
* Serializes to disk in the location specified during instantiation
* Supports the setting of a quota (default 5MB)
* Events. This doesn't exactly follow the spec which states that events are NOT supposed to be emitted to the browser window
  that took the action that triggered the event in the first place. They are only to be emitted to listeners in
  other browser windows. Early browser implementations actually did it this way and we don't really have the equivalent
  of a browser window in node.js, so we choose to implement them in the current process. We did, however, include the pid
  information in place of the window uri, so if we later wanted to say think of other node.js processes accessing
  the same file system, we could actually implement it correctly. That would involve file watchers though and was more
  than we wanted to implement for now. Maybe later.
* (temporarily removed) Associative array `localStorage['myKey'] = 'myValue'` and dot property `localStorage.myKey = 'myValue'`
  syntax. This only works if you use the --harmony-proxies flag. It senses the existence of the Proxy object in the root 
  scope. If you have added your own Proxy object, then you could have a problem. Another potential risk is around 
  the "private", underscore preceded methods and properties. I had to reserve those in addition to the standard ones, 
  so you won't be able to use keys that overlap with those underscore preceded properties and methods in a harmony-proxies
  environment.

## Credits ##

Author: [Larry Maccherone](http://maccherone.com)

## Usage ##

### CoffeeScript ###

    unless localStorage?
      {LocalStorage} = require('../')  # require('node-localstorage') for you
      localStorage = new LocalStorage('./scratch')

    localStorage.setItem('myFirstKey', 'myFirstValue')
    console.log(localStorage.getItem('myFirstKey'))
    # myFirstValue
    
    localStorage._deleteLocation()  # cleans up ./scratch created during doctest

### JavaScript ###

```JavaScript    
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

localStorage.setItem('myFirstKey', 'myFirstValue');
console.log(localStorage.getItem('myFirstKey'));
```

## Installation ##

`npm install node-localstorage`

## Changelog ##

* 1.3.1 - 2018-03-19 - Resolves issue #32 (thanks, plamens)
* 1.3.0 - 2016-04-09 - **Possibly backward breaking if you were using experimental syntax** Reverted experimental
  associative array and dot-property syntax. The API for Proxy changed with node.js v6.x which broke it. Then when
  I switched to the new syntax, it broke the EventEmitter functionality. Will restore once I know how to fix that.
* 1.2.0 - 2016-04-09 - Atomic writes (thanks, mvayngrib)
* 1.1.2 - 2016-01-08 - Resolves issue #17 (thanks, evilaliv3)
* 1.1.1 - 2016-01-04 - Smarter associative array and dot-property syntax support
* 1.1.0 - 2016-01-03 - **Backward breaking** if you used any of the non-standard methods. They are now all preceded with
  an underscore. Big upgrade for this version is experimental support for associative array and dot-property syntax.
* 1.0.0 - 2016-01-03 - Fixed bug with empty string key (thanks, tinybike)
* 0.6.0 - 2015-09-11 - Removed references to deprecated fs.existsSync() (thanks, josephbosire)
* 0.5.2 - 2015-08-01 - Fixed defect where keys were not being updated correctly by removeItem() (thanks, ed69140)
* 0.5.1 - 2015-06-01 - Added support for events
* 0.5.0 - 2015-02-02 - Added JSONStorage class which allows you set and get native JSON
* 0.4.1 - 2015-02-02 - More robust publishing/tagging (like Lumenize)
* 0.4.0 - 2015-02-02 - Uses more efficient fs.statSync to set initial size (thanks, sudheer594)
* 0.3.6 - 2014-12-24 - Allows usage without `new`
* 0.3.5 - 2014-12-23 - Fixed toString() for QuotaExceededError
* 0.3.4 - 2013-07-07 - Moved CoffeeScript to devDependencies
* 0.3.3 - 2013-04-05 - Added support for '/' in keys by escaping before creating file names
* 0.3.2 - 2013-01-19 - Renamed QuotaExceededError to QUOTA_EXCEEDED_ERR to match most browsers
* 0.3.1 - 2013-01-19 - Fixed bug where it threw plain old Error instead of new QuotaExceededError
* 0.3.0 - 2013-01-19 - Added QuotaExceededError support
* 0.2.0 - 2013-01-03 - Added quota support
* 0.1.2 - 2012-11-02 - Finally got Travis CI working
* 0.1.1 - 2012-10-29 - Update to support Travis CI
* 0.1.0 - 2012-10-29 - Original version

## MIT License ##

Copyright (c) 2011, 2012, Lawrence S. Maccherone, Jr.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and 
to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
IN THE SOFTWARE.
