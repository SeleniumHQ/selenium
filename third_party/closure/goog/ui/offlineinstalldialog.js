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
 * @fileoverview A dialog for presenting the offline (Gears) install flow. It
 * show information on how to install Gears if Gears is not already installed,
 * or will offer the option to enable the application for Gears support.
 *
*
 * @see ../demos/offline.html
 */

goog.provide('goog.ui.OfflineInstallDialog');
goog.provide('goog.ui.OfflineInstallDialog.ButtonKeyType');
goog.provide('goog.ui.OfflineInstallDialog.EnableScreen');
goog.provide('goog.ui.OfflineInstallDialog.InstallScreen');
goog.provide('goog.ui.OfflineInstallDialog.InstallingGearsScreen');
goog.provide('goog.ui.OfflineInstallDialog.ScreenType');
goog.provide('goog.ui.OfflineInstallDialog.UpgradeScreen');
goog.provide('goog.ui.OfflineInstallDialogScreen');

goog.require('goog.Disposable');
goog.require('goog.dom.classes');
goog.require('goog.gears');
goog.require('goog.string');
goog.require('goog.string.StringBuffer');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.Dialog.ButtonSet');
goog.require('goog.ui.Dialog.EventType');
goog.require('goog.window');


/**
 * An offline install dialog.
 * @param {string=} opt_class CSS class name for the dialog element, also used
 *    as a class name prefix for related elements; defaults to modal-dialog.
 * @param {boolean=} opt_useIframeMask Work around windowed controls z-index
 *     issue by using an iframe instead of a div for bg element.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Dialog}
 */
goog.ui.OfflineInstallDialog = function(
    opt_class, opt_useIframeMask, opt_domHelper) {
  goog.ui.Dialog.call(this, opt_class, opt_useIframeMask, opt_domHelper);

  /**
   * This is used to allow more screens to be added programatically. It is a
   * map from screen type to a constructor that extends
   * goog.ui.OfflineInstallDialogScreen.
   * @type {Object}
   * @private
   */
  this.screenConstructors_ = {};

  /**
   * This is a map of constructed screens. It uses the constructors in the
   * screenConstructors_ map.
   * @type {Object}
   * @private
   */
  this.screens_ = {};

  this.currentScreenType_ = goog.gears.hasFactory() ?
      goog.ui.OfflineInstallDialog.ScreenType.ENABLE :
      goog.ui.OfflineInstallDialog.ScreenType.INSTALL;

  this.registerScreenType(goog.ui.OfflineInstallDialog.EnableScreen.TYPE,
                          goog.ui.OfflineInstallDialog.EnableScreen);
  this.registerScreenType(goog.ui.OfflineInstallDialog.InstallScreen.TYPE,
                          goog.ui.OfflineInstallDialog.InstallScreen);
  this.registerScreenType(goog.ui.OfflineInstallDialog.UpgradeScreen.TYPE,
                          goog.ui.OfflineInstallDialog.UpgradeScreen);
  this.registerScreenType(
      goog.ui.OfflineInstallDialog.InstallingGearsScreen.TYPE,
      goog.ui.OfflineInstallDialog.InstallingGearsScreen);
};
goog.inherits(goog.ui.OfflineInstallDialog, goog.ui.Dialog);


/**
 * Buttons keys of the dialog.
 * @enum {string}
 */
goog.ui.OfflineInstallDialog.ButtonKeyType = {
  INSTALL: 'io',
  UPGRADE: 'u',
  ENABLE: 'eo',
  CANCEL: 'ca',
  CLOSE: 'cl',
  OK: 'ok'
};


/**
 * The various types of screens the dialog can display.
 * @enum {string}
 */
goog.ui.OfflineInstallDialog.ScreenType = {
  INSTALL: 'i',
  INSTALLING_GEARS: 'ig',
  ENABLE: 'e',
  UPGRADE: 'u'
};


/**
 * Whether the dialog is dirty and requires an upate to its display.
 * @type {boolean}
 * @private
 */
goog.ui.OfflineInstallDialog.prototype.dirty_ = false;


/**
 * The type of the current screen of the dialog.
 * @type {string}
 * @private
 */
goog.ui.OfflineInstallDialog.prototype.currentScreenType_;


