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
 * @fileoverview An implementation of {@code Observable} that can be
 * used as base class or composed into another class that wants to
 * implement {@code Observable}.
 */

goog.provide('goog.labs.observe.SimpleObservable');

goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.labs.observe.Notice');
goog.require('goog.labs.observe.Observable');
goog.require('goog.labs.observe.Observer');
goog.require('goog.object');



/**
 * A simple implementation of {@code goog.labs.observe.Observable} that can
 * be used as a standalone observable or as a base class for other
 * observable object.
 *
 * When another class wants to implement observable without extending
 * {@code SimpleObservable}, they can create an instance of
 * {@code SimpleObservable}, specifying {@code opt_actualObservable},
 * and delegate to the instance. Here is a trivial example:
 *
 * <pre>
 *   ClassA = function() {
 *     goog.base(this);
 *     this.observable_ = new SimpleObservable(this);
 *     this.registerDisposable(this.observable_);
 *   };
 *   goog.inherits(ClassA, goog.Disposable);
 *
 *   ClassA.prototype.observe = function(observer) {
 *     this.observable_.observe(observer);
 *   };
 *
 *   ClassA.prototype.unobserve = function(observer) {
 *     this.observable_.unobserve(observer);
 *   };
 *
 *   ClassA.prototype.notify = function(opt_data) {
 *     this.observable_.notify(opt_data);
 *   };
 * </pre>
 *
 * @param {!goog.labs.observe.Observable=} opt_actualObservable
 *     Optional observable object. Defaults to 'this'. When used as
 *     base class, the parameter need not be given. It is only useful
 *     when using this class to implement implement {@code Observable}
 *     interface on another object, see example above.
 * @constructor
 * @implements {goog.labs.observe.Observable}
 * @extends {goog.Disposable}
 */
goog.labs.observe.SimpleObservable = function(opt_actualObservable) {
  goog.base(this);

  /**
   * @type {!goog.labs.observe.Observable}
   * @private
   */
  this.actualObservable_ = opt_actualObservable || this;

  /**
   * Observers registered on this object.
   * @type {!Array.<!goog.labs.observe.Observer>}
   * @private
   */
  this.observers_ = [];
};
goog.inherits(goog.labs.observe.SimpleObservable, goog.Disposable);


/** @override */
goog.labs.observe.SimpleObservable.prototype.observe = function(observer) {
  goog.asserts.assert(!this.isDisposed());

  // Registers the (type, observer) only if it has not been previously
  // registered.
  var shouldRegisterObserver = !goog.array.some(this.observers_, goog.partial(
      goog.labs.observe.Observer.equals, observer));
  if (shouldRegisterObserver) {
    this.observers_.push(observer);
  }
  return shouldRegisterObserver;
};


/** @override */
goog.labs.observe.SimpleObservable.prototype.unobserve = function(observer) {
  goog.asserts.assert(!this.isDisposed());
  return goog.array.removeIf(this.observers_, goog.partial(
      goog.labs.observe.Observer.equals, observer));
};


/** @override */
goog.labs.observe.SimpleObservable.prototype.notify = function(opt_data) {
  goog.asserts.assert(!this.isDisposed());
  var notice = new goog.labs.observe.Notice(this.actualObservable_, opt_data);
  goog.array.forEach(
      goog.array.clone(this.observers_), function(observer) {
        observer.notify(notice);
      });
};


/** @override */
goog.labs.observe.SimpleObservable.prototype.disposeInternal = function() {
  this.observers_.length = 0;
};
