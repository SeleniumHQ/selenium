// Copyright 2012 Mark Cavage, Inc.  All rights reserved.

'use strict';

var Stream = require('stream').Stream;
var util = require('util');

var assert = require('assert-plus');
var bunyan = require('bunyan');
var lru = require('lru-cache');
var uuid = require('uuid');


// --- Globals

var sprintf = util.format;
var DEFAULT_REQ_ID = uuid.v4();
var STR_FMT = '[object %s<level=%d, limit=%d, maxRequestIds=%d>]';


// --- Helpers

/**
 * appends streams
 * @private
 * @function appendStream
 * @param    {Stream}    streams the stream to append to
 * @param    {Stream}    s       the stream to append
 * @returns  {undefined}
 */
function appendStream(streams, s) {
    assert.arrayOfObject(streams, 'streams');
    assert.object(s, 'stream');

    if (s instanceof Stream) {
        streams.push({
            raw: false,
            stream: s
        });
    } else {
        assert.optionalBool(s.raw, 'stream.raw');
        assert.object(s.stream, 'stream.stream');
        streams.push(s);
    }
}


// --- API

/**
 * A Bunyan stream to capture records in a ring buffer and only pass through
 * on a higher-level record. E.g. buffer up all records but only dump when
 * getting a WARN or above.
 * @public
 * @class
 * @param {Object} opts                contains the parameters:
 * @param {Object} opts.stream         The stream to which to write when
 * dumping captured records. One of `stream` or `streams` must be specified.
 * @param {Array} opts.streams         One of `stream` or `streams` must be
 * specified.
 * @param {Number | String} opts.level The level at which to trigger dumping
 * captured records. Defaults to bunyan.WARN.
 * @param {Number} opts.maxRecords     Number of records to capture. Default
 * 100.
 * @param {Number} opts.maxRequestIds  Number of simultaneous request id
 * capturing buckets to maintain. Default 1000.
 * @param {Boolean} opts.dumpDefault   If true, then dump captured records on
 * the *default* request id when dumping. I.e. dump records logged without
 * "reqId" field. Default false.
 */
function RequestCaptureStream(opts) {
    assert.object(opts, 'options');
    assert.optionalObject(opts.stream, 'options.stream');
    assert.optionalArrayOfObject(opts.streams, 'options.streams');
    assert.optionalNumber(opts.level, 'options.level');
    assert.optionalNumber(opts.maxRecords, 'options.maxRecords');
    assert.optionalNumber(opts.maxRequestIds, 'options.maxRequestIds');
    assert.optionalBool(opts.dumpDefault, 'options.dumpDefault');

    var self = this;
    Stream.call(this);

    this.level = opts.level ? bunyan.resolveLevel(opts.level) : bunyan.WARN;
    this.limit = opts.maxRecords || 100;
    this.maxRequestIds = opts.maxRequestIds || 1000;
    this.requestMap = lru({
        max: self.maxRequestIds
    });
    this.dumpDefault = opts.dumpDefault;

    this._offset = -1;
    this._rings = [];

    this.streams = [];

    if (opts.stream) {
        appendStream(this.streams, opts.stream);
    }

    if (opts.streams) {
        opts.streams.forEach(appendStream.bind(null, this.streams));
    }

    this.haveNonRawStreams = false;

    for (var i = 0; i < this.streams.length; i++) {
        if (!this.streams[i].raw) {
            this.haveNonRawStreams = true;
            break;
        }
    }
}
util.inherits(RequestCaptureStream, Stream);


/**
 * write to the stream
 * @public
 * @function write
 * @param    {Object}    record a bunyan log record
 * @returns  {undefined}
 */
