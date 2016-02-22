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


goog.provide('safaridriver.extension.TabManager');

goog.require('goog.array');
goog.require('goog.log');
goog.require('safaridriver.extension.Tab');



/**
 * Keeps track of all the tabs that are currently open in the Safari
 * application, as well as which tab all {@link webdriver.Command}s should be
 * routed to.
 * @constructor
 */
safaridriver.extension.TabManager = function() {

  /**
   * Maintains a list of active SafariBrowserTabs and their associated IDs.
   * A simple array is used instead of an object literal because object keys
   * are, by definition, always strings, which would yield the same key for
   * every tab: "[object SafariBrowserTab]". We cannot use a
   * {@link goog.structs.Map} either, because the keys it generates are
   * equally generic.
   * @private {!Array.<!safaridriver.extension.Tab>}
   */
  this.tabs_ = [];

  /**
   * Browser tabs that should be treated as "internal" to the SafariDriver and
   * hidden from WebDriver clients.
   * @private {!Array.<!SafariBrowserTab>}
   */
  this.ignoredTabs_ = [];

  /**
   * The logger for this class.
   * @private {goog.debug.Logger}
   */
  this.log_ = goog.log.getLogger('safaridriver.extension.TabManager');

  safari.application.addEventListener(
      'open', goog.bind(this.onOpen_, this), true);
  safari.application.addEventListener(
      'close', goog.bind(this.onClose_, this), true);

  this.init_();
};


/**
 * The tab that all commands should be routed to.
 * @private {safaridriver.extension.Tab}
 */
safaridriver.extension.TabManager.prototype.commandTab_ = null;


/**
 * Iterates over the existing tabs. The currently active tab will be added to
 * our map; all others will be closed.
 * @private
 */
safaridriver.extension.TabManager.prototype.init_ = function() {
  var commandTab = null;

  safari.application.browserWindows.forEach(function(browserWindow) {
    var isActiveWindow =
        safari.application.activeBrowserWindow === browserWindow;

    browserWindow.tabs.forEach(function(browserTab) {
      var isActiveTab = isActiveWindow &&
          safari.application.activeBrowserWindow.activeTab === browserTab;
      if (isActiveTab) {
        // #getTab() will add the tab if it's not already there. This will be
        // horribly inefficient if there are lots of windows and tabs already
        // open.
        commandTab = this.getTab(browserTab);
      } else {
        browserTab.close();
      }
    }, this);
  }, this);

  if (commandTab) {
    this.setCommandTab(
      /** @type {!safaridriver.extension.Tab} */ (commandTab));
  }
};


/**
 * Marks a tab as "internal" and ignores it for all WebDriver clients.
 * @param {!SafariBrowserTab} tab The tab to ignore.
 */
safaridriver.extension.TabManager.prototype.ignoreTab = function(tab) {
  this.ignoredTabs_.push(tab);

  if (this.commandTab_ && this.commandTab_.getBrowserTab() === tab) {
    goog.log.info(this.log_, 'Resetting command tab');
    this.commandTab_ = null;
  }

  this.delete_(tab);
};


/**
 * Updates the tab that is currently the focus of all commands.
 * @param {!safaridriver.extension.Tab} tab The new tab.
 */
safaridriver.extension.TabManager.prototype.setCommandTab = function(tab) {
  if (tab === this.commandTab_) {
    goog.log.warning(this.log_, 'Unnecessarily resetting the focused tab!');
    return;
  }

  this.commandTab_ = tab;
  goog.log.info(this.log_, 'Set command tab to ' + tab.getId());

  var browserTab = tab.getBrowserTab();
  if (browserTab.browserWindow !== safari.application.activeBrowserWindow) {
    browserTab.browserWindow.activate();
  }

  if (browserTab !== browserTab.browserWindow.activeTab) {
    browserTab.activate();
  }
};


/**
 * @param {!SafariOpenEvent} e The open event.
 * @private
 */
