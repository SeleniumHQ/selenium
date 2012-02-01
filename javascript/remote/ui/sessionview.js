// Copyright 2011 WebDriver committers
// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('remote.ui.SessionView');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events.Event');
goog.require('goog.math.Box');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.Button');
goog.require('goog.ui.Dialog');
goog.require('remote.ui.Event');
goog.require('remote.ui.JsonTooltip');
goog.require('remote.ui.OpenScriptDialog');
goog.require('remote.ui.createControlBlock');


/**
 * View details for a single session.
 * @constructor
 * @extends {goog.ui.Component}
 */
remote.ui.SessionView = function() {
  goog.base(this);

  /**
   * Dialog used to load a script for the current session.
   * @type {!remote.ui.OpenScriptDialog}
   * @private
   */
  this.openScriptDialog_ = new remote.ui.OpenScriptDialog();

  goog.events.listen(this.openScriptDialog_, goog.ui.Component.EventType.ACTION,
      this.onLoadScript_, false, this);

  /**
   * Button for opening the load script dialog.
   * @type {!goog.ui.Button}
   * @private
   */
  this.loadScriptButton_ = new goog.ui.Button('Load Script');

  this.addChild(this.loadScriptButton_);
  goog.events.listen(this.loadScriptButton_, goog.ui.Component.EventType.ACTION,
      goog.bind(this.openScriptDialog_.setVisible, this.openScriptDialog_,
          true));

  /**
   * A basic confirmation dialog.
   * @type {!goog.ui.Dialog}
   * @private
   */
  this.confirmDialog_ = new goog.ui.Dialog(null, true);

  this.confirmDialog_.setTitle('Delete session?');
  this.confirmDialog_.setContent(
      'Are you sure you want to delete this session?');
  goog.events.listen(this.confirmDialog_, goog.ui.Dialog.EventType.SELECT,
      this.onConfirm_, false, this);

  /**
   * Button for deleting the session currently in view.
   * @type {!goog.ui.Button}
   * @private
   */
  this.deleteSessionButton_ = new goog.ui.Button('Delete Session');

  this.addChild(this.deleteSessionButton_);
  goog.events.listen(this.deleteSessionButton_,
      goog.ui.Component.EventType.ACTION,
      goog.bind(this.confirmDialog_.setVisible, this.confirmDialog_,
          true));

  /**
   * Button for taking a screenshot using the session currently in view.
   * @type {!goog.ui.Button}
   * @private
   */
  this.screenshotButton_ = new goog.ui.Button('Take Screenshot');

  this.addChild(this.screenshotButton_);
  goog.events.listen(this.screenshotButton_, goog.ui.Component.EventType.ACTION,
      this.onScreenshot_, false, this);

  /**
   * Tooltip that displays session capabilities. Lazily initialized in
   * {@code #createDom()}.
   * @type {!remote.ui.JsonTooltip}
   * @private
   */
  this.capabilitiesTooltip_ = new remote.ui.JsonTooltip(null);
  this.capabilitiesTooltip_.setHotSpotPadding(new goog.math.Box(5, 5, 5, 5));
  this.capabilitiesTooltip_.setCursorTracking(true);
  this.capabilitiesTooltip_.setMargin(new goog.math.Box(10, 0, 0, 0));
  this.capabilitiesTooltip_.setHideDelayMs(250);
};
goog.inherits(remote.ui.SessionView, goog.ui.Component);


/**
 * Element displayed when there is no session to view.
 * @type {Element}
 * @private
 */
remote.ui.SessionView.prototype.emptyViewElement_;


/**
 * Element that displays the details for a single {@link webdriver.Session};
 * hidden when there is no session to view.
 * @type {Element}
 * @private
 */
remote.ui.SessionView.prototype.viewElement_;


/**
 * Element that displays the session ID.
 * @type {Element}
 * @private
 */
remote.ui.SessionView.prototype.sessionIdSpan_;


/**
 * Place holder for the bulk of the view content.
 * TODO(jleyba): Figure out what we want this to be. A REPL for interacting
 * with the session? A view of recent session commands?
 * @type {Element}
 * @private
 */
remote.ui.SessionView.prototype.todoBlock_;


/** @override */
remote.ui.SessionView.prototype.disposeInternal = function() {
  this.capabilitiesTooltip_.dispose();
  this.openScriptDialog_.dispose();
  this.confirmDialog_.dispose();

  delete this.emptyViewElement_;
  delete this.viewElement_;
  delete this.sessionIdSpan_;
  delete this.openScriptDialog_;
  delete this.confirmDialog_;
  delete this.capabilitiesTooltip_;
  delete this.screenshotButton_;
  delete this.loadScriptButton_;
  delete this.deleteSessionButton_;
  delete this.todoBlock_;

  goog.base(this, 'disposeInternal');
};


/** @override */
remote.ui.SessionView.prototype.createDom = function() {
  this.screenshotButton_.createDom();
  this.loadScriptButton_.createDom();
  this.deleteSessionButton_.createDom();

  var capabilities;
  var dom = this.getDomHelper();

  this.emptyViewElement_ = dom.createDom(goog.dom.TagName.DIV,
      'goog-tab-content empty-view', 'No Sessions');

  this.sessionIdSpan_ = dom.createElement(goog.dom.TagName.SPAN);

  // TODO(jleyba): What more to add?
  this.todoBlock_ = dom.createDom(goog.dom.TagName.DIV, 'todo', '\xa0');
  this.todoBlock_.disabled = true;

  this.viewElement_ = dom.createDom(goog.dom.TagName.DIV, 'goog-tab-content',
      remote.ui.createControlBlock(dom,
          this.sessionIdSpan_,
          capabilities = dom.createDom(goog.dom.TagName.SPAN,
              'session-capabilities', 'Capabilities'),
          this.screenshotButton_.getElement(),
          this.loadScriptButton_.getElement(),
          this.deleteSessionButton_.getElement()),
      this.todoBlock_);

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
 * Updates this view for the given session.
 * @param {webdriver.Session} session The session to view.
 */
remote.ui.SessionView.prototype.update = function(session) {
  var hasSession = !!session;
  goog.style.showElement(this.emptyViewElement_, !hasSession);
  goog.style.showElement(this.viewElement_, hasSession);

  if (session) {
    goog.dom.setTextContent(this.sessionIdSpan_, session.getId());
    this.capabilitiesTooltip_.update(session.getCapabilities());
    if (!session.getCapability('takesScreenshot')) {
      this.screenshotButton_.setEnabled(false);
      this.screenshotButton_.setTooltip('Screenshots not supported');
    } else {
      this.screenshotButton_.setEnabled(true);
      this.screenshotButton_.setTooltip('');
    }
  }
};


/**
 * Callback for when the user has made a selection in a
 * {@link remote.ui.OpenScriptDialog}. Dispatches a
 * {@link remote.ui.Event.Type.LOAD} event with the URL ot load as data.
 * @private
 */
remote.ui.SessionView.prototype.onLoadScript_ = function() {
  var event = new remote.ui.Event(remote.ui.Event.Type.LOAD, this,
      this.openScriptDialog_.getUserSelection());
  this.dispatchEvent(event);
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
