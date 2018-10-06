// Copyright 2012 Mark Cavage, Inc.  All rights reserved.


// --- Globals

'use strict';

var ID = 0;
var MAX_INT = Math.pow(2, 32) - 1;

var PROBES = {
    // Client probes
    // method, url, headers, id
    'client-request': ['char *', 'char *', 'json', 'int'],

    // id, statusCode, headers
    'client-response': ['int', 'int', 'json'],

    // id, Error.toString()
    'client-error': ['id', 'char *']
};
var PROVIDER;


// --- API

module.exports = (function exportStaticProvider() {
    if (!PROVIDER) {
        try {
            var dtrace = require('dtrace-provider');
            PROVIDER = dtrace.createDTraceProvider('restify');
        } catch (e) {
            PROVIDER = {
                fire: function () {
                },
                enable: function () {
                },
                addProbe: function () {
                    var p = {
                        fire: function () {
                        }
                    };
                    return (p);
                },
                removeProbe: function () {
                },
                disable: function () {
                }
            };
        }

        PROVIDER._rstfy_probes = {};

        Object.keys(PROBES).forEach(function (p) {
            var args = PROBES[p].splice(0);
            args.unshift(p);

            var probe = PROVIDER.addProbe.apply(PROVIDER, args);
            PROVIDER._rstfy_probes[p] = probe;
        });

        PROVIDER.enable();

        PROVIDER.nextId = function nextId() {
            if (++ID >= MAX_INT) {
                ID = 1;
            }

            return (ID);
        };
    }

    return (PROVIDER);
}());
