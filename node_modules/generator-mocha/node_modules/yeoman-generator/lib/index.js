'use strict';
var util = require('util');
var path = require('path');
var events = require('events');
var assert = require('assert');
var _ = require('lodash');
var findUp = require('find-up');
var readPkgUp = require('read-pkg-up');
var chalk = require('chalk');
var mkdirp = require('mkdirp');
var minimist = require('minimist');
var runAsync = require('run-async');
var through = require('through2');
var userHome = require('user-home');
var FileEditor = require('mem-fs-editor');
var pathIsAbsolute = require('path-is-absolute');
var pathExists = require('path-exists');
var debug = require('debug')('yeoman:generator');
var Conflicter = require('./util/conflicter');
var Storage = require('./util/storage');
var promptSuggestion = require('./util/prompt-suggestion');

var EMPTY = '@@_YEOMAN_EMPTY_MARKER_@@';

/**
 * The `Base` class provides the common API shared by all generators.
 * It define options, arguments, file, prompt, log, API, etc.
 *
 * It mixes into its prototype all the methods found in the `actions/` mixins.
 *
 * Every generator should extend this base class.
 *
 * @constructor
 * @mixes actions/install
 * @mixes actions/spawn-command
 * @mixes actions/user
 * @mixes actions/help
 * @mixes nodejs/EventEmitter
 *
 * @param {String|Array} args
 * @param {Object} options
 *
 * @property {Object}   env         - the current Environment being run
 * @property {Object}   args        - Provide arguments at initialization
 * @property {String}   resolved    - the path to the current generator
 * @property {String}   description - Used in `--help` output
 * @property {String}   appname     - The application name
 * @property {Storage}  config      - `.yo-rc` config file manager
 * @property {Object}   fs          - An instance of {@link https://github.com/SBoudrias/mem-fs-editor Mem-fs-editor}
 * @property {Function} log         - Output content through Interface Adapter
 *
 * @example
 * const Generator = require('yeoman-generator');
 * module.exports = class extends Generator {
 *   writing() {
 *     this.fs.write(this.destinationPath('index.js'), 'const foo = 1;');
 *   }
 * };
 */

var Base = module.exports = function (args, options) {
  events.EventEmitter.call(this);

  if (!Array.isArray(args)) {
    options = args;
    args = [];
  }

  this.options = options || {};
  this._initOptions = _.clone(options);
  this._args = args || [];
  this._options = {};
  this._arguments = [];
  this._composedWith = [];
  this._transformStreams = [];

  this.option('help', {
    type: Boolean,
    alias: 'h',
    description: 'Print the generator\'s options and usage'
  });

  this.option('skip-cache', {
    type: Boolean,
    description: 'Do not remember prompt answers',
    default: false
  });

  this.option('skip-install', {
    type: Boolean,
    description: 'Do not automatically install dependencies',
    default: false
  });

  // Checks required paramaters
  assert(this.options.env, 'You must provide the environment object. Use env#create() to create a new generator.');
  assert(this.options.resolved, 'You must provide the resolved path value. Use env#create() to create a new generator.');
  this.env = this.options.env;
  this.resolved = this.options.resolved;

  // Ensure the environment support features this yeoman-generator version require.
  require('yeoman-environment').enforceUpdate(this.env);

  this.description = this.description || '';

  this.async = function () {
    return function () {};
  };

  this.fs = FileEditor.create(this.env.sharedFs);
  this.conflicter = new Conflicter(this.env.adapter, this.options.force);

  // Mirror the adapter log method on the generator.
  //
  // example:
  // this.log('foo');
  // this.log.error('bar');
  this.log = this.env.adapter.log;

  // Determine the app root
  this.contextRoot = this.env.cwd;

  var rootPath = findUp.sync('.yo-rc.json', {
    cwd: this.env.cwd
  });
  rootPath = rootPath ? path.dirname(rootPath) : this.env.cwd;

  if (rootPath !== this.env.cwd) {
    this.log([
      '',
      'Just found a `.yo-rc.json` in a parent directory.',
      'Setting the project root at: ' + rootPath
    ].join('\n'));
    this.destinationRoot(rootPath);
  }

  this.appname = this.determineAppname();
  this.config = this._getStorage();
  this._globalConfig = this._getGlobalStorage();

  // Ensure source/destination path, can be configured from subclasses
  this.sourceRoot(path.join(path.dirname(this.resolved), 'templates'));
};