RequestCaptureStream.prototype.write = function write(record) {
    var reqId = record.reqId || DEFAULT_REQ_ID;
    var ring;
    var self = this;

    if (!(ring = this.requestMap.get(reqId))) {
        if (++this._offset > this.maxRequestIds) {
            this._offset = 0;
        }

        if (this._rings.length <= this._offset) {
            this._rings.push(new bunyan.RingBuffer({
                limit: self.limit
            }));
        }

        ring = this._rings[this._offset];
        ring.records.length = 0;
        this.requestMap.set(reqId, ring);
    }

    assert.ok(ring, 'no ring found');

    if (record.level >= this.level) {
        var i, r, ser;

        for (i = 0; i < ring.records.length; i++) {
            r = ring.records[i];

            if (this.haveNonRawStreams) {
                ser = JSON.stringify(r,
                    bunyan.safeCycles()) + '\n';
            }
            /* eslint-disable no-loop-func */
            self.streams.forEach(function (s) {
                s.stream.write(s.raw ? r : ser);
            });
            /* eslint-enable no-loop-func */
        }
        ring.records.length = 0;

        if (this.dumpDefault) {
            var defaultRing = self.requestMap.get(DEFAULT_REQ_ID);

            for (i = 0; i < defaultRing.records.length; i++) {
                r = defaultRing.records[i];

                if (this.haveNonRawStreams) {
                    ser = JSON.stringify(r,
                        bunyan.safeCycles()) + '\n';
                }
                /* eslint-disable no-loop-func */
                self.streams.forEach(function (s) {
                    s.stream.write(s.raw ? r : ser);
                });
                /* eslint-enable no-loop-func */
            }
            defaultRing.records.length = 0;
        }
    } else {
        ring.write(record);
    }
};


/**
 * toString() serialization
 * @public
 * @function toString
 * @returns  {String}
 */
RequestCaptureStream.prototype.toString = function toString() {
    return (sprintf(STR_FMT,
        this.constructor.name,
        this.level,
        this.limit,
        this.maxRequestIds));
};


// --- Serializers

/*
 * Note: `req` and `res` aren't relevant for restify*-clients* but remain for
 * backward compatibility.
 */
var SERIALIZERS = {
    err: bunyan.stdSerializers.err,
    req: bunyan.stdSerializers.req,
    res: bunyan.stdSerializers.res,
    client_req: clientReq,
    client_res: clientRes
};


/**
 * a request serializer. returns a stripped down object for logging.
 * @private
 * @function clientReq
 * @param    {Object} req the request object
 * @returns  {Object}
 */
function clientReq(req) {
    if (!req) {
        return (req);
    }

    var host;

    try {
        host = req.host.split(':')[0];
    } catch (e) {
        host = false;
    }

    return ({
        method: req ? req.method : false,
        url: req ? req.path : false,
        address: host,
        port: req ? req.port : false,
        headers: req ? req.headers : false
    });
}


/**
 * a response serializer. returns a stripped down object for logging.
 * @private
 * @function clientRes
 * @param    {Object} res the response object
 * @returns  {Object}
 */
function clientRes(res) {
    if (!res || !res.statusCode) {
        return (res);
    }

    return ({
        statusCode: res.statusCode,
        headers: res.headers
    });
}


/*
 * Return the given logger, or a child of it, such that it has the required
 * log serializers.
 *
 * This package logs with some fields for which there should be a serializer
 * on the logger: `SERIALIZERS`.
 *
 * @public
 * @function ensureSerializers
 * @param    {Object}   log
 * @returns  {Object}       the given log, or a child of it with the required
 *                          serializers
 */
function ensureSerializers(log) {
    assert.object(log, 'log');

    if (!log.serializers) {
        return log.child({serializers: SERIALIZERS});
    }

    var haveMissingSerializers = false;
    var missingSerializers = {};
    Object.keys(SERIALIZERS).forEach(function (name) {
        if (!log.serializers[name]) {
            haveMissingSerializers = true;
            missingSerializers[name] = SERIALIZERS[name];
        }
    });

    if (haveMissingSerializers) {
        return log.child({serializers: missingSerializers});
    } else {
        return log;
    }
}


/**
 * create a bunyan logger
 * @public
 * @function createLogger
 * @param    {String}     name of the logger
 * @returns  {Object}          bunyan logger
 */
function createLogger(name) {
    return (bunyan.createLogger({
        name: name,
        serializers: SERIALIZERS,
        streams: [
            {
                level: 'warn',
                stream: process.stderr
            },
            {
                level: 'debug',
                type: 'raw',
                stream: new RequestCaptureStream({
                    stream: process.stderr
                })
            }
        ]
    }));
}



// --- Exports

module.exports = {
    RequestCaptureStream: RequestCaptureStream,
    serializers: SERIALIZERS,
    ensureSerializers: ensureSerializers,
    createLogger: createLogger
};
