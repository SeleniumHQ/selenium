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
var screenshot = require("screenshot");
var utils = require("utils");

const jumlib = {};
Components.utils.import("resource://mozmill/modules/jum.js", jumlib);

/**
 * Callback function for parsing the results of testing for duplicated
 * access keys.
 *
 * This function processes the access keys found in one access keys scope
 * looking for access keys that are listed more than one time.
 * At the end, it calls the screenshot.create to create a screenshot with the
 * elements containing the broken access keys highlighted.
 *
 * @param {array of array of object} accessKeysSet
 * @param {MozmillController} controller
 */
function checkAccessKeysResults(controller, accessKeysSet) {
  // Sort the access keys to have them in a A->Z order
  var accessKeysList = accessKeysSet.sort();

  // List of access keys
  var aKeysList = [];

  // List of values to identify the access keys
  var valueList = [];

  // List of rectangles of nodes containing access keys
  var rects = [];

  // List of rectangles of nodes with broken access keys
  var badRects = [];

  // Makes lists of all access keys and the values the access keys are in
  for (var i = 0; i < accessKeysList.length; i++) {
    var accessKey = accessKeysList[i][0];
    var node = accessKeysList[i][1];

    // Set the id and label to be shown in the console
    var id = node.id || "(id is undefined)";
    var label = node.label || "(label is undefined)";

    var box = node.boxObject;

    var innerIds = [];
    var innerRects = [];

    // if the access key is already in our list, take it out to replace it
    // later
    if (accessKey == aKeysList[aKeysList.length-1]) {
      innerIds = valueList.pop();
      innerRects = rects.pop();
    } else {
      aKeysList.push([accessKey]);
    }
    innerIds.push("[id: " + id + ", label: " + label + "]");
    valueList.push(innerIds);
    innerRects.push([box.x, box.y, box.width, box.height]);
    rects.push(innerRects);
  }

  // Go through all access keys and find the duplicated ones
  for (var i = 0; i < valueList.length; i++) {
    // Only access keys contained in more than one node are the ones we are
    // looking for
    if (valueList[i].length > 1) {
      for (var j = 0; j < rects[i].length; j++) {
        badRects.push(rects[i][j]);
      }
      jumlib.assert(false, 'accessKey: ' + aKeysList[i] +
                    ' found in string\'s: ' + valueList[i].join(", "));
    }
  }

  // If we have found broken access keys, make a screenshot
  if (badRects.length > 0) {
    screenshot.create(controller, badRects);
  }
}

/**
 * Callback function for testing for cropped elements.
 *
 * Checks if the XUL boxObject has screen coordinates outside of
 * the screen coordinates of its parent. If there's no parent, return.
 *
 * @param {node} child
 * @returns List of boxes that can be highlighted on a screenshot
 * @type {array of array of int}
 */
function checkDimensions(child) {
  if (!child.boxObject)
    return [];
  var childBox = child.boxObject;
  var parent = childBox.parentBox;

  // toplevel element or hidden elements, like script tags
  if (!parent || parent == child.element || !parent.boxObject) {
    return [];
  }
  var parentBox = parent.boxObject;

  var badRects = [];

  // check width
  if (childBox.height && childBox.screenX < parentBox.screenX) {
    badRects.push([childBox.x, childBox.y, parentBox.x - childBox.x,
                   childBox.height]);
    jumlib.assert(false, 'Node is cut off at the left: ' +
                  _reportNode(child) + '. Parent node: ' + _reportNode(parent));
  }
  if (childBox.height && childBox.screenX + childBox.width >
      parentBox.screenX + parentBox.width) {
    badRects.push([parentBox.x + parentBox.width, childBox.y,
                   childBox.x + childBox.width - parentBox.x - parentBox.width,
                   childBox.height]);
    jumlib.assert(false, 'Node is cut off at the right: ' +
                  _reportNode(child) + '. Parent node: ' + _reportNode(parent));
  }

  // check height
  // We don't want to test menupopup's, as they always report the full height
  // of all items in the popup
  if (child.nodeName != 'menupopup' && parent.nodeName != 'menupopup') {
    if (childBox.width && childBox.screenY < parentBox.screenY) {
      badRects.push([childBox.x, childBox.y, parentBox.y - childBox.y,
                     childBox.width]);
      jumlib.assert(false, 'Node is cut off at the top: ' +
                    _reportNode(child) + '. Parent node: ' + _reportNode(parent));
    }
    if (childBox.width && childBox.screenY + childBox.height >
        parentBox.screenY + parentBox.height) {
      badRects.push([childBox.x, parentBox.y + parentBox.height,
                     childBox.width,
                     childBox.y + childBox.height - parentBox.y - parentBox.height]);
      jumlib.assert(false, 'Node is cut off at the bottom: ' +
                    _reportNode(child) + '. Parent node: ' + _reportNode(parent));
    }
  }

  return badRects;
}

