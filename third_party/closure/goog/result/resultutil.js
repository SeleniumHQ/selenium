// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview This file provides primitives and tools (wait, transform,
 *     chain, combine) that make it easier to work with Results. This section
 *     gives an overview of their functionality along with some examples and the
 *     actual definitions have detailed descriptions next to them.
 *
 *
 * NOTE: goog.result is soft deprecated - we expect to replace this and
 * goog.async.Deferred with a wrapper around W3C Promises:
 * http://dom.spec.whatwg.org/#promises.
 */

goog.provide('goog.result');

goog.require('goog.array');
goog.require('goog.result.DependentResult');
goog.require('goog.result.Result');
goog.require('goog.result.SimpleResult');


/**
 * Returns a successful result containing the provided value.
 *
 * Example:
 * <pre>
 *
 * var value = 'some-value';
 * var result = goog.result.immediateResult(value);
 * assertEquals(goog.result.Result.State.SUCCESS, result.getState());
 * assertEquals(value, result.getValue());
 *
 * </pre>
 *
 * @param {*} value The value of the result.
 * @return {!goog.result.Result} A Result object that has already been resolved
 *     to the supplied value.
 */
goog.result.successfulResult = function(value) {
  var result = new goog.result.SimpleResult();
  result.setValue(value);
  return result;
};


/**
 * Returns a failed result with the optional error slug set.
 *
 * Example:
 * <pre>
 *
 * var error = new Error('something-failed');
 * var result = goog.result.failedResult(error);
 * assertEquals(goog.result.Result.State.ERROR, result.getState());
 * assertEquals(error, result.getError());
 *
 * </pre>
 *
 * @param {*=} opt_error The error to which the result should resolve.
 * @return {!goog.result.Result} A Result object that has already been resolved
 *     to the supplied Error.
 */
goog.result.failedResult = function(opt_error) {
  var result = new goog.result.SimpleResult();
  result.setError(opt_error);
  return result;
};


/**
 * Returns a canceled result.
 * The result will be resolved to an error of type CancelError.
 *
 * Example:
 * <pre>
 *
 * var result = goog.result.canceledResult();
 * assertEquals(goog.result.Result.State.ERROR, result.getState());
 * var error = result.getError();
 * assertTrue(error instanceof goog.result.Result.CancelError);
 *
 * </pre>
 *
 * @return {!goog.result.Result} A canceled Result.
 */
goog.result.canceledResult = function() {
  var result = new goog.result.SimpleResult();
  result.cancel();
  return result;
};


/**
 * Calls the handler on resolution of the result (success or failure).
 * The handler is passed the result object as the only parameter. The call will
 * be immediate if the result is no longer pending.
 *
 * Example:
 * <pre>
 *
 * var result = xhr.get('testdata/xhr_test_text.data');
 *
 * // Wait for the result to be resolved and alert it's state.
 * goog.result.wait(result, function(result) {
 *   alert('State: ' + result.getState());
 * });
 * </pre>
 *
 * @param {!goog.result.Result} result The result to install the handlers.
 * @param {function(this:T, !goog.result.Result)} handler The handler to be
 *     called. The handler is passed the result object as the only parameter.
 * @param {T=} opt_scope Optional scope for the handler.
 * @template T
 */
goog.result.wait = function(result, handler, opt_scope) {
  result.wait(handler, opt_scope);
};


/**
 * Calls the handler if the result succeeds. The result object is the only
 * parameter passed to the handler. The call will be immediate if the result
 * has already succeeded.
 *
 * Example:
 * <pre>
 *
 * var result = xhr.get('testdata/xhr_test_text.data');
 *
 * // attach a success handler.
 * goog.result.waitOnSuccess(result, function(resultValue, result) {
 *   var datavalue = result.getvalue();
 *   alert('value: ' + datavalue + ' == ' + resultValue);
 * });
 * </pre>
 *
 * @param {!goog.result.Result} result The result to install the handlers.
 * @param {function(this:T, ?, !goog.result.Result)} handler The handler to be
 *     called. The handler is passed the result value and the result as
 *     parameters.
 * @param {T=} opt_scope Optional scope for the handler.
 * @template T
 */
