'use strict';

var util    = require('util');

var WError  = require('verror').WError;

var helpers = require('./../helpers');

/**
 * Base HttpError class. inherits from WError.
 * Variadic signature, first two are special to Restify, using a options obj.
 * 1) new HttpError(anotherErr, {...});
 * 2) new HttpError({...});
 * Last one is a straight pass through to WError
 * 3) new HttpError('my special error message');
 * @public
 * @class
 */
function HttpError() {

    var self = this;

    // normalize the signatures
    var parsed = helpers.parseVariadicArgs(arguments, true);
    var args = parsed.args;
    var options = parsed.options || {};

    // inherit from WError, call super first before doing anything else!  WError
    // will handle calling captureStackTrace, using arguments.callee to
    // eliminate unnecessary stack frames.
    WError.apply(self, args);

    /**
     * the error message.
     * since constructor can be invoked with both options.message, as well as
     * printf style messages, prefer the printf style messages that are already
     * set by WError constructor. Since we've already invoked WError constructor
     * at this point, only use options.message value if message is not yet
     * defined. in short, prefer printf messages over options.message when both
     * are passed in.
     * @property
     * @type     {String}
     */
    if (!self.message) {
        self.message = (options.message || self.message) || '';
    }

    /**
     * the http status code of the error.
     * because inherited classes have status code set on the prototype,
     * only assign a status code if truthy.
     * @property
     * @type     {Number}
     */
    if (options.statusCode) {
        self.statusCode = options.statusCode;
    }

    /**
     * an object used to render the error when passed
     * to res.send()
     * @property
     * @type     {Object}
     */
    self.body = {
        // this is a bit unintuitive, but code actually refers to the name
        // of the error, and not the http statusCode.
        code: self.name,
        message: self.message || ''
    };
}
util.inherits(HttpError, WError);

/**
 * assign non-standard display name property on the CONSTRUCTOR (not prototype),
 * which is supported by all VMs. useful for stack trace output.
 * @type {String}
 */
HttpError.displayName = 'HttpError';

/**
 * the name of the error, used in the stack trace output
 * @type {String}
 */
HttpError.prototype.name = 'HttpError';


module.exports = HttpError;

