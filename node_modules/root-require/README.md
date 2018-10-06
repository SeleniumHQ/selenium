root-require
============


a more convenient require method for running **TESTS ONLY**.

> ### WARNING:
> THIS MODULE PROBABLY DOES NOT WORK IN THE WAY YOU EXPECT IT TO WORK ALL THE TIME.
> I REPEAT: IT HAS DIFFERENT BEHAVIOR BASED ON HOW IT'S BROUGHT IN AS A DEPENDENCY THAT WILL CAUSE YOU HEADACHES.  ESPECIALLY IF YOU USE IT IN TWO MODULES WHICH DEPEND ON ONE ANOTHER.  (this is because of the way npm optimizes dependencies, and this module doesn't address that, since it's for testing only.).
>
> That said, as long as you use this module as a **DEV DEPDENDENCY**, everything _should_ work as expected.  Sorry for the capslock.
> ~Mike


## How it do
This lets you `require()` using a relative path from the root directory of the present module.

> Keep in mind `require()` is synchronous.  And this library is not any more efficient-- (it uses `fs.*Sync` methods)
> Just like when you use `require()`, you should be fine as long as you're doing this at the top of your file outside of any function declarations.



## Usage

Just once:
```javascript
var Sails = require('root-require')('lib/app');
```

More than once:
```javascript
var rootRequire = require('root-require');

var Sails = rootRequire('lib/app');
var Router = rootRequire('lib/router');
var MiddlewareLibrary = rootRequire('lib/middleware');
```



## Why is this a good thing?

It's easier to reason about the structure of your module when the paths are consistent.  The structure of your project becomes more declarative- dependencies are consistently referenced, irrespective of the user file's home in the directory structure.

#### Problems w/ `require()`

1. When you move a dependency file (_A<sub>x</sub>_) required by multiple files (_B<sub>i</sub>_), you have to find/replace the all references to _A<sub>x</sub>_.  This is normally hard, because the argument to the `require(...)` function depends on where the user file (_B<sub>i</sub>_) is located.
2. When you move a file (_B<sub>x</sub>_) which depends on another file (_A<sub>x</sub>_), you normally have to update the `require()` call in _B<sub>x</sub>_ to reflect the new relative path from _B<sub>x</sub>_ to _A<sub>x</sub>_.

e.g. Consider trying to change the path to `giggle.js` in an automated way:

hard 
```javascript
// foo.js
var Giggle = require('./wiggle/sniggle/giggle');

// bar.js
var Giggle = require('../../../../../wiggle/sniggle/giggle');

// baz.js
var Giggle = require('../../../../wiggle/sniggle/giggle');

// 20 more files like this, 100 other files like `giggle.js`
```

easy
```javascript
// foo.js
var Giggle = require('root-require')('lib/wiggle/sniggle/giggle');

// bar.js
var Giggle = require('root-require')('lib/wiggle/sniggle/giggle');

// baz.js
var Giggle = require('root-require')('lib/wiggle/sniggle/giggle');

// 20 more files like this, 100 other files like `giggle.js`
```






## Credit where credit is due
This module is literally a 3-line wrapper around the awesome `packpath` module (https://github.com/jprichardson/node-packpath).  I just made this for convenience/ so I could have it in one line because I always forget how `path.join` works w/ Windows and all that.


## License

MIT, c. 2014 Mike McNeil
