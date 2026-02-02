/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */
goog.module('goog.promise.Resolver');
goog.module.declareLegacyNamespace();

const GoogPromise = goog.requireType('goog.Promise');
const Thenable = goog.requireType('goog.Thenable');

/**
 * Resolver interface for promises. The resolver is a convenience interface that
 * bundles the promise and its associated resolve and reject functions together,
 * for cases where the resolver needs to be persisted internally.
 * @template TYPE
 * @interface
 */
class Resolver {
  constructor() {
    /**
     * The promise that created this resolver.
     * @type {!GoogPromise<TYPE>}
     */
    this.promise;
    /**
     * Resolves this resolver with the specified value.
     * @type {function((TYPE|GoogPromise<TYPE>|Promise<TYPE>|IThenable|Thenable)=)}
     */
    this.resolve;
    /**
     * Rejects this resolver with the specified reason.
     * @type {function(*=): void}
     */
    this.reject;
  }
}

exports = Resolver;
