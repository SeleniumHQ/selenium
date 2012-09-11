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
 * @fileoverview An HSVA (hue/saturation/value/alpha) color palette/picker
 * implementation.
 * Without the styles from the demo css file, only a hex color label and input
 * field show up.
 *
 * @see ../demos/hsvapalette.html
 */

goog.provide('goog.ui.HsvaPalette');

goog.require('goog.array');
goog.require('goog.color');
goog.require('goog.color.alpha');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.HsvPalette');



/**
 * Creates an HSVA palette. Allows a user to select the hue, saturation,
 * value/brightness and alpha/opacity.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @param {string=} opt_color Optional initial color, without alpha (default is
 *     red).
 * @param {number=} opt_alpha Optional initial alpha (default is 1).
 * @param {string=} opt_class Optional base for creating classnames (default is
 *     'goog-hsva-palette').
 * @extends {goog.ui.HsvPalette}
 * @constructor
 */
goog.ui.HsvaPalette = function(opt_domHelper, opt_color, opt_alpha, opt_class) {
  goog.base(this, opt_domHelper, opt_color, opt_class);

  /**
   * Alpha transparency of the currently selected color, in [0, 1]. When
   * undefined, the palette will behave as a non-transparent HSV palette,
   * assuming full opacity.
   * @type {number}
   * @private
   */
  this.alpha_ = goog.isDef(opt_alpha) ? opt_alpha : 1;

  /**
   * The base class name for the component.
   * @type {string}
   * @private
   */
  this.class_ = opt_class || goog.getCssName('goog-hsva-palette');

  /**
   * The document which is being listened to.
   * type {HTMLDocument}
   * @private
   */
  this.document_ = opt_domHelper ? opt_domHelper.getDocument() :
      goog.dom.getDomHelper().getDocument();
};
goog.inherits(goog.ui.HsvaPalette, goog.ui.HsvPalette);


/**
 * DOM element representing the alpha background image.
 * @type {Element}
 * @private
 */
goog.ui.HsvaPalette.prototype.aImageEl_;


/**
 * DOM element representing the alpha handle.
 * @type {Element}
 * @private
 */
goog.ui.HsvaPalette.prototype.aHandleEl_;


/**
 * DOM element representing the swatch backdrop image.
 * @type {Element}
 * @private
 */
goog.ui.HsvaPalette.prototype.swatchBackdropEl_;


/** @override */
goog.ui.HsvaPalette.prototype.getAlpha = function() {
  return this.alpha_;
};


/**
 * Sets which color is selected and update the UI. The passed color should be
 * in #rrggbb format. The alpha value will be set to 1.
 * @param {number} alpha The selected alpha value, in [0, 1].
 */
goog.ui.HsvaPalette.prototype.setAlpha = function(alpha) {
  this.setColorAlphaHelper_(this.color_, alpha);
};


/**
 * Sets which color is selected and update the UI. The passed color should be
 * in #rrggbb format. The alpha value will be set to 1.
 * @param {string} color The selected color.
 * @override
 */
goog.ui.HsvaPalette.prototype.setColor = function(color) {
  this.setColorAlphaHelper_(color, 1);
};


/**
 * Gets the color that is currently selected in this color picker, in #rrggbbaa
 * format.
 * @return {string} The string of the selected color with alpha.
 */
goog.ui.HsvaPalette.prototype.getColorRgbaHex = function() {
  var alphaHex = Math.floor(this.alpha_ * 255).toString(16);
  return this.color_ + (alphaHex.length == 1 ? '0' + alphaHex : alphaHex);
};


/**
 * Sets which color is selected and update the UI. The passed color should be
 * in #rrggbbaa format. The alpha value will be set to 1.
 * @param {string} color The selected color with alpha.
 */
goog.ui.HsvaPalette.prototype.setColorRgbaHex = function(color) {
  var parsed = goog.ui.HsvaPalette.parseColorRgbaHex_(color);
  this.setColorAlphaHelper_(parsed[0], parsed[1]);
};


/**
 * Sets which color and alpha value are selected and update the UI. The passed
 * color should be in #rrggbb format.
 * @param {string} color The selected color in #rrggbb format.
 * @param {number} alpha The selected alpha value, in [0, 1].
 * @private
 */
goog.ui.HsvaPalette.prototype.setColorAlphaHelper_ = function(color, alpha) {
  var colorChange = this.color_ != color;
  var alphaChange = this.alpha_ != alpha;
  this.alpha_ = alpha;
  this.color_ = color;
  if (colorChange) {
    // This is to prevent multiple event dispatches.
    goog.ui.HsvaPalette.superClass_.setColor_.call(this, color);
  }
  if (colorChange || alphaChange) {
    this.updateUi();
    this.dispatchEvent(goog.ui.Component.EventType.ACTION);
  }
};


