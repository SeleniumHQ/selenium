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
 * @fileoverview Adds a keyboard shortcut for the link command.
 *
 */

goog.provide('goog.editor.plugins.LinkShortcutPlugin');

goog.require('goog.editor.Command');
goog.require('goog.editor.Plugin');



/**
 * Plugin to add a keyboard shortcut for the link command
 * @constructor
 * @extends {goog.editor.Plugin}
 * @final
 */
goog.editor.plugins.LinkShortcutPlugin = function() {
  goog.editor.plugins.LinkShortcutPlugin.base(this, 'constructor');
};
goog.inherits(goog.editor.plugins.LinkShortcutPlugin, goog.editor.Plugin);


/** @override */
goog.editor.plugins.LinkShortcutPlugin.prototype.getTrogClassId = function() {
  return 'LinkShortcutPlugin';
};


/**
 * @override
 */
goog.editor.plugins.LinkShortcutPlugin.prototype.handleKeyboardShortcut =
    function(e, key, isModifierPressed) {
  var command;
  if (isModifierPressed && key == 'k' && !e.shiftKey) {
    var link = /** @type {goog.editor.Link?} */ (
        this.getFieldObject().execCommand(goog.editor.Command.LINK));
    if (link) {
      link.finishLinkCreation(this.getFieldObject());
    }
    return true;
  }

  return false;
};

