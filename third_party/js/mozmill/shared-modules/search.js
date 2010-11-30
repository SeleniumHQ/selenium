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
 * The SearchAPI adds support for search related functions like the search bar.
 */

// Include required modules
var modalDialog = require("modal-dialog");
var utils = require("utils");
var widgets = require("widgets");

const TIMEOUT = 5000;

// Helper lookup constants for the engine manager elements
const MANAGER_BUTTONS   = '/id("engineManager")/anon({"anonid":"buttons"})';

// Helper lookup constants for the search bar elements
const NAV_BAR             = '/id("main-window")/id("tab-view-deck")/{"flex":"1"}' +
                            '/id("navigator-toolbox")/id("nav-bar")';
const SEARCH_BAR          = NAV_BAR + '/id("search-container")/id("searchbar")';
const SEARCH_TEXTBOX      = SEARCH_BAR      + '/anon({"anonid":"searchbar-textbox"})';
const SEARCH_DROPDOWN     = SEARCH_TEXTBOX  + '/[0]/anon({"anonid":"searchbar-engine-button"})';
const SEARCH_POPUP        = SEARCH_DROPDOWN + '/anon({"anonid":"searchbar-popup"})';
const SEARCH_INPUT        = SEARCH_TEXTBOX  + '/anon({"class":"autocomplete-textbox-container"})' +
                                              '/anon({"anonid":"textbox-input-box"})' +
                                              '/anon({"anonid":"input"})';
const SEARCH_CONTEXT      = SEARCH_TEXTBOX  + '/anon({"anonid":"textbox-input-box"})' +
                                              '/anon({"anonid":"input-box-contextmenu"})';
const SEARCH_GO_BUTTON    = SEARCH_TEXTBOX  + '/anon({"class":"search-go-container"})' +
                                              '/anon({"class":"search-go-button"})';
const SEARCH_AUTOCOMPLETE =  '/id("main-window")/id("mainPopupSet")/id("PopupAutoComplete")';

/**
 * Constructor
 *
 * @param {MozMillController} controller
 *        MozMillController of the engine manager
 */
function engineManager(controller)
{
  this._controller = controller;
}

/**
 * Search Manager class
 */
