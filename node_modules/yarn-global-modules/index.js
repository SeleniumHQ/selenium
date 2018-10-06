'use strict';

var path = require('path');
var yarnPrefix = require('yarn-config-directory');

module.exports = function() {
  return path.join(yarnPrefix(), 'global');
};
