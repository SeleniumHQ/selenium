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
 *   Anthony Hughes <anthony.s.hughes@gmail.com>
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
 * The DownloadsAPI adds support for download related functions. It also gives
 * access to the Download Manager.
 *
 * @version 1.0.1
 */

// Include required modules
var utils = require("utils");

const gTimeout = 5000;

/**
 * List of available download states
 */
const downloadState = {
  notStarted      : -1,
  downloading     : 0,
  finished        : 1,
  failed          : 2,
  canceled        : 3,
  paused          : 4,
  queued          : 5,
  blockedParental : 6,
  scanning        : 7,
  dirty           : 8,
  blockedPolicy   : 9
}

/**
 * Constructor
 */
function downloadManager() {
  this._controller = null;
  this.downloadState = downloadState;

  this._dms = Cc["@mozilla.org/download-manager;1"].
              getService(Ci.nsIDownloadManager);
}

/**
 * Download Manager class
 */
downloadManager.prototype = {
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
   * Returns the number of currently active downloads
   *
   * @returns Number of active downloads
   * @type {number}
   */
  get activeDownloadCount() {
    return this._dms.activeDownloadCount;
  },

  /**
   * Cancel all active downloads
   */
  cancelActiveDownloads : function downloadManager_cancelActiveDownloads() {
    // Get a list of all active downloads (nsISimpleEnumerator)
    var downloads = this._dms.activeDownloads;
    
    // Iterate through each active download and cancel it
    while (downloads.hasMoreElements()) {
      var download = downloads.getNext().QueryInterface(Ci.nsIDownload);
      this._dms.cancelDownload(download.id);
    }
  },

  /**
   * Remove all downloads from the database
   */
  cleanUp : function downloadManager_cleanUp()
  {
    this._dms.cleanUp();
  },

  /**
   * Cancel any active downloads, remove the files, and clean
   * up the Download Manager database
   *
   * @param {Array of download} downloads
   *        Downloaded files which should be deleted (optional)
   */
  cleanAll : function downloadManager_cleanAll(downloads) {
    // Cancel any active downloads
    this.cancelActiveDownloads();

    // If no downloads have been specified retrieve the list from the database
    if (downloads === undefined || downloads.length == 0)
      downloads = this.getAllDownloads();
    else
      downloads = downloads.concat(this.getAllDownloads());

    // Delete all files referred to in the Download Manager
    this.deleteDownloadedFiles(downloads);

    // Clean any entries from the Download Manager database
    this.cleanUp();
  },

  /**
   * Close the download manager
   *
   * @param {boolean} force
   *        Force the closing of the DM window
   */
  close : function downloadManager_close(force) {
    var windowCount = mozmill.utils.getWindows().length;

    if (this._controller) {
      // Check if we should force the closing of the DM window
      if (force) {
        this._controller.window.close();
      } else {
        var cmdKey = utils.getEntity(this.getDtds(), "cmd.close.commandKey");
        this._controller.keypress(null, cmdKey, {accelKey: true});
      }

      this._controller.waitForEval("subject.getWindows().length == " + (windowCount - 1),
                                   gTimeout, 100, mozmill.utils);
      this._controller = null;
    }
  },

  /**
   * Delete all downloads from the local drive
   *
   * @param {download} downloads
   *        List of downloaded files
   */
  deleteDownloadedFiles : function downloadManager_deleteDownloadedFiles(downloads) {
    downloads.forEach(function(download) {
      try {
        var file = getLocalFileFromNativePathOrUrl(download.target);
        file.remove(false);
      } catch (ex) {
      }
    });
  },

  /**
   * Get the list of all downloaded files in the database
   *
   * @returns List of downloads
   * @type {Array of download}
   */
  getAllDownloads : function downloadManager_getAllDownloads() {
    var dbConn = this._dms.DBConnection;
    var stmt = null;

    if (dbConn.schemaVersion < 3)
      return new Array();

    // Run a SQL query and iterate through all results which have been found
    var downloads = [];
    stmt = dbConn.createStatement("SELECT * FROM moz_downloads");
    while (stmt.executeStep()) {
      downloads.push({
        id: stmt.row.id, name: stmt.row.name, target: stmt.row.target,
        tempPath: stmt.row.tempPath, startTime: stmt.row.startTime,
        endTime: stmt.row.endTime, state: stmt.row.state,
        referrer: stmt.row.referrer, entityID: stmt.row.entityID,
        currBytes: stmt.row.currBytes, maxBytes: stmt.row.maxBytes,
        mimeType : stmt.row.mimeType, autoResume: stmt.row.autoResume,
        preferredApplication: stmt.row.preferredApplication,
        preferredAction: stmt.row.preferredAction
      });
    };
    stmt.reset();

    return downloads;
  },

  /**
   * Gets the download state of the given download
   *
   * @param {ElemBase} download
   *        Download which state should be checked
   */
  getDownloadState : function downloadManager_getDownloadState(download) {
    return download.getNode().getAttribute('state');
  },

  /**
   * Gets all the needed external DTD urls as an array
   *
   * @returns Array of external DTD urls
   * @type [string]
   */
  getDtds : function downloadManager_getDtds() {
    var dtds = ["chrome://browser/locale/browser.dtd",
                "chrome://mozapps/locale/downloads/downloads.dtd"];
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
  getElement : function downloadManager_getElement(spec) {
    var elem = null;

    switch(spec.type) {
      /**
       * subtype: subtype of property to match
       * value: value of property to match
       */
      case "download":
        // Use a temporary lookup to get the download item
        var download = new elementslib.Lookup(this._controller.window.document,
                                              '/id("downloadManager")/id("downloadView")/' +
                                              '{"' + spec.subtype + '":"' + spec.value + '"}');
        this._controller.waitForElement(download, gTimeout);

        // Use its download id to construct the real lookup expression
        elem = new elementslib.Lookup(this._controller.window.document,
                                      '/id("downloadManager")/id("downloadView")/' +
                                      'id("' + download.getNode().getAttribute('id') + '")');
        break;

      /**
       * subtype: Identifier of the specified download button (cancel, pause, resume, retry)
       * value: Entry (download) of the download list
       */
      case "download_button":
        // XXX: Bug 555347 - There are outstanding events to process
        this._controller.sleep(0);

        elem = new elementslib.Lookup(this._controller.window.document, spec.value.expression +
                                      '/anon({"flex":"1"})/[1]/[1]/{"cmd":"cmd_' + spec.subtype + '"}');
        break;
      default:
        throw new Error(arguments.callee.name + ": Unknown element type - " + spec.type);
    }

    return elem;
  },

  /**
   * Open the Download Manager
   *
   * @param {MozMillController} controller
   *        MozMillController of the window to operate on
   * @param {boolean} shortcut
   *        If true the keyboard shortcut is used
   */
  open : function downloadManager_open(controller, shortcut) {
    if (shortcut) {
      if (mozmill.isLinux) {
        var cmdKey = utils.getEntity(this.getDtds(), "downloadsUnix.commandkey");
        controller.keypress(null, cmdKey, {ctrlKey: true, shiftKey: true});
      } else {
        var cmdKey = utils.getEntity(this.getDtds(), "downloads.commandkey");
        controller.keypress(null, cmdKey, {accelKey: true});
      }
    } else {
      controller.click(new elementslib.Elem(controller.menus["tools-menu"].menu_openDownloads));
    }

    controller.sleep(500);
    this.waitForOpened(controller);
  },

  /**
   * Wait for the given download state
   *
   * @param {MozMillController} controller
   *        MozMillController of the window to operate on
   * @param {downloadState} state
   *        Expected state of the download
   * @param {number} timeout
   *        Timeout for waiting for the download state (optional)
   */
  waitForDownloadState : function downloadManager_waitForDownloadState(download, state, timeout) {
    this._controller.waitForEval("subject.manager.getDownloadState(subject.download) == subject.state", timeout, 100,
                                 {manager: this, download: download, state: state});
  },

  /**
   * Wait until the Download Manager has been opened
   *
   * @param {MozMillController} controller
   *        MozMillController of the window to operate on
   */
  waitForOpened : function downloadManager_waitForOpened(controller) {
    this._controller = utils.handleWindow("type", "Download:Manager",
                                                   null, true);
  }
};

/**
 * Download the file of unkown type from the given location by saving it
 * automatically to disk
 *
 * @param {MozMillController} controller
 *        MozMillController of the browser window
 * @param {string} url
 *        URL of the file which has to be downloaded
 */
var downloadFileOfUnknownType = function(controller, url) {
  controller.open(url);

  // Wait until the unknown content type dialog has been opened
  controller.waitForEval("subject.getMostRecentWindow('').document.documentElement.id == 'unknownContentType'",
                         gTimeout, 100, mozmill.wm);

  utils.handleWindow("type", "", function (controller) {
    // Select to save the file directly
    var saveFile = new elementslib.ID(controller.window.document, "save");
    controller.waitThenClick(saveFile, gTimeout);
    controller.waitForEval("subject.selected == true", gTimeout, 100,
                           saveFile.getNode());
  
    // Wait until the OK button has been enabled and click on it
    var button = new elementslib.Lookup(controller.window.document,
                                        '/id("unknownContentType")/anon({"anonid":"buttons"})/{"dlgtype":"accept"}');
    controller.waitForElement(button, gTimeout);
    controller.waitForEval("subject.okButton.hasAttribute('disabled') == false", gTimeout, 100,
                           {okButton: button.getNode()});
    controller.click(button);
  });
}

/**
 * Get a local file from a native path or URL
 *
 * @param {string} aPathOrUrl
 *        Native path or URL of the file
 * @see http://mxr.mozilla.org/mozilla-central/source/toolkit/mozapps/downloads/content/downloads.js#1309
 */
function getLocalFileFromNativePathOrUrl(aPathOrUrl) {
  if (aPathOrUrl.substring(0,7) == "file://") {
    // if this is a URL, get the file from that
    let ioSvc = Cc["@mozilla.org/network/io-service;1"]
                   .getService(Ci.nsIIOService);

    // XXX it's possible that using a null char-set here is bad
    const fileUrl = ioSvc.newURI(aPathOrUrl, null, null)
                         .QueryInterface(Ci.nsIFileURL);
    return fileUrl.file.clone().QueryInterface(Ci.nsILocalFile);
  } else {
    // if it's a pathname, create the nsILocalFile directly
    var f = new nsLocalFile(aPathOrUrl);
    return f;
  }
}

// Export of variables
exports.downloadState = downloadState;

// Export of functions
exports.downloadFileOfUnknownType = downloadFileOfUnknownType;
exports.getLocalFileFromNativePathOrUrl = getLocalFileFromNativePathOrUrl;

// Export of classes
exports.downloadManager = downloadManager;
