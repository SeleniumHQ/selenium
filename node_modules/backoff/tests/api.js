/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var sinon = require('sinon');

var backoff = require('../index');

exports["API"] = {
    "backoff.fibonnaci should be a function that returns a backoff instance": function(test) {
        test.ok(backoff.fibonacci, 'backoff.fibonacci should be defined.');
        test.equal(typeof backoff.fibonacci, 'function',
            'backoff.fibonacci should be a function.');
        test.equal(backoff.fibonacci().constructor.name, 'Backoff');
        test.done();
    },

    "backoff.exponential should be a function that returns a backoff instance": function(test) {
        test.ok(backoff.exponential, 'backoff.exponential should be defined.');
        test.equal(typeof backoff.exponential, 'function',
            'backoff.exponential should be a function.');
        test.equal(backoff.exponential().constructor.name, 'Backoff');
        test.done();
    },

    "backoff.call should be a function that returns a FunctionCall instance": function(test) {
        var fn = function() {};
        var callback = function() {};
        test.ok(backoff.Backoff, 'backoff.call should be defined.');
        test.equal(typeof backoff.call, 'function',
            'backoff.call should be a function.');
        test.equal(backoff.call(fn, 1, 2, 3, callback).constructor.name,
            'FunctionCall');
        test.done();
    },

    "backoff.Backoff should be defined and a function": function(test) {
        test.ok(backoff.Backoff, 'backoff.Backoff should be defined.');
        test.equal(typeof backoff.Backoff, 'function',
            'backoff.Backoff should be a function.');
        test.done();
    },

    "backoff.FunctionCall should be defined and a function": function(test) {
        test.ok(backoff.FunctionCall,
            'backoff.FunctionCall should be defined.');
        test.equal(typeof backoff.FunctionCall, 'function',
            'backoff.FunctionCall should be a function.');
        test.done();
    },

    "backoff.FibonacciStrategy should be defined and a function": function(test) {
        test.ok(backoff.FibonacciStrategy,
            'backoff.FibonacciStrategy should be defined.');
        test.equal(typeof backoff.FibonacciStrategy, 'function',
            'backoff.FibonacciStrategy should be a function.');
        test.done();
    },

    "backoff.ExponentialStrategy should be defined and a function": function(test) {
        test.ok(backoff.ExponentialStrategy,
            'backoff.ExponentialStrategy should be defined.');
        test.equal(typeof backoff.ExponentialStrategy, 'function',
            'backoff.ExponentialStrategy should be a function.');
        test.done();
    }
};
