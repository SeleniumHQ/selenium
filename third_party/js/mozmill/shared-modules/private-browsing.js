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
 * The PrivateBrowsingAPI adds support for handling the private browsing mode.
 *
 * @version 1.0.0
 */

// Include required modules
var modalDialog = require("modal-dialog");
var prefs = require("prefs");
var utils = require("utils");

// Preference for confirmation dialog when entering Private Browsing mode
const PB_NO_PROMPT_PREF = 'browser.privatebrowsing.dont_prompt_on_enter';

const gTimeout = 5000;

/**
 * Create a new privateBrowsing instance.
 *
 * @class This class adds support for the Private Browsing mode
 * @param {MozMillController} controller
 *        MozMillController to use for the modal entry dialog
 */
function privateBrowsing(controller) {
  this._controller = controller;
  this._handler = null;

  /**
   * Menu item in the main menu to enter/leave Private Browsing mode
   * @private
   */
  this._pbMenuItem = new elementslib.Elem(this._controller.menus['tools-menu'].privateBrowsingItem);
  this._pbTransitionItem = new elementslib.ID(this._controller.window.document, "Tools:PrivateBrowsing");

  this.__defineGetter__('_pbs', function() {
    delete this._pbs;
    return this._pbs = Cc["@mozilla.org/privatebrowsing;1"].
                       getService(Ci.nsIPrivateBrowsingService);
  });
}

/**
 * Prototype definition of the privateBrowsing class
 */
privateBrowsing.prototype = {
  /**
   * Returns the controller of the current window
   *
   * @returns Mozmill Controller
   * @type {MozMillController}
   */
  get controller() {
    return this._controller;
  },

  /**
   * Checks the state of the Private Browsing mode
   *
   * @returns Enabled state
   * @type {boolean}
   */
  get enabled() {
    return this._pbs.privateBrowsingEnabled;
  },

  /**
   * Sets the state of the Private Browsing mode
   *
   * @param {boolean} value
   *        New state of the Private Browsing mode
   */
  set enabled(value) {
    this._pbs.privateBrowsingEnabled = value;
  },

  /**
   * Sets the callback handler for the confirmation dialog
   *
   * @param {function} callback
   *        Callback handler for the confirmation dialog
   */
  set handler(callback) {
    this._handler = callback;
  },

  /**
   * Gets the enabled state of the confirmation dialog
   *
   * @returns Enabled state
   * @type {boolean}
   */
  get showPrompt() {
    return !prefs.preferences.getPref(PB_NO_PROMPT_PREF, true);
  },

  /**
   * Sets the enabled state of the confirmation dialog
   *
   * @param {boolean} value
   *        New enabled state of the confirmation dialog
   */
  set showPrompt(value){
    prefs.preferences.setPref(PB_NO_PROMPT_PREF, !value);
  },

  /**
   * Gets all the needed external DTD urls as an array
   *
   * @returns Array of external DTD urls
   * @type [string]
   */
  getDtds : function downloadManager_getDtds() {
    var dtds = ["chrome://branding/locale/brand.dtd",
                "chrome://browser/locale/browser.dtd",
                "chrome://browser/locale/aboutPrivateBrowsing.dtd"];
    return dtds;
  },

  /**
   * Turn off Private Browsing mode and reset all changes
   */
  reset : function privateBrowsing_reset() {
    try {
      this.stop(true);
    } catch (ex) {
      // Do a hard reset
      this.enabled = false;
    }

    this.showPrompt = true;
  },

  /**
   * Start the Private Browsing mode
   *
   * @param {boolean} useShortcut
   *        Use the keyboard shortcut if true otherwise the menu entry is used
   */
  start: function privateBrowsing_start(useShortcut) {
    var dialog = null;

    if (this.enabled)
      return;

    if (this.showPrompt) {
      dialog = new modalDialog.modalDialog(this._controller.window);
      dialog.start(this._handler);
    }

    if (useShortcut) {
      var cmdKey = utils.getEntity(this.getDtds(), "privateBrowsingCmd.commandkey");
      this._controller.keypress(null, cmdKey, {accelKey: true, shiftKey: true});
    } else {
      this._controller.click(this._pbMenuItem);
    }

    if (dialog) {
      dialog.waitForDialog();
    }
    this.waitForTransistionComplete(true);
  },

  /**
   * Stop the Private Browsing mode
   *
   * @param {boolean} useShortcut
   *        Use the keyboard shortcut if true otherwise the menu entry is used
   */
  stop: function privateBrowsing_stop(useShortcut)
  {
    if (!this.enabled)
      return;

    if (useShortcut) {
      var privateBrowsingCmdKey = utils.getEntity(this.getDtds(), "privateBrowsingCmd.commandkey");
      this._controller.keypress(null, privateBrowsingCmdKey, {accelKey: true, shiftKey: true});
    } else {
      this._controller.click(this._pbMenuItem);
    }

    this.waitForTransistionComplete(false);
  },

  /**
   * Waits until the transistion into or out of the Private Browsing mode happened
   *
   * @param {boolean} state
   *        Expected target state of the Private Browsing mode
   */
  waitForTransistionComplete : function privateBrowsing_waitForTransitionComplete(state) {
    // We have to wait until the transition has been finished
    this._controller.waitForEval("subject.hasAttribute('disabled') == false", gTimeout, 100,
                                 this._pbTransitionItem.getNode());
    this._controller.waitForEval("subject.privateBrowsing.enabled == subject.state", gTimeout, 100,
                                 {privateBrowsing: this, state: state});
  }
}

// Export of classes
exports.privateBrowsing = privateBrowsing;
