/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is MozMill Test code.
 *
 * The Initial Developer of the Original Code is Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Henrik Skupin <hskupin@mozilla.com>
 *   Aaron Train <aaron.train@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * @fileoverview
 * The SessionStoreAPI adds support for accessing session related elements and features
 *
 * @version 1.0.0
 */

// Include required modules
var prefs = require("prefs");
var utils = require("utils");
var widgets = require("widgets");

// Session Store service
var sessionStoreService = Cc["@mozilla.org/browser/sessionstore;1"]
                             .getService(Ci.nsISessionStore);

// Preference for indicating the amount of restorable tabs
const SESSIONSTORE_MAXTABS_PREF = 'browser.sessionstore.max_tabs_undo';

const gTimeout = 5000;

/**
 * Constructor
 * 
 * @param {MozMillController} controller
 *        MozMill controller of the browser window to operate on.
 */
function aboutSessionRestore(controller)
{
  this._controller = controller;
}

/**
 * This class handles the about:sessionrestore page.
 */
aboutSessionRestore.prototype = {
  /**
   * Returns the MozMill controller
   *
   * @returns Mozmill controller
   * @type {MozMillController}
   */
  get controller() {
    return this._controller;
  },

  /**
   * Returns the tree which contains the windows and tabs
   *
   * @returns Tree with windows and tabs to restore
   * @type {ElemBase}
   */
  get tabList() {
    return this.getElement({type: "tabList"});
  },

  /**
   * Gets all the needed external DTD urls as an array
   *
   * @returns Array of external DTD urls
   * @type [string]
   */
  getDtds : function aboutSessionRestore_getDtds() {
    var dtds = ["chrome://browser/locale/browser.dtd",
                "chrome://browser/locale/aboutSessionRestore.dtd"];
    return dtds;
  },

  /**
   * Retrieve an UI element based on the given spec
   *
   * @param {object} spec
   *        Information of the UI element which should be retrieved
   *        type: General type information
   *        subtype: Specific element or property
   *        value: Value of the element or property
   * @returns Element which has been created  
   * @type {ElemBase}
   */
  getElement : function aboutSessionRestore_getElement(spec) {
    var elem = null;

    switch(spec.type) {
      case "button_restoreSession":
        elem = new elementslib.ID(this._controller.tabs.activeTab, "errorTryAgain");
        break;
      case "error_longDesc":
        elem = new elementslib.ID(this._controller.tabs.activeTab, "errorLongDesc");
        break;
      case "error_pageContainer":
        elem = new elementslib.ID(this._controller.tabs.activeTab, "errorPageContainer");
        break;
      case "error_shortDesc":
        elem = new elementslib.ID(this._controller.tabs.activeTab, "errorShortDescText");
        break;
      case "error_title":
        elem = new elementslib.ID(this._controller.tabs.activeTab, "errorTitleText");
        break;
      case "tabList":
        elem = new elementslib.ID(this._controller.window.document, "tabList");
        break;
      default:
        throw new Error(arguments.callee.name + ": Unknown element type - " + spec.type);
    }

    return elem;
  },

  /**
   * Returns the current restore state of the given element
   *
   * @param {object} element
   *        Element which restore state should be retrieved
   * @returns True if the element should be restored
   * @type {boolean}
   *
   */
  getRestoreState : function aboutSessionRestore_getRestoreState(element) {
    var tree = this.tabList.getNode();

    return tree.view.getCellValue(element.listIndex, tree.columns.getColumnAt(0));
  },

  /**
   * Get restorable tabs under the given window
   * 
   * @param {object} window
   *        Window inside the tree
   * @returns List of tabs
   * @type {array of object}
   */
  getTabs : function aboutSessionRestore_getTabs(window) {
    var tabs = [ ];
    var tree = this.tabList.getNode();

    // Add entries when they are tabs (no container)
    var ii = window.listIndex + 1;
    while (ii < tree.view.rowCount && !tree.view.isContainer(ii)) {
      tabs.push({
                 index: tabs.length,
                 listIndex : ii,
                 restore: tree.view.getCellValue(ii, tree.columns.getColumnAt(0)),
                 title: tree.view.getCellText(ii, tree.columns.getColumnAt(2))
                });
      ii++;
    }

    return tabs;
  },

  /**
   * Get restorable windows
   * 
   * @returns List of windows
   * @type {array of object}
   */
  getWindows : function aboutSessionRestore_getWindows() {
    var windows = [ ];
    var tree = this.tabList.getNode();

    for (var ii = 0; ii < tree.view.rowCount; ii++) {
      if (tree.view.isContainer(ii)) {
        windows.push({
                      index: windows.length,
                      listIndex : ii,
                      open: tree.view.isContainerOpen(ii),
                      restore: tree.view.getCellValue(ii, tree.columns.getColumnAt(0)),
                      title: tree.view.getCellText(ii, tree.columns.getColumnAt(2))
                     });
      }
    }

    return windows;
  },

  /**
   * Toggles the restore state for the element
   *
   * @param {object} element
   *        Specifies the element which restore state should be toggled
   */
  toggleRestoreState : function aboutSessionRestore_toggleRestoreState(element) {
    var state = this.getRestoreState(element);

    widgets.clickTreeCell(this._controller, this.tabList, element.listIndex, 0, {});
    this._controller.sleep(0);

    this._controller.assertJS("subject.newState != subject.oldState",
                              {newState : this.getRestoreState(element), oldState : state});
  }
}

