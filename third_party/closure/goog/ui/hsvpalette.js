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
 * @fileoverview An HSV (hue/saturation/value) color palette/picker
 * implementation. Inspired by examples like
 * http://johndyer.name/lab/colorpicker/ and the author's initial work. This
 * control allows for more control in picking colors than a simple swatch-based
 * palette. Without the styles from the demo css file, only a hex color label
 * and input field show up.
 *
 * @see ../demos/hsvpalette.html
 */

goog.provide('goog.ui.HsvPalette');

goog.require('goog.color');
goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.events.InputHandler');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('goog.userAgent');



/**
 * Creates an HSV palette. Allows a user to select the hue, saturation and
 * value/brightness.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @param {string=} opt_color Optional initial color (default is red).
 * @param {string=} opt_class Optional base for creating classnames (default is
 *     goog.getCssName('goog-hsv-palette')).
 * @extends {goog.ui.Component}
 * @constructor
 */
goog.ui.HsvPalette = function(opt_domHelper, opt_color, opt_class) {
  goog.ui.Component.call(this, opt_domHelper);

  this.setColor_(opt_color || '#f00');

  /**
   * The base class name for the component.
   * @type {string}
   * @private
   */
  this.class_ = opt_class || goog.getCssName('goog-hsv-palette');

  /**
   * The document which is being listened to.
   * type {HTMLDocument}
   * @private
   */
  this.document_ = this.getDomHelper().getDocument();
};
goog.inherits(goog.ui.HsvPalette, goog.ui.Component);
// TODO(user): Make this inherit from goog.ui.Control and split this into
// a control and a renderer.


/**
 * DOM element representing the hue/saturation background image.
 * @type {Element}
 * @private
 */
goog.ui.HsvPalette.prototype.hsImageEl_;


/**
 * DOM element representing the hue/saturation handle.
 * @type {Element}
 * @private
 */
goog.ui.HsvPalette.prototype.hsHandleEl_;


/**
 * DOM element representing the value background image.
 * @type {Element}
 * @private
 */
goog.ui.HsvPalette.prototype.vImageEl_;


/**
 * DOM element representing the value handle.
 * @type {Element}
 * @private
 */
goog.ui.HsvPalette.prototype.vHandleEl_;


/**
 * DOM element representing the current color swatch.
 * @type {Element}
 * @private
 */
goog.ui.HsvPalette.prototype.swatchEl_;


/**
 * DOM element representing the hex color input text field.
 * @type {Element}
 * @private
 */
goog.ui.HsvPalette.prototype.inputEl_;


/**
 * Input handler object for the hex value input field.
 * @type {goog.events.InputHandler}
 * @private
 */
goog.ui.HsvPalette.prototype.inputHandler_;


/**
 * Listener key for the mousemove event (during a drag operation).
 * @type {?number}
 * @private
 */
goog.ui.HsvPalette.prototype.mouseMoveListener_;


/**
 * Listener key for the mouseup event (during a drag operation).
 * @type {?number}
 * @private
 */
goog.ui.HsvPalette.prototype.mouseUpListener_;


/**
 * Gets the color that is currently selected in this color picker.
 * @return {string} The string of the selected color.
 */
goog.ui.HsvPalette.prototype.getColor = function() {
  return this.color_;
};


/**
 * Alpha transparency of the currently selected color, in [0, 1].
 * For the HSV palette this always returns 1. The HSVA palette overrides
 * this method.
 * @return {number} The current alpha value.
 */
goog.ui.HsvPalette.prototype.getAlpha = function() {
  return 1;
};


/**
 * Updates the text entry field.
 * @protected
 */
goog.ui.HsvPalette.prototype.updateInput = function() {
  var parsed;
  try {
    parsed = goog.color.parse(this.inputEl_.value).hex;
  } catch (e) {
    // ignore
  }
  if (this.color_ != parsed) {
    this.inputEl_.value = this.color_;
  }
};


/**
 * Sets which color is selected and update the UI.
 * @param {string} color The selected color.
 */
goog.ui.HsvPalette.prototype.setColor = function(color) {
  if (color != this.color_) {
    this.setColor_(color);
    this.updateUi_();
    this.dispatchEvent(goog.ui.Component.EventType.ACTION);
  }
};


/**
 * Sets which color is selected.
 * @param {string} color The selected color.
 * @private
 */
goog.ui.HsvPalette.prototype.setColor_ = function(color) {
  var rgbHex = goog.color.parse(color).hex;
  var rgbArray = goog.color.hexToRgb(rgbHex);
  this.hsv_ = goog.color.rgbArrayToHsv(rgbArray);
  // Hue is divided by 360 because the documentation for goog.color is currently
  // incorrect.
  // TODO(user): Fix this, see http://1324469 .
  this.hsv_[0] = this.hsv_[0] / 360;
  this.color_ = rgbHex;
};


