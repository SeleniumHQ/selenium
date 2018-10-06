"use strict";

/**
 * staticMethods
 * Get the static methods of a JavaScript class.
 *
 * @name staticMethods
 * @function
 * @param {Class} input The input class.
 * @return {Array} The static methods of the class.
 */

module.exports = function staticMethods(input) {
    if (!input) return [];
    return Object.getOwnPropertyNames(input).filter(function (name) {
        return name !== "name" && name !== "length" && name !== "prototype" && typeof input[name] === "function";
    });
};