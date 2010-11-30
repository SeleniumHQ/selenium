/* * ***** BEGIN LICENSE BLOCK *****
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
 * **** END LICENSE BLOCK ***** */

/**
 * @fileoverview
 * The SoftwareUpdateAPI adds support for an easy access to the update process.
 */

// Include required modules
var prefs = require("prefs");
var utils = require("utils");

const gTimeoutUpdateCheck     = 10000;
const gTimeoutUpdateDownload  = 360000;

// Helper lookup constants for elements of the software update dialog
const WIZARD = '/id("updates")';
const WIZARD_BUTTONS = WIZARD + '/anon({"anonid":"Buttons"})';
const WIZARD_DECK = WIZARD  + '/anon({"anonid":"Deck"})';

const WIZARD_PAGES = {
  dummy: 'dummy',
  checking: 'checking',
  pluginUpdatesFound: 'pluginupdatesfound',
  noUpdatesFound: 'noupdatesfound',
  manualUpdate: 'manualUpdate',
  incompatibleCheck: 'incompatibleCheck',
  updatesFoundBasic: 'updatesfoundbasic',
  updatesFoundBillboard: 'updatesfoundbillboard',
  license: 'license',
  incompatibleList: 'incompatibleList',
  downloading: 'downloading',
  errors: 'errors',
  errorPatching: 'errorpatching',
  finished: 'finished',
  finishedBackground: 'finishedBackground',
  installed: 'installed'
}

// On Mac there is another DOM structure used as on Windows and Linux
if (mozmill.isMac) {
  var WIZARD_BUTTONS_BOX = WIZARD_BUTTONS +
                             '/anon({"flex":"1"})/{"class":"wizard-buttons-btm"}/';
  var WIZARD_BUTTON = {
          back: '{"dlgtype":"back"}',
          next: '{"dlgtype":"next"}',
          cancel: '{"dlgtype":"cancel"}',
          finish: '{"dlgtype":"finish"}',
          extra1: '{"dlgtype":"extra1"}',
          extra2: '{"dlgtype":"extra2"}'
        }
} else {
  var WIZARD_BUTTONS_BOX = WIZARD_BUTTONS +
                       '/anon({"flex":"1"})/{"class":"wizard-buttons-box-2"}/';
  var WIZARD_BUTTON = {
    back: '{"dlgtype":"back"}',
    next: 'anon({"anonid":"WizardButtonDeck"})/[1]/{"dlgtype":"next"}',
    cancel: '{"dlgtype":"cancel"}',
    finish: 'anon({"anonid":"WizardButtonDeck"})/[0]/{"dlgtype":"finish"}',
    extra1: '{"dlgtype":"extra1"}',
    extra2: '{"dlgtype":"extra2"}'
  }
}

/**
 * Constructor for software update class
 */
function softwareUpdate() {
  this._controller = null;
  this._wizard = null;

  this._aus = Cc["@mozilla.org/updates/update-service;1"].
              getService(Ci.nsIApplicationUpdateService);
  this._ums = Cc["@mozilla.org/updates/update-manager;1"].
              getService(Ci.nsIUpdateManager);
  this._vc = Cc["@mozilla.org/xpcom/version-comparator;1"].
             getService(Ci.nsIVersionComparator);
}

/**
 * Class for software updates
 */
