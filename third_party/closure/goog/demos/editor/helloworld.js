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
 * @fileoverview A simple plugin that inserts 'Hello World!' on command. This
 * plugin is intended to be an example of a very simple plugin for plugin
 * developers.
 *
 * @author gak@google.com (Gregory Kick)
 * @see helloworld.html
 */

goog.provide('goog.demos.editor.HelloWorld');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.editor.Plugin');



/**
 * Plugin to insert 'Hello World!' into an editable field.
 * @constructor
 * @extends {goog.editor.Plugin}
 */
goog.demos.editor.HelloWorld = function() {
  goog.editor.Plugin.call(this);
};
goog.inherits(goog.demos.editor.HelloWorld, goog.editor.Plugin);


/** @override */
goog.demos.editor.HelloWorld.prototype.getTrogClassId = function() {
  return 'HelloWorld';
};


/**
 * Commands implemented by this plugin.
 * @enum {string}
 */
goog.demos.editor.HelloWorld.COMMAND = {
  HELLO_WORLD: '+helloWorld'
};


/** @override */
goog.demos.editor.HelloWorld.prototype.isSupportedCommand = function(
    command) {
  return command == goog.demos.editor.HelloWorld.COMMAND.HELLO_WORLD;
};


/**
 * Executes a command. Does not fire any BEFORECHANGE, CHANGE, or
 * SELECTIONCHANGE events (these are handled by the super class implementation
 * of {@code execCommand}.
 * @param {string} command Command to execute.
 * @override
 * @protected
 */
goog.demos.editor.HelloWorld.prototype.execCommandInternal = function(
    command) {
  var domHelper = this.fieldObject.getEditableDomHelper();
  var range = this.fieldObject.getRange();
  range.removeContents();
  var newNode =
      domHelper.createDom(goog.dom.TagName.SPAN, null, 'Hello World!');
  range.insertNode(newNode, false);
};
