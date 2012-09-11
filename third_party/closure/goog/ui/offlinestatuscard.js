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
 * @fileoverview A card that displays the offline status of an app. It contains
 * detailed information such as a progress bar the indicates the status of
 * syncing and allows you to perform actions (such as manually go offline).
 *
 * @see ../demos/offline.html
 */

goog.provide('goog.ui.OfflineStatusCard');
goog.provide('goog.ui.OfflineStatusCard.EventType');

goog.require('goog.dom');
goog.require('goog.events.EventType');
goog.require('goog.gears.StatusType');
goog.require('goog.structs.Map');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.ProgressBar');



/**
 * A offline status card.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.OfflineStatusCard = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * The progress bar for showing the status of syncing.
   * @type {goog.ui.ProgressBar}
   * @private
   */
  this.progressBar_ = new goog.ui.ProgressBar(opt_domHelper);
  this.addChild(this.progressBar_);

  /**
   * A map of action element uid/action event type pairs.
   * @type {goog.structs.Map}
   * @private
   */
  this.actionMap_ = new goog.structs.Map();
};
goog.inherits(goog.ui.OfflineStatusCard, goog.ui.Component);


/**
 * Event types dispatched by the component.
 * @enum {string}
 */
goog.ui.OfflineStatusCard.EventType = {
  /** Dispatched when the user wants the card to be dismissed. */
  DISMISS: 'dismiss'
};


/**
 * Whether the component is dirty and requires an upate to its display.
 * @type {boolean}
 * @protected
 */
goog.ui.OfflineStatusCard.prototype.dirty = false;


/**
 * The status of the component.
 * @type {goog.gears.StatusType}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.status_ =
    goog.gears.StatusType.NOT_INSTALLED;


/**
 * The element that holds the status message.
 * @type {Element}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.statusEl_ = null;


/**
 * The element that, when clicked, performs the appropriate action (such as
 * pausing synchronization).
 * @type {Element}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.actionEl_ = null;


/**
 * The element that displays additional messaging.
 * @type {Element}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.messageEl_ = null;


/**
 * The element that holds the progress bar and progress status.
 * @type {Element}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.progressEl_ = null;


/**
 * The element that holds the progress status.
 * @type {Element}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.progressStatusEl_ = null;


/**
 * The element that holds the close button.
 * @type {Element}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.closeEl_ = null;


/**
 * CSS class name for the element.
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.className_ =
    goog.getCssName('goog-offlinestatuscard');


/**
 * CSS class name for the shadow element.
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.shadowClassName_ =
    goog.getCssName('goog-offlinestatuscard-shadow');


/**
 * CSS class name for the content element.
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.contentClassName_ =
    goog.getCssName('goog-offlinestatuscard-content');


/**
 * CSS class name for the status element.
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.statusClassName_ =
    goog.getCssName('goog-offlinestatuscard-status');


/**
 * CSS class name for the action element.
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.actionClassName_ =
    goog.getCssName('goog-offlinestatuscard-action');


/**
 * CSS class name for each action item contained in the action element.
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.actionItemClassName_ =
    goog.getCssName('goog-offlinestatuscard-action-item');


/**
 * CSS class name for the last action item contained in the action element.
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.lastActionItemClassName_ =
    goog.getCssName('goog-offlinestatuscard-action-item-last');


/**
 * CSS class name for the message element.
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.messageClassName_ =
    goog.getCssName('goog-offlinestatuscard-message');


/**
 * CSS class name for the progress bar status element.
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.progressBarStatusClassName_ =
    goog.getCssName('goog-offlinestatuscard-progressbarstatus');


/**
 * CSS class name for the close card element.
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusCard.prototype.closeCardClassName_ =
    goog.getCssName('goog-offlinestatuscard-closecard');


/**
 * Gets the progress bar.
 * @return {goog.ui.ProgressBar} The progress bar.
 */
goog.ui.OfflineStatusCard.prototype.getProgressBar = function() {
  return this.progressBar_;
};


/**
 * Gets the status of the offline component of the app.
 * @return {goog.gears.StatusType} The offline status.
 */
goog.ui.OfflineStatusCard.prototype.getStatus = function() {
  return this.status_;
};


/**
 * Sets the status of the offline component of the app.
 * @param {goog.gears.StatusType} status The offline status.
 */
goog.ui.OfflineStatusCard.prototype.setStatus = function(status) {
  if (this.status_ != status) {
    this.dirty = true;
  }
  this.status_ = status;
  if (this.isInDocument()) {
    this.update();
  }
};


/**
 * Creates the initial DOM representation for the component.
 * @override
 */
