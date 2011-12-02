// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview DHTML prompt to replace javascript's prompt().
 *
 * @see ../demos/prompt.html
 */


goog.provide('goog.ui.Prompt');

goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.functions');
goog.require('goog.ui.Component.Error');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.Dialog.ButtonSet');
goog.require('goog.ui.Dialog.DefaultButtonKeys');
goog.require('goog.ui.Dialog.EventType');
goog.require('goog.userAgent');



/**
 * Creates an object that represents a prompt (used in place of javascript's
 * prompt). The html structure of the prompt is the same as the layout for
 * dialog.js except for the addition of a text box which is placed inside the
 * "Content area" and has the default class-name 'modal-dialog-userInput'
 *
 * @param {string} promptTitle The title of the prompt.
 * @param {string} promptText The text of the prompt.
 * @param {Function} callback The function to call when the user selects Ok or
 *     Cancel. The function should expect a single argument which represents
 *     what the user entered into the prompt. If the user presses cancel, the
 *     value of the argument will be null.
 * @param {string=} opt_defaultValue Optional default value that should be in
 *     the text box when the prompt appears.
 * @param {string=} opt_class Optional prefix for the classes.
 * @param {boolean=} opt_useIframeForIE For IE, workaround windowed controls
 *     z-index issue by using a an iframe instead of a div for bg element.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link
 *    goog.ui.Component} for semantics.
 * @constructor
 * @extends {goog.ui.Dialog}
 */
goog.ui.Prompt = function(promptTitle, promptText, callback, opt_defaultValue,
    opt_class, opt_useIframeForIE, opt_domHelper) {
  goog.ui.Dialog.call(this, opt_class, opt_useIframeForIE, opt_domHelper);

  /**
   * The id of the input element.
   * @type {string}
   * @private
   */
  this.inputElementId_ = this.makeId('ie');

  this.setTitle(promptTitle);
  this.setContent('<label for="' + this.inputElementId_ + '">' + promptText +
      '</label><br><br>');
  this.callback_ = callback;
  this.defaultValue_ = goog.isDef(opt_defaultValue) ? opt_defaultValue : '';

  /** @desc label for a dialog button. */
  var MSG_PROMPT_OK = goog.getMsg('OK');
  /** @desc label for a dialog button. */
  var MSG_PROMPT_CANCEL = goog.getMsg('Cancel');
  var buttonSet = new goog.ui.Dialog.ButtonSet(opt_domHelper);
  buttonSet.set(goog.ui.Dialog.DefaultButtonKeys.OK, MSG_PROMPT_OK, true);
  buttonSet.set(goog.ui.Dialog.DefaultButtonKeys.CANCEL,
      MSG_PROMPT_CANCEL, false, true);
  this.setButtonSet(buttonSet);
};
goog.inherits(goog.ui.Prompt, goog.ui.Dialog);


/**
 * Callback function which is invoked with the response to the prompt
 * @type {Function}
 * @private
 */
goog.ui.Prompt.prototype.callback_ = goog.nullFunction;


/**
 * Default value to display in prompt window
 * @type {string}
 * @private
 */
goog.ui.Prompt.prototype.defaultValue_ = '';


/**
 * Element in which user enters response (HTML <input> text box)
 * @type {HTMLInputElement}
 * @private
 */
goog.ui.Prompt.prototype.userInputEl_ = null;


/**
 * Tracks whether the prompt is in the process of closing to prevent multiple
 * calls to the callback when the user presses enter.
 * @type {boolean}
 * @private
 */
goog.ui.Prompt.prototype.isClosing_ = false;


/**
 * Number of rows in the user input element.
 * The default is 1 which means use an <input> element.
 * @type {number}
 * @private
 */
goog.ui.Prompt.prototype.rows_ = 1;


/**
 * Number of cols in the user input element.
 * The default is 0 which means use browser default.
 * @type {number}
 * @private
 */
