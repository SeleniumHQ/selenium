// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview This module simplifies testing code which uses many stateful
 * singletons. The {@link goog.testing.singleton.addSingletonGetter} function
 * adds a static {@code getInstance} method to the class, which in addition to
 * creating and returning a singleton instance, registers it in a global
 * repository. This way the effect of all {@code getInstance} calls can be
 * simply reset in {@code tearDown} without knowing what singletons were
 * instantiated in the tests.
 *
 * Usage:
 * <ol>
 *   <li>Load {@code base.js}.
 *   <li>Load {@code goog.testing.singleton}. It overrides
 *       {@link goog.addSingletonGetter} by
 *       {@link goog.testing.addSingletonGetter}.
 *   <li>Load the code to test.
 *   <li>Call {@link goog.testing.singleton.reset} in the {@code tearDown}.
 * </ol>
 *
*
 */

goog.provide('goog.testing.singleton');

goog.require('goog.array');


/**
 * List of all singleton classes for which the instance has been created.
 * @type {Array.<!Function>}
 * @private
 */
goog.testing.singletons_ = [];


/**
 * Adds a {@code getInstance} static method to the given class which in addition
 * to always returning the same instance object, registers the constructor in a
 * global array.
 * @param {!Function} ctor The constructor for the class to add the static
 *     method to.
 */
goog.testing.singleton.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if (!ctor.instance_) {
      ctor.instance_ = new ctor();
      goog.testing.singletons_.push(ctor);
    }
    return ctor.instance_;
  };
};


/**
 * Deletes all singleton instances, so {@code getInstance} will return a new
 * instance on next call.
 */
goog.testing.singleton.reset = function() {
  goog.array.forEach(goog.testing.singletons_, function(ctor) {
    delete ctor.instance_;
  });
  goog.array.clear(goog.testing.singletons_);
};


/**
 * Overrides {@code goog.addSingletonGetter} in {@code base.js}.
 */
goog.addSingletonGetter = goog.testing.singleton.addSingletonGetter;
