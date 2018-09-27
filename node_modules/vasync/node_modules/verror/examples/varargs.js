var VError = require('../lib/verror');

var opname = 'read';
var err = new VError('"%s" operation failed', opname);
console.log(err.message);
console.log(err.stack);
