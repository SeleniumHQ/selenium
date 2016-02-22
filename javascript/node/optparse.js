// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview A simple command line option parser.
 */

'use strict';

var path = require('path');


/**
 * Repeats a string n times.
 * @param {string} str The string to repeat.
 * @param {number} n The number of times to repeat the string.
 * @return {string} The repeated string, concatenated together.
 */
function repeatStr(str, n) {
  return new Array(n + 1).join(str);
}


/**
 * Trims a string of all trailing and leading whitespace.
 * @param {string} str The string to trim.
 * @return {string} The trimmed string.
 */
function trimStr(str) {
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
}


/**
 * Wraps the provided {@code text} so every line is at most {@code width}
 * characters long.
 * @param {string} text The text to wrap.
 * @param {number} width The maximum line length.
 * @param {string=} opt_indent String that will be prepended to each line.
 *     Defaults to the empty string.
 * @return {!Array.<string>} A list of lines, without newline characters.
 */
function wrapStr(text, width, opt_indent) {
  var out = [],
      indent = opt_indent || '';

  if (indent.length >= width) {
    throw Error('Wrapped line indentation is longer than permitted width: ' +
        indent.length + ' >= ' + width);
  }

  text.split('\n').forEach(function(line) {
    if (/^\s*$/.test(line)) {
      out.push('');  // Push a blank line.
      return;
    }

    do {
      line = indent + trimStr(line);
      out.push(line.substring(0, width));
      line = line.substring(width);
    } while (line);
  });

  return out;
}


/**
 * The total number of columns for output in a printed help message.
 * @type {number}
 * @const
 */
var TOTAL_WIDTH = 80;


/**
 * Indentation to use between the left column and options string, and between
 * the options string and help text.
 * @type {string}
 * @const
 */
var IDENTATION = '  ';


/**
 * The maximum column for option text.
 * @type {number}
 * @const
 */
var MAX_HELP_POSITION = 24;


/**
 * Column where the help text should begin.
 * @type {number}
 * @const
 */
var HELP_TEXT_POSITION = MAX_HELP_POSITION + IDENTATION.length;


/**
 * Formats a help message for the given parser.
 * @param {string} usage The usage string. All occurences of "$0" will be
 *     replaced with the name of the current program.
 * @param {!Object.<!Option>} options The options to format.
 * @return {string} The formatted help message.
 */
function formatHelpMsg(usage, options) {
  var prog = path.basename(
      process.argv[0]) + ' ' + path.basename(process.argv[1]);
  var help = [
    usage.replace(/\$0\b/g, prog),
    '',
    'Options:',
    formatOption('help', 'Show this message and exit')
  ];

  Object.keys(options).sort().forEach(function(key) {
    help.push(formatOption(key, options[key].help));
  });

  help.push('');

  return help.join('\n');
}


/**
 * Formats the help message for a single option.  Will place the option string
 * and help text on the same line whenever possible.
 * @param {string} name The name of the option.
 * @param {string} helpMsg The option's help message.
 * @return {string} The formatted option.
 */
function formatOption(name, helpMsg) {
  var result = [];
  var options = IDENTATION + '--' + name;

  if (options.length > MAX_HELP_POSITION) {
    result.push(options);
    result.push('\n');
    result.push(wrapStr(helpMsg, TOTAL_WIDTH,
        repeatStr(' ', HELP_TEXT_POSITION)).join('\n'));
  } else {
    var spaceCount = HELP_TEXT_POSITION - options.length;
    options += repeatStr(' ', spaceCount) + helpMsg;
    result.push(options.substring(0, TOTAL_WIDTH));
    options = options.substring(TOTAL_WIDTH);
    if (options) {
      result.push('\n');
      result.push(wrapStr(options, TOTAL_WIDTH,
          repeatStr(' ', HELP_TEXT_POSITION)).join('\n'));
    }
  }

  return result.join('');
}


var OPTION_NAME_PATTERN = '[a-zA-Z][a-zA-Z0-9_]*';
var OPTION_NAME_REGEX = new RegExp('^' + OPTION_NAME_PATTERN + '$');
var OPTION_FLAG_REGEX = new RegExp(
    '^--(' + OPTION_NAME_PATTERN + ')(?:=(.*))?$');


function checkOptionName(name, options) {
  if ('help' === name) {
    throw Error('"help" is a reserved option name');
  }

  if (!OPTION_NAME_REGEX.test(name)) {
    throw Error('option ' + JSON.stringify(name) + ' must match ' +
        OPTION_NAME_REGEX);
  }

  if (name in options) {
    throw Error('option ' + JSON.stringify(name) + ' has already been defined');
  }
}


