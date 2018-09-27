"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var regexEscape = require("regex-escape");

var ParseIt = function () {
    /**
     * ParseIt
     * The `ParseIt` class. It can be used to use the same data object but with different formats/arguments.
     *
     * @name ParseIt
     * @function
     * @param {Object} obj An object containing the fields to replace.
     */
    function ParseIt(obj) {
        _classCallCheck(this, ParseIt);

        this.obj = obj || {};
        this.re = new RegExp("^(" + Object.keys(obj).map(regexEscape).join("|") + ")");
    }

    /**
     * run
     * Replaces the fields in the format string with data coming from the data object.
     *
     *
     * @name parseIt
     * @function
     * @param {String} format The format input.
     * @param {Array} args An array of arguments to be passed to the replace function (stored in the `obj` object).
     * @return {String} The result as string.
     */


    _createClass(ParseIt, [{
        key: "run",
        value: function run(format, args) {
            var result = "";
            args = args || [];
            do {
                var arr = format.match(this.re),
                    field = arr && arr[1],
                    c = field || format.charAt(0);

                if (field) {
                    var value = this.obj[field];
                    if (typeof value === "function") {
                        value = value.apply(this, args);
                    }
                    result += value;
                } else {
                    result += c;
                }
                format = format.substring(c.length);
            } while (format);
            return result;
        }
    }]);

    return ParseIt;
}();

/**
 * parseIt
 * A wrapper around the `ParseIt` class. The `ParseIt` constructor is accessible using `parseIt.Parser`.
 *
 * @name parseIt
 * @function
 * @param {String} format The format input.
 * @param {Object} obj An object containing the fields to replace.
 * @param {Array} args An array of arguments to be passed to the replace function (stored in the `obj` object).
 * @return {String} The result as string.
 */


function parseIt(format, obj, args) {
    return new ParseIt(obj).run(format, args);
}

parseIt.Parser = ParseIt;

module.exports = parseIt;