'use strict';
var child_process = require('child_process');
var crossSpawn = require('cross-spawn');
var ChildProcessPromise = require('./ChildProcessPromise');
var ChildProcessError = require('./ChildProcessError');

var slice = Array.prototype.slice;

/**
 * Promise wrapper for exec, execFile
 *
 * @param {String} method
 * @param {...*} args
 * @return {Promise}
 */
function doExec(method, args) {
    var cp;
    var cpPromise = new ChildProcessPromise();
    var reject = cpPromise._cpReject;
    var resolve = cpPromise._cpResolve;

    var finalArgs = slice.call(args, 0);
    finalArgs.push(callback);

    cp = child_process[method].apply(child_process, finalArgs);

    function callback(err, stdout, stderr) {
        if (err) {
            var commandStr = args[0] + (Array.isArray(args[1]) ? (' ' + args[1].join(' ')) : '');
            err.message += ' `' + commandStr + '` (exited with error code ' + err.code + ')';
            err.stdout = stdout;
            err.stderr = stderr;
            var cpError = new ChildProcessError(err.message, err.code, child_process, stdout, stderr);
            reject(cpError);
        } else {
            resolve({
                childProcess: cp,
                stdout: stdout,
                stderr: stderr
            });
        }
    }

    cpPromise.childProcess = cp;

    return cpPromise;
}

/**
 * `exec` as Promised
 *
 * @param {String} command
 * @param {Object} options
 * @return {Promise}
 */
function exec() {
    return doExec('exec', arguments);
}

/**
 * `execFile` as Promised
 *
 * @param {String} command
 * @param {Array} args
 * @param {Object} options
 * @return {Promise}
 */
function execFile() {
    return doExec('execFile', arguments);
}

/**
 * `spawn` as Promised
 *
 * @param {String} command
 * @param {Array} args
 * @param {Object} options
 * @return {Promise}
 */
function doSpawn(method, command, args, options) {
    var result = {};

    var cp;
    var cpPromise = new ChildProcessPromise();
    var reject = cpPromise._cpReject;
    var resolve = cpPromise._cpResolve;

    var successfulExitCodes = (options && options.successfulExitCodes) || [0];

    cp = method(command, args, options);

    // Don't return the whole Buffered result by default.
    var captureStdout = false;
    var captureStderr = false;

    var capture = options && options.capture;
    if (capture) {
        for (var i = 0, len = capture.length; i < len; i++) {
            var cur = capture[i];
            if (cur === 'stdout') {
                captureStdout = true;
            } else if (cur === 'stderr') {
                captureStderr = true;
            }
        }
    }

    result.childProcess = cp;

    if (captureStdout) {
        result.stdout = '';

        cp.stdout.on('data', function(data) {
            result.stdout += data;
        });
    }

    if (captureStderr) {
        result.stderr = '';

        cp.stderr.on('data', function(data) {
            result.stderr += data;
        });
    }

    cp.on('error', reject);

    cp.on('close', function(code) {
        if (successfulExitCodes.indexOf(code) === -1) {
            var commandStr = command + (args.length ? (' ' + args.join(' ')) : '');
            var message = '`' + commandStr + '` failed with code ' + code;
            var err = new ChildProcessError(message, code, cp);

            if (captureStderr) {
                err.stderr = result.stderr.toString();
            }

            if (captureStdout) {
                err.stdout = result.stdout.toString();
            }

            reject(err);
        } else {
            result.code = code;
            resolve(result);
        }
    });

    cpPromise.childProcess = cp;

    return cpPromise;
}

function spawn(command, args, options) {
    return doSpawn(crossSpawn, command, args, options);
}

function fork(modulePath, args, options) {
    return doSpawn(child_process.fork, modulePath, args, options);
}

exports.exec = exec;
exports.execFile = execFile;
exports.spawn = spawn;
exports.fork = fork;