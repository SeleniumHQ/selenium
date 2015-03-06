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
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Henrik Skupin <hskupin@mozilla.com>
 *   Anthony Hughes <ahughes@mozilla.com>
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
 * The TabbedBrowsingAPI adds support for accessing and interacting with tab elements
 *
 * @version 1.0.0
 */

// Include required modules
var utils = require("utils");
var prefs = require("prefs");

const TIMEOUT = 5000;

const PREF_TABS_ANIMATE = "browser.tabs.animate";

const TABS_VIEW = '/id("main-window")/id("tab-view-deck")/{"flex":"1"}';
const TABS_BROWSER = TABS_VIEW + '/id("browser")/id("appcontent")/id("content")';
const TABS_TOOLBAR = TABS_VIEW + '/id("navigator-toolbox")/id("TabsToolbar")';
const TABS_TABS = TABS_TOOLBAR + '/id("tabbrowser-tabs")';
const TABS_ARROW_SCROLLBOX = TABS_TABS + '/anon({"anonid":"arrowscrollbox"})';
const TABS_STRIP = TABS_ARROW_SCROLLBOX + '/anon({"anonid":"scrollbox"})/anon({"flex":"1"})';

/**
 * Close all tabs and open about:blank
 *
 * @param {MozMillController} controller
 *        MozMillController of the window to operate on
 */
function closeAllTabs(controller)
{
  var browser = new tabBrowser(controller);
  browser.closeAllTabs();
}

/**
 * Check and return all open tabs with the specified URL
 *
 * @param {string} aUrl
 *        URL to check for
 *
 * @returns Array of tabs
 */
function getTabsWithURL(aUrl) {
  var tabs = [ ];

  var uri = utils.createURI(aUrl, null, null);

  var wm = Cc["@mozilla.org/appshell/window-mediator;1"].
           getService(Ci.nsIWindowMediator);
  var winEnum = wm.getEnumerator("navigator:browser");

  // Iterate through all windows
  while (winEnum.hasMoreElements()) {
    var window = winEnum.getNext();
 
    // Don't check windows which are about to close or don't have gBrowser set
    if (window.closed || !("gBrowser" in window))
      continue;

    // Iterate through all tabs in the current window
    var browsers = window.gBrowser.browsers;
    for (var i = 0; i < browsers.length; i++) {
      var browser = browsers[i];
      if (browser.currentURI.equals(uri)) {
        tabs.push({
          controller : new mozmill.controller.MozMillController(window),
          index : i
        });
      }
    }
  }

  return tabs;
}

/**
 * Constructor
 * 
 * @param {MozMillController} controller
 *        MozMill controller of the window to operate on
 */
function tabBrowser(controller)
{
  this._controller = controller;
  this._tabs = this.getElement({type: "tabs"});
}

/**
 * Tabbed Browser class
 */
