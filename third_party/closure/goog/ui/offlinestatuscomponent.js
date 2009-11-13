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

// Copyright 2007 Google Inc. All Rights Reserved.

/**
 * @fileoverview A component that displays the offline status of an app.
 * Currently, it is used to show an icon with a tootip for the status.
 *
 * @see ../demos/offline.html
 */

goog.provide('goog.ui.OfflineStatusComponent');
goog.provide('goog.ui.OfflineStatusComponent.StatusClassNames');

goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.gears.StatusType');
goog.require('goog.positioning');
goog.require('goog.positioning.AnchoredPosition');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.Overflow');
goog.require('goog.ui.Component');
goog.require('goog.ui.Popup');



/**
 * An offline status component.
 * @param {goog.dom.DomHelper} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.OfflineStatusComponent = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
};
goog.inherits(goog.ui.OfflineStatusComponent, goog.ui.Component);


/**
 * The className's to use for the element of the component for each status type.
 * @enum {string}
 */
goog.ui.OfflineStatusComponent.StatusClassNames = {
  NOT_INSTALLED: goog.getCssName('goog-offlinestatus-notinstalled'),
  INSTALLED: goog.getCssName('goog-offlinestatus-installed'),
  PAUSED: goog.getCssName('goog-offlinestatus-paused'),
  OFFLINE: goog.getCssName('goog-offlinestatus-offline'),
  ONLINE: goog.getCssName('goog-offlinestatus-online'),
  SYNCING: goog.getCssName('goog-offlinestatus-syncing'),
  ERROR: goog.getCssName('goog-offlinestatus-error')
};


/**
 * Whether the component is dirty and requires an upate to its display.
 * @type {boolean}
 * @private
 */
goog.ui.OfflineStatusComponent.prototype.dirty_ = false;


/**
 * The status of the component.
 * @type {goog.gears.StatusType}
 * @private
 */
goog.ui.OfflineStatusComponent.prototype.status_ =
    goog.gears.StatusType.NOT_INSTALLED;


/**
 * The status of the component that is displayed.
 * @type {goog.gears.StatusType?}
 * @private
 */
goog.ui.OfflineStatusComponent.prototype.displayedStatus_ = null;


/**
 * The dialog that manages the install flow.
 * @type {goog.ui.OfflineInstallDialog?}
 * @private
 */
goog.ui.OfflineStatusComponent.prototype.dialog_ = null;


/**
 * The card for displaying the detailed status.
 * @type {goog.ui.OfflineStatusCard?}
 * @private
 */
goog.ui.OfflineStatusComponent.prototype.card_ = null;


/**
 * The popup for the OfflineStatusCard.
 * @type {goog.ui.Popup?}
 * @private
 */
goog.ui.OfflineStatusComponent.prototype.popup_ = null;


/**
 * CSS class name for the element.
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusComponent.prototype.className_ =
    goog.getCssName('goog-offlinestatus');


/**
 * @desc New feature text for the offline acces feature.
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusComponent.prototype.MSG_OFFLINE_NEW_FEATURE_ =
    goog.getMsg('New! Offline Access');


/**
 * @desc Connectivity status of the app indicating the app is paused (user
 * initiated offline).
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusComponent.prototype.MSG_OFFLINE_STATUS_PAUSED_TITLE_ =
    goog.getMsg('Paused (offline). Click to connect.');


/**
 * @desc Connectivity status of the app indicating the app is offline.
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusComponent.prototype.MSG_OFFLINE_STATUS_OFFLINE_TITLE_ =
    goog.getMsg('Offline. No connection available.');


/**
 * @desc Connectivity status of the app indicating the app is online.
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusComponent.prototype.MSG_OFFLINE_STATUS_ONLINE_TITLE_ =
    goog.getMsg('Online. Click for details.');


/**
 * @desc Connectivity status of the app indicating the app is synchronizing with
 * the server.
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusComponent.prototype.MSG_OFFLINE_STATUS_SYNCING_TITLE_ =
    goog.getMsg('Synchronizing. Click for details.');


/**
 * @desc Connectivity status of the app indicating errors have been found.
 * @type {string}
 * @private
 */
goog.ui.OfflineStatusComponent.prototype.MSG_OFFLINE_STATUS_ERROR_TITLE_ =
    goog.getMsg('Errors found. Click for details.');


/**
 * Gets the status of the offline component of the app.
 * @return {goog.gears.StatusType} The offline status.
 */
goog.ui.OfflineStatusComponent.prototype.getStatus = function() {
  return this.status_;
};



/**
 * Sets the status of the offline component of the app.
 * @param {goog.gears.StatusType} status The offline
 *     status.
 */
goog.ui.OfflineStatusComponent.prototype.setStatus = function(status) {
  if (this.isStatusDifferent(status)) {
    this.dirty_ = true;
  }

  this.status_ = status;
  if (this.isInDocument()) {
    this.update();
  }

  // Set the status of the card, if necessary.
  if (this.card_) {
    this.card_.setStatus(status);
  }
};