softwareUpdate.prototype = {
  /**
   * Returns the active update
   *
   * @returns The currently selected update
   * @type nsIUpdate
   */
  get activeUpdate() {
    return this._ums.activeUpdate;
  },

  /**
   * Check if the user has permissions to run the software update
   *
   * @returns Status if the user has the permissions.
   * @type {boolean}
   */
  get allowed() {
    return this._aus.canCheckForUpdates && this._aus.canApplyUpdates;
  },

  /**
   * Returns information of the current build version
   */
  get buildInfo() {
    return {
      buildid : utils.appInfo.buildID,
      locale : utils.appInfo.locale,
      user_agent : utils.appInfo.userAgent,
      version : utils.appInfo.version
    };
  },

  /**
   * Returns the current update channel
   */
  get channel() {
    return prefs.preferences.getPref('app.update.channel', '');
  },

  /**
   * Get the controller of the associated engine manager dialog
   *
   * @returns Controller of the browser window
   * @type MozMillController
   */
  get controller() {
    return this._controller;
  },

  /**
   * Returns the current step of the software update dialog wizard
   */
  get currentPage() {
    return this._wizard.getNode().getAttribute('currentpageid');
  },

  /**
   * Returns true if the offered update is a complete update
   */
  get isCompleteUpdate() {
    // Throw when isCompleteUpdate is called without an update. This should
    // never happen except if the test is incorrectly written.
    if (!this.activeUpdate)
      throw new Error(arguments.callee.name + ": isCompleteUpdate called " +
                      "when activeUpdate is null!");

    var patchCount = this.activeUpdate.patchCount;
    if ((patchCount < 1) || (patchCount > 2)) {
      throw new Error("An update must have one or two patches included.");
    }

    // XXX: After Firefox 4 has been released and we do not have to test any
    // beta release anymore uncomment out the following code
//    if (this.activeUpdate.patchCount == 2) {
//      var patch0URL = this.activeUpdate.getPatchAt(0).URL;
//      var patch1URL = this.activeUpdate.getPatchAt(1).URL;
       // Test that the update snippet created by releng doesn't have the same
       // url for both patches (bug 514040).
//      controller.assertJS("subject.patch0URL != subject.patch1URL",
//                          {patch0URL: patch0URL, patch1URL: patch1URL});
//    }

    return (this.activeUpdate.selectedPatch.type  == "complete");
  },

   /**
   * Returns information of the active update in the queue.
   */
  get patchInfo() {
    this._controller.assert(function() {
      return !!this.activeUpdate;
    }, "An active update is in the queue.", this);

    return {
      buildid : this.activeUpdate.buildID,
      channel : this.channel,
      is_complete : this.isCompleteUpdate,
      type : this.activeUpdate.type,
      url : this.activeUpdate.selectedPatch.finalURL || "n/a",
      version : this.activeUpdate.version
    };
  },

  /**
   * Returns the update type (minor or major)
   *
   * @returns The update type
   */
  get updateType() {
    return this.activeUpdate.type;
  },

  /**
   * Check if updates have been found
   */
  get updatesFound() {
    return this.currentPage.indexOf("updatesfound") == 0;
  },

  /**
   * Checks if an update has been applied correctly
   *
   * @param {object} updateData
   *        All the data collected during the update process
   */
  assertUpdateApplied : function softwareUpdate_assertUpdateApplied(updateData) {
    // Get the information from the last update
    var info = updateData.updates[updateData.updateIndex];

    // The upgraded version should be identical with the version given by
    // the update and we shouldn't have run a downgrade
    var check = this._vc.compare(info.build_post.version, info.build_pre.version);
    this._controller.assert(function() {
      return check >= 0;
    }, "The version number of the upgraded build is higher or equal.");

    // The build id should be identical with the one from the update
    this._controller.assert(function() {
      return info.build_post.buildid == info.patch.buildid;
    }, "The build id is equal to the build id of the update.");

    // An upgrade should not change the builds locale
    this._controller.assert(function() {
      return info.build_post.locale == info.build_pre.locale;
    }, "The locale of the updated build is identical to the original locale.");
  },

  /**
   * Close the software update dialog
   */
  closeDialog: function softwareUpdate_closeDialog() {
    if (this._controller) {
      this._controller.keypress(null, "VK_ESCAPE", {});
      this._controller.sleep(500);
      this._controller = null;
      this._wizard = null;
    }
  },

  /**
   * Download the update of the given channel and type
   * @param {string} channel
   *        Update channel to use
   * @param {boolean} waitForFinish
   *        Sets if the function should wait until the download has been finished
   * @param {number} timeout
   *        Timeout the download has to stop
   */
  download : function softwareUpdate_download(channel, waitForFinish, timeout) {
    waitForFinish = waitForFinish ? waitForFinish : true;

    // Check that the correct channel has been set
    this._controller.assert(function() {
      return channel == this.channel;
    }, "The current update channel is identical to the specified one.", this);

    // Click the next button
    var next = this.getElement({type: "button", subtype: "next"});
    this._controller.click(next);

    // Wait for the download page - if it fails the update was already cached
    try {
      this.waitForWizardPage(WIZARD_PAGES.downloading);

      if (waitForFinish)
        this.waitforDownloadFinished(timeout);
    } catch (ex) {
      this.waitForWizardPage(WIZARD_PAGES.finished);
    }
  },

  /**
   * Update the update.status file and set the status to 'failed:6'
   */
  forceFallback : function softwareUpdate_forceFallback() {
    var dirService = Cc["@mozilla.org/file/directory_service;1"].
                     getService(Ci.nsIProperties);

    var updateDir;
    var updateStatus;

    // Check the global update folder first
    try {
      updateDir = dirService.get("UpdRootD", Ci.nsIFile);
      updateDir.append("updates");
      updateDir.append("0");

      updateStatus = updateDir.clone();
      updateStatus.append("update.status");
    } catch (ex) {
    }

    if (updateStatus == undefined || !updateStatus.exists()) {
      updateDir = dirService.get("XCurProcD", Ci.nsIFile);
      updateDir.append("updates");
      updateDir.append("0");

      updateStatus = updateDir.clone();
      updateStatus.append("update.status");
    }

    var foStream = Cc["@mozilla.org/network/file-output-stream;1"].
                   createInstance(Ci.nsIFileOutputStream);
    var status = "failed: 6\n";
    foStream.init(updateStatus, 0x02 | 0x08 | 0x20, -1, 0);
    foStream.write(status, status.length);
    foStream.close();
  },

  /**
   * Gets all the needed external DTD urls as an array
   *
   * @returns Array of external DTD urls
   * @type [string]
   */
  getDtds : function softwareUpdate_getDtds() {
    var dtds = ["chrome://mozapps/locale/update/history.dtd",
                "chrome://mozapps/locale/update/updates.dtd"]
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
  getElement : function softwareUpdate_getElement(spec) {
    var elem = null;

    switch(spec.type) {
      /**
       * subtype: subtype to match
       * value: value to match
       */
      case "button":
        elem = new elementslib.Lookup(this._controller.window.document,
                                      WIZARD_BUTTONS_BOX + WIZARD_BUTTON[spec.subtype]);
        break;
      case "wizard":
        elem = new elementslib.Lookup(this._controller.window.document, WIZARD);
        break;
      case "wizard_page":
        elem = new elementslib.Lookup(this._controller.window.document, WIZARD_DECK +
                                      '/id(' + spec.subtype + ')');
        break;
      case "download_progress":
        elem = new elementslib.ID(this._controller.window.document, "downloadProgress");
        break;
      default:
        throw new Error(arguments.callee.name + ": Unknown element type - " + spec.type);
    }

    return elem;
  },

  /**
   * Open software update dialog
   *
   * @param {MozMillController} browserController
   *        Mozmill controller of the browser window
   */
  openDialog: function softwareUpdate_openDialog(browserController) {
    // XXX: After Firefox 4 has been released and we do not have to test any
    // beta release anymore uncomment out the following code

    // With version >= 4.0b7pre the update dialog is reachable from within the
    // about window now.
    var appVersion = utils.appInfo.version;

    if (this._vc.compare(appVersion, "4.0b7pre") >= 0) {
      // XXX: We can't open the about window, otherwise a parallel download of
      // the update will let us fallback to a complete one all the time

      // Open the about window and check the update button
      //var aboutItem = new elementslib.Elem(browserController.menus.helpMenu.aboutName);
      //browserController.click(aboutItem);
      //
      //utils.handleWindow("type", "Browser:About", function(controller) {
      //  // XXX: Bug 599290 - Check for updates has been completely relocated
      //  // into the about window. We can't check the in-about ui yet.
      //  var updateButton = new elementslib.ID(controller.window.document,
      //                                        "checkForUpdatesButton");
      //  //controller.click(updateButton);
      //  controller.waitForElement(updateButton, gTimeout);
      //});

      // For now just call the old ui until we have support for the about window.
      var updatePrompt = Cc["@mozilla.org/updates/update-prompt;1"].
                         createInstance(Ci.nsIUpdatePrompt);
      updatePrompt.checkForUpdates();
    } else {
      // For builds <4.0b7pre
      updateItem = new elementslib.Elem(browserController.menus.helpMenu.checkForUpdates);
      browserController.click(updateItem);
    }

    this.waitForDialogOpen(browserController);
  },

  /**
   * Wait that check for updates has been finished
   * @param {number} timeout
   */
  waitForCheckFinished : function softwareUpdate_waitForCheckFinished(timeout) {
    timeout = timeout ? timeout : gTimeoutUpdateCheck;

    this._controller.waitFor(function() {
      return this.currentPage != WIZARD_PAGES.checking;
    }, "Check for updates has been completed.", timeout, null, this);
  },

  /**
   * Wait for the software update dialog
   *
   * @param {MozMillController} browserController
   *        Mozmill controller of the browser window
   */
  waitForDialogOpen : function softwareUpdate_waitForDialogOpen(browserController) {
    this._controller = utils.handleWindow("type", "Update:Wizard",
                                                   null, true);
    this._wizard = this.getElement({type: "wizard"});

    this._controller.waitFor(function() {
      return this.currentPage != WIZARD_PAGES.dummy;
    }, "Dummy wizard page has been made invisible.", undefined, undefined, this);

    this._controller.window.focus();
  },

  /**
   * Wait until the download has been finished
   *
   * @param {number} timeout
   *        Timeout the download has to stop
   */
  waitforDownloadFinished: function softwareUpdate_waitForDownloadFinished(timeout) {
    timeout = timeout ? timeout : gTimeoutUpdateDownload;

    var progress =  this.getElement({type: "download_progress"});
    this._controller.waitFor(function() {
      return progress.getNode().value == 100;
    }, "Update has been finished downloading.", timeout);

    this.waitForWizardPage(WIZARD_PAGES.finished);
  },

  /**
   * Waits for the given page of the update dialog wizard
   */
  waitForWizardPage : function softwareUpdate_waitForWizardPage(step) {
    this._controller.waitFor(function() {
      return this.currentPage == step;
    }, "The wizard page '" + step + "' has been selected.", undefined, undefined, this);
  }
}

// Export of variables
exports.WIZARD_PAGES = WIZARD_PAGES;

// Export of classes
exports.softwareUpdate = softwareUpdate;