goog.result.waitOnSuccess = function(result, handler, opt_scope) {
  goog.result.wait(result, function(res) {
    if (res.getState() == goog.result.Result.State.SUCCESS) {
      // 'this' refers to opt_scope
      handler.call(this, res.getValue(), res);
    }
  }, opt_scope);
};


/**
 * Calls the handler if the result action errors. The result object is passed as
 * the only parameter to the handler. The call will be immediate if the result
 * object has already resolved to an error.
 *
 * Example:
 *
 * <pre>
 *
 * var result = xhr.get('testdata/xhr_test_text.data');
 *
 * // Attach a failure handler.
 * goog.result.waitOnError(result, function(error) {
 *  // Failed asynchronous call!
 * });
 * </pre>
 *
 * @param {!goog.result.Result} result The result to install the handlers.
 * @param {function(this:T, ?, !goog.result.Result)} handler The handler to be
 *     called. The handler is passed the error and the result object as
 *     parameters.
 * @param {T=} opt_scope Optional scope for the handler.
 * @template T
 */
goog.result.waitOnError = function(result, handler, opt_scope) {
  goog.result.wait(result, function(res) {
    if (res.getState() == goog.result.Result.State.ERROR) {
      // 'this' refers to opt_scope
      handler.call(this, res.getError(), res);
    }
  }, opt_scope);
};


/**
 * Given a result and a transform function, returns a new result whose value,
 * on success, will be the value of the given result after having been passed
 * through the transform function.
 *
 * If the given result is an error, the returned result is also an error and the
 * transform will not be called.
 *
 * Example:
 * <pre>
 *
 * var result = xhr.getJson('testdata/xhr_test_json.data');
 *
 * // Transform contents of returned data using 'processJson' and create a
 * // transformed result to use returned JSON.
 * var transformedResult = goog.result.transform(result, processJson);
 *
 * // Attach success and failure handlers to the transformed result.
 * goog.result.waitOnSuccess(transformedResult, function(resultValue, result) {
 *   var jsonData = resultValue;
 *   assertEquals('ok', jsonData['stat']);
 * });
 *
 * goog.result.waitOnError(transformedResult, function(error) {
 *   // Failed getJson call
 * });
 * </pre>
 *
 * @param {!goog.result.Result} result The result whose value will be
 *     transformed.
 * @param {function(?):?} transformer The transformer
 *     function. The return value of this function will become the value of the
 *     returned result.
 *
 * @return {!goog.result.DependentResult} A new Result whose eventual value will
 *     be the returned value of the transformer function.
 */
goog.result.transform = function(result, transformer) {
  var returnedResult = new goog.result.DependentResultImpl_([result]);

  goog.result.wait(result, function(res) {
    if (res.getState() == goog.result.Result.State.SUCCESS) {
      returnedResult.setValue(transformer(res.getValue()));
    } else {
      returnedResult.setError(res.getError());
    }
  });

  return returnedResult;
};


/**
 * The chain function aids in chaining of asynchronous Results. This provides a
 * convenience for use cases where asynchronous operations must happen serially
 * i.e. subsequent asynchronous operations are dependent on data returned by
 * prior asynchronous operations.
 *
 * It accepts a result and an action callback as arguments and returns a
 * result. The action callback is called when the first result succeeds and is
 * supposed to return a second result. The returned result is resolved when one
 * of both of the results resolve (depending on their success or failure.) The
 * state and value of the returned result in the various cases is documented
 * below:
 * <pre>
 *
 * First Result State:    Second Result State:    Returned Result State:
 * SUCCESS                SUCCESS                 SUCCESS
 * SUCCESS                ERROR                   ERROR
 * ERROR                  Not created             ERROR
 * </pre>
 *
 * The value of the returned result, in the case both results succeed, is the
 * value of the second result (the result returned by the action callback.)
 *
 * Example:
 * <pre>
 *
 * var testDataResult = xhr.get('testdata/xhr_test_text.data');
 *
 * // Chain this result to perform another asynchronous operation when this
 * // Result is resolved.
 * var chainedResult = goog.result.chain(testDataResult,
 *     function(testDataResult) {
 *
 *       // The result value of testDataResult is the URL for JSON data.
 *       var jsonDataUrl = testDataResult.getValue();
 *
 *       // Create a new Result object when the original result is resolved.
 *       var jsonResult = xhr.getJson(jsonDataUrl);
 *
 *       // Return the newly created Result.
 *       return jsonResult;
 *     });
 *
 * // The chained result resolves to success when both results resolve to
 * // success.
 * goog.result.waitOnSuccess(chainedResult, function(resultValue, result) {
 *
 *   // At this point, both results have succeeded and we can use the JSON
 *   // data returned by the second asynchronous call.
 *   var jsonData = resultValue;
 *   assertEquals('ok', jsonData['stat']);
 * });
 *
 * // Attach the error handler to be called when either Result fails.
 * goog.result.waitOnError(chainedResult, function(result) {
 *   alert('chained result failed!');
 * });
 * </pre>
 *
 * @param {!goog.result.Result} result The result to chain.
 * @param {function(this:T, !goog.result.Result):!goog.result.Result}
 *     actionCallback The callback called when the result is resolved. This
 *     callback must return a Result.
 * @param {T=} opt_scope Optional scope for the action callback.
 * @return {!goog.result.DependentResult} A result that is resolved when both
 *     the given Result and the Result returned by the actionCallback have
 *     resolved.
 * @template T
 */
