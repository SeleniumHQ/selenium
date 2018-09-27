'use strict';
var _ = require('lodash');
var spawn = require('cross-spawn');

/**
 * @mixin
 * @alias actions/spawn-command
 */
var spawnCommand = module.exports;

/**
 * Normalize a command across OS and spawn it (asynchronously).
 *
 * @param {String} command
 * @param {Array} args
 * @param {object} [opt]
 */
spawnCommand.spawnCommand = function (command, args, opt) {
  opt = opt || {};
  return spawn(command, args, _.defaults(opt, {stdio: 'inherit'}));
};

/**
 * Normalize a command across OS and spawn it (synchronously).
 *
 * @param {String} command
 * @param {Array} args
 * @param {object} [opt]
 */
spawnCommand.spawnCommandSync = function (command, args, opt) {
  opt = opt || {};
  return spawn.sync(command, args, _.defaults(opt, {stdio: 'inherit'}));
};
