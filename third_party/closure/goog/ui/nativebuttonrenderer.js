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

// Copyright 2008 Google Inc. All Rights Reserved.

/**
 * @fileoverview Native browser button renderer for {@link goog.ui.Button}s.
 *
 */

goog.provide('goog.ui.NativeButtonRenderer');

goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.ui.ButtonRenderer');
goog.require('goog.ui.Component.State');



/**
 * Renderer for {@link goog.ui.Button}s.  Renders and decorates native HTML
 * button elements.  Since native HTML buttons have built-in support for many
 * features, overrides many expensive (and redundant) superclass methods to
 * be no-ops.
 * @constructor
 * @extends {goog.ui.ButtonRenderer}
 */
goog.ui.NativeButtonRenderer = function() {
  goog.ui.ButtonRenderer.call(this);
};
goog.inherits(goog.ui.NativeButtonRenderer, goog.ui.ButtonRenderer);
goog.addSingletonGetter(goog.ui.NativeButtonRenderer);


/** @inheritDoc */
goog.ui.NativeButtonRenderer.prototype.getAriaRole = function() {
  // Native buttons don't need ARIA roles to be recognized by screen readers.
  return undefined;
};


/**
 * Returns the button's contents wrapped in a native HTML button element.  Sets
 * the button's disabled attribute as needed.
 * @param {goog.ui.Control} button Button to render.
 * @return {Element} Root element for the button (a native HTML button element).
 * @override
 */
goog.ui.NativeButtonRenderer.prototype.createDom = function(button) {
  this.setUpNativeButton_(button);
  return button.getDomHelper().createDom('button', {
    'class': this.getClassNames(button).join(' '),
    'disabled': !button.isEnabled(),
    'title': button.getTooltip() || '',
    'value': button.getValue() || ''
  }, button.getCaption() || '');
};


/**
 * Overrides {@link goog.ui.ButtonRenderer#canDecorate} by returning true only
 * if the element is an HTML button.
 * @param {Element} element Element to decorate.
 * @return {boolean} Whether the renderer can decorate the element.
 * @override
 */
goog.ui.NativeButtonRenderer.prototype.canDecorate = function(element) {
  return element.tagName == 'BUTTON' ||
      (element.tagName == 'INPUT' && (element.type == 'button' ||
          element.type == 'submit' || element.type == 'reset'));
};


/** @inheritDoc */
goog.ui.NativeButtonRenderer.prototype.decorate = function(button, element) {
  this.setUpNativeButton_(button);
  if (element.disabled) {
    // Add the marker class for the DISABLED state before letting the superclass
    // implementation decorate the element, so its state will be correct.
    goog.dom.classes.add(element,
        this.getClassForState(goog.ui.Component.State.DISABLED));
  }
  return goog.ui.NativeButtonRenderer.superClass_.decorate.call(this, button,
      element);
};


/**
 * @inheritDoc
 * Native buttons natively support BiDi and keyboard focus.
 */
goog.ui.NativeButtonRenderer.prototype.initializeDom = function(button) {
  // WARNING:  This is a hack, and it is only applicable to native buttons,
  // which are special because they do natively what most goog.ui.Controls
  // do programmatically.  Do not use your renderer's initializeDom method
  // to hook up event handlers!
  button.getHandler().listen(button.getElement(), goog.events.EventType.CLICK,
      button.performActionInternal);
};


/**
 * @inheritDoc
 * Native buttons don't support text selection.
 */
goog.ui.NativeButtonRenderer.prototype.setAllowTextSelection =
    goog.nullFunction;


/**
 * @inheritDoc
 * Native buttons natively support right-to-left rendering.
 */
goog.ui.NativeButtonRenderer.prototype.setRightToLeft = goog.nullFunction;


/**
 * @inheritDoc
 * Native buttons are always focusable as long as they are enabled.
 */
goog.ui.NativeButtonRenderer.prototype.isFocusable = function(button) {
  return button.isEnabled();
};


/**
 * @inheritDoc
 * Native buttons natively support keyboard focus.
 */
goog.ui.NativeButtonRenderer.prototype.setFocusable = goog.nullFunction;


/**
 * @inheritDoc
 * Native buttons also expose the DISABLED state in the HTML button's
 * {@code disabled} attribute.
 */
goog.ui.NativeButtonRenderer.prototype.setState = function(button, state,
    enable) {
  goog.ui.NativeButtonRenderer.superClass_.setState.call(this, button, state,
      enable);
  var element = button.getElement();
  if (element && state == goog.ui.Component.State.DISABLED) {
    element.disabled = enable;
  }
};


/**
 * @inheritDoc
 * Native buttons store their value in the HTML button's {@code value}
 * attribute.
 */
goog.ui.NativeButtonRenderer.prototype.getValue = function(element) {
  // TODO: Make this work on IE!  This never worked...
  // See http://www.fourmilab.ch/fourmilog/archives/2007-03/000824.html
  // for a description of the problem.
  return element.value;
};


/**
 * @inheritDoc
 * Native buttons also expose their value in the HTML button's {@code value}
 * attribute.
 */
goog.ui.NativeButtonRenderer.prototype.setValue = function(element, value) {
  if (element) {
    // TODO: Make this work on IE!  This never worked...
    // See http://www.fourmilab.ch/fourmilog/archives/2007-03/000824.html
    // for a description of the problem.
    element.value = value;
  }
};


/**
 * @inheritDoc
 * Native buttons don't need ARIA states to support accessibility, so this is
 * a no-op.
 */
goog.ui.NativeButtonRenderer.prototype.updateAriaState = goog.nullFunction;


/**
 * Sets up the button control such that it doesn't waste time adding
 * functionality that is already natively supported by native browser
 * buttons.
 * @param {goog.ui.Control} button Button control to configure.
 * @private
 */
goog.ui.NativeButtonRenderer.prototype.setUpNativeButton_ = function(button) {
  button.setHandleMouseEvents(false);
  button.setAutoStates(goog.ui.Component.State.ALL, false);
  button.setSupportedState(goog.ui.Component.State.FOCUSED, false);
};
