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

goog.provide('remote.ui.SessionView');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.math.Box');
goog.require('goog.style');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.Dialog');
goog.require('remote.ui.ControlBlock');
goog.require('remote.ui.Event');
goog.require('remote.ui.JsonTooltip');



/**
 * View details for a single session.
 * @constructor
 * @extends {goog.ui.Component}
 */
remote.ui.SessionView = function() {
  goog.base(this);

  /** @private {!remote.ui.ControlBlock} */
  this.controlBlock_ = new remote.ui.ControlBlock();
  this.addChild(this.controlBlock_);

  /**
   * A basic confirmation dialog.
   * @private {!goog.ui.Dialog}
   */
  this.confirmDialog_ = new goog.ui.Dialog(undefined, true);

  this.confirmDialog_.setTitle('Delete session?');
  this.confirmDialog_.setTextContent(
      'Are you sure you want to delete this session?');
  goog.events.listen(this.confirmDialog_, goog.ui.Dialog.EventType.SELECT,
      this.onConfirm_, false, this);

  /**
   * Button for deleting the session currently in view.
   * @private {!goog.ui.Button}
   */
  this.deleteSessionButton_ = new goog.ui.Button('Delete Session');

  this.addChild(this.deleteSessionButton_);
  goog.events.listen(this.deleteSessionButton_,
      goog.ui.Component.EventType.ACTION,
      goog.bind(this.confirmDialog_.setVisible, this.confirmDialog_,
          true));

  /**
   * Button for taking a screenshot using the session currently in view.
   * @private {!goog.ui.Button}
   */
  this.screenshotButton_ = new goog.ui.Button('Take Screenshot');

  this.addChild(this.screenshotButton_);
  goog.events.listen(this.screenshotButton_, goog.ui.Component.EventType.ACTION,
      this.onScreenshot_, false, this);

  /**
   * Tooltip that displays session capabilities. Lazily initialized in
   * {@code #createDom()}.
   * @private {!remote.ui.JsonTooltip}
   */
  this.capabilitiesTooltip_ = new remote.ui.JsonTooltip();
  this.capabilitiesTooltip_.setHotSpotPadding(new goog.math.Box(5, 5, 5, 5));
  this.capabilitiesTooltip_.setCursorTracking(true);
  this.capabilitiesTooltip_.setMargin(new goog.math.Box(10, 0, 0, 0));
  this.capabilitiesTooltip_.setHideDelayMs(250);
};
goog.inherits(remote.ui.SessionView, goog.ui.Component);


/**
 * Element displayed when there is no session to view.
 * @private {Element}
 */
remote.ui.SessionView.prototype.emptyViewElement_;


/**
 * Element that displays the details for a single {@link webdriver.Session};
 * hidden when there is no session to view.
 * @private {Element}
 */
remote.ui.SessionView.prototype.viewElement_;


/**
 * Element that displays the session ID.
 * @private {Element}
 */
remote.ui.SessionView.prototype.sessionIdSpan_;


/**
 * Place holder for the bulk of the view content.
 * TODO: Figure out what we want this to be. A REPL for interacting
 * with the session? A view of recent session commands?
 * @private {Element}
 */
remote.ui.SessionView.prototype.todoBlock_;


/** @override */
remote.ui.SessionView.prototype.disposeInternal = function() {
  this.capabilitiesTooltip_.dispose();
  this.confirmDialog_.dispose();

  delete this.controlBlock_;
  delete this.emptyViewElement_;
  delete this.viewElement_;
  delete this.sessionIdSpan_;
  delete this.confirmDialog_;
  delete this.capabilitiesTooltip_;
  delete this.screenshotButton_;
  delete this.deleteSessionButton_;
  delete this.todoBlock_;

  goog.base(this, 'disposeInternal');
};


/** @override */
remote.ui.SessionView.prototype.createDom = function() {
  this.screenshotButton_.createDom();
  this.deleteSessionButton_.createDom();
  this.controlBlock_.createDom();

  var dom = this.getDomHelper();

  this.emptyViewElement_ = dom.createDom(goog.dom.TagName.DIV,
      'goog-tab-content empty-view', 'No Sessions');

  this.sessionIdSpan_ = dom.createElement(goog.dom.TagName.SPAN);

  // TODO: What more to add?
  this.todoBlock_ = dom.createDom(goog.dom.TagName.DIV, 'todo', '\xa0');
  this.todoBlock_.disabled = true;

  this.controlBlock_.addElement(this.sessionIdSpan_);

  var capabilities;
  this.controlBlock_.addElement(
      capabilities = dom.createDom(goog.dom.TagName.SPAN,
      'session-capabilities', 'Capabilities'));
  this.controlBlock_.addElement(
      /** @type {!Element} */ (this.screenshotButton_.getElement()));
  this.controlBlock_.addElement(
      /** @type {!Element} */ (this.deleteSessionButton_.getElement()));

  this.viewElement_ = dom.createDom(goog.dom.TagName.DIV, 'goog-tab-content',
      this.controlBlock_.getElement(), this.todoBlock_);

  var div = dom.createDom(goog.dom.TagName.DIV, null,
      this.emptyViewElement_,
      this.viewElement_,
      dom.createDom(goog.dom.TagName.DIV, 'goog-tab-bar-clear'));
  this.setElementInternal(div);

  this.update(null);
  this.capabilitiesTooltip_.attach(capabilities);
};


/**
 * @param {number} height The height of the view content.
 */
remote.ui.SessionView.prototype.setHeight = function(height) {
  goog.style.setStyle(this.emptyViewElement_, 'height', height + 'px');
  goog.style.setStyle(this.viewElement_, 'height', height + 'px');
};


/**
 * @param {!Element} element The element to add.
 */
remote.ui.SessionView.prototype.addControlElement = function(element) {
  this.controlBlock_.addElement(element);
};


/**
 * Updates this view for the given session.
 * @param {webdriver.Session} session The session to view.
 */
remote.ui.SessionView.prototype.update = function(session) {
  var hasSession = !!session;
  goog.style.setElementShown(this.emptyViewElement_, !hasSession);
  goog.style.setElementShown(this.viewElement_, hasSession);

  if (session) {
    goog.dom.setTextContent(this.sessionIdSpan_, session.getId());
    this.capabilitiesTooltip_.update(session.getCapabilities());
  }
};


/**
 * Callback for when the user makes a selection on the confirmation dialog.
 * @param {!goog.ui.Dialog.Event} e The select event.
 * @private
 */
remote.ui.SessionView.prototype.onConfirm_ = function(e) {
  if (e.key == 'ok') {
    this.dispatchEvent(remote.ui.Event.Type.DELETE);
  }
};


/**
 * Handler for when the user clicks the screenshot button. Dispatches a
 * {@link remote.ui.Event.Type.SCREENSHOT} event.
 * @private
 */
remote.ui.SessionView.prototype.onScreenshot_ = function() {
  this.dispatchEvent(remote.ui.Event.Type.SCREENSHOT);
};
