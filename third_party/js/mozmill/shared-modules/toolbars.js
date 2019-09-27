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
 * The ToolbarAPI adds support for accessing and interacting with toolbar elements
 *
 * @version 1.0.0
 */

// Include required modules
var utils = require("utils");

const TIMEOUT = 5000;

const AUTOCOMPLETE_POPUP = '/id("main-window")/id("mainPopupSet")/id("PopupAutoCompleteRichResult")';
const NOTIFICATION_POPUP = '/id("main-window")/id("mainPopupSet")/id("notification-popup")';
const URLBAR_CONTAINER = '/id("main-window")/id("tab-view-deck")/{"flex":"1"}' +
                         '/id("navigator-toolbox")/id("nav-bar")/id("urlbar-container")';
const URLBAR_INPUTBOX = URLBAR_CONTAINER + '/id("urlbar")/anon({"anonid":"stack"})' + 
                                           '/anon({"anonid":"textbox-container"})' + 
                                           '/anon({"anonid":"textbox-input-box"})';
const CONTEXT_MENU = URLBAR_INPUTBOX + '/anon({"anonid":"input-box-contextmenu"})';

/**
 * Constructor
 * 
 * @param {MozmillController} controller
 *        MozMillController of the window to operate on
 */
function autoCompleteResults(controller) {
  this._controller = controller;
  this._popup = this.getElement({type: "popup"});
  this._results = this.getElement({type: "results"});
}

/**
 * AutoComplete Result class
 */
