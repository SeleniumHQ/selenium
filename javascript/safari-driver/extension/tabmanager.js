// Copyright 2012 Selenium committers
// Copyright 2012 Software Freedom Conservancy
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


goog.provide('safaridriver.extension.TabManager');

goog.require('goog.array');
goog.require('goog.debug.Logger');
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
   * @type {!Array.<!safaridriver.extension.Tab>}
   * @private
   */
  this.tabs_ = [];

  /**
   * The logger for this class.
   * @type {!goog.debug.Logger}
   * @private
   */
  this.log_ = goog.debug.Logger.getLogger('safaridriver.extension.TabManager');

  safari.application.addEventListener(
      'open', goog.bind(this.onOpen_, this), true);
  safari.application.addEventListener(
      'close', goog.bind(this.onClose_, this), true);

  this.init_();
};


/**
 * The tab that all commands should be routed to.
 * @type {safaridriver.extension.Tab}
 * @private
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
    this.setCommandTab(commandTab);
  }
};


/**
 * Updates the tab that is currently the focus of all commands.
 * @param {!safaridriver.extension.Tab} tab The new tab.
 */
safaridriver.extension.TabManager.prototype.setCommandTab = function(tab) {
  if (tab === this.commandTab_) {
    this.log_.warning('Unnecessarily resetting the focused tab!');
    return;
  }

  this.commandTab_ = tab;
  this.log_.info('Set command tab to ' + tab.getId());

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
  if (e.target instanceof SafariBrowserWindow) {
    // Every window has at least one tab, so as far as we are concerned,
    // SafariBrowserTabs are windows.
    this.log_.info('Ignoring open window event');
    return;
  }

  // getTab will assign one if the tab is new.
  var tab = this.getTab((/** @type {!SafariBrowserTab} */e.target));
  this.log_.info('Tab opened: ' + tab.getId());
};


/**
 * @param {!SafariCloseEvent} e The close event.
 * @private
 */
safaridriver.extension.TabManager.prototype.onClose_ = function(e) {
  if (e.target instanceof SafariBrowserWindow) {
    this.log_.info('Ignoring close window event');
    return;
  }

  if (this.commandTab_ && this.commandTab_.getBrowserTab() === e.target) {
    this.log_.info(
        'The command tab has been closed: ' + this.commandTab_.getId());
    this.commandTab_ = null;
  }

  this.log_.info('Tab closed');
  this.delete_((/** @type {!SafariBrowserTab} */e.target));
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
    this.log_.info('Registering new tab');
    tab = new safaridriver.extension.Tab(
        (/** @type {!SafariBrowserTab} */idOrTab));
    this.tabs_.push(tab);
  }

  // Closure compiler loses type info on goog.array.find above, so we need to
  // cast.
  return (/** @type {safaridriver.extension.Tab} */tab);
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
    this.log_.warning('Attempting to delete an unknown tab.');
  } else {
    var tab = this.tabs_[index];
    this.log_.info('Deleting entry for tab ' + tab.getId());
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
