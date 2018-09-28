var
  tmp = require('../lib/tmp'),
  spawn = require('./spawn-sync');

var graceful = spawn.arg;

if (graceful) {
  tmp.setGracefulCleanup();
}

try {
  var result = spawn.tmpFunction();
  spawn.out(result.name, function () {
    throw new Error('Thrown on purpose');
  });
}
catch (e) {
  spawn.err(e, spawn.exit);
}

