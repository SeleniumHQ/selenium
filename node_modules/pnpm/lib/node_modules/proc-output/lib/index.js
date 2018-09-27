"use strict";

/**
 * procOutput
 * Get the output of a process.
 *
 * @name procOutput
 * @function
 * @param {Process} proc The process object.
 * @param {Function} cb The callback function.
 * @returns {Process} The process object.
 */

module.exports = function procOutput(proc, cb) {
    var stdout = "",
        stderr = "";

    proc.on("error", function (err) {
        cb(err);
    });

    proc.stdout.on("data", function (chunk) {
        return stdout += chunk;
    });
    proc.stderr.on("data", function (chunk) {
        return stderr += chunk;
    });
    proc.on("close", function (code) {
        return cb(null, stdout, stderr, code);
    });

    return proc;
};