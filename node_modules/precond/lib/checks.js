/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var util = require('util');

var errors = module.exports = require('./errors');

function failCheck(ExceptionConstructor, callee, messageFormat, formatArgs) {
    messageFormat = messageFormat || '';
    var message = util.format.apply(this, [messageFormat].concat(formatArgs));
    var error = new ExceptionConstructor(message);
    Error.captureStackTrace(error, callee);
    throw error;
}

function failArgumentCheck(callee, message, formatArgs) {
    failCheck(errors.IllegalArgumentError, callee, message, formatArgs);
}

function failStateCheck(callee, message, formatArgs) {
    failCheck(errors.IllegalStateError, callee, message, formatArgs);
}

module.exports.checkArgument = function(value, message) {
    if (!value) {
        failArgumentCheck(arguments.callee, message,
            Array.prototype.slice.call(arguments, 2));
    }
};

module.exports.checkState = function(value, message) {
    if (!value) {
        failStateCheck(arguments.callee, message,
            Array.prototype.slice.call(arguments, 2));
    }
};

module.exports.checkIsDef = function(value, message) {
    if (value !== undefined) {
        return value;
    }

    failArgumentCheck(arguments.callee, message ||
        'Expected value to be defined but was undefined.',
        Array.prototype.slice.call(arguments, 2));
};

module.exports.checkIsDefAndNotNull = function(value, message) {
    // Note that undefined == null.
    if (value != null) {
        return value;
    }

    failArgumentCheck(arguments.callee, message ||
        'Expected value to be defined and not null but got "' +
        typeOf(value) + '".', Array.prototype.slice.call(arguments, 2));
};

// Fixed version of the typeOf operator which returns 'null' for null values
// and 'array' for arrays.
function typeOf(value) {
    var s = typeof value;
    if (s == 'object') {
        if (!value) {
            return 'null';
        } else if (value instanceof Array) {
            return 'array';
        }
    }
    return s;
}

function typeCheck(expect) {
    return function(value, message) {
        var type = typeOf(value);

        if (type == expect) {
            return value;
        }

        failArgumentCheck(arguments.callee, message ||
            'Expected "' + expect + '" but got "' + type + '".',
            Array.prototype.slice.call(arguments, 2));
    };
}

module.exports.checkIsString = typeCheck('string');
module.exports.checkIsArray = typeCheck('array');
module.exports.checkIsNumber = typeCheck('number');
module.exports.checkIsBoolean = typeCheck('boolean');
module.exports.checkIsFunction = typeCheck('function');
module.exports.checkIsObject = typeCheck('object');
