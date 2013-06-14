// Copyright 2005 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Trogedit constants for browser features and quirks that should
 * be used by the rich text editor.
 */

goog.provide('goog.editor.BrowserFeature');

goog.require('goog.editor.defines');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');
goog.require('goog.userAgent.product.isVersion');


/**
 * Maps browser quirks to boolean values, detailing what the current
 * browser supports.
 * @type {Object}
 */
goog.editor.BrowserFeature = {
  // Whether this browser uses the IE TextRange object.
  HAS_IE_RANGES: goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9),

  // Whether this browser uses the W3C standard Range object.
  // Assumes IE higher versions will be compliance with W3C standard.
  HAS_W3C_RANGES: goog.userAgent.GECKO || goog.userAgent.WEBKIT ||
      goog.userAgent.OPERA ||
      (goog.userAgent.IE && goog.userAgent.isDocumentModeOrHigher(9)),

  // Has the contentEditable attribute, which makes nodes editable.
  //
  // NOTE(nicksantos): FF3 has contentEditable, but there are 3 major reasons
  // why we don't use it:
  // 1) In FF3, we listen for key events on the document, and we'd have to
  //    filter them properly. See TR_Browser.USE_DOCUMENT_FOR_KEY_EVENTS.
  // 2) In FF3, we listen for focus/blur events on the document, which
  //    simply doesn't make sense in contentEditable. focus/blur
  //    on contentEditable elements still has some quirks, which we're
  //    talking to Firefox-team about.
  // 3) We currently use Mutation events in FF3 to detect changes,
  //    and these are dispatched on the document only.
  // If we ever hope to support FF3/contentEditable, all 3 of these issues
  // will need answers. Most just involve refactoring at our end.
  HAS_CONTENT_EDITABLE: goog.userAgent.IE || goog.userAgent.WEBKIT ||
      goog.userAgent.OPERA ||
      (goog.editor.defines.USE_CONTENTEDITABLE_IN_FIREFOX_3 &&
       goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher('1.9')),

  // Whether to use mutation event types to detect changes
  // in the field contents.
  USE_MUTATION_EVENTS: goog.userAgent.GECKO,

  // Whether the browser has a functional DOMSubtreeModified event.
  // TODO(user): Enable for all FF3 once we're confident this event fires
  // reliably. Currently it's only enabled if using contentEditable in FF as
  // we have no other choice in that case but to use this event.
  HAS_DOM_SUBTREE_MODIFIED_EVENT: goog.userAgent.WEBKIT ||
      (goog.editor.defines.USE_CONTENTEDITABLE_IN_FIREFOX_3 &&
       goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher('1.9')),

  // Whether nodes can be copied from one document to another
  HAS_DOCUMENT_INDEPENDENT_NODES: goog.userAgent.GECKO,

  // Whether the cursor goes before or inside the first block element on
  // focus, e.g., <body><p>foo</p></body>. FF will put the cursor before the
  // paragraph on focus, which is wrong.
  PUTS_CURSOR_BEFORE_FIRST_BLOCK_ELEMENT_ON_FOCUS: goog.userAgent.GECKO,

  // Whether the selection of one frame is cleared when another frame
  // is focused.
  CLEARS_SELECTION_WHEN_FOCUS_LEAVES:
      goog.userAgent.IE || goog.userAgent.WEBKIT || goog.userAgent.OPERA,

  // Whether "unselectable" is supported as an element style.
  HAS_UNSELECTABLE_STYLE: goog.userAgent.GECKO || goog.userAgent.WEBKIT,

  // Whether this browser's "FormatBlock" command does not suck.
  FORMAT_BLOCK_WORKS_FOR_BLOCKQUOTES: goog.userAgent.GECKO ||
      goog.userAgent.WEBKIT || goog.userAgent.OPERA,

  // Whether this browser's "FormatBlock" command may create multiple
  // blockquotes.
  CREATES_MULTIPLE_BLOCKQUOTES:
      (goog.userAgent.WEBKIT &&
       !goog.userAgent.isVersionOrHigher('534.16')) ||
      goog.userAgent.OPERA,

  // Whether this browser's "FormatBlock" command will wrap blockquotes
  // inside of divs, instead of replacing divs with blockquotes.
  WRAPS_BLOCKQUOTE_IN_DIVS: goog.userAgent.OPERA,

  // Whether the readystatechange event is more reliable than load.
  PREFERS_READY_STATE_CHANGE_EVENT: goog.userAgent.IE,

  // Whether hitting the tab key will fire a keypress event.
  // see http://www.quirksmode.org/js/keys.html
  TAB_FIRES_KEYPRESS: !goog.userAgent.IE,

  // Has a standards mode quirk where width=100% doesn't do the right thing,
  // but width=99% does.
  // TODO(user|user): This should be fixable by less hacky means
  NEEDS_99_WIDTH_IN_STANDARDS_MODE: goog.userAgent.IE,

  // Whether keyboard events only reliably fire on the document.
  // On Gecko without contentEditable, keyboard events only fire reliably on the
  // document element. With contentEditable, the field itself is focusable,
  // which means that it will fire key events. This does not apply if
  // application is using ContentEditableField or otherwise overriding Field
  // not to use an iframe.
  USE_DOCUMENT_FOR_KEY_EVENTS: goog.userAgent.GECKO &&
      !goog.editor.defines.USE_CONTENTEDITABLE_IN_FIREFOX_3,

  // Whether this browser shows non-standard attributes in innerHTML.
  SHOWS_CUSTOM_ATTRS_IN_INNER_HTML: goog.userAgent.IE,

  // Whether this browser shrinks empty nodes away to nothing.
  // (If so, we need to insert some space characters into nodes that
  //  shouldn't be collapsed)
  COLLAPSES_EMPTY_NODES:
      goog.userAgent.GECKO || goog.userAgent.WEBKIT || goog.userAgent.OPERA,

  // Whether we must convert <strong> and <em> tags to <b>, <i>.
  CONVERT_TO_B_AND_I_TAGS: goog.userAgent.GECKO || goog.userAgent.OPERA,

  // Whether this browser likes to tab through images in contentEditable mode,
  // and we like to disable this feature.
  TABS_THROUGH_IMAGES: goog.userAgent.IE,

  // Whether this browser unescapes urls when you extract it from the href tag.
  UNESCAPES_URLS_WITHOUT_ASKING: goog.userAgent.IE &&
      !goog.userAgent.isVersionOrHigher('7.0'),

  // Whether this browser supports execCommand("styleWithCSS") to toggle between
  // inserting html tags or inline styling for things like bold, italic, etc.
  HAS_STYLE_WITH_CSS:
      goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher('1.8') ||
      goog.userAgent.WEBKIT || goog.userAgent.OPERA,

  // Whether clicking on an editable link will take you to that site.
  FOLLOWS_EDITABLE_LINKS: goog.userAgent.WEBKIT ||
      goog.userAgent.IE && goog.userAgent.isVersionOrHigher('9'),

  // Whether this browser has document.activeElement available.
  HAS_ACTIVE_ELEMENT:
      goog.userAgent.IE || goog.userAgent.OPERA ||
      goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher('1.9'),

  // Whether this browser supports the setCapture method on DOM elements.
  HAS_SET_CAPTURE: goog.userAgent.IE,

  // Whether this browser can't set background color when the selection
  // is collapsed.
  EATS_EMPTY_BACKGROUND_COLOR: goog.userAgent.GECKO ||
      goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('527'),

  // Whether this browser supports the "focusin" or "DOMFocusIn" event
  // consistently.
  // NOTE(nicksantos): FF supports DOMFocusIn, but doesn't seem to do so
  // consistently.
  SUPPORTS_FOCUSIN: goog.userAgent.IE || goog.userAgent.OPERA,

  // Whether clicking on an image will cause the selection to move to the image.
  // Note: Gecko moves the selection, but it won't always go to the image.
  // For example, if the image is wrapped in a div, and you click on the img,
  // anchorNode = focusNode = div, anchorOffset = 0, focusOffset = 1, so this
  // is another way of "selecting" the image, but there are too many special
  // cases like this so we will do the work manually.
  SELECTS_IMAGES_ON_CLICK: goog.userAgent.IE || goog.userAgent.OPERA,

  // Whether this browser moves <style> tags into new <head> elements.
  MOVES_STYLE_TO_HEAD: goog.userAgent.WEBKIT,

  // Whether this browser collapses the selection in a contenteditable when the
  // mouse is pressed in a non-editable portion of the same frame, even if
  // Event.preventDefault is called. This field is deprecated and unused -- only
  // old versions of Opera have this bug.
  COLLAPSES_SELECTION_ONMOUSEDOWN: false,

  // Whether the user can actually create a selection in this browser with the
  // caret in the MIDDLE of the selection by double-clicking.
  CARET_INSIDE_SELECTION: goog.userAgent.OPERA,

  // Whether the browser focuses <body contenteditable> automatically when
  // the user clicks on <html>. This field is deprecated and unused -- only old
  // versions of Opera don't have this behavior.
  FOCUSES_EDITABLE_BODY_ON_HTML_CLICK: true,

  // Whether to use keydown for key listening (uses keypress otherwise). Taken
  // from goog.events.KeyHandler.
  USES_KEYDOWN: goog.userAgent.IE ||
      goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher('525'),

  // Whether this browser converts spaces to non-breaking spaces when calling
  // execCommand's RemoveFormat.
  // See: https://bugs.webkit.org/show_bug.cgi?id=14062
  ADDS_NBSPS_IN_REMOVE_FORMAT:
      goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('531'),

  // Whether the browser will get stuck inside a link.  That is, if your cursor
  // is after a link and you type, does your text go inside the link tag.
  // Bug: http://bugs.webkit.org/show_bug.cgi?id=17697
  GETS_STUCK_IN_LINKS:
      goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('528'),

  // Whether the browser corrupts empty text nodes in Node#normalize,
  // removing them from the Document instead of merging them.
  NORMALIZE_CORRUPTS_EMPTY_TEXT_NODES: goog.userAgent.GECKO &&
      goog.userAgent.isVersionOrHigher('1.9') || goog.userAgent.IE ||
      goog.userAgent.OPERA ||
      goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher('531'),

  // Whether the browser corrupts all text nodes in Node#normalize,
  // removing them from the Document instead of merging them.
  NORMALIZE_CORRUPTS_ALL_TEXT_NODES: goog.userAgent.IE,

  // Browsers where executing subscript then superscript (or vv) will cause both
  // to be applied in a nested fashion instead of the first being overwritten by
  // the second.
  NESTS_SUBSCRIPT_SUPERSCRIPT: goog.userAgent.IE || goog.userAgent.GECKO ||
      goog.userAgent.OPERA,

  // Whether this browser can place a cursor in an empty element natively.
  CAN_SELECT_EMPTY_ELEMENT: !goog.userAgent.IE && !goog.userAgent.WEBKIT,

  FORGETS_FORMATTING_WHEN_LISTIFYING: goog.userAgent.GECKO ||
      goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('526'),

  LEAVES_P_WHEN_REMOVING_LISTS: goog.userAgent.IE || goog.userAgent.OPERA,

  CAN_LISTIFY_BR: !goog.userAgent.IE && !goog.userAgent.OPERA,

  // See bug 1286408. When somewhere inside your selection there is an element
  // with a style attribute that sets the font size, if you change the font
  // size, the browser creates a font tag, but the font size in the style attr
  // overrides the font tag. Only webkit removes that font size from the style
  // attr.
  DOESNT_OVERRIDE_FONT_SIZE_IN_STYLE_ATTR: !goog.userAgent.WEBKIT,

  // Implements this spec about dragging files from the filesystem to the
  // browser: http://www.whatwg/org/specs/web-apps/current-work/#dnd
  SUPPORTS_HTML5_FILE_DRAGGING: (goog.userAgent.product.CHROME &&
                                 goog.userAgent.product.isVersion('4')) ||
      (goog.userAgent.product.SAFARI &&
       goog.userAgent.isVersionOrHigher('533')) ||
      (goog.userAgent.GECKO &&
       goog.userAgent.isVersionOrHigher('2.0')) ||
      (goog.userAgent.IE &&
       goog.userAgent.isVersionOrHigher('10')),

  // Version of Opera that supports the opera-defaultBlock execCommand to change
  // the default block inserted when [return] is pressed. Note that this only is
  // used if the caret is not already in a block that can be repeated.
  // TODO(user): Link to public documentation of this feature if Opera puts
  // something up about it.
  SUPPORTS_OPERA_DEFAULTBLOCK_COMMAND:
      goog.userAgent.OPERA && goog.userAgent.isVersionOrHigher('11.10'),

  SUPPORTS_FILE_PASTING: goog.userAgent.product.CHROME &&
      goog.userAgent.product.isVersion('12')
};
