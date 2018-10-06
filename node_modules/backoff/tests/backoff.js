/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var sinon = require('sinon');

var Backoff = require('../lib/backoff');
var BackoffStrategy = require('../lib/strategy/strategy');

exports["Backoff"] = {
    setUp: function(callback) {
        this.backoffStrategy = sinon.stub(new BackoffStrategy());
        this.backoff = new Backoff(this.backoffStrategy);
        this.clock = sinon.useFakeTimers();
        this.spy = new sinon.spy();
        callback();
    },

    tearDown: function(callback) {
        this.clock.restore();
        callback();
    },

    "the backoff event should be emitted when backoff starts": function(test) {
        this.backoffStrategy.next.returns(10);
        this.backoff.on('backoff', this.spy);

        this.backoff.backoff();

        test.ok(this.spy.calledOnce,
            'Backoff event should be emitted when backoff starts.');
        test.done();
    },

    "the ready event should be emitted on backoff completion": function(test) {
        this.backoffStrategy.next.returns(10);
        this.backoff.on('ready', this.spy);

        this.backoff.backoff();
        this.clock.tick(10);

        test.ok(this.spy.calledOnce,
            'Ready event should be emitted when backoff ends.');
        test.done();
    },

    "the backoff event should be passed the backoff delay": function(test) {
        this.backoffStrategy.next.returns(989);
        this.backoff.on('backoff', this.spy);

        this.backoff.backoff();

        test.equal(this.spy.getCall(0).args[1], 989, 'Backoff event should ' +
            'carry the backoff delay as its second argument.');
        test.done();
    },

    "the ready event should be passed the backoff delay": function(test) {
        this.backoffStrategy.next.returns(989);
        this.backoff.on('ready', this.spy);

        this.backoff.backoff();
        this.clock.tick(989);

        test.equal(this.spy.getCall(0).args[1], 989, 'Ready event should ' +
            'carry the backoff delay as its second argument.');
        test.done();
    },

    "the fail event should be emitted when backoff limit is reached": function(test) {
        var err = new Error('Fail');

        this.backoffStrategy.next.returns(10);
        this.backoff.on('fail', this.spy);

        this.backoff.failAfter(2);

        // Consume first 2 backoffs.
        for (var i = 0; i < 2; i++) {
            this.backoff.backoff();
            this.clock.tick(10);
        }

        // Failure should occur on the third call, and not before.
        test.ok(!this.spy.calledOnce, 'Fail event shouldn\'t have been emitted.');
        this.backoff.backoff(err);
        test.ok(this.spy.calledOnce, 'Fail event should have been emitted.');
        test.equal(this.spy.getCall(0).args[0], err, 'Error should be passed');

        test.done();
    },

    "calling backoff while a backoff is in progress should throw an error": function(test) {
        this.backoffStrategy.next.returns(10);
        var backoff = this.backoff;

        backoff.backoff();

        test.throws(function() {
            backoff.backoff();
        }, /in progress/);

        test.done();
    },

    "backoff limit should be greater than 0": function(test) {
        var backoff = this.backoff;
        test.throws(function() {
            backoff.failAfter(0);
        }, /greater than 0 but got 0/);
        test.done();
    },

    "reset should cancel any backoff in progress": function(test) {
        this.backoffStrategy.next.returns(10);
        this.backoff.on('ready', this.spy);

        this.backoff.backoff();

        this.backoff.reset();
        this.clock.tick(100);   // 'ready' should not be emitted.

        test.equals(this.spy.callCount, 0, 'Reset should have aborted the backoff.');
        test.done();
    },

    "reset should reset the backoff strategy": function(test) {
        this.backoff.reset();
        test.ok(this.backoffStrategy.reset.calledOnce,
            'The backoff strategy should have been resetted.');
        test.done();
    },

    "backoff should be reset after fail": function(test) {
        this.backoffStrategy.next.returns(10);

        this.backoff.failAfter(1);

        this.backoff.backoff();
        this.clock.tick(10);
        this.backoff.backoff();

        test.ok(this.backoffStrategy.reset.calledOnce,
            'Backoff should have been resetted after failure.');
        test.done();
    },

    "the backoff number should increase from 0 to N - 1": function(test) {
        this.backoffStrategy.next.returns(10);
        this.backoff.on('backoff', this.spy);

        var expectedNumbers = [0, 1, 2, 3, 4];
        var actualNumbers = [];

        for (var i = 0; i < expectedNumbers.length; i++) {
            this.backoff.backoff();
            this.clock.tick(10);
            actualNumbers.push(this.spy.getCall(i).args[0]);
        }

        test.deepEqual(expectedNumbers, actualNumbers,
            'Backoff number should increase from 0 to N - 1.');
        test.done();
    }
};
