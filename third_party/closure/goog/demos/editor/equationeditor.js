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
 * @see equationeditor.html
 */

goog.provide('goog.demos.editor.EquationEditor');

goog.require('goog.ui.equation.EquationEditorDialog');



/**
 * @constructor
 */
goog.demos.editor.EquationEditor = function() {
};


/**
 * Creates a new editor and opens the dialog.
 * @param {string} initialEquation The initial equation value to use.
 */
goog.demos.editor.EquationEditor.prototype.openEditor = function(
    initialEquation) {
  var editorDialog = new goog.ui.equation.EquationEditorDialog(initialEquation);
  editorDialog.setVisible(true);
};
