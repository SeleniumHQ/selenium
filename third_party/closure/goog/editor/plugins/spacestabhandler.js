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
 * @fileoverview Editor plugin to handle tab keys not in lists to add 4 spaces.
 *
 * @author robbyw@google.com (Robby Walker)
 * @author ajp@google.com (Andy Perelson)
 */

goog.provide('goog.editor.plugins.SpacesTabHandler');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.editor.plugins.AbstractTabHandler');
goog.require('goog.editor.range');



/**
 * Plugin to handle tab keys when not in lists to add 4 spaces.
 * @constructor
 * @extends {goog.editor.plugins.AbstractTabHandler}
 * @final
 */
goog.editor.plugins.SpacesTabHandler = function() {
  goog.editor.plugins.AbstractTabHandler.call(this);
};
goog.inherits(goog.editor.plugins.SpacesTabHandler,
    goog.editor.plugins.AbstractTabHandler);


/** @override */
goog.editor.plugins.SpacesTabHandler.prototype.getTrogClassId = function() {
  return 'SpacesTabHandler';
};


/** @override */
goog.editor.plugins.SpacesTabHandler.prototype.handleTabKey = function(e) {
  var dh = this.getFieldDomHelper();
  var range = this.getFieldObject().getRange();
  if (!goog.editor.range.intersectsTag(range, goog.dom.TagName.LI)) {
    // In the shift + tab case we don't want to insert spaces, but we don't
    // want focus to move either so skip the spacing logic and just prevent
    // default.
    if (!e.shiftKey) {
      // Not in a list but we want to insert 4 spaces.

      // Stop change events while we make multiple field changes.
      this.getFieldObject().stopChangeEvents(true, true);

      // Inserting nodes below completely messes up the selection, doing the
      // deletion here before it's messed up. Only delete if text is selected,
      // otherwise we would remove the character to the right of the cursor.
      if (!range.isCollapsed()) {
        dh.getDocument().execCommand('delete', false, null);
        // Safari 3 has some DOM exceptions if we don't reget the range here,
        // doing it all the time just to be safe.
        range = this.getFieldObject().getRange();
      }

      // Emulate tab by removing selection and inserting 4 spaces
      // Two breaking spaces in a row can be collapsed by the browser into one
      // space. Inserting the string below because it is guaranteed to never
      // collapse to less than four spaces, regardless of what is adjacent to
      // the inserted spaces. This might make line wrapping slightly
      // sub-optimal around a grouping of non-breaking spaces.
      var elem = dh.createDom('span', null, '\u00a0\u00a0 \u00a0');
      elem = range.insertNode(elem, false);

      this.getFieldObject().dispatchChange();
      goog.editor.range.placeCursorNextTo(elem, false);
      this.getFieldObject().dispatchSelectionChangeEvent();
    }

    e.preventDefault();
    return true;
  }

  return false;
};

