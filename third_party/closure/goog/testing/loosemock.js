/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview This file defines a loose mock implementation.
 */

goog.setTestOnly('goog.testing.LooseExpectationCollection');
goog.provide('goog.testing.LooseExpectationCollection');
goog.provide('goog.testing.LooseMock');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.testing.Mock');
goog.requireType('goog.testing.MockExpectation');



/**
 * This class is an ordered collection of expectations for one method. Since
 * the loose mock does most of its verification at the time of $verify, this
 * class is necessary to manage the return/throw behavior when the mock is
 * being called.
 * @constructor
 * @final
 */
goog.testing.LooseExpectationCollection = function() {
  'use strict';
  /**
   * The list of expectations. All of these should have the same name.
   * @type {!Array<!goog.testing.MockExpectation>}
   * @private
   */
  this.expectations_ = [];
};


/**
 * Adds an expectation to this collection.
 * @param {!goog.testing.MockExpectation} expectation The expectation to add.
 */
goog.testing.LooseExpectationCollection.prototype.addExpectation = function(
    expectation) {
  'use strict';
  this.expectations_.push(expectation);
};


/**
 * Gets the list of expectations in this collection.
 * @return {!Array<!goog.testing.MockExpectation>} The array of expectations.
 */
goog.testing.LooseExpectationCollection.prototype.getExpectations = function() {
  'use strict';
  return this.expectations_;
};



/**
 * This is a mock that does not care about the order of method calls. As a
 * result, it won't throw exceptions until verify() is called. The only
 * exception is that if a method is called that has no expectations, then an
 * exception will be thrown.
 * @param {Object|Function} objectToMock The object that should be mocked, or
 *    the constructor of an object to mock.
 * @param {boolean=} opt_ignoreUnexpectedCalls Whether to ignore unexpected
 *     calls.
 * @param {boolean=} opt_mockStaticMethods An optional argument denoting that
 *     a mock should be constructed from the static functions of a class.
 * @param {boolean=} opt_createProxy An optional argument denoting that
 *     a proxy for the target mock should be created.
 * @constructor
 * @extends {goog.testing.Mock}
 */
goog.testing.LooseMock = function(
    objectToMock, opt_ignoreUnexpectedCalls, opt_mockStaticMethods,
    opt_createProxy) {
  'use strict';
  goog.testing.Mock.call(
      this, objectToMock, opt_mockStaticMethods, opt_createProxy);

  /**
   * A map of method names to a LooseExpectationCollection for that method.
   * @type {!Map<string, !goog.testing.LooseExpectationCollection>}
   * @private
   */
  this.$expectations_ = new Map();

  /** @private {!Set<!goog.testing.MockExpectation>} */
  this.awaitingExpectations_ = new Set();

  /**
   * The calls that have been made; we cache them to verify at the end. Each
   * element is an array where the first element is the name, and the second
   * element is the arguments.
   * @type {Array<Array<*>>}
   * @private
   */
  this.$calls_ = [];

  /**
   * Whether to ignore unexpected calls.
   * @type {boolean}
   * @private
   */
  this.$ignoreUnexpectedCalls_ = !!opt_ignoreUnexpectedCalls;
};
goog.inherits(goog.testing.LooseMock, goog.testing.Mock);


/**
 * A setter for the ignoreUnexpectedCalls field.
 * @param {boolean} ignoreUnexpectedCalls Whether to ignore unexpected calls.
 * @return {!goog.testing.LooseMock} This mock object.
 */
goog.testing.LooseMock.prototype.$setIgnoreUnexpectedCalls = function(
    ignoreUnexpectedCalls) {
  'use strict';
  this.$ignoreUnexpectedCalls_ = ignoreUnexpectedCalls;
  return this;
};


/** @override */
goog.testing.LooseMock.prototype.$recordExpectation = function() {
  'use strict';
  if (!this.$expectations_.has(this.$pendingExpectation.name)) {
    this.$expectations_.set(
        this.$pendingExpectation.name,
        new goog.testing.LooseExpectationCollection());
  }

  var collection = this.$expectations_.get(this.$pendingExpectation.name);
  collection.addExpectation(this.$pendingExpectation);
  if (this.$pendingExpectation) {
    this.awaitingExpectations_.add(this.$pendingExpectation);
  }
};


