"use strict";

var spawn = require("child_process").spawn,
    procOutput = require("proc-output");

/**
 * spawno
 * Creates the child process.
 *
 * @name spawno
 * @function
 * @param {String} command The command you want to run.
 * @param {Array} args The command arguments.
 * @param {Object} options The options to pass to the `spawn` function extended with:
 *
 *  - `output` (Boolean): If truly, the output will be piped in the
 *    process stdout/stderr streams.
 *  - `data` (String|Boolean): If `false`, the `stdin` stream will not be ended. By default this is an empty string.
 *
 * @param {Function} cb The callback function.
 * @returns {Process} The child process that was created.
 */
module.exports = function spawno(command, args, options, cb) {

    if (typeof args === "function") {
        cb = args;
        args = [];
        options = {};
    }

    if (typeof options === "function") {
        cb = options;
        if (!Array.isArray(args)) {
            options = args;
            args = [];
        } else {
            options = {};
        }
    }

    if (options.input !== false) {
        options.input = options.input || "";
    }

    var showOutput = options.output,
        inputData = options.input;

    delete options.output;
    delete options.input;

    var proc = spawn(command, args, options);

    if (showOutput) {
        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
    }

    if (inputData !== false) {
        proc.stdin && proc.stdin.end(inputData);
    }

    if (cb) {
        procOutput(proc, cb);
    }

    return proc;
};