// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
// All Rights Reserved

/**
 * @fileoverview Plugin for generating emoticons.
 *
 * @author nicksantos@google.com (Nick Santos)
 */

goog.provide('goog.editor.plugins.Emoticons');

goog.require('goog.dom.TagName');
goog.require('goog.editor.Plugin');
goog.require('goog.editor.range');
goog.require('goog.functions');
goog.require('goog.ui.emoji.Emoji');
goog.require('goog.userAgent');



/**
 * Plugin for generating emoticons.
 *
 * @constructor
 * @extends {goog.editor.Plugin}
 */
goog.editor.plugins.Emoticons = function() {
  goog.base(this);
};
goog.inherits(goog.editor.plugins.Emoticons, goog.editor.Plugin);


/** The emoticon command. */
goog.editor.plugins.Emoticons.COMMAND = '+emoticon';


/** @override */
goog.editor.plugins.Emoticons.prototype.getTrogClassId =
    goog.functions.constant(goog.editor.plugins.Emoticons.COMMAND);


/** @override */
goog.editor.plugins.Emoticons.prototype.isSupportedCommand = function(
    command) {
  return command == goog.editor.plugins.Emoticons.COMMAND;
};


/**
 * Inserts an emoticon into the editor at the cursor location. Places the
 * cursor to the right of the inserted emoticon.
 * @param {string} command Command to execute.
 * @param {*=} opt_arg Emoji to insert.
 * @return {Object|undefined} The result of the command.
 * @override
 */
goog.editor.plugins.Emoticons.prototype.execCommandInternal = function(
    command, opt_arg) {
  var emoji = /** @type {goog.ui.emoji.Emoji} */ (opt_arg);
  var dom = this.getFieldDomHelper();
  var img = dom.createDom(goog.dom.TagName.IMG, {
    'src': emoji.getUrl(),
    'style': 'margin:0 0.2ex;vertical-align:middle'
  });
  img.setAttribute(goog.ui.emoji.Emoji.ATTRIBUTE, emoji.getId());

  this.getFieldObject().getRange().replaceContentsWithNode(img);

  // IE8 does the right thing with the cursor, and has a js error when we try
  // to place the cursor manually.
  // IE9 loses the cursor when the window is focused, so focus first.
  if (!goog.userAgent.IE || goog.userAgent.isDocumentModeOrHigher(9)) {
    this.getFieldObject().focus();
    goog.editor.range.placeCursorNextTo(img, false);
  }
};
