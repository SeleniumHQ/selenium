/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Enable mocking of functions not attached to objects
 * whether they be global / top-level or anonymous methods / closures.
 *
 * See the unit tests for usage.
 */

goog.setTestOnly('goog.testing');
goog.provide('goog.testing');
goog.provide('goog.testing.FunctionMock');
goog.provide('goog.testing.GlobalFunctionMock');
goog.provide('goog.testing.MethodMock');

goog.require('goog.object');
goog.require('goog.testing.LooseMock');
goog.require('goog.testing.Mock');
goog.require('goog.testing.MockInterface');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.StrictMock');


/**
 * Class used to mock a function. Useful for mocking closures and anonymous
 * callbacks etc. Creates a function object that extends goog.testing.Mock.
 * @param {string=} opt_functionName The optional name of the function to mock.
 *     Set to '[anonymous mocked function]' if not passed in.
 * @param {number=} opt_strictness One of goog.testing.Mock.LOOSE or
 *     goog.testing.Mock.STRICT. The default is STRICT.
 * @return {!goog.testing.MockInterface} The mocked function.
 * @suppress {missingProperties} Mocks do not fit in the type system well.
 */
goog.testing.FunctionMock = function(opt_functionName, opt_strictness) {
  'use strict';
  var fn = function() {
    'use strict';
    var args = Array.prototype.slice.call(arguments);
    args.splice(0, 0, opt_functionName || '[anonymous mocked function]');
    return fn.$mockMethod.apply(fn, args);
  };
  var base = opt_strictness === goog.testing.Mock.LOOSE ?
      goog.testing.LooseMock :
      goog.testing.StrictMock;
  goog.object.extend(fn, new base({}));

  return /** @type {!goog.testing.MockInterface} */ (fn);
};


/**
 * Mocks an existing function. Creates a goog.testing.FunctionMock
 * and registers it in the given scope with the name specified by functionName.
 * @param {Object} scope The scope of the method to be mocked out.
 * @param {string} functionName The name of the function we're going to mock.
 * @param {number=} opt_strictness One of goog.testing.Mock.LOOSE or
 *     goog.testing.Mock.STRICT. The default is STRICT.
 * @return {!goog.testing.MockInterface} The mocked method.
 * @suppress {strictMissingProperties} $propertyReplacer_ and $tearDown are
 *     not defined on goog.testing.MockInterface
 */
goog.testing.MethodMock = function(scope, functionName, opt_strictness) {
  'use strict';
  if (!(functionName in scope)) {
    throw new Error(functionName + ' is not a property of the given scope.');
  }

  var fn = goog.testing.FunctionMock(functionName, opt_strictness);

  fn.$propertyReplacer_ = new goog.testing.PropertyReplacer();
  fn.$propertyReplacer_.set(scope, functionName, fn);
  fn.$tearDown = goog.testing.MethodMock.$tearDown;

  return fn;
};


/**
 * @private
 * @record @extends {goog.testing.MockInterface}
 */
goog.testing.MethodMock.MockInternalInterface_ = function() {};

/** @const {!goog.testing.PropertyReplacer} */
goog.testing.MethodMock.MockInternalInterface_.prototype.$propertyReplacer_;


/**
 * Resets the global function that we mocked back to its original state.
 * @this {goog.testing.MockInterface}
 */
goog.testing.MethodMock.$tearDown = function() {
  'use strict';
  /** @type {!goog.testing.MethodMock.MockInternalInterface_} */ (this)
      .$propertyReplacer_.reset();
};


/**
 * Mocks a global / top-level function. Creates a goog.testing.MethodMock
 * in the global scope with the name specified by functionName.
 * @param {string} functionName The name of the function we're going to mock.
 * @param {number=} opt_strictness One of goog.testing.Mock.LOOSE or
 *     goog.testing.Mock.STRICT. The default is STRICT.
 * @return {!goog.testing.MockInterface} The mocked global function.
 */
goog.testing.GlobalFunctionMock = function(functionName, opt_strictness) {
  'use strict';
  return goog.testing.MethodMock(goog.global, functionName, opt_strictness);
};


/**
 * Convenience method for creating a mock for a function.
 * @param {string=} opt_functionName The optional name of the function to mock
 *     set to '[anonymous mocked function]' if not passed in.
 * @param {number=} opt_strictness One of goog.testing.Mock.LOOSE or
 *     goog.testing.Mock.STRICT. The default is STRICT.
 * @return {!goog.testing.MockInterface} The mocked function.
 */
goog.testing.createFunctionMock = function(opt_functionName, opt_strictness) {
  'use strict';
  return goog.testing.FunctionMock(opt_functionName, opt_strictness);
};


/**
 * Convenience method for creating a mock for a method.
 * @param {Object} scope The scope of the method to be mocked out.
 * @param {string} functionName The name of the function we're going to mock.
 * @param {number=} opt_strictness One of goog.testing.Mock.LOOSE or
 *     goog.testing.Mock.STRICT. The default is STRICT.
 * @return {!goog.testing.MockInterface} The mocked global function.
 */
goog.testing.createMethodMock = function(scope, functionName, opt_strictness) {
  'use strict';
  return goog.testing.MethodMock(scope, functionName, opt_strictness);
};


/**
 * Convenience method for creating a mock for a constructor. Copies class
 * members to the mock.
 *
 * <p>When mocking a constructor to return a mocked instance, remember to create
 * the instance mock before mocking the constructor. If you mock the constructor
 * first, then the mock framework will be unable to examine the prototype chain
 * when creating the mock instance.
 * @param {Object} scope The scope of the constructor to be mocked out.
 * @param {string} constructorName The name of the constructor we're going to
 *     mock.
 * @param {number=} opt_strictness One of goog.testing.Mock.LOOSE or
 *     goog.testing.Mock.STRICT. The default is STRICT.
 * @return {!goog.testing.MockInterface} The mocked constructor.
 */
goog.testing.createConstructorMock = function(
    scope, constructorName, opt_strictness) {
  'use strict';
  var realConstructor = scope[constructorName];
  var constructorMock =
      goog.testing.MethodMock(scope, constructorName, opt_strictness);

  // Copy class members from the real constructor to the mock. Do not copy
  // the closure superClass_ property (see goog.inherits), the built-in
  // prototype property, or properties added to Function.prototype
  // TODO(nickreid): Should this work for non-enumerable properties, like are
  // created by ES6 classes.
  for (var property in realConstructor) {
    if (property != 'superClass_' && property != 'prototype' &&
        realConstructor.hasOwnProperty(property)) {
      constructorMock[property] = realConstructor[property];
    }
  }
  return constructorMock;
};


/**
 * Convenience method for creating a mocks for a global / top-level function.
 * @param {string} functionName The name of the function we're going to mock.
 * @param {number=} opt_strictness One of goog.testing.Mock.LOOSE or
 *     goog.testing.Mock.STRICT. The default is STRICT.
 * @return {!goog.testing.MockInterface} The mocked global function.
 */
goog.testing.createGlobalFunctionMock = function(functionName, opt_strictness) {
  'use strict';
  return goog.testing.GlobalFunctionMock(functionName, opt_strictness);
};
