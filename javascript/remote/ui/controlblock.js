// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

goog.provide('remote.ui.ControlBlock');
goog.provide('remote.ui.createControlBlock');
goog.provide('remote.ui.updateControlBlock');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.ui.Component');



/**
 * Organizes a horizontal collection of elements.
 * @constructor
 * @extends {goog.ui.Component}
 */
remote.ui.ControlBlock = function() {
  goog.base(this);
};
goog.inherits(remote.ui.ControlBlock, goog.ui.Component);


/**
 * @private {string}
 * @const
 */
remote.ui.ControlBlock.SEPARATOR_TEXT_ = '\xa0\xa0|\xa0\xa0';


/** @private {Array.<!Element>} */
remote.ui.ControlBlock.prototype.elementsToAdd_ = null;


/** @override */
remote.ui.ControlBlock.prototype.disposeInternal = function() {
  delete this.elementsToAdd_;

  goog.base(this, 'disposeInternal');
};


/** @override */
remote.ui.ControlBlock.prototype.createDom = function() {
  var dom = this.getDomHelper();
  var div = dom.createDom(goog.dom.TagName.DIV, 'control-block');
  this.setElementInternal(div);

  if (this.elementsToAdd_) {
    goog.array.forEach(this.elementsToAdd_, this.addElement, this);
    this.elementsToAdd_ = null;
  }
};


/** @param {!Element} element The element to add. */
remote.ui.ControlBlock.prototype.addElement = function(element) {
  var parent = this.getElement();
  if (!parent) {
    if (!this.elementsToAdd_) {
      this.elementsToAdd_ = [];
    }
    this.elementsToAdd_.push(element);
    return;
  }

  if (parent.childNodes.length) {
    goog.dom.appendChild(parent, this.getDomHelper().createTextNode(
        remote.ui.ControlBlock.SEPARATOR_TEXT_));
  }
  goog.dom.appendChild(parent, element);
};


/**
 * Utility for creating a DIV.control-block with a string of children separated
 * by a common text separator.
 * @param {!goog.dom.DomHelper} domHelper DOM helper to use.
 * @param {...Element} var_args Elements to insert into the block.
 * @return {!Element} The new block.
 */
remote.ui.createControlBlock = function(domHelper, var_args) {
  var div = domHelper.createDom(goog.dom.TagName.DIV, 'control-block');
  var args = goog.array.slice(arguments, 0);
  goog.array.splice(args, 0, 0, div);
  remote.ui.updateControlBlock.apply(null, args);
  return div;
};


/**
 * Updates a control block by adding additional children.
 * @param {!Element} div The control block to update.
 * @param {!goog.dom.DomHelper} domHelper DOM helper to use.
 * @param {...Element} var_args Elements to insert into the block.
 */
remote.ui.updateControlBlock = function(div, domHelper, var_args) {
  var elements = goog.array.slice(arguments, 2);
  goog.array.forEach(elements, function(element, i) {
    goog.dom.appendChild(div, element);
    if (i + 1 < elements.length) {
      goog.dom.appendChild(div, domHelper.createTextNode(
          remote.ui.ControlBlock.SEPARATOR_TEXT_));
    }
  });
};
