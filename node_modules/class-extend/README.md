Class.extend [![Build Status](https://travis-ci.org/yeoman/generator.png?branch=master)](https://travis-ci.org/SBoudrias/class-extend)
============

Backbone's `.extend` like inheritance helper for Node.js

Usage
------------

You basically got two options:

``` javascript
// 1. Extend from the blank class
var Base = require('class-extend');
var Sub = Base.extend();

// 2. Add the .extend helper to a class
MyClass.extend = require('class-extend').extend;
```

#### `.extend()`

`.extend` allow you to assign prototype and static methods.

If no `constructor` method is assigned, the parent constructor method will be called by default.

``` javascript
// Extend a class
var Sub = Parent.extend({
  // Overwrite the default constructor
  constructor: function () {},

  // Sub class prototypes methods
  hello: function () { console.log('hello'); }
}, {
  // Constructor static methods
  hey: function () { console.log('hey'); }
});

Sub.hey();
// LOG: hey

var instance = new Sub();
instance.hello();
// LOG: hello
```

#### `.__super__`

Sub classes are assigned a `__super__` static property pointing to their parent prototype.

``` javascript
var Sub = Parent.extend();
assert(Sub.__super__ === Parent.prototype);
```

License
---------------

Copyright (c) 2013 Simon Boudrias  
Licensed under the MIT license.