util.inherits(Base, events.EventEmitter);

// Mixin the actions modules
_.extend(Base.prototype, require('./actions/install'));
_.extend(Base.prototype, require('./actions/help'));
_.extend(Base.prototype, require('./actions/spawn-command'));
Base.prototype.user = require('./actions/user');

/*
 * Prompt user to answer questions. The signature of this method is the same as {@link https://github.com/SBoudrias/Inquirer.js Inquirer.js}
 *
 * On top of the Inquirer.js API, you can provide a `{cache: true}` property for
 * every question descriptor. When set to true, Yeoman will store/fetch the
 * user's answers as defaults.
 *
 * @param  {array} questions  Array of question descriptor objects. See {@link https://github.com/SBoudrias/Inquirer.js/blob/master/README.md Documentation}
 * @return {Promise}
 */

Base.prototype.prompt = function (questions) {
  questions = promptSuggestion.prefillQuestions(this._globalConfig, questions);
  questions = promptSuggestion.prefillQuestions(this.config, questions);

  return this.env.adapter.prompt(questions).then(function (answers) {
    if (!this.options['skip-cache']) {
      promptSuggestion.storeAnswers(this._globalConfig, questions, answers, false);
      promptSuggestion.storeAnswers(this.config, questions, answers, true);
    }

    return answers;
  }.bind(this));
};

/**
 * Adds an option to the set of generator expected options, only used to
 * generate generator usage. By default, generators get all the cli options
 * parsed by nopt as a `this.options` hash object.
 *
 * ### Options:
 *
 *   - `description` Description for the option
 *   - `type` Either Boolean, String or Number
 *   - `alias` Option name alias (example `-h` and --help`)
 *   - `default` Default value
 *   - `hide` Boolean whether to hide from help
 *
 * @param {String} name
 * @param {Object} config
 */

Base.prototype.option = function (name, config) {
  config = config || {};

  // Alias default to defaults for backward compatibility.
  if ('defaults' in config) {
    config.default = config.defaults;
  }
  config.description = config.description || config.desc;

  _.defaults(config, {
    name: name,
    description: 'Description for ' + name,
    type: Boolean,
    hide: false
  });

  // Check whether boolean option is invalid (starts with no-)
  var boolOptionRegex = /^no-/;
  if (config.type === Boolean && name.match(boolOptionRegex)) {
    let simpleName = name.replace(boolOptionRegex, '');
    return this.emit('error', new Error([
      `Option name ${chalk.yellow(name)} cannot start with ${chalk.red('no-')}\n`,
      `Option name prefixed by ${chalk.yellow('--no')} are parsed as implicit`,
      ` boolean. To use ${chalk.yellow('--' + name)} as an option, use\n`,
      chalk.cyan(`  this.option('${simpleName}', {type: Boolean})`)
    ].join('')));
  }

  if (this._options[name] === null || this._options[name] === undefined) {
    this._options[name] = config;
  }

  this.parseOptions();
  return this;
};

/**
 * Adds an argument to the class and creates an attribute getter for it.
 *
 * Arguments are different from options in several aspects. The first one
 * is how they are parsed from the command line, arguments are retrieved
 * based on their position.
 *
 * Besides, arguments are used inside your code as a property (`this.argument`),
 * while options are all kept in a hash (`this.options`).
 *
 * ### Options:
 *
 *   - `description` Description for the argument
 *   - `required` Boolean whether it is required
 *   - `optional` Boolean whether it is optional
 *   - `type` String, Number, Array, or Object
 *   - `default` Default value for this argument
 *
 * @param {String} name
 * @param {Object} config
 */

Base.prototype.argument = function (name, config) {
  config = config || {};

  // Alias default to defaults for backward compatibility.
  if ('defaults' in config) {
    config.default = config.defaults;
  }
  config.description = config.description || config.desc;

  _.defaults(config, {
    name: name,
    required: config.default === null || config.default === undefined,
    type: String
  });

  this._arguments.push(config);

  this.parseOptions();
  return this;
};

