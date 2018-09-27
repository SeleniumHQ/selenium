'use strict';
var util = require('util');
var fs = require('fs');
var path = require('path');
var events = require('events');
var chalk = require('chalk');
var _ = require('lodash');
var GroupedQueue = require('grouped-queue');
var escapeStrRe = require('escape-string-regexp');
var untildify = require('untildify');
var memFs = require('mem-fs');
var debug = require('debug')('yeoman:environment');
var Store = require('./store');
var resolver = require('./resolver');
var TerminalAdapter = require('./adapter');

/**
 * `Environment` object is responsible of handling the lifecyle and bootstrap
 * of generators in a specific environment (your app).
 *
 * It provides a high-level API to create and run generators, as well as further
 * tuning where and how a generator is resolved.
 *
 * An environment is created using a list of `arguments` and a Hash of
 * `options`. Usually, this is the list of arguments you get back from your CLI
 * options parser.
 *
 * An optional adapter can be passed to provide interaction in non-CLI environment
 * (e.g. IDE plugins), otherwise a `TerminalAdapter` is instantiated by default
 *
 * @constructor
 * @mixes env/resolver
 * @param {String|Array} args
 * @param {Object} opts
 * @param {TerminalAdapter} [adaper] - A TerminalAdapter instance or another object
 *                                     implementing this adapter interface. This is how
 *                                     you'd interface Yeoman with a GUI or an editor.
 */

var Environment = module.exports = function Environment(args, opts, adapter) {
  events.EventEmitter.call(this);

  args = args || [];
  this.arguments = Array.isArray(args) ? args : args.split(' ');
  this.options = opts || {};
  this.adapter = adapter || new TerminalAdapter();
  this.cwd = this.options.cwd || process.cwd();
  this.store = new Store();

  this.runLoop = new GroupedQueue(Environment.queues);
  this.sharedFs = memFs.create();

  // Each composed generator might set listeners on these shared resources. Let's make sure
  // Node won't complain about event listeners leaks.
  this.runLoop.setMaxListeners(0);
  this.sharedFs.setMaxListeners(0);

  this.lookups = ['.', 'generators', 'lib/generators'];
  this.aliases = [];

  this.alias(/^([^:]+)$/, '$1:app');
};

util.inherits(Environment, events.EventEmitter);
_.extend(Environment.prototype, resolver);

Environment.queues = [
  'initializing',
  'prompting',
  'configuring',
  'default',
  'writing',
  'conflicts',
  'install',
  'end'
];

/**
 * Error handler taking `err` instance of Error.
 *
 * The `error` event is emitted with the error object, if no `error` listener
 * is registered, then we throw the error.
 *
 * @param  {Object} err
 * @return {Error}  err
 */

Environment.prototype.error = function error(err) {
  err = err instanceof Error ? err : new Error(err);

  if (!this.emit('error', err)) {
    throw err;
  }

  return err;
};

/**
 * Outputs the general help and usage. Optionally, if generators have been
 * registered, the list of available generators is also displayed.
 *
 * @param {String} name
 */

Environment.prototype.help = function help(name) {
  name = name || 'init';

  var out = [
    'Usage: :binary: GENERATOR [args] [options]',
    '',
    'General options:',
    '  --help       # Print generator\'s options and usage',
    '  -f, --force  # Overwrite files that already exist',
    '',
    'Please choose a generator below.',
    ''
  ];

  var ns = this.namespaces();

  var groups = {};
  ns.forEach(function (namespace) {
    var base = namespace.split(':')[0];

    if (!groups[base]) {
      groups[base] = [];
    }

    groups[base].push(namespace);
  });

  Object.keys(groups).sort().forEach(function (key) {
    var group = groups[key];

    if (group.length >= 1) {
      out.push('', key.charAt(0).toUpperCase() + key.slice(1));
    }

    groups[key].forEach(function (ns) {
      out.push('  ' + ns);
    });
  });

  return out.join('\n').replace(/:binary:/g, name);
};

/**
 * Registers a specific `generator` to this environment. This generator is stored under
 * provided namespace, or a default namespace format if none if available.
 *
 * @param  {String} name      - Filepath to the a generator or a npm package name
 * @param  {String} namespace - Namespace under which register the generator (optional)
 * @return {String} namespace - Namespace assigned to the registered generator
 */

Environment.prototype.register = function register(name, namespace) {
  if (!_.isString(name)) {
    return this.error(new Error('You must provide a generator name to register.'));
  }

  var modulePath = this.resolveModulePath(name);
  namespace = namespace || this.namespace(modulePath);

  if (!namespace) {
    return this.error(new Error('Unable to determine namespace.'));
  }

  this.store.add(namespace, modulePath);

  debug('Registered %s (%s)', namespace, modulePath);
  return this;
};