/** @override */
goog.ui.HsvaPalette.prototype.createDom = function() {
  goog.ui.HsvaPalette.superClass_.createDom.call(this);

  var dom = this.getDomHelper();
  this.aImageEl_ = dom.createDom(
      goog.dom.TagName.DIV, goog.getCssName(this.class_, 'a-image'));
  this.aHandleEl_ = dom.createDom(
      goog.dom.TagName.DIV, goog.getCssName(this.class_, 'a-handle'));
  this.swatchBackdropEl_ = dom.createDom(
      goog.dom.TagName.DIV, goog.getCssName(this.class_, 'swatch-backdrop'));
  dom.appendChild(this.element_, this.aImageEl_);
  dom.appendChild(this.element_, this.aHandleEl_);
  dom.appendChild(this.element_, this.swatchBackdropEl_);
};


/** @override */
goog.ui.HsvaPalette.prototype.disposeInternal = function() {
  goog.ui.HsvaPalette.superClass_.disposeInternal.call(this);

  delete this.aImageEl_;
  delete this.aHandleEl_;
  delete this.swatchBackdropEl_;
};


/** @override */
goog.ui.HsvaPalette.prototype.updateUi = function() {
  goog.base(this, 'updateUi');
  if (this.isInDocument()) {
    var a = this.alpha_ * 255;
    var top = this.aImageEl_.offsetTop -
        Math.floor(this.aHandleEl_.offsetHeight / 2) +
        this.aImageEl_.offsetHeight * ((255 - a) / 255);
    this.aHandleEl_.style.top = top + 'px';
    this.aImageEl_.style.backgroundColor = this.color_;
    goog.style.setOpacity(this.swatchEl_, a / 255);
  }
};


/** @override */
goog.ui.HsvaPalette.prototype.updateInput = function() {
  if (!goog.array.equals([this.color_, this.alpha_],
      goog.ui.HsvaPalette.parseUserInput_(this.inputEl_.value))) {
    this.inputEl_.value = this.getColorRgbaHex();
  }
};


/** @override */
goog.ui.HsvaPalette.prototype.handleMouseDown = function(e) {
  goog.base(this, 'handleMouseDown', e);
  if (e.target == this.aImageEl_ || e.target == this.aHandleEl_) {
    // Setup value change listeners
    var b = goog.style.getBounds(this.vImageEl_);
    this.handleMouseMoveA_(b, e);
    this.mouseMoveListener_ = goog.events.listen(this.document_,
        goog.events.EventType.MOUSEMOVE,
        goog.bind(this.handleMouseMoveA_, this, b));
    this.mouseUpListener_ = goog.events.listen(this.document_,
        goog.events.EventType.MOUSEUP, this.handleMouseUp_, false, this);
  }
};


/**
 * Handles mousemove events on the document once a drag operation on the alpha
 * slider has started.
 * @param {goog.math.Rect} b Boundaries of the value slider object at the start
 *     of the drag operation.
 * @param {goog.events.Event} e Event object.
 * @private
 */
goog.ui.HsvaPalette.prototype.handleMouseMoveA_ = function(b, e) {
  e.preventDefault();
  var vportPos = this.getDomHelper().getDocumentScroll();
  var newA = (b.top + b.height - Math.min(
      Math.max(vportPos.y + e.clientY, b.top),
      b.top + b.height)) / b.height;
  this.setAlpha(newA);
};


/** @override */
goog.ui.HsvaPalette.prototype.handleInput = function(e) {
  var parsed = goog.ui.HsvaPalette.parseUserInput_(this.inputEl_.value);
  if (parsed) {
    this.setColorAlphaHelper_(parsed[0], parsed[1]);
  }
};


/**
 * Parses an #rrggbb or #rrggbbaa color string.
 * @param {string} value User-entered color value.
 * @return {Array} A two element array [color, alpha], where color is #rrggbb
 *     and alpha is in [0, 1]. Null if the argument was invalid.
 * @private
 */
goog.ui.HsvaPalette.parseUserInput_ = function(value) {
  if (/^#[0-9a-f]{8}$/i.test(value)) {
    return goog.ui.HsvaPalette.parseColorRgbaHex_(value);
  } else if (/^#[0-9a-f]{6}$/i.test(value)) {
    return [value, 1];
  }
  return null;
};


/**
 * Parses a #rrggbbaa color string.
 * @param {string} color The color and alpha in #rrggbbaa format.
 * @return {Array} A two element array [color, alpha], where color is #rrggbb
 *     and alpha is in [0, 1].
 * @private
 */
goog.ui.HsvaPalette.parseColorRgbaHex_ = function(color) {
  var hex = goog.color.alpha.parse(color).hex;
  return [
    goog.color.alpha.extractHexColor(hex),
    parseInt(goog.color.alpha.extractAlpha(hex), 16) / 255
  ];
};
