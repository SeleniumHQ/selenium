'use strict';

var http   = require('http');

var _      = require('lodash');
var assert = require('assert-plus');



//------------------------------------------------------------------------------
// constructor arg parsers
//------------------------------------------------------------------------------

/**
 * helper function for parsing all of the Error constructor variadic sigs.
 * First two are special to Restify, using a options obj.
 * 1) new HttpError(anotherErr, {...});
 * 2) new HttpError({...});
 * Last two are straight pass through to WError
 * 3) new HttpError('my special error message');
 * 4) new HttpError(anotherErr, '', '');
 * @public
 * @function parseVariadicArgs
 * @param    {Object}  ctorArgs    the passed in arguments object to error
 * constructor
 * @param    {Boolean} werrorSuper if the super being invoked is going to
 * WError
 * @returns  {Object}
 */
function parseVariadicArgs(ctorArgs, werrorSuper) {

    function parse() {

        // to array the inner arguments
        var args = _.toArray(arguments);
        var options = null;

        // 1)
        if (arguments[0] instanceof Error) {
            // 1)
            if (_.isPlainObject(arguments[1])) {
                options = arguments[1] || {};

                // if we're calling WError super, don't pass in the special
                // restify options object.
                if (werrorSuper === true) {
                    args = [arguments[0]];
                }
            }
            // 4)
            // otherwise, pass through to WError
        }
        // 2)
        else if (_.isPlainObject(arguments[0])) {
            options = arguments[0] || {};

            // if we're calling WError super, don't pass in the special restify
            // options object. pass all subsequent args, which could include
            // extsprintf style strings.
            if (werrorSuper === true) {
                args = _.rest(args);
            }

            // if we have an options object, assert them.
            assert.optionalObject(options, 'options');
            assert.optionalString(options.message, 'options.message');
            assert.optionalNumber(options.statusCode, 'options.statusCode');
        }
        // 3
        // otherwise, pass through to WError

        return {
            args: args,
            options: options
        };
    }

    // call constructor args.
    return parse.apply(null, ctorArgs);
}


//------------------------------------------------------------------------------
// helpers
//------------------------------------------------------------------------------


/**
 * create an error name from a status code. looks up the description via
 * http.STATUS_CODES, then calls createErrNameFromDesc().
 * @private
 * @function errNameFromCode
 * @param    {Number} code an http status code
 * @returns  {String}
 */
function errNameFromCode(code) {

    assert.number(code, 'code');

    // attempt to retrieve status code description, if not available,
    // fallback on 500.
    var errorDesc = http.STATUS_CODES[code] || http.STATUS_CODES[500];
    return errNameFromDesc(errorDesc);
}


/**
 * used to programatically create http error code names, using the underlying
 * status codes names exposed via the http module.
 * @private
 * @function errNameFromDesc
 * @param    {String}  desc a description of the error, e.g., 'Not Found'
 * @returns  {String}
 */
function errNameFromDesc(desc) {

    assert.string(desc, 'desc');

    // takes an error description, split on spaces, camel case it correctly,
    // then append 'Error' at the end of it.
    // e.g., the passed in description is 'Internal Server Error'
    //       the output is 'InternalServerError'
    var pieces = desc.split(/\s+/);
    var name = _.reduce(pieces, function(acc, piece) {
        // lowercase all, then capitalize it.
        var normalizedPiece = _.capitalize(piece.toLowerCase());
        return acc + normalizedPiece;
    }, '');

    // strip all non word characters
    name = name.replace(/\W+/g, '');

    // append 'Error' at the end of it only if it doesn't already end with it.
    if (!_.endsWith(name, 'Error')) {
        name += 'Error';
    }

    return name;
}




module.exports.errNameFromCode = errNameFromCode;
module.exports.errNameFromDesc = errNameFromDesc;
module.exports.parseVariadicArgs = parseVariadicArgs;