/**
 * The url of the application.
 * @type {string}
 * @private
 */
goog.ui.OfflineInstallDialog.prototype.appUrl_ = '';


/**
 * The url of the page to download Gears from.
 * @type {string}
 * @private
 */
goog.ui.OfflineInstallDialog.prototype.gearsDownloadPageUrl_ = '';


/**
 * Marks as dirty and calls update if needed.
 * @private
 */
goog.ui.OfflineInstallDialog.prototype.invalidateAndUpdate_ = function() {
  this.dirty_ = true;
  if (this.getElement() && this.isVisible()) {
    this.update();
  }
};


/**
 * Sets the URL of the appliction to show in the dialog.
 * @param {string} url The application URL.
 */
goog.ui.OfflineInstallDialog.prototype.setAppUrl = function(url) {
  this.appUrl_ = url;
  this.invalidateAndUpdate_();
};


/**
 * @return {string} The application URL.
 */
goog.ui.OfflineInstallDialog.prototype.getAppUrl = function() {
  return this.appUrl_;
};


/**
 * Sets the Gears download page URL.
 * @param {string} url The Gears download page URL.
 */
goog.ui.OfflineInstallDialog.prototype.setGearsDownloadPageUrl = function(url) {
  this.gearsDownloadPageUrl_ = url;
  this.invalidateAndUpdate_();
};


/**
 * @return {string} The Gears download page URL.
 */
goog.ui.OfflineInstallDialog.prototype.getGearsDownloadPageUrl = function() {
  return this.gearsDownloadPageUrl_;
};


/**
 * This allows you to provide a shorter and more user friendly URL to the Gears
 * download page since the Gears download URL can get quite ugly with all its
 * params.
 * @return {string} The Gears download page friendly URL.
 */
goog.ui.OfflineInstallDialog.prototype.getGearsDownloadPageFriendlyUrl =
    function() {
  return this.gearsDownloadPageFriendlyUrl_ || this.gearsDownloadPageUrl_;
};


/**
 * Sets the Gears download page friendly URL.
 * @see #getGearsDownloadPageFriendlyUrl
 * @param {string} url The Gears download page friendly URL.
 */
goog.ui.OfflineInstallDialog.prototype.setGearsDownloadPageFriendlyUrl =
    function(url) {
  this.gearsDownloadPageFriendlyUrl_ = url;
  this.invalidateAndUpdate_();
};


/**
 * Sets the screen type.
 * @param {string} screenType The screen type.
 */
goog.ui.OfflineInstallDialog.prototype.setCurrentScreenType = function(
    screenType) {
  if (screenType != this.currentScreenType_) {
    // If we have a current screen object then call deactivate on it
    var currentScreen = this.getCurrentScreen();
    if (currentScreen && this.isInDocument()) {
      currentScreen.deactivate();
    }
    this.currentScreenType_ = screenType;
    this.invalidateAndUpdate_();
  }
};


/**
 * @return {string} The screen type.
 */
goog.ui.OfflineInstallDialog.prototype.getCurrentScreenType = function() {
  return this.currentScreenType_;
};


/**
 * @return {goog.ui.OfflineInstallDialogScreen?} The current screen object.
 */
goog.ui.OfflineInstallDialog.prototype.getCurrentScreen = function() {
  return this.getScreen(this.currentScreenType_);
};


/**
 * Returns the screen object for a given registered type or null if no such type
 * exists. This will create a screen object for a registered type as needed.
 * @param {string} type  The type of screen to get.
 * @return {goog.ui.OfflineInstallDialogScreen?} The screen object.
 */
goog.ui.OfflineInstallDialog.prototype.getScreen = function(type) {
  if (this.screens_[type]) {
    return this.screens_[type];
  }
  // Construct lazily as needed
  if (this.screenConstructors_[type]) {
    return this.screens_[type] = new this.screenConstructors_[type](this);
  }
  return null;
};


/**
 * Registers a screen constructor to be usable with the dialog.
 * @param {string} type  The type of this screen.
 * @param {Function} constr  A function that represents a constructor that
 *     extends goog.ui.OfflineInstallDialogScreen.
 */
