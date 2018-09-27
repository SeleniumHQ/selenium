/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var sinon = require('sinon');

var ExponentialBackoffStrategy = require('../lib/strategy/exponential');

exports["ExponentialBackoffStrategy"] = {

    "backoff delays should follow an exponential sequence": function(test) {
        var strategy = new ExponentialBackoffStrategy({
            initialDelay: 10,
            maxDelay: 1000
        });

        // Exponential sequence: x[i] = x[i-1] * 2.
        var expectedDelays = [10, 20, 40, 80, 160, 320, 640, 1000, 1000];
        var actualDelays = expectedDelays.map(function () {
            return strategy.next();
        });

        test.deepEqual(expectedDelays, actualDelays,
            'Generated delays should follow an exponential sequence.');
        test.done();
    },

    "backoff delay factor should be configurable": function (test) {
        var strategy = new ExponentialBackoffStrategy({
            initialDelay: 10,
            maxDelay: 270,
            factor: 3
        });

        // Exponential sequence: x[i] = x[i-1] * 3.
        var expectedDelays = [10, 30, 90, 270, 270];
        var actualDelays = expectedDelays.map(function () {
            return strategy.next();
        });

        test.deepEqual(expectedDelays, actualDelays,
            'Generated delays should follow a configurable exponential sequence.');
        test.done();
    },

    "backoff delays should restart from the initial delay after reset": function(test) {
        var strategy = new ExponentialBackoffStrategy({
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
