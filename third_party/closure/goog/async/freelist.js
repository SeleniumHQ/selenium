// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Simple freelist.
 *
 * An anterative to goog.structs.SimplePool, it imposes the requirement that the
 * objects in the list contain a "next" property that can be used to maintain
 * the pool.
 */

goog.provide('goog.async.FreeList');


/**
 * @template ITEM
 */
goog.async.FreeList = goog.defineClass(null, {
  /**
   * @param {function():ITEM} create
   * @param {function(ITEM):void} reset
   * @param {number} limit
   */
  constructor: function(create, reset, limit) {
    /** @const {number} */
    this.limit_ = limit;
    /** @const {function()} */
    this.create_ = create;
    /** @const {function(ITEM):void} */
    this.reset_ = reset;

    /** @type {number} */
    this.occupants_ = 0;
    /** @type {ITEM} */
    this.head_ = null;
  },

  /**
   * @return {ITEM}
   */
  get: function() {
    var item;
    if (this.occupants_ > 0) {
      this.occupants_--;
      item = this.head_;
      this.head_ = item.next;
      item.next = null;
    } else {
      item = this.create_();
    }
    return item;
  },

  /**
   * @param {ITEM} item An item available for possible future reuse.
   */
  put: function(item) {
    this.reset_(item);
    if (this.occupants_ < this.limit_) {
      this.occupants_++;
      item.next = this.head_;
      this.head_ = item;
    }
  },

  /**
   * Visible for testing.
   * @package
   * @return {number}
   */
  occupants: function() { return this.occupants_; }
});
