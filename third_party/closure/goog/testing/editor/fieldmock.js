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
 * @fileoverview Mock of goog.editor.field.
 *
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.testing.editor.FieldMock');

goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.editor.Field');
goog.require('goog.testing.LooseMock');
goog.require('goog.testing.mockmatchers');



/**
 * Mock of goog.editor.Field.
 * @param {Window=} opt_window Window the field would edit.  Defaults to
 *     {@code window}.
 * @param {Window=} opt_appWindow "AppWindow" of the field, which can be
 *     different from {@code opt_window} when mocking a field that uses an
 *     iframe. Defaults to {@code opt_window}.
 * @param {goog.dom.AbstractRange=} opt_range An object (mock or real) to be
 *     returned by getRange(). If ommitted, a new goog.dom.Range is created
 *     from the window every time getRange() is called.
 * @constructor
 * @extends {goog.testing.LooseMock}
 * @suppress {missingProperties} Mocks do not fit in the type system well.
 */
goog.testing.editor.FieldMock =
    function(opt_window, opt_appWindow, opt_range) {
  goog.testing.LooseMock.call(this, goog.editor.Field);
  opt_window = opt_window || window;
  opt_appWindow = opt_appWindow || opt_window;

  this.getAppWindow();
  this.$anyTimes();
  this.$returns(opt_appWindow);

  this.getRange();
  this.$anyTimes();
  this.$does(function() {
    return opt_range || goog.dom.Range.createFromWindow(opt_window);
  });

  this.getEditableDomHelper();
  this.$anyTimes();
  this.$returns(goog.dom.getDomHelper(opt_window.document));

  this.usesIframe();
  this.$anyTimes();

  this.getBaseZindex();
  this.$anyTimes();
  this.$returns(0);

  this.restoreSavedRange(goog.testing.mockmatchers.ignoreArgument);
  this.$anyTimes();
  this.$does(function(range) {
    if (range) {
      range.restore();
    }
    this.focus();
  });

  // These methods cannot be set on the prototype, because the prototype
  // gets stepped on by the mock framework.
  var inModalMode = false;

  /**
   * @return {boolean} Whether we're in modal interaction mode.
   */
  this.inModalMode = function() {
    return inModalMode;
  };

  /**
   * @param {boolean} mode Sets whether we're in modal interaction mode.
   */
  this.setModalMode = function(mode) {
    inModalMode = mode;
  };
};
goog.inherits(goog.testing.editor.FieldMock, goog.testing.LooseMock);
