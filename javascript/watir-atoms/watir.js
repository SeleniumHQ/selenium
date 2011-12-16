// Copyright 2011 Software Freedom Conservancy
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('watir');

goog.require('goog.dom.Range');
goog.require('goog.iter');
goog.require('goog.array');

watir.selectText = function(element, string) {
  var range = new goog.dom.Range.createFromNodeContents(element);

  var match = goog.array.find(goog.iter.toArray(range), function(e) {
    return e.nodeType == goog.dom.NodeType.TEXT &&
      (e.data.indexOf(string) != -1);
  });

  if(!match) {
    throw "could not find text node matching: " + string;
  }

  var startOffset = match.data.indexOf(string);
  var endOffset = startOffset + string.length;

  goog.dom.Range.createFromNodes(
    match, startOffset,
    match, endOffset
  ).select();
}
