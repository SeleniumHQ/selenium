// Copyright 2016 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Contains the attribute whitelists for use in the Html
 * sanitizer.
 */

goog.provide('goog.html.sanitizer.AttributeSanitizedWhitelist');
goog.provide('goog.html.sanitizer.AttributeWhitelist');


/**
 * A whitelist for attributes that are always safe and allowed by default.
 * The sanitizer only applies whitespace trimming to these.
 * @const @dict {boolean}
 */
goog.html.sanitizer.AttributeWhitelist = {
  '* ARIA-CHECKED': true,
  '* ARIA-DESCRIBEDBY': true,
  '* ARIA-DISABLED': true,
  '* ARIA-LABEL': true,
  '* ARIA-LABELLEDBY': true,
  '* ARIA-READONLY': true,
  '* ARIA-REQUIRED': true,
  '* ARIA-SELECTED': true,
  '* ABBR': true,
  '* ACCEPT': true,
  '* ACCESSKEY': true,
  '* ALIGN': true,
  '* ALT': true,
  '* AUTOCOMPLETE': true,
  '* AXIS': true,
  '* BGCOLOR': true,
  '* BORDER': true,
  '* CELLPADDING': true,
  '* CELLSPACING': true,
  '* CHAROFF': true,
  '* CHAR': true,
  '* CHECKED': true,
  '* CLEAR': true,
  '* COLOR': true,
  '* COLSPAN': true,
  '* COLS': true,
  '* COMPACT': true,
  '* COORDS': true,
  '* DATETIME': true,
  '* DIR': true,
  '* DISABLED': true,
  '* ENCTYPE': true,
  '* FACE': true,
  '* FRAME': true,
  '* HEIGHT': true,
  '* HREFLANG': true,
  '* HSPACE': true,
  '* ISMAP': true,
  '* LABEL': true,
  '* LANG': true,
  '* MAXLENGTH': true,
  '* METHOD': true,
  '* MULTIPLE': true,
  '* NOHREF': true,
  '* NOSHADE': true,
  '* NOWRAP': true,
  '* READONLY': true,
  '* REL': true,
  '* REV': true,
  '* ROWSPAN': true,
  '* ROWS': true,
  '* RULES': true,
  '* SCOPE': true,
  '* SELECTED': true,
  '* SHAPE': true,
  '* SIZE': true,
  '* SPAN': true,
  '* START': true,
  '* SUMMARY': true,
  '* TABINDEX': true,
  '* TITLE': true,
  '* TYPE': true,
  '* VALIGN': true,
  '* VALUE': true,
  '* VSPACE': true,
  '* WIDTH': true
};

/**
 * A whitelist for attributes that are not safe to allow unrestricted, but are
 * made safe by default policies installed by the sanitizer in
 * goog.html.sanitizer.HtmlSanitizer.Builder.prototype.build, and thus allowed
 * by default under these policies.
 * @const @dict {boolean}
 */
goog.html.sanitizer.AttributeSanitizedWhitelist = {

  // Attributes which can contain URL fragments
  '* USEMAP': true,
  // Attributes which can contain URLs
  '* ACTION': true,
  '* CITE': true,
  '* HREF': true,
  // Attributes which can cause network requests
  '* LONGDESC': true,
  '* SRC': true,
  'LINK HREF': true,
  // Prevents clobbering
  '* FOR': true,
  '* HEADERS': true,
  '* NAME': true,
  // Controls where a window is opened. Prevents tab-nabbing
  'A TARGET': true,

  // Attributes which could cause UI redressing.
  '* CLASS': true,
  '* ID': true,

  // CSS style can cause network requests and XSSs
  '* STYLE': true
};
