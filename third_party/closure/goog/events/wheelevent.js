// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview This class aims to smooth out inconsistencies between browser
 * handling of wheel events by providing an event that is similar to that
 * defined in the standard, but also easier to consume.
 *
 * It is based upon the WheelEvent, which allows for up to 3 dimensional
 * scrolling events that come in units of either pixels, lines or pages.
 * http://www.w3.org/TR/2014/WD-DOM-Level-3-Events-20140925/#interface-WheelEvent
 *
 * The significant difference here is that it also provides reasonable pixel
 * deltas for clients that do not want to treat line and page scrolling events
 * specially.
 *
 * Clients of this code should be aware that some input devices only fire a few
 * discrete events (such as a mouse wheel without acceleration) whereas some can
 * generate a large number of events for a single interaction (such as a
 * touchpad with acceleration). There is no signal in the events to reliably
 * distinguish between these.
 *
 * @see ../demos/wheelhandler.html
 */

goog.provide('goog.events.WheelEvent');

goog.require('goog.asserts');
goog.require('goog.events.BrowserEvent');



/**
 * A common class for wheel events. This is used with the WheelHandler.
 *
 * @param {Event} browserEvent Browser event object.
 * @param {goog.events.WheelEvent.DeltaMode} deltaMode The delta mode units of
 *     the wheel event.
 * @param {number} deltaX The number of delta units the user in the X axis.
 * @param {number} deltaY The number of delta units the user in the Y axis.
 * @param {number} deltaZ The number of delta units the user in the Z axis.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 * @final
 */
goog.events.WheelEvent = function(
    browserEvent, deltaMode, deltaX, deltaY, deltaZ) {
  goog.events.WheelEvent.base(this, 'constructor', browserEvent);
  goog.asserts.assert(browserEvent, 'Expecting a non-null browserEvent');

  /** @type {goog.events.WheelEvent.EventType} */
  this.type = goog.events.WheelEvent.EventType.WHEEL;

  /**
   * An enum corresponding to the units of this event.
   * @type {goog.events.WheelEvent.DeltaMode}
   */
  this.deltaMode = deltaMode;

  /**
   * The number of delta units in the X axis.
   * @type {number}
   */
  this.deltaX = deltaX;

  /**
   * The number of delta units in the Y axis.
   * @type {number}
   */
  this.deltaY = deltaY;

  /**
   * The number of delta units in the Z axis.
   * @type {number}
   */
  this.deltaZ = deltaZ;

  // Ratio between delta and pixel values.
  var pixelRatio = 1;  // Value for DeltaMode.PIXEL
  switch (deltaMode) {
    case goog.events.WheelEvent.DeltaMode.PAGE:
      pixelRatio *= goog.events.WheelEvent.PIXELS_PER_PAGE_;
      break;
    case goog.events.WheelEvent.DeltaMode.LINE:
      pixelRatio *= goog.events.WheelEvent.PIXELS_PER_LINE_;
      break;
  }

  /**
   * The number of delta pixels in the X axis. Code that doesn't want to handle
   * different deltaMode units can just look here.
   * @type {number}
   */
  this.pixelDeltaX = this.deltaX * pixelRatio;

  /**
   * The number of pixels in the Y axis. Code that doesn't want to
   * handle different deltaMode units can just look here.
   * @type {number}
   */
  this.pixelDeltaY = this.deltaY * pixelRatio;

  /**
   * The number of pixels scrolled in the Z axis. Code that doesn't want to
   * handle different deltaMode units can just look here.
   * @type {number}
   */
  this.pixelDeltaZ = this.deltaZ * pixelRatio;
};
goog.inherits(goog.events.WheelEvent, goog.events.BrowserEvent);


/**
 * Enum type for the events fired by the wheel handler.
 * @enum {string}
 */
goog.events.WheelEvent.EventType = {
  /** The user has provided wheel-based input. */
  WHEEL: 'wheel'
};


/**
 * Units for the deltas in a WheelEvent.
 * @enum {number}
 */
goog.events.WheelEvent.DeltaMode = {
  /** The units are in pixels. From DOM_DELTA_PIXEL. */
  PIXEL: 0,
  /** The units are in lines. From DOM_DELTA_LINE. */
  LINE: 1,
  /** The units are in pages. From DOM_DELTA_PAGE. */
  PAGE: 2
};


/**
 * A conversion number between line scroll units and pixel scroll units. The
 * actual value per line can vary a lot between devices and font sizes. This
 * number can not be perfect, but it should be reasonable for converting lines
 * scroll events into pixels.
 * @const {number}
 * @private
 */
goog.events.WheelEvent.PIXELS_PER_LINE_ = 15;


/**
 * A conversion number between page scroll units and pixel scroll units. The
 * actual value per page can vary a lot as many different devices have different
 * screen sizes, and the window might not be taking up the full screen. This
 * number can not be perfect, but it should be reasonable for converting page
 * scroll events into pixels.
 * @const {number}
 * @private
 */
goog.events.WheelEvent.PIXELS_PER_PAGE_ = 30 *
    goog.events.WheelEvent.PIXELS_PER_LINE_;
