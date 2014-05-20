// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.labs.Promise');
goog.provide('goog.labs.Resolver');

goog.require('goog.Promise');
goog.require('goog.Thenable');
goog.require('goog.promise.Resolver');



/**
 * Alias for the {@code goog.Promise} class. Closure Promises were developed
 * under the temporary namespace {@code goog.labs.Promise}. This alias will be
 * removed once existing users have had a chance to migrate to the new name.
 *
 * @see goog.Promise
 *
 * @deprecated Use goog.Promise instead.
 * @param {function(
 *             this:RESOLVER_CONTEXT,
 *             function((TYPE|IThenable.<TYPE>|Thenable)),
 *             function(*)): void} resolver
 * @param {RESOLVER_CONTEXT=} opt_context
 * @constructor
 * @struct
 * @final
 * @implements {goog.Thenable.<TYPE>}
 * @template TYPE,RESOLVER_CONTEXT
 */
goog.labs.Promise = goog.Promise;



/**
 * Alias for the {@code goog.promise.Resolver} interface. This alias will be
 * removed once existing users have had a chance to migrate to the new name.
 *
 * @deprecated Use goog.promise.Resolver instead.
 * @interface
 * @template TYPE
 */
goog.labs.Resolver = goog.promise.Resolver;
