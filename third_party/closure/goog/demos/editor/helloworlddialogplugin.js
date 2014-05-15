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
 * @fileoverview An example of how to write a dialog plugin.
 *
 */

goog.provide('goog.demos.editor.HelloWorldDialogPlugin');
goog.provide('goog.demos.editor.HelloWorldDialogPlugin.Command');

goog.require('goog.demos.editor.HelloWorldDialog');
goog.require('goog.dom.TagName');
goog.require('goog.editor.plugins.AbstractDialogPlugin');
goog.require('goog.editor.range');
goog.require('goog.functions');
goog.require('goog.ui.editor.AbstractDialog');


// *** Public interface ***************************************************** //



/**
 * A plugin that opens the hello world dialog.
 * @constructor
 * @extends {goog.editor.plugins.AbstractDialogPlugin}
 */
goog.demos.editor.HelloWorldDialogPlugin = function() {
  goog.editor.plugins.AbstractDialogPlugin.call(this,
      goog.demos.editor.HelloWorldDialogPlugin.Command.HELLO_WORLD_DIALOG);
};
goog.inherits(goog.demos.editor.HelloWorldDialogPlugin,
              goog.editor.plugins.AbstractDialogPlugin);


/**
 * Commands implemented by this plugin.
 * @enum {string}
 */
goog.demos.editor.HelloWorldDialogPlugin.Command = {
  HELLO_WORLD_DIALOG: 'helloWorldDialog'
};


/** @override */
goog.demos.editor.HelloWorldDialogPlugin.prototype.getTrogClassId =
    goog.functions.constant('HelloWorldDialog');


// *** Protected interface ************************************************** //


/**
 * Creates a new instance of the dialog and registers for the relevant events.
 * @param {goog.dom.DomHelper} dialogDomHelper The dom helper to be used to
 *     create the dialog.
 * @return {goog.demos.editor.HelloWorldDialog} The dialog.
 * @override
 * @protected
 */
goog.demos.editor.HelloWorldDialogPlugin.prototype.createDialog = function(
    dialogDomHelper) {
  var dialog = new goog.demos.editor.HelloWorldDialog(dialogDomHelper);
  dialog.addEventListener(goog.ui.editor.AbstractDialog.EventType.OK,
                          this.handleOk_,
                          false,
                          this);
  return dialog;
};


// *** Private implementation *********************************************** //


/**
 * Handles the OK event from the dialog by inserting the hello world message
 * into the field.
 * @param {goog.demos.editor.HelloWorldDialog.OkEvent} e OK event object.
 * @private
 */
goog.demos.editor.HelloWorldDialogPlugin.prototype.handleOk_ = function(e) {
  // First restore the selection so we can manipulate the field's content
  // according to what was selected.
  this.restoreOriginalSelection();

  // Notify listeners that the field's contents are about to change.
  this.getFieldObject().dispatchBeforeChange();

  // Now we can clear out what was previously selected (if anything).
  var range = this.getFieldObject().getRange();
  range.removeContents();
  // And replace it with a span containing our hello world message.
  var createdNode = this.getFieldDomHelper().createDom(goog.dom.TagName.SPAN,
                                                       null,
                                                       e.message);
  createdNode = range.insertNode(createdNode, false);
  // Place the cursor at the end of the new text node (false == to the right).
  goog.editor.range.placeCursorNextTo(createdNode, false);

  // Notify listeners that the field's selection has changed.
  this.getFieldObject().dispatchSelectionChangeEvent();
  // Notify listeners that the field's contents have changed.
  this.getFieldObject().dispatchChange();
};
