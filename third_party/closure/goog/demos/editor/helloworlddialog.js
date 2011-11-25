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
 * @fileoverview An example of how to write a dialog to be opened by a plugin.
 *
 */

goog.provide('goog.demos.editor.HelloWorldDialog');
goog.provide('goog.demos.editor.HelloWorldDialog.OkEvent');

goog.require('goog.dom.TagName');
goog.require('goog.events.Event');
goog.require('goog.string');
goog.require('goog.ui.editor.AbstractDialog');
goog.require('goog.ui.editor.AbstractDialog.Builder');
goog.require('goog.ui.editor.AbstractDialog.EventType');


// *** Public interface ***************************************************** //

/**
 * Creates a dialog to let the user enter a customized hello world message.
 * @param {goog.dom.DomHelper} domHelper DomHelper to be used to create the
 * dialog's dom structure.
 * @constructor
 * @extends {goog.ui.editor.AbstractDialog}
 */
goog.demos.editor.HelloWorldDialog = function(domHelper) {
  goog.ui.editor.AbstractDialog.call(this, domHelper);
};
goog.inherits(goog.demos.editor.HelloWorldDialog,
              goog.ui.editor.AbstractDialog);


// *** Event **************************************************************** //

/**
 * OK event object for the hello world dialog.
 * @param {string} message Customized hello world message chosen by the user.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.demos.editor.HelloWorldDialog.OkEvent = function(message) {
  this.message = message;
};
goog.inherits(goog.demos.editor.HelloWorldDialog.OkEvent, goog.events.Event);

/**
 * Event type.
 * @type {goog.ui.editor.AbstractDialog.EventType}
 * @override
 */
goog.demos.editor.HelloWorldDialog.OkEvent.prototype.type =
    goog.ui.editor.AbstractDialog.EventType.OK;

/**
 * Customized hello world message chosen by the user.
 * @type {string}
 */
goog.demos.editor.HelloWorldDialog.OkEvent.prototype.message;


// *** Protected interface ************************************************** //

/** @override */
goog.demos.editor.HelloWorldDialog.prototype.createDialogControl = function() {
  var builder = new goog.ui.editor.AbstractDialog.Builder(this);
  /** @desc Title of the hello world dialog. */
  var MSG_HELLO_WORLD_DIALOG_TITLE = goog.getMsg('Add a Hello World message');
  builder.setTitle(MSG_HELLO_WORLD_DIALOG_TITLE).
      setContent(this.createContent_());
  return builder.build();
};

/**
 * Creates and returns the event object to be used when dispatching the OK
 * event to listeners, or returns null to prevent the dialog from closing.
 * @param {goog.events.Event} e The event object dispatched by the wrapped
 *     dialog.
 * @return {goog.demos.editor.HelloWorldDialog.OkEvent} The event object to be
 *     used when dispatching the OK event to listeners.
 * @protected
 * @override
 */
goog.demos.editor.HelloWorldDialog.prototype.createOkEvent = function(e) {
  var message = this.getMessage_();
  if (message &&
      goog.demos.editor.HelloWorldDialog.isValidHelloWorld_(message)) {
    return new goog.demos.editor.HelloWorldDialog.OkEvent(message);
  } else {
    /** @desc Error message telling the user why their message was rejected. */
    var MSG_HELLO_WORLD_DIALOG_ERROR =
        goog.getMsg('Your message must contain the words "hello" and "world".');
    this.dom.getWindow().alert(MSG_HELLO_WORLD_DIALOG_ERROR);
    return null; // Prevents the dialog from closing.
  }
};


// *** Private implementation *********************************************** //

/**
 * Input element where the user will type their hello world message.
 * @type {Element}
 * @private
 */
goog.demos.editor.HelloWorldDialog.prototype.input_;


/**
 * Creates the DOM structure that makes up the dialog's content area.
 * @return {Element} The DOM structure that makes up the dialog's content area.
 * @private
 */
goog.demos.editor.HelloWorldDialog.prototype.createContent_ = function() {
  /** @desc Sample hello world message to prepopulate the dialog with. */
  var MSG_HELLO_WORLD_DIALOG_SAMPLE = goog.getMsg('Hello, world!');
  this.input_ = this.dom.createDom(goog.dom.TagName.INPUT,
      {size: 25, value: MSG_HELLO_WORLD_DIALOG_SAMPLE});
  /** @desc Prompt telling the user to enter a hello world message. */
  var MSG_HELLO_WORLD_DIALOG_PROMPT =
      goog.getMsg('Enter your Hello World message');
  return this.dom.createDom(goog.dom.TagName.DIV,
                            null,
                            [MSG_HELLO_WORLD_DIALOG_PROMPT, this.input_]);
};

/**
 * Returns the hello world message currently typed into the dialog's input.
 * @return {?string} The hello world message currently typed into the dialog's
 *     input, or null if called before the input is created.
 * @private
 */
goog.demos.editor.HelloWorldDialog.prototype.getMessage_ = function() {
  return this.input_ && this.input_.value;
};


/**
 * Returns whether or not the given message contains the strings "hello" and
 * "world". Case-insensitive and order doesn't matter.
 * @param {string} message The message to be checked.
 * @return {boolean} Whether or not the given message contains the strings
 *     "hello" and "world".
 * @private
 */
goog.demos.editor.HelloWorldDialog.isValidHelloWorld_ = function(message) {
  message = message.toLowerCase();
  return goog.string.contains(message, 'hello') &&
         goog.string.contains(message, 'world');
};
