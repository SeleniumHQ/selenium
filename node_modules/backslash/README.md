# Backslash [![Travis-CI.org Build Status](https://img.shields.io/travis/Qix-/node-backslash.svg?style=flat-square)](https://travis-ci.org/Qix-/node-backslash) [![Coveralls.io Coverage Rating](https://img.shields.io/coveralls/Qix-/node-backslash.svg?style=flat-square)](https://coveralls.io/r/Qix-/node-backslash)
Parse collected strings with escapes.

### Example

```javascript
var backslash = require('backslash');

var s = backslash("\\\\\\tHello!\\nThis was escaped.");
/*
\	Hello!
This was escaped.
*/
```

## License
Licensed under the MIT license.