goog.ui.OfflineInstallDialog.prototype.registerScreenType = function(type,
                                                                     constr) {
  this.screenConstructors_[type] = constr;
  // Remove screen in case it already exists.
  if (this.screens_[type]) {
    var isCurrenScreenType = this.currentScreenType_ == type;
    this.screens_[type].dispose();
    delete this.screens_[type];
    if (isCurrenScreenType) {
      this.invalidateAndUpdate_();
    }
  }
};


/**
 * Registers an instance of a screen to be usable with the dialog.
 * @param {goog.ui.OfflineInstallDialogScreen} screen The screen to register.
 */
goog.ui.OfflineInstallDialog.prototype.registerScreen = function(screen) {
  this.screens_[screen.getType()] = screen;
};


/** @inheritDoc */
goog.ui.OfflineInstallDialog.prototype.setVisible = function(visible) {
  if (this.isInDocument() && visible) {
    if (this.dirty_) {
      this.update();
    }
  }

  goog.ui.OfflineInstallDialog.superClass_.setVisible.call(this, visible);
};


/** @inheritDoc */
goog.ui.OfflineInstallDialog.prototype.createDom = function() {
  goog.ui.OfflineInstallDialog.superClass_.createDom.call(this);
  this.update();
};


/** @inheritDoc */
goog.ui.OfflineInstallDialog.prototype.enterDocument = function() {
  goog.ui.OfflineInstallDialog.superClass_.enterDocument.call(this);

  this.getHandler().listen(
      this, goog.ui.Dialog.EventType.SELECT, this.handleSelect_);

  if (this.dirty_) {
    this.update();
  }
};


/**
 * Updates the dialog. This will ensure the correct screen is shown.
 */
goog.ui.OfflineInstallDialog.prototype.update = function() {
  if (this.getElement()) {
    var screen = this.getCurrentScreen();
    if (screen) {
      screen.activate();
    }

    // Clear the dirty state.
    this.dirty_ = false;
  }
};


/**
 * Handles the SELECT_EVENT for the current dialog. Forward the event to the
 * correct screen object and let the screen decide where to go next.
 * @param {goog.ui.Dialog.Event} e The event.
 * @private
 */
goog.ui.OfflineInstallDialog.prototype.handleSelect_ = function(e) {
  var screen = this.getCurrentScreen();
  if (screen) {
    screen.handleSelect(e);
  }
};


/**
 * Opens a new browser window with the Gears download page and changes
 * the screen to the installing gears page.
 */
goog.ui.OfflineInstallDialog.prototype.goToGearsDownloadPage = function() {
  goog.window.open(this.gearsDownloadPageUrl_);
};


/** @inheritDoc */
goog.ui.OfflineInstallDialog.prototype.disposeInternal = function() {
  goog.ui.OfflineInstallDialog.superClass_.disposeInternal.call(this);

  delete this.screenConstructors_;
  for (var type in this.screens_) {
    this.screens_[type].dispose();
  }
  delete this.screens_;
};



/**
 * Represents a screen on the dialog. You can create new screens and add them
 * to the offline install dialog by calling registerScreenType and
 * setCurrentScreenType.
 * @param {goog.ui.OfflineInstallDialog} dialog  The dialog this screen should
 *     work with.
 * @param {string} type  The screen type name.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.ui.OfflineInstallDialogScreen = function(dialog, type) {
  /**
   * @type {goog.ui.OfflineInstallDialog}
   * @protected
   * @suppress {underscore}
   */
  this.dialog_ = dialog;

  /**
   * @type {string}
   * @private
   */
  this.type_ = type;

  /**
   * @type {goog.dom.DomHelper}
   * @private
   */
  this.dom_ = dialog.getDomHelper();
};
goog.inherits(goog.ui.OfflineInstallDialogScreen, goog.Disposable);


/**
 * The HTML content to show on the screen.
 * @type {string}
 * @private
 */
goog.ui.OfflineInstallDialogScreen.prototype.content_ = '';


/**
 * The title to show on the dialog.
 * @type {string}
 * @private
 */
goog.ui.OfflineInstallDialogScreen.prototype.title_ = '';


/**
 * The button set to use with this screen.
 * @type {goog.ui.Dialog.ButtonSet}
 * @private
 */
