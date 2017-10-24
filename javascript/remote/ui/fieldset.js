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

goog.provide('remote.ui.FieldSet');

goog.require('goog.dom.TagName');
goog.require('goog.ui.Component');



/**
 * A component rendered as a FIELDSET on the page.
 * @param {string} legend Text for the fieldset legend.
 * @constructor
 * @extends {goog.ui.Component}
 */
remote.ui.FieldSet = function(legend) {
  goog.base(this);

  /**
   * Legend text.
   * @private {string}
   */
  this.legend_ = legend;
};
goog.inherits(remote.ui.FieldSet, goog.ui.Component);


/** @override */
remote.ui.FieldSet.prototype.disposeInternal = function() {
  delete this.legend_;
  goog.base(this, 'disposeInternal');
};


/**
 * Overrides the parent implementation to create the DOM for this component's
 * fieldset. This function is considered final. To define the fieldset's
 * internal structure, sub-types should override {@code createFieldSetDom()}.
 * @override
 */
remote.ui.FieldSet.prototype.createDom = function() {
  var dom = this.getDomHelper();
  var fieldset = dom.createDom(goog.dom.TagName.FIELDSET, null,
      dom.createDom(goog.dom.TagName.LEGEND, null, this.legend_),
      this.createFieldSetDom());
  this.setElementInternal(fieldset);
};


/**
 * Returns the DOM element that should be used as the internal content for
 * this component's fieldset. This default implementation returns undefined,
 * resulting an empty fieldset.
 * @return {Element} The internal DOM for this fieldset.
 * @protected
 */
remote.ui.FieldSet.prototype.createFieldSetDom = function() {
  return null;
};


