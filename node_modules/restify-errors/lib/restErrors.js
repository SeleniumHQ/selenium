// Copyright 2012 Mark Cavage, Inc.  All rights reserved.

'use strict';

var util      = require('util');

var _         = require('lodash');

var RestError = require('./baseClasses/RestError');


//------------------------------------------------------------------------------
// local global vars
//------------------------------------------------------------------------------

var CODES = {
    BadDigest: 400,
    BadMethod: 405,
    ConnectTimeout: 408,
    Internal: 500,
    InvalidArgument: 409,
    InvalidContent: 400,
    InvalidCredentials: 401,
    InvalidHeader: 400,
    InvalidVersion: 400,
    MissingParameter: 409,
    NotAuthorized: 403,
    PreconditionFailed: 412,
    RequestExpired: 400,
    RequestThrottled: 429,
    ResourceNotFound: 404,
    WrongAccept: 406
};




var restErrors = _.reduce(CODES, function(acc, statusCode, errorCode) {


    // append Error to the end of the name if it doesn't already end with it.
    // this becomes the name of the constructor
    var name = errorCode + 'Error';

    // this is a dynamic constructor for an error message.
    // arguments are variadic. constructor fn name must be anonymous.
    /**
     * Variadic signature, first two are special to Restify, using a options
     * obj.
     * 1) new [Dynamic]Error(anotherErr, {...});
     * 2) new [Dynamic]Error({...});
     * Last one is a straight pass through to WError
     * 3) new [Dynamic]Error('my special error message');
     * @public
     * @class
     */
    acc[name] = function() {
        // call super
        RestError.apply(this, arguments);
    };
    util.inherits(acc[name], RestError);

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
    acc[name].prototype.statusCode = statusCode;

    /**
     * the default rest code. i.e., a BadDigestError has a restCode of
     * 'BadDigest'.  it is basically the key for the lookup in the CODES
     * mapping at the top of the file.
     * @type {String}
     */
    acc[name].prototype.restCode = errorCode;


    return acc;
}, {});


module.exports = restErrors;