goog.ui.OfflineInstallDialogScreen.prototype.buttonSet_;


/**
 * @return {goog.ui.OfflineInstallDialog} The dialog the screen will be
 *     displayed in.
 */
goog.ui.OfflineInstallDialogScreen.prototype.getDialog = function() {
  return this.dialog_;
};


/**
 * Returns the type of the screen. This is used to identify the screen type this
 * reflects.
 * @return {string} The type of the screen.
 */
goog.ui.OfflineInstallDialogScreen.prototype.getType = function() {
  return this.type_;
};


/**
 * @return {goog.ui.Dialog.ButtonSet} The button set to use with this screen.
 */
goog.ui.OfflineInstallDialogScreen.prototype.getButtonSet = function() {
  return this.buttonSet_;
};


/**
 * Sets the button set to use with this screen.
 * @param {goog.ui.Dialog.ButtonSet} bs The button set to use.
 */
goog.ui.OfflineInstallDialogScreen.prototype.setButtonSet = function(bs) {
  this.buttonSet_ = bs;
};


/**
 * @return {string} The HTML content to used for this screen.
 */
goog.ui.OfflineInstallDialogScreen.prototype.getContent = function() {
  return this.content_;
};


/**
 * Sets the HTML content to use for this screen.
 * @param {string} html  The HTML text to use as content for the screen.
 */
goog.ui.OfflineInstallDialogScreen.prototype.setContent = function(html) {
  this.content_ = html;
};


/**
 * @return {string} The text title to used for the dialog when this screen is
 *     shown.
 */
goog.ui.OfflineInstallDialogScreen.prototype.getTitle = function() {
  return this.title_ || this.dialog_.getTitle();
};


/**
 * Sets the plain text title to use for this screen.
 * @param {string} title  The plain text to use as a title on the dialog.
 */
goog.ui.OfflineInstallDialogScreen.prototype.setTitle = function(title) {
  this.title_ = title;
};


/**
 * @return {string} A custom class name that should be added to the dialog when
 *     this screen is active.
 */
goog.ui.OfflineInstallDialogScreen.prototype.getCustomClassName = function() {
  return this.customClassName_;
};


/**
 * Sets the custom class name that should be added to the dialog when this
 * screen is active.
 * @param {string} customClassName  The custom class name.
 */
goog.ui.OfflineInstallDialogScreen.prototype.setCustomClassName = function(
    customClassName) {
  this.customClassName_ = customClassName;
};


/**
 * Called when the screen is shown. At this point the dialog is in the document.
 */
goog.ui.OfflineInstallDialogScreen.prototype.activate = function() {
  var d = this.dialog_;
  // Add custom class.
  var customClassName = this.getCustomClassName();
  if (customClassName) {
    goog.dom.classes.add(d.getElement(), customClassName);
  }

  d.setTitle(this.getTitle());
  d.setContent(this.getContent());
  d.setButtonSet(this.getButtonSet());
};


/**
 * Called when the screen is hidden.  At this point the dialog is in the
 * document.
 */
goog.ui.OfflineInstallDialogScreen.prototype.deactivate = function() {
  // Remove custom class name
  var customClassName = this.getCustomClassName();
  if (customClassName) {
    goog.dom.classes.remove(this.dialog_.getElement(), customClassName);
  }
};


/**
 * Called when the user clicks any of the buttons for this dialog screen.
 * @param {goog.ui.Dialog.Event} e The dialog event.
 */
goog.ui.OfflineInstallDialogScreen.prototype.handleSelect = function(e) {

};



// Classes for some of the standard screens

/**
 * This screen is shown to users that do have Gears installed but have
 * not enabled the current application for offline access.
 * @param {goog.ui.OfflineInstallDialog} dialog  The dialog this is a screen
 *     for.
 * @constructor
 * @extends {goog.ui.OfflineInstallDialogScreen}
 */
