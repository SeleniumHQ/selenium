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

goog.provide('goog.editor.plugins.EquationEditorPlugin');

goog.require('goog.editor.Command');
goog.require('goog.editor.plugins.AbstractDialogPlugin');
goog.require('goog.editor.range');
goog.require('goog.functions');
goog.require('goog.ui.editor.AbstractDialog.Builder');
goog.require('goog.ui.editor.EquationEditorDialog');
goog.require('goog.ui.editor.EquationEditorOkEvent');
goog.require('goog.ui.equation.EquationEditor');
goog.require('goog.ui.equation.ImageRenderer');
goog.require('goog.ui.equation.TexEditor');



/**
 * A plugin that opens the equation editor in a dialog window.
 * @param {string=} opt_helpUrl A URL pointing to help documentation.
 * @constructor
 * @extends {goog.editor.plugins.AbstractDialogPlugin}
 */
goog.editor.plugins.EquationEditorPlugin = function(opt_helpUrl) {
  /**
   * The IMG element for the equation being edited, null if creating a new
   * equation.
   * @type {Element}
   * @private
   */
  this.originalElement_;

  /**
   * A URL pointing to help documentation.
   * @type {string}
   * @private
   */
  this.helpUrl_ = opt_helpUrl || '';

  /**
   * The listener key for double click events.
   * @type {number?}
   * @private
   */
  this.dblClickKey_;

  goog.editor.plugins.AbstractDialogPlugin.call(this,
      goog.editor.Command.EQUATION);
};
goog.inherits(goog.editor.plugins.EquationEditorPlugin,
    goog.editor.plugins.AbstractDialogPlugin);


/**
 * The logger for the EquationEditorPlugin.
 * @type {goog.debug.Logger}
 * @private
 */
goog.editor.plugins.EquationEditorPlugin.prototype.logger_ =
    goog.debug.Logger.getLogger('goog.editor.plugins.EquationEditorPlugin');


/** @override */
goog.editor.plugins.EquationEditorPlugin.prototype.getTrogClassId =
    goog.functions.constant('EquationEditorPlugin');


/**
 * @override
 */
goog.editor.plugins.EquationEditorPlugin.prototype.createDialog =
    function(dom, opt_arg) {
  var equationImgEl = /** @type {Element} */ (opt_arg || null);

  var equationStr = equationImgEl ?
      goog.ui.equation.ImageRenderer.getEquationFromImage(equationImgEl) : '';

  this.originalElement_ = equationImgEl;
  var dialog = new goog.ui.editor.EquationEditorDialog(
      this.populateContext_(), dom, equationStr, this.helpUrl_);
  dialog.addEventListener(goog.ui.editor.AbstractDialog.EventType.OK,
      this.handleOk_,
      false,
      this);
  return dialog;
};


/**
 * Populates the context that this plugin runs in.
 * @return {Object} The context that this plugin runs in.
 * @private
 */
goog.editor.plugins.EquationEditorPlugin.prototype.populateContext_ =
    function() {
  var context = {};
  context.paletteManager = new goog.ui.equation.PaletteManager();
  return context;
};


/**
 * Returns the selected text in the editable field for using as initial
 * equation string for the equation editor.
 *
 * TODO(user): Sanity check the selected text and return it only if it
 *     reassembles a TeX equation and is not too long.
 *
 * @return {string} Selected text in the editable field for using it as
 *     initial equation string for the equation editor.
 * @private
 */
goog.editor.plugins.EquationEditorPlugin.prototype.getEquationFromSelection_ =
    function() {
  var range = this.fieldObject.getRange();
  if (range) {
    return range.getText();
  }

  return '';
};


/** @override */
goog.editor.plugins.EquationEditorPlugin.prototype.enable =
    function(fieldObject) {
  goog.base(this, 'enable', fieldObject);
  if (this.isEnabled(fieldObject)) {
    this.dblClickKey_ = goog.events.listen(fieldObject.getElement(),
        goog.events.EventType.DBLCLICK,
        goog.bind(this.handleDoubleClick_, this), false, this);
  }
};


/** @override */
goog.editor.plugins.EquationEditorPlugin.prototype.disable =
    function(fieldObject) {
  goog.base(this, 'disable', fieldObject);
  if (!this.isEnabled(fieldObject)) {
    goog.events.unlistenByKey(this.dblClickKey_);
  }
};


/**
 * Handles double clicks in the field area.
 * @param {goog.events.Event} e The event.
 * @private
 */
goog.editor.plugins.EquationEditorPlugin.prototype.handleDoubleClick_ =
    function(e) {
  var node = /** @type {Node} */ (e.target);
  this.execCommand(goog.editor.Command.EQUATION, node);
};


/**
 * Called when user clicks OK. Inserts the equation at cursor position in the
 * active editable field.
 * @param {goog.ui.editor.EquationEditorOkEvent} e The OK event.
 * @private
 */
goog.editor.plugins.EquationEditorPlugin.prototype.handleOk_ =
    function(e) {
  // First restore the selection so we can manipulate the editable field's
  // content according to what was selected.
  this.restoreOriginalSelection();

  // Notify listeners that the editable field's contents are about to change.
  this.fieldObject.dispatchBeforeChange();

  var dh = this.getFieldDomHelper();
  var node = dh.htmlToDocumentFragment(e.equationHtml);

  if (this.originalElement_) {
    // Editing existing equation: replace the old equation node with the new
    // one.
    goog.dom.replaceNode(node, this.originalElement_);
  } else {
    // Clear out what was previously selected, unless selection is already
    // empty (aka collapsed), and replace it with the new equation node.
    // TODO(user): there is a bug in FF where removeContents() may remove a
    // <br> right before and/or after the selection. Currently this is fixed
    // only for case of collapsed selection where we simply avoid calling
    // removeContants().
    var range = this.fieldObject.getRange();
    if (!range.isCollapsed()) {
      range.removeContents();
    }
    node = range.insertNode(node, false);
  }

  // Place the cursor to the right of the
  // equation image.
  goog.editor.range.placeCursorNextTo(node, false);

  this.fieldObject.dispatchChange();
};
