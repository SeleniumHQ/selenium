// Copyright 2012 Mark Cavage, Inc.  All rights reserved.

'use strict';

var util = require('util');

var assert = require('assert-plus');
var restifyErrors = require('restify-errors');
var safeStringify = require('fast-safe-stringify');

var makeErrFromCode = restifyErrors.makeErrFromCode;
var RestError = restifyErrors.RestError;
var StringClient = require('./StringClient');


// --- API

function JsonClient(options) {
    assert.object(options, 'options');
    assert.optionalBool(options.safeStringify, 'options.safeStringify');

    options.accept = 'application/json';
    options.name = options.name || 'JsonClient';
    options.contentType = 'application/json';

    StringClient.call(this, options);

    this._super = StringClient.prototype;

    this._safeStringify = options.safeStringify || false;
}
util.inherits(JsonClient, StringClient);

module.exports = JsonClient;


JsonClient.prototype.write = function write(options, body, callback) {
    var self = this;

    var bodyOrDefault = (body !== null ? body : {});
    assert.object(bodyOrDefault, 'body');

    var resBody;
    // safely stringify body if client was configured thusly
    if (self._safeStringify) {
        resBody = safeStringify(bodyOrDefault);
    } else {
        resBody = JSON.stringify(bodyOrDefault);
    }
    return (this._super.write.call(this, options, resBody, callback));
};


JsonClient.prototype.parse = function parse(req, callback) {
    var log = this.log;

    function parseResponse(err, req2, res, data) {
        var obj;
        var resErr = err;

        try {
            if (data && !/^\s*$/.test(data)) {
                obj = JSON.parse(data);
            }
        } catch (e) {
            // Not really sure what else we can do here, besides
            // make the client just keep going.
            log.trace(e, 'Invalid JSON in response');
        }
        obj = obj || {};

        if (res && res.statusCode >= 400) {
            // Upcast error to a RestError (if we can)
            // Be nice and handle errors like
            // { error: { code: '', message: '' } }
            // in addition to { code: '', message: '' }.
            if (obj.code || (obj.error && obj.error.code)) {
                var _c = obj.code ||
                    (obj.error ? obj.error.code : '') ||
                    '';
                var _m = obj.message ||
                    (obj.error ? obj.error.message : '') ||
                    '';

                resErr = new RestError({
                    message: _m,
                    restCode: _c,
                    statusCode: res.statusCode
                });
                resErr.name = resErr.restCode;

                if (!/Error$/.test(resErr.name)) {
                    resErr.name += 'Error';
                }
            } else if (!resErr) {
                resErr = makeErrFromCode(res.statusCode,
                    obj.message || '', data);
            }
        }

        if (resErr) {
            resErr.body = obj;
        }

        callback((resErr || null), req2, res, obj);
    }

    return (this._super.parse.call(this, req, parseResponse));
};