Base.prototype.parseOptions = function () {
  var minimistDef = {
    string: [],
    boolean: [],
    alias: {},
    default: {}
  };

  _.each(this._options, function (option) {
    if (option.type === Boolean) {
      minimistDef.boolean.push(option.name);
      if (!('default' in option) && !option.required) {
        minimistDef.default[option.name] = EMPTY;
      }
    } else {
      minimistDef.string.push(option.name);
    }

    if (option.alias) {
      minimistDef.alias[option.alias] = option.name;
    }

    // Only apply default values if we don't already have a value injected from
    // the runner
    if (option.name in this._initOptions) {
      minimistDef.default[option.name] = this._initOptions[option.name];
    } else if (option.alias && option.alias in this._initOptions) {
      minimistDef.default[option.name] = this._initOptions[option.alias];
    } else if ('default' in option) {
      minimistDef.default[option.name] = option.default;
    }
  }.bind(this));

  var parsedOpts = minimist(this._args, minimistDef);

  // Parse options to the desired type
  _.each(parsedOpts, function (option, name) {
    // Manually set value as undefined if it should be.
    if (option === EMPTY) {
      parsedOpts[name] = undefined;
      return;
    }
    if (this._options[name] && option !== undefined) {
      parsedOpts[name] = this._options[name].type(option);
    }
  }.bind(this));

  // Parse positional arguments to valid options
  this._arguments.forEach(function (config, index) {
    var value;
    if (index >= parsedOpts._.length) {
      if (config.name in this._initOptions) {
        value = this._initOptions[config.name];
      } else if ('default' in config) {
        value = config.default;
      } else {
        return;
      }
    } else if (config.type === Array) {
      value = parsedOpts._.slice(index, parsedOpts._.length);
    } else {
      value = config.type(parsedOpts._[index]);
    }

    parsedOpts[config.name] = value;
  }.bind(this));

  // Make the parsed options available to the instance
  _.extend(this.options, parsedOpts);
  this.args = this.arguments = parsedOpts._;

  // Make sure required args are all present
  this.checkRequiredArgs();
};

Base.prototype.checkRequiredArgs = function () {
  // If the help option was provided, we don't want to check for required
  // arguments, since we're only going to print the help message anyway.
  if (this.options.help) {
    return;
  }

  // Bail early if it's not possible to have a missing required arg
  if (this.args.length > this._arguments.length) {
    return;
  }

  this._arguments.forEach(function (config, position) {
    // If the help option was not provided, check whether the argument was
    // required, and whether a value was provided.
    if (config.required && position >= this.args.length) {
      return this.emit('error', new Error('Did not provide required argument ' + chalk.bold(config.name) + '!'));
    }
  }, this);
};

/**
 * Runs the generator, scheduling prototype methods on a run queue. Method names
 * will determine the order each method is run. Methods without special names
 * will run in the default queue.
 *
 * Any method named `constructor` and any methods prefixed by a `_` won't be scheduled.
 *
 * You can also supply the arguments for the method to be invoked. If none are
 * provided, the same values used to initialize the invoker are used to
 * initialize the invoked.
 *
 * @param {Function} [cb]
 */

