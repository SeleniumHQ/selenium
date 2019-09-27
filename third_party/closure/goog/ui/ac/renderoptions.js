// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Options for rendering matches.
 *
 */

goog.provide('goog.ui.ac.RenderOptions');



/**
 * A simple class that contains options for rendering a set of autocomplete
 * matches.  Used as an optional argument in the callback from the matcher.
 * @constructor
 */
goog.ui.ac.RenderOptions = function() {};


/**
 * Whether the current highlighting is to be preserved when displaying the new
 * set of matches.
 * @type {boolean}
 * @private
 */
goog.ui.ac.RenderOptions.prototype.preserveHilited_ = false;


/**
 * Whether the first match is to be highlighted.  When undefined the autoHilite
 * flag of the autocomplete is used.
 * @type {boolean|undefined}
 * @private
 */
goog.ui.ac.RenderOptions.prototype.autoHilite_;


/**
 * @param {boolean} flag The new value for the preserveHilited_ flag.
 */
goog.ui.ac.RenderOptions.prototype.setPreserveHilited = function(flag) {
  this.preserveHilited_ = flag;
};


/**
 * @return {boolean} The value of the preserveHilited_ flag.
 */
goog.ui.ac.RenderOptions.prototype.getPreserveHilited = function() {
  return this.preserveHilited_;
};


/**
 * @param {boolean} flag The new value for the autoHilite_ flag.
 */
goog.ui.ac.RenderOptions.prototype.setAutoHilite = function(flag) {
  this.autoHilite_ = flag;
};


/**
 * @return {boolean|undefined} The value of the autoHilite_ flag.
 */
goog.ui.ac.RenderOptions.prototype.getAutoHilite = function() {
  return this.autoHilite_;
};
