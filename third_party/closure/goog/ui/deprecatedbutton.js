// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Deprecated button class; use {@link goog.ui.Button} instead.
 *
 */

goog.provide('goog.ui.DeprecatedButton');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');



/**
 * Default implementation of a button. Uses the default browser-style button.
 *
 * @param {string=} opt_class Optional class for component.
 *     Default: 'goog-button'.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @deprecated Use {@link goog.ui.Button} instead.
 */
goog.ui.DeprecatedButton = function(opt_class) {
  /**
   * CSS class name for the button.
   * @type {string}
   * @private
   */
  this.class_ = opt_class ? opt_class : goog.getCssName('goog-button');

  /**
   * Unique ID for the instance of this component.
   * @type {string}
   * @private
   */
  this.id_ = this.getNextUniqueId_();
};
goog.inherits(goog.ui.DeprecatedButton, goog.events.EventTarget);


/**
 * Prefix for all ID's of this component.
 * @type {string}
 * @private
 */
goog.ui.DeprecatedButton.BASE_ID_ = 'goog.ui.DeprecatedButton.';


/**
 * Next unique instance ID for this component.
 * @type {number}
 * @private
 */
goog.ui.DeprecatedButton.nextId_ = 0;


/**
 * Gets the next unique ID for the component.
 * @return {string} The next unique ID for the component.
 */
goog.ui.DeprecatedButton.getNextUniqueId = function() {
  return goog.ui.DeprecatedButton.BASE_ID_ + goog.ui.DeprecatedButton.nextId_++;
};


/**
 * Gets the next unique ID for the component. This method is used in the
 * constructor to generate the unique ID for the component.
 *
 * NOTE: This method is placed on the prototype so that classes that inherit
 * this class can override this method and have the ID automatically set by
 * calling the parent class's constructor.
 *
 * @return {string} The next unique ID for the component.
 * @private
 */
goog.ui.DeprecatedButton.prototype.getNextUniqueId_ = function() {
  return goog.ui.DeprecatedButton.getNextUniqueId();
};


/**
* Events fired by the Component.
* @enum {string}
*/
goog.ui.DeprecatedButton.EventType = {
  /**
   * Fired by the Component when it is activated.
   */
  ACTIVATE: 'activate',

  /**
   * Fired by the Component when it is enabled/disabled.
   */
  ENABLE: 'enable'
};


/**
 * Whether componet is enabled.
 * @type {boolean}
 * @private
 */
goog.ui.DeprecatedButton.prototype.enabled_ = true;


/**
 * Whether componet is rendered.
 * @type {boolean}
 * @private
 */
goog.ui.DeprecatedButton.prototype.rendered_ = false;


/**
 * HTML caption displayed in the component.
 * @type {string}
 * @private
 */
goog.ui.DeprecatedButton.prototype.caption_ = '';


/**
 * Tooltip for the component.
 * @type {?string}
 * @private
 */
goog.ui.DeprecatedButton.prototype.tooltip_ = null;


/**
 * Value associated with the component.
 * @type {Object}
 * @private
 */
goog.ui.DeprecatedButton.prototype.value_ = null;


/**
 * Main element for the component.
 * @type {Element}
 * @private
 */
goog.ui.DeprecatedButton.prototype.element_ = null;


/**
 * Gets the caption for the component.
 * @return {?string} The caption.
 */
goog.ui.DeprecatedButton.prototype.getCaption = function() {
  return this.caption_;
};


/**
 * Sets the caption for the component.
 * @param {string} caption The caption.
 */
goog.ui.DeprecatedButton.prototype.setCaption = function(caption) {
  this.caption_ = caption;
  if (this.isRendered()) {
    var element = this.getElement();

    element.value = caption;
    goog.dom.setTextContent(element, caption);
  }
};


/**
 * Gets the tooltip for the component.
 * @return {?string} The tooltip.
 */
goog.ui.DeprecatedButton.prototype.getTooltip = function() {
  return this.tooltip_;
};


/**
 * Sets the tooltip for the component.
 * @param {string} tooltip The tooltip.
 */
goog.ui.DeprecatedButton.prototype.setTooltip = function(tooltip) {
  this.tooltip_ = tooltip;
  if (this.isRendered()) {
    this.getElement().title = tooltip;
  }
};


/**
 * Gets the value for the component.
 * @return {Object} The value.
 */
goog.ui.DeprecatedButton.prototype.getValue = function() {
  return this.value_;
};


