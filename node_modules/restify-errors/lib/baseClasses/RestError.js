'use strict';

var util      = require('util');

var HttpError = require('./HttpError');
var helpers   = require('./../helpers');


/**
 * Base RestError class. inherits from WError.
 * Variadic signature, first two are special to Restify, using a options obj.
 * 1) new RestError(anotherErr, {...});
 * 2) new RestError({...});
 * Last one is a straight pass through to WError
 * 3) new RestError('my special error message');
 * @public
 * @class
 */
function RestError() {

    var self = this;
    var parsed = helpers.parseVariadicArgs(arguments);
    var args = parsed.args;
    var options = parsed.options || {};

    // call super
    HttpError.apply(this, args);

    /**
     * a bit of a misnomer, not really an http code, but rather the name
     * of the error. the equivalent of HttpCode's `code` property.
     * TODO: Not sure why the default here is 'Error' and not 'RestError'?
     * only set the value if it doesnt already exist, as it's defined on the
     * prototype for subclasses.
     * @property
     * @type {String}
     */
    self.restCode = options.restCode || self.restCode;

    /**
     * an object used to render the error when passed
     * to res.send()
     * @property
     * @type {Object}
     */
    self.body = {
        // this is a bit unintuitive, but code actually refers to the name
        // of the error, and not the http statusCode.
        code: self.restCode,
        message: self.message || ''
    };
}
util.inherits(RestError, HttpError);

/**
 * assign non-standard display name property on the CONSTRUCTOR (not prototype),
 * which is supported by all VMs. useful for stack trace output.
 * @type {String}
 */
RestError.displayName = 'RestError';

/**
 * the name of the error, used in the stack trace output
 * @type {String}
 */
RestError.prototype.name = 'RestError';

/**
 * the default rest code. i.e., a BadDigestError has a restCode of 'BadDigest'.
 * @type {String}
 */
RestError.prototype.restCode = 'Error';


module.exports = RestError;

