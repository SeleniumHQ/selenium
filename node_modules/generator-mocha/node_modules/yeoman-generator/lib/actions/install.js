'use strict';
var assert = require('assert');
var _ = require('lodash');
var dargs = require('dargs');
var async = require('async');
var chalk = require('chalk');

/**
 * @mixin
 * @alias actions/install
 */
var install = module.exports;

/**
 * Combine package manager cmd line arguments and run the `install` command.
 *
 * During the `install` step, every command will be scheduled to run once, on the
 * run loop. (So don't combine the callback with `this.async()`)
 *
 * @param {String} installer Which package manager to use
 * @param {String|Array} [paths] Packages to install. Use an empty string for `npm install`
 * @param {Object} [options] Options to pass to `dargs` as arguments
 * @param {Function} [cb]
 * @param {Object} [spawnOptions] Options to pass `child_process.spawn`. ref
 *                                https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
 */

install.runInstall = function (installer, paths, options, cb, spawnOptions) {
  if (!cb && _.isFunction(options)) {
    cb = options;
    options = {};
  }

  options = options || {};
  spawnOptions = spawnOptions || {};
  cb = cb || function () {};
  paths = Array.isArray(paths) ? paths : (paths && paths.split(' ')) || [];

  var args = ['install'].concat(paths).concat(dargs(options));

  // Yarn uses the `add` command to specifically add a package to a project.
  if (installer === 'yarn' && paths.length > 0) {
    args[0] = 'add';
  }

  // Only for npm, use a minimum cache of one day
  if (installer === 'npm') {
    args = args.concat(['--cache-min', 24 * 60 * 60]);
  }

  // Return early if we're skipping installation.
  if (this.options.skipInstall) {
    cb();
    return this;
  }

  this.env.runLoop.add('install', function (done) {
    this.emit(installer + 'Install', paths);
    this.spawnCommand(installer, args, spawnOptions)
      .on('error', function (err) {
        console.log(chalk.red('Could not finish installation. \n') +
          'Please install ' + installer + ' with ' +
          chalk.yellow('npm install -g ' + installer) + ' and try again.'
        );
        cb(err);
      })
      .on('exit', function (err) {
        this.emit(installer + 'Install:end', paths);
        cb(err);
        done();
      }.bind(this));
  }.bind(this), {once: installer + ' ' + args.join(' '), run: false});

  return this;
};

/**
 * Runs `npm` and `bower`, in sequence, in the generated directory and prints a
 * message to let the user know.
 *
 * @example
 * this.installDependencies({
 *   bower: true,
 *   npm: true,
 *   callback: function () {
 *     console.log('Everything is ready!');
 *   }
 * });
 *
 * @param {Object} [options]
 * @param {Boolean} [options.npm=true] - whether to run `npm install`
 * @param {Boolean} [options.bower=true] - whether to run `bower install`
 * @param {Boolean} [options.yarn=false] - whether to run `yarn install`
 * @param {Boolean} [options.skipMessage=false] - whether to log the used commands
 * @param {Function} [options.callback] - call once all commands have run
 */

install.installDependencies = function (options) {
  options = options || {};
  var commands = [];
  var msg = {
    commands: [],
    template: _.template('\n\nI\'m all done. ' +
    '<%= skipInstall ? "Just run" : "Running" %> <%= commands %> ' +
    '<%= skipInstall ? "" : "for you " %>to install the required dependencies.' +
    '<% if (!skipInstall) { %> If this fails, try running the command yourself.<% } %>\n\n')
  };

  if (_.isFunction(options)) {
    options = {
      callback: options
    };
  }

  if (options.npm !== false) {
    msg.commands.push('npm install');
    commands.push(function (cb) {
      this.npmInstall(null, null, cb);
    }.bind(this));
  }

  if (options.yarn === true) {
    msg.commands.push('yarn install');
    commands.push(function (cb) {
      this.yarnInstall(null, null, cb);
    }.bind(this));
  }

  if (options.bower !== false) {
    msg.commands.push('bower install');
    commands.push(function (cb) {
      this.bowerInstall(null, null, cb);
    }.bind(this));
  }

  assert(msg.commands.length, 'installDependencies needs at least one of `npm`, `bower` or `yarn` to run.');

  if (!options.skipMessage) {
    var tplValues = _.extend({
      skipInstall: false
    }, this.options, {
      commands: chalk.yellow.bold(msg.commands.join(' && '))
    });
    this.log(msg.template(tplValues));
  }

  async.parallel(commands, options.callback || _.noop);
};

/**
 * Receives a list of `components` and an `options` object to install through bower.
 *
 * The installation will automatically run during the run loop `install` phase.
 *
 * @param {String|Array} [cmpnt] Components to install
 * @param {Object} [options] Options to pass to `dargs` as arguments
 * @param {Function} [cb]
 * @param {Object} [spawnOptions] Options to pass `child_process.spawn`.
 */

install.bowerInstall = function (cmpnt, options, cb, spawnOptions) {
  return this.runInstall('bower', cmpnt, options, cb, spawnOptions);
};

/**
 * Receives a list of `packages` and an `options` object to install through npm.
 *
 * The installation will automatically run during the run loop `install` phase.
 *
 * @param {String|Array} [pkgs] Packages to install
 * @param {Object} [options] Options to pass to `dargs` as arguments
 * @param {Function} [cb]
 * @param {Object} [spawnOptions] Options to pass `child_process.spawn`.
 */

install.npmInstall = function (pkgs, options, cb, spawnOptions) {
  return this.runInstall('npm', pkgs, options, cb, spawnOptions);
};
/**
 * Receives a list of `packages` and an `options` object to install through npm.
 *
 * The installation will automatically run during the run loop `install` phase.
 *
 * @param {String|Array} [pkgs] Packages to install
 * @param {Object} [options] Options to pass to `dargs` as arguments
 * @param {Function} [cb]
 * @param {Object} [spawnOptions] Options to pass `child_process.spawn`.
 */

install.yarnInstall = function (pkgs, options, cb, spawnOptions) {
  return this.runInstall('yarn', pkgs, options, cb, spawnOptions);
};
