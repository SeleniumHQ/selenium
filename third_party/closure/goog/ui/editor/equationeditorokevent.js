// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.editor.EquationEditorOkEvent');

goog.require('goog.events.Event');
goog.require('goog.ui.editor.AbstractDialog');



/**
 * OK event object for the equation editor dialog.
 * @param {string} equationHtml html containing the equation to put in the
 *     editable field.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.ui.editor.EquationEditorOkEvent = function(equationHtml) {
  this.equationHtml = equationHtml;
};
goog.inherits(goog.ui.editor.EquationEditorOkEvent,
    goog.events.Event);


/**
 * Event type.
 * @type {goog.ui.editor.AbstractDialog.EventType}
 * @override
 */
goog.ui.editor.EquationEditorOkEvent.prototype.type =
    goog.ui.editor.AbstractDialog.EventType.OK;


/**
 * HTML containing the equation to put in the editable field.
 * @type {string}
 */
goog.ui.editor.EquationEditorOkEvent.prototype.equationHtml;