/**
 * Sets the value for the component.
 * @param {Object} value The value.
 */
goog.ui.DeprecatedButton.prototype.setValue = function(value) {
  this.value_ = value;
};


/**
 * Gets the enabled status for the component.
 * @return {boolean} The enabled status.
 */
goog.ui.DeprecatedButton.prototype.getEnabled = function() {
  return this.enabled_;
};


/**
 * Sets the enabled status for the component.
 * @param {boolean} enable The enabled status.
 */
goog.ui.DeprecatedButton.prototype.setEnabled = function(enable) {
  // Fire event to see if can be enabled.
  if (this.getEnabled() != enable &&
      this.dispatchEvent(goog.ui.DeprecatedButton.EventType.ENABLE)) {
    if (this.isRendered()) {
      this.element_.disabled = !enable;
    }
    this.enabled_ = enable;
  }
};


/**
 * Gets the CSS className for the component.
 * @return {string} The class name.
 */
goog.ui.DeprecatedButton.prototype.getClass = function() {
  return this.class_;
};


/**
 * Gets the element representing the UI component.
 * @return {Element} Element representing component if any. Otherwise, null.
 */
goog.ui.DeprecatedButton.prototype.getElement = function() {
  return this.element_;
};


/**
 * Gets the unique ID for the instance of this component.
 * @return {string} Unique element id.
 */
goog.ui.DeprecatedButton.prototype.getId = function() {
  return this.id_;
};


/**
 * Determines whether the component has been rendered.
 * @return {boolean} TRUE iff rendered. Otherwise, FALSE.
 */
goog.ui.DeprecatedButton.prototype.isRendered = function() {
  return this.rendered_;
};


/**
 * Renders the component. Throws an Error if the component is already rendered.
 * @param {Element=} opt_element Element to render the compponent into.
 *                              If omitted, then the componenet is appended to
 *                              the document.
 */
goog.ui.DeprecatedButton.prototype.render = function(opt_element) {
  if (this.isRendered()) {
    throw Error('Compenent already rendered');
  }

  // Get the DOM helper.
  var domHelper = goog.dom.getDomHelper(opt_element);

  // Create element.
  var element = domHelper.createDom('button', {
    value: this.caption_,
    title: this.tooltip_,
    disabled: !this.enabled_,
    className: this.class_
  });

  // set the text shown in the button
  goog.dom.setTextContent(element, this.caption_);

  // Append to parent.
  var parentElement = opt_element || domHelper.getDocument().body;
  domHelper.appendChild(parentElement, element);

  // Setup event handlers.
  goog.events.listen(element, goog.events.EventType.CLICK,
      this.onClick_, true, this);

  this.element_ = element;
  this.rendered_ = true;
};


/**
 * Decorates the element for the UI component.
 * @param {Element} element Element to decorate.
 */
goog.ui.DeprecatedButton.prototype.decorate = function(element) {
  if (this.isRendered()) {
    throw Error('Component already rendered');
  } else if (element && (element.tagName == 'BUTTON' ||
      (element.tagName == 'INPUT' && (element.type == 'BUTTON' ||
          element.type == 'SUBMIT' || element.type == 'RESET')))) {
    // Setup properties.
    this.element_ = element;
    this.setCaption(element.value);
    this.setTooltip(element.title);
    this.class_ = element.className;
    // Setup event handlers.
    goog.events.listen(element, goog.events.EventType.CLICK,
        this.onClick_, true, this);
    this.rendered_ = true;
  } else {
    throw Error('Invalid element to decorate');
  }
};


/**
 * Handles the DOM click event. Dispatches the button ACTIVATE Event.
 * @param {Object} e The event.
 * @private
 */
goog.ui.DeprecatedButton.prototype.onClick_ = function(e) {
  if (this.getEnabled()) {
    this.dispatchEvent(goog.ui.DeprecatedButton.EventType.ACTIVATE);
  }
};


/** @inheritDoc */
goog.ui.DeprecatedButton.prototype.disposeInternal = function() {
  goog.ui.DeprecatedButton.superClass_.disposeInternal.call(this);

  // Cleanup DOM.
  var element = this.element_;
  if (element) {
    // Cleanup DOM events.
    goog.events.unlisten(element, goog.events.EventType.CLICK,
        this.onClick_, true, this);

    // Remove node.
    var domHelper = goog.dom.getDomHelper(element);
    domHelper.removeNode(element);
    this.element_ = null;
  }

  // Cleanup properties.
  delete this.value_;
};
