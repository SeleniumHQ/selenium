/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var sinon = require('sinon');
var util = require('util');

var BackoffStrategy = require('../lib/strategy/strategy');

function SampleBackoffStrategy(options) {
    BackoffStrategy.call(this, options);
}
util.inherits(SampleBackoffStrategy, BackoffStrategy);

SampleBackoffStrategy.prototype.next_ = function() {
    return this.getInitialDelay();
};

SampleBackoffStrategy.prototype.reset_ = function() {};

exports["BackoffStrategy"] = {
    setUp: function(callback) {
        this.random = sinon.stub(Math, 'random');
        callback();
    },

    tearDown: function(callback) {
        this.random.restore();
        callback();
    },

    "the randomisation factor should be between 0 and 1": function(test) {
        test.throws(function() {
            new BackoffStrategy({
                randomisationFactor: -0.1
            });
        });

        test.throws(function() {
            new BackoffStrategy({
                randomisationFactor: 1.1
            });
        });

        test.doesNotThrow(function() {
            new BackoffStrategy({
                randomisationFactor: 0.5
            });
        });

        test.done();
    },

    "the raw delay should be randomized based on the randomisation factor": function(test) {
        var strategy = new SampleBackoffStrategy({
            randomisationFactor: 0.5,
            initialDelay: 1000
        });
        this.random.returns(0.5);

        var backoffDelay = strategy.next();

        test.equals(backoffDelay, 1000 + (1000 * 0.5 * 0.5));
        test.done();
    },

    "the initial backoff delay should be greater than 0": function(test) {
        test.throws(function() {
            new BackoffStrategy({
                initialDelay: -1
            });
        });

        test.throws(function() {
            new BackoffStrategy({
                initialDelay: 0
            });
        });

        test.doesNotThrow(function() {
            new BackoffStrategy({
                initialDelay: 1
            });
        });

        test.done();
    },

    "the maximal backoff delay should be greater than 0": function(test) {
        test.throws(function() {
            new BackoffStrategy({
                maxDelay: -1
            });
        });

        test.throws(function() {
            new BackoffStrategy({
                maxDelay: 0
            });
        });

        test.done();
    },

    "the maximal backoff delay should be greater than the initial backoff delay": function(test) {
        test.throws(function() {
            new BackoffStrategy({
                initialDelay: 10,
                maxDelay: 10
            });
        });

        test.doesNotThrow(function() {
            new BackoffStrategy({
                initialDelay: 10,
                maxDelay: 11
            });
        });

        test.done();
    }
};
