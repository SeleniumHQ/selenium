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
 * @fileoverview Provides data persistence using HTML5 local storage
 * mechanism. Local storage must be available under window.localStorage,
 * see: http://www.w3.org/TR/webstorage/#the-localstorage-attribute.
 *
 */

goog.provide('goog.storage.mechanism.HTML5LocalStorage');

goog.require('goog.storage.mechanism.HTML5WebStorage');



/**
 * Provides a storage mechanism that uses HTML5 local storage.
 *
 * @constructor
 * @extends {goog.storage.mechanism.HTML5WebStorage}
 */
goog.storage.mechanism.HTML5LocalStorage = function() {
  var storage = null;
  /** @preserveTry */
  try {
    // May throw an exception in cases where the local storage object
    // is visible but access to it is disabled.
    storage = window.localStorage || null;
  } catch (e) {}
  goog.base(this, storage);
};
goog.inherits(goog.storage.mechanism.HTML5LocalStorage,
              goog.storage.mechanism.HTML5WebStorage);
