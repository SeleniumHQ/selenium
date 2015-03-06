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

// Include required modules
var domUtils = require("dom-utils");
var tabs = require("tabs");
var utils = require("utils");

const TIMEOUT = 5000;

/**
 * Constructor
 */
function tabView(aController) {
  this._controller = aController;
  this._tabView = null;
  this._tabViewDoc = this._controller.window.document;
}

/**
 * Tab View class
 */
tabView.prototype = {

  ///////////////////////////////
  // Global section
  ///////////////////////////////

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
   * Check if the Tab View is open
   *
   * @returns True if the Tab View is open
   * @type {boolean}
   */
  get isOpen() {
    var deck = this.getElement({type: "deck"});
    return deck.getNode().getAttribute("selectedIndex") == "1";
  },

  /**
   * Open the Tab View
   */
  open : function tabView_open() {
    var menuitem = new elementslib.Elem(this._controller.menus['view-menu'].menu_tabview);
    this._controller.click(menuitem);
    this.waitForOpened();

    this._tabView = this.getElement({type: "tabView"});
    this._tabViewDoc = this._tabView.getNode().webNavigation.document;
  },

  /**
   * Wait until the Tab View has been opened
   */
  waitForOpened : function tabView_waitForOpened() {
    // Add event listener to wait until the tabview has been opened
    var self = { opened: false };
    function checkOpened() { self.opened = true; }
    this._controller.window.addEventListener("tabviewshown", checkOpened, false);

    try {
      mozmill.utils.waitFor(function() {
        return self.opened == true;
      }, TIMEOUT, 100, "TabView is not open.");

      this._tabViewObject = this._controller.window.TabView;
      this._groupItemsObject = this._tabViewObject._window.GroupItems;
      this._tabItemsObject = this._tabViewObject._window.TabItems;
    } finally {
      this._controller.window.removeEventListener("tabviewshown", checkOpened, false);
    }
  },

  /**
   * Close the Tab View
   */
  close : function tabView_close() {
    var menuitem = new elementslib.Elem(this._controller.menus['view-menu'].menu_tabview);
    this._controller.click(menuitem);
    this.waitForClosed();

    this._tabView = null;
    this._tabViewDoc = this._controller.window.document;
  },

  /**
   * Wait until the Tab View has been closed
   */
  waitForClosed : function tabView_waitForClosed() {
    // Add event listener to wait until the tabview has been closed
    var self = { closed: false };
    function checkClosed() { self.closed = true; }
    this._controller.window.addEventListener("tabviewhidden", checkClosed, false);

    try {
      mozmill.utils.waitFor(function() {
        return self.closed == true;
      }, TIMEOUT, 100, "TabView is still open.");
    } finally {
      this._controller.window.removeEventListener("tabviewhidden", checkClosed, false);
    }

    this._tabViewObject = null;
    this._groupItemsObject = null;
    this._tabItemsObject = null;
  },


  ///////////////////////////////
  // Groups section
  ///////////////////////////////

  /**
   * Returns the tab groups which match the filter criteria
   *
   * @param {object} aSpec
   *        Information about the filter to apply
   *        Elements: filter - Type of filter to apply
   *                           (active, title)
   *                           [optional - default: ""]
   *                  value  - Value of the element
   *                           [optional - default: ""]
   *
   * @returns List of groups
   * @type {array of ElemBase}
   */
  getGroups : function tabView_getGroups(aSpec) {
    var spec = aSpec || {};

    return this.getElements({
      type: "groups",
      subtype: spec.filter,
      value: spec.value
    });
  },

  /**
   * Retrieve the group's title box
   *
   * @param {object} aSpec
   *        Information on which group to operate on
   *        Elements: group - Group element
   *
   * @returns Group title box
   * @type {ElemBase}
   */
  getGroupTitleBox : function tabView_getGroupTitleBox(aSpec) {
    var spec = aSpec || {};
    var group = spec.group;

    if (!group) {
      throw new Error(arguments.callee.name + ": Group not specified.");
    }

    return this.getElement({
      type: "group_titleBox",
      parent: spec.group
    });
  },

  /**
   * Close the specified tab group
   *
   * @param {object} aSpec
   *        Information on which group to operate on
   *        Elements: group - Group
   */
  closeGroup : function tabView_closeGroup(aSpec) {
    var spec = aSpec || {};
    var group = spec.group;

    if (!group) {
      throw new Error(arguments.callee.name + ": Group not specified.");
    }

    var button = this.getElement({
      type: "group_closeButton",
      value: group
    });
    this._controller.click(button);

    this.waitForGroupClosed({group: group});
  },

  /**
   * Wait until the specified tab group has been closed
   *
   * @param {object} aSpec
   *        Information on which group to operate on
   *        Elements: group - Group
   */
  waitForGroupClosed : function tabView_waitForGroupClosed(aSpec) {
    var spec = aSpec || {};
    var group = spec.group;

    if (!group) {
      throw new Error(arguments.callee.name + ": Group not specified.");
    }

    var element = null;
    this._groupItemsObject.groupItems.forEach(function(node) {
      if (node.container == group.getNode()) {
        element = node;
      }
    });

    mozmill.utils.waitFor(function() {
      return !element || element.hidden == true;
    }, TIMEOUT, 100, "Tab Group has not been closed.");

    // XXX: Ugly but otherwise the events on the button aren't get processed
    this._controller.sleep(0);
  },

  /**
   * Undo the closing of the specified tab group
   *
   * @param {object} aSpec
   *        Information on which group to operate on
   *        Elements: group - Group
   */
  undoCloseGroup : function tabView_undoCloseGroup(aSpec) {
    var spec = aSpec || {};
    var group = spec.group;

    if (!group) {
      throw new Error(arguments.callee.name + ": Group not specified.");
    }

    var undo = this.getElement({
      type: "group_undoButton",
      value: group
    });
    this._controller.click(undo);

    this.waitForGroupUndo({group: group});
  },

  /**
   * Wait until the specified tab group has been reopened
   *
   * @param {object} aSpec
   *        Information on which group to operate on
   *        Elements: group - Group
   */
  waitForGroupUndo : function tabView_waitForGroupUndo(aSpec) {
    var spec = aSpec || {};
    var group = spec.group;

    if (!group) {
      throw new Error(arguments.callee.name + ": Group not specified.");
    }

    var element = null;
    this._groupItemsObject.groupItems.forEach(function(node) {
      if (node.container == group.getNode()) {
        element = node;
      }
    });

    mozmill.utils.waitFor(function() {
      return element && element.hidden == false;
    }, TIMEOUT, 100, "Tab Group has not been reopened.");

    // XXX: Ugly but otherwise the events on the button aren't get processed
    this._controller.sleep(0);
  },


  ///////////////////////////////
  // Tabs section
  ///////////////////////////////

  /**
   * Returns the tabs which match the filter criteria
   *
   * @param {object} aSpec
   *        Information about the filter to apply
   *        Elements: filter - Type of filter to apply
   *                           (active, title)
   *                           [optional - default: ""]
   *                  value  - Value of the element
   *                           [optional - default: ""]
   *
   * @returns List of tabs
   * @type {array of ElemBase}
   */
  getTabs : function tabView_getTabs(aSpec) {
    var spec = aSpec || {};

    return this.getElements({
      type: "tabs",
      subtype: spec.filter,
      value: spec.value
    });
  },

  /**
   * Close a tab
   *
   * @param {object} aSpec
   *        Information about the element to operate on
   *        Elements: tab - Tab to close
   */
  closeTab : function tabView_closeTab(aSpec) { 
    var spec = aSpec || {};
    var tab = spec.tab;

    if (!tab) {
      throw new Error(arguments.callee.name + ": Tab not specified.");
    }

    var button = this.getElement({
      type: "tab_closeButton",
      value: tab}
    );
    this._controller.click(button);
  },

  /**
   * Retrieve the tab's title box
   *
   * @param {object} aSpec
   *        Information on which tab to operate on
   *        Elements: tab - Tab
   *
   * @returns Tab title box
   * @type {ElemBase}
   */
  getTabTitleBox : function tabView_getTabTitleBox(aSpec) {
    var spec = aSpec || {};
    var tab = spec.tab;

    if (!tab) {
      throw new Error(arguments.callee.name + ": Tab not specified.");
    }

    return this.getElement({
      type: "tab_titleBox",
      parent: spec.tab
    });
  },

  /**
   * Open a new tab in the specified group
   *
   * @param {object} aSpec
   *        Information about the element to operate on
   *        Elements: group - Group to create a new tab in
   */
  openTab : function tabView_openTab(aSpec) {
    var spec = aSpec || {};
    var group = spec.group;

    if (!group) {
      throw new Error(arguments.callee.name + ": Group not specified.");
    }

    var button = this.getElement({
      type: "group_newTabButton",
      value: group
    });

    this._controller.click(button);
    this.waitForClosed();
  },


  ///////////////////////////////
  // UI Elements section
  ///////////////////////////////

  /**
   * Retrieve an UI element based on the given specification
   *
   * @param {object} aSpec
   *        Information of the UI elements which should be retrieved
   *        Elements: type     - Identifier of the element
   *                  subtype  - Attribute of the element to filter
   *                             [optional - default: ""]
   *                  value    - Value of the attribute to filter
   *                             [optional - default: ""]
   *                  parent   - Parent of the to find element
   *                             [optional - default: document]
   *
   * @returns Element which has been found
   * @type {ElemBase}
   */
  getElement : function tabView_getElement(aSpec) {
    var elements = this.getElements(aSpec);

    return (elements.length > 0) ? elements[0] : undefined;
  },

  /**
   * Retrieve list of UI elements based on the given specification
   *
   * @param {object} aSpec
   *        Information of the UI elements which should be retrieved
   *        Elements: type     - Identifier of the element
   *                  subtype  - Attribute of the element to filter
   *                             [optional - default: ""]
   *                  value    - Value of the attribute to filter
   *                             [optional - default: ""]
   *                  parent   - Parent of the to find element
   *                             [optional - default: document]
   *
   * @returns Elements which have been found
   * @type {array of ElemBase}
   */
  getElements : function tabView_getElement(aSpec) {
    var spec = aSpec || { };
    var type = spec.type;
    var subtype = spec.subtype;
    var value = spec.value;
    var parent = spec.parent;

    var root = parent ? parent.getNode() : this._tabViewDoc;
    var nodeCollector = new domUtils.nodeCollector(root);

    switch(type) {
      // Top level elements
      case "tabView":
        nodeCollector.root = this._controller.window.document;
        nodeCollector.queryNodes("#tab-view");
        break;
      case "contentArea":
        nodeCollector.queryNodes("#content");
        break;
      case "deck":
        nodeCollector.root = this._controller.window.document;
        nodeCollector.queryNodes("#tab-view-deck");
        break;
      case "exitButton":
        nodeCollector.queryNodes("#exit-button");
        break;

      // Group elements
      case "group_appTabs":
        nodeCollector.queryNodes(".groupItem .appTabIcon");
        break;
      case "group_closeButton":
        nodeCollector.queryNodes(".groupItem .close");
        break;
      case "group_newTabButton":
        nodeCollector.queryNodes(".groupItem .newTabButton");
        break;
      case "group_resizer":
        nodeCollector.queryNodes(".groupItem .iq-resizable-handle");
        break;
      case "group_stackExpander":
        nodeCollector.queryNodes(".groupItem .stackExpander");
        break;
      case "group_titleBox":
        nodeCollector.queryNodes(".groupItem .name");
        break;
      case "group_undoButton":
        // Bug 596504 - No reference to the undo button
        nodeCollector.root = this._tabViewDoc;
        nodeCollector.queryNodes(".undo").filter(function(node) {
          var groups = this._groupItemsObject.groupItems;
          for (var i = 0; i < groups.length; i++) {
            var group = groups[i];
            if (group.container == aSpec.value.getNode() &&
                group.$undoContainer.length == 1) {
              return true;
            }
          }
          return false;
        }, this);
        break;
      case "groups":
        nodeCollector.queryNodes(".groupItem").filter(function(node) {
          switch(subtype) {
            case "active":
              return node.className.indexOf("activeGroup") != -1;
            case "title":
              // If no title is given the default name is used
              if (!value) {
                value = utils.getProperty("chrome://browser/locale/tabview.properties",
                                  "tabview.groupItem.defaultName");
              }
              var title = node.querySelector(".name");
              return (value == title.value);
            default:
              return true;
          }
        }, this);
        break;

      // Search elements
      case "search_box":
        nodeCollector.queryNodes("#searchbox");
        break;
      case "search_button":
        nodeCollector.queryNodes("#searchbutton");
        break;

      // Tab elements
      case "tab_closeButton":
        nodeCollector.queryNodes(".tab .close");
        break;
      case "tab_favicon":
        nodeCollector.queryNodes(".tab .favicon");
        break;
      case "tab_titleBox":
        nodeCollector.queryNodes(".tab .tab-title");
        break;
      case "tabs":
        nodeCollector.queryNodes(".tab").filter(function(node) {
          switch (subtype) {
            case "active":
              return (node.className.indexOf("focus") != -1);
            case "group":
              var group = value ? value.getNode() : null;
              if (group) {
                var tabs = this._tabItemsObject.getItems();
                for (var i = 0; i < tabs.length; i++) {
                  var tab = tabs[i];
                  if (tab.parent && tab.parent.container == group) {
                    return true;
                  }
                }
                return false;
              } else {
                return (node.className.indexOf("tabInGroupItem") == -1);
              }
            default:
              return true;
          }
        }, this);
        break;
      default:
        throw new Error(arguments.callee.name + ": Unknown element type - " +
                        aSpec.type);
    }

    return nodeCollector.elements;
  }
}

// Export of classes
exports.tabView = tabView;
