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

// Copyright 2005 Google Inc. All Rights Reserved.

/**
 * @fileoverview A class that can be used to listen to font size changes.
 */

goog.provide('goog.dom.FontSizeMonitor');
goog.provide('goog.dom.FontSizeMonitor.EventType');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.userAgent');


// TODO: Move this to goog.events instead.



/**
 * This class can be used to monitor changes in font size.  Instances will
 * dispatch a {@code goog.dom.FontSizeMonitor.EventType.CHANGE} event.
 * Example usage:
 * <pre>
 * var fms = new goog.dom.FontSizeMonitor();
 * goog.events.listen(fms, goog.dom.FontSizeMonitor.EventType.CHANGE,
 *     function(e) {
 *       alert('Font size was changed');
 *     });
 * </pre>
 * @param {goog.dom.DomHelper} opt_domHelper DOM helper object that is used to
 *     determine where to insert the DOM nodes used to determine when the font
 *     size changes.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.dom.FontSizeMonitor = function(opt_domHelper) {
  goog.events.EventTarget.call(this);

  var dom = opt_domHelper || goog.dom.getDomHelper();

  /**
   * Offscreen iframe which we use to detect resize events.
   * @type {Element}
   * @private
   */
  this.sizeElement_ = dom.createDom(
      // The size of the iframe is expressed in em, which are font size relative
      // which will cause the iframe to be resized when the font size changes.
      // The actual values are not relevant as long as we can ensure that the
      // iframe has a non zero size and is completely off screen.
      goog.userAgent.IE ? 'div' : 'iframe',
      {'style': 'position:absolute;width:9em;height:9em;top:-99em'});
  var p = dom.getDocument().body;
  p.insertBefore(this.sizeElement_, p.firstChild);

  /**
   * The object that we listen to resize events on.
   * @type {Element|Window}
   * @private
   */
  var resizeTarget = this.resizeTarget_ =
      goog.userAgent.IE ? this.sizeElement_ :
          goog.dom.getFrameContentWindow(
              /** @type {HTMLIFrameElement} */ (this.sizeElement_));

  // We need to open and close the document to get Firefox 2 to work.  We must
  // not do this for IE in case we are using HTTPS since accessing the document
  // on an about:blank iframe in IE using HTTPS raises a Permission Denied
  // error. Additionally, firefox shows this frame in tab order by default,
  // suppress it by using a tabindex of -1.
  if (goog.userAgent.GECKO) {
    this.sizeElement_.tabIndex = -1;
    var doc = resizeTarget.document;
    doc.open();
    doc.close();
  }

  // Listen to resize event on the window inside the iframe.
  goog.events.listen(resizeTarget, goog.events.EventType.RESIZE,
                     this.handleResize_, false, this);

  /**
   * Last measured width of the iframe element.
   * @type {number}
   * @private
   */
  this.lastWidth_ = this.sizeElement_.offsetWidth;
};
goog.inherits(goog.dom.FontSizeMonitor, goog.events.EventTarget);


/**
 * The event types that the FontSizeMonitor fires.
 * @enum {string}
 */
goog.dom.FontSizeMonitor.EventType = {
  // TODO: Change value to 'change' after updating the callers.
  CHANGE: 'fontsizechange'
};


/**
 * Constant for the change event.
 * @type {string}
 * @deprecated Use {@code goog.dom.FontSizeMonitor.EventType.CHANGE} instead.
 */
goog.dom.FontSizeMonitor.CHANGE_EVENT =
    goog.dom.FontSizeMonitor.EventType.CHANGE;


/**
 * Disposes of the font size monitor.
 */
goog.dom.FontSizeMonitor.prototype.disposeInternal = function() {
  goog.dom.FontSizeMonitor.superClass_.disposeInternal.call(this);

  goog.events.unlisten(this.resizeTarget_, goog.events.EventType.RESIZE,
                       this.handleResize_, false, this);
  this.resizeTarget_ = null;

  // Firefox 2 crashes if the iframe is removed during the unload phase.
  if (!goog.userAgent.GECKO || goog.userAgent.isVersion('1.9')) {
    goog.dom.removeNode(this.sizeElement_);
  }
  delete this.sizeElement_;
};


/**
 * Handles the onresize event of the iframe and dispatches a change event in
 * case its size really changed.
 * @param {goog.events.BrowserEvent} e The event object.
 * @private
 */
goog.dom.FontSizeMonitor.prototype.handleResize_ = function(e) {
  // Only dispatch the event if the size really changed.  Some newer browsers do
  // not really change the font-size,  instead they zoom the whole page.  This
  // does trigger window resize events on the iframe but the logical pixel size
  // remains the same (the device pixel size changes but that is irrelevant).
  var currentWidth = this.sizeElement_.offsetWidth;
  if (this.lastWidth_ != currentWidth) {
    this.lastWidth_ = currentWidth;
    this.dispatchEvent(goog.dom.FontSizeMonitor.EventType.CHANGE);
  }
};
