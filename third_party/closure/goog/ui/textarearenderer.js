// Copyright 2010 The Closure Library Authors. All Rights Reserved.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Native browser textarea renderer for {@link goog.ui.Textarea}s.
 */

goog.provide('goog.ui.TextareaRenderer');

goog.require('goog.dom.TagName');
goog.require('goog.ui.Component');
goog.require('goog.ui.ControlRenderer');



/**
 * Renderer for {@link goog.ui.Textarea}s.  Renders and decorates native HTML
 * textarea elements.  Since native HTML textareas have built-in support for
 * many features, overrides many expensive (and redundant) superclass methods to
 * be no-ops.
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 * @final
 */
goog.ui.TextareaRenderer = function() {
  goog.ui.ControlRenderer.call(this);
};
goog.inherits(goog.ui.TextareaRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(goog.ui.TextareaRenderer);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
goog.ui.TextareaRenderer.CSS_CLASS = goog.getCssName('goog-textarea');


/** @override */
goog.ui.TextareaRenderer.prototype.getAriaRole = function() {
  // textareas don't need ARIA roles to be recognized by screen readers.
  return undefined;
};


/** @override */
goog.ui.TextareaRenderer.prototype.decorate = function(control, element) {
  this.setUpTextarea_(control);
  goog.ui.TextareaRenderer.superClass_.decorate.call(this, control,
      element);
  control.setContent(element.value);
  return element;
};


/**
 * Returns the textarea's contents wrapped in an HTML textarea element.  Sets
 * the textarea's disabled attribute as needed.
 * @param {goog.ui.Control} textarea Textarea to render.
 * @return {!Element} Root element for the Textarea control (an HTML textarea
 *     element).
 * @override
 */
goog.ui.TextareaRenderer.prototype.createDom = function(textarea) {
  this.setUpTextarea_(textarea);
  var element = textarea.getDomHelper().createDom(goog.dom.TagName.TEXTAREA, {
    'class': this.getClassNames(textarea).join(' '),
    'disabled': !textarea.isEnabled()
  }, textarea.getContent() || '');
  return element;
};


/**
 * Overrides {@link goog.ui.TextareaRenderer#canDecorate} by returning true only
 * if the element is an HTML textarea.
 * @param {Element} element Element to decorate.
 * @return {boolean} Whether the renderer can decorate the element.
 * @override
 */
goog.ui.TextareaRenderer.prototype.canDecorate = function(element) {
  return element.tagName == goog.dom.TagName.TEXTAREA;
};


/**
 * Textareas natively support right-to-left rendering.
 * @override
 */
goog.ui.TextareaRenderer.prototype.setRightToLeft = goog.nullFunction;


/**
 * Textareas are always focusable as long as they are enabled.
 * @override
 */
goog.ui.TextareaRenderer.prototype.isFocusable = function(textarea) {
  return textarea.isEnabled();
};


/**
 * Textareas natively support keyboard focus.
 * @override
 */
goog.ui.TextareaRenderer.prototype.setFocusable = goog.nullFunction;


/**
 * Textareas also expose the DISABLED state in the HTML textarea's
 * {@code disabled} attribute.
 * @override
 */
goog.ui.TextareaRenderer.prototype.setState = function(textarea, state,
    enable) {
  goog.ui.TextareaRenderer.superClass_.setState.call(this, textarea, state,
      enable);
  var element = textarea.getElement();
  if (element && state == goog.ui.Component.State.DISABLED) {
    element.disabled = enable;
  }
};


/**
 * Textareas don't need ARIA states to support accessibility, so this is
 * a no-op.
 * @override
 */
goog.ui.TextareaRenderer.prototype.updateAriaState = goog.nullFunction;


/**
 * Sets up the textarea control such that it doesn't waste time adding
 * functionality that is already natively supported by browser
 * textareas.
 * @param {goog.ui.Control} textarea Textarea control to configure.
 * @private
 */
goog.ui.TextareaRenderer.prototype.setUpTextarea_ = function(textarea) {
  textarea.setHandleMouseEvents(false);
  textarea.setAutoStates(goog.ui.Component.State.ALL, false);
  textarea.setSupportedState(goog.ui.Component.State.FOCUSED, false);
};


/** @override **/
goog.ui.TextareaRenderer.prototype.setContent = function(element, value) {
  if (element) {
    element.value = value;
  }
};


/** @override **/
goog.ui.TextareaRenderer.prototype.getCssClass = function() {
  return goog.ui.TextareaRenderer.CSS_CLASS;
};
