/*
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//a shorthand writting
const Ci = Components.interfaces;
const Cc = Components.classes;


/**
 * Object used to observe DnD on the suiteTree
 */
var suiteTreeDragObserver = {

    onDragStart: function (e) {
    var selectedIndex = document.getElementById('suiteTree').currentIndex;
    if (selectedIndex == -1)
      return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/unicode', selectedIndex);
  },

  onDragOver: function (e) {
    // e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
};



/**
 * Object used to observe dnd on the commands of the current testcase
 */
var commandsDragObserver = {

    onDragStart: function (e) {
    var selectedIndex = document.getElementById('commands').currentIndex;
    if (selectedIndex == -1)
      return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/unicode', selectedIndex);
  },

  onDragOver: function (e) {
    // e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
};