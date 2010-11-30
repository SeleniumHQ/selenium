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
 * The WidgetsAPI adds support for handling objects like trees.
 */

var EventUtils = {};
Components.utils.import('resource://mozmill/stdlib/EventUtils.js', EventUtils);

const gTimeout = 5000;

/**
 * Click the specified tree cell
 *
 * @param {MozMillController} controller
 *        MozMillController of the browser window to operate on
 * @param {tree} tree
 *        Tree to operate on
 * @param {number } rowIndex
 *        Index of the row
 * @param {number} columnIndex
 *        Index of the column
 * @param {object} eventDetails
 *        Details about the mouse event
 */
function clickTreeCell(controller, tree, rowIndex, columnIndex, eventDetails)
{
  tree = tree.getNode();

  var selection = tree.view.selection;
  selection.select(rowIndex);
  tree.treeBoxObject.ensureRowIsVisible(rowIndex);

  // get cell coordinates
  var x = {}, y = {}, width = {}, height = {};
  var column = tree.columns[columnIndex];
  tree.treeBoxObject.getCoordsForCellItem(rowIndex, column, "text",
                                           x, y, width, height);

  controller.sleep(0);
  EventUtils.synthesizeMouse(tree.body, x.value + 4, y.value + 4,
                             eventDetails, tree.ownerDocument.defaultView);
  controller.sleep(0);
}

// Export of functions
exports.clickTreeCell = clickTreeCell;