safaridriver.extension.TabManager.prototype.onOpen_ = function(e) {
  if (e.target instanceof SafariBrowserWindow ||
      goog.array.contains(this.ignoredTabs_, e.target)) {
    // Every window has at least one tab, so as far as we are concerned,
    // SafariBrowserTabs are windows.
    goog.log.info(this.log_, 'Ignoring open window event');
    return;
  }

  // getTab will assign one if the tab is new.
  var tab = this.getTab(/** @type {!SafariBrowserTab} */ (e.target));
  goog.log.info(this.log_, 'Tab opened: ' + tab.getId());
};


/**
 * @param {!SafariCloseEvent} e The close event.
 * @private
 */
safaridriver.extension.TabManager.prototype.onClose_ = function(e) {
  if (e.target instanceof SafariBrowserWindow) {
    goog.log.info(this.log_, 'Ignoring close window event');
    return;
  }

  var browserTab = /** @type {!SafariBrowserTab} */ (e.target);
  if (goog.array.remove(this.ignoredTabs_, browserTab)) {
    return;
  }

  if (this.commandTab_ && this.commandTab_.getBrowserTab() === e.target) {
    goog.log.info(this.log_,
        'The command tab has been closed: ' + this.commandTab_.getId());
    this.commandTab_ = null;
  }

  goog.log.info(this.log_, 'Tab closed');
  this.delete_(browserTab);
};


/**
 * Retrieves the entry matching the provided ID or SafariBrowserTab.
 * @param {!(string|SafariBrowserTab)} idOrTab Either the ID or SafariBrowserTab
 *     of the entry to look up.
 * @return {safaridriver.extension.Tab} The located entry, or {@code null} if
 *     none was found.
 */
safaridriver.extension.TabManager.prototype.getTab = function(idOrTab) {
  var isString = goog.isString(idOrTab);
  var tab = goog.array.find(this.tabs_, function(tab) {
    return (isString ? tab.getId() : tab.getBrowserTab()) === idOrTab;
  });

  if (!tab && !isString) {
    goog.log.info(this.log_, 'Registering new tab');
    tab = new safaridriver.extension.Tab(
        /** @type {!SafariBrowserTab} */ (idOrTab));
    this.tabs_.push(tab);
  }

  // Closure compiler loses type info on goog.array.find above, so we need to
  // cast.
  return /** @type {safaridriver.extension.Tab} */ (tab);
};


/** @return {!Array.<string>} The IDs for the opened tabs. */
safaridriver.extension.TabManager.prototype.getIds = function() {
  return goog.array.map(this.tabs_, function(tab) {
    return tab.getId();
  });
};


/** @return {number} The number of opened tabs. */
safaridriver.extension.TabManager.prototype.getTabCount = function() {
  return this.tabs_.length;
};


/**
 * Removes a tab from this manager's tab list.
 * @param {!SafariBrowserTab} browserTab The tab to remove.
 * @private
 */
safaridriver.extension.TabManager.prototype.delete_ = function(browserTab) {
  var index = goog.array.findIndex(this.tabs_, function(tab) {
    return tab.getBrowserTab() === browserTab;
  });

  if (index < 0) {
    goog.log.warning(this.log_, 'Attempting to delete an unknown tab.');
  } else {
    var tab = this.tabs_[index];
    goog.log.info(this.log_, 'Deleting entry for tab ' + tab.getId());
    goog.array.removeAt(this.tabs_, index);
  }
};


/**
 * @return {!safaridriver.extension.Tab} The tab commands should be routed to.
 * @throws {bot.Error} If there are no open windows, or the focused tab has been
 *     closed.
 */
safaridriver.extension.TabManager.prototype.getCommandTab = function() {
  if (this.commandTab_) {
    return this.commandTab_;
  }

  var message;
  if (!this.getTabCount()) {
    message = 'There are no open windows!';
  } else {
    message = 'The driver is not focused on a window. ' +
        'You must switch to a window before proceeding.';
  }

  throw new bot.Error(bot.ErrorCode.NO_SUCH_WINDOW, message);
};
