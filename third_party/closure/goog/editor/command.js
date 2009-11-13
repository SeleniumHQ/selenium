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

// Copyright 2009 Google, Inc. All Rights Reserved.

/**
 * @fileoverview Commands that the editor can execute.
 * @see ../demos/editor/editor.html
 */
goog.provide('goog.editor.Command');


/**
 * Commands that the editor can excute via execCommand or queryCommandValue.
 * @enum {string}
 */
goog.editor.Command = {
  // Prepend all the strings of built in execCommands with a plus to ensure
  // that there's no conflict if a client wants to use the
  // browser's execCommand.
  UNDO: '+undo',
  REDO: '+redo',
  LINK: '+link',
  FORMAT_BLOCK: '+formatBlock',
  INDENT: '+indent',
  OUTDENT: '+outdent',
  REMOVE_FORMAT: '+removeFormat',
  STRIKE_THROUGH: '+strikeThrough',
  HORIZONTAL_RULE: '+insertHorizontalRule',
  SUBSCRIPT: '+subscript',
  SUPERSCRIPT: '+superscript',
  UNDERLINE: '+underline',
  UNLINK: '+unlink',
  BOLD: '+bold',
  ITALIC: '+italic',
  FONT_SIZE: '+fontSize',
  FONT_FACE: '+fontName',
  FONT_COLOR: '+foreColor',
  EMOTICON: '+emoticon',
  BACKGROUND_COLOR: '+backColor',
  ORDERED_LIST: '+insertOrderedList',
  UNORDERED_LIST: '+insertUnorderedList',
  TABLE: '+table',
  JUSTIFY_CENTER: '+justifyCenter',
  JUSTIFY_FULL: '+justifyFull',
  JUSTIFY_RIGHT: '+justifyRight',
  JUSTIFY_LEFT: '+justifyLeft',
  BLOCKQUOTE: '+BLOCKQUOTE', // This is a nodename. Should be all caps.
  DIR_LTR: 'ltr', // should be exactly 'ltr' as it becomes dir attribute value
  DIR_RTL: 'rtl', // same here
  IMAGE: 'image',
  EDIT_HTML: 'editHtml',

  // queryCommandValue only: returns the default tag name used in the field.
  // DIV should be considered the default if no plugin responds.
  DEFAULT_TAG: '+defaultTag',

  // TODO: Try to give clients an API so that they don't need
  // these execCommands.
  CLEAR_LOREM: 'clearlorem',
  UPDATE_LOREM: 'updatelorem',
  USING_LOREM: 'usinglorem'
};