goog.result.chain = function(result, actionCallback, opt_scope) {
  var dependentResult = new goog.result.DependentResultImpl_([result]);

  // Wait for the first action.
  goog.result.wait(result, function(result) {
    if (result.getState() == goog.result.Result.State.SUCCESS) {
      // The first action succeeded. Chain the contingent action.
      var contingentResult = actionCallback.call(opt_scope, result);
      dependentResult.addParentResult(contingentResult);
      goog.result.wait(contingentResult, function(contingentResult) {

        // The contingent action completed. Set the dependent result based on
        // the contingent action's outcome.
        if (contingentResult.getState() == goog.result.Result.State.SUCCESS) {
          dependentResult.setValue(contingentResult.getValue());
        } else {
          dependentResult.setError(contingentResult.getError());
        }
      });
    } else {
      // First action failed, the dependent result should also fail.
      dependentResult.setError(result.getError());
    }
  });

  return dependentResult;
};


/**
 * Returns a result that waits on all given results to resolve. Once all have
 * resolved, the returned result will succeed (and never error).
 *
 * Example:
 * <pre>
 *
 * var result1 = xhr.get('testdata/xhr_test_text.data');
 *
 * // Get a second independent Result.
 * var result2 = xhr.getJson('testdata/xhr_test_json.data');
 *
 * // Create a Result that resolves when both prior results resolve.
 * var combinedResult = goog.result.combine(result1, result2);
 *
 * // Process data after resolution of both results.
 * goog.result.waitOnSuccess(combinedResult, function(results) {
 *   goog.array.forEach(results, function(result) {
 *       alert(result.getState());
 *   });
 * });
 * </pre>
 *
 * @param {...!goog.result.Result} var_args The results to wait on.
 *
 * @return {!goog.result.DependentResult} A new Result whose eventual value will
 *     be the resolved given Result objects.
 */
goog.result.combine = function(var_args) {
  /** @type {!Array<!goog.result.Result>} */
  var results = goog.array.clone(arguments);
  var combinedResult = new goog.result.DependentResultImpl_(results);

  var isResolved = function(res) {
    return res.getState() != goog.result.Result.State.PENDING;
  };

  var checkResults = function() {
    if (combinedResult.getState() == goog.result.Result.State.PENDING &&
        goog.array.every(results, isResolved)) {
      combinedResult.setValue(results);
    }
  };

  goog.array.forEach(
      results, function(result) { goog.result.wait(result, checkResults); });

  return combinedResult;
};


/**
 * Returns a result that waits on all given results to resolve. Once all have
 * resolved, the returned result will succeed if and only if all given results
 * succeeded. Otherwise it will error.
 *
 * Example:
 * <pre>
 *
 * var result1 = xhr.get('testdata/xhr_test_text.data');
 *
 * // Get a second independent Result.
 * var result2 = xhr.getJson('testdata/xhr_test_json.data');
 *
 * // Create a Result that resolves when both prior results resolve.
 * var combinedResult = goog.result.combineOnSuccess(result1, result2);
 *
 * // Process data after successful resolution of both results.
 * goog.result.waitOnSuccess(combinedResult, function(results) {
 *   var textData = results[0].getValue();
 *   var jsonData = results[1].getValue();
 *   assertEquals('Just some data.', textData);
 *   assertEquals('ok', jsonData['stat']);
 * });
 *
 * // Handle errors when either or both results failed.
 * goog.result.waitOnError(combinedResult, function(combined) {
 *   var results = combined.getError();
 *
 *   if (results[0].getState() == goog.result.Result.State.ERROR) {
 *     alert('result1 failed');
 *   }
 *
 *   if (results[1].getState() == goog.result.Result.State.ERROR) {
 *     alert('result2 failed');
 *   }
 * });
 * </pre>
 *
 * @param {...!goog.result.Result} var_args The results to wait on.
 *
 * @return {!goog.result.DependentResult} A new Result whose eventual value will
 *     be an array of values of the given Result objects.
 */
