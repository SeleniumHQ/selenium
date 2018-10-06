// Copyright 2012 Mark Cavage, Inc.  All rights reserved.

'use strict';

// external modules
var _ = require('lodash');

// internal files
var bunyan = require('./helpers/bunyan');
var HttpClient = require('./HttpClient');
var JsonClient = require('./JsonClient');
var StringClient = require('./StringClient');


/**
 * creates an http request client. based on options passed in, will create one
 * of three existing clients: Http, String, or Json.
 * @public
 * @function createClient
 * @param    {Object} options      an options object
 * @param    {String} options.type 'http' | 'json' | 'string'
 * @returns  {HttpClient | JsonClient | StringClient}
 */
function createClient(options) {

    var client;
    var opts = normalizeOptions(options);

    opts.agent = options.agent;
    opts.name = opts.name || 'restify';
    opts.type = opts.type || 'application/octet-stream';
    opts.log = opts.log || bunyan.createLogger(opts.name);

    switch (opts.type) {
        case 'json':
            client = new JsonClient(opts);
            break;

        case 'string':
            client = new StringClient(opts);
            break;

        case 'http':
        default:
            client = new HttpClient(opts);
            break;
    }

    return client;
}


/**
 * creates a json httpclient.
 * @public
 * @function createJsonClient
 * @param    {Object}     options an options object
 * @returns  {JsonClient}         a json client
 */
function createJsonClient(options) {
    var opts = normalizeOptions(options);
    opts.type = 'json';
    return createClient(opts);
}


/**
 * creates a string httpclient.
 * @public
 * @function createStringClient
 * @param    {Object}       options an options object
 * @returns  {StringClient}         a string client
 */
function createStringClient(options) {
    var opts = normalizeOptions(options);
    opts.type = 'string';
    return createClient(opts);
}


/**
 * creates a regular httpclient.
 * @public
 * @function createHttpClient
 * @param    {Object}     options an options object
 * @returns  {HttpClient}         an http client
 */
function createHttpClient(options) {
    var opts = normalizeOptions(options);
    opts.type = 'http';
    return createClient(opts);
}



/**
 * normalize options. if options is a string, treat it as a url. otherwise
 * clone it and return a new copy.
 * @private
 * @function normalizeOptions
 * @param   {Object | String} options a url string or options object
 * @returns {Object}
 */
function normalizeOptions(options) {

    var opts = {};

    if (typeof options === 'string') {
        opts = {
            url: options
        };
    } else if (_.isPlainObject(options)) {
        opts = _.clone(options);
    }

    return opts;
}


// --- Exports

module.exports = {
    // Client API
    createClient: createClient,
    createJsonClient: createJsonClient,
    createJSONClient: createJsonClient,
    createStringClient: createStringClient,
    createHttpClient: createHttpClient,
    get HttpClient() {
        return HttpClient;
    },
    get JsonClient() {
        return JsonClient;
    },
    get StringClient() {
        return StringClient;
    },

    bunyan: {
        serializers: bunyan.serializers
    }
};