/**
 * Alters the hue, saturation, and/or value of the currently selected color and
 * updates the UI.
 * @param {?number=} opt_hue (optional) hue in [0, 1].
 * @param {?number=} opt_saturation (optional) saturation in [0, 1].
 * @param {?number=} opt_value (optional) value in [0, 255].
 */
goog.ui.HsvPalette.prototype.setHsv = function(opt_hue,
                                               opt_saturation,
                                               opt_value) {
  if (opt_hue != null || opt_saturation != null || opt_value != null) {
    this.setHsv_(opt_hue, opt_saturation, opt_value);
    this.updateUi_();
    this.dispatchEvent(goog.ui.Component.EventType.ACTION);
  }
};


/**
 * Alters the hue, saturation, and/or value of the currently selected color.
 * @param {?number=} opt_hue (optional) hue in [0, 1].
 * @param {?number=} opt_saturation (optional) saturation in [0, 1].
 * @param {?number=} opt_value (optional) value in [0, 255].
 * @private
 */
goog.ui.HsvPalette.prototype.setHsv_ = function(opt_hue,
                                                opt_saturation,
                                                opt_value) {
  this.hsv_[0] = (opt_hue != null) ? opt_hue : this.hsv_[0];
  this.hsv_[1] = (opt_saturation != null) ? opt_saturation : this.hsv_[1];
  this.hsv_[2] = (opt_value != null) ? opt_value : this.hsv_[2];
  // Hue is multiplied by 360 because the documentation for goog.color is
  // currently incorrect.
  // TODO(user): Fix this, see http://1324469 .
  this.color_ = goog.color.hsvArrayToHex([
    this.hsv_[0] * 360,
    this.hsv_[1],
    this.hsv_[2]
  ]);
};


/**
 * HsvPalettes cannot be used to decorate pre-existing html, since the
 * structure they build is fairly complicated.
 * @param {Element} element Element to decorate.
 * @return {boolean} Returns always false.
 */
goog.ui.HsvPalette.prototype.canDecorate = function(element) {
  return false;
};


/** @inheritDoc */
goog.ui.HsvPalette.prototype.createDom = function() {
  var dom = this.getDomHelper();
  var noalpha = (goog.userAgent.IE && !goog.userAgent.isVersion('7')) ?
      ' ' + goog.getCssName(this.class_, 'noalpha') : '';
  var element = dom.createDom(goog.dom.TagName.DIV,
      this.class_ + noalpha,
      dom.createDom(goog.dom.TagName.DIV,
            goog.getCssName(this.class_, 'hs-backdrop')),
      this.hsImageEl_ = dom.createDom(goog.dom.TagName.DIV,
            goog.getCssName(this.class_, 'hs-image')),
      this.hsHandleEl_ = dom.createDom(goog.dom.TagName.DIV,
            goog.getCssName(this.class_, 'hs-handle')),
      this.vImageEl_ = dom.createDom(goog.dom.TagName.DIV,
            goog.getCssName(this.class_, 'v-image')),
      this.vHandleEl_ = dom.createDom(goog.dom.TagName.DIV,
            goog.getCssName(this.class_, 'v-handle')),
      this.swatchEl_ = dom.createDom(goog.dom.TagName.DIV,
            goog.getCssName(this.class_, 'swatch')),
      dom.createDom('label', null,
          //dom.createDom('span', null, 'Hex color '),
          this.inputEl_ = dom.createDom('input',
              {'class': goog.getCssName(this.class_, 'input'), 'type': 'text'})
      )
  );
  this.setElementInternal(element);

  // TODO(user): Set tabIndex
};


/**
 * Renders the color picker inside the provided element. This will override the
 * current content of the element.
 */
goog.ui.HsvPalette.prototype.enterDocument = function() {
  goog.ui.HsvPalette.superClass_.enterDocument.call(this);

  // TODO(user): Accessibility.

  this.updateUi_();

  var handler = this.getHandler();
  handler.listen(this.getElement(), goog.events.EventType.MOUSEDOWN,
      this.handleMouseDown_, false, this);

  // Cannot create InputHandler in createDom because IE throws an exception
  // on document.activeElement
  if (!this.inputHandler_) {
    this.inputHandler_ = new goog.events.InputHandler(this.inputEl_);
  }

  handler.listen(this.inputHandler_,
      goog.events.InputHandler.EventType.INPUT, this.handleInput_, false, this);
};


/** @inheritDoc */
goog.ui.HsvPalette.prototype.disposeInternal = function() {
  goog.ui.HsvPalette.superClass_.disposeInternal.call(this);

  delete this.hsImageEl_;
  delete this.hsHandleEl_;
  delete this.vImageEl_;
  delete this.vHandleEl_;
  delete this.swatchEl_;
  delete this.inputEl_;
  if (this.inputHandler_) {
    this.inputHandler_.dispose();
    delete this.inputHandler_;
  }
  goog.events.unlistenByKey(this.mouseMoveListener_);
  goog.events.unlistenByKey(this.mouseUpListener_);
};


/**
 * Updates the position, opacity, and styles for the UI representation of the
 * palette.
 * @private
 */
