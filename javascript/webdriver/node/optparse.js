// Copyright 2011 Software Freedom Conservatory. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A simple command line option parser.
 */

const DEFAULT_USAGE = '%prog [options]';


function Option(name, help, callback) {
  this.name = name;
  this.help = help;
  this.callback = callback;
}

function OptionsParser(opt_usage) {
  this.usage = opt_usage || DEFAULT_USAGE;

  this.optionsByName = {
    help: createHelpOption(this)
  };
}


OptionsParser.prototype.addOption = function(name, help, callback) {
  if (name === 'help') {
    throw new Error('help is a reserved option name');
  }

  var option = new Option(name, help, callback);

  if (this.optionsByName[name]) {
    throw new Error('Duplicate option: ' + JSON.stringify(name) +
        '\nOriginal: ' + formatOption(this.optionsByName[name]) +
        '\nDuplicate:' + formatOption(option));
  }

  this.optionsByName[name] = option;
};


OptionsParser.prototype.parse = function() {
  var n = process.argv.length;
  // Assume first two args are node and the entry script.
  for (var i = 2; i < n; ++i) {
    var arg = process.argv[i];

    var match = arg.match(/^--(\w+)(?=.+)?/);
    if (!match) {
      return process.argv.slice(i);  // All done with flags.
    }

    var option = this.optionsByName[match[1]];
    if (!option) {
      printHelp(this, 'Unrecognized option ' + JSON.stringify(arg),
          2, process.stderr);
    }

    var value = arg.replace(/^--(\w+)=?/, '');
    option.callback(value);
  }
};


function repeat(str, n) {
  return new Array(n + 1).join(str);
}


const MAX_COL_LENGTH = 79;
const HELP_COL_INDEX = 25;
function formatOption(option) {
  var str = '  --' + option.name;

  var space = repeat(' ', HELP_COL_INDEX - str.length);
  if (space.length > 1 &&
      str.length + space.length + option.help.length < MAX_COL_LENGTH) {
    str += space + option.help;
  } else {
    // TODO(jleyba): What if this is > MAX_COL_LENGTH?
    str += '\n' + repeat(' ', HELP_COL_INDEX) + option.help;
  }

  return str;
}


function createHelpOption(optionParser) {
  return new Option('help', 'Show this help message and exit', function() {
    printHelp(optionParser);
  });
}


function printHelp(parser, opt_errorMsg, opt_exitCode, opt_stream) {
  var prog = process.argv[0] + ' ' + process.argv[1];
  var usage = parser.usage.replace(/(.?)%prog\b/g, '$1' + prog);

  var out = opt_stream || process.stdout;

  if (opt_errorMsg) {
    out.write(opt_errorMsg + '\n\n');
  }

  out.write(
      'Usage: ' + usage + '\n\nOptions:\n' +
      formatOption(parser.optionsByName['help']) + '\n');

  for (var option in parser.optionsByName) {
    if (option === 'help') continue;
    out.write(formatOption(parser.optionsByName[option]) + '\n');
  }

  out.write('\n');
  process.exit(opt_exitCode || 0);
}


exports.OptionsParser = OptionsParser;