goog.result.combineOnSuccess = function(var_args) {
  var results = goog.array.clone(arguments);
  var combinedResult = new goog.result.DependentResultImpl_(results);

  var resolvedSuccessfully = function(res) {
    return res.getState() == goog.result.Result.State.SUCCESS;
  };

  goog.result.wait(
      goog.result.combine.apply(goog.result.combine, results),
      // The combined result never ERRORs
      function(res) {
        var results =
            /** @type {Array<!goog.result.Result>} */ (res.getValue());
        if (goog.array.every(results, resolvedSuccessfully)) {
          combinedResult.setValue(results);
        } else {
          combinedResult.setError(results);
        }
      });

  return combinedResult;
};


/**
 * Given a DependentResult, cancels the Results it depends on (that is, the
 * results returned by getParentResults). This function does not recurse,
 * so e.g. parents of parents are not canceled; only the immediate parents of
 * the given Result are canceled.
 *
 * Example using @see goog.result.combine:
 * <pre>
 * var result1 = xhr.get('testdata/xhr_test_text.data');
 *
 * // Get a second independent Result.
 * var result2 = xhr.getJson('testdata/xhr_test_json.data');
 *
 * // Create a Result that resolves when both prior results resolve.
 * var combinedResult = goog.result.combineOnSuccess(result1, result2);
 *
 * combinedResult.wait(function() {
 *   if (combinedResult.isCanceled()) {
 *     goog.result.cancelParentResults(combinedResult);
 *   }
 * });
 *
 * // Now, canceling combinedResult will cancel both result1 and result2.
 * combinedResult.cancel();
 * </pre>
 * @param {!goog.result.DependentResult} dependentResult A Result that is
 *     dependent on the values of other Results (for example the Result of a
 *     goog.result.combine, goog.result.chain, or goog.result.transform call).
 * @return {boolean} True if any results were successfully canceled; otherwise
 *     false.
 * TODO(user): Implement a recursive version of this that cancels all
 * ancestor results.
 */
goog.result.cancelParentResults = function(dependentResult) {
  var anyCanceled = false;
  var results = dependentResult.getParentResults();
  for (var n = 0; n < results.length; n++) {
    anyCanceled |= results[n].cancel();
  }
  return !!anyCanceled;
};



/**
 * A DependentResult represents a Result whose eventual value depends on the
 * value of one or more other Results. For example, the Result returned by
 * @see goog.result.chain or @see goog.result.combine is dependent on the
 * Results given as arguments.
 *
 * @param {!Array<!goog.result.Result>} parentResults A list of Results that
 *     will affect the eventual value of this Result.
 * @constructor
 * @implements {goog.result.DependentResult}
 * @extends {goog.result.SimpleResult}
 * @private
 */
goog.result.DependentResultImpl_ = function(parentResults) {
  goog.result.DependentResultImpl_.base(this, 'constructor');
  /**
   * A list of Results that will affect the eventual value of this Result.
   * @type {!Array<!goog.result.Result>}
   * @private
   */
  this.parentResults_ = parentResults;
};
goog.inherits(goog.result.DependentResultImpl_, goog.result.SimpleResult);


/**
 * Adds a Result to the list of Results that affect this one.
 * @param {!goog.result.Result} parentResult A result whose value affects the
 *     value of this Result.
 */
goog.result.DependentResultImpl_.prototype.addParentResult = function(
    parentResult) {
  this.parentResults_.push(parentResult);
};


/** @override */
goog.result.DependentResultImpl_.prototype.getParentResults = function() {
  return this.parentResults_;
};