goog.ui.HsvPalette.prototype.updateUi_ = function() {
  if (this.isInDocument()) {
    var h = this.hsv_[0];
    var s = this.hsv_[1];
    var v = this.hsv_[2];

    var left = this.hsImageEl_.offsetLeft -
        Math.floor(this.hsHandleEl_.offsetWidth / 2) +
        this.hsImageEl_.offsetWidth * h;
    this.hsHandleEl_.style.left = left + 'px';
    var top = this.hsImageEl_.offsetTop -
        Math.floor(this.hsHandleEl_.offsetHeight / 2) +
        this.hsImageEl_.offsetHeight * (1 - s);
    this.hsHandleEl_.style.top = top + 'px';

    top = this.vImageEl_.offsetTop -
        Math.floor(this.vHandleEl_.offsetHeight / 2) +
        this.vImageEl_.offsetHeight * ((255 - v) / 255);
    this.vHandleEl_.style.top = top + 'px';
    goog.style.setOpacity(this.hsImageEl_, (v / 255));

    goog.style.setStyle(this.vImageEl_, 'background-color',
        goog.color.hsvToHex(this.hsv_[0] * 360, this.hsv_[1], 255));

    goog.style.setStyle(this.swatchEl_, 'background-color', this.color_);
    goog.style.setStyle(this.swatchEl_, 'color',
                        (this.hsv_[2] > 255 / 2) ? '#000' : '#fff');
    this.updateInput();
  }
};


/**
 * Handles mousedown events on palette UI elements.
 * @param {goog.events.BrowserEvent} e Event object.
 * @private
 */
goog.ui.HsvPalette.prototype.handleMouseDown_ = function(e) {
  if (e.target == this.vImageEl_ || e.target == this.vHandleEl_) {
    // Setup value change listeners
    var b = goog.style.getBounds(this.vImageEl_);
    this.handleMouseMoveV_(b, e);
    this.mouseMoveListener_ = goog.events.listen(this.document_,
        goog.events.EventType.MOUSEMOVE,
        goog.bind(this.handleMouseMoveV_, this, b));
    this.mouseUpListener_ = goog.events.listen(this.document_,
        goog.events.EventType.MOUSEUP, this.handleMouseUp_, false, this);
  } else if (e.target == this.hsImageEl_ || e.target == this.hsHandleEl_) {
    // Setup hue/saturation change listeners
    var b = goog.style.getBounds(this.hsImageEl_);
    this.handleMouseMoveHs_(b, e);
    this.mouseMoveListener_ = goog.events.listen(this.document_,
        goog.events.EventType.MOUSEMOVE,
        goog.bind(this.handleMouseMoveHs_, this, b));
    this.mouseUpListener_ = goog.events.listen(this.document_,
        goog.events.EventType.MOUSEUP, this.handleMouseUp_, false, this);
  }
};


/**
 * Handles mousemove events on the document once a drag operation on the value
 * slider has started.
 * @param {goog.math.Rect} b Boundaries of the value slider object at the start
 *     of the drag operation.
 * @param {goog.events.BrowserEvent} e Event object.
 * @private
 */
goog.ui.HsvPalette.prototype.handleMouseMoveV_ = function(b, e) {
  e.preventDefault();
  var vportPos = this.getDomHelper().getDocumentScroll();
  var newV = Math.round(
      255 * (b.top + b.height - Math.min(
          Math.max(vportPos.y + e.clientY, b.top),
          b.top + b.height)
      ) / b.height
  );
  this.setHsv(null, null, newV);
};


/**
 * Handles mousemove events on the document once a drag operation on the
 * hue/saturation slider has started.
 * @param {goog.math.Rect} b Boundaries of the value slider object at the start
 *     of the drag operation.
 * @param {goog.events.BrowserEvent} e Event object.
 * @private
 */
goog.ui.HsvPalette.prototype.handleMouseMoveHs_ = function(b, e) {
  e.preventDefault();
  var vportPos = this.getDomHelper().getDocumentScroll();
  var newH = (Math.min(Math.max(vportPos.x + e.clientX, b.left),
      b.left + b.width) - b.left) / b.width;
  var newS = (-Math.min(Math.max(vportPos.y + e.clientY, b.top),
      b.top + b.height) + b.top + b.height) / b.height;
  this.setHsv(newH, newS, null);
};


/**
 * Handles mouseup events on the document, which ends a drag operation.
 * @param {goog.events.Event} e Event object.
 * @private
 */
goog.ui.HsvPalette.prototype.handleMouseUp_ = function(e) {
  goog.events.unlistenByKey(this.mouseMoveListener_);
  goog.events.unlistenByKey(this.mouseUpListener_);
};


/**
 * Handles input events on the hex value input field.
 * @param {goog.events.Event} e Event object.
 * @private
 */
goog.ui.HsvPalette.prototype.handleInput_ = function(e) {
  if (/^#[0-9a-f]{6}$/i.test(this.inputEl_.value)) {
    this.setColor(this.inputEl_.value);
  }
};