Base.prototype.run = function (cb) {
  cb = cb || function () {};

  var self = this;
  this._running = true;
  this.emit('run');

  var methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
  var validMethods = methods.filter(methodIsValid);
  assert(validMethods.length, 'This Generator is empty. Add at least one method for it to run.');

  this.env.runLoop.once('end', function () {
    this.emit('end');
    cb();
  }.bind(this));

  // Ensure a prototype method is a candidate run by default
  function methodIsValid(name) {
    return name.charAt(0) !== '_' && name !== 'constructor';
  }

  function addMethod(method, methodName, queueName) {
    queueName = queueName || 'default';
    debug('Queueing ' + methodName + ' in ' + queueName);
    self.env.runLoop.add(queueName, function (completed) {
      debug('Running ' + methodName);
      self.emit('method:' + methodName);

      runAsync(function () {
        self.async = function () {
          return this.async();
        }.bind(this);

        return method.apply(self, self.args);
      })().then(completed).catch(function (err) {
        debug('An error occured while running ' + methodName, err);

        // Ensure we emit the error event outside the promise context so it won't be
        // swallowed when there's no listeners.
        setImmediate(function () {
          self.emit('error', err);
          cb(err);
        });
      });
    });
  }

  function addInQueue(name) {
    var item = Object.getPrototypeOf(self)[name];
    var queueName = self.env.runLoop.queueNames.indexOf(name) === -1 ? null : name;

    // Name points to a function; run it!
    if (_.isFunction(item)) {
      return addMethod(item, name, queueName);
    }

    // Not a queue hash; stop
    if (!queueName) {
      return;
    }

    // Run each queue items
    _.each(item, function (method, methodName) {
      if (!_.isFunction(method) || !methodIsValid(methodName)) {
        return;
      }

      addMethod(method, methodName, queueName);
    });
  }

  validMethods.forEach(addInQueue);

  var writeFiles = function () {
    this.env.runLoop.add('conflicts', this._writeFiles.bind(this), {
      once: 'write memory fs to disk'
    });
  }.bind(this);

  this.env.sharedFs.on('change', writeFiles);
  writeFiles();

  // Add the default conflicts handling
  this.env.runLoop.add('conflicts', function (done) {
    this.conflicter.resolve(function (err) {
      if (err) {
        this.emit('error', err);
      }

      done();
    }.bind(this));
  }.bind(this));

  _.invokeMap(this._composedWith, 'run');
  return this;
};

/**
 * Compose this generator with another one.
 * @param  {String} namespace  The generator namespace to compose with
 * @param  {Object} options    The options passed to the Generator
 * @param  {Object} [settings] Settings hash on the composition relation
 * @param  {string} [settings.local]        Path to a locally stored generator
 * @param  {String} [settings.link="weak"]  If "strong", the composition will occured
 *                                          even when the composition is initialized by
 *                                          the end user
 * @return {this}
 *
 * @example <caption>Using a peerDependency generator</caption>
 * this.composeWith('bootstrap', { sass: true });
 *
 * @example <caption>Using a direct dependency generator</caption>
 * this.composeWith(require.resolve('generator-bootstrap/app/main.js'), { sass: true });
 */

Base.prototype.composeWith = function (modulePath, options) {
  var generator;
  options = options || {};

  // Pass down the default options so they're correclty mirrored down the chain.
  options = _.extend({
    skipInstall: this.options.skipInstall,
    'skip-install': this.options.skipInstall,
    skipCache: this.options.skipCache,
    'skip-cache': this.options.skipCache
  }, options);

  try {
    var Generator = require(modulePath); // eslint-disable-line import/no-dynamic-require
    Generator.resolved = require.resolve(modulePath);
    Generator.namespace = this.env.namespace(modulePath);
    generator = this.env.instantiate(Generator, {
      options: options,
      arguments: options.arguments
    });
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      generator = this.env.create(modulePath, {
        options: options,
        arguments: options.arguments
      });
    } else {
      throw err;
    }
  }

  if (this._running) {
    generator.run();
  } else {
    this._composedWith.push(generator);
  }

  return this;
};

/**
 * Determine the root generator name (the one who's extending Base).
 * @return {String} The name of the root generator
 */

Base.prototype.rootGeneratorName = function () {
  var pkg = readPkgUp.sync({cwd: this.resolved}).pkg;
  return pkg ? pkg.name : '*';
};

/**
 * Determine the root generator version (the one who's extending Base).
 * @return {String} The version of the root generator
 */

Base.prototype.rootGeneratorVersion = function () {
  var pkg = readPkgUp.sync({cwd: this.resolved}).pkg;
  return pkg ? pkg.version : '0.0.0';
};

/**
 * Return a storage instance.
 * @return {Storage} Generator storage
 * @private
 */

Base.prototype._getStorage = function () {
  var storePath = path.join(this.destinationRoot(), '.yo-rc.json');
  return new Storage(this.rootGeneratorName(), this.fs, storePath);
};

/**
 * Setup a globalConfig storage instance.
 * @return {Storage} Global config storage
 * @private
 */

Base.prototype._getGlobalStorage = function () {
  var storePath = path.join(userHome, '.yo-rc-global.json');
  var storeName = util.format('%s:%s', this.rootGeneratorName(), this.rootGeneratorVersion());
  return new Storage(storeName, this.fs, storePath);
};