goog.ui.Prompt.prototype.cols_ = 0;


/**
 * The input decorator function.
 * @type {function(Element)?}
 * @private
 */
goog.ui.Prompt.prototype.inputDecoratorFn_ = null;


/**
 * A validation function that takes a string and returns true if the string is
 * accepted, false otherwise.
 * @type {function(string):boolean}
 * @private
 */
goog.ui.Prompt.prototype.validationFn_ = goog.functions.TRUE;


/**
 * Sets the validation function that takes a string and returns true if the
 * string is accepted, false otherwise.
 * @param {function(string): boolean} fn The validation function to use on user
 *     input.
 */
goog.ui.Prompt.prototype.setValidationFunction = function(fn) {
  this.validationFn_ = fn;
};


/** @override */
goog.ui.Prompt.prototype.enterDocument = function() {
  if (this.inputDecoratorFn_) {
    this.inputDecoratorFn_(this.userInputEl_);
  }
  goog.ui.Prompt.superClass_.enterDocument.call(this);
  this.getHandler().listen(this,
      goog.ui.Dialog.EventType.SELECT, this.onPromptExit_);

  this.getHandler().listen(this.userInputEl_,
      [goog.events.EventType.KEYUP, goog.events.EventType.CHANGE],
      this.handleInputChanged_);
};


/**
 * Sets an input decorator function.  This function will be called in
 * #enterDocument and will be passed the input element.  This is useful for
 * attaching handlers to the input element for specific change events,
 * for example.
 * @param {function(Element)} inputDecoratorFn A function to call on the input
 *     element on #enterDocument.
 */
goog.ui.Prompt.prototype.setInputDecoratorFn = function(inputDecoratorFn) {
  this.inputDecoratorFn_ = inputDecoratorFn;
};


/**
 * Set the number of rows in the user input element.
 * A values of 1 means use an <input> element.  If the prompt is already
 * rendered then you cannot change from <input> to <textarea> or vice versa.
 * @param {number} rows Number of rows for user input element.
 * @throws {goog.ui.Component.Error.ALREADY_RENDERED} If the component is
 *    already rendered and an attempt to change between <input> and <textarea>
 *    is made.
 */
goog.ui.Prompt.prototype.setRows = function(rows) {
  if (this.isInDocument()) {
    if (this.userInputEl_.tagName.toLowerCase() == 'input') {
      if (rows > 1) {
        throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
      }
    } else {
      if (rows <= 1) {
        throw Error(goog.ui.Component.Error.ALREADY_RENDERED);
      }
      this.userInputEl_.rows = rows;
    }
  }
  this.rows_ = rows;
};


/**
 * @return {number} The number of rows in the user input element.
 */
goog.ui.Prompt.prototype.getRows = function() {
  return this.rows_;
};


/**
 * Set the number of cols in the user input element.
 * @param {number} cols Number of cols for user input element.
 */
goog.ui.Prompt.prototype.setCols = function(cols) {
  this.cols_ = cols;
  if (this.userInputEl_) {
    if (this.userInputEl_.tagName.toLowerCase() == 'input') {
      this.userInputEl_.size = cols;
    } else {
      this.userInputEl_.cols = cols;
    }
  }
};


/**
 * @return {number} The number of cols in the user input element.
 */
goog.ui.Prompt.prototype.getCols = function() {
  return this.cols_;
};


/**
 * Create the initial DOM representation for the prompt.
 */