goog.ui.OfflineInstallDialog.EnableScreen = function(dialog) {
  goog.ui.OfflineInstallDialogScreen.call(this, dialog,
      goog.ui.OfflineInstallDialog.EnableScreen.TYPE);

  /**
   * @desc Text of button that enables offline functionality for the app.
   * @hidden
   */
  var MSG_OFFLINE_DIALOG_ENABLE_GEARS = goog.getMsg('Enable offline access');

  /**
   * @type {string}
   * @protected
   * @suppress {underscore}
   */
  this.enableMsg_ = MSG_OFFLINE_DIALOG_ENABLE_GEARS;
};
goog.inherits(goog.ui.OfflineInstallDialog.EnableScreen,
              goog.ui.OfflineInstallDialogScreen);


/**
 * The type of this screen.
 * @type {string}
 */
goog.ui.OfflineInstallDialog.EnableScreen.TYPE =
    goog.ui.OfflineInstallDialog.ScreenType.ENABLE;


/**
 * Should enable button action be performed immediately when the user presses
 * the enter key anywhere on the dialog. This should be set to false if there
 * are other action handlers on the dialog that may stop propagation.
 * @type {boolean}
 * @protected
 */
goog.ui.OfflineInstallDialog.EnableScreen.prototype.enableOnEnter = true;


/**
 * @return {goog.ui.Dialog.ButtonSet} The button set for the enable screen.
 */
goog.ui.OfflineInstallDialog.EnableScreen.prototype.getButtonSet = function() {
  if (!this.buttonSet_) {

    /**
     * @desc Text of button that cancels setting up Offline.
     * @hidden
     */
    var MSG_OFFLINE_DIALOG_CANCEL = goog.getMsg('Cancel');
    var buttonSet = this.buttonSet_ = new goog.ui.Dialog.ButtonSet(this.dom_);
    buttonSet.set(goog.ui.OfflineInstallDialog.ButtonKeyType.ENABLE,
        this.enableMsg_, this.enableOnEnter, false);
    buttonSet.set(goog.ui.OfflineInstallDialog.ButtonKeyType.CANCEL,
        MSG_OFFLINE_DIALOG_CANCEL, false, true);
  }

  return this.buttonSet_;
};



/**
 * This screen is shown to users that do have Gears installed but have
 * not enabled the current application for offline access.
 * @param {goog.ui.OfflineInstallDialog} dialog  The dialog this is a screen
 *     for.
 * @param {string=} opt_type An optional type, for specifying a more specific
 *     type of dialog. Only for use by subclasses.
 * @constructor
 * @extends {goog.ui.OfflineInstallDialogScreen}
 */
goog.ui.OfflineInstallDialog.InstallScreen = function(dialog, opt_type) {
  goog.ui.OfflineInstallDialogScreen.call(this, dialog,
      opt_type || goog.ui.OfflineInstallDialog.InstallScreen.TYPE);

  /**
   * @desc The description of the the install step to perform in order to
   *     enable offline access.
   * @hidden
   */
  var MSG_OFFLINE_DIALOG_INSTALL_GEARS = goog.getMsg('Install Gears');

  /**
   * @type {string}
   * @protected
   * @suppress {underscore}
   */
  this.installMsg_ = MSG_OFFLINE_DIALOG_INSTALL_GEARS;

  /**
   * @desc Text of button that opens the download page for Gears.
   * @hidden
   */
  var MSG_INSTALL_GEARS = goog.getMsg('Get Gears now');

  /**
   * @type {string}
   * @protected
   * @suppress {underscore}
   */
  this.enableMsg_ = MSG_INSTALL_GEARS;

  /**
   * @desc Text of button that cancels setting up Offline.
   * @hidden
   */
  var MSG_OFFLINE_DIALOG_CANCEL_2 = goog.getMsg('Cancel');

  /**
   * @type {string}
   * @private
   */
  this.cancelMsg_ = MSG_OFFLINE_DIALOG_CANCEL_2;
};
goog.inherits(goog.ui.OfflineInstallDialog.InstallScreen,
              goog.ui.OfflineInstallDialogScreen);


/**
 * The type of this screen.
 * @type {string}
 */
goog.ui.OfflineInstallDialog.InstallScreen.TYPE =
    goog.ui.OfflineInstallDialog.ScreenType.INSTALL;


/**
 * The text to show before the installation steps.
 * @type {string}
 * @private
 */
goog.ui.OfflineInstallDialog.InstallScreen.prototype.installDescription_ = '';


