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
 */

goog.provide('goog.result');

goog.require('goog.array');
goog.require('goog.result.Result');
goog.require('goog.result.SimpleResult');


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
 * @param {!function(!goog.result.Result)} handler The handler to be
 *     called. The handler is passed the result object as the only parameter.
 * @param {!Object=} opt_scope Optional scope for the handler.
 */
goog.result.wait = function(result, handler, opt_scope) {
  result.wait(opt_scope ? goog.bind(handler, opt_scope) : handler);
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
 * goog.result.waitOnSuccess(result, function(result) {
 *   var datavalue = result.getvalue();
 *   alert('value : ' + datavalue);
 * });
 * </pre>
 *
 * @param {!goog.result.Result} result The result to install the handlers.
 * @param {!function(*, !goog.result.Result)} handler The handler to be
 *     called. The handler is passed the result value and the result as
 *     parameters.
 * @param {!Object=} opt_scope Optional scope for the handler.
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
 * @param {!function(!goog.result.Result)} handler The handler to be
 *     called. The handler is passed the result object as the only parameter.
 * @param {!Object=} opt_scope Optional scope for the handler.
 */
goog.result.waitOnError = function(result, handler, opt_scope) {
  goog.result.wait(result, function(res) {
    if (res.getState() == goog.result.Result.State.ERROR) {
      // 'this' refers to opt_scope
      handler.call(this, res);
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
 * // Attach success and failure handlers to the tranformed result.
 * goog.result.waitOnSuccess(transformedResult, function(result) {
 *   var jsonData = result.getValue();
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
 * @param {!Function} transformer The transformer
 *     function. The return value of this function will become the value of the
 *     returned result.
 *
 * @return {!goog.result.Result} A new Result whose eventual value will be
 *     the returned value of the transformer function.
 */
goog.result.transform = function(result, transformer) {
  var returnedResult = new goog.result.SimpleResult();

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
 *
 * First Result State:    Second Result State:    Returned Result State:
 * SUCCESS                SUCCESS                 SUCCESS
 * SUCCESS                ERROR                   ERROR
 * ERROR                  Not created             ERROR
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
 * goog.result.waitOnSuccess(chainedResult, function(result) {
 *
 *   // At this point, both results have succeeded and we can use the JSON
 *   // data returned by the second asynchronous call.
 *   var jsonData = result.getValue();
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
 * @param {!function(!goog.result.Result):!goog.result.Result}
 *     actionCallback The callback called when the result is resolved. This
 *     callback must return a Result.
 *
 * @return {!goog.result.Result} A result that is resolved when both
 *     the given Result and the Result returned by the actionCallback have
 *     resolved.
 */
goog.result.chain = function(result, actionCallback) {
  var returnedResult = new goog.result.SimpleResult();

  // Wait for the first action.
  goog.result.wait(result, function(result) {
    if (result.getState() == goog.result.Result.State.SUCCESS) {

      // The first action succeeded. Chain the dependent action.
      var dependentResult = actionCallback(result);
      goog.result.wait(dependentResult, function(dependentResult) {

        // The dependent action completed. Set the returned result based on the
        // dependent action's outcome.
        if (dependentResult.getState() ==
            goog.result.Result.State.SUCCESS) {
          returnedResult.setValue(dependentResult.getValue());
        } else {
          returnedResult.setError(dependentResult.getError());
        }
      });
    } else {
      // First action failed, the returned result should also fail.
      returnedResult.setError(result.getError());
    }
  });

  return returnedResult;
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
 * @return {!goog.result.Result} A new Result whose eventual value will be
 *     the resolved given Result objects.
 */
goog.result.combine = function(var_args) {
  var results = goog.array.clone(arguments);
  var combinedResult = new goog.result.SimpleResult();

  var isResolved = function(res) {
    return res.getState() != goog.result.Result.State.PENDING;
  };

  var checkResults = function() {
    if (goog.array.every(results, isResolved)) {
      combinedResult.setValue(results);
    }
  };

  goog.array.forEach(results, function(result) {
    goog.result.wait(result, checkResults);
  });

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
 * @return {!goog.result.Result} A new Result whose eventual value will be
 *     an array of values of the given Result objects.
 */
goog.result.combineOnSuccess = function(var_args) {
  var combinedResult = new goog.result.SimpleResult();

  var resolvedSuccessfully = function(res) {
    return res.getState() == goog.result.Result.State.SUCCESS;
  };

  goog.result.wait(
      goog.result.combine.apply(goog.result.combine, arguments),
      // The combined result never ERRORs
      function(res) {
        var results = /** @type {Array} */ (res.getValue());
        if (goog.array.every(results, resolvedSuccessfully)) {
          combinedResult.setValue(results);
        } else {
          combinedResult.setError(results);
        }
      });

  return combinedResult;
};