/**
 * Returns whether the given status is different from the currently
 * recorded status.
 * @param {goog.gears.StatusType} status The offline status.
 * @return {boolean} Whether the status is different.
 */
goog.ui.OfflineStatusComponent.prototype.isStatusDifferent = function(status) {
  return this.status_ != status;
};


/**
 * Sets the install dialog.
 * @param {goog.ui.OfflineInstallDialog} dialog The dialog.
 */
goog.ui.OfflineStatusComponent.prototype.setInstallDialog = function(dialog) {
  // If there is a current dialog, remove it.
  if (this.dialog_ && this.indexOfChild(this.dialog_) >= 0) {
    this.removeChild(this.dialog_);
  }
  this.dialog_ = dialog;
};


/**
 * Gets the install dialog.
 * @return {goog.ui.OfflineInstallDialog} dialog The dialog.
 */
goog.ui.OfflineStatusComponent.prototype.getInstallDialog = function() {
  return this.dialog_;
};


/**
 * Sets the status card.
 * @param {goog.ui.OfflineStatusCard} card The card.
 */
goog.ui.OfflineStatusComponent.prototype.setStatusCard = function(card) {
  // If there is a current card, remove it.
  if (this.card_) {
    this.getHandler().unlisten(this.card_,
        goog.ui.OfflineStatusCard.EventType.DISMISS,
        this.performStatusAction, false, this);
    this.popup_.dispose();
    if (this.indexOfChild(this.card_) >= 0) {
      this.removeChild(this.card_);
    }
    this.popup_ = null;
    this.card_ = null;
  }
  this.card_ = card;
  this.getHandler().listen(this.card_,
      goog.ui.OfflineStatusCard.EventType.DISMISS,
      this.performStatusAction, false, this);
  card.setStatus(this.status_);
};


/**
 * Gets the status card.
 * @return {goog.ui.OfflineStatusCard} The card.
 */
goog.ui.OfflineStatusComponent.prototype.getStatusCard = function() {
  return this.card_;
};


/**
 * Creates the initial DOM representation for the component.
 */
goog.ui.OfflineStatusComponent.prototype.createDom = function() {
  var anchorProps = {
    'class': this.className_,
    'href': '#'
  };
  this.setElementInternal(
      this.getDomHelper().createDom('a', anchorProps));
  this.update();
};


/** @inheritDoc */
goog.ui.OfflineStatusComponent.prototype.enterDocument = function() {
  goog.ui.OfflineStatusComponent.superClass_.enterDocument.call(this);

  this.getHandler().listen(
      this.getElement(), goog.events.EventType.CLICK, this.handleClick_);

  if (this.dirty_) {
    this.update();
  }
};


/**
 * Updates the display of the component.
 */
goog.ui.OfflineStatusComponent.prototype.update = function() {
  if (this.getElement()) {
    var status = this.getStatus();
    var messageInfo = this.getMessageInfo(status);

    // Set the title.
    var element = this.getElement();
    element.title = messageInfo.title;

    // Set the appropriate class.
    var previousStatus = this.displayStatus_;
    var previousStatusClassName = this.getStatusClassName_(previousStatus);
    var currentStatusClassName = this.getStatusClassName_(status);
    if (previousStatus &&
        goog.dom.classes.has(element, previousStatusClassName)) {
      goog.dom.classes.swap(
          element, previousStatusClassName, currentStatusClassName);
    } else {
      goog.dom.classes.add(element, currentStatusClassName);
    }

    // Set the current display status
    this.displayStatus_ = status;

    // Set the text.
    if (messageInfo.textIsHtml) {
      element.innerHTML = messageInfo.text;
    } else {
      this.getDomHelper().setTextContent(element, messageInfo.text);
    }

    // Clear the dirty state.
    this.dirty_ = false;
  }
};


/**
 * Gets the messaging info for the given status.
 * @param {goog.gears.StatusType} status Status to get the message info for.
 * @return {Object} Object that has three properties - text (string),
 *     textIsHtml (boolean), and title (string).
 */
goog.ui.OfflineStatusComponent.prototype.getMessageInfo = function(status) {
  var title = '';
  var text = '&nbsp;&nbsp;&nbsp;';
  var textIsHtml = true;

  switch (status) {
    case goog.gears.StatusType.NOT_INSTALLED:
    case goog.gears.StatusType.INSTALLED:
      text = this.MSG_OFFLINE_NEW_FEATURE_;
      textIsHtml = false;
      break;
    case goog.gears.StatusType.PAUSED:
      title = this.MSG_OFFLINE_STATUS_PAUSED_TITLE_;
      break;
    case goog.gears.StatusType.OFFLINE:
      title = this.MSG_OFFLINE_STATUS_OFFLINE_TITLE_;
      break;
    case goog.gears.StatusType.ONLINE:
      title = this.MSG_OFFLINE_STATUS_ONLINE_TITLE_;
      break;
    case goog.gears.StatusType.SYNCING:
      title = this.MSG_OFFLINE_STATUS_SYNCING_TITLE_;
      break;
    case goog.gears.StatusType.ERROR:
      title = this.MSG_OFFLINE_STATUS_ERROR_TITLE_;
      break;
    default:
      break;
  }

  return {text: text, textIsHtml: textIsHtml, title: title};
};


