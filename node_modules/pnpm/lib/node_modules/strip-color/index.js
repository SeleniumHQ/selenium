/*!
 * strip-color <https://github.com/jonschlinkert/strip-color>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function(str) {
  return str.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '');
};
