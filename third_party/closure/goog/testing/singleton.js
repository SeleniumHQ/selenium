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
 * @fileoverview This module simplifies testing code which uses stateful
 * singletons. {@code goog.testing.singleton.reset} resets all instances, so
 * next time when {@code getInstance} is called, a new instance is created.
 * It's recommended to reset the singletons in {@code tearDown} to prevent
 * interference between subsequent tests.
 *
 * The {@code goog.testing.singleton} functions expect that the goog.DEBUG flag
 * is enabled, and the tests are either uncompiled or compiled without renaming.
 *
 */

goog.setTestOnly('goog.testing.singleton');
goog.provide('goog.testing.singleton');


/**
 * Deletes all singleton instances, so {@code getInstance} will return a new
 * instance on next call.
 */
goog.testing.singleton.reset = function() {
  var singletons = goog.getObjectByName('goog.instantiatedSingletons_');
  var ctor;
  while (ctor = singletons.pop()) {
    delete ctor.instance_;
  }
};


/**
 * @deprecated Please use {@code goog.addSingletonGetter}.
 */
goog.testing.singleton.addSingletonGetter = goog.addSingletonGetter;
