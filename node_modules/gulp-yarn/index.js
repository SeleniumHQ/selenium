'use strict';

/**
 * Created by mwarapitiya on 10/23/16.
 */

var path = require('path');
var childProcess = require('child_process');
var through = require('through2');
var which = require('which');
var mapSeries = require('async/mapSeries');
var yarnArgs = require('./utils/commands');
var PluginError = require('plugin-error');

// Consts
var PLUGIN_NAME = 'gulpYarn';

var commandList = {
    'package.json': {
        cmd: 'yarn',
        args: []
    }
};

// Plugin level function(dealing with files)
function gulpYarn(gulpYarnOptions) {
    var toRun = [];
    var count = 0;

    // Creating a stream through which each file will pass
    return through.obj(function (file, enc, callback) {
        if (file === undefined || file.isNull()) {
            // return empty file
            return callback(null, file);
        }

        // flush function
        var flush = function flush(err, file) {
            if (err) {
                return callback(err);
            }
            return callback(null, file);
        };
        var command = clone(commandList[path.basename(file.path)]);
        if (command !== undefined) {
            if (gulpYarnOptions) {
                var error = undefined;
                command.args = Object.keys(gulpYarnOptions).map(function (key) {
                    if (yarnArgs.hasOwnProperty(key) && gulpYarnOptions[key] === true) {
                        return yarnArgs[key];
                    } else {
                        if (key !== 'args') {
                            error = new PluginError(PLUGIN_NAME, `Command '${key}' not supported.`);
                        }
                    }
                }).filter(function (item) {
                    return item !== undefined || item === null;
                });

                if (error) {
                    return flush(error);
                }
            }
            if (gulpYarnOptions && gulpYarnOptions.args) {
                command.args = flatten(command.args.concat(formatArguments(gulpYarnOptions.args)));
            }
            command.cwd = path.dirname(file.path);
            toRun.push(command);

            if (!toRun.length) {
                callback(new PluginError(PLUGIN_NAME, `No commands found to run.`));
            }

            return mapSeries(toRun, function (singleCommand, next) {
                which(singleCommand.cmd, function (err, cmdpath) {
                    if (err) {
                        next(new PluginError(PLUGIN_NAME, `Error while determining the folder path.`));
                    }
                    var installOptions = {
                        stdio: 'inherit',
                        shell: true,
                        cwd: singleCommand.cwd || process.cwd()
                    };
                    var cmd = childProcess.spawn(`"${cmdpath}"`, singleCommand.args, installOptions);
                    cmd.once('close', function (code) {
                        if (code !== 0) {
                            next(new PluginError(PLUGIN_NAME, `${command.cmd} exited with non-zero code ${code}.`));
                        } else {
                            // If all commands are finished
                            if (toRun.length === ++count) {
                                next(false, file);
                            }
                        }
                    });
                });
            }, function (err, file) {
                if (err) {
                    flush(err);
                }
                flush(null, file[0]);
            });
        } else {
            callback();
        }
    });
}

/**
 * Clone object
 * @param obj
 * @returns {*}
 */
function clone(obj) {
    if (Array.isArray(obj)) {
        return obj.map(clone);
    } else if (typeof obj === 'object') {
        var copy = {};
        Object.keys(obj).forEach(function (key) {
            copy[key] = clone(obj[key]);
        });
        return copy;
    }
    return obj;
}

/**
 * Flatten deep arrays
 * @param arr
 * @returns {*}
 */
function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}

/**
 * Formant Arguments
 * @param args
 * @returns {*}
 */
function formatArguments(args) {
    if (Array.isArray(args)) {
        return args.map(function (item) {
            return formatArgument(item);
        });
    } else if (typeof args === 'string' || args instanceof String) {
        return [formatArgument(args)];
    }
    console.error(`${PLUGIN_NAME} : Arguments are not passed in a valid format: ${args}`);
    return [];
}

/**
 * Format argument
 * @param arg
 * @returns {*}
 */
function formatArgument(arg) {
    var result = arg;
    while (!result.match(/--.*/)) {
        result = `-${result}`;
    }
    return result;
}

// Exporting the plugin main function
module.exports = gulpYarn;