/**
 * Resets the list of recently closed tabs by setting and clearing the user preference
 */
function resetRecentlyClosedTabs()
{
  prefs.preferences.setPref(SESSIONSTORE_MAXTABS_PREF, 0);
  prefs.preferences.clearUserPref(SESSIONSTORE_MAXTABS_PREF);
}

/**
 * Returns the number of restorable tabs for a given window
 * 
 * @param {MozMillController} controller
 *        MozMillController of the window to operate on
 * @returns The number of restorable tabs in the window
 */
function getClosedTabCount(controller)
{
  return sessionStoreService.getClosedTabCount(controller.window);
}

/**
 * Restores the tab which has been recently closed
 * 
 * @param {MozMillController} controller
 *        MozMillController of the window to operate on
 * @param {object} event
 *        Specifies the event to use to execute the command
 */
function undoClosedTab(controller, event)
{
  var count = sessionStoreService.getClosedTabCount(controller.window);

  switch (event.type) {
    case "menu":
      throw new Error("Menu gets build dynamically and cannot be accessed.");
      break;
    case "shortcut":
      var cmdKey = utils.getEntity(this.getDtds(), "tabCmd.commandkey");
      controller.keypress(null, cmdKey, {accelKey: true, shiftKey: true});
      break;
  }

  if (count > 0)
    controller.assertJS("subject.newTabCount < subject.oldTabCount",
                        {
                         newTabCount : sessionStoreService.getClosedTabCount(controller.window),
                         oldTabCount : count
                        });
}

/**
 * Restores the window which has been recently closed
 * 
 * @param {MozMillController} controller
 *        MozMillController of the window to operate on
 * @param {object} event
 *        Specifies the event to use to execute the command
 */
function undoClosedWindow(controller, event)
{
  var count = sessionStoreService.getClosedWindowCount(controller.window);

  switch (event.type) {
    case "menu":
      throw new Error("Menu gets build dynamically and cannot be accessed.");
      break;
    case "shortcut":
      var cmdKey = utils.getEntity(this.getDtds(), "newNavigatorCmd.key");
      controller.keypress(null, cmdKey, {accelKey: true, shiftKey: true});
      break;
  }

  if (count > 0)
    controller.assertJS("subject.newWindowCount < subject.oldWindowCount",
                        {
                         newWindowCount : sessionStoreService.getClosedWindowCount(controller.window),
                         oldWindowCount : count
                        });
}

// Export of functions
exports.getClosedTabCount = getClosedTabCount;
exports.resetRecentlyClosedTabs = resetRecentlyClosedTabs;
exports.undoClosedTab = undoClosedTab;
exports.undoClosedWindow = undoClosedWindow;

// Export of classes
exports.aboutSessionRestore = aboutSessionRestore;
