/*
 * Copyright 2014 Samit Badle
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Partial implementation of promises
 * Loosely modeled on jQuery's Deferred
 */
function Deferred(ctor) {
  var that = this, state = Deferred.PENDING, done = [], fail = [], argsValue = null;

  function callAll(newState, callbacks, optionalArgs) {
    if (state !== Deferred.PENDING) {
      throw "Promise has been fulfilled";
    }
    state = newState;
    argsValue = optionalArgs;
    callbacks.forEach(function (callback) {
      if (callback) {
        callback.apply(that, optionalArgs);
      }
    }, that);
    return that;
  }

  this.state = function () {
    return state;
  };

  this.isPending = function () {
    return state === Deferred.PENDING;
  };

  this.isResolved = function () {
    return state === Deferred.RESOLVED;
  };

  this.isRejected = function () {
    return state === Deferred.REJECTED;
  };

  /**
   * Get the arguments to resolve or reject
   * @return {*} Returns null if pending or an arguments object containing the arguments passed to resolve or reject.
   */
  this.value = function () {
    return argsValue;
  };

  this.done = function (callback) {
    if (state === Deferred.RESOLVED) {
      //call immediately
      callback.apply(that, argsValue);
    } else {
      done.push(callback);
    }
    return that;
  };

  this.fail = function (callback) {
    if (state === Deferred.REJECTED) {
      callback.apply(that, argsValue);
    } else {
      fail.push(callback);
    }
    return that;
  };

  this.then = function (doneCallback, failCallback) {
    that.done(doneCallback);
    return that.fail(failCallback);
  };

  this.resolve = function (optionalArgs) {
    return callAll(Deferred.RESOLVED, done, arguments);
  };

  this.reject = function (optionalArgs) {
    return callAll(Deferred.REJECTED, fail, arguments);
  };

  /**
   * Use pipe to either chain deferred together or to filter/map the results
   * The working is simple. Calling pipe will create a new deferred (master). One of the callbacks will be called
   * when the top deferred is resolved or rejected along with the received arguments. If the return value of the
   * callback is a deferred, this chained deferred would determine the state and return of the master deferred.
   * If the return of the callback is not a deferred the results would simply be treated as filtered/mapped results.
   * If using for filtering / mapping the return value of the function can either be an array containing filtered results
   * for each arguments or a single non array value.
   * If you simply want to return the arguments, convert it to an array first using
   * Array.prototype.slice.call(arguments)
   * @param doneCallback
   * @param failCallback
   * @return {Deferred} a new Deferred which will chain or filter the result using the appropriate callback
   */
  this.pipe = function (doneCallback, failCallback) {
    return new Deferred(function (master) {
      if (doneCallback) {
        that.done(function () {
          var filter = doneCallback.apply(that, arguments);
          if (Deferred.isPromise(filter)) {
            filter.then(function () {
              master.resolve.apply(master, arguments);
            }, function () {
              master.reject.apply(master, arguments);
            });
          } else {
            if (Array.isArray(filter)) {
              master.resolve.apply(master, filter);
            } else {
              master.resolve.call(master, filter);
            }
          }
        });
      } else {
        that.done(function () {
          master.resolve.apply(master, arguments);
        });
      }
      if (failCallback) {
        that.fail(function () {
          var filter = failCallback.apply(that, arguments);
          if (Deferred.isPromise(filter)) {
            filter.then(function () {
              master.resolve.apply(master, arguments);
            }, function () {
              master.reject.apply(master, arguments);
            });
          } else {
            if (Array.isArray(filter)) {
              master.reject.apply(master, filter);
            } else {
              master.reject.call(master, filter);
            }
          }
        });
      } else {
        that.fail(function () {
          master.reject.apply(master, arguments);
        });
      }
    });
  };

  if (ctor) {
    ctor.call(this, this);
  }
}

Deferred.isPromise = function (object) {
  return object !== null && typeof object.then === 'function';
};

Deferred.PENDING = 'pending';
Deferred.RESOLVED = 'resolved';
Deferred.REJECTED = 'rejected';
