// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Provides data persistence using HTML5 session storage
 * mechanism. Session storage must be available under window.sessionStorage,
 * see: http://www.w3.org/TR/webstorage/#the-sessionstorage-attribute.
 *
 */

goog.provide('goog.storage.mechanism.HTML5SessionStorage');

goog.require('goog.storage.mechanism.HTML5WebStorage');



/**
 * Provides a storage mechanism that uses HTML5 session storage.
 *
 * @constructor
 * @struct
 * @extends {goog.storage.mechanism.HTML5WebStorage}
 */
goog.storage.mechanism.HTML5SessionStorage = function() {
  var storage = null;
  /** @preserveTry */
  try {
    // May throw an exception in cases where the session storage object is
    // visible but access to it is disabled. For example, accessing the file
    // in local mode in Firefox throws 'Operation is not supported' exception.
    storage = window.sessionStorage || null;
  } catch (e) {
  }
  goog.storage.mechanism.HTML5SessionStorage.base(this, 'constructor', storage);
};
goog.inherits(
    goog.storage.mechanism.HTML5SessionStorage,
    goog.storage.mechanism.HTML5WebStorage);