tabBrowser.prototype = {
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
   * Get the amount of open tabs
   *
   * @returns Number of tabs
   * @type {number}
   */
  get length() {
    return this._tabs.getNode().itemCount;
  },

  /**
   * Get the currently selected tab index
   *
   * @returns Index of currently selected tab
   * @type {number}
   */
  get selectedIndex() {
    return this._tabs.getNode().selectedIndex;
  },

  /**
   * Select the tab with the given index
   *
   * @param {number} index
   *        Index of the tab which should be selected
   */
  set selectedIndex(index) {
    this._controller.click(this.getTab(index));
  },

  /**
   * Close all tabs of the window except the last one and open a blank page.
   */
  closeAllTabs : function tabBrowser_closeAllTabs()
  {
    while (this._controller.tabs.length > 1) {
      this.closeTab({type: "menu"});
    }

    this._controller.open("about:blank");
    this._controller.waitForPageLoad();
  },

  /**
   * Close an open tab
   *
   * @param {object} aEvent
   *        The event specifies how to close a tab
   *        Elements: type - Type of event (closeButton, menu, middleClick, shortcut)
   *                         [optional - default: menu]
   */
  closeTab : function tabBrowser_closeTab(aEvent) {
    var event = aEvent || { };
    var type = (event.type == undefined) ? "menu" : event.type;

    // Disable tab closing animation for default behavior
    prefs.preferences.setPref(PREF_TABS_ANIMATE, false);

    // Add event listener to wait until the tab has been closed
    var self = { closed: false };
    function checkTabClosed() { self.closed = true; }
    this._controller.window.addEventListener("TabClose", checkTabClosed, false);

    switch (type) {
      case "closeButton":
        var button = this.getElement({type: "tabs_tabCloseButton",
                                     subtype: "tab", value: this.getTab()});
        this._controller.click(button);
        break;
      case "menu":
        var menuitem = new elementslib.Elem(this._controller.menus['file-menu'].menu_close);
        this._controller.click(menuitem);
        break;
      case "middleClick":
        var tab = this.getTab(event.index);
        this._controller.middleClick(tab);
        break;
      case "shortcut":
        var cmdKey = utils.getEntity(this.getDtds(), "closeCmd.key");
        this._controller.keypress(null, cmdKey, {accelKey: true});
        break;
      default:
        throw new Error(arguments.callee.name + ": Unknown event type - " + type);
    }

    try {
      this._controller.waitForEval("subject.tab.closed == true", TIMEOUT, 100,
                                   {tab: self});
    } finally {
      this._controller.window.removeEventListener("TabClose", checkTabClosed, false);
      prefs.preferences.clearUserPref(PREF_TABS_ANIMATE);
    }
  },

  /**
   * Gets all the needed external DTD urls as an array
   *
   * @returns Array of external DTD urls
   * @type [string]
   */
  getDtds : function tabBrowser_getDtds() {
    var dtds = ["chrome://browser/locale/browser.dtd",
                "chrome://browser/locale/tabbrowser.dtd",
                "chrome://global/locale/global.dtd"];
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
  getElement : function tabBrowser_getElement(spec) {
    var document = this._controller.window.document;
    var elem = null;

    switch(spec.type) {
      /**
       * subtype: subtype to match
       * value: value to match
       */
      case "tabs":
        elem = new elementslib.Lookup(this._controller.window.document,
                                      TABS_TABS);
        break;
      case "tabs_allTabsButton":
        elem = new elementslib.Lookup(this._controller.window.document,
                                      TABS_TOOLBAR + '/id("alltabs-button")');
        break;
      case "tabs_allTabsPopup":
        elem = new elementslib.Lookup(this._controller.window.document, TABS_TOOLBAR +
                                      '/id("alltabs-button")/id("alltabs-popup")');
        break;
      case "tabs_newTabButton":
        elem = new elementslib.Lookup(this._controller.window.document,
                                      TABS_ARROW_SCROLLBOX + '/anon({"class":"tabs-newtab-button"})');
        break;
      case "tabs_scrollButton":
        elem = new elementslib.Lookup(this._controller.window.document,
                                      TABS_ARROW_SCROLLBOX +
                                      '/anon({"anonid":"scrollbutton-' + spec.subtype + '"})');
        break;
      case "tabs_strip":
        elem = new elementslib.Lookup(this._controller.window.document, TABS_STRIP);
        break;
      case "tabs_tab":
        switch (spec.subtype) {
          case "index":
            elem = new elementslib.Elem(this._tabs.getNode().getItemAtIndex(spec.value));
            break;
        }
        break;
      case "tabs_tabCloseButton":
        var node = document.getAnonymousElementByAttribute(
                     spec.value.getNode(),
                     "anonid",
                     "close-button"
                   );
        elem = new elementslib.Elem(node);
        break;
      case "tabs_tabFavicon":
        var node = document.getAnonymousElementByAttribute(
                     spec.value.getNode(),
                     "class",
                     "tab-icon-image"
                   );

        elem = new elementslib.Elem(node);
        break;
      case "tabs_tabPanel":
        var panelId = spec.value.getNode().getAttribute("linkedpanel");
        elem = new elementslib.Lookup(this._controller.window.document, TABS_BROWSER +
                                      '/anon({"anonid":"tabbox"})/anon({"anonid":"panelcontainer"})' +
                                      '/{"id":"' + panelId + '"}');
        break;
      default:
        throw new Error(arguments.callee.name + ": Unknown element type - " + spec.type);
    }

    return elem;
  },

  /**
   * Get the tab at the specified index
   *
   * @param {number} index
   *        Index of the tab
   * @returns The requested tab
   * @type {ElemBase}
   */
  getTab : function tabBrowser_getTab(index) {
    if (index === undefined)
      index = this.selectedIndex;

    return this.getElement({type: "tabs_tab", subtype: "index", value: index});
  },

  /**
   * Creates the child element of the tab's notification bar
   *
   * @param {number} tabIndex
   *        (Optional) Index of the tab to check
   * @param {string} elemString
   *        (Optional) Lookup string of the notification bar's child element
   * @return The created child element
   * @type {ElemBase}
   */
  getTabPanelElement : function tabBrowser_getTabPanelElement(tabIndex, elemString)
  {
    var index = tabIndex ? tabIndex : this.selectedIndex;
    var elemStr = elemString ? elemString : "";

    // Get the tab panel and check if an element has to be fetched
    var panel = this.getElement({type: "tabs_tabPanel", subtype: "tab", value: this.getTab(index)});
    var elem = new elementslib.Lookup(this._controller.window.document, panel.expression + elemStr);

    return elem;
  },

  /**
   * Open element (link) in a new tab
   *
   * @param {object} aEvent
   *        The event specifies how to open the element in a new tab
   *        Elements: type - Type of event (contextMenu, middleClick)
   *                         [optional - default: middleClick]
   */
  openInNewTab : function tabBrowser_openInNewTab(aEvent) {
    var event = aEvent || { };
    var type = (event.type == undefined) ? "middleClick" : event.type;

    // Disable tab closing animation for default behavior
    prefs.preferences.setPref(PREF_TABS_ANIMATE, false);

    // Add event listener to wait until the tab has been opened
    var self = { opened: false };
    function checkTabOpened() { self.opened = true; }
    this._controller.window.addEventListener("TabOpen", checkTabOpened, false);

    switch (type) {
      case "contextMenu":
        var contextMenuItem = new elementslib.ID(this._controller.window.document,
                                                 "context-openlinkintab");
        this._controller.rightClick(event.target);
        this._controller.click(contextMenuItem);
        utils.closeContentAreaContextMenu(this._controller);
        break;
      case "middleClick":
        this._controller.middleClick(event.target);
        break;
      default:
        throw new Error(arguments.callee.name + ": Unknown event type - " + type);
    }

    try {
      this._controller.waitForEval("subject.tab.opened == true", TIMEOUT, 100,
                                   {tab: self});
    } finally {
      this._controller.window.removeEventListener("TabOpen", checkTabOpened, false);
      prefs.preferences.clearUserPref(PREF_TABS_ANIMATE);
    }
  },

  /**
   * Open a new tab
   *
   * @param {object} aEvent
   *        The event specifies how to open a new tab (menu, shortcut,
   *        Elements: type - Type of event (menu, newTabButton, shortcut, tabStrip)
   *                         [optional - default: menu]
   */
  openTab : function tabBrowser_openTab(aEvent) {
    var event = aEvent || { };
    var type = (event.type == undefined) ? "menu" : event.type;

    // Disable tab closing animation for default behavior
    prefs.preferences.setPref(PREF_TABS_ANIMATE, false);

    // Add event listener to wait until the tab has been opened
    var self = { opened: false };
    function checkTabOpened() { self.opened = true; }
    this._controller.window.addEventListener("TabOpen", checkTabOpened, false);

    switch (type) {
      case "menu":
        var menuitem = new elementslib.Elem(this._controller.menus['file-menu'].menu_newNavigatorTab);
        this._controller.click(menuitem);
        break;
      case "shortcut":
        var cmdKey = utils.getEntity(this.getDtds(), "tabCmd.commandkey");
        this._controller.keypress(null, cmdKey, {accelKey: true});
        break;
      case "newTabButton":
        var newTabButton = this.getElement({type: "tabs_newTabButton"});
        this._controller.click(newTabButton);
        break;
      case "tabStrip":
        var tabStrip = this.getElement({type: "tabs_strip"});
        
        // RTL-locales need to be treated separately
        if (utils.getEntity(this.getDtds(), "locale.dir") == "rtl") {
          // XXX: Workaround until bug 537968 has been fixed
          this._controller.click(tabStrip, 100, 3);
          // Todo: Calculate the correct x position
          this._controller.doubleClick(tabStrip, 100, 3);
        } else {
          // XXX: Workaround until bug 537968 has been fixed
          this._controller.click(tabStrip, tabStrip.getNode().clientWidth - 100, 3);
          // Todo: Calculate the correct x position
          this._controller.doubleClick(tabStrip, tabStrip.getNode().clientWidth - 100, 3);
        }
        break;
      default:
        throw new Error(arguments.callee.name + ": Unknown event type - " + type);
    }

    try {
      this._controller.waitForEval("subject.tab.opened == true", TIMEOUT, 100,
                                   {tab: self});
    } finally {
      this._controller.window.removeEventListener("TabOpen", checkTabOpened, false);
      prefs.preferences.clearUserPref(PREF_TABS_ANIMATE);
    }
  },
  
  /**
   * Waits for a particular tab panel element to display and stop animating
   * 
   * @param {number} tabIndex
   *        Index of the tab to check
   * @param {string} elemString
   *        Lookup string of the tab panel element
   */
  waitForTabPanel: function tabBrowser_waitForTabPanel(tabIndex, elemString) {
    // Get the specified tab panel element
    var tabPanel = this.getTabPanelElement(tabIndex, elemString);
    
    // Get the style information for the tab panel element
    var style = this._controller.window.getComputedStyle(tabPanel.getNode(), null);
    
    // Wait for the top margin to be 0px - ie. has stopped animating
    // XXX: A notification bar starts at a negative pixel margin and drops down
    //      to 0px.  This creates a race condition where a test may click
    //      before the notification bar appears at it's anticipated screen location
    this._controller.waitFor(function () {
      return style.marginTop == '0px';
    }, "Expected notification bar to be visible: '" + elemString + "' ");
  }
}

// Export of functions
exports.closeAllTabs = closeAllTabs;
exports.getTabsWithURL = getTabsWithURL;

// Export of classes
exports.tabBrowser = tabBrowser;
