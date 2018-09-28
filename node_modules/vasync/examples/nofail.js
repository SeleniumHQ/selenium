var mod_vasync = require('../lib/vasync');
var mod_util = require('util');
var mod_fs = require('fs');

var status = mod_vasync.parallel({
  funcs: [
    function f1 (callback) { mod_fs.stat('/tmp', callback); },
    function f2 (callback) { mod_fs.stat('/var', callback); }
  ]
}, function (err, results) {
  console.log(err);
  console.log(mod_util.inspect(results, false, 8));
});