/**
 * Filters out nodes which should not be tested because they are not in the
 * current access key scope.
 *
 * @param {node} node
 * @returns Filter status of the given node
 * @type {array of array of int}
 */
function filterAccessKeys(node) {
  // Menus will need a separate filter set
  var notAllowedLocalNames = ["menu", "menubar", "menupopup", "popupset"];

  if (!node.disabled && !node.collapsed && !node.hidden &&
      notAllowedLocalNames.indexOf(node.localName) == -1) {
    // Code specific to the preferences panes to reject out not visible nodes
    // in the panes.
    if (node.parentNode && (node.parentNode.localName == "prefwindow" &&
                            node.parentNode.currentPane.id != node.id) ||
        ((node.parentNode.localName == "tabpanels" ||
          node.parentNode.localName == "deck") &&
          node.parentNode.selectedPanel.id != node.id)) {
      return domUtils.DOMWalker.FILTER_REJECT;
      // end of the specific code
    } else if (node.accessKey) {
      return domUtils.DOMWalker.FILTER_ACCEPT;
    } else {
      return domUtils.DOMWalker.FILTER_SKIP;
    }
  } else {
    // we don't want to test not visible elements
    return domUtils.DOMWalker.FILTER_REJECT;
  }
}

/**
 * Filters out nodes which should not be tested because they are not visible
 *
 * @param {node} node
 * @returns Filter status of the given node
 * @type {array of array of int}
 */
function filterCroppedNodes(node) {
  if (!node.boxObject) {
    return domUtils.DOMWalker.FILTER_SKIP;
  } else {
    if (!node.disabled && !node.collapsed && !node.hidden) {
      // Code specific to the preferences panes to reject out not visible nodes
      // in the panes.
      if (node.parentNode && (node.parentNode.localName == "prefwindow" &&
                              node.parentNode.currentPane.id != node.id) ||
          ((node.parentNode.localName == "tabpanels" ||
            node.parentNode.localName == "deck") &&
           node.parentNode.selectedPanel.id != node.id)) {
        return domUtils.DOMWalker.FILTER_REJECT;
        // end of the specific code
      } else {
        return domUtils.DOMWalker.FILTER_ACCEPT;
      }
    } else {
      // we don't want to test not visible elements
      return domUtils.DOMWalker.FILTER_REJECT;
    }
  }
}

/**
 * Callback function for testing access keys. To be used with the DOMWalker.
 *
 * It packs a submitted node and its access key into a double array
 *
 * @param {node} node Node containing the access key
 * @returns lower-cased access key and its node in a nested array
 * @type {array of array}
 */
function prepareAccessKey(node) {
  return [[node.accessKey.toLowerCase(), node]];
}

/**
 * Callback function for parsing the results of testing for cropped elements.
 *
 * This function calls the screenshot.create method if there is at least one
 * box.
 *
 * @param {array of array of int} boxes
 * @param {MozmillController} controller
 */
function processDimensionsResults(controller, boxes) {
  if (boxes && boxes.length > 0) {
    screenshot.create(controller, boxes);
  }
}

/**
 * Tries to return a useful string identificator of the given node
 *
 * @param {node} node
 * @returns Identificator of the node
 * @type {String}
 */
function _reportNode(node) {
  if (node.id) {
    return "id: " + node.id;
  } else if (node.label) {
    return "label: " + node.label;
  } else if (node.value) {
    return "value: " + node.value;
  } else if (node.hasAttributes()) {
    var attrs = "node attributes: ";
    for (var i = node.attributes.length - 1; i >= 0; i--) {
      attrs += node.attributes[i].name + "->" + node.attributes[i].value + ";";
    }
    return attrs;
  } else {
    return "anonymous node";
  }
}

// Export of functions
exports.checkAccessKeysResults = checkAccessKeysResults;
exports.checkDimensions = checkDimensions;
exports.filterAccessKeys = filterAccessKeys;
exports.filterCroppedNodes = filterCroppedNodes;
exports.prepareAccessKey = prepareAccessKey;
exports.processDimensionsResults = processDimensionsResults;