goog.ui.OfflineStatusCard.prototype.createDom = function() {
  var dom = this.getDomHelper();
  this.setElementInternal(dom.createDom('div', this.className_,
      dom.createDom('div', this.shadowClassName_,
          dom.createDom('div', this.contentClassName_,
              this.closeEl_ = dom.createDom('div', this.closeCardClassName_),
              this.statusEl_ = dom.createDom('div', this.statusClassName_),
              this.progressEl_ = dom.createDom('div', null,
                  this.progressBarStatusEl_ =
                      dom.createDom('div', this.progressBarStatusClassName_)),
              this.actionEl_ = dom.createDom('div', this.actionClassName_),
              this.messageEl_ = dom.createDom('div',
                  this.messageClassName_)))));

  // Create and append the DOM of the progress bar.
  this.progressBar_.createDom();
  dom.insertSiblingBefore(
      this.progressBar_.getElement(), this.progressBarStatusEl_);

  this.createAdditionalDom();

  this.update();
};


/** @override */
goog.ui.OfflineStatusCard.prototype.enterDocument = function() {
  goog.ui.OfflineStatusCard.superClass_.enterDocument.call(this);

  // Listen for changes to the progress bar.
  var handler = this.getHandler();
  handler.listen(this.progressBar_, goog.ui.Component.EventType.CHANGE,
      this.handleProgressChange_);

  // Listen for a click on the action element.
  handler.listen(
      this.actionEl_, goog.events.EventType.CLICK, this.handleActionClick_);

  // Listen for the click on the close element.
  handler.listen(this.closeEl_, goog.events.EventType.CLICK, this.closePopup_);

  // Update the component if it is dirty.
  if (this.dirty) {
    this.update();
  }
};


/**
 * Allows subclasses to initialize additional DOM structures during createDom.
 * @protected
 */
goog.ui.OfflineStatusCard.prototype.createAdditionalDom = function() {
};


/**
 * Sends an event to OfflineStatusComponent to dismiss the popup.
 * @private
 */
goog.ui.OfflineStatusCard.prototype.closePopup_ = function() {
  this.dispatchEvent(goog.ui.OfflineStatusCard.EventType.DISMISS);
};


/**
 * Updates the display of the component.
 */
goog.ui.OfflineStatusCard.prototype.update = function() {
  if (this.getElement()) {
    var status = this.getStatus();
    var dom = this.getDomHelper();

    this.configureStatusElement(status);
    this.configureActionLinks(status);
    this.configureProgressElement(status);

    // Configure the message element.
    var message = this.getAdditionalMessage(status);
    var messageEl = this.messageEl_;
    goog.style.showElement(messageEl, message);
    if (message) {
      dom.setTextContent(messageEl, message);
    }

    // Clear the dirty state.
    this.dirty = false;
  }
};


/**
 * Set the message to display in the status portion of the card.
 * @param {goog.gears.StatusType} status The offline status.
 */
goog.ui.OfflineStatusCard.prototype.configureStatusElement = function(status) {
  /**
   * @desc Tell the user whether they are online, offline, or syncing to
   *     Gears.
   */
  var MSG_OFFLINE_STATUS = goog.getMsg(
      'Status: {$msg}', {'msg': this.getStatusMessage(status)});
  this.getDomHelper().setTextContent(this.statusEl_, MSG_OFFLINE_STATUS);
};


/**
 * Set the action element to show correct action(s) for a particular status.
 * @param {goog.gears.StatusType} status The offline status.
 */
goog.ui.OfflineStatusCard.prototype.configureActionLinks = function(status) {
  // Configure the action element.
  var actions = this.getActions(status);
  goog.dom.removeChildren(this.actionEl_);
  this.actionMap_.clear();

  if (actions) {
    var lastIdx = actions.length - 1;
    for (var i = 0; i <= lastIdx; i++) {
      // Ensure there is no padding to the right of the last action link.
      this.createLinkNode_(actions[i], i == lastIdx ?
          this.lastActionItemClassName_ : this.actionItemClassName_);
    }
  }
};


/**
 * Creates an action link element and styles it.
 * @param {Object} action An action object with message and event type.
 * @param {string} className The css class name to style the link with.
 * @private
 */
goog.ui.OfflineStatusCard.prototype.createLinkNode_ = function(
    action, className) {
  var actionEl = this.actionEl_;
  var dom = this.getDomHelper();
  var a = dom.createDom('span', className);
  dom.appendChild(actionEl, a);
  // A text node is needed here in order for links to wrap.
  dom.appendChild(actionEl, dom.createTextNode(' '));
  this.actionMap_.set(goog.getUid(a), action.eventType);
  goog.style.showElement(a, true);
  dom.setTextContent(a, action.message);
};


/**
 * Configure the progress bar element.
 * @param {goog.gears.StatusType} status The offline status.
 */
goog.ui.OfflineStatusCard.prototype.configureProgressElement =
    function(status) {
  var showProgress = this.shouldShowProgressBar(status);
  goog.style.showElement(this.progressEl_, showProgress);
  if (showProgress) {
    this.updateProgressStatus();
  }
};


/**
 * Returns true if we want to display a progress bar.
 * @param {goog.gears.StatusType} status The offline status.
 * @return {boolean} Whether we want to display a progress bar.
 */
