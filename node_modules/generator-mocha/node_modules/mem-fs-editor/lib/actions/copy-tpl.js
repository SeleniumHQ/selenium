'use strict';

var path = require('path');
var extend = require('deep-extend');
var ejs = require('ejs');

module.exports = function (from, to, context, tplSettings, options) {
  context = context || {};

  this.copy(from, to, extend(options || {}, {
    process: function (contents, filename) {
      return ejs.render(
        contents.toString(),
        context,
        // Setting filename by default allow including partials.
        extend({filename: filename}, tplSettings || {})
      );
    }
  }));
};
