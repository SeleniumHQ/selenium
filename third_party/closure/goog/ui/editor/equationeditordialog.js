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

goog.provide('goog.ui.editor.EquationEditorDialog');

goog.require('goog.editor.Command');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.editor.AbstractDialog');
goog.require('goog.ui.editor.EquationEditorOkEvent');
goog.require('goog.ui.equation.TexEditor');



/**
 * Equation editor dialog (based on goog.ui.editor.AbstractDialog).
 * @param {Object} context The context that this dialog runs in.
 * @param {goog.dom.DomHelper} domHelper DomHelper to be used to create the
 *     dialog's dom structure.
 * @param {string} equation Initial equation.
 * @param {string} helpUrl URL pointing to help documentation.
 * @constructor
 * @extends {goog.ui.editor.AbstractDialog}
 */
goog.ui.editor.EquationEditorDialog = function(context, domHelper,
    equation, helpUrl) {
  goog.ui.editor.AbstractDialog.call(this, domHelper);
  this.equationEditor_ =
      new goog.ui.equation.TexEditor(context, helpUrl, domHelper);
  this.equationEditor_.render();
  this.equationEditor_.setEquation(equation);
  this.equationEditor_.addEventListener(goog.editor.Command.EQUATION,
      this.onChange_, false, this);
};
goog.inherits(goog.ui.editor.EquationEditorDialog,
    goog.ui.editor.AbstractDialog);


/**
 * The equation editor actual UI.
 * @type {goog.ui.equation.TexEditor}
 * @private
 */
goog.ui.editor.EquationEditorDialog.prototype.equationEditor_;


/**
 * The dialog's OK button element.
 * @type {Element?}
 * @private
 */
goog.ui.editor.EquationEditorDialog.prototype.okButton_;


/** @override */
goog.ui.editor.EquationEditorDialog.prototype.createDialogControl =
    function() {
  var builder = new goog.ui.editor.AbstractDialog.Builder(this);

  /**
   * @desc The title of the equation editor dialog.
   */
  var MSG_EE_DIALOG_TITLE = goog.getMsg('Equation Editor');

  /**
   * @desc Button label for the equation editor dialog for adding
   * a new equation.
   */
  var MSG_EE_BUTTON_SAVE_NEW = goog.getMsg('Insert equation');

  /**
   * @desc Button label for the equation editor dialog for saving
   * a modified equation.
   */
  var MSG_EE_BUTTON_SAVE_MODIFY = goog.getMsg('Save changes');

  var okButtonText = this.equationEditor_.getEquation() ?
      MSG_EE_BUTTON_SAVE_MODIFY : MSG_EE_BUTTON_SAVE_NEW;

  builder.setTitle(MSG_EE_DIALOG_TITLE)
    .setContent(this.equationEditor_.getElement())
    .addOkButton(okButtonText)
    .addCancelButton();

  return builder.build();
};


/**
 * @override
 */
goog.ui.editor.EquationEditorDialog.prototype.createOkEvent = function(e) {
  if (this.equationEditor_.isValid()) {
    // Equation is not valid, don't close the dialog.
    return null;
  }
  var equationHtml = this.equationEditor_.getHtml();
  return new goog.ui.editor.EquationEditorOkEvent(equationHtml);
};


/**
 * Handles CHANGE event fired when user changes equation.
 * @param {goog.ui.equation.ChangeEvent} e The event object.
 * @private
 */
goog.ui.editor.EquationEditorDialog.prototype.onChange_ = function(e) {
  if (!this.okButton_) {
    this.okButton_ = this.getButtonElement(
        goog.ui.Dialog.DefaultButtonKeys.OK);
  }
  this.okButton_.disabled = !e.isValid;
};