/**
 * The CSS className to use when showing the app url.
 * @type {string}
 * @private
 */
goog.ui.OfflineInstallDialog.InstallScreen.prototype.appUrlClassName_ =
    goog.getCssName('goog-offlinedialog-url');


/**
 * The CSS className for the element that contains the install steps.
 * @type {string}
 * @private
 */
goog.ui.OfflineInstallDialog.InstallScreen.prototype.stepsClassName_ =
    goog.getCssName('goog-offlinedialog-steps');


/**
 * The CSS className for each step element.
 * @type {string}
 * @private
 */
goog.ui.OfflineInstallDialog.InstallScreen.prototype.stepClassName_ =
    goog.getCssName('goog-offlinedialog-step');


/**
 * The CSS className for the element that shows the step number.
 * @type {string}
 * @private
 */
goog.ui.OfflineInstallDialog.InstallScreen.prototype.stepNumberClassName_ =
    goog.getCssName('goog-offlinedialog-step-number');


/**
 * The CSS className for the element that shows the step desccription.
 * @type {string}
 * @private
 */
goog.ui.OfflineInstallDialog.InstallScreen.prototype.stepDescriptionClassName_ =
    goog.getCssName('goog-offlinedialog-step-description');


/**
 * Should install button action be performed immediately when the user presses
 * the enter key anywhere on the dialog. This should be set to false if there
 * are other action handlers on the dialog that may stop propagation.
 * @type {boolean}
 * @protected
 */
goog.ui.OfflineInstallDialog.InstallScreen.prototype.isInstallButtonDefault =
    true;


/**
 * @return {goog.ui.Dialog.ButtonSet} The button set for the install screen.
 */
goog.ui.OfflineInstallDialog.InstallScreen.prototype.getButtonSet = function() {
  if (!this.buttonSet_) {
    var buttonSet = this.buttonSet_ = new goog.ui.Dialog.ButtonSet(this.dom_);
    buttonSet.set(goog.ui.OfflineInstallDialog.ButtonKeyType.INSTALL,
        this.enableMsg_, this.isInstallButtonDefault, false);
    buttonSet.set(goog.ui.OfflineInstallDialog.ButtonKeyType.CANCEL,
        this.cancelMsg_, false, true);
  }

  return this.buttonSet_;
};


/**
 * Sets the install description. This is the text before the installation steps.
 * @param {string} description  The install description.
 */
goog.ui.OfflineInstallDialog.InstallScreen.prototype.setInstallDescription =
    function(description) {
  this.installDescription_ = description;
};


/** @inheritDoc */
goog.ui.OfflineInstallDialog.InstallScreen.prototype.getContent = function() {
  if (!this.content_) {
    var sb = new goog.string.StringBuffer(this.installDescription_);

    /**
     * @desc Header for the section that states the steps for the user to
     *     perform in order to enable offline access.
     * @hidden
     */
    var MSG_OFFLINE_DIALOG_NEED_TO = goog.getMsg('You\'ll need to:');
    sb.append('<div class="', this.stepsClassName_, '">',
        MSG_OFFLINE_DIALOG_NEED_TO);

    // Create and append the html for step #1.

    sb.append(this.getStepHtml_(1, this.installMsg_));

    // Create and append the html for step #2.
    /**
     * @desc One of the steps to perform in order to enable offline access.
     * @hidden
     */
    var MSG_OFFLINE_DIALOG_RESTART_BROWSER = goog.getMsg(
        'Restart your browser');
    sb.append(this.getStepHtml_(2, MSG_OFFLINE_DIALOG_RESTART_BROWSER));

    // Create and append the html for step #3.
    /**
     * @desc One of the steps to perform in order to enable offline access.
     * @hidden
     */
    var MSG_OFFLINE_DIALOG_COME_BACK = goog.getMsg('Come back to {$appUrl}!',
        {'appUrl': '<span class="' + this.appUrlClassName_ + '">' +
            this.dialog_.getAppUrl() + '</span>'});
    sb.append(this.getStepHtml_(3, MSG_OFFLINE_DIALOG_COME_BACK));

    // Close the enclosing element.
    sb.append('</div>');

    this.content_ = String(sb);
  }
  return this.content_;
};


