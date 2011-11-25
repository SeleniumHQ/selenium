// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Displays and edits the value of a cookie.
 * Intended only for debugging.
 */
goog.provide('goog.ui.CookieEditor');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events.EventType');
goog.require('goog.net.cookies');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.ui.Component');



/**
 * Displays and edits the value of a cookie.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.CookieEditor = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(goog.ui.CookieEditor, goog.ui.Component);


/**
 * Cookie key.
 * @type {?string}
 * @private
 */
goog.ui.CookieEditor.prototype.cookieKey_;


/**
 * Text area.
 * @type {HTMLTextAreaElement}
 * @private
 */
goog.ui.CookieEditor.prototype.textAreaElem_;


/**
 * Clear button.
 * @type {HTMLButtonElement}
 * @private
 */
goog.ui.CookieEditor.prototype.clearButtonElem_;


/**
 * Invalid value warning text.
 * @type {HTMLSpanElement}
 * @private
 */
goog.ui.CookieEditor.prototype.valueWarningElem_;


/**
 * Update button.
 * @type {HTMLButtonElement}
 * @private
 */
goog.ui.CookieEditor.prototype.updateButtonElem_;


// TODO(user): add combobox for user to select different cookies
/**
 * Sets the cookie which this component will edit.
 * @param {string} cookieKey Cookie key.
 */
goog.ui.CookieEditor.prototype.selectCookie = function(cookieKey) {
  goog.asserts.assert(goog.net.cookies.isValidName(cookieKey));
  this.cookieKey_ = cookieKey;
  if (this.textAreaElem_) {
    this.textAreaElem_.value = goog.net.cookies.get(cookieKey) || '';
  }
};


/** @override */
goog.ui.CookieEditor.prototype.canDecorate = function() {
  return false;
};


/** @override */
goog.ui.CookieEditor.prototype.createDom = function() {
  // Debug-only, so we don't need i18n.
  this.clearButtonElem_ = /** @type {HTMLButtonElement} */ (goog.dom.createDom(
      goog.dom.TagName.BUTTON, /* attributes */ null, 'Clear'));
  this.updateButtonElem_ = /** @type {HTMLButtonElement} */ (goog.dom.createDom(
      goog.dom.TagName.BUTTON, /* attributes */ null, 'Update'));
  var value = this.cookieKey_ && goog.net.cookies.get(this.cookieKey_);
  this.textAreaElem_ = /** @type {HTMLTextAreaElement} */ (goog.dom.createDom(
      goog.dom.TagName.TEXTAREA, /* attibutes */ null, value || ''));
  this.valueWarningElem_ = /** @type {HTMLSpanElement} */ (goog.dom.createDom(
      goog.dom.TagName.SPAN, /* attibutes */ {
        'style': 'display:none;color:red'
      }, 'Invalid cookie value.'));
  this.setElementInternal(goog.dom.createDom(goog.dom.TagName.DIV,
      /* attibutes */ null,
      this.valueWarningElem_,
      goog.dom.createDom(goog.dom.TagName.BR),
      this.textAreaElem_,
      goog.dom.createDom(goog.dom.TagName.BR),
      this.clearButtonElem_,
      this.updateButtonElem_));
};


/** @override */
goog.ui.CookieEditor.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(this.clearButtonElem_,
      goog.events.EventType.CLICK,
      this.handleClear_);
  this.getHandler().listen(this.updateButtonElem_,
      goog.events.EventType.CLICK,
      this.handleUpdate_);
};


/**
 * Handles user clicking clear button.
 * @param {!goog.events.Event} e The click event.
 * @private
 */
goog.ui.CookieEditor.prototype.handleClear_ = function(e) {
  if (this.cookieKey_) {
    goog.net.cookies.remove(this.cookieKey_);
  }
  this.textAreaElem_.value = '';
};


/**
 * Handles user clicking update button.
 * @param {!goog.events.Event} e The click event.
 * @private
 */
goog.ui.CookieEditor.prototype.handleUpdate_ = function(e) {
  if (this.cookieKey_) {
    var value = this.textAreaElem_.value;
    if (value) {
      // Strip line breaks.
      value = goog.string.stripNewlines(value);
    }
    if (goog.net.cookies.isValidValue(value)) {
      goog.net.cookies.set(this.cookieKey_, value);
      goog.style.showElement(this.valueWarningElem_, false);
    } else {
      goog.style.showElement(this.valueWarningElem_, true);
    }
  }
};


/** @override */
goog.ui.CookieEditor.prototype.disposeInternal = function() {
  this.clearButtonElem_ = null;
  this.cookieKey_ = null;
  this.textAreaElem_ = null;
  this.updateButtonElem_ = null;
  this.valueWarningElem_ = null;
};
