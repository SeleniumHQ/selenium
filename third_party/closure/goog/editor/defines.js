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
 * @fileoverview Text editor constants for compile time feature selection.
 *
 */

goog.provide('goog.editor.defines');


/**
 * @define {boolean} Use contentEditable in FF.
 * There are a number of known bugs when the only content in your field is
 * inline (e.g. just text, no block elements):
 * -indent is a noop and then DOMSubtreeModified events stop firing until
 *    the structure of the DOM is changed (e.g. make something bold).
 * -inserting lists inserts just a NBSP, no list!
 * Once those two are fixed, we should have one client guinea pig it and put
 * it through a QA run. If we can file the bugs with Mozilla, there's a chance
 * they'll fix them for a dot release of Firefox 3.
 */
goog.define('goog.editor.defines.USE_CONTENTEDITABLE_IN_FIREFOX_3', false);