function parseOptionValue(name, spec, value) {
  try {
    return spec.parse(value);
  } catch (ex) {
    ex.message = 'Invalid value for ' + JSON.stringify('--' + name) +
        ': ' + ex.message;
    throw ex;
  }
}


function parseBoolean(value) {
  // Empty string if the option was specified without a value; implies true.
  if (!value) {
    return true;
  }

  var tmp = value.toLowerCase();
  if (tmp === 'true' || tmp === '1') {
    return true;
  } else if (tmp === 'false' || tmp === '0') {
    return false;
  }
  throw Error(JSON.stringify(value) + ' is not a valid boolean value');
}
parseBoolean['default'] = false;


function parseNumber(value) {
  if (/^0x\d+$/.test(value)) {
    return parseInt(value);
  }

  var num = parseFloat(value);
  if (isNaN(num) || num != value) {
    throw Error(JSON.stringify(value) + ' is not a valid number');
  }
  return num;
}
parseNumber['default'] = 0;


function parseString(value) { return value; }
parseString['default'] = '';


function parseRegex(value) { return new RegExp(value); }



/**
 * A command line option parser.  Will automatically parse the command line
 * arguments to this program upon accessing the {@code options} or {@code argv}
 * properies. The command line will only be re-parsed if this parser's
 * configuration has changed since the last access.
 * @constructor
 */
function OptionParser() {

  /** @type {string} */
  var usage = OptionParser.DEFAULT_USAGE;

  /** @type {boolean} */
  var mustParse = true;

  /** @type {!Object.<*>} */
  var parsedOptions = {};

  /** @type {!Array.<string>} */
  var extraArgs = [];

  /**
   * Sets the usage string. All occurences of "$0" will be replaced with the
   * current executable's name.
   * @param {string} usageStr The new usage string.
   * @return {!OptionParser} A self reference.
   * @this {OptionParser}
   */
  this.usage = function(usageStr) {
    mustParse = true;
    usage = usageStr;
    return this;
  };

  /**
   * @type {!Object.<{
   *   help: string,
   *   parse: function(string): *,
   *   required: boolean,
   *   list: boolean,
   *   callback: function(*),
   *   default: *
   * }>}
   */
  var options = {};

  /**
   * Adds a new option to this parser.
   * @param {string} name The name of the option.
   * @param {function(string): *} parseFn The function to use for parsing the
   *     option. If this function has a "default" property, it will be used as
   *     the default value for the option if it was not provided on the command
   *     line. If not specified, the default value will be undefined. The
   *     default value may be overrideden using the "default" property in the
   *     option spec.
   * @param {Object=} opt_spec The option spec.
   * @return {!OptionParser} A self reference.
   * @this {OptionParser}
   */
  this.addOption = function(name, parseFn, opt_spec) {
    checkOptionName(name, options);
    var spec = opt_spec || {};

    // Quoted notation for "default" to bypass annoying IDE syntax bug.
    var defaultValue = spec['default'] ||
        (!!spec.list ? [] : parseFn['default']);

    options[name] = {
      help: spec.help || '',
      parse: parseFn,
      required: !!spec.required,
      list: !!spec.list,
      callback: spec.callback || function() {},
      'default': defaultValue
    };
    mustParse = true;
    return this;
  };

  /**
   * Defines a boolean option. Option values may be one of {'', 'true', 'false',
   * '0', '1'}. In the case of the empty string (''), the option value will be
   * set to true.
   * @param {string} name The name of the option.
   * @param {Object=} opt_spec The option spec.
   * @return {!OptionParser} A self reference.
   * @this {OptionParser}
  */
  this.boolean = function(name, opt_spec) {
    return this.addOption(name, parseBoolean, opt_spec);
  };

  /**
   * Defines a numeric option.
   * @param {string} name The name of the option.
   * @param {Object=} opt_spec The option spec.
   * @return {!OptionParser} A self reference.
   * @this {OptionParser}
   */
  this.number = function(name, opt_spec) {
    return this.addOption(name, parseNumber, opt_spec);
  };

  /**
   * Defines a path option. Each path will be resolved relative to the
   * current workin directory, if not absolute.
   * @param {string} name The name of the option.
   * @param {Object=} opt_spec The option spec.
   * @return {!OptionParser} A self reference.
   * @this {OptionParser}
   */
  this.path = function(name, opt_spec) {
    return this.addOption(name, path.resolve, opt_spec);
  };

  /**
   * Defines a basic string option.
   * @param {string} name The name of the option.
   * @param {Object=} opt_spec The option spec.
   * @return {!OptionParser} A self reference.
   * @this {OptionParser}
   */
  this.string = function(name, opt_spec) {
    return this.addOption(name, parseString, opt_spec);
  };

  /**
   * Defines a regular expression based option.
   * @param {string} name The name of the option.
   * @param {Object=} opt_spec The option spec.
   * @return {!OptionParser} A self reference.
   * @this {OptionParser}
   */
  this.regex = function(name, opt_spec) {
    return this.addOption(name, parseRegex, opt_spec);
  };

  /**
   * Returns the parsed command line options.
   *
   * <p>The command line arguments will be re-parsed if this parser's
   * configuration has changed since the last access.
   *
   * @return {!Object.<*>} The parsed options.
   */
  this.__defineGetter__('options', function() {
    parse();
    return parsedOptions;
  });

  /**
   * Returns the remaining command line arguments after all options have been
   * parsed.
   *
   * <p>The command line arguments will be re-parsed if this parser's
   * configuration has changed since the last access.
   *
   * @return {!Array.<string>} The remaining command line arguments.
   */
  this.__defineGetter__('argv', function() {
    parse();
    return extraArgs;
  });

  /**
   * Parses a list of arguments. After parsing, the options property of this
   * object will contain the value for each parsed flags, and the argv
   * property will contain all remaining command line arguments.
   * @throws {Error} If the arguments could not be parsed.
   */
  this.parse = parse;

  /**
   * Returns a formatted help message for this parser.
   * @return {string} The help message for this parser.
   */
  this.getHelpMsg = getHelpMsg;

  function getHelpMsg() {
    return formatHelpMsg(usage, options);
  }

  function parse() {
    if (!mustParse) {
      return;
    }

    parsedOptions = {};
    extraArgs = [];

    var args = process.argv.slice(2);
    var n = args.length;

    try {
      for (var i = 0; i < n; ++i) {
        var arg = args[i];
        if (arg === '--') {
          extraArgs = args.slice(i + 1);
          break;
        }

        var match = arg.match(OPTION_FLAG_REGEX);
        if (match) {
          // Special case --help.
          if (match[1] === 'help') {
            printHelpAndDie('', 0);
          }
          parseOption(match);
        } else {
          extraArgs = args.slice(i + 1);
          break;
        }
      }
    } catch (ex) {
      printHelpAndDie(ex.message, 1);
    }

    for (var name in options) {
      var option = options[name];
      if (!(name in parsedOptions)) {
        if (option.required) {
          printHelpAndDie('Missing required option: --' + name, 1);
        }
        parsedOptions[name] = option.list ? [] : option['default'];
      }
    }

    mustParse = false;
  }

  function printHelpAndDie(errorMessage, exitCode) {
    process.stdout.write(errorMessage + '\n');
    process.stdout.write(getHelpMsg());
    process.exit(exitCode);
  }

  function parseOption(match) {
    var option = options[match[1]];
    if (!option) {
      throw Error(JSON.stringify('--' + match[1]) + ' is not a valid option');
    }

    var value = match[2];
    if (typeof value !== 'undefined') {
      value = parseOptionValue(match[1], option, value);
    } else if (option.parse === parseBoolean) {
      value = true;
    } else {
      throw Error('Option ' + JSON.stringify('--' + option.name) +
          'requires an operand');
    }

    option.callback(value);

    if (option.list) {
      var array = parsedOptions[match[1]] || [];
      parsedOptions[match[1]] = array;
      array.push(value);
    } else {
      parsedOptions[match[1]] = value;
    }
  }
}


