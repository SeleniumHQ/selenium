'use strict';
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var table = require('text-table');
var pathExists = require('path-exists');

/**
 * @mixin
 * @alias actions/help
 */
var help = module.exports;

/**
 * Tries to get the description from a USAGE file one folder above the
 * source root otherwise uses a default description.
 */

help.help = function () {
  var filepath = path.join(this.sourceRoot(), '../USAGE');
  var exists = pathExists.sync(filepath);
  var out = [
    'Usage:',
    '  ' + this.usage(),
    ''
  ];

  // Build options
  if (Object.keys(this._options).length > 0) {
    out = out.concat([
      'Options:',
      this.optionsHelp(),
      ''
    ]);
  }

  // Build arguments
  if (this._arguments.length > 0) {
    out = out.concat([
      'Arguments:',
      this.argumentsHelp(),
      ''
    ]);
  }

  // Append USAGE file is any
  if (exists) {
    out.push(fs.readFileSync(filepath, 'utf8'));
  }

  return out.join('\n');
};

function formatArg(config) {
  var arg = '<' + config.name + '>';

  if (!config.required) {
    arg = '[' + arg + ']';
  }

  return arg;
}

/**
 * Output usage information for this given generator, depending on its arguments
 * or options.
 */

help.usage = function () {
  var options = Object.keys(this._options).length ? '[options]' : '';
  var name = ' ' + this.options.namespace;
  var args = '';

  if (this._arguments.length > 0) {
    args = this._arguments.map(formatArg).join(' ');
  }

  name = name.replace(/^yeoman:/, '');
  var out = 'yo' + name + ' ' + options + ' ' + args;

  if (this.description) {
    out += '\n\n' + this.description;
  }

  return out;
};

/**
 * Simple setter for custom `description` to append on help output.
 *
 * @param {String} description
 */

help.desc = function (description) {
  this.description = description || '';
  return this;
};

/**
 * Get help text for arguments
 * @returns {String} Text of options in formatted table
 */
help.argumentsHelp = function () {
  var rows = this._arguments.map(function (config) {
    return [
      '',
      config.name ? config.name : '',
      config.description ? '# ' + config.description : '',
      config.type ? 'Type: ' + config.type.name : '',
      'Required: ' + config.required
    ];
  });

  return table(rows);
};

/**
 * Get help text for options
 * @returns {String} Text of options in formatted table
 */
help.optionsHelp = function () {
  var options = _.reject(this._options, function (el) {
    return el.hide;
  });

  var rows = options.map(function (opt) {
    return [
      '',
      opt.alias ? '-' + opt.alias + ', ' : '',
      '--' + opt.name,
      opt.description ? '# ' + opt.description : '',
      (opt.default !== undefined && opt.default !== null && opt.default !== '') ? 'Default: ' + opt.default : ''
    ];
  });

  return table(rows);
};