engineManager.prototype = {
  /**
   * Get the controller of the associated engine manager dialog
   *
   * @returns Controller of the browser window
   * @type MozMillController
   */
  get controller()
  {
    return this._controller;
  },

  /**
   * Gets the list of search engines
   *
   * @returns List of engines
   * @type object
   */
  get engines() {
    var engines = [ ];
    var tree = this.getElement({type: "engine_list"}).getNode();

    for (var ii = 0; ii < tree.view.rowCount; ii ++) {
      engines.push({name: tree.view.getCellText(ii, tree.columns.getColumnAt(0)),
                    keyword: tree.view.getCellText(ii, tree.columns.getColumnAt(1))});
    }

    return engines;
  },

  /**
   * Gets the name of the selected search engine
   *
   * @returns Name of the selected search engine
   * @type string
   */
  get selectedEngine() {
    var treeNode = this.getElement({type: "engine_list"}).getNode();

    if(this.selectedIndex != -1) {
      return treeNode.view.getCellText(this.selectedIndex,
                                       treeNode.columns.getColumnAt(0));
    } else {
      return null;
    }
  },

  /**
   * Select the engine with the given name
   *
   * @param {string} name
   *        Name of the search engine to select
   */
  set selectedEngine(name) {
    var treeNode = this.getElement({type: "engine_list"}).getNode();

    for (var ii = 0; ii < treeNode.view.rowCount; ii ++) {
      if (name == treeNode.view.getCellText(ii, treeNode.columns.getColumnAt(0))) {
        this.selectedIndex = ii;
        break;
      }
    }
  },

  /**
   * Gets the index of the selected search engine
   *
   * @returns Index of the selected search engine
   * @type number
   */
  get selectedIndex() {
    var tree = this.getElement({type: "engine_list"});
    var treeNode = tree.getNode();

    return treeNode.view.selection.currentIndex;
  },

  /**
   * Select the engine with the given index
   *
   * @param {number} index
   *        Index of the search engine to select
   */
  set selectedIndex(index) {
    var tree = this.getElement({type: "engine_list"});
    var treeNode = tree.getNode();

    if (index < treeNode.view.rowCount) {
      widgets.clickTreeCell(this._controller, tree, index, 0, {});
    }

    this._controller.waitForEval("subject.manager.selectedIndex == subject.newIndex", TIMEOUT, 100,
                                 {manager: this, newIndex: index});
  },

  /**
   * Gets the suggestions enabled state
   */
  get suggestionsEnabled() {
    var checkbox = this.getElement({type: "suggest"});

    return checkbox.getNode().checked;
  },

  /**
   * Sets the suggestions enabled state
   */
  set suggestionsEnabled(state) {
    var checkbox = this.getElement({type: "suggest"});
    this._controller.check(checkbox, state);
  },

  /**
   * Close the engine manager
   *
   * @param {MozMillController} controller
   *        MozMillController of the window to operate on
   * @param {boolean} saveChanges
   *        (Optional) If true the OK button is clicked otherwise Cancel
   */
  close : function preferencesDialog_close(saveChanges) {
    saveChanges = (saveChanges == undefined) ? false : saveChanges;

    var button = this.getElement({type: "button", subtype: (saveChanges ? "accept" : "cancel")});
    this._controller.click(button);
  },

  /**
   * Edit the keyword associated to a search engine
   *
   * @param {string} name
   *        Name of the engine to remove
   * @param {function} handler
   *        Callback function for Engine Manager
   */
  editKeyword : function engineManager_editKeyword(name, handler)
  {
    // Select the search engine
    this.selectedEngine = name;

    // Setup the modal dialog handler
    md = new modalDialog.modalDialog(this._controller.window);
    md.start(handler);

    var button = this.getElement({type: "engine_button", subtype: "edit"});
    this._controller.click(button);
    md.waitForDialog();
  },

  /**
   * Gets all the needed external DTD urls as an array
   *
   * @returns Array of external DTD urls
   * @type [string]
   */
  getDtds : function engineManager_getDtds() {
    var dtds = ["chrome://browser/locale/engineManager.dtd"];
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
   * @type ElemBase
   */
  getElement : function engineManager_getElement(spec) {
    var elem = null;

    switch(spec.type) {
      /**
       * subtype: subtype to match
       * value: value to match
       */
      case "more_engines":
        elem = new elementslib.ID(this._controller.window.document, "addEngines");
        break;
      case "button":
        elem = new elementslib.Lookup(this._controller.window.document, MANAGER_BUTTONS +
                                      '/{"dlgtype":"' + spec.subtype + '"}');
        break;
      case "engine_button":
        switch(spec.subtype) {
          case "down":
            elem = new elementslib.ID(this._controller.window.document, "dn");
            break;
          case "edit":
            elem = new elementslib.ID(this._controller.window.document, "edit");
            break;
          case "remove":
            elem = new elementslib.ID(this._controller.window.document, "remove");
            break;
          case "up":
            elem = new elementslib.ID(this._controller.window.document, "up");
            break;
        }
        break;
      case "engine_list":
        elem = new elementslib.ID(this._controller.window.document, "engineList");
        break;
      case "suggest":
        elem = new elementslib.ID(this._controller.window.document, "enableSuggest");
        break;
      default:
        throw new Error(arguments.callee.name + ": Unknown element type - " + spec.type);
    }

    return elem;
  },

  /**
   * Clicks the "Get more search engines..." link
   */
  getMoreSearchEngines : function engineManager_getMoreSearchEngines() {
    var link = this.getElement({type: "more_engines"});
    this._controller.click(link);
  },

  /**
   * Move down the engine with the given name
   *
   * @param {string} name
   *        Name of the engine to remove
   */
  moveDownEngine : function engineManager_moveDownEngine(name) {
    this.selectedEngine = name;
    var index = this.selectedIndex;

    var button = this.getElement({type: "engine_button", subtype: "down"});
    this._controller.click(button);

    this._controller.waitForEval("subject.manager.selectedIndex == subject.oldIndex + 1", TIMEOUT, 100,
                                 {manager: this, oldIndex: index});
  },

  /**
   * Move up the engine with the given name
   *
   * @param {string} name
   *        Name of the engine to remove
   */
  moveUpEngine : function engineManager_moveUpEngine(name) {
    this.selectedEngine = name;
    var index = this.selectedIndex;

    var button = this.getElement({type: "engine_button", subtype: "up"});
    this._controller.click(button);

    this._controller.waitForEval("subject.manager.selectedIndex == subject.oldIndex - 1", TIMEOUT, 100,
                                 {manager: this, oldIndex: index});
  },

  /**
   * Remove the engine with the given name
   *
   * @param {string} name
   *        Name of the engine to remove
   */
  removeEngine : function engineManager_removeEngine(name) {
    this.selectedEngine = name;

    var button = this.getElement({type: "engine_button", subtype: "remove"});
    this._controller.click(button);

    this._controller.waitForEval("subject.manager.selectedEngine != subject.removedEngine", TIMEOUT, 100,
                                 {manager: this, removedEngine: name});
  },

  /**
   * Restores the defaults for search engines
   */
  restoreDefaults : function engineManager_restoreDefaults() {
    var button = this.getElement({type: "button", subtype: "extra2"});
    this._controller.click(button);
  }
};

/**
 * Constructor
 *
 * @param {MozMillController} controller
 *        MozMillController of the browser window to operate on
 */
function searchBar(controller)
{
  this._controller = controller;
  this._bss = Cc["@mozilla.org/browser/search-service;1"]
                 .getService(Ci.nsIBrowserSearchService);
}

/**
 * Search Manager class
 */
searchBar.prototype = {
  /**
   * Get the controller of the associated browser window
   *
   * @returns Controller of the browser window
   * @type MozMillController
   */
  get controller()
  {
    return this._controller;
  },

  /**
   * Get the names of all installed engines
   */
  get engines()
  {
    var engines = [ ];
    var popup = this.getElement({type: "searchBar_dropDownPopup"});

    for (var ii = 0; ii < popup.getNode().childNodes.length; ii++) {
      var entry = popup.getNode().childNodes[ii];
      if (entry.className.indexOf("searchbar-engine") != -1) {
        engines.push({name: entry.id,
                      selected: entry.selected,
                      tooltipText: entry.getAttribute('tooltiptext')
                    });
      }
    }

    return engines;
  },

  /**
   * Get the search engines drop down open state
   */
  get enginesDropDownOpen()
  {
    var popup = this.getElement({type: "searchBar_dropDownPopup"});
    return popup.getNode().state != "closed";
  },

  /**
   * Set the search engines drop down open state
   */
  set enginesDropDownOpen(newState)
  {
    if (this.enginesDropDownOpen != newState) {
      var button = this.getElement({type: "searchBar_dropDown"});
      this._controller.click(button);

      this._controller.waitForEval("subject.searchBar.enginesDropDownOpen == subject.newState", TIMEOUT, 100,
                                   {searchBar: this, newState: newState });
      this._controller.sleep(0);
    }
  },

  /**
   * Get the names of all installable engines
   */
  get installableEngines()
  {
    var engines = [ ];
    var popup = this.getElement({type: "searchBar_dropDownPopup"});

    for (var ii = 0; ii < popup.getNode().childNodes.length; ii++) {
      var entry = popup.getNode().childNodes[ii];
      if (entry.className.indexOf("addengine-item") != -1) {
        engines.push({name: entry.getAttribute('title'),
                      selected: entry.selected,
                      tooltipText: entry.getAttribute('tooltiptext')
                    });
      }
    }

    return engines;
  },

  /**
   * Returns the currently selected search engine
   *
   * @return Name of the currently selected engine
   * @type string
   */
  get selectedEngine()
  {
    // Open drop down which updates the list of search engines
    var state = this.enginesDropDownOpen;
    this.enginesDropDownOpen = true;

    var engine = this.getElement({type: "engine", subtype: "selected", value: "true"});
    this._controller.waitForElement(engine, TIMEOUT);

    this.enginesDropDownOpen = state;

    return engine.getNode().id;
  },

  /**
   * Select the search engine with the given name
   *
   * @param {string} name
   *        Name of the search engine to select
   */
  set selectedEngine(name) {
    // Open drop down and click on search engine
    this.enginesDropDownOpen = true;

    var engine = this.getElement({type: "engine", subtype: "id", value: name});
    this._controller.waitThenClick(engine, TIMEOUT);

    // Wait until the drop down has been closed
    this._controller.waitForEval("subject.searchBar.enginesDropDownOpen == false", TIMEOUT, 100,
                                 {searchBar: this});

    this._controller.waitForEval("subject.searchBar.selectedEngine == subject.newEngine", TIMEOUT, 100,
                                 {searchBar: this, newEngine: name});
  },

  /**
   * Returns all the visible search engines (API call)
   */
  get visibleEngines()
  {
    return this._bss.getVisibleEngines({});
  },

  /**
   * Checks if the correct target URL has been opened for the search
   *
   * @param {string} searchTerm
   *        Text which should be checked for
   */
  checkSearchResultPage : function searchBar_checkSearchResultPage(searchTerm) {
    // Retrieve the URL which is used for the currently selected search engine
    var targetUrl = this._bss.currentEngine.getSubmission(searchTerm, null).uri;
    var currentUrl = this._controller.tabs.activeTabWindow.document.location.href;

    // Check if pure domain names are identical
    var domainName = targetUrl.host.replace(/.+\.(\w+)\.\w+$/gi, "$1");
    var index = currentUrl.indexOf(domainName);

    this._controller.assertJS("subject.URLContainsDomain == true",
                              {URLContainsDomain: currentUrl.indexOf(domainName) != -1});

    // Check if search term is listed in URL
    this._controller.assertJS("subject.URLContainsText == true",
                              {URLContainsText: currentUrl.toLowerCase().indexOf(searchTerm.toLowerCase()) != -1});
  },

  /**
   * Clear the search field
   */
  clear : function searchBar_clear()
  {
    var activeElement = this._controller.window.document.activeElement;

    var searchInput = this.getElement({type: "searchBar_input"});
    var cmdKey = utils.getEntity(this.getDtds(), "selectAllCmd.key");
    this._controller.keypress(searchInput, cmdKey, {accelKey: true});
    this._controller.keypress(searchInput, 'VK_DELETE', {});

    if (activeElement)
      activeElement.focus();
  },

  /**
   * Focus the search bar text field
   *
   * @param {object} event
   *        Specifies the event which has to be used to focus the search bar
   */
  focus : function searchBar_focus(event)
  {
    var input = this.getElement({type: "searchBar_input"});

    switch (event.type) {
      case "click":
        this._controller.click(input);
        break;
      case "shortcut":
        if (mozmill.isLinux) {
          var cmdKey = utils.getEntity(this.getDtds(), "searchFocusUnix.commandkey");
        } else {
          var cmdKey = utils.getEntity(this.getDtds(), "searchFocus.commandkey");
        }
        this._controller.keypress(null, cmdKey, {accelKey: true});
        break;
      default:
        throw new Error(arguments.callee.name + ": Unknown element type - " + event.type);
    }

    // Check if the search bar has the focus
    var activeElement = this._controller.window.document.activeElement;
    this._controller.assertJS("subject.isFocused == true",
                              {isFocused: input.getNode() == activeElement});
  },

  /**
   * Gets all the needed external DTD urls as an array
   *
   * @returns Array of external DTD urls
   * @type [string]
   */
  getDtds : function searchBar_getDtds() {
    var dtds = ["chrome://browser/locale/browser.dtd"];
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
   * @type ElemBase
   */
  getElement : function searchBar_getElement(spec) {
    var elem = null;

    switch(spec.type) {
      /**
       * subtype: subtype to match
       * value: value to match
       */
      case "engine":
        // XXX: bug 555938 - Mozmill can't fetch the element via a lookup here.
        // That means we have to grab it temporarily by iterating through all childs.
        var popup = this.getElement({type: "searchBar_dropDownPopup"}).getNode();
        for (var ii = 0; ii < popup.childNodes.length; ii++) {
          var entry = popup.childNodes[ii];
          if (entry.getAttribute(spec.subtype) == spec.value) {
            elem = new elementslib.Elem(entry);
            break;
          }
        }
        //elem = new elementslib.Lookup(this._controller.window.document, SEARCH_POPUP +
        //                              '/anon({"' + spec.subtype + '":"' + spec.value + '"})');
        break;
      case "engine_manager":
        // XXX: bug 555938 - Mozmill can't fetch the element via a lookup here.
        // That means we have to grab it temporarily by iterating through all childs.
        var popup = this.getElement({type: "searchBar_dropDownPopup"}).getNode();
        for (var ii = popup.childNodes.length - 1; ii >= 0; ii--) {
          var entry = popup.childNodes[ii];
          if (entry.className == "open-engine-manager") {
            elem = new elementslib.Elem(entry);
            break;
          }
        }
        //elem = new elementslib.Lookup(this._controller.window.document, SEARCH_POPUP +
        //                              '/anon({"anonid":"open-engine-manager"})');
        break;
      case "searchBar":
        elem = new elementslib.Lookup(this._controller.window.document, SEARCH_BAR);
        break;
      case "searchBar_autoCompletePopup":
        elem = new elementslib.Lookup(this._controller.window.document, SEARCH_AUTOCOMPLETE);
        break;
      case "searchBar_contextMenu":
        elem = new elementslib.Lookup(this._controller.window.document, SEARCH_CONTEXT);
        break;
      case "searchBar_dropDown":
        elem = new elementslib.Lookup(this._controller.window.document, SEARCH_DROPDOWN);
        break;
      case "searchBar_dropDownPopup":
        elem = new elementslib.Lookup(this._controller.window.document, SEARCH_POPUP);
        break;
      case "searchBar_goButton":
        elem = new elementslib.Lookup(this._controller.window.document, SEARCH_GO_BUTTON);
        break;
      case "searchBar_input":
        elem = new elementslib.Lookup(this._controller.window.document, SEARCH_INPUT);
        break;
      case "searchBar_suggestions":
        elem = new elementslib.Lookup(this._controller.window.document, SEARCH_AUTOCOMPLETE +
                                      '/anon({"anonid":"tree"})');
         break;
      case "searchBar_textBox":
        elem = new elementslib.Lookup(this._controller.window.document, SEARCH_TEXTBOX);
        break;
      default:
        throw new Error(arguments.callee.name + ": Unknown element type - " + spec.type);
    }

    return elem;
  },

  /**
   * Returns the search suggestions for the search term
   */
  getSuggestions : function(searchTerm) {
    var suggestions = [ ];
    var popup = this.getElement({type: "searchBar_autoCompletePopup"});
    var treeElem = this.getElement({type: "searchBar_suggestions"});

    // Enter search term and wait for the popup
    this.type(searchTerm);

    this._controller.waitForEval("subject.popup.state == 'open'", TIMEOUT, 100,
                                 {popup: popup.getNode()});
    this._controller.waitForElement(treeElem, TIMEOUT);

    // Get all suggestions
    var tree = treeElem.getNode();
    this._controller.waitForEval("subject.tree.view != null", TIMEOUT, 100,
                                 {tree: tree});
    for (var i = 0; i < tree.view.rowCount; i ++) {
      suggestions.push(tree.view.getCellText(i, tree.columns.getColumnAt(0)));
    }

    // Close auto-complete popup
    this._controller.keypress(popup, "VK_ESCAPE", {});
    this._controller.waitForEval("subject.popup.state == 'closed'", TIMEOUT, 100,
                                 {popup: popup.getNode()});

    return suggestions;
  },

  /**
   * Check if a search engine is installed (API call)
   *
   * @param {string} name
   *        Name of the search engine to check
   */
  isEngineInstalled : function searchBar_isEngineInstalled(name)
  {
    var engine = this._bss.getEngineByName(name);
    return (engine != null);
  },

  /**
   * Open the Engine Manager
   *
   * @param {function} handler
   *        Callback function for Engine Manager
   */
  openEngineManager : function searchBar_openEngineManager(handler)
  {
    this.enginesDropDownOpen = true;
    var engineManager = this.getElement({type: "engine_manager"});

    // Setup the modal dialog handler
    md = new modalDialog.modalDialog(this._controller.window);
    md.start(handler);

    // XXX: Bug 555347 - Process any outstanding events before clicking the entry
    this._controller.sleep(0);
    this._controller.click(engineManager);
    md.waitForDialog();

    this._controller.assert(function () {
      return this.enginesDropDownOpen == false;
    }, "The search engine drop down menu has been closed", this);
  },

  /**
   * Remove the search engine with the given name (API call)
   *
   * @param {string} name
   *        Name of the search engine to remove
   */
  removeEngine : function searchBar_removeEngine(name)
  {
    if (this.isEngineInstalled(name)) {
      var engine = this._bss.getEngineByName(name);
      this._bss.removeEngine(engine);
    }
  },

  /**
   * Restore the default set of search engines (API call)
   */
  restoreDefaultEngines : function searchBar_restoreDefaults()
  {
    // XXX: Bug 556477 - Restore default sorting
    this.openEngineManager(function(controller) {
      var manager = new engineManager(controller);

      // We have to do any action so the restore button gets enabled
      manager.moveDownEngine(manager.engines[0].name);
      manager.restoreDefaults();
      manager.close(true);
    });

    // Update the visibility status for each engine and reset the default engine
    this._bss.restoreDefaultEngines();
    this._bss.currentEngine = this._bss.defaultEngine;

    // Clear any entered search term
    this.clear();
  },

  /**
   * Start a search with the given search term and check if the resulting URL
   * contains the search term.
   *
   * @param {object} data
   *        Object which contains the search term and the action type
   */
  search : function searchBar_search(data)
  {
    var searchBar = this.getElement({type: "searchBar"});
    this.type(data.text);

    switch (data.action) {
      case "returnKey":
        this._controller.keypress(searchBar, 'VK_RETURN', {});
        break;
      case "goButton":
      default:
        this._controller.click(this.getElement({type: "searchBar_goButton"}));
        break;
    }

    this._controller.waitForPageLoad();
    this.checkSearchResultPage(data.text);
  },

  /**
   * Enter a search term into the search bar
   *
   * @param {string} searchTerm
   *        Text which should be searched for
   */
  type : function searchBar_type(searchTerm) {
    var searchBar = this.getElement({type: "searchBar"});
    this._controller.type(searchBar, searchTerm);
  }
};

// Export of classes
exports.engineManager = engineManager;
exports.searchBar = searchBar;
