var
  fs    = require('fs'),
  join  = require('path').join,
  spawn = require('./spawn-sync');

var unsafe = spawn.arg;

try {
  var result = spawn.tmpFunction({ unsafeCleanup: unsafe });
  try {
    // file that should be removed
    var fd = fs.openSync(join(result.name, 'should-be-removed.file'), 'w');
    fs.closeSync(fd);

    // in tree source
    var symlinkSource = join(__dirname, 'symlinkme');
    // testing target
    var symlinkTarget = join(result.name, 'symlinkme-target');

    // symlink that should be removed but the contents should be preserved.
    fs.symlinkSync(symlinkSource, symlinkTarget, 'dir');

    spawn.out(result.name, spawn.exit);
  } catch (e) {
    spawn.err(e.toString(), spawn.exit);
  }
}
catch (e) {
  spawn.err(err, spawn.exit);
}
