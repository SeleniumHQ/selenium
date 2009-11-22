// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2008 Google Inc. All Rights Reserved.

/**
 * @fileoverview Enable mocking of functions not attached to objects
 * whether they be global / top-level or anonymous methods / closures.
 *
 * See the unit tests for usage.
 *
 */

goog.provide('goog.testing');
goog.provide('goog.testing.FunctionMock');
goog.provide('goog.testing.GlobalFunctionMock');
goog.provide('goog.testing.MethodMock');

goog.require('goog.object');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.StrictMock');



/**
 * Class used to mock a function. Useful for mocking closures and anonymous
 * callbacks etc. Creates a function object that extends goog.testing.StrictMock
 * @param {string} opt_functionName the optional name of the function to mock
 *     set to '[anonymous mocked function]' if not passed in.
 * @extends {goog.testing.StrictMock}
 * @constructor
 */
goog.testing.FunctionMock = function(opt_functionName) {
  var fn = function() {
    var args = Array.prototype.slice.call(arguments);
    args.splice(0, 0, opt_functionName || '[anonymous mocked function]');
    return fn.$mockMethod.apply(fn, args);
  };
  goog.object.extend(fn, new goog.testing.StrictMock({}));

  return fn;
};



/**
 * Mocks an existing function. Creates a goog.testing.FunctionMock
 * and registers it in the given scope with the name specified by functionName.
 * @param {Object} scope The scope of the method to be mocked out.
 * @param {string} functionName the name of the function we're going to mock.
 * @extends {goog.testing.FunctionMock}
 * @constructor
 */
goog.testing.MethodMock = function(scope, functionName) {
  if (!(functionName in scope)) {
    throw new Error(functionName + ' is not a property of the given scope.');
  }

  var fn = new goog.testing.FunctionMock(functionName);

  fn.$propertyReplacer_ = new goog.testing.PropertyReplacer();
  fn.$propertyReplacer_.set(scope, functionName, fn);
  fn.$tearDown = this.$tearDown;

  return fn;
};


/**
 * Reset the global function that we mocked back to it's original state
 */
goog.testing.MethodMock.prototype.$tearDown = function() {
  this.$propertyReplacer_.reset();
};



/**
 * Mocks a global / top-level function. Creates a goog.testing.MethodMock
 * in the global scope with the name specified by functionName.
 * @param {string} functionName the name of the function we're going to mock.
 * @extends {goog.testing.MethodMock}
 * @constructor
 */
goog.testing.GlobalFunctionMock = function(functionName) {
  return new goog.testing.MethodMock(goog.global, functionName);
};


/**
 * Mocks a function. Convenience method for new goog.testing.FunctionMock
 * @param {string} opt_functionName the optional name of the function to mock
 *     set to '[anonymous mocked function]' if not passed in.
 * @return {goog.testing.FunctionMock} the mocked function.
 */
goog.testing.createFunctionMock = function(opt_functionName) {
  return new goog.testing.FunctionMock(opt_functionName);
};


/**
 * Convenience method for creating a mock for a method.
 * @param {Object} scope The scope of the method to be mocked out.
 * @param {string} functionName the name of the function we're going to mock.
 * @return {goog.testing.MethodMock} the mocked global function.
 */
goog.testing.createMethodMock = function(scope, functionName) {
  return new goog.testing.MethodMock(scope, functionName);
};


/**
 * Convenience method for creating a mock for a constructor.
 *
 * <p>When mocking a constructor to return a mocked instance, remember to create
 * the instance mock before mocking the constructor. If you mock the constructor
 * first, then the mock framework will be unable to examine the prototype chain
 * when creating the mock instance.
 * @param {Object} scope The scope of the constructor to be mocked out.
 * @param {string} constructorName the name of the constructor we're going to
 *     mock.
 * @return {goog.testing.MethodMock} the mocked constructor.
 */
goog.testing.createConstructorMock = function(scope, constructorName) {
  // The return value is a MethodMock and there is no difference in
  // implementation between this method and createMethodMock. This alias is
  // provided just to make code clearer and to make it easier to introduce a
  // more specialized implementation if that is ever necessary.
  return new goog.testing.MethodMock(scope, constructorName);
};


/**
 * Convenience method for creating a mocks for a global / top-level function.
 * @param {string} functionName the name of the function we're going to mock.
 * @return {goog.testing.GlobalFunctionMock} the mocked global function.
 */
goog.testing.createGlobalFunctionMock = function(functionName) {
  return new goog.testing.GlobalFunctionMock(functionName);
};
