Node.js - packpath
==================

`packpath` helps you to find directories that contain `package.json`.



Why?
----

The directory with `package.json` is considered a module's base or root directory. At times, it's extremely convenient to need to know where that is.

Let's say that you write a module and you hate having to `require()` your files using relative paths `../../`, etc. This is how the module `autoresolve` works. Or, let's say that you are writing a module that needs to access configuration files in an app that called require on your module. These paths can get hairy fast.




Installation
------------

    npm install packpath



Usage
-----

For your apps, assuming you want to access your own config files, etc.

app.js:
```javascript
var packpath = require('packpath');

//<-- your own confile dir
var configDir = path.join(packpath.self(), 'config');
```

For your modules, assuming you want to access developers' config files who "required" your module.

mywidget.js:
```javascript
var packpath = require('packpath');

//the config dir of the app that called your module through require()
var configDir = path.join(packpath.parent(), 'config'); 
```


License
-------

(MIT License)

Copyright 2012, JP Richardson