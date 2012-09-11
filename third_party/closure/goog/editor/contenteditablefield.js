// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Class to encapsulate an editable field that blends into the
 * style of the page and never uses an iframe.  The field's height can be
 * controlled by CSS styles like min-height, max-height, and overflow.  This is
 * a goog.editor.Field, but overrides everything iframe related to use
 * contentEditable divs.  This is essentially a much lighter alternative to
 * goog.editor.SeamlessField, but only works in Firefox 3+, and only works
 * *well* in Firefox 12+ due to
 * https://bugzilla.mozilla.org/show_bug.cgi?id=669026.
 *
 * @author gboyer@google.com (Garrett Boyer)
 * @author jparent@google.com (Julie Parent)
 * @author nicksantos@google.com (Nick Santos)
 * @author ojan@google.com (Ojan Vafai)
 */


goog.provide('goog.editor.ContentEditableField');

goog.require('goog.asserts');
goog.require('goog.debug.Logger');
goog.require('goog.editor.Field');



/**
 * This class encapsulates an editable field that is just a contentEditable
 * div.
 *
 * To see events fired by this object, please see the base class.
 *
 * @param {string} id An identifer for the field. This is used to find the
 *     field and the element associated with this field.
 * @param {Document=} opt_doc The document that the element with the given
 *     id can be found it.
 * @constructor
 * @extends {goog.editor.Field}
 */
goog.editor.ContentEditableField = function(id, opt_doc) {
  goog.editor.Field.call(this, id, opt_doc);
};
goog.inherits(goog.editor.ContentEditableField, goog.editor.Field);


/**
 * @override
 */
goog.editor.ContentEditableField.prototype.logger =
    goog.debug.Logger.getLogger('goog.editor.ContentEditableField');


/** @override */
goog.editor.ContentEditableField.prototype.usesIframe = function() {
  // Never uses an iframe in any browser.
  return false;
};


// Overridden to improve dead code elimination only.
/** @override */
goog.editor.ContentEditableField.prototype.turnOnDesignModeGecko =
    goog.nullFunction;


/** @override */
goog.editor.ContentEditableField.prototype.installStyles = function() {
  goog.asserts.assert(!this.cssStyles, 'ContentEditableField does not support' +
      ' CSS styles; instead just write plain old CSS on the main page.');
};


/** @override */
goog.editor.ContentEditableField.prototype.makeEditableInternal = function(
    opt_iframeSrc) {
  var field = this.getOriginalElement();
  if (field) {
    this.setupFieldObject(field);
    // TODO(gboyer): Allow clients/plugins to override with 'plaintext-only'
    // for WebKit.
    field.contentEditable = true;

    this.injectContents(field.innerHTML, field);

    this.handleFieldLoad();
  }
};


/**
 * @override
 *
 * ContentEditableField does not make any changes to the DOM when it is made
 * editable other than setting contentEditable to true.
 */
goog.editor.ContentEditableField.prototype.restoreDom =
    goog.nullFunction;
