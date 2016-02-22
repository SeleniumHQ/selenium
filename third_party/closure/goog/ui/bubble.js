// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Definition of the Bubble class.
 *
 *
 * @see ../demos/bubble.html
 *
 * TODO: support decoration and addChild
 */

goog.provide('goog.ui.Bubble');

goog.require('goog.Timer');
goog.require('goog.dom.safe');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.legacyconversions');
goog.require('goog.math.Box');
goog.require('goog.positioning');
goog.require('goog.positioning.AbsolutePosition');
goog.require('goog.positioning.AnchoredPosition');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.CornerBit');
goog.require('goog.string.Const');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.Popup');


goog.scope(function() {
var SafeHtml = goog.html.SafeHtml;



/**
 * The Bubble provides a general purpose bubble implementation that can be
 * anchored to a particular element and displayed for a period of time.
 *
 * @param {string|!goog.html.SafeHtml|Element} message HTML or an element
 *     to display inside the bubble. If possible pass a SafeHtml; string
 *     is supported for backwards-compatibility only and uses
 *     goog.html.legacyconversions.
 * @param {Object=} opt_config The configuration
 *     for the bubble. If not specified, the default configuration will be
 *     used. {@see goog.ui.Bubble.defaultConfig}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.Bubble = function(message, opt_config, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  if (goog.isString(message)) {
    message = goog.html.legacyconversions.safeHtmlFromString(message);
  }

  /**
   * The HTML string or element to display inside the bubble.
   *
   * @type {!goog.html.SafeHtml|Element}
   * @private
   */
  this.message_ = message;

  /**
   * The Popup element used to position and display the bubble.
   *
   * @type {goog.ui.Popup}
   * @private
   */
  this.popup_ = new goog.ui.Popup();

  /**
   * Configuration map that contains bubble's UI elements.
   *
   * @type {Object}
   * @private
   */
  this.config_ = opt_config || goog.ui.Bubble.defaultConfig;

  /**
   * Id of the close button for this bubble.
   *
   * @type {string}
   * @private
   */
  this.closeButtonId_ = this.makeId('cb');

  /**
   * Id of the div for the embedded element.
   *
   * @type {string}
   * @private
   */
  this.messageId_ = this.makeId('mi');

};
goog.inherits(goog.ui.Bubble, goog.ui.Component);
goog.tagUnsealableClass(goog.ui.Bubble);


/**
 * In milliseconds, timeout after which the button auto-hides. Null means
 * infinite.
 * @type {?number}
 * @private
 */
goog.ui.Bubble.prototype.timeout_ = null;


/**
 * Key returned by the bubble timer.
 * @type {?number}
 * @private
 */
goog.ui.Bubble.prototype.timerId_ = 0;


/**
 * Key returned by the listen function for the close button.
 * @type {goog.events.Key}
 * @private
 */
goog.ui.Bubble.prototype.listener_ = null;



/** @override */
goog.ui.Bubble.prototype.createDom = function() {
  goog.ui.Bubble.superClass_.createDom.call(this);

  var element = this.getElement();
  element.style.position = 'absolute';
  element.style.visibility = 'hidden';

  this.popup_.setElement(element);
};


/**
 * Attaches the bubble to an anchor element. Computes the positioning and
 * orientation of the bubble.
 *
 * @param {Element} anchorElement The element to which we are attaching.
 */
goog.ui.Bubble.prototype.attach = function(anchorElement) {
  this.setAnchoredPosition_(
      anchorElement, this.computePinnedCorner_(anchorElement));
};


/**
 * Sets the corner of the bubble to used in the positioning algorithm.
 *
 * @param {goog.positioning.Corner} corner The bubble corner used for
 *     positioning constants.
 */
goog.ui.Bubble.prototype.setPinnedCorner = function(corner) {
  this.popup_.setPinnedCorner(corner);
};


/**
 * Sets the position of the bubble. Pass null for corner in AnchoredPosition
 * for corner to be computed automatically.
 *
 * @param {goog.positioning.AbstractPosition} position The position of the
 *     bubble.
 */
goog.ui.Bubble.prototype.setPosition = function(position) {
  if (position instanceof goog.positioning.AbsolutePosition) {
    this.popup_.setPosition(position);
  } else if (position instanceof goog.positioning.AnchoredPosition) {
    this.setAnchoredPosition_(position.element, position.corner);
  } else {
    throw Error('Bubble only supports absolute and anchored positions!');
  }
};


/**
 * Sets the timeout after which bubble hides itself.
 *
 * @param {number} timeout Timeout of the bubble.
 */
goog.ui.Bubble.prototype.setTimeout = function(timeout) {
  this.timeout_ = timeout;
};


/**
 * Sets whether the bubble should be automatically hidden whenever user clicks
 * outside the bubble element.
 *
 * @param {boolean} autoHide Whether to hide if user clicks outside the bubble.
 */
goog.ui.Bubble.prototype.setAutoHide = function(autoHide) {
  this.popup_.setAutoHide(autoHide);
};


/**
 * Sets whether the bubble should be visible.
 *
 * @param {boolean} visible Desired visibility state.
 */
goog.ui.Bubble.prototype.setVisible = function(visible) {
  if (visible && !this.popup_.isVisible()) {
    this.configureElement_();
  }
  this.popup_.setVisible(visible);
  if (!this.popup_.isVisible()) {
    this.unconfigureElement_();
  }
};


/**
 * @return {boolean} Whether the bubble is visible.
 */
goog.ui.Bubble.prototype.isVisible = function() {
  return this.popup_.isVisible();
};


/** @override */
goog.ui.Bubble.prototype.disposeInternal = function() {
  this.unconfigureElement_();
  this.popup_.dispose();
  this.popup_ = null;
  goog.ui.Bubble.superClass_.disposeInternal.call(this);
};


/**
 * Creates element's contents and configures all timers. This is called on
 * setVisible(true).
 * @private
 */
goog.ui.Bubble.prototype.configureElement_ = function() {
  if (!this.isInDocument()) {
    throw Error('You must render the bubble before showing it!');
  }

  var element = this.getElement();
  var corner = this.popup_.getPinnedCorner();
  goog.dom.safe.setInnerHtml(/** @type {!Element} */ (element),
      this.computeHtmlForCorner_(corner));

  if (!(this.message_ instanceof SafeHtml)) {
    var messageDiv = this.getDomHelper().getElement(this.messageId_);
    this.getDomHelper().appendChild(messageDiv, this.message_);
  }
  var closeButton = this.getDomHelper().getElement(this.closeButtonId_);
  this.listener_ = goog.events.listen(closeButton,
      goog.events.EventType.CLICK, this.hideBubble_, false, this);

  if (this.timeout_) {
    this.timerId_ = goog.Timer.callOnce(this.hideBubble_, this.timeout_, this);
  }
};


/**
 * Gets rid of the element's contents and all assoicated timers and listeners.
 * This is called on dispose as well as on setVisible(false).
 * @private
 */
goog.ui.Bubble.prototype.unconfigureElement_ = function() {
  if (this.listener_) {
    goog.events.unlistenByKey(this.listener_);
    this.listener_ = null;
  }
  if (this.timerId_) {
    goog.Timer.clear(this.timerId_);
    this.timerId_ = null;
  }

  var element = this.getElement();
  if (element) {
    this.getDomHelper().removeChildren(element);
    goog.dom.safe.setInnerHtml(element, goog.html.SafeHtml.EMPTY);
  }
};


/**
 * Computes bubble position based on anchored element.
 *
 * @param {Element} anchorElement The element to which we are attaching.
 * @param {goog.positioning.Corner} corner The bubble corner used for
 *     positioning.
 * @private
 */
goog.ui.Bubble.prototype.setAnchoredPosition_ = function(anchorElement,
    corner) {
  this.popup_.setPinnedCorner(corner);
  var margin = this.createMarginForCorner_(corner);
  this.popup_.setMargin(margin);
  var anchorCorner = goog.positioning.flipCorner(corner);
  this.popup_.setPosition(new goog.positioning.AnchoredPosition(
      anchorElement, anchorCorner));
};


/**
 * Hides the bubble. This is called asynchronously by timer of event processor
 * for the mouse click on the close button.
 * @private
 */
goog.ui.Bubble.prototype.hideBubble_ = function() {
  this.setVisible(false);
};


/**
 * Returns an AnchoredPosition that will position the bubble optimally
 * given the position of the anchor element and the size of the viewport.
 *
 * @param {Element} anchorElement The element to which the bubble is attached.
 * @return {!goog.positioning.AnchoredPosition} The AnchoredPosition
 *     to give to {@link #setPosition}.
 */
goog.ui.Bubble.prototype.getComputedAnchoredPosition = function(anchorElement) {
  return new goog.positioning.AnchoredPosition(
      anchorElement, this.computePinnedCorner_(anchorElement));
};


/**
 * Computes the pinned corner for the bubble.
 *
 * @param {Element} anchorElement The element to which the button is attached.
 * @return {goog.positioning.Corner} The pinned corner.
 * @private
 */
goog.ui.Bubble.prototype.computePinnedCorner_ = function(anchorElement) {
  var doc = this.getDomHelper().getOwnerDocument(anchorElement);
  var viewportElement = goog.style.getClientViewportElement(doc);
  var viewportWidth = viewportElement.offsetWidth;
  var viewportHeight = viewportElement.offsetHeight;
  var anchorElementOffset = goog.style.getPageOffset(anchorElement);
  var anchorElementSize = goog.style.getSize(anchorElement);
  var anchorType = 0;
  // right margin or left?
  if (viewportWidth - anchorElementOffset.x - anchorElementSize.width >
      anchorElementOffset.x) {
    anchorType += 1;
  }
  // attaches to the top or to the bottom?
  if (viewportHeight - anchorElementOffset.y - anchorElementSize.height >
      anchorElementOffset.y) {
    anchorType += 2;
  }
  return goog.ui.Bubble.corners_[anchorType];
};


/**
 * Computes the right offset for a given bubble corner
 * and creates a margin element for it. This is done to have the
 * button anchor element on its frame rather than on the corner.
 *
 * @param {goog.positioning.Corner} corner The corner.
 * @return {!goog.math.Box} the computed margin. Only left or right fields are
 *     non-zero, but they may be negative.
 * @private
 */
goog.ui.Bubble.prototype.createMarginForCorner_ = function(corner) {
  var margin = new goog.math.Box(0, 0, 0, 0);
  if (corner & goog.positioning.CornerBit.RIGHT) {
    margin.right -= this.config_.marginShift;
  } else {
    margin.left -= this.config_.marginShift;
  }
  return margin;
};


/**
 * Computes the HTML string for a given bubble orientation.
 *
 * @param {goog.positioning.Corner} corner The corner.
 * @return {!goog.html.SafeHtml} The HTML string to place inside the
 *     bubble's popup.
 * @private
 */
goog.ui.Bubble.prototype.computeHtmlForCorner_ = function(corner) {
  var bubbleTopClass;
  var bubbleBottomClass;
  switch (corner) {
    case goog.positioning.Corner.TOP_LEFT:
      bubbleTopClass = this.config_.cssBubbleTopLeftAnchor;
      bubbleBottomClass = this.config_.cssBubbleBottomNoAnchor;
      break;
    case goog.positioning.Corner.TOP_RIGHT:
      bubbleTopClass = this.config_.cssBubbleTopRightAnchor;
      bubbleBottomClass = this.config_.cssBubbleBottomNoAnchor;
      break;
    case goog.positioning.Corner.BOTTOM_LEFT:
      bubbleTopClass = this.config_.cssBubbleTopNoAnchor;
      bubbleBottomClass = this.config_.cssBubbleBottomLeftAnchor;
      break;
    case goog.positioning.Corner.BOTTOM_RIGHT:
      bubbleTopClass = this.config_.cssBubbleTopNoAnchor;
      bubbleBottomClass = this.config_.cssBubbleBottomRightAnchor;
      break;
    default:
      throw Error('This corner type is not supported by bubble!');
  }
  var message = null;
  if (this.message_ instanceof SafeHtml) {
    message = this.message_;
  } else {
    message = SafeHtml.create('div', {'id': this.messageId_});
  }

  var tableRows = goog.html.SafeHtml.concat(
      SafeHtml.create('tr', {},
          SafeHtml.create('td', {'colspan': 4, 'class': bubbleTopClass})),
      SafeHtml.create('tr', {}, SafeHtml.concat(
          SafeHtml.create('td', {'class': this.config_.cssBubbleLeft }),
          SafeHtml.create('td',
              {'class': this.config_.cssBubbleFont, 'style':
                goog.string.Const.from('padding:0 4px;background:white')},
              message),
          SafeHtml.create('td',
              {'id': this.closeButtonId_,
                'class': this.config_.cssCloseButton }),
          SafeHtml.create('td', {'class': this.config_.cssBubbleRight }))),
      SafeHtml.create('tr', {},
          SafeHtml.create('td', {'colspan': 4, 'class': bubbleBottomClass})));

  return SafeHtml.create('table',
      {'border': 0, 'cellspacing': 0, 'cellpadding': 0,
        'width': this.config_.bubbleWidth,
        'style': goog.string.Const.from('z-index:1')},
      tableRows);
};


/**
 * A default configuration for the bubble.
 *
 * @type {Object}
 */
goog.ui.Bubble.defaultConfig = {
  bubbleWidth: 147,
  marginShift: 60,
  cssBubbleFont: goog.getCssName('goog-bubble-font'),
  cssCloseButton: goog.getCssName('goog-bubble-close-button'),
  cssBubbleTopRightAnchor: goog.getCssName('goog-bubble-top-right-anchor'),
  cssBubbleTopLeftAnchor: goog.getCssName('goog-bubble-top-left-anchor'),
  cssBubbleTopNoAnchor: goog.getCssName('goog-bubble-top-no-anchor'),
  cssBubbleBottomRightAnchor:
      goog.getCssName('goog-bubble-bottom-right-anchor'),
  cssBubbleBottomLeftAnchor: goog.getCssName('goog-bubble-bottom-left-anchor'),
  cssBubbleBottomNoAnchor: goog.getCssName('goog-bubble-bottom-no-anchor'),
  cssBubbleLeft: goog.getCssName('goog-bubble-left'),
  cssBubbleRight: goog.getCssName('goog-bubble-right')
};


/**
 * An auxiliary array optimizing the corner computation.
 *
 * @type {Array<goog.positioning.Corner>}
 * @private
 */
goog.ui.Bubble.corners_ = [
  goog.positioning.Corner.BOTTOM_RIGHT,
  goog.positioning.Corner.BOTTOM_LEFT,
  goog.positioning.Corner.TOP_RIGHT,
  goog.positioning.Corner.TOP_LEFT
];
});  // goog.scope
