
var Git = require('./git');

var ChildProcess = require('child_process');
var Buffer = require('buffer').Buffer;
var exists = require('./util/exists');

module.exports = function (baseDir) {

    if (baseDir && !exists(baseDir, exists.FOLDER)) {
        throw new Error("Cannot use simple-git on a directory that does not exist.");
    }

    return new Git(baseDir || process.cwd(), ChildProcess, Buffer);
};