/**
 * Creats the html for a step.
 * @param {number} stepNumber The number of the step.
 * @param {string} description The description of the step.
 * @private
 * @return {string} The step HTML in string form.
 */
goog.ui.OfflineInstallDialog.InstallScreen.prototype.getStepHtml_ = function(
    stepNumber, description) {
  return goog.string.buildString('<div class="', this.stepClassName_,
      '"><span class="', this.stepNumberClassName_, '">', stepNumber,
      '</span><span class="', this.stepDescriptionClassName_, '">',
      description, '</span></div>');
};


/**
 * Overrides to go to Gears page.
 * @inheritDoc
 */
goog.ui.OfflineInstallDialog.InstallScreen.prototype.handleSelect =
    function(e) {
  switch (e.key) {
    case goog.ui.OfflineInstallDialog.ButtonKeyType.INSTALL:
    case goog.ui.OfflineInstallDialog.ButtonKeyType.UPGRADE:
      e.preventDefault();
      this.dialog_.goToGearsDownloadPage();
      this.dialog_.setCurrentScreenType(
          goog.ui.OfflineInstallDialog.ScreenType.INSTALLING_GEARS);
      break;
  }
};



/**
 * This screen is shown to users that needs to update their version of Gears
 * before they can enabled the current application for offline access.
 * @param {goog.ui.OfflineInstallDialog} dialog  The dialog this is a screen
 *     for.
 * @constructor
 * @extends {goog.ui.OfflineInstallDialog.InstallScreen}
 */
goog.ui.OfflineInstallDialog.UpgradeScreen = function(dialog) {
  goog.ui.OfflineInstallDialog.InstallScreen.call(this, dialog,
      goog.ui.OfflineInstallDialog.UpgradeScreen.TYPE);

  /**
   * @desc The description of the the upgrade step to perform in order to enable
   *     offline access.
   * @hidden
   */
  var MSG_OFFLINE_DIALOG_INSTALL_NEW_GEARS = goog.getMsg(
      'Install a new version of Gears');

  /**
   * Override to say upgrade instead of install.
   * @type {string}
   * @protected
   * @suppress {underscore}
   */
  this.installMsg_ = MSG_OFFLINE_DIALOG_INSTALL_NEW_GEARS;

  /**
   * @desc Text of button that opens the download page for Gears for an
   *     upgrade.
   * @hidden
   */
  var MSG_OFFLINE_DIALOG_UPGRADE_GEARS =
      goog.getMsg('Upgrade Gears now');

  /**
   * Override the text on the button to show upgrade instead of install.
   * @type {string}
   * @protected
   * @suppress {underscore}
   */
  this.enableMsg_ = MSG_OFFLINE_DIALOG_UPGRADE_GEARS;
};
goog.inherits(goog.ui.OfflineInstallDialog.UpgradeScreen,
              goog.ui.OfflineInstallDialog.InstallScreen);


/**
 * The type of this screen.
 * @type {string}
 */
goog.ui.OfflineInstallDialog.UpgradeScreen.TYPE =
    goog.ui.OfflineInstallDialog.ScreenType.UPGRADE;


/**
 * Should upgrade button action be performed immediately when the user presses
 * the enter key anywhere on the dialog. This should be set to false if there
 * are other action handlers on the dialog that may stop propagation.
 * @type {boolean}
 * @protected
 */
goog.ui.OfflineInstallDialog.UpgradeScreen.prototype.isUpgradeButtonDefault =
    true;


/**
 * @return {goog.ui.Dialog.ButtonSet} The button set for the upgrade screen.
 */
goog.ui.OfflineInstallDialog.UpgradeScreen.prototype.getButtonSet = function() {
  if (!this.buttonSet_) {
    /**
     * @desc Text of button that cancels setting up Offline.
     * @hidden
     */
    var MSG_OFFLINE_DIALOG_CANCEL_3 = goog.getMsg('Cancel');

    var buttonSet = this.buttonSet_ = new goog.ui.Dialog.ButtonSet(this.dom_);
    buttonSet.set(goog.ui.OfflineInstallDialog.ButtonKeyType.UPGRADE,
        this.enableMsg_, this.isUpgradeButtonDefault, false);
    buttonSet.set(goog.ui.OfflineInstallDialog.ButtonKeyType.CANCEL,
        MSG_OFFLINE_DIALOG_CANCEL_3, false, true);
  }

  return this.buttonSet_;
};


