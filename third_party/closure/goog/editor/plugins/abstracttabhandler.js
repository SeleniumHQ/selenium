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
 * @fileoverview Abstract Editor plugin class to handle tab keys.  Has one
 * abstract method which should be overriden to handle a tab key press.
 *
 * @author robbyw@google.com (Robby Walker)
*
 */

goog.provide('goog.editor.plugins.AbstractTabHandler');

goog.require('goog.editor.Plugin');
goog.require('goog.events.KeyCodes');



/**
 * Plugin to handle tab keys. Specific tab behavior defined by subclasses.
 *
 * @constructor
 * @extends {goog.editor.Plugin}
 */
goog.editor.plugins.AbstractTabHandler = function() {
  goog.editor.Plugin.call(this);
};
goog.inherits(goog.editor.plugins.AbstractTabHandler, goog.editor.Plugin);


/** @inheritDoc */
goog.editor.plugins.AbstractTabHandler.prototype.getTrogClassId =
    goog.abstractMethod;


/** @inheritDoc */
goog.editor.plugins.AbstractTabHandler.prototype.handleKeyboardShortcut =
    function(e, key, isModifierPressed) {
  // If a dialog doesn't have selectable field, Moz grabs the event and
  // performs actions in editor window. This solves that problem and allows
  // the event to be passed on to proper handlers.
  if (goog.userAgent.GECKO && this.fieldObject.inModalMode()) {
    return false;
  }

  // Don't handle Ctrl+Tab since the user is most likely trying to switch
  // browser tabs. See bug 1305086.
  // FF3 on Mac sends Ctrl-Tab to trogedit and we end up inserting a tab, but
  // then it also switches the tabs. See bug 1511681. Note that we don't use
  // isModifierPressed here since isModifierPressed is true only if metaKey
  // is true on Mac.
  if (e.keyCode == goog.events.KeyCodes.TAB && !e.metaKey && !e.ctrlKey) {
    return this.handleTabKey(e);
  }

  return false;
};


/**
 * Handle a tab key press.
 * @param {goog.events.Event} e The key event.
 * @return {boolean} Whether this event was handled by this plugin.
 * @protected
 */
goog.editor.plugins.AbstractTabHandler.prototype.handleTabKey =
    goog.abstractMethod;
