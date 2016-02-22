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

goog.provide('remote.ui.JsonTooltip');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.format.JsonPrettyPrinter');
goog.require('goog.ui.AdvancedTooltip');



/**
 * Tooltip for displaying a JSON object.
 * @constructor
 * @extends {goog.ui.AdvancedTooltip}
 */
remote.ui.JsonTooltip = function() {
  goog.base(this);

  var dom = this.getDomHelper();

  /**
   * The content body for this tooltip.
   * @private {!Element}
   */
  this.bodyElement_ = dom.createElement(goog.dom.TagName.PRE);

  /**
   * The close button for this tooltip.
   * @private {!Element}
   */
  this.closeButton_ = dom.createDom(goog.dom.TagName.BUTTON, null, 'Close');
  goog.events.listen(this.closeButton_, goog.events.EventType.CLICK,
      goog.bind(this.setVisible, this, false));

  var div = dom.createDom(goog.dom.TagName.DIV, null,
      this.bodyElement_,
      dom.createElement(goog.dom.TagName.HR),
      dom.createDom(goog.dom.TagName.DIV, {
        'style': 'text-align: center;'
      }, this.closeButton_));
  goog.dom.appendChild(this.getElement(), div);
};
goog.inherits(remote.ui.JsonTooltip, goog.ui.AdvancedTooltip);


/** @override */
remote.ui.JsonTooltip.prototype.disposeInternal = function() {
  goog.events.removeAll(this.closeButton_);
  delete this.closeButton_;
  delete this.bodyElement_;
  goog.base(this, 'disposeInternal');
};


/**
 * Update the body element for this tooltip.
 * @param {Object} json The JSON object to display.
 */
remote.ui.JsonTooltip.prototype.update = function(json) {
  var f = new goog.format.JsonPrettyPrinter(
      new goog.format.JsonPrettyPrinter.TextDelimiters);
  this.bodyElement_.innerHTML = f.format(json || {});
};

