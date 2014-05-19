// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Object to store the offset from one node to another in a way
 * that works on any similar DOM structure regardless of whether it is the same
 * actual nodes.
 *
 */

goog.provide('goog.dom.NodeOffset');

goog.require('goog.Disposable');
goog.require('goog.dom.TagName');



/**
 * Object to store the offset from one node to another in a way that works on
 * any similar DOM structure regardless of whether it is the same actual nodes.
 * @param {Node} node The node to get the offset for.
 * @param {Node} baseNode The node to calculate the offset from.
 * @extends {goog.Disposable}
 * @constructor
 * @final
 */
goog.dom.NodeOffset = function(node, baseNode) {
  goog.Disposable.call(this);

  /**
   * A stack of childNode offsets.
   * @type {Array.<number>}
   * @private
   */
  this.offsetStack_ = [];

  /**
   * A stack of childNode names.
   * @type {Array.<string>}
   * @private
   */
  this.nameStack_ = [];

  while (node && node.nodeName != goog.dom.TagName.BODY && node != baseNode) {
    // Compute the sibling offset.
    var siblingOffset = 0;
    var sib = node.previousSibling;
    while (sib) {
      sib = sib.previousSibling;
      ++siblingOffset;
    }
    this.offsetStack_.unshift(siblingOffset);
    this.nameStack_.unshift(node.nodeName);

    node = node.parentNode;
  }
};
goog.inherits(goog.dom.NodeOffset, goog.Disposable);


/**
 * @return {string} A string representation of this object.
 * @override
 */
goog.dom.NodeOffset.prototype.toString = function() {
  var strs = [];
  var name;
  for (var i = 0; name = this.nameStack_[i]; i++) {
    strs.push(this.offsetStack_[i] + ',' + name);
  }
  return strs.join('\n');
};


/**
 * Walk the dom and find the node relative to baseNode.  Returns null on
 * failure.
 * @param {Node} baseNode The node to start walking from.  Should be equivalent
 *     to the node passed in to the constructor, in that it should have the
 *     same contents.
 * @return {Node} The node relative to baseNode, or null on failure.
 */
goog.dom.NodeOffset.prototype.findTargetNode = function(baseNode) {
  var name;
  var curNode = baseNode;
  for (var i = 0; name = this.nameStack_[i]; ++i) {
    curNode = curNode.childNodes[this.offsetStack_[i]];

    // Sanity check and make sure the element names match.
    if (!curNode || curNode.nodeName != name) {
      return null;
    }
  }
  return curNode;
};


/** @override */
goog.dom.NodeOffset.prototype.disposeInternal = function() {
  delete this.offsetStack_;
  delete this.nameStack_;
};
