'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var globby = require('globby');
var extend = require('deep-extend');
var multimatch = require('multimatch');
var util = require('../util');

function applyProcessingFunc(process, contents, filename) {
  var output = process(contents, filename);
  return output instanceof Buffer ? output : new Buffer(output);
}

exports.copy = function (from, to, options) {
  to = path.resolve(to);
  options = options || {};
  var fromGlob = util.globify(from);

  var globOptions = extend(options.globOptions || {}, {nodir: true});
  var diskFiles = globby.sync(fromGlob, globOptions);
  var storeFiles = [];
  this.store.each(file => {
    if (multimatch([file.path], fromGlob).length !== 0) {
      storeFiles.push(file.path);
    }
  });
  var files = diskFiles.concat(storeFiles);

  var generateDestination = () => to;
  if (Array.isArray(from) || !this.exists(from) || glob.hasMagic(from)) {
    assert(
      !this.exists(to) || fs.statSync(to).isDirectory(),
      'When copying multiple files, provide a directory as destination'
    );

    var root = util.getCommonPath(from);
    generateDestination = filepath => {
      var toFile = path.relative(root, filepath);
      return path.join(to, toFile);
    };
  }

  // Sanity checks: Makes sure we copy at least one file.
  assert(files.length > 0, 'Trying to copy from a source that does not exist: ' + from);

  files.forEach(file => {
    this._copySingle(file, generateDestination(file), options);
  });
};

exports._copySingle = function (from, to, options) {
  options = options || {};

  assert(this.exists(from), 'Trying to copy from a source that does not exist: ' + from);

  var file = this.store.get(from);

  var contents = file.contents;
  if (options.process) {
    contents = applyProcessingFunc(options.process, file.contents, file.path);
  }

  this.write(to, contents, file.stat);
};
