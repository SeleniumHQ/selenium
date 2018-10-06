"use strict";

var spawn = require("spawno");

/**
 * Diable
 * Daemonizes processes the current process.
 *
 * @name Diable
 * @function
 * @param {Object} opts An object which will be passed to the `exec` function. It is extended with:
 *
 *  - `env` (Object): The environment object (default: `process.env`).
 *
 * @return {Number|Process} `false` if the process was already daemonized. Otherwise the process is closed anyways.
 */
function Diable(opts) {

    // The process is a daemon
    if (Diable.isDaemon()) {
        return false;
    }

    opts = opts || {};

    var args = [].concat(process.argv);
    args.shift();

    var script = args.shift(),
        env = opts.env || process.env;

    Diable.daemonize(script, args, opts);
    return process.exit();
}

/**
 * isDaemon
 * Checks if the current process is a daemon started by `diable`.
 *
 * @name isDaemon
 * @function
 * @return {Boolean} `true` if the process is a daemon, `false` otherwise.
 */
Diable.isDaemon = function () {
    return !!process.env.__is_daemon;
};

/**
 * daemonize
 * Low level for daemonizing the things. It's used internally.
 * Also, it can be useful in specific cases.
 *
 * @name daemonize
 * @function
 * @param {String} exec The executable application (defaults to the `process.execPath`).
 * @param {String} path An optional node.js file path for convenience. This will be prepended to the `args` array.
 * @param {Array} args The spawn arguments (default: `[]`).
 * @param {Object} options The object passed to the `spawn` function (default: `{}`) extended with:
 *
 *  - `command` (String): The command to use. By default, the Node.js path.
 *
 * @return {Process} The daemon process.
 */
Diable.daemonize = function (script, args, opts) {

    opts = opts || {};

    var stdout = opts.stdout || "ignore",
        stderr = opts.stderr || "ignore",
        env = opts.env || process.env,
        cwd = opts.cwd || process.cwd();

    env.__is_daemon = true;

    var spawnOptions = {
        stdio: ["inherit", stdout, stderr],
        env: env,
        cwd: cwd,
        detached: true,
        input: false
    };

    var cmd = opts.command || process.execPath;
    delete opts.command;

    var child = spawn(cmd, [script].concat(args).filter(Boolean), spawnOptions);
    child.unref();

    return child;
};

module.exports = Diable;