/**
 * Sets the upgrade description. This is the text before the upgrade steps.
 * @param {string} description  The upgrade description.
 */
goog.ui.OfflineInstallDialog.UpgradeScreen.prototype.setUpgradeDescription =
    function(description) {
  this.setInstallDescription(description);
};


/**
 * This screen is shown to users after the window to the Gears download page has
 * been opened.
 * @param {goog.ui.OfflineInstallDialog} dialog  The dialog this is a screen
 *     for.
 * @constructor
 * @extends {goog.ui.OfflineInstallDialogScreen}
 */
goog.ui.OfflineInstallDialog.InstallingGearsScreen = function(dialog) {
  goog.ui.OfflineInstallDialogScreen.call(this, dialog,
      goog.ui.OfflineInstallDialog.InstallingGearsScreen.TYPE);
};
goog.inherits(goog.ui.OfflineInstallDialog.InstallingGearsScreen,
              goog.ui.OfflineInstallDialogScreen);


/**
 * The type of this screen.
 * @type {string}
 */
goog.ui.OfflineInstallDialog.InstallingGearsScreen.TYPE =
    goog.ui.OfflineInstallDialog.ScreenType.INSTALLING_GEARS;


/**
 * The CSS className to use for bold text.
 * @type {string}
 * @private
 */
goog.ui.OfflineInstallDialog.InstallingGearsScreen.prototype.boldClassName_ =
    goog.getCssName('goog-offlinedialog-bold');


/**
 * Gets the button set for the dialog when the user is suposed to be installing
 * Gears.
 * @return {goog.ui.Dialog.ButtonSet} The button set.
 */
goog.ui.OfflineInstallDialog.InstallingGearsScreen.prototype.getButtonSet =
    function() {
  if (!this.buttonSet_) {
    /**
     * @desc Text of button that closes the dialog.
     * @hidden
     */
    var MSG_OFFLINE_DIALOG_CLOSE = goog.getMsg('Close');

    var buttonSet = this.buttonSet_ =
        new goog.ui.Dialog.ButtonSet(this.dom_);
    buttonSet.set(goog.ui.OfflineInstallDialog.ButtonKeyType.CLOSE,
        MSG_OFFLINE_DIALOG_CLOSE, false, true);
  }
  return this.buttonSet_;
};

/**
 * Gets the content for the dialog when the user is suposed to be installing
 * Gears.
 * @return {string} The content of the dialog as html.
 */
goog.ui.OfflineInstallDialog.InstallingGearsScreen.prototype.getContent =
    function() {
  if (!this.content_) {
    /**
     * @desc Congratulate the user for trying to download Google gears,
     *     and give them a push in the right direction.
     */
    var MSG_OFFLINE_DIALOG_GEARS_DOWNLOAD_OPEN = goog.getMsg(
        'Great! The Gears download page has been opened in a new ' +
        'window. If you accidentally closed it, you can {$aBegin}open the ' +
        'Gears download page again{$aEnd}.',
        {
          'aBegin': '<a ' + 'target="_blank" href="' +
              this.getDialog().getGearsDownloadPageUrl() + '">',
          'aEnd': '</a>'
        });

    /**
     * @desc Informs the user to come back to the the given site after
     *     installing Gears.
     * @hidden
     */
    var MSG_OFFLINE_DIALOG_GEARS_AFTER_INSTALL = goog.getMsg('After you\'ve ' +
        'downloaded and installed Gears, {$beginTag}restart your ' +
        'browser, and then come back to {$appUrl}!{$endTag}',
        {
          'beginTag': '<div class="' + this.boldClassName_ + '">',
          'endTag': '</div>', 'appUrl': this.getDialog().getAppUrl()
        });

    // Set the content.
    this.content_ = goog.string.buildString('<div>',
        MSG_OFFLINE_DIALOG_GEARS_DOWNLOAD_OPEN, '</div><br/><div>',
        MSG_OFFLINE_DIALOG_GEARS_AFTER_INSTALL, '</div>');
  }
  return this.content_;
};
