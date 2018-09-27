// Copyright 2005 Bob Ippolito. All Rights Reserved.
// Modifications Copyright 2009 The Closure Library Authors.
// All Rights Reserved.

/**
 * Portions of this code are from MochiKit, received by The Closure
 * Library Authors under the MIT license. All other code is Copyright
 * 2005-2009 The Closure Library Authors. All Rights Reserved.
 */

/**
 * @fileoverview Class for tracking multiple asynchronous operations and
 * handling the results. The DeferredList object here is patterned after the
 * DeferredList object in the Twisted python networking framework.
 *
 * Based on the MochiKit code.
 *
 * See: http://twistedmatrix.com/projects/core/documentation/howto/defer.html
 *
 * @author brenneman@google.com (Shawn Brenneman)
 */

goog.provide('goog.async.DeferredList');

goog.require('goog.async.Deferred');



/**
 * Constructs an object that waits on the results of multiple asynchronous
 * operations and marshals the results. It is itself a <code>Deferred</code>,
 * and may have an execution sequence of callback functions added to it. Each
 * <code>DeferredList</code> instance is single use and may be fired only once.
 *
 * The default behavior of a <code>DeferredList</code> is to wait for a success
 * or error result from every <code>Deferred</code> in its input list. Once
 * every result is available, the <code>DeferredList</code>'s execution sequence
 * is fired with a list of <code>[success, result]</code> array pairs, where
 * <code>success</code> is a boolean indicating whether <code>result</code> was
 * the product of a callback or errback. The list's completion criteria and
 * result list may be modified by setting one or more of the boolean options
 * documented below.
 *
 * <code>Deferred</code> instances passed into a <code>DeferredList</code> are
 * independent, and may have additional callbacks and errbacks added to their
 * execution sequences after they are passed as inputs to the list.
 *
 * @param {!Array<!goog.async.Deferred>} list An array of deferred results to
 *     wait for.
 * @param {boolean=} opt_fireOnOneCallback Whether to stop waiting as soon as
 *     one input completes successfully. In this case, the
 *     <code>DeferredList</code>'s callback chain will be called with a two
 *     element array, <code>[index, result]</code>, where <code>index</code>
 *     identifies which input <code>Deferred</code> produced the successful
 *     <code>result</code>.
 * @param {boolean=} opt_fireOnOneErrback Whether to stop waiting as soon as one
 *     input reports an error. The failing result is passed to the
 *     <code>DeferredList</code>'s errback sequence.
 * @param {boolean=} opt_consumeErrors When true, any errors fired by a
 *     <code>Deferred</code> in the input list will be captured and replaced
 *     with a succeeding null result. Any callbacks added to the
 *     <code>Deferred</code> after its use in the <code>DeferredList</code> will
 *     receive null instead of the error.
 * @param {Function=} opt_canceler A function that will be called if the
 *     <code>DeferredList</code> is canceled. @see goog.async.Deferred#cancel
 * @param {Object=} opt_defaultScope The default scope to invoke callbacks or
 *     errbacks in.
 * @constructor
 * @extends {goog.async.Deferred}
 */
goog.async.DeferredList = function(
    list, opt_fireOnOneCallback, opt_fireOnOneErrback, opt_consumeErrors,
    opt_canceler, opt_defaultScope) {

  goog.async.DeferredList.base(this, 'constructor',
      opt_canceler, opt_defaultScope);

  /**
   * The list of Deferred objects to wait for.
   * @const {!Array<!goog.async.Deferred>}
   * @private
   */
  this.list_ = list;

  /**
   * The stored return values of the Deferred objects.
   * @const {!Array}
   * @private
   */
  this.deferredResults_ = [];

  /**
   * Whether to fire on the first successful callback instead of waiting for
   * every Deferred to complete.
   * @const {boolean}
   * @private
   */
  this.fireOnOneCallback_ = !!opt_fireOnOneCallback;

  /**
   * Whether to fire on the first error result received instead of waiting for
   * every Deferred to complete.
   * @const {boolean}
   * @private
   */
  this.fireOnOneErrback_ = !!opt_fireOnOneErrback;

  /**
   * Whether to stop error propagation on the input Deferred objects. If the
   * DeferredList sees an error from one of the Deferred inputs, the error will
   * be captured, and the Deferred will be returned to success state with a null
   * return value.
   * @const {boolean}
   * @private
   */
  this.consumeErrors_ = !!opt_consumeErrors;

  /**
   * The number of input deferred objects that have fired.
   * @private {number}
   */
  this.numFinished_ = 0;

  for (var i = 0; i < list.length; i++) {
    var d = list[i];
    d.addCallbacks(goog.bind(this.handleCallback_, this, i, true),
                   goog.bind(this.handleCallback_, this, i, false));
  }

  if (list.length == 0 && !this.fireOnOneCallback_) {
    this.callback(this.deferredResults_);
  }
};
goog.inherits(goog.async.DeferredList, goog.async.Deferred);


/**
 * Registers the result from an input deferred callback or errback. The result
 * is returned and may be passed to additional handlers in the callback chain.
 *
 * @param {number} index The index of the firing deferred object in the input
 *     list.
 * @param {boolean} success Whether the result is from a callback or errback.
 * @param {*} result The result of the callback or errback.
 * @return {*} The result, to be handled by the next handler in the deferred's
 *     callback chain (if any). If consumeErrors is set, an error result is
 *     replaced with null.
 * @private
 */
goog.async.DeferredList.prototype.handleCallback_ = function(
    index, success, result) {

  this.numFinished_++;
  this.deferredResults_[index] = [success, result];

  if (!this.hasFired()) {
    if (this.fireOnOneCallback_ && success) {
      this.callback([index, result]);
    } else if (this.fireOnOneErrback_ && !success) {
      this.errback(result);
    } else if (this.numFinished_ == this.list_.length) {
      this.callback(this.deferredResults_);
    }
  }

  if (this.consumeErrors_ && !success) {
    result = null;
  }

  return result;
};


/** @override */
goog.async.DeferredList.prototype.errback = function(res) {
  goog.async.DeferredList.base(this, 'errback', res);

  // On error, cancel any pending requests.
  for (var i = 0; i < this.list_.length; i++) {
    this.list_[i].cancel();
  }
};


/**
 * Creates a <code>DeferredList</code> that gathers results from multiple
 * <code>Deferred</code> inputs. If all inputs succeed, the callback is fired
 * with the list of results as a flat array. If any input fails, the list's
 * errback is fired immediately with the offending error, and all other pending
 * inputs are canceled.
 *
 * @param {!Array<!goog.async.Deferred>} list The list of <code>Deferred</code>
 *     inputs to wait for.
 * @return {!goog.async.Deferred} The deferred list of results from the inputs
 *     if they all succeed, or the error result of the first input to fail.
 */
goog.async.DeferredList.gatherResults = function(list) {
  return new goog.async.DeferredList(list, false, true).
      addCallback(function(results) {
        var output = [];
        for (var i = 0; i < results.length; i++) {
          output[i] = results[i][1];
        }
        return output;
      });
};
