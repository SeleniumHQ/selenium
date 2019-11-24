// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

goog.provide('remote.ui.Banner');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.style');
goog.require('goog.ui.Component');



/**
 * Displays a banner message at the top of the screen.
 * @constructor
 * @extends {goog.ui.Component}
 */
remote.ui.Banner = function() {
  goog.base(this);
};
goog.inherits(remote.ui.Banner, goog.ui.Component);


/**
 * Key for the {@link goog.events.EventType.RESIZE} event listener.
 * @private {goog.events.Key}
 */
remote.ui.Banner.prototype.onResizeKey_ = null;


/** @override */
remote.ui.Banner.prototype.disposeInternal = function() {
  goog.events.removeAll(this.getElement());
  goog.events.unlistenByKey(this.onResizeKey_);
  this.onResizeKey_ = null;

  goog.base(this, 'disposeInternal');
};


/** @override */
remote.ui.Banner.prototype.createDom = function() {
  var div = this.getDomHelper().createDom(goog.dom.TagName.DIV, 'banner');
  goog.style.setStyle(div, 'position', 'absolute');
  goog.style.setStyle(div, 'top', '0');
  goog.style.setStyle(div, 'white-space', 'pre');

  goog.events.listen(div, goog.events.EventType.CLICK,
      goog.bind(this.setVisible, this, false));

  this.setElementInternal(div);
  this.reposition_();

  this.onResizeKey_ = goog.events.listen(this.getWindow_(),
      goog.events.EventType.RESIZE, this.reposition_, false, this);
};


/** @param {boolean} visible Whether this component should be visible. */
remote.ui.Banner.prototype.setVisible = function(visible) {
  goog.style.setElementShown(this.getElement(), visible);
  this.reposition_();
};


/**
 * Updates the displayed message.
 * @param {string} msg The new message.
 */
remote.ui.Banner.prototype.setMessage = function(msg) {
  this.getDomHelper().setTextContent(this.getElement(), msg);
  this.reposition_();
};


/**
 * @return {Window} The window this banner is displayed in.
 * @private
 */
remote.ui.Banner.prototype.getWindow_ = function() {
  var doc = this.getDomHelper().getDocument();
  return goog.dom.getWindow(doc) || window;
};


/**
 * Centers the banner in the view port.
 * @private
 */
remote.ui.Banner.prototype.reposition_ = function() {
  if (this.getElement().style.display) {
    return;
  }

  var win = this.getWindow_();

  var scroll = this.getDomHelper().getDocumentScroll();
  var x = scroll.x;

  var bannerSize = goog.style.getSize(this.getElement());
  var viewSize = goog.dom.getViewportSize(win);
  var left = Math.max(x + viewSize.width / 2 - bannerSize.width / 2, 0);
  goog.style.setPosition(this.getElement(), left, 0);
};
