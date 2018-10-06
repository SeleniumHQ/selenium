'use strict';

/*!
 * changelog-filename-regex | ISC (c) Shinnosuke Watanabe
 * https://github.com/shinnn/changelog-filename-regex
*/
var index = /^(?:(?:update|change|release)(?:s|[ \-_]*(?:logs?|histor(?:y|ies)))|histor(?:y|ies)|release[ \-_]*notes?)(?:\.[\da-z]+)?$/i;

module.exports = index;
