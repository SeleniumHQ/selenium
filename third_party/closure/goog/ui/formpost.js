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

// Copyright 2008 Google Inc. All Rights Reserved.

/**
 * @fileoverview Utility for making the browser submit a hidden form, which can
 * be used to effect a POST from JavaScript.
 *
 */

goog.provide('goog.ui.FormPost');

goog.require('goog.array');
goog.require('goog.dom.TagName');
goog.require('goog.string');
goog.require('goog.string.StringBuffer');
goog.require('goog.ui.Component');

/**
 * Creates a formpost object.
 * @constructor
 * @extends {goog.ui.Component}
 * @param {goog.dom.DomHelper} opt_dom The DOM helper.
 */
goog.ui.FormPost = function(opt_dom) {
  goog.ui.Component.call(this, opt_dom);
};
goog.inherits(goog.ui.FormPost, goog.ui.Component);


/** @inheritDoc */
goog.ui.FormPost.prototype.createDom = function() {
  this.setElementInternal(this.getDomHelper().$dom(goog.dom.TagName.FORM,
      {'method': 'POST', 'style': 'display:none'}));
};


/**
 * Constructs a POST request and directs the browser as if a form were
 * submitted.
 * @param {Object} parameters Object with parameter values. Values can be
 *     strings, numbers, or arrays of strings or numbers.
 * @param {string} opt_url The destination URL. If not specified, uses the
 *     current URL for window for the DOM specified in the constructor.
 * @param {string} opt_target An optional name of a window in which to open the
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
 * @param {Element} form The form element.
 * @param {Object} parameters Object with parameter values. Values can be
 *     strings, numbers, or arrays of strings or numbers.
 * @private
 */
goog.ui.FormPost.prototype.setParameters_ = function(form, parameters) {
  var name, value, sb = new goog.string.StringBuffer();
  for (name in parameters) {
    value = parameters[name];
    if (goog.isArrayLike(value)) {
      goog.array.forEach(value, goog.bind(this.appendInput_, this, sb, name));
    } else {
      this.appendInput_(sb, name, value);
    }
  }
  form.innerHTML = sb.toString();
};


/**
 * Appends a hidden <INPUT> tag to a string buffer.
 * @param {goog.string.StringBuffer} out A string buffer.
 * @param {string} name The name of the input.
 * @param {string} value The value of the input.
 * @private
 */
goog.ui.FormPost.prototype.appendInput_ = function(out, name, value) {
  out.append(
      '<input type="hidden" name="',
      goog.string.htmlEscape(name),
      '" value="',
      goog.string.htmlEscape(value),
      '">');
};
