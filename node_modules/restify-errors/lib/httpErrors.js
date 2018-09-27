// Copyright 2012 Mark Cavage, Inc.  All rights reserved.

'use strict';

var http      = require('http');
var util      = require('util');

var _         = require('lodash');

var helpers   = require('./helpers');
var HttpError = require('./baseClasses/HttpError');


// Programatically create 4xx and 5xx HTTP status codes Error classes
// This list includes:
// BadRequestError
// UnauthorizedError
// PaymentRequiredError
// ForbiddenError
// NotFoundError
// MethodNotAllowedError
// NotAcceptableError
// ProxyAuthenticationRequiredError
// RequestTimeoutError
// ConflictError
// GoneError
// LengthRequiredError
// PreconditionFailedError
// RequestEntityTooLargeError
// RequesturiTooLargeError
// UnsupportedMediaTypeError
// RequestedRangeNotSatisfiableError
// ExpectationFailedError
// ImATeapotError
// UnprocessableEntityError
// LockedError
// FailedDependencyError
// UnorderedCollectionError
// UpgradeRequiredError
// PreconditionRequiredError
// TooManyRequestsError
// RequestHeaderFieldsTooLargeError
// InternalServerError
// NotImplementedError
// BadGatewayError
// ServiceUnavailableError
// GatewayTimeoutError
// HttpVersionNotSupportedError
// VariantAlsoNegotiatesError
// InsufficientStorageError
// BandwidthLimitExceededError
// NotExtendedError
// NetworkAuthenticationRequiredError
var httpErrors = _.reduce(http.STATUS_CODES, function(acc, desc, code) {

    var parsedCode = parseInt(code, 10);

    if (parsedCode >= 400) {
        var name = helpers.errNameFromDesc(desc);

        // this is a dynamic constructor for an error message.
        // arguments are variadic. constructor fn name must be anonymous.
        /**
         * Variadic signature, first two are special to Restify, using a
         * options obj.
         * 1) new [Dynamic]Error(anotherErr, {...});
         * 2) new [Dynamic]Error({...});
         * Last one is a straight pass through to WError
         * 3) new [Dynamic]Error('my special error message');
         * @public
         * @class
         */
        acc[name] = function() {
            // call super
            HttpError.apply(this, arguments);
        };
        util.inherits(acc[name], HttpError);

        /**
         * assign non-standard display name property on the CONSTRUCTOR (not
         * prototype), which is supported by all VMs. useful for stack trace
         * output.
         * @type {String}
         */
        acc[name].displayName = name;

        /**
         * the name of the error, used in the stack trace output
         * @type {String}
         */
        acc[name].prototype.name = name;

        /**
         * assign a default status code based on core http module.
         * users can override this if they want to. HttpError constructor
         * will handle overriding at the instance level.
         * @type {Number}
         */
        acc[name].prototype.statusCode = parsedCode;
    }

    return acc;
}, {});



module.exports = httpErrors;

