/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Simple freelist.
 *
 * An anterative to goog.structs.SimplePool, it imposes the requirement that the
 * objects in the list contain a "next" property that can be used to maintain
 * the pool.
 */
goog.module('goog.async.FreeList');
goog.module.declareLegacyNamespace();

/** @template ITEM */
class FreeList {
  /**
   * @param {function():ITEM} create
   * @param {function(ITEM):void} reset
   * @param {number} limit
   */
  constructor(create, reset, limit) {
    /** @private @const {number} */
    this.limit_ = limit;
    /** @private @const {function()} */
    this.create_ = create;
    /** @private @const {function(ITEM):void} */
    this.reset_ = reset;

    /** @private {number} */
    this.occupants_ = 0;
    /** @private {ITEM} */
    this.head_ = null;
  }

  /** @return {ITEM} */
  get() {
    let item;
    if (this.occupants_ > 0) {
      this.occupants_--;
      item = this.head_;
      this.head_ = item.next;
      item.next = null;
    } else {
      item = this.create_();
    }
    return item;
  }

  /** @param {ITEM} item An item available for possible future reuse. */
  put(item) {
    this.reset_(item);
    if (this.occupants_ < this.limit_) {
      this.occupants_++;
      item.next = this.head_;
      this.head_ = item;
    }
  }

  /**
   * Visible for testing.
   * @return {number}
   * @package
   */
  occupants() {
    return this.occupants_;
  }
}

exports = FreeList;
