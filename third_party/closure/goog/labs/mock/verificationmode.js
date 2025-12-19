// Copyright 2016 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Provides an interface that defines how users can extend the
 * `goog.labs.mock` mocking framework with custom verification.
 *
 * In addition to the interface definition, it contains several static
 * factories for creating common implementations of the interface.
 */
goog.provide('goog.labs.mock.verification');
goog.provide('goog.labs.mock.verification.BaseVerificationMode');
goog.provide('goog.labs.mock.verification.VerificationMode');


/**
 * A mode which defines how mock invocations should be verified.
 * When an instance of `VerificationMode` is passed to
 * `goog.labs.mock.verify`, then that instances's `#verify`
 * method will be used to verify the invocation.
 *
 * If `#verify` returns false, then the test will fail and the
 * description returned from `#describe` will be shown in the
 * test failure message.  Sample usage:
 *
 * goog.module('my.package.MyClassTest');
 * goog.setTestOnly('my.package.MyClassTest');
 *
 * var testSuite = goog.require('goog.testing.testSuite');
 * var verification = goog.require('goog.labs.mock.verification');
 *
 * var times = verification.times;
 *
 * testSuite({
 *   setUp: function() {
 *     // Code creating instances of MyClass and mockObj.
 *   },
 *
 *   testMyMethod_shouldDoSomething: function() {
 *     myClassInstance.myMethod();
 *
 *     goog.labs.mock.verify(mockObj, times(1));
 *   }
 * });
 *
 * For an example implementation, see `TimesVerificationMode_`.
 *
 * @interface
 */
goog.labs.mock.verification.VerificationMode = function() {};


/**
 * Returns true if the recorded number of invocations,
 * `actualNumberOfInvocations`, meets the expectations of this mode.
 *
 * TODO(user): Have this take in an object which contains the complete
 * call record in order to allow more interesting verifications.
 *
 * @param {number} actualNumberOfInvocations
 * @return {boolean}
 */
goog.labs.mock.verification.VerificationMode.prototype.verify =
    goog.abstractMethod;


/**
 * Returns a description of what this VerificationMode expected.
 *
 * @return {string}
 */
goog.labs.mock.verification.VerificationMode.prototype.describe =
    goog.abstractMethod;


/**
 * Returns a `VerificationMode` which verifies a method was called
 * exactly `expectedNumberOfInvocations` times.
 *
 * @param {number} expectedNumberOfInvocations
 * @return {!goog.labs.mock.verification.VerificationMode}
 */
goog.labs.mock.verification.times = function(expectedNumberOfInvocations) {
  return new goog.labs.mock.verification.TimesVerificationMode_(
      expectedNumberOfInvocations);
};


/**
 * Returns a `VerificationMode` which verifies a method was called at
 * least `minimumNumberOfInvocations` times.
 *
 * @param {number} minimumNumberOfInvocations
 * @return {!goog.labs.mock.verification.VerificationMode}
 */
goog.labs.mock.verification.atLeast = function(minimumNumberOfInvocations) {
  return new goog.labs.mock.verification.AtLeastVerificationMode_(
      minimumNumberOfInvocations);
};


/**
 * Returns a `VerificationMode` which verifies a method was called at
 * most `maxNumberOfInvocations` times.
 *
 * @param {number} maxNumberOfInvocations
 * @return {!goog.labs.mock.verification.VerificationMode}
 */
goog.labs.mock.verification.atMost = function(maxNumberOfInvocations) {
  return new goog.labs.mock.verification.AtMostVerificationMode_(
      maxNumberOfInvocations);
};


/**
 * Returns a `VerificationMode` which verifies a method was never
 * called. An alias for `VerificatonMode.times(0)`.
 *
 * @return {!goog.labs.mock.verification.VerificationMode}
 */
goog.labs.mock.verification.never = function() {
  return goog.labs.mock.verification.times(0);
};

/**
 * A base verification mode whose purpose is to allow consumers to do an
 * instanceof check on all verification modes. This class adds no additional
 * functionality to it's subclasses.
 * @package
 */
goog.labs.mock.verification.BaseVerificationMode =
    goog.defineClass(null, {constructor() {}});

/**
 * A `VerificationMode` which verifies a method was called
 * exactly `expectedNumberOfInvocations` times.
 *
 * @private @implements {goog.labs.mock.verification.VerificationMode}
 */
goog.labs.mock.verification.TimesVerificationMode_ =
    goog.defineClass(goog.labs.mock.verification.BaseVerificationMode, {
      /**
       * @param {number} expectedNumberOfInvocations
       * @constructor
       */
      constructor: function(expectedNumberOfInvocations) {
        /** @private @const */
        this.expectedNumberOfInvocations_ = expectedNumberOfInvocations;
      },

      /** @override */
      verify: function(actualNumberOfInvocations) {
        return actualNumberOfInvocations == this.expectedNumberOfInvocations_;
      },

      /** @override */
      describe: function() {
        return this.expectedNumberOfInvocations_ + ' times';
      }
    });


/**
 * A `VerificationMode` which verifies a method was called at
 * least `minimumNumberOfInvocations` times.
 *
 * @private @implements {goog.labs.mock.verification.VerificationMode}
 */
goog.labs.mock.verification.AtLeastVerificationMode_ =
    goog.defineClass(goog.labs.mock.verification.BaseVerificationMode, {
      /**
       * @param {number} minimumNumberOfInvocations
       * @constructor
       */
      constructor: function(minimumNumberOfInvocations) {
        /** @private @const */
        this.minimumNumberOfInvocations_ = minimumNumberOfInvocations;
      },

      /** @override */
      verify: function(actualNumberOfInvocations) {
        return actualNumberOfInvocations >= this.minimumNumberOfInvocations_;
      },

      /** @override */
      describe: function() {
        return 'at least ' + this.minimumNumberOfInvocations_ + ' times';
      }
    });


/**
 * A `VerificationMode` which verifies a method was called at
 * most `maxNumberOfInvocations` times.
 *
 * @private @implements {goog.labs.mock.verification.VerificationMode}
 */
goog.labs.mock.verification.AtMostVerificationMode_ = goog.defineClass(null, {
  /**
   * @param {number} maxNumberOfInvocations
   * @constructor
   */
  constructor: function(maxNumberOfInvocations) {
    /** @private */
    this.maxNumberOfInvocations_ = maxNumberOfInvocations;
  },

  /** @override */
  verify: function(actualNumberOfInvocations) {
    return actualNumberOfInvocations <= this.maxNumberOfInvocations_;
  },

  /** @override */
  describe: function() {
    return 'at most ' + this.maxNumberOfInvocations_ + ' times';
  }
});