autoCompleteResults.prototype = {
  /**
   * Returns all autocomplete results
   *
   * @returns Autocomplete results
   * @type {Array of ElemBase}
   */
  get allResults() {
    var results = [];
    for (ii = 0; ii < this.length; ii++) {
      results.push(this.getResult(ii));
    }
    return results;
  },

  /**
   * Returns the controller of the current window
   *
   * @returns Mozmill Controller
   * @type MozMillController
   */
  get controller() {
    return this._controller;
  },

  /**
   * Check if the autocomplete popup is open
   *
   * @returns True if the panel is open
   * @type {boolean}
   */
  get isOpened() {
    return (this._popup.getNode().state == 'open');
  },

  /**
   * Return the amount of autocomplete entries
   *
   * @returns Number of all entries
   * @type {number}
   */
  get length() {
    return this._results.getNode().itemCount;
  },

  /**
   * Returns the currently selected index
   *
   * @returns Selected index
   * @type {number}
   */
  get selectedIndex() {
    return this._results.getNode().selectedIndex;
  },

  /**
   * Returns the visible autocomplete results
   *
   * @returns Results
   * @type {Array of ElemBase}
   */
  get visibleResults() {
    var results = [];
    for (ii = 0; ii < this.length; ii++) {
      var result = this.getResult(ii);
      if (!result.getNode().hasAttribute("collapsed"))
        results.push(result);
    }
    return results;
  },

  /**
   * Returns the underlined text of all results from the text or URL
   *
   * @param {ElemBase} result
   *        Autocomplete result which has to be checked
   * @param {string} type
   *        Type of element to check (text or url)
   *
   * @returns An array of substrings which are underlined
   * @type {Array of string}
   */
  getUnderlinedText : function autoCompleteResults_getUnderlinedText(result, type) {
    this._controller.assertJS("subject.resultNode != null",
                              {resultNode: result.getNode()});

    // Get the description element of the given title or url
    var description = null;
    switch (type) {
      case "title":
        description = result.getNode().boxObject.firstChild.childNodes[1].childNodes[0];
        break;
      case "url":
        description = result.getNode().boxObject.lastChild.childNodes[2].childNodes[0];
        break;
      default:
        throw new Error(arguments.callee.name + ": Type unknown - " + type);
    }

    let values = [ ];
    for each (node in description.childNodes) {
      if (node.nodeName == 'span') {
        // Only add underlined text to the results
        values.push(node.innerHTML);
      }
    }

    return values;
  },

  /**
   * Gets all the needed external DTD urls as an array
   *
   * @returns Array of external DTD urls
   * @type [string]
   */
  getDtds : function autoCompleteResults_getDtds() {
    return null;
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
  getElement : function autoCompleteResults_getElement(spec) {
    var elem = null;

    switch (spec.type) {
      /**
       * subtype: subtype to match
       * value: value to match
       */
      case "popup":
        elem = new elementslib.Lookup(this._controller.window.document, AUTOCOMPLETE_POPUP);
        break;
      case "results":
        elem = new elementslib.Lookup(this._controller.window.document,
                                      AUTOCOMPLETE_POPUP + '/anon({"anonid":"richlistbox"})');
        break;
      case "result":
        elem = new elementslib.Elem(this._results.getNode().getItemAtIndex(spec.value));
        break;
      default:
        throw new Error(arguments.callee.name + ": Unknown element type - " + spec.type);
    }

    return elem;
  },

  /**
   * Returns the autocomplete result element of the given index
   *
   * @param {number} index
   *        Index of the result to return
   * @returns Autocomplete result element
   * @type {ElemBase}
   */
  getResult : function autoCompleteResults_getResult(index) {
    return this.getElement({type: "result", value: index});
  }
}

/**
 * Constructor
 * 
 * @param {MozmillController} controller
 *        MozMillController of the window to operate on
 */
function locationBar(controller)
{
  this._controller = controller;
  this._autoCompleteResults = new autoCompleteResults(controller);
}

/**
 * Location Bar class
 */
locationBar.prototype = {
  /**
   * Returns the autocomplete object
   *
   * @returns Autocomplete object
   * @type {object}
   */
  get autoCompleteResults() {
    return this._autoCompleteResults;
  },

  /**
   * Returns the controller of the current window
   *
   * @returns Mozmill controller
   * @type {MozMillController}
   */
  get controller() {
    return this._controller;
  },

  /**
   * Returns the urlbar element
   *
   * @returns URL bar
   * @type {ElemBase}
   */
  get urlbar() {
    return this.getElement({type: "urlbar"});
  },

  /**
   * Returns the currently shown URL
   *
   * @returns Text inside the location bar
   * @type {string}
   */
  get value() {
    return this.urlbar.getNode().value;
  },

  /**
   * Clear the location bar
   */
  clear : function locationBar_clear() {
    this.focus({type: "shortcut"});
    this._controller.keypress(this.urlbar, "VK_DELETE", {});
    this._controller.waitForEval("subject.value == ''",
                                 TIMEOUT, 100, this.urlbar.getNode());
  },

  /**
   * Close the context menu of the urlbar input field
   */
  closeContextMenu : function locationBar_closeContextMenu() {
    var menu = this.getElement({type: "contextMenu"});
    this._controller.keypress(menu, "VK_ESCAPE", {});
  },

  /**
   * Check if the location bar contains the given text
   *
   * @param {string} text
   *        Text which should be checked against
   */
  contains : function locationBar_contains(text) {
    return this.urlbar.getNode().value.indexOf(text) != -1;
  },

  /**
   * Focus the location bar
   *
   * @param {object} event
   *        Focus the location bar with the given event (click or shortcut)
   */
  focus : function locationBar_focus(event) {
    switch (event.type) {
      case "click":
        this._controller.click(this.urlbar);
        break;
      case "shortcut":
        var cmdKey = utils.getEntity(this.getDtds(), "openCmd.commandkey");
        this._controller.keypress(null, cmdKey, {accelKey: true});
        break;
      default:
        throw new Error(arguments.callee.name + ": Unkown event type - " + event.type);
    }

    // Wait until the location bar has been focused
    this._controller.waitForEval("subject.getAttribute('focused') == 'true'",
                                 TIMEOUT, 100, this.urlbar.getNode());
  },

  /**
   * Gets all the needed external DTD urls as an array
   *
   * @returns Array of external DTD urls
   * @type [string]
   */
  getDtds : function locationBar_getDtds() {
    var dtds = ["chrome://branding/locale/brand.dtd",
                "chrome://browser/locale/browser.dtd"];
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
  getElement : function locationBar_getElement(spec) {
    var elem = null;

    switch(spec.type) {
      /**
       * subtype: subtype to match
       * value: value to match
       */
      case "contextMenu":
        elem = new elementslib.Lookup(this._controller.window.document, CONTEXT_MENU);
        break;
      case "contextMenu_entry":
        elem = new elementslib.Lookup(this._controller.window.document, CONTEXT_MENU +
                                      '/{"cmd":"cmd_' + spec.subtype + '"}');
        break;
      case "favicon":
        elem = new elementslib.ID(this._controller.window.document, "page-proxy-favicon");
        break;
      case "feedButton":
        elem = new elementslib.ID(this._controller.window.document, "feed-button");
        break;
      case "goButton":
        elem = new elementslib.ID(this._controller.window.document, "urlbar-go-button");
        break;
      case "historyDropMarker":
        elem = new elementslib.Lookup(this._controller.window.document,
                                      URLBAR_CONTAINER + '/id("urlbar")/anon({"anonid":"historydropmarker"})');
        break;
      case "identityBox":
        elem = new elementslib.ID(this._controller.window.document, "identity-box");
        break;
      case "notification_element":
        elem = new elementslib.Lookup(this._controller.window.document, NOTIFICATION_POPUP +
                                      spec.subtype);
        break;
      case "notification_popup":
        elem = new elementslib.Lookup(this._controller.window.document, NOTIFICATION_POPUP);
        break;
      case "starButton":
        elem = new elementslib.ID(this._controller.window.document, "star-button");
        break;
      case "urlbar":
        elem = new elementslib.ID(this._controller.window.document, "urlbar");
        break;
      case "urlbar_input":
        elem = new elementslib.Lookup(this._controller.window.document, URLBAR_INPUTBOX +
                                      '/anon({"anonid":"input"})');
        break;
      default:
        throw new Error(arguments.callee.name + ": Unknown element type - " + spec.type);
    }

    return elem;
  },

  /**
   * Retrieves the notification popup
   * 
   * @return The notification popup element
   * @type {ElemBase}
   */
  getNotification : function locationBar_getNotification() { 
    return this.getElement({type: "notification_popup"});
  },

  /**
   * Retrieves the specified element of the door hanger notification bar
   *
   * @param {string} aType
   *        Type of the notification bar to look for
   * @param {string} aLookupString
   *        Lookup string of the notification bar's child element
   *        [optional - default: ""]
   *
   * @return The created element
   * @type {ElemBase}
   */
  getNotificationElement : function locationBar_getNotificationElement(aType, aLookupString)
  {
    var lookup = '/id("' + aType + '")';
    lookup = aLookupString ? lookup + aLookupString : lookup;

    // Get the notification and fetch the child element if wanted
    return this.getElement({type: "notification_element", subtype: lookup});
  },

  /**
   * Load the given URL
   *
   * @param {string} url
   *        URL of web page to load
   */
  loadURL : function locationBar_loadURL(url) {
    this.focus({type: "shortcut"});
    this.type(url);
    this._controller.keypress(this.urlbar, "VK_RETURN", {});
  },

  /**
   * Toggles between the open and closed state of the auto-complete popup
   */
  toggleAutocompletePopup : function locationBar_toggleAutocompletePopup() {
    var dropdown = this.getElement({type: "historyDropMarker"});
    var stateOpen = this.autoCompleteResults.isOpened;

    this._controller.click(dropdown);
    this._controller.waitForEval("subject.isOpened == " + stateOpen,
                                 TIMEOUT, 100, this.autoCompleteResults);
  },

  /**
   * Type the given text into the location bar
   *
   * @param {string} text
   *        Text to enter into the location bar
   */
  type : function locationBar_type(text) {
    this._controller.type(this.urlbar, text);
    this.contains(text);
  }
}

// Export of classes
exports.locationBar = locationBar;
exports.autoCompleteResults = autoCompleteResults;