goog.ui.OfflineStatusCard.prototype.shouldShowProgressBar = function(status) {
  return status == goog.gears.StatusType.SYNCING ||
      status == goog.gears.StatusType.CAPTURING;
};


/**
 * Handles a CHANGE event of the progress bar. Updates the status.
 * @param {goog.events.Event} e The event.
 * @private
 */
goog.ui.OfflineStatusCard.prototype.handleProgressChange_ = function(e) {
  this.updateProgressStatus();
};


/**
 * Handles a CLICK event on the action element. Dispatches the appropriate
 * action event type.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.ui.OfflineStatusCard.prototype.handleActionClick_ = function(e) {
  var actionEventType = /** @type {string} */ (this.actionMap_.get(
      goog.getUid(e.target)));
  if (actionEventType) {
    this.dispatchEvent(actionEventType);
  }
};


/**
 * Updates the status of the progress bar.
 * @protected
 */
goog.ui.OfflineStatusCard.prototype.updateProgressStatus = function() {
  this.getDomHelper().setTextContent(
      this.progressBarStatusEl_, this.getProgressStatusMessage());
};


/**
 * Gets the status message for the progress bar.
 * @return {string} The status message for the progress bar.
 */
goog.ui.OfflineStatusCard.prototype.getProgressStatusMessage = function() {
  var pb = this.progressBar_;
  var percentValue = Math.round((pb.getValue() - pb.getMinimum()) /
                                (pb.getMaximum() - pb.getMinimum()) * 100);
  /** @desc The percent complete status of the syncing. */
  var MSG_OFFLINE_PERCENT_COMPLETE = goog.getMsg(
      '{$num}% complete.', {'num': percentValue});
  return MSG_OFFLINE_PERCENT_COMPLETE;
};


/**
 * Gets the status message for the given status.
 * @param {goog.gears.StatusType} status The offline status.
 * @return {string} The status message.
 */
goog.ui.OfflineStatusCard.prototype.getStatusMessage = function(status) {
  var message = '';

  switch (status) {
    case goog.gears.StatusType.OFFLINE:
      /** @desc Status shown when the app is offline. */
      var MSG_OFFLINE_STATUS_OFFLINE_MESSAGE = goog.getMsg(
          'Offline. No connection available.');
      message = MSG_OFFLINE_STATUS_OFFLINE_MESSAGE;
      break;
    case goog.gears.StatusType.ONLINE:
      /** @desc Status shown when the app is online. */
      var MSG_OFFLINE_STATUS_ONLINE_MESSAGE = goog.getMsg('Online');
      message = MSG_OFFLINE_STATUS_ONLINE_MESSAGE;
      break;
    case goog.gears.StatusType.SYNCING:
      /** @desc Status shown when the app is synchronizing. */
      var MSG_OFFLINE_STATUS_SYNCING_MESSAGE = goog.getMsg('Synchronizing...');
      message = MSG_OFFLINE_STATUS_SYNCING_MESSAGE;
      break;
    case goog.gears.StatusType.CAPTURING:
      /** @desc Status shown when the app is capturing resources. */
      var MSG_OFFLINE_STATUS_CAPTURING_MESSAGE = goog.getMsg(
          'Updating software...');
      message = MSG_OFFLINE_STATUS_CAPTURING_MESSAGE;
      break;
    case goog.gears.StatusType.ERROR:
      /** @desc Status shown when an error has occured. */
      var MSG_OFFLINE_STATUS_ERROR_MESSAGE = goog.getMsg(
          'Errors have been found.');
      message = MSG_OFFLINE_STATUS_ERROR_MESSAGE;
      break;
    default:
      break;
  }
  return message;
};


/**
 * Gets the action to display for the given status.
 * @param {goog.gears.StatusType} status The offline status.
 * @return {Array.<Object>?} An array of action objects to display.
 */
goog.ui.OfflineStatusCard.prototype.getActions = function(status) {
  return null;
};


/**
 * Creates an action object containing a message for the action and event
 * type to dispatch if the action occurs.
 * @param {string} actionMessage The action message.
 * @param {string} actionEventType The action event type.
 * @return {Object} An object containing message and eventType properties.
 */
goog.ui.OfflineStatusCard.prototype.createActionObject = function(
    actionMessage, actionEventType) {
  return {message: actionMessage, eventType: actionEventType};
};


/**
 * Gets the additional message to display for the given status.
 * @param {goog.gears.StatusType} status The offline status.
 * @return {string} The additional message.
 */
goog.ui.OfflineStatusCard.prototype.getAdditionalMessage = function(status) {
  return '';
};


/** @override */
goog.ui.OfflineStatusCard.prototype.disposeInternal = function() {
  goog.ui.OfflineStatusCard.superClass_.disposeInternal.call(this);

  this.progressBar_.dispose();
  this.progressBar_ = null;

  this.actionMap_.clear();
  this.actionMap_ = null;

  this.statusEl_ = null;
  this.actionEl_ = null;
  this.messageEl_ = null;
  this.progressEl_ = null;
  this.progressStatusEl_ = null;
};