/**
 * Register a stubbed generator to this environment. This method allow to register raw
 * functions under the provided namespace. `registerStub` will enforce the function passed
 * to extend the Base generator automatically.
 *
 * @param  {Function} Generator - A Generator constructor or a simple function
 * @param  {String}   namespace - Namespace under which register the generator
 * @return {this}
 */

Environment.prototype.registerStub = function registerStub(Generator, namespace) {
  if (!_.isFunction(Generator)) {
    return this.error(new Error('You must provide a stub function to register.'));
  }

  if (!_.isString(namespace)) {
    return this.error(new Error('You must provide a namespace to register.'));
  }

  this.store.add(namespace, Generator);

  return this;
};

/**
 * Returns the list of registered namespace.
 * @return {Array}
 */

Environment.prototype.namespaces = function namespaces() {
  return this.store.namespaces();
};

/**
 * Returns stored generators meta
 * @return {Object}
 */

Environment.prototype.getGeneratorsMeta = function getGeneratorsMeta() {
  return this.store.getGeneratorsMeta();
};

/**
 * Get registered generators names
 *
 * @return {Array}
 */

Environment.prototype.getGeneratorNames = function getGeneratorNames() {
  return _.uniq(Object.keys(this.getGeneratorsMeta()).map(Environment.namespaceToName));
};

/**
 * Get a single generator from the registered list of generators. The lookup is
 * based on generator's namespace, "walking up" the namespaces until a matching
 * is found. Eg. if an `angular:common` namespace is registered, and we try to
 * get `angular:common:all` then we get `angular:common` as a fallback (unless
 * an `angular:common:all` generator is registered).
 *
 * @param  {String} namespaceOrPath
 * @return {Generator|null} - the generator registered under the namespace
 */

Environment.prototype.get = function get(namespaceOrPath) {
  // Stop the recursive search if nothing is left
  if (!namespaceOrPath) {
    return;
  }

  var namespace = namespaceOrPath;

  // Legacy yeoman-generator `#hookFor()` function is passing the generator path as part
  // of the namespace. If we find a path delimiter in the namespace, then ignore the
  // last part of the namespace.
  var parts = namespaceOrPath.split(':');
  var maybePath = _.last(parts);
  if (parts.length > 1 && /[\/\\]/.test(maybePath)) {
    parts.pop();

    // We also want to remove the drive letter on windows
    if (maybePath.indexOf('\\') >= 0 && _.last(parts).length === 1) {
      parts.pop();
    }

    namespace = parts.join(':');
  }

  return this.store.get(namespace) ||
    this.store.get(this.alias(namespace)) ||
    // namespace is empty if namespaceOrPath contains a win32 absolute path of the form 'C:\path\to\generator'.
    // for this reason we pass namespaceOrPath to the getByPath function.
    this.getByPath(namespaceOrPath);
};

/**
 * Get a generator by path instead of namespace.
 * @param  {String} path
 * @return {Generator|null} - the generator found at the location
 */
Environment.prototype.getByPath = function (path) {
  if (fs.existsSync(path)) {
    var namespace = this.namespace(path);
    this.register(path, namespace);

    return this.get(namespace);
  }
};

/**
 * Create is the Generator factory. It takes a namespace to lookup and optional
 * hash of options, that lets you define `arguments` and `options` to
 * instantiate the generator with.
 *
 * An error is raised on invalid namespace.
 *
 * @param {String} namespace
 * @param {Object} options
 */

Environment.prototype.create = function create(namespace, options) {
  options = options || {};

  var Generator = this.get(namespace);

  if (!_.isFunction(Generator)) {
    return this.error(
      new Error(
        chalk.red('You don\’t seem to have a generator with the name “' + namespace + '” installed.') + '\n' +
        'But help is on the way:\n\n' +
        'You can see available generators via ' +
        chalk.yellow('npm search yeoman-generator') + ' or via ' + chalk.yellow('http://yeoman.io/generators/') + '. \n' +
        'Install them with ' + chalk.yellow('npm install generator-' + namespace) + '.\n\n' +
        'To see all your installed generators run ' + chalk.yellow('yo') + ' without any arguments. ' +
        'Adding the ' + chalk.yellow('--help') + ' option will also show subgenerators. \n\n' +
        'If ' + chalk.yellow('yo') + ' cannot find the generator, run ' + chalk.yellow('yo doctor') + ' to troubleshoot your system.'
      )
    );
  }

  return this.instantiate(Generator, options);
};

/**
 * Instantiate a Generator with metadatas
 *
 * @param {String}       namespace
 * @param {Object}       options
 * @param {Array|String} options.arguments  Arguments to pass the instance
 * @param {Object}       options.options    Options to pass the instance
 */

Environment.prototype.instantiate = function instantiate(Generator, options) {
  options = options || {};

  var args = options.arguments || options.args || _.clone(this.arguments);
  args = Array.isArray(args) ? args : args.split(' ');

  var opts = options.options || _.clone(this.options);

  opts.env = this;
  opts.resolved = Generator.resolved || 'unknown';
  opts.namespace = Generator.namespace;
  return new Generator(args, opts);
};

