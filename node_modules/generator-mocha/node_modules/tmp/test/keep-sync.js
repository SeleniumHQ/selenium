var spawn = require('./spawn-sync');

var keep = spawn.arg;

try {
  var result = spawn.tmpFunction({ keep: keep });
  spawn.out(result.name, spawn.exit);
}
catch (e) {
  spawn.err(err, spawn.exit);
}

