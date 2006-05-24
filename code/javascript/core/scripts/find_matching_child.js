/*
 * Copyright 2004 ThoughtWorks, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

Element.findMatchingChildren = function(element, selector) {
  var matches = $A([]);

  var childCount = element.childNodes.length;
  for (var i=0; i<childCount; i++) {
    var child = element.childNodes[i];
    if (selector(child)) {
      matches.push(child);
    } else {
      childMatches = Element.findMatchingChildren(child, selector);
      matches.push(childMatches);
    }
  }

  return matches.flatten();
}

ELEMENT_NODE_TYPE = 1;

Element.findFirstMatchingChild = function(element, selector) {

  var childCount = element.childNodes.length;
  for (var i=0; i<childCount; i++) {
    var child = element.childNodes[i];
    if (child.nodeType == ELEMENT_NODE_TYPE) {
      if (selector(child)) {
        return child;
      }
      result = Element.findFirstMatchingChild(child, selector);
      if (result) {
        return result;
      }
    }
  }
  return null;
}

Element.findFirstMatchingParent = function(element, selector) {
  var current = element.parentNode;
  while (current != null) {
    if (selector(current)) {
      break;
    }
    current = current.parentNode;
  }
  return current;
}

Element.findMatchingChildById = function(element, id) {
  return Element.findFirstMatchingChild(element, function(element){return element.id==id} );
}