/**
 * Change the generator destination root directory.
 * This path is used to find storage, when using a file system helper method (like
 * `this.write` and `this.copy`)
 * @param  {String} rootPath new destination root path
 * @return {String}          destination root path
 */

Base.prototype.destinationRoot = function (rootPath) {
  if (_.isString(rootPath)) {
    this._destinationRoot = path.resolve(rootPath);

    if (!pathExists.sync(rootPath)) {
      mkdirp.sync(rootPath);
    }

    process.chdir(rootPath);
    this.env.cwd = rootPath;

    // Reset the storage
    this.config = this._getStorage();
  }

  return this._destinationRoot || this.env.cwd;
};

/**
 * Change the generator source root directory.
 * This path is used by multiples file system methods like (`this.read` and `this.copy`)
 * @param  {String} rootPath new source root path
 * @return {String}          source root path
 */

Base.prototype.sourceRoot = function (rootPath) {
  if (_.isString(rootPath)) {
    this._sourceRoot = path.resolve(rootPath);
  }

  return this._sourceRoot;
};

/**
 * Join a path to the source root.
 * @param  {...String} path
 * @return {String}    joined path
 */

Base.prototype.templatePath = function () {
  var filepath = path.join.apply(path, arguments);

  if (!pathIsAbsolute(filepath)) {
    filepath = path.join(this.sourceRoot(), filepath);
  }

  return filepath;
};

/**
 * Join a path to the destination root.
 * @param  {...String} path
 * @return {String}    joined path
 */

Base.prototype.destinationPath = function () {
  var filepath = path.join.apply(path, arguments);

  if (!pathIsAbsolute(filepath)) {
    filepath = path.join(this.destinationRoot(), filepath);
  }

  return filepath;
};

/**
 * Determines the name of the application.
 *
 * First checks for name in bower.json.
 * Then checks for name in package.json.
 * Finally defaults to the name of the current directory.
 * @return {String} The name of the application
 */
Base.prototype.determineAppname = function () {
  var appname = this.fs.readJSON(this.destinationPath('bower.json'), {}).name;

  if (!appname) {
    appname = this.fs.readJSON(this.destinationPath('package.json'), {}).name;
  }

  if (!appname) {
    appname = path.basename(this.destinationRoot());
  }

  return appname.replace(/[^\w\s]+?/g, ' ');
};

/**
 * Add a transform stream to the commit stream.
 *
 * Most usually, these transform stream will be Gulp plugins.
 *
 * @param  {stream.Transform|stream.Transform[]} stream An array of Transform stream
 * or a single one.
 * @return {this}
 */
Base.prototype.registerTransformStream = function (streams) {
  assert(streams, 'expected to receive a transform stream as parameter');
  if (!_.isArray(streams)) {
    streams = [streams];
  }
  this._transformStreams = this._transformStreams.concat(streams);
  return this;
};

/**
 * Write memory fs file to disk and logging results
 * @param {Function} done - callback once files are written
 */
Base.prototype._writeFiles = function (done) {
  var self = this;

  var conflictChecker = through.obj(function (file, enc, cb) {
    var stream = this;

    // If the file has no state requiring action, move on
    if (file.state === null) {
      return cb();
    }

    // Config file should not be processed by the conflicter. Just pass through
    var filename = path.basename(file.path);

    if (filename === '.yo-rc.json' || filename === '.yo-rc-global.json') {
      this.push(file);
      return cb();
    }

    self.conflicter.checkForCollision(file.path, file.contents, function (err, status) {
      if (err) {
        cb(err);
        return;
      }

      if (status === 'skip') {
        delete file.state;
      } else {
        stream.push(file);
      }

      cb();
    });
    self.conflicter.resolve();
  });

  var transformStreams = this._transformStreams.concat([conflictChecker]);
  this.fs.commit(transformStreams, function () {
    done();
  });
};

/**
 * Extend the Generator class to create a new one inherithing the base one. This
 * method is useful if your environment do not suport the ES6 classes.
 * @param  {Object} protoProps  Prototype properties (available on the instances)
 * @param  {Object} staticProps Static properties (available on the contructor)
 * @return {Object}             New sub class
 * @example
 * var Generator = require('yeoman-generator');
 * module.exports = Generator.extend({
 *   writing: function () {}
 *   // ...
 * });
 */
Base.extend = require('class-extend').extend;
