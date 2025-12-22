/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('goog.async.WorkQueue');
goog.module.declareLegacyNamespace();

const FreeList = goog.require('goog.async.FreeList');
const {assert} = goog.require('goog.asserts');

// TODO(johnlenz): generalize the WorkQueue if this is used by more
// than goog.async.run.


/**
 * A low GC workqueue. The key elements of this design:
 *   - avoids the need for goog.bind or equivalent by carrying scope
 *   - avoids the need for array reallocation by using a linked list
 *   - minimizes work entry objects allocation by recycling objects
 * @final
 * @struct
 */
class WorkQueue {
  constructor() {
    this.workHead_ = null;
    this.workTail_ = null;
  }

  /**
   * @param {function()} fn
   * @param {Object|null|undefined} scope
   */
  add(fn, scope) {
    const item = this.getUnusedItem_();
    item.set(fn, scope);

    if (this.workTail_) {
      this.workTail_.next = item;
      this.workTail_ = item;
    } else {
      assert(!this.workHead_);
      this.workHead_ = item;
      this.workTail_ = item;
    }
  }

  /**
   * @return {?WorkItem}
   */
  remove() {
    let item = null;

    if (this.workHead_) {
      item = this.workHead_;
      this.workHead_ = this.workHead_.next;
      if (!this.workHead_) {
        this.workTail_ = null;
      }
      item.next = null;
    }
    return item;
  }

  /**
   * @param {!WorkItem} item
   */
  returnUnused(item) {
    WorkQueue.freelist_.put(item);
  }

  /**
   * @return {!WorkItem}
   * @private
   */
  getUnusedItem_() {
    return WorkQueue.freelist_.get();
  }
}

/** @define {number} The maximum number of entries to keep for recycling. */
WorkQueue.DEFAULT_MAX_UNUSED =
    goog.define('goog.async.WorkQueue.DEFAULT_MAX_UNUSED', 100);

/** @const @private {!FreeList<!WorkItem>} */
WorkQueue.freelist_ = new FreeList(
    () => new WorkItem(), item => item.reset(), WorkQueue.DEFAULT_MAX_UNUSED);

/**
 * @final
 * @struct
 */
class WorkItem {
  constructor() {
    /** @type {?function()} */
    this.fn = null;
    /** @type {?Object|null|undefined} */
    this.scope = null;
    /** @type {?WorkItem} */
    this.next = null;
  }

  /**
   * @param {function()} fn
   * @param {Object|null|undefined} scope
   */
  set(fn, scope) {
    this.fn = fn;
    this.scope = scope;
    this.next = null;
  }

  /** Reset the work item so they don't prevent GC before reuse */
  reset() {
    this.fn = null;
    this.scope = null;
    this.next = null;
  }
}

exports = WorkQueue;
