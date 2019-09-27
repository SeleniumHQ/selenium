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
 * The Initial Developer of the Original Code is the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Adrian Kalla <akalla@aviary.pl>
 *   Axel Hecht <axel@pike.org>
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

// Include the required modules
var utils = require("utils");

/**
 * This function creates a screenshot of the window provided in the given
 * controller and highlights elements from the coordinates provided in the
 * given boxes-array.
 *
 * @param {array of array of int} boxes
 * @param {MozmillController} controller
 */
function create(controller, boxes) {
  var doc = controller.window.document;
  var maxWidth = doc.documentElement.boxObject.width;
  var maxHeight = doc.documentElement.boxObject.height;
  var rect = [];
  for (var i = 0, j = boxes.length; i < j; ++i) {
    rect = boxes[i];
    if (rect[0] + rect[2] > maxWidth) maxWidth = rect[0] + rect[2];
    if (rect[1] + rect[3] > maxHeight) maxHeight = rect[1] + rect[3];
  }
  var canvas = doc.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
  var width = doc.documentElement.boxObject.width;
  var height = doc.documentElement.boxObject.height;
  canvas.width = maxWidth;
  canvas.height = maxHeight;
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0,0, canvas.width, canvas.height);
  ctx.save();
  ctx.drawWindow(controller.window, 0, 0, width, height, "rgb(0,0,0)");
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "rgba(255,0,0,0.4)";
  for (var i = 0, j = boxes.length; i < j; ++i) {
    rect = boxes[i];
    ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);
  }
  ctx.restore();

  _saveCanvas(canvas);
}

/**
 * Saves a given Canvas object to a file.
 * The path to save the file under should be given on the command line. If not,
 * it will be saved in the temporary folder of the system.
 *
 * @param {canvas} canvas
 */
function _saveCanvas(canvas) {
  // Use the path given on the command line and saved under
  // persisted.screenshotPath, if available. If not, use the path to the
  // temporary folder as a fallback.
  var file = null;
  if ("screenshotPath" in persisted) {
    file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    file.initWithPath(persisted.screenshotPath);
  }
  else {
    file = Cc["@mozilla.org/file/directory_service;1"].
           getService(Ci.nsIProperties).
           get("TmpD", Ci.nsIFile);
  }

  var fileName = utils.appInfo.name + "-" +
                 utils.appInfo.locale + "." +
                 utils.appInfo.version + "." +
                 utils.appInfo.buildID + "." +
                 utils.appInfo.os + ".png";
  file.append(fileName);

  // if a file already exists, don't overwrite it and create a new name
  file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, parseInt("0666", 8));

  // create a data url from the canvas and then create URIs of the source
  // and targets
  var io = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
  var source = io.newURI(canvas.toDataURL("image/png", ""), "UTF8", null);
  var target = io.newFileURI(file)

  // prepare to save the canvas data
  var wbPersist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].
                  createInstance(Ci.nsIWebBrowserPersist);

  wbPersist.persistFlags = Ci.nsIWebBrowserPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
  wbPersist.persistFlags |= Ci.nsIWebBrowserPersist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;

  // save the canvas data to the file
  wbPersist.saveURI(source, null, null, null, null, file);
}

// Export of functions
exports.create = create;