/**
 * Gets the CSS className for the given status.
 * @param {goog.gears.StatusType} status Status to get the className for.
 * @return {string} The className.
 * @private
 */
goog.ui.OfflineStatusComponent.prototype.getStatusClassName_ = function(
    status) {
  var className = '';
  switch (status) {
    case goog.gears.StatusType.NOT_INSTALLED:
      className =
          goog.ui.OfflineStatusComponent.StatusClassNames.NOT_INSTALLED;
      break;
    case goog.gears.StatusType.INSTALLED:
      className = goog.ui.OfflineStatusComponent.StatusClassNames.INSTALLED;
      break;
    case goog.gears.StatusType.PAUSED:
      className = goog.ui.OfflineStatusComponent.StatusClassNames.PAUSED;
      break;
    case goog.gears.StatusType.OFFLINE:
      className = goog.ui.OfflineStatusComponent.StatusClassNames.OFFLINE;
      break;
    case goog.gears.StatusType.ONLINE:
      className = goog.ui.OfflineStatusComponent.StatusClassNames.ONLINE;
      break;
    case goog.gears.StatusType.SYNCING:
    case goog.gears.StatusType.CAPTURING:
      className = goog.ui.OfflineStatusComponent.StatusClassNames.SYNCING;
      break;
    case goog.gears.StatusType.ERROR:
      className = goog.ui.OfflineStatusComponent.StatusClassNames.ERROR;
      break;
  default:
    break;
  }
  return className;
};


/**
 * Handles a click on the component. Opens the applicable install dialog or
 * status card.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 * @return {boolean} Always false to prevent the anchor navigation.
 */
goog.ui.OfflineStatusComponent.prototype.handleClick_ = function(e) {
  this.performAction();
  return false;
};


/**
 * Performs the action as if the component was clicked.
 */
goog.ui.OfflineStatusComponent.prototype.performAction = function() {
  var status = this.getStatus();

  if (status == goog.gears.StatusType.NOT_INSTALLED ||
      status == goog.gears.StatusType.INSTALLED) {
    this.performEnableAction();
  } else {
    this.performStatusAction();
  }
};


/**
 * Performs the action to start the flow of enabling the offline feature of
 * the application.
 */
goog.ui.OfflineStatusComponent.prototype.performEnableAction = function() {
  // If Gears is not installed or if it is installed but not enabled, then
  // show the install dialog.
  var dialog = this.dialog_;
  if (dialog) {
    if (!dialog.isInDocument()) {
      this.addChild(dialog);
      dialog.render(this.getDomHelper().getDocument().body)
    }
    dialog.setVisible(true);
  }
};


/**
 * Performs the action to show the offline status.
 */
goog.ui.OfflineStatusComponent.prototype.performStatusAction = function() {
  // Shows the offline status card.
  var card = this.card_;
  if (card) {
    if (!this.popup_) {
      if (!card.getElement()) {
        card.createDom();
      }
      this.insertCardElement(card);
      this.addChild(card);
      var popup = this.getPopupInternal();
      var pos = new goog.positioning.AnchoredPosition(
          this.getElement(), goog.positioning.Corner.BOTTOM_START);

      // Override to pass in overflow
      pos.reposition = function(element, popupCorner, opt_margin) {
        goog.positioning.positionAtAnchor(this.element, this.corner, element,
            popupCorner, null, opt_margin, goog.positioning.Overflow.ADJUST_X);
      };

      popup.setPosition(pos);
      popup.setElement(card.getElement());
    }
    this.popup_.setVisible(!this.popup_.isOrWasRecentlyVisible());
  }
};


/**
 * Inserts the card into the document body.
 * @param {goog.ui.OfflineStatusCard} card The offline status card.
 * @protected
 */
goog.ui.OfflineStatusComponent.prototype.insertCardElement = function(card) {
  this.getDomHelper().getDocument().body.appendChild(card.getElement());
};


/**
 * @return {goog.ui.Popup} A popup object, if none exists a new one is created.
 * @protected
 */
goog.ui.OfflineStatusComponent.prototype.getPopupInternal = function() {
  if (!this.popup_) {
     this.popup_ = new goog.ui.Popup();
     this.popup_.setMargin(3, 0, 0, 0);
  }
  return this.popup_;
};


/** @inheritDoc */
goog.ui.OfflineStatusComponent.prototype.disposeInternal = function() {
  goog.ui.OfflineStatusComponent.superClass_.disposeInternal.call(this);

  if (this.dialog_) {
    this.dialog_.dispose();
    this.dialog_ = null;
  }

  if (this.card_) {
    this.card_.dispose();
    this.card_ = null;
  }

  if (this.popup_) {
    this.popup_.dispose();
    this.popup_ = null;
  }
};
