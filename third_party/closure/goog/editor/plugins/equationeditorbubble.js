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

goog.provide('goog.editor.plugins.equation.EquationBubble');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.editor.Command');
goog.require('goog.editor.plugins.AbstractBubblePlugin');
goog.require('goog.string.Unicode');
goog.require('goog.ui.editor.Bubble');
goog.require('goog.ui.equation.ImageRenderer');



/**
 * Property bubble plugin for equations.
 *
 * @constructor
 * @extends {goog.editor.plugins.AbstractBubblePlugin}
 */
goog.editor.plugins.equation.EquationBubble = function() {
  goog.base(this);
};
goog.inherits(goog.editor.plugins.equation.EquationBubble,
    goog.editor.plugins.AbstractBubblePlugin);


/**
 * Id for 'edit' link.
 * @type {string}
 * @private
 */
goog.editor.plugins.equation.EquationBubble.EDIT_ID_ = 'ee_bubble_edit';


/**
 * Id for 'remove' link.
 * @type {string}
 * @private
 */
goog.editor.plugins.equation.EquationBubble.REMOVE_ID_ = 'ee_remove_remove';


/**
 * @desc Label for the equation property bubble.
 */
var MSG_EE_BUBBLE_EQUATION = goog.getMsg('Equation:');


/**
 * @desc Link text for equation property bubble to edit the equation.
 */
var MSG_EE_BUBBLE_EDIT = goog.getMsg('Edit');


/**
 * @desc Link text for equation property bubble to remove the equation.
 */
var MSG_EE_BUBBLE_REMOVE = goog.getMsg('Remove');


/** @override */
goog.editor.plugins.equation.EquationBubble.prototype.getTrogClassId =
    function() {
  return 'EquationBubble';
};


/** @override */
goog.editor.plugins.equation.EquationBubble.prototype.
    getBubbleTargetFromSelection = function(selectedElement) {
  if (selectedElement &&
      goog.ui.equation.ImageRenderer.isEquationElement(selectedElement)) {
    return selectedElement;
  }
  return null;
};


/** @override */
goog.editor.plugins.equation.EquationBubble.prototype.createBubbleContents =
    function(bubbleContainer) {
  goog.dom.appendChild(bubbleContainer,
      bubbleContainer.ownerDocument.createTextNode(
      MSG_EE_BUBBLE_EQUATION + goog.string.Unicode.NBSP));

  this.createLink(goog.editor.plugins.equation.EquationBubble.EDIT_ID_,
      MSG_EE_BUBBLE_EDIT, this.editEquation_, bubbleContainer);

  goog.dom.appendChild(bubbleContainer,
      bubbleContainer.ownerDocument.createTextNode(
      MSG_EE_BUBBLE_EQUATION +
      goog.editor.plugins.AbstractBubblePlugin.DASH_NBSP_STRING));

  this.createLink(goog.editor.plugins.equation.EquationBubble.REMOVE_ID_,
      MSG_EE_BUBBLE_REMOVE, this.removeEquation_, bubbleContainer);
};


/** @override */
goog.editor.plugins.equation.EquationBubble.prototype.getBubbleType =
    function() {
  return goog.dom.TagName.IMG;
};


/** @override */
goog.editor.plugins.equation.EquationBubble.prototype.getBubbleTitle =
    function() {
  /** @desc Title for the equation bubble. */
  var MSG_EQUATION_BUBBLE_TITLE = goog.getMsg('Equation');
  return MSG_EQUATION_BUBBLE_TITLE;
};


/**
 * Removes the equation associated with the bubble.
 * @private
 */
goog.editor.plugins.equation.EquationBubble.prototype.removeEquation_ =
    function() {
  this.fieldObject.dispatchBeforeChange();

  goog.dom.removeNode(this.getTargetElement());

  this.closeBubble();

  this.fieldObject.dispatchChange();
};


/**
 * Opens equation editor for the equation associated with the bubble.
 * @private
 */
goog.editor.plugins.equation.EquationBubble.prototype.editEquation_ =
    function() {
  var equationNode = this.getTargetElement();
  this.closeBubble();
  this.fieldObject.execCommand(goog.editor.Command.EQUATION, equationNode);
};
