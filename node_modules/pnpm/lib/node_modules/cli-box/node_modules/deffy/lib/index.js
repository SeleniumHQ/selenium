// Dependencies
var Typpy = require("typpy");

/**
 * Deffy
 * Computes a final value by providing the input and default values.
 *
 * @name Deffy
 * @function
 * @param {Anything} input The input value.
 * @param {Anything|Function} def The default value or a function getting the
 * input value as first argument.
 * @param {Object|Boolean} options The `empty` value or an object containing
 * the following fields:
 *
 *  - `empty` (Boolean): Handles the input value as empty field (`input || default`). Default is `false`.
 *
 * @return {Anything} The computed value.
 */
function Deffy(input, def, options) {

    // Default is a function
    if (typeof def === "function") {
        return def(input);
    }

    options = Typpy(options) === "boolean" ? {
        empty: options
    } : {
        empty: false
    };

    // Handle empty
    if (options.empty) {
        return input || def;
    }

    // Return input
    if (Typpy(input) === Typpy(def)) {
        return input;
    }

    // Return the default
    return def;
}

module.exports = Deffy;
