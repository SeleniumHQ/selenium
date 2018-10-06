"use strict";

var noop = require("noop6");

/**
 * customReturn
 * Generate a function that returns a constant.
 *
 * @name customReturn
 * @function
 * @param {Anything} value The value to return.
 * @return {Function} A function that returns the specified value.
 */
module.exports = function customReturn(value) {
    if (value === undefined) {
        return noop;
    }
    return function () {
        return value;
    };
};