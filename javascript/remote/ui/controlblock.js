// Copyright 2011 WebDriver committers
// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('remote.ui.createControlBlock');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');


/**
 * Utility for creating a DIV.control-block with a string of children separated
 * by a common text separator.
 * @param {!goog.dom.DomHelper} domHelper DOM helper to use.
 * @param {...Element} var_args Elements to insert into the block.
 * @return {!Element} The new block.
 */
remote.ui.createControlBlock = function(domHelper, var_args) {
  var div = domHelper.createDom(goog.dom.TagName.DIV, 'control-block');
  var elements = goog.array.slice(arguments, 1);
  goog.array.forEach(elements, function(element, i) {
    goog.dom.appendChild(div, element);
    if (i + 1 < elements.length) {
      goog.dom.appendChild(div, domHelper.createTextNode('\xa0\xa0|\xa0\xa0'));
    }
  });
  return div;
};
