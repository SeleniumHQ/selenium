"use strict";

var ul = require("ul"),
    excludeArr = require("exclude-arr"),
    staticMethods = require("static-methods");

/**
 * classMethods
 * Get the methods of a JavaScript class.
 *
 * @name classMethods
 * @function
 * @param {Class} input The class you want to get the methods of.
 * @param {Object} options An object containing the following fields:
 *
 *  - `deep` (Boolean): If `false` the parent classes will not be iterated.
 *  - `includeStatic` (Boolean): If `true`, the static methods will be included too.
 *
 * @return {Array} The class methods.
 */
module.exports = function classMethods(input, options) {

    options = ul.merge(options, {
        deep: true,
        includeStatic: false
    });

    var getMethods = function getMethods(inp) {
        if (!inp) {
            return [];
        }
        var methods = inp.prototype ? Object.getOwnPropertyNames(inp.prototype) : [];

        if (options.includeStatic && inp.name) {
            methods = methods.concat(staticMethods(inp));
        }

        if (options.deep !== false) {
            methods = methods.concat(getMethods(Object.getPrototypeOf(inp)));
        }

        excludeArr(methods, "constructor");

        return methods;
    };

    return getMethods(input);
};