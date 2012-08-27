// Copyright 2012 Selenium committers
// Copyright 2012 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Opera specific atoms.
 */

goog.provide("webdriver.opera");

/**
 * Moves the caret position of an INPUT related field, roughly
 * matching element.value == "text" || "textarea" to the end of the
 * field.  It will not focus the element, but when a focus is later
 * triggered, it will appear at the end.
 *
 * When a TEXTAREA element is focused it returns the cursor to the
 * last position was at, or places it last.  INPUT @type="text" (or
 * any other textual input element) places the caret at the beginning.
 * Because of this we are forced to move the caret to the end of the
 * input field.  We do this by setting the selection range through
 * JavaScript, which should move the cursor to the end of the field
 * upon the next focus event.
 *
 * @param {!Element} element the element in which to move the caret
 */
webdriver.opera.moveCaretToEnd = function(element) {
    element.setSelectionRange(element.value.length, element.value.length);
};