/**
 * The default usage message for an option parser.
 */
Object.defineProperty(OptionParser, 'DEFAULT_USAGE', {
  value: 'Usage: $0 [options] [arguments]',
  writable: false,
  enumerable: true,
  configurable: false
});


/** @type {!OptionParser} */
exports.OptionParser = OptionParser;

if (module === require.main) {
  var parser = new OptionParser().
      boolean('bool_flag', {
        help: 'This is a boolean flag'
      }).
      number('number_flag', {
        help: 'This is a number flag'
      }).
      path('path_flag', {
        help: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
            'Nam pharetra pellentesque augue ut auctor. Mauris eget est ' +
            'vitae quam imperdiet mollis. Ut lorem lorem, commodo et ' +
            'interdum cursus, convallis quis mi. Aenean facilisis adipiscing ' +
            'imperdiet. Etiam tristique facilisis ullamcorper. Vestibulum ' +
            'at mauris quis eros lobortis viverra vel non massa. ' +
            'Aenean eu sodales quam.'
      }).
      string('the_quick_brown_fox_jumped_over_the_very_lazy_dog', {
        help: 'The quick brown fox jumped over the very lazy dog'
      });

  console.log('Options are: ');
  for (var key in parser.options) {
    console.log('  --' + key + '=' + parser.options[key]);
  }
  console.log('Args are: ');
  console.log('  ', parser.argv.join(' '));
}