/** @override */
goog.testing.LooseMock.prototype.$recordCall = function(name, args) {
  'use strict';
  if (!this.$expectations_.has(name)) {
    if (this.$ignoreUnexpectedCalls_) {
      return;
    }
    this.$throwCallException(name, args);
  }

  // Start from the beginning of the expectations for this name,
  // and iterate over them until we find an expectation that matches
  // and also has calls remaining.
  var collection = this.$expectations_.get(name);
  var matchingExpectation = null;
  var expectations = collection.getExpectations();
  for (var i = 0; i < expectations.length; i++) {
    var expectation = expectations[i];
    if (this.$verifyCall(expectation, name, args)) {
      matchingExpectation = expectation;
      if (expectation.actualCalls < expectation.maxCalls) {
        break;
      }  // else continue and see if we can find something that does match
    }
  }
  if (matchingExpectation == null) {
    this.$throwCallException(name, args, expectation);
  }

  matchingExpectation.actualCalls++;
  if (matchingExpectation.actualCalls > matchingExpectation.maxCalls) {
    this.$throwException(
        'Too many calls to ' + matchingExpectation.name + '\nExpected: ' +
        matchingExpectation.maxCalls + ' but was: ' +
        matchingExpectation.actualCalls);
  }
  if (matchingExpectation.actualCalls >= matchingExpectation.minCalls) {
    this.awaitingExpectations_.delete(matchingExpectation);
    this.maybeFinishedWithExpectations_();
  }

  this.$calls_.push([name, args]);
  return this.$do(matchingExpectation, args);
};


/** @override */
goog.testing.LooseMock.prototype.$reset = function() {
  'use strict';
  goog.testing.LooseMock.superClass_.$reset.call(this);

  this.$expectations_ = new Map();
  this.awaitingExpectations_ = new Set();
  this.$calls_ = [];
};


/** @override */
goog.testing.LooseMock.prototype.$replay = function() {
  'use strict';
  goog.testing.LooseMock.superClass_.$replay.call(this);

  // Verify that there are no expectations that can never be reached.
  // This can't catch every situation, but it is a decent sanity check
  // and it's similar to the behavior of EasyMock in java.
  for (const expectationCollection of this.$expectations_.values()) {
    var expectations = expectationCollection.getExpectations();
    for (var j = 0; j < expectations.length; j++) {
      var expectation = expectations[j];
      // If this expectation can be called infinite times, then
      // check if any subsequent expectation has the exact same
      // argument list.
      if (!isFinite(expectation.maxCalls)) {
        for (var k = j + 1; k < expectations.length; k++) {
          var laterExpectation = expectations[k];
          if (laterExpectation.minCalls > 0 &&
              goog.array.equals(
                  expectation.argumentList, laterExpectation.argumentList)) {
            var name = expectation.name;
            var argsString = this.$argumentsAsString(expectation.argumentList);
            this.$throwException([
              'Expected call to ', name, ' with arguments ', argsString,
              ' has an infinite max number of calls; can\'t expect an',
              ' identical call later with a positive min number of calls'
            ].join(''));
          }
        }
      }
    }
  }
};


/** @override */
goog.testing.LooseMock.prototype.$waitAndVerify = function() {
  'use strict';
  for (const expectationCollection of this.$expectations_.values()) {
    var expectations = expectationCollection.getExpectations();
    for (var j = 0; j < expectations.length; j++) {
      var expectation = expectations[j];
      goog.asserts.assert(
          !isFinite(expectation.maxCalls) ||
              expectation.minCalls == expectation.maxCalls,
          'Mock expectations cannot have a loose number of expected calls to ' +
              'use $waitAndVerify.');
    }
  }
  var promise = goog.testing.LooseMock.base(this, '$waitAndVerify');
  this.maybeFinishedWithExpectations_();
  return promise;
};

/**
 * @private
 */
goog.testing.LooseMock.prototype.maybeFinishedWithExpectations_ = function() {
  'use strict';
  var unresolvedExpectations = goog.array.some(
      Array.from(this.$expectations_.values()),
      function(expectationCollection) {
        'use strict';
        return goog.array.some(
            expectationCollection.getExpectations(), function(expectation) {
              'use strict';
              return expectation.actualCalls < expectation.minCalls;
            });
      });
  if (this.waitingForExpectations && !unresolvedExpectations) {
    this.waitingForExpectations.resolve();
  }
};

/** @override */
goog.testing.LooseMock.prototype.$verify = function() {
  'use strict';
  goog.testing.LooseMock.superClass_.$verify.call(this);
  for (const expectationCollection of this.$expectations_.values()) {
    var expectations = expectationCollection.getExpectations();
    for (var j = 0; j < expectations.length; j++) {
      var expectation = expectations[j];
      if (expectation.actualCalls > expectation.maxCalls) {
        this.$throwException(
            'Too many calls to ' + expectation.name + '\nExpected: ' +
            expectation.maxCalls + ' but was: ' + expectation.actualCalls);
      } else if (expectation.actualCalls < expectation.minCalls) {
        this.$throwException(
            'Not enough calls to ' + expectation.name + '\nExpected: ' +
            expectation.minCalls + ' but was: ' + expectation.actualCalls);
      }
    }
  }
};
