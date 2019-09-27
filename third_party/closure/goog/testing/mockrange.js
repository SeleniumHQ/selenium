// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview LooseMock of goog.dom.AbstractRange.
 *
 */

goog.setTestOnly('goog.testing.MockRange');
goog.provide('goog.testing.MockRange');

goog.require('goog.dom.AbstractRange');
goog.require('goog.testing.LooseMock');



/**
 * LooseMock of goog.dom.AbstractRange. Useful because the mock framework cannot
 * simply create a mock out of an abstract class, and cannot create a mock out
 * of classes that implements __iterator__ because it relies on the default
 * behavior of iterating through all of an object's properties.
 * @constructor
 * @extends {goog.testing.LooseMock}
 * @final
 */
goog.testing.MockRange = function() {
  goog.testing.LooseMock.call(this, goog.testing.MockRange.ConcreteRange_);
};
goog.inherits(goog.testing.MockRange, goog.testing.LooseMock);


// *** Private helper class ************************************************* //



/**
 * Concrete subclass of goog.dom.AbstractRange that simply sets the abstract
 * method __iterator__ to undefined so that javascript defaults to iterating
 * through all of the object's properties.
 * @constructor
 * @extends {goog.dom.AbstractRange}
 * @private
 */
goog.testing.MockRange.ConcreteRange_ = function() {
  goog.dom.AbstractRange.call(this);
};
goog.inherits(goog.testing.MockRange.ConcreteRange_, goog.dom.AbstractRange);


/**
 * Undefine the iterator so the mock framework can loop through this class'
 * properties.
 * @override
 */
goog.testing.MockRange.ConcreteRange_.prototype.__iterator__ =
    // This isn't really type-safe.
    /** @type {?} */ (undefined);
