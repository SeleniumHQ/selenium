/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2015, Joyent, Inc.
 */

/*
 * Error classes that docker-registry-client may produce... these
 * plus restify RestError error classes. There isn't a merged
 * base class for all of these currently.
 *
 * TODO: move all usages in this package to these error classes
 * TODO: document and possibly rationalize these separate error trees
 *
 * # Error Hierarchy
 *
 *  verror.VError
 *      restify.HttpError
 *          restify.RestError
 *
 *          # The subset of core restify errors that are used.
 *          restify.BadDigestError
 *          restify.InvalidContentError
 *          ...
 *
 *      # Custom error classes for this package
 *      _DockerRegistryClientBaseError
 *          ManifestVerificationError
 *          ...
 */

var util = require('util'),
    format = util.format;
var assert = require('assert-plus');
var verror = require('verror'),
    VError = verror.VError;



// ---- error classes

/**
 * Base class for custom error classes. This shouldn't be exported,
 * because all usages should be of one of the subclasses.
 *
 * This tries to have a nice Bunyan-y call signature. (Note: I find the
 * strict sprintf handling of varargs to `VError` to be harsh and
 * sometimes surprising, so I avoid that here.)
 *
 *      new MyError('my message');
 *      new MyError(cause, 'my message');
 *      new MyError({err: cause, otherField: 42}, 'my message');
 *      new MyError({otherField: 42}, 'my message');
 *      new MyError('my message with %d formats', arg1, arg2, ...);
 *
 * This also asserts that the error class prototype has a string `code`
 * that is set on the error instance.
 */
function _DockerRegistryClientBaseError() {
    var ctor = this.constructor;
    assert.string(ctor.prototype.code, ctor.name + '.prototype.code');

    /*
     * In versions of node since (I think) 0.10, `Error.toString()` does
     * not use `this.constructor.name`. Therefore to get that error subclass
     * name in printed errors and error.stack, we need to set `prototype.name`.
     */
    if (!ctor.prototype.hasOwnProperty('name')) {
        ctor.prototype.name = ctor.name;
    }

    var vargs = [];
    var fields;
    var msgArgs;
    if (arguments[0] instanceof Error) {
        // `new <Error>(<err>, ...)`
        vargs.push(arguments[0]); // cause
        if (arguments.length === 1) {
            msgArgs = ['error'];
        } else {
            msgArgs = Array.prototype.slice.call(arguments, 1);
        }
    } else if (typeof (arguments[0]) !== 'object' && arguments[0] !== null ||
            Array.isArray(arguments[0])) {
        // `new <Error>(msg, ...)`
        fields = null;
        msgArgs = Array.prototype.slice.call(arguments);
    } else if (Buffer.isBuffer(arguments[0])) {
        // `new <Error>(buf, ...)`
        // Almost certainly an error, show `inspect(buf)`. See bunyan#35.
        fields = null;
        msgArgs = Array.prototype.slice.call(arguments);
        msgArgs[0] = util.inspect(msgArgs[0]);
    } else {
        // `new <Error>(fields, msg, ...)`
        fields = arguments[0];
        if (fields.err) {
            vargs.push(fields.err); // cause
            delete fields.err;
        }
        msgArgs = Array.prototype.slice.call(arguments, 1);
    }

    // HACK: Workaround silly printf-handling in verror s.t. a message with
    // content that looks like a printf code breaks its rendering.
    vargs.push('%s');
    vargs.push(format.apply(null, msgArgs));
    VError.apply(this, vargs);

    if (fields) {
        var self = this;
        Object.keys(fields).forEach(function (name) {
            self[name] = fields[name];
        });
    }

}
util.inherits(_DockerRegistryClientBaseError, VError);


function InternalError() {
    _DockerRegistryClientBaseError.apply(this, arguments);
}
util.inherits(InternalError, _DockerRegistryClientBaseError);
InternalError.prototype.code = 'InternalError';


function ManifestVerificationError() {
    _DockerRegistryClientBaseError.apply(this, arguments);
}
util.inherits(ManifestVerificationError, _DockerRegistryClientBaseError);
ManifestVerificationError.prototype.code = 'ManifestVerificationError';


function InvalidManifestError() {
    _DockerRegistryClientBaseError.apply(this, arguments);
}
util.inherits(InvalidManifestError, _DockerRegistryClientBaseError);
InvalidManifestError.prototype.code = 'InvalidManifestError';


function DownloadError() {
    _DockerRegistryClientBaseError.apply(this, arguments);
}
util.inherits(DownloadError, _DockerRegistryClientBaseError);
DownloadError.prototype.code = 'DownloadError';


function UploadError() {
    _DockerRegistryClientBaseError.apply(this, arguments);
}
util.inherits(UploadError, _DockerRegistryClientBaseError);
UploadError.prototype.code = 'UploadError';


function UnauthorizedError() {
    _DockerRegistryClientBaseError.apply(this, arguments);
}
util.inherits(UnauthorizedError, _DockerRegistryClientBaseError);
UnauthorizedError.prototype.code = 'UnauthorizedError';
UnauthorizedError.prototype.statusCode = 401;


function TooManyRedirectsError() {
    _DockerRegistryClientBaseError.apply(this, arguments);
}
util.inherits(TooManyRedirectsError, _DockerRegistryClientBaseError);
TooManyRedirectsError.prototype.code = 'TooManyRedirectsError';


// ---- exports

module.exports = {
    InternalError: InternalError,
    ManifestVerificationError: ManifestVerificationError,
    DownloadError: DownloadError,
    UploadError: UploadError,
    InvalidManifestError: InvalidManifestError,
    UnauthorizedError: UnauthorizedError,
    TooManyRedirectsError: TooManyRedirectsError
};
// vim: set softtabstop=4 shiftwidth=4:
