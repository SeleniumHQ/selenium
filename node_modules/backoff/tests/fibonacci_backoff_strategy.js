/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var sinon = require('sinon');

var FibonacciBackoffStrategy = require('../lib/strategy/fibonacci');

exports["FibonacciBackoffStrategy"] = {
    setUp: function(callback) {
        this.strategy = new FibonacciBackoffStrategy({
            initialDelay: 10,
            maxDelay: 1000
        });
        callback();
    },

    "backoff delays should follow a Fibonacci sequence": function(test) {
        // Fibonacci sequence: x[i] = x[i-1] + x[i-2].
        var expectedDelays = [10, 10, 20, 30, 50, 80, 130, 210, 340, 550, 890, 1000];
        var actualDelays = [];

        for (var i = 0; i < expectedDelays.length; i++) {
            actualDelays.push(this.strategy.next());
        }

        test.deepEqual(expectedDelays, actualDelays,
            'Generated delays should follow a Fibonacci sequence.');
        test.done();
    },

    "backoff delays should restart from the initial delay after reset": function(test) {
        var strategy = new FibonacciBackoffStrategy({
            initialDelay: 10,
            maxDelay: 1000
        });

        strategy.next();
        strategy.reset();

        var backoffDelay = strategy.next();
        test.equals(backoffDelay, 10,
            'Strategy should return the initial delay after reset.');
        test.done();
    }
};