/**
 * Tries to locate and run a specific generator. The lookup is done depending
 * on the provided arguments, options and the list of registered generators.
 *
 * When the environment was unable to resolve a generator, an error is raised.
 *
 * @param {String|Array} args
 * @param {Object}       options
 * @param {Function}     done
 */

Environment.prototype.run = function run(args, options, done) {
  args = args || this.arguments;

  if (typeof options === 'function') {
    done = options;
    options = this.options;
  }

  if (typeof args === 'function') {
    done = args;
    options = this.options;
    args = this.arguments;
  }

  args = Array.isArray(args) ? args : args.split(' ');
  options = options || this.options;

  var name = args.shift();
  if (!name) {
    return this.error(new Error('Must provide at least one argument, the generator namespace to invoke.'));
  }

  var generator = this.create(name, {
    args: args,
    options: options
  });

  if (generator instanceof Error) {
    return generator;
  }

  if (options.help) {
    return console.log(generator.help());
  }

  return generator.run(done);
};

/**
 * Given a String `filepath`, tries to figure out the relative namespace.
 *
 * ### Examples:
 *
 *     this.namespace('backbone/all/index.js');
 *     // => backbone:all
 *
 *     this.namespace('generator-backbone/model');
 *     // => backbone:model
 *
 *     this.namespace('backbone.js');
 *     // => backbone
 *
 *     this.namespace('generator-mocha/backbone/model/index.js');
 *     // => mocha:backbone:model
 *
 * @param {String} filepath
 */

Environment.prototype.namespace = function namespace(filepath) {
  if (!filepath) {
    throw new Error('Missing namespace');
  }

  // cleanup extension and normalize path for differents OS
  var ns = path.normalize(filepath.replace(new RegExp(escapeStrRe(path.extname(filepath)) + '$'), ''));

  // Sort lookups by length so biggest are removed first
  var lookups = _(this.lookups.concat(['..'])).map(path.normalize).sortBy('length').value().reverse();

  // if `ns` contains a lookup dir in its path, remove it.
  ns = lookups.reduce(function (ns, lookup) {
    // only match full directory (begin with leading slash or start of input, end with trailing slash)
    lookup = new RegExp('(?:\\\\|/|^)' + escapeStrRe(lookup) + '(?=\\\\|/)', 'g');
    return ns.replace(lookup, '');
  }, ns);

  var folders = ns.split(path.sep);
  var scope = _.findLast(folders, function (folder) {
    return folder.indexOf('@') === 0;
  });

  // cleanup `ns` from unwanted parts and then normalize slashes to `:`
  ns = ns
    .replace(/(.*generator-)/, '') // remove before `generator-`
    .replace(/[\/\\](index|main)$/, '') // remove `/index` or `/main`
    .replace(/^[\/\\]+/, '') // remove leading `/`
    .replace(/[\/\\]+/g, ':'); // replace slashes by `:`

  if (scope) {
    ns = scope + '/' + ns;
  }

  debug('Resolve namespaces for %s: %s', filepath, ns);

  return ns;
};

/**
 * Resolve a module path
 * @param  {String} moduleId - Filepath or module name
 * @return {String}          - The resolved path leading to the module
 */

Environment.prototype.resolveModulePath = function resolveModulePath(moduleId) {
  if (moduleId[0] === '.') {
    moduleId = path.resolve(moduleId);
  }
  if (path.extname(moduleId) === '') {
    moduleId += path.sep;
  }

  return require.resolve(untildify(moduleId));
};

/**
 * Make sure the Environment present expected methods if an old version is
 * passed to a Generator.
 * @param  {Environment} env
 * @return {Environment} The updated env
 */

Environment.enforceUpdate = function (env) {
  if (!env.adapter) {
    env.adapter = new TerminalAdapter();
  }

  if (!env.runLoop) {
    env.runLoop = new GroupedQueue([
      'initializing',
      'prompting',
      'configuring',
      'default',
      'writing',
      'conflicts',
      'install',
      'end'
    ]);
  }

  if (!env.sharedFs) {
    env.sharedFs = memFs.create();
  }

  return env;
};

/**
 * Factory method to create an environment instance. Take same parameters as the
 * Environment constructor.
 *
 * @see This method take the same arguments as {@link Environment} constructor
 *
 * @return {Environment} a new Environment instance
 */

Environment.createEnv = function (args, opts, adapter) {
  return new Environment(args, opts, adapter);
};

/**
 * Convert a generators namespace to its name
 *
 * @param  {String} namespace
 * @return {String}
 */

Environment.namespaceToName = function (namespace) {
  return namespace.split(':')[0];
};

/**
 * Expose the utilities on the module
 * @see {@link env/util}
 */

Environment.util = require('./util/util');
