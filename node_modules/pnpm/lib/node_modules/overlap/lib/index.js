// Dependencies
var AnsiParser = require("ansi-parser");

/**
 * Overlap
 * Overlaps two strings.
 *
 * @name Overlap
 * @function
 * @param {Object} options An object containing the following fields:
 *
 *  - `who` (String): The first string.
 *  - `with` (String): The second string.
 *  - `where` (Object): The second string position:
 *     - `x` (Number): The position on `x` axis.
 *     - `y` (Number): The position on `y` axis.
 *
 * @return {String} The result string.
 */
module.exports = function(options) {

    // Parse input strings
    var whoString = AnsiParser.parse(options.who.split("\n"))
      , withString = AnsiParser.parse(options.with.split("\n"))
      , where = {
            x: parseInt(options.where.x)
          , y: parseInt(options.where.y)
        }
      , whoStringSize = {
            w: whoString[0].length
          , h: whoString.length
        }
      , withStringSize = {
            w: withString[0].length
          , h: withString.length
        }
      , y = where.y
      , x = null
      , i = 0
      ;

    // Start magic things
    for (; y < where.y + withStringSize.h; ++y) {

        if (!whoString[y]) {
            whoString[y] = [];
            for (i = 0; i < where.x; ++i) {
                AnsiParser.addChar(whoString[y], " ");
            }
        }

        for (x = where.x; x < where.x + withStringSize.w; ++x) {
            if (!withString[y - where.y] || typeof withString[y - where.y][x - where.x] == "undefined") {
                continue;
            }
            whoString[y][x] = withString[y - where.y][x - where.x];
        }
    }

    return AnsiParser.stringify(whoString);
};
