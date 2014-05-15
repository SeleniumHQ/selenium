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

goog.require('goog.array');
goog.require('goog.async.Deferred');



/**
 * Constructs an object that waits on the results of multiple asynchronous
 * operations and marshals the results. It is itself a <code>Deferred</code>,
 * and sends results to its registered callback chain. Each instance is single
 * use and may only fire once.
 *
 * Unless overridden by one of the options below, the <code>DeferredList</code>
 * will wait for a result from every input <code>Deferred</code>. The results
 * are stored in a list of two-element arrays as <code>[success, result]</code>,
 * where <code>success</code> is whether that result was from a callback or
 * errback. Once all results are available, the <code>DeferredList</code>'s
 * callback chain is invoked with the full result list.
 *
 * @param {!Array.<!goog.async.Deferred>} list An array of deferred objects to
 *     wait for.
 * @param {boolean=} opt_fireOnOneCallback Whether to stop waiting as soon as
 *     one input completes successfully. In this case, the
 *     <code>DeferredList</code>'s callback chain will be called with a two
 *     element array, <code>[index, result]</code>, where <code>index</code>
 *     identifies which input <code>Deferred</code> produced the
 *     <code>result</code>.
 * @param {boolean=} opt_fireOnOneErrback Whether to stop waiting as soon as one
 *     input reports an error. The error result is passed to the
 *     <code>DeferredList</code>'s error callback chain.
 * @param {boolean=} opt_consumeErrors When true, will stop propagation of the
 *     error callback chain for input deferred objects. If the failing deferred
 *     has a registered callback after this <code>DeferredList</code>, it will
 *     be called with null instead of an <code>Error</code>.
 * @param {Function=} opt_canceller A function that will be called if the
 *     deferred list is canceled.
 * @param {Object=} opt_defaultScope The default scope to call callbacks with.
 * @constructor
 * @extends {goog.async.Deferred}
 */
goog.async.DeferredList = function(list,
                                   opt_fireOnOneCallback,
                                   opt_fireOnOneErrback,
                                   opt_consumeErrors,
                                   opt_canceller,
                                   opt_defaultScope) {
  goog.async.Deferred.call(this, opt_canceller, opt_defaultScope);

  /**
   * The list of Deferred objects to wait for.
   * @type {!Array.<!goog.async.Deferred>}
   * @private
   */
  this.list_ = list;

  /**
   * The stored return values of the Deferred objects.
   * @type {!Array}
   * @private
   */
  this.deferredResults_ = [];

  /**
   * Whether to fire on the first successful callback instead of waiting for
   * every Deferred to complete.
   * @type {boolean}
   * @private
   */
  this.fireOnOneCallback_ = !!opt_fireOnOneCallback;

  /**
   * Whether to fire on the first error result received instead of waiting for
   * every Deferred to complete.
   * @type {boolean}
   * @private
   */
  this.fireOnOneErrback_ = !!opt_fireOnOneErrback;

  /**
   * Whether to stop error propagation on the input Deferred objects. If the
   * DeferredList sees an error from one of the Deferred inputs, the error will
   * be captured, and the Deferred will be returned to success state with a null
   * return value.
   * @type {boolean}
   * @private
   */
  this.consumeErrors_ = !!opt_consumeErrors;

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
 * The number of input deferred objects that have fired.
 * @type {number}
 * @private
 */
goog.async.DeferredList.prototype.numFinished_ = 0;


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
goog.async.DeferredList.prototype.handleCallback_ = function(index,
                                                             success,
                                                             result) {
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


/** @inheritDoc */
goog.async.DeferredList.prototype.errback = function(res) {
  goog.async.DeferredList.superClass_.errback.call(this, res);
  // On error, cancel any pending requests.
  goog.array.forEach(this.list_, function(item) {
    item.cancel();
  });
};


/**
 * Creates a <code>DeferredList</code> that gathers results from multiple
 * <code>Deferred</code> inputs. If all inputs succeed, the callback is fired
 * with the list of results as a flat array. If any input fails, the errback is
 * fired with the error.
 *
 * @param {!Array.<!goog.async.Deferred>} list The list of deferred objects to
 *     wait for.
 * @return {!goog.async.DeferredList} A new deferred list.
 */
goog.async.DeferredList.gatherResults = function(list) {
  var d = new goog.async.DeferredList(list, false, true);

  d.addCallback(function(results) {
    return goog.array.map(results, function(res) {
      return res[1];
    });
  });

  return d;
};
