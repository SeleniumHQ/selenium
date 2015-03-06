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
 *   Clint Talbert <ctalbert@mozilla.com>
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

const TIMEOUT_MODAL_DIALOG = 5000;
const DELAY_CHECK = 100;

/**
 * Observer object to find the modal dialog spawned by a controller
 *
 * @constructor
 * @class Observer used to find a modal dialog
 *
 * @param {object} aOpener
 *        Window which is the opener of the modal dialog
 * @param {function} aCallback
 *        The callback handler to use to interact with the modal dialog
 */
function mdObserver(aOpener, aCallback) {
  this._opener = aOpener;
  this._callback = aCallback;
  this._timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);

  this.exception = null;
  this.finished = false;
}

mdObserver.prototype = {

  /**
   * Check if the modal dialog has been opened
   *
   * @returns {object} The modal dialog window found, or null.
   */
  findWindow : function mdObserver_findWindow() {
    // If a window has been opened from content, it has to be unwrapped.
    var window = domUtils.unwrapNode(mozmill.wm.getMostRecentWindow(''));

    // Get the WebBrowserChrome and check if it's a modal window
    var chrome = window.QueryInterface(Ci.nsIInterfaceRequestor).
                 getInterface(Ci.nsIWebNavigation).
                 QueryInterface(Ci.nsIDocShellTreeItem).
                 treeOwner.
                 QueryInterface(Ci.nsIInterfaceRequestor).
                 getInterface(Ci.nsIWebBrowserChrome);
    if (!chrome.isWindowModal()) {
      return null;
    }

    // Opening a modal dialog from a modal dialog would fail, if we wouldn't
    // check for the opener of the modal dialog
    var found = false;
    if (window.opener) {
      // XXX Bug 614757 - an already unwrapped node returns a wrapped node
      var opener = domUtils.unwrapNode(window.opener);
      found = (mozmill.utils.getChromeWindow(opener) == this._opener);
    }
    else {
      // Also note that it could happen that dialogs don't have an opener
      // (i.e. clear recent history). In such a case make sure that the most
      // recent window is not the passed in reference opener
      found = (window != this._opener);
    }

    return (found ? window : null);
  },

  /**
   * Called by the timer in the given interval to check if the modal dialog has
   * been opened. Once it has been found the callback gets executed
   *
   * @param {object} aSubject Not used.
   * @param {string} aTopic Not used.
   * @param {string} aData Not used.
   */
  observe : function mdObserver_observe(aSubject, aTopic, aData) {
    // Once the window has been found and loaded we can execute the callback
    var window = this.findWindow();
    if (window && ("documentLoaded" in window)) {
      try {
        this._callback(new mozmill.controller.MozMillController(window));
      }
      catch (ex) {
        // Store the exception, so it can be forwarded if a modal dialog has
        // been opened by another modal dialog
        this.exception = ex;
      }

      if (window) {
        window.close();
      }

      this.finished = true;
      this.stop();
    }
    else {
      // otherwise try again in a bit
      this._timer.init(this, DELAY_CHECK, Ci.nsITimer.TYPE_ONE_SHOT);
    }
  },

  /**
   * Stop the timer which checks for new modal dialogs
   */
  stop : function mdObserver_stop() {
    delete this._timer;
  }
};


/**
 * Creates a new instance of modalDialog.
 *
 * @constructor
 * @class Handler for modal dialogs
 *
 * @param {object} aWindow [optional - default: null]
 *        Window which is the opener of the modal dialog
 */
function modalDialog(aWindow) {
  this._window = aWindow || null;
}

modalDialog.prototype = {

  /**
   * Simply checks if the modal dialog has been processed
   *
   * @returns {boolean} True, if the dialog has been processed
   */
  get finished() {
    return (!this._observer || this._observer.finished);
  },

  /**
   * Start timer to wait for the modal dialog.
   *
   * @param {function} aCallback
   *        The callback handler to use to interact with the modal dialog
   */
  start : function modalDialog_start(aCallback) {
    if (!aCallback)
      throw new Error(arguments.callee.name + ": Callback not specified.");

    this._observer = new mdObserver(this._window, aCallback);

    this._timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
    this._timer.init(this._observer, DELAY_CHECK, Ci.nsITimer.TYPE_ONE_SHOT);
  },

  /**
   * Stop the timer which checks for new modal dialogs
   */
  stop : function modalDialog_stop() {
    delete this._timer;

    if (this._observer) {
      this._observer.stop();
      this._observer = null;
    }
  },

  /**
   * Wait until the modal dialog has been processed.
   *
   * @param {Number} aTimeout (optional - default 5s)
   *        Duration to wait
   */
  waitForDialog : function modalDialog_waitForDialog(aTimeout) {
    var timeout = aTimeout || TIMEOUT_MODAL_DIALOG;

    if (!this._observer) {
      return;
    }

    try {
      mozmill.utils.waitFor(function () {
        return this.finished;
      }, "Modal dialog has been found and processed", timeout, undefined, this);

      // Forward the raised exception so we can detect failures in modal dialogs
      if (this._observer.exception) {
        throw this._observer.exception;
      }
    }
    finally {
      this.stop();
    }
  }
}


// Export of classes
exports.modalDialog = modalDialog;
