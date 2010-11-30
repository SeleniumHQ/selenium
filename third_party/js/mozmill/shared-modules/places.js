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
 *   Geo Mealer <gmealer@mozilla.com>
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
 * The ModalDialogAPI adds support for handling modal dialogs. It
 * has to be used e.g. for alert boxes and other commonDialog instances.
 *
 * @version 1.0.2
 */

// Include required modules
var utils = require("utils");

const gTimeout = 5000;

// Default bookmarks.html file lives in omni.jar, get via resource URI
const BOOKMARKS_RESOURCE = "resource:///defaults/profile/bookmarks.html";

// Bookmarks can take up to ten seconds to restore
const BOOKMARKS_TIMEOUT = 10000;

// Observer topics we need to watch to know whether we're finished
const TOPIC_BOOKMARKS_RESTORE_SUCCESS = "bookmarks-restore-success";

/**
 * Instance of the bookmark service to gain access to the bookmark API.
 *
 * @see http://mxr.mozilla.org/mozilla-central (nsINavBookmarksService.idl)
 */
var bookmarksService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].
                       getService(Ci.nsINavBookmarksService);

/**
 * Instance of the history service to gain access to the history API.
 *
 * @see http://mxr.mozilla.org/mozilla-central (nsINavHistoryService.idl)
 */
var historyService = Cc["@mozilla.org/browser/nav-history-service;1"].
                     getService(Ci.nsINavHistoryService);

/**
 * Instance of the livemark service to gain access to the livemark API
 *
 * @see http://mxr.mozilla.org/mozilla-central (nsILivemarkService.idl)
 */
var livemarkService = Cc["@mozilla.org/browser/livemark-service;2"].
                      getService(Ci.nsILivemarkService);

/**
 * Instance of the browser history interface to gain access to
 * browser-specific history API
 *
 * @see http://mxr.mozilla.org/mozilla-central (nsIBrowserHistory.idl)
 */
var browserHistory = Cc["@mozilla.org/browser/nav-history-service;1"].
                     getService(Ci.nsIBrowserHistory);

/**
 * Instance of the observer service to gain access to the observer API
 *
 * @see http://mxr.mozilla.org/mozilla-central (nsIObserverService.idl)
 */
var observerService = Cc["@mozilla.org/observer-service;1"].
                      getService(Ci.nsIObserverService);

/**
 * Check if an URI is bookmarked within the specified folder
 *
 * @param (nsIURI) uri
 *        URI of the bookmark
 * @param {String} folderId
 *        Folder in which the search has to take place
 * @return Returns if the URI exists in the given folder
 * @type Boolean
 */
function isBookmarkInFolder(uri, folderId)
{
  var ids = bookmarksService.getBookmarkIdsForURI(uri, {});
  for (let i = 0; i < ids.length; i++) {
    if (bookmarksService.getFolderIdForItem(ids[i]) == folderId)
      return true;
  }

  return false;
}

/**
 * Restore the default bookmarks for the current profile
 */
function restoreDefaultBookmarks() {
  // Set up the observer -- we're only checking for success here, so we'll simply
  // time out and throw on failure. It makes the code much clearer than handling
  // finished state and success state separately.
  var importSuccessful = false;
  var importObserver = {
    observe: function (aSubject, aTopic, aData) {
      if (aTopic == TOPIC_BOOKMARKS_RESTORE_SUCCESS) {
        importSuccessful = true;
      }
    }
  }
  observerService.addObserver(importObserver, TOPIC_BOOKMARKS_RESTORE_SUCCESS, false);

  try {
    // Fire off the import
    var bookmarksURI = utils.createURI(BOOKMARKS_RESOURCE);
    var importer = Cc["@mozilla.org/browser/places/import-export-service;1"].
                   getService(Ci.nsIPlacesImportExportService);
    importer.importHTMLFromURI(bookmarksURI, true);

    // Wait for it to be finished--the observer above will flip this flag
    mozmill.utils.waitFor(function () {
      return importSuccessful;
    }, "Default bookmarks have finished importing", BOOKMARKS_TIMEOUT);
  }
  finally {
    // Whatever happens, remove the observer afterwards
    observerService.removeObserver(importObserver, TOPIC_BOOKMARKS_RESTORE_SUCCESS);
  }
}

/**
 * Synchronous wrapper around browserHistory.removeAllPages()
 * Removes history and blocks until done
 */
function removeAllHistory() {
  const TOPIC_EXPIRATION_FINISHED = "places-expiration-finished";

  // Create flag visible to both the eval and the observer object
  var finishedFlag = {
    state: false
  }

  // Set up an observer so we get notified when remove completes
  let observer = {
    observe: function(aSubject, aTopic, aData) {
      observerService.removeObserver(this, TOPIC_EXPIRATION_FINISHED);    
      finishedFlag.state = true;
    }
  }
  observerService.addObserver(observer, TOPIC_EXPIRATION_FINISHED, false);

  // Remove the pages, then block until we're done or until timeout is reached
  browserHistory.removeAllPages();
  mozmill.controller.waitForEval("subject.state == true", gTimeout, 100, finishedFlag);
}

// Export of variables
exports.bookmarksService = bookmarksService;
exports.historyService = historyService;
exports.livemarkService = livemarkService;
exports.browserHistory = browserHistory;

// Export of functions
exports.isBookmarkInFolder = isBookmarkInFolder;
exports.restoreDefaultBookmarks = restoreDefaultBookmarks;
exports.removeAllHistory = removeAllHistory;