goog.ui.Prompt.prototype.createDom = function() {
  goog.ui.Prompt.superClass_.createDom.call(this);

  var cls = this.getClass();

  // add input box to the content
  var attrs = {
    'className': goog.getCssName(cls, 'userInput'),
    'value': this.defaultValue_};
  if (this.rows_ == 1) {
    // If rows == 1 then use an input element.
    this.userInputEl_ = /** @type {HTMLInputElement} */
        (this.getDomHelper().createDom('input', attrs));
    this.userInputEl_.type = 'text';
    if (this.cols_) {
      this.userInputEl_.size = this.cols_;
    }
  } else {
    // If rows > 1 then use a textarea.
    this.userInputEl_ = /** @type {HTMLInputElement} */
        (this.getDomHelper().createDom('textarea', attrs));
    this.userInputEl_.rows = this.rows_;
    if (this.cols_) {
      this.userInputEl_.cols = this.cols_;
    }
  }

  this.userInputEl_.id = this.inputElementId_;
  var contentEl = this.getContentElement();
  contentEl.appendChild(this.getDomHelper().createDom(
      'div', {'style': 'overflow: auto'}, this.userInputEl_));

  if (this.rows_ > 1) {
    // Set default button to null so <enter> will work properly in the textarea
    this.getButtonSet().setDefault(null);
  }
};


/**
 * Handles input change events on the input field.  Disables the OK button if
 * validation fails on the new input value.
 * @private
 */
goog.ui.Prompt.prototype.handleInputChanged_ = function() {
  this.updateOkButtonState_();
};


/**
 * Set OK button enabled/disabled state based on input.
 * @private
 */
goog.ui.Prompt.prototype.updateOkButtonState_ = function() {
  var enableOkButton = this.validationFn_(this.userInputEl_.value);
  var buttonSet = this.getButtonSet();
  buttonSet.setButtonEnabled(goog.ui.Dialog.DefaultButtonKeys.OK,
      enableOkButton);
};


/**
 * Causes the prompt to appear, centered on the screen, gives focus
 * to the text box, and selects the text
 * @param {boolean} visible Whether the dialog should be visible.
 */
goog.ui.Prompt.prototype.setVisible = function(visible) {
  goog.ui.Dialog.prototype.setVisible.call(this, visible);
  if (visible) {
    this.isClosing_ = false;
    this.userInputEl_.value = this.defaultValue_;
    this.focus();
    this.updateOkButtonState_();
  }
};


/**
 * Overrides setFocus to put focus on the input element.
 * @override
 */
goog.ui.Prompt.prototype.focus = function() {
  if (goog.userAgent.OPERA) {
    // select() doesn't focus <input> elements in Opera.
    this.userInputEl_.focus();
  }
  this.userInputEl_.select();
};


/**
 * Sets the default value of the prompt when it is displayed.
 * @param {string} defaultValue The default value to display.
 */
goog.ui.Prompt.prototype.setDefaultValue = function(defaultValue) {
  this.defaultValue_ = defaultValue;
};


/**
 * Handles the closing of the prompt, invoking the callback function that was
 * registered to handle the value returned by the prompt.
 * @param {goog.ui.Dialog.Event} e The dialog's selection event.
 * @private
 */
goog.ui.Prompt.prototype.onPromptExit_ = function(e) {
  /*
   * The timeouts below are required for one edge case. If after the dialog
   * hides, suppose validation of the input fails which displays an alert. If
   * the user pressed the Enter key to dismiss the alert that was displayed it
   * can trigger the event handler a second time. This timeout ensures that the
   * alert is displayed only after the prompt is able to clean itself up.
   */
  if (!this.isClosing_) {
    this.isClosing_ = true;
    if (e.key == 'ok') {
      goog.Timer.callOnce(
          goog.bind(this.callback_, this, this.userInputEl_.value), 1);
    } else {
      goog.Timer.callOnce(goog.bind(this.callback_, this, null), 1);
    }
  }
};


/** @override */
goog.ui.Prompt.prototype.disposeInternal = function() {
  goog.dom.removeNode(this.userInputEl_);

  goog.events.unlisten(this, goog.ui.Dialog.EventType.SELECT,
      this.onPromptExit_, true, this);

  goog.ui.Prompt.superClass_.disposeInternal.call(this);

  this.defaulValue_ = null;
  this.userInputEl_ = null;
};
