/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Native browser button renderer for {@link goog.ui.Button}s.
 */

goog.provide('goog.ui.NativeButtonRenderer');

goog.require('goog.asserts');
goog.require('goog.dom.InputType');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events.EventType');
goog.require('goog.ui.ButtonRenderer');
goog.require('goog.ui.Component');
goog.requireType('goog.ui.Control');



/**
 * Renderer for {@link goog.ui.Button}s.  Renders and decorates native HTML
 * button elements.  Since native HTML buttons have built-in support for many
 * features, overrides many expensive (and redundant) superclass methods to
 * be no-ops.
 * @constructor
 * @extends {goog.ui.ButtonRenderer}
 */
goog.ui.NativeButtonRenderer = function() {
  'use strict';
  goog.ui.ButtonRenderer.call(this);
};
goog.inherits(goog.ui.NativeButtonRenderer, goog.ui.ButtonRenderer);
goog.addSingletonGetter(goog.ui.NativeButtonRenderer);


/** @override */
goog.ui.NativeButtonRenderer.prototype.getAriaRole = function() {
  'use strict';
  // Native buttons don't need ARIA roles to be recognized by screen readers.
  return undefined;
};


/**
 * Returns the button's contents wrapped in a native HTML button element.  Sets
 * the button's disabled attribute as needed.
 * @param {goog.ui.Control} button Button to render.
 * @return {!Element} Root element for the button (a native HTML button
 *     element).
 * @override
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.ui.NativeButtonRenderer.prototype.createDom = function(button) {
  'use strict';
  this.setUpNativeButton_(button);
  return button.getDomHelper().createDom(
      goog.dom.TagName.BUTTON, {
        'class': this.getClassNames(button).join(' '),
        'disabled': !button.isEnabled(),
        'title': button.getTooltip() || '',
        'value': button.getValue() || ''
      },
      button.getCaption() || '');
};


/**
 * Overrides {@link goog.ui.ButtonRenderer#canDecorate} by returning true only
 * if the element is an HTML button.
 * @param {Element} element Element to decorate.
 * @return {boolean} Whether the renderer can decorate the element.
 * @override
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.ui.NativeButtonRenderer.prototype.canDecorate = function(element) {
  'use strict';
  return element.tagName == goog.dom.TagName.BUTTON ||
      (element.tagName == goog.dom.TagName.INPUT &&
       (element.type == goog.dom.InputType.BUTTON ||
        element.type == goog.dom.InputType.SUBMIT ||
        element.type == goog.dom.InputType.RESET));
};


/**
 * @override
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.ui.NativeButtonRenderer.prototype.decorate = function(button, element) {
  'use strict';
  this.setUpNativeButton_(button);
  if (element.disabled) {
    // Add the marker class for the DISABLED state before letting the superclass
    // implementation decorate the element, so its state will be correct.
    var disabledClassName = goog.asserts.assertString(
        this.getClassForState(goog.ui.Component.State.DISABLED));
    goog.dom.classlist.add(element, disabledClassName);
  }
  return goog.ui.NativeButtonRenderer.superClass_.decorate.call(
      this, button, element);
};


/**
 * Native buttons natively support BiDi and keyboard focus.
 * @suppress {visibility} getHandler and performActionInternal
 * @override
 */
goog.ui.NativeButtonRenderer.prototype.initializeDom = function(button) {
  'use strict';
  // WARNING:  This is a hack, and it is only applicable to native buttons,
  // which are special because they do natively what most goog.ui.Controls
  // do programmatically.  Do not use your renderer's initializeDom method
  // to hook up event handlers!
  button.getHandler().listen(
      button.getElement(), goog.events.EventType.CLICK,
      button.performActionInternal);
};


/**
 * @override
 * Native buttons don't support text selection.
 */
goog.ui.NativeButtonRenderer.prototype.setAllowTextSelection = function() {};


/**
 * @override
 * Native buttons natively support right-to-left rendering.
 */
goog.ui.NativeButtonRenderer.prototype.setRightToLeft = function() {};


/**
 * @override
 * Native buttons are always focusable as long as they are enabled.
 */
goog.ui.NativeButtonRenderer.prototype.isFocusable = function(button) {
  'use strict';
  return button.isEnabled();
};


/**
 * @override
 * Native buttons natively support keyboard focus.
 */
goog.ui.NativeButtonRenderer.prototype.setFocusable = function() {};


/**
 * @override
 * Native buttons also expose the DISABLED state in the HTML button's
 * `disabled` attribute.
 */
goog.ui.NativeButtonRenderer.prototype.setState = function(
    button, state, enable) {
  'use strict';
  goog.ui.NativeButtonRenderer.superClass_.setState.call(
      this, button, state, enable);
  var element = button.getElement();
  if (element && state == goog.ui.Component.State.DISABLED) {
    /** @suppress {strictMissingProperties} Added to tighten compiler checks */
    element.disabled = enable;
  }
};


/**
 * @override
 * Native buttons store their value in the HTML button's `value`
 * attribute.
 * @suppress {strictMissingProperties} Added to tighten compiler checks
 */
goog.ui.NativeButtonRenderer.prototype.getValue = function(element) {
  'use strict';
  // TODO(attila): Make this work on IE!  This never worked...
  // See http://www.fourmilab.ch/fourmilog/archives/2007-03/000824.html
  // for a description of the problem.
  return element.value;
};


/**
 * @override
 * Native buttons also expose their value in the HTML button's `value`
 * attribute.
 */
goog.ui.NativeButtonRenderer.prototype.setValue = function(element, value) {
  'use strict';
  if (element) {
    // TODO(attila): Make this work on IE!  This never worked...
    // See http://www.fourmilab.ch/fourmilog/archives/2007-03/000824.html
    // for a description of the problem.
    /** @suppress {strictMissingProperties} Added to tighten compiler checks */
    element.value = value;
  }
};


/**
 * @override
 * Native buttons don't need ARIA states to support accessibility, so this is
 * a no-op.
 */
goog.ui.NativeButtonRenderer.prototype.updateAriaState = function() {};


/**
 * Sets up the button control such that it doesn't waste time adding
 * functionality that is already natively supported by native browser
 * buttons.
 * @param {goog.ui.Control} button Button control to configure.
 * @private
 */
goog.ui.NativeButtonRenderer.prototype.setUpNativeButton_ = function(button) {
  'use strict';
  button.setHandleMouseEvents(false);
  button.setAutoStates(goog.ui.Component.State.ALL, false);
  button.setSupportedState(goog.ui.Component.State.FOCUSED, false);
};
