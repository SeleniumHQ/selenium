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
 * @fileoverview Handles applying header styles to text.
 *
 */

goog.provide('goog.editor.plugins.HeaderFormatter');

goog.require('goog.editor.Command');
goog.require('goog.editor.Plugin');
goog.require('goog.userAgent');



/**
 * Applies header styles to text.
 * @constructor
 * @extends {goog.editor.Plugin}
 */
goog.editor.plugins.HeaderFormatter = function() {
  goog.editor.Plugin.call(this);
};
goog.inherits(goog.editor.plugins.HeaderFormatter, goog.editor.Plugin);


/** @override */
goog.editor.plugins.HeaderFormatter.prototype.getTrogClassId = function() {
  return 'HeaderFormatter';
};

// TODO(user):  Move execCommand functionality from basictextformatter into
// here for headers.  I'm not doing this now because it depends on the
// switch statements in basictextformatter and we'll need to abstract that out
// in order to seperate out any of the functions from basictextformatter.


/**
 * Commands that can be passed as the optional argument to execCommand.
 * @enum {string}
 */
goog.editor.plugins.HeaderFormatter.HEADER_COMMAND = {
  H1: 'H1',
  H2: 'H2',
  H3: 'H3',
  H4: 'H4'
};


/**
 * @override
 */
goog.editor.plugins.HeaderFormatter.prototype.handleKeyboardShortcut = function(
    e, key, isModifierPressed) {
  if (!isModifierPressed) {
    return false;
  }
  var command = null;
  switch (key) {
    case '1':
      command = goog.editor.plugins.HeaderFormatter.HEADER_COMMAND.H1;
      break;
    case '2':
      command = goog.editor.plugins.HeaderFormatter.HEADER_COMMAND.H2;
      break;
    case '3':
      command = goog.editor.plugins.HeaderFormatter.HEADER_COMMAND.H3;
      break;
    case '4':
      command = goog.editor.plugins.HeaderFormatter.HEADER_COMMAND.H4;
      break;
  }
  if (command) {
    this.getFieldObject().execCommand(
        goog.editor.Command.FORMAT_BLOCK, command);
    // Prevent default isn't enough to cancel tab navigation in FF.
    if (goog.userAgent.GECKO) {
      e.stopPropagation();
    }
    return true;
  }
  return false;
};
