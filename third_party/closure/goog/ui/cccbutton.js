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
 * @fileoverview This class is now deprecated.  Use {@link goog.ui.Button} and
 * {@link goog.ui.CustomButtonRenderer} to create CCC-style buttons.  See
 * closure/demos/button.html for an example.
 *
 */

goog.provide('goog.ui.CccButton');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.ui.DeprecatedButton');
goog.require('goog.userAgent');



/**
 * CCC-style implementation of a button.
 * The Html structure of the button is:
 * <pre>
 *  Element
 * ------------------------
 * - a
 *     - b
 *         - b
 *             - b
 *                 - text
 * </pre>
 *
 * @param {string=} opt_class Optional class for component.
 *     Default: 'goog-cccbutton'.
 * @param {boolean=} opt_noPoundSignInHref An optional argument that, when true,
 *     instructs the button to not use the href="#" to create the link. The
 *     side effect of this option being true is that clicking the button
 *     triggers the window's onunload or onbeforeunload handler in IE. The
 *     upside of setting this to true is that the page will not scroll when
 *     clicking this button in IE.
 *
 * @constructor
 * @extends {goog.ui.DeprecatedButton}
 * @deprecated Use {@link goog.ui.Button} instead.
 */
goog.ui.CccButton = function(opt_class, opt_noPoundSignInHref) {
  var className = opt_class ? opt_class : goog.getCssName('goog-cccbutton');
  goog.ui.DeprecatedButton.call(this, className);

  /**
   * Whether the 'a' element used for the button will use href='#' or instead
   * use href='javascript:;'.
   * @type {boolean}
   * @private
   */
  this.noPoundSignInHref_ = opt_noPoundSignInHref || false;
};
goog.inherits(goog.ui.CccButton, goog.ui.DeprecatedButton);


/**
 * Prefix for all ID's of this component.
 * @type {string}
 * @private
 */
goog.ui.CccButton.BASE_ID_ = 'goog.ui.CccButton.';


/**
 * Next unique instance ID for this component.
 * @type {number}
 * @private
 */
goog.ui.CccButton.nextId_ = 0;


/**
 * Gets the next unique ID for the component.
 * @return {string} The next unique ID for the component.
 */
goog.ui.CccButton.getNextUniqueId = function() {
  return goog.ui.CccButton.BASE_ID_ + String(goog.ui.CccButton.nextId_++);
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
goog.ui.CccButton.prototype.getNextUniqueId_ = function() {
  return goog.ui.CccButton.getNextUniqueId();
};


/**
 * Element that directly contains the caption for the component.
 * @type {Element}
 * @private
 */
goog.ui.DeprecatedButton.prototype.captionEl_ = null;


/**
 * Addition to base CSS class name to add when component is enabled.
 * @type {string}
 * @private
 */
goog.ui.CccButton.ENABLED_CLASS_ADDITION_ = '-enabled';


/**
 * Addition to base CSS class name to add when component is disabled.
 * @type {string}
 * @private
 */
goog.ui.CccButton.DISABLED_CLASS_ADDITION_ = '-disabled';


/**
 * Gets the CSS class to use for when enabled.
 * @return {string} The CSS class name.
 */
goog.ui.CccButton.prototype.getEnabledClass = function() {
  return this.class_ + goog.ui.CccButton.ENABLED_CLASS_ADDITION_;
};


/**
 * Gets the CSS class to use for when disabled.
 * @return {string} The CSS class name.
 */
goog.ui.CccButton.prototype.getDisabledClass = function() {
  return this.class_ + goog.ui.CccButton.DISABLED_CLASS_ADDITION_;
};


/**
 * Sets the caption for the component.
 * @param {string} caption The caption.
 */
goog.ui.CccButton.prototype.setCaption = function(caption) {
  this.caption_ = caption;
  if (this.isRendered()) {
    var element = this.captionEl_;
    element.innerHTML = '';
    var domHelper = goog.dom.getDomHelper(element);
    domHelper.appendChild(element, domHelper.createTextNode(caption));
  }
};


/**
 * Sets the enabled status of the component.
 * @param {boolean} enable TRUE iff enable the button. Otherwise, disable.
 */
goog.ui.CccButton.prototype.setEnabled = function(enable) {
  if (this.getEnabled() != enable &&
      this.dispatchEvent(goog.ui.DeprecatedButton.EventType.ENABLE)) {
    if (this.isRendered()) {
      // Swap the CSS class for enabled/disabled.
      var element = this.getElement();
      var fromClass = !enable ? this.getEnabledClass() :
          this.getDisabledClass();
      var toClass = enable ? this.getEnabledClass() : this.getDisabledClass();
      goog.dom.classes.swap(element, fromClass, toClass);
    }
    this.enabled_ = enable;
  }
};


/**
 * Renders the component. Throws an Error if the component is already rendered.
 * @param {Element=} opt_element Element to render the compponent into.
 *                              If omitted, then the componenet is appended to
 *                              the document.
 */
goog.ui.CccButton.prototype.render = function(opt_element) {
  if (this.isRendered()) {
    throw Error('Compenent already rendered');
  }

  // Get the DOM helper.
  var domHelper = goog.dom.getDomHelper(opt_element);

  // Adding # was problematic in non-IE, cause of bug 572520.
  var hrefString = goog.userAgent.IE ? '#' : 'javascript:;';
  hrefString = this.noPoundSignInHref_ ? 'javascript:;' : hrefString;

  // Create element.
  var element = domHelper.createDom('a',
      {title: this.tooltip_, className: this.class_ + ' ' +
          (this.enabled_ ? this.getEnabledClass() : this.getDisabledClass()),
          href: hrefString },
              domHelper.createDom('b', {},
                  domHelper.createDom('b', {},
                      this.captionEl_ =
                          domHelper.createDom('b', {}, this.caption_))));

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
 * Helper for checking if the structure of an element is valid for this
 * component.
 * @param {Element} element The element to check.
 * @param {string} tag The tag name to check for.
 * @return {boolean} Whether there is only one child and the child is of the
 *     given tag.
 * @private
 */
goog.ui.CccButton.prototype.isValidButtonChildHelper_ = function(element, tag) {
  var domHelper = goog.dom.getDomHelper(element);
  var firstChild = element ? domHelper.getFirstElementChild(element) : null;
  if (firstChild && firstChild.tagName.toLowerCase() == tag &&
      element.childNodes.length == 1) {
    return true;
  }
  return false;
};


/**
 * Decorates the element for the UI component.
 * @param {Element} element Element to decorate.
 */
goog.ui.CccButton.prototype.decorate = function(element) {
  if (this.isRendered()) {
    throw Error('Component already rendered');
  } else {
    var domHelper = goog.dom.getDomHelper(element);
    var firstElement = element ? domHelper.getFirstElementChild(element) : null;
    var secondElement = firstElement ?
        domHelper.getFirstElementChild(firstElement) : null;
    // Check if the structure of the element is valid for this component.
    if (element && element.tagName.toLowerCase() == 'a' &&
        this.isValidButtonChildHelper_(element, 'b') &&
        this.isValidButtonChildHelper_(firstElement, 'b') &&
        this.isValidButtonChildHelper_(secondElement, 'b')) {
      // Setup properties.
      this.element_ = element;
      this.setCaption(secondElement.firstChild.innerHTML);
      this.setTooltip(element.title);
      this.class_ = element.className;
      this.rendered_ = true;
    } else {
      throw Error('Invalid element to decorate');
    }
  }
};
