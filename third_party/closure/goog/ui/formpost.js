// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utility for making the browser submit a hidden form, which can
 * be used to effect a POST from JavaScript.
 *
 * @author dpb@google.com (David P. Baker)
 */

goog.provide('goog.ui.FormPost');

goog.require('goog.array');
goog.require('goog.dom.InputType');
goog.require('goog.dom.TagName');
goog.require('goog.dom.safe');
goog.require('goog.html.SafeHtml');
goog.require('goog.ui.Component');



/**
 * Creates a formpost object.
 * @constructor
 * @extends {goog.ui.Component}
 * @param {goog.dom.DomHelper=} opt_dom The DOM helper.
 * @final
 */
goog.ui.FormPost = function(opt_dom) {
  goog.ui.Component.call(this, opt_dom);
};
goog.inherits(goog.ui.FormPost, goog.ui.Component);


/** @override */
goog.ui.FormPost.prototype.createDom = function() {
  this.setElementInternal(this.getDomHelper().createDom(goog.dom.TagName.FORM,
      {'method': 'POST', 'style': 'display:none'}));
};


/**
 * Constructs a POST request and directs the browser as if a form were
 * submitted.
 * @param {Object} parameters Object with parameter values. Values can be
 *     strings, numbers, or arrays of strings or numbers.
 * @param {string=} opt_url The destination URL. If not specified, uses the
 *     current URL for window for the DOM specified in the constructor.
 * @param {string=} opt_target An optional name of a window in which to open the
 *     URL. If not specified, uses the window for the DOM specified in the
 *     constructor.
 */
goog.ui.FormPost.prototype.post = function(parameters, opt_url, opt_target) {
  var form = this.getElement();
  if (!form) {
    this.render();
    form = this.getElement();
  }
  form.action = opt_url || '';
  form.target = opt_target || '';
  this.setParameters_(form, parameters);
  form.submit();
};


/**
 * Creates hidden inputs in a form to match parameters.
 * @param {!Element} form The form element.
 * @param {Object} parameters Object with parameter values. Values can be
 *     strings, numbers, or arrays of strings or numbers.
 * @private
 */
goog.ui.FormPost.prototype.setParameters_ = function(form, parameters) {
  var name, value, html = [];
  for (name in parameters) {
    value = parameters[name];
    if (goog.isArrayLike(value)) {
      goog.array.forEach(value, goog.bind(function(innerValue) {
        html.push(this.createInput_(name, String(innerValue)));
      }, this));
    } else {
      html.push(this.createInput_(name, String(value)));
    }
  }
  goog.dom.safe.setInnerHtml(form, goog.html.SafeHtml.concat(html));
};


/**
 * Creates a hidden <input> tag.
 * @param {string} name The name of the input.
 * @param {string} value The value of the input.
 * @return {!goog.html.SafeHtml}
 * @private
 */
goog.ui.FormPost.prototype.createInput_ = function(name, value) {
  return goog.html.SafeHtml.create('input',
      {'type': goog.dom.InputType.HIDDEN, 'name': name, 'value': value});
};
