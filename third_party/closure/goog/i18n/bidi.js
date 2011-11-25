// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utility functions for supporting Bidi issues.
 */


/**
 * Namespace for bidi supporting functions.
 */
goog.provide('goog.i18n.bidi');


/**
 * @define {boolean} FORCE_RTL forces the {@link goog.i18n.bidi.IS_RTL} constant
 * to say that the current locale is a RTL locale.  This should only be used
 * if you want to override the default behavior for deciding whether the
 * current locale is RTL or not.
 *
 * {@see goog.i18n.bidi.IS_RTL}
 */
goog.i18n.bidi.FORCE_RTL = false;


/**
 * Constant that defines whether or not the current locale is a RTL locale.
 * If {@link goog.i18n.bidi.FORCE_RTL} is not true, this constant will default
 * to check that {@link goog.LOCALE} is one of a few major RTL locales.
 *
 * <p>Since this constant refers to the directionality of the locale, it is up
 * to the caller to determine if this constant should also be used for the
 * direction of the UI.
 *
 * {@see goog.LOCALE}
 *
 * @type {boolean}
 *
 * TODO(user): write a test that checks that this is a compile-time constant.
 * For example, for the default goog.LOCALE, compiling
 * "if (goog.i18n.bidi.IS_RTL) alert('rtl') else {}" should produce no code.
 */
goog.i18n.bidi.IS_RTL = goog.i18n.bidi.FORCE_RTL ||
    (goog.LOCALE.substring(0, 2).toLowerCase() == 'ar' ||
     goog.LOCALE.substring(0, 2).toLowerCase() == 'fa' ||
     goog.LOCALE.substring(0, 2).toLowerCase() == 'he' ||
     goog.LOCALE.substring(0, 2).toLowerCase() == 'iw' ||
     goog.LOCALE.substring(0, 2).toLowerCase() == 'ur' ||
     goog.LOCALE.substring(0, 2).toLowerCase() == 'yi') &&
    (goog.LOCALE.length == 2 ||
     goog.LOCALE.substring(2, 3) == '-' ||
     goog.LOCALE.substring(2, 3) == '_');


/**
 * Unicode formatting characters and directionality string constants.
 * @enum {string}
 */
goog.i18n.bidi.Format = {
  /** Unicode "Left-To-Right Embedding" (LRE) character. */
  LRE: '\u202A',
  /** Unicode "Right-To-Left Embedding" (RLE) character. */
  RLE: '\u202B',
  /** Unicode "Pop Directional Formatting" (PDF) character. */
  PDF: '\u202C',
  /** Unicode "Left-To-Right Mark" (LRM) character. */
  LRM: '\u200E',
  /** Unicode "Right-To-Left Mark" (RLM) character. */
  RLM: '\u200F'
};


/**
 * Directionality enum.
 * @enum {number}
 */
goog.i18n.bidi.Dir = {
  RTL: -1,
  UNKNOWN: 0,
  LTR: 1
};


/**
 * 'right' string constant.
 * @type {string}
 */
goog.i18n.bidi.RIGHT = 'right';


/**
 * 'left' string constant.
 * @type {string}
 */
goog.i18n.bidi.LEFT = 'left';


/**
 * 'left' if locale is RTL, 'right' if not.
 * @type {string}
 */
goog.i18n.bidi.I18N_RIGHT = goog.i18n.bidi.IS_RTL ? goog.i18n.bidi.LEFT :
    goog.i18n.bidi.RIGHT;


/**
 * 'right' if locale is RTL, 'left' if not.
 * @type {string}
 */
goog.i18n.bidi.I18N_LEFT = goog.i18n.bidi.IS_RTL ? goog.i18n.bidi.RIGHT :
    goog.i18n.bidi.LEFT;


/**
 * Convert a directionality given in various formats to a goog.i18n.bidi.Dir
 * constant. Useful for interaction with different standards of directionality
 * representation.
 *
 * @param {goog.i18n.bidi.Dir|number|boolean} givenDir Directionality given in
 *     one of the following formats:
 *     1. A goog.i18n.bidi.Dir constant.
 *     2. A number (positive = LRT, negative = RTL, 0 = unknown).
 *     3. A boolean (true = RTL, false = LTR).
 * @return {goog.i18n.bidi.Dir} A goog.i18n.bidi.Dir constant matching the given
 *     directionality.
 */
goog.i18n.bidi.toDir = function(givenDir) {
  if (typeof givenDir == 'number') {
    return givenDir > 0 ? goog.i18n.bidi.Dir.LTR :
        givenDir < 0 ? goog.i18n.bidi.Dir.RTL : goog.i18n.bidi.Dir.UNKNOWN;
  } else {
    return givenDir ? goog.i18n.bidi.Dir.RTL : goog.i18n.bidi.Dir.LTR;
  }
};


/**
 * A practical pattern to identify strong LTR characters. This pattern is not
 * theoretically correct according to the Unicode standard. It is simplified for
 * performance and small code size.
 * @type {string}
 * @private
 */
goog.i18n.bidi.ltrChars_ =
    'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' +
    '\u2C00-\uFB1C\uFE00-\uFE6F\uFEFD-\uFFFF';


/**
 * A practical pattern to identify strong RTL character. This pattern is not
 * theoretically correct according to the Unicode standard. It is simplified
 * for performance and small code size.
 * @type {string}
 * @private
 */
goog.i18n.bidi.rtlChars_ = '\u0591-\u07FF\uFB1D-\uFDFF\uFE70-\uFEFC';


/**
 * Simplified regular expression for an HTML tag (opening or closing) or an HTML
 * escape. We might want to skip over such expressions when estimating the text
 * directionality.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.htmlSkipReg_ = /<[^>]*>|&[^;]+;/g;


/**
 * Returns the input text with spaces instead of HTML tags or HTML escapes, if
 * opt_isStripNeeded is true. Else returns the input as is.
 * Useful for text directionality estimation.
 * Note: the function should not be used in other contexts; it is not 100%
 * correct, but rather a good-enough implementation for directionality
 * estimation purposes.
 * @param {string} str The given string.
 * @param {boolean=} opt_isStripNeeded Whether to perform the stripping.
 *     Default: false (to retain consistency with calling functions).
 * @return {string} The given string cleaned of HTML tags / escapes.
 * @private
 */
goog.i18n.bidi.stripHtmlIfNeeded_ = function(str, opt_isStripNeeded) {
  return opt_isStripNeeded ? str.replace(goog.i18n.bidi.htmlSkipReg_, ' ') :
      str;
};


/**
 * Regular expression to check for RTL characters.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rtlCharReg_ = new RegExp('[' + goog.i18n.bidi.rtlChars_ + ']');


/**
 * Regular expression to check for LTR characters.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.ltrCharReg_ = new RegExp('[' + goog.i18n.bidi.ltrChars_ + ']');


/**
 * Test whether the given string has any RTL characters in it.
 * @param {string} str The given string that need to be tested.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether the string contains RTL characters.
 */
goog.i18n.bidi.hasAnyRtl = function(str, opt_isHtml) {
  return goog.i18n.bidi.rtlCharReg_.test(goog.i18n.bidi.stripHtmlIfNeeded_(
      str, opt_isHtml));
};


/**
 * Test whether the given string has any RTL characters in it.
 * @param {string} str The given string that need to be tested.
 * @return {boolean} Whether the string contains RTL characters.
 * @deprecated Use hasAnyRtl.
 */
goog.i18n.bidi.hasRtlChar = goog.i18n.bidi.hasAnyRtl;


/**
 * Test whether the given string has any LTR characters in it.
 * @param {string} str The given string that need to be tested.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether the string contains LTR characters.
 */
goog.i18n.bidi.hasAnyLtr = function(str, opt_isHtml) {
  return goog.i18n.bidi.ltrCharReg_.test(goog.i18n.bidi.stripHtmlIfNeeded_(
      str, opt_isHtml));
};


/**
 * Regular expression pattern to check if the first character in the string
 * is LTR.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.ltrRe_ = new RegExp('^[' + goog.i18n.bidi.ltrChars_ + ']');


/**
 * Regular expression pattern to check if the first character in the string
 * is RTL.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rtlRe_ = new RegExp('^[' + goog.i18n.bidi.rtlChars_ + ']');


/**
 * Check if the first character in the string is RTL or not.
 * @param {string} str The given string that need to be tested.
 * @return {boolean} Whether the first character in str is an RTL char.
 */
goog.i18n.bidi.isRtlChar = function(str) {
  return goog.i18n.bidi.rtlRe_.test(str);
};


/**
 * Check if the first character in the string is LTR or not.
 * @param {string} str The given string that need to be tested.
 * @return {boolean} Whether the first character in str is an LTR char.
 */
goog.i18n.bidi.isLtrChar = function(str) {
  return goog.i18n.bidi.ltrRe_.test(str);
};


/**
 * Check if the first character in the string is neutral or not.
 * @param {string} str The given string that need to be tested.
 * @return {boolean} Whether the first character in str is a neutral char.
 */
goog.i18n.bidi.isNeutralChar = function(str) {
  return !goog.i18n.bidi.isLtrChar(str) && !goog.i18n.bidi.isRtlChar(str);
};


/**
 * Regular expressions to check if a piece of text if of LTR directionality
 * on first character with strong directionality.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.ltrDirCheckRe_ = new RegExp(
    '^[^' + goog.i18n.bidi.rtlChars_ + ']*[' + goog.i18n.bidi.ltrChars_ + ']');


/**
 * Regular expressions to check if a piece of text if of RTL directionality
 * on first character with strong directionality.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rtlDirCheckRe_ = new RegExp(
    '^[^' + goog.i18n.bidi.ltrChars_ + ']*[' + goog.i18n.bidi.rtlChars_ + ']');


/**
 * Check whether the first strongly directional character (if any) is RTL.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether RTL directionality is detected using the first
 *     strongly-directional character method.
 */
goog.i18n.bidi.startsWithRtl = function(str, opt_isHtml) {
  return goog.i18n.bidi.rtlDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(
      str, opt_isHtml));
};


/**
 * Check whether the first strongly directional character (if any) is RTL.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether RTL directionality is detected using the first
 *     strongly-directional character method.
 * @deprecated Use startsWithRtl.
 */
goog.i18n.bidi.isRtlText = goog.i18n.bidi.startsWithRtl;


/**
 * Check whether the first strongly directional character (if any) is LTR.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether LTR directionality is detected using the first
 *     strongly-directional character method.
 */
goog.i18n.bidi.startsWithLtr = function(str, opt_isHtml) {
  return goog.i18n.bidi.ltrDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(
      str, opt_isHtml));
};


/**
 * Check whether the first strongly directional character (if any) is LTR.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether LTR directionality is detected using the first
 *     strongly-directional character method.
 * @deprecated Use startsWithLtr.
 */
goog.i18n.bidi.isLtrText = goog.i18n.bidi.startsWithLtr;


/**
 * Regular expression to check if a string looks like something that must
 * always be LTR even in RTL text, e.g. a URL. When estimating the
 * directionality of text containing these, we treat these as weakly LTR,
 * like numbers.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.isRequiredLtrRe_ = /^http:\/\/.*/;


/**
 * Check whether the input string either contains no strongly directional
 * characters or looks like a url.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether neutral directionality is detected.
 */
goog.i18n.bidi.isNeutralText = function(str, opt_isHtml) {
  str = goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml);
  return goog.i18n.bidi.isRequiredLtrRe_.test(str) ||
      !goog.i18n.bidi.hasAnyLtr(str) && !goog.i18n.bidi.hasAnyRtl(str);
};


/**
 * Regular expressions to check if the last strongly-directional character in a
 * piece of text is LTR.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.ltrExitDirCheckRe_ = new RegExp(
    '[' + goog.i18n.bidi.ltrChars_ + '][^' + goog.i18n.bidi.rtlChars_ + ']*$');


/**
 * Regular expressions to check if the last strongly-directional character in a
 * piece of text is RTL.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rtlExitDirCheckRe_ = new RegExp(
    '[' + goog.i18n.bidi.rtlChars_ + '][^' + goog.i18n.bidi.ltrChars_ + ']*$');


/**
 * Check if the exit directionality a piece of text is LTR, i.e. if the last
 * strongly-directional character in the string is LTR.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether LTR exit directionality was detected.
 */
goog.i18n.bidi.endsWithLtr = function(str, opt_isHtml) {
  return goog.i18n.bidi.ltrExitDirCheckRe_.test(
      goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};


/**
 * Check if the exit directionality a piece of text is LTR, i.e. if the last
 * strongly-directional character in the string is LTR.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether LTR exit directionality was detected.
 * @deprecated Use endsWithLtr.
 */
goog.i18n.bidi.isLtrExitText = goog.i18n.bidi.endsWithLtr;


/**
 * Check if the exit directionality a piece of text is RTL, i.e. if the last
 * strongly-directional character in the string is RTL.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether RTL exit directionality was detected.
 */
goog.i18n.bidi.endsWithRtl = function(str, opt_isHtml) {
  return goog.i18n.bidi.rtlExitDirCheckRe_.test(
      goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};


/**
 * Check if the exit directionality a piece of text is RTL, i.e. if the last
 * strongly-directional character in the string is RTL.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether RTL exit directionality was detected.
 * @deprecated Use endsWithRtl.
 */
goog.i18n.bidi.isRtlExitText = goog.i18n.bidi.endsWithRtl;


/**
 * A regular expression for matching right-to-left language codes.
 * See {@link #isRtlLanguage} for the design.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rtlLocalesRe_ = new RegExp(
    '^(ar|dv|he|iw|fa|nqo|ps|sd|ug|ur|yi|.*[-_](Arab|Hebr|Thaa|Nkoo|Tfng))' +
    '(?!.*[-_](Latn|Cyrl)($|-|_))($|-|_)');


/**
 * Check if a BCP 47 / III language code indicates an RTL language, i.e. either:
 * - a language code explicitly specifying one of the right-to-left scripts,
 *   e.g. "az-Arab", or<p>
 * - a language code specifying one of the languages normally written in a
 *   right-to-left script, e.g. "fa" (Farsi), except ones explicitly specifying
 *   Latin or Cyrillic script (which are the usual LTR alternatives).<p>
 * The list of right-to-left scripts appears in the 100-199 range in
 * http://www.unicode.org/iso15924/iso15924-num.html, of which Arabic and
 * Hebrew are by far the most widely used. We also recognize Thaana, N'Ko, and
 * Tifinagh, which also have significant modern usage. The rest (Syriac,
 * Samaritan, Mandaic, etc.) seem to have extremely limited or no modern usage
 * and are not recognized to save on code size.
 * The languages usually written in a right-to-left script are taken as those
 * with Suppress-Script: Hebr|Arab|Thaa|Nkoo|Tfng  in
 * http://www.iana.org/assignments/language-subtag-registry,
 * as well as Sindhi (sd) and Uyghur (ug).
 * Other subtags of the language code, e.g. regions like EG (Egypt), are
 * ignored.
 * @param {string} lang BCP 47 (a.k.a III) language code.
 * @return {boolean} Whether the language code is an RTL language.
 */
goog.i18n.bidi.isRtlLanguage = function(lang) {
  return goog.i18n.bidi.rtlLocalesRe_.test(lang);
};


/**
 * Regular expression for bracket guard replacement in html.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.bracketGuardHtmlRe_ =
    /(\(.*?\)+)|(\[.*?\]+)|(\{.*?\}+)|(&lt;.*?(&gt;)+)/g;


/**
 * Regular expression for bracket guard replacement in text.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.bracketGuardTextRe_ =
    /(\(.*?\)+)|(\[.*?\]+)|(\{.*?\}+)|(<.*?>+)/g;


/**
 * Apply bracket guard using html span tag. This is to address the problem of
 * messy bracket display frequently happens in RTL layout.
 * @param {string} s The string that need to be processed.
 * @param {boolean=} opt_isRtlContext specifies default direction (usually
 *     direction of the UI).
 * @return {string} The processed string, with all bracket guarded.
 */
goog.i18n.bidi.guardBracketInHtml = function(s, opt_isRtlContext) {
  var useRtl = opt_isRtlContext === undefined ?
      goog.i18n.bidi.hasAnyRtl(s) : opt_isRtlContext;
  if (useRtl) {
    return s.replace(goog.i18n.bidi.bracketGuardHtmlRe_,
        '<span dir=rtl>$&</span>');
  }
  return s.replace(goog.i18n.bidi.bracketGuardHtmlRe_,
      '<span dir=ltr>$&</span>');
};


/**
 * Apply bracket guard using LRM and RLM. This is to address the problem of
 * messy bracket display frequently happens in RTL layout.
 * This version works for both plain text and html. But it does not work as
 * good as guardBracketInHtml in some cases.
 * @param {string} s The string that need to be processed.
 * @param {boolean=} opt_isRtlContext specifies default direction (usually
 *     direction of the UI).
 * @return {string} The processed string, with all bracket guarded.
 */
goog.i18n.bidi.guardBracketInText = function(s, opt_isRtlContext) {
  var useRtl = opt_isRtlContext === undefined ?
      goog.i18n.bidi.hasAnyRtl(s) : opt_isRtlContext;
  var mark = useRtl ? goog.i18n.bidi.Format.RLM : goog.i18n.bidi.Format.LRM;
  return s.replace(goog.i18n.bidi.bracketGuardTextRe_, mark + '$&' + mark);
};


/**
 * Enforce the html snippet in RTL directionality regardless overall context.
 * If the html piece was enclosed by tag, dir will be applied to existing
 * tag, otherwise a span tag will be added as wrapper. For this reason, if
 * html snippet start with with tag, this tag must enclose the whole piece. If
 * the tag already has a dir specified, this new one will override existing
 * one in behavior (tested on FF and IE).
 * @param {string} html The string that need to be processed.
 * @return {string} The processed string, with directionality enforced to RTL.
 */
goog.i18n.bidi.enforceRtlInHtml = function(html) {
  if (html.charAt(0) == '<') {
    return html.replace(/<\w+/, '$& dir=rtl');
  }
  // '\n' is important for FF so that it won't incorrectly merge span groups
  return '\n<span dir=rtl>' + html + '</span>';
};


/**
 * Enforce RTL on both end of the given text piece using unicode BiDi formatting
 * characters RLE and PDF.
 * @param {string} text The piece of text that need to be wrapped.
 * @return {string} The wrapped string after process.
 */
goog.i18n.bidi.enforceRtlInText = function(text) {
  return goog.i18n.bidi.Format.RLE + text + goog.i18n.bidi.Format.PDF;
};


/**
 * Enforce the html snippet in RTL directionality regardless overall context.
 * If the html piece was enclosed by tag, dir will be applied to existing
 * tag, otherwise a span tag will be added as wrapper. For this reason, if
 * html snippet start with with tag, this tag must enclose the whole piece. If
 * the tag already has a dir specified, this new one will override existing
 * one in behavior (tested on FF and IE).
 * @param {string} html The string that need to be processed.
 * @return {string} The processed string, with directionality enforced to RTL.
 */
goog.i18n.bidi.enforceLtrInHtml = function(html) {
  if (html.charAt(0) == '<') {
    return html.replace(/<\w+/, '$& dir=ltr');
  }
  // '\n' is important for FF so that it won't incorrectly merge span groups
  return '\n<span dir=ltr>' + html + '</span>';
};


/**
 * Enforce LTR on both end of the given text piece using unicode BiDi formatting
 * characters LRE and PDF.
 * @param {string} text The piece of text that need to be wrapped.
 * @return {string} The wrapped string after process.
 */
goog.i18n.bidi.enforceLtrInText = function(text) {
  return goog.i18n.bidi.Format.LRE + text + goog.i18n.bidi.Format.PDF;
};


/**
 * Regular expression to find dimensions such as "padding: .3 0.4ex 5px 6;"
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.dimensionsRe_ =
     /:\s*([.\d][.\w]*)\s+([.\d][.\w]*)\s+([.\d][.\w]*)\s+([.\d][.\w]*)/g;


/**
 * Regular expression for left.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.leftRe_ = /left/gi;


/**
 * Regular expression for right.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rightRe_ = /right/gi;


/**
 * Placeholder regular expression for swapping.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.tempRe_ = /%%%%/g;


/**
 * Swap location parameters and 'left'/'right' in CSS specification. The
 * processed string will be suited for RTL layout. Though this function can
 * cover most cases, there are always exceptions. It is suggested to put
 * those exceptions in separate group of CSS string.
 * @param {string} cssStr CSS spefication string.
 * @return {string} Processed CSS specification string.
 */
goog.i18n.bidi.mirrorCSS = function(cssStr) {
  return cssStr.
    // reverse dimensions
    replace(goog.i18n.bidi.dimensionsRe_, ':$1 $4 $3 $2').
    replace(goog.i18n.bidi.leftRe_, '%%%%').          // swap left and right
    replace(goog.i18n.bidi.rightRe_, goog.i18n.bidi.LEFT).
    replace(goog.i18n.bidi.tempRe_, goog.i18n.bidi.RIGHT);
};


/**
 * Regular expression for hebrew double quote substitution, finding quote
 * directly after hebrew characters.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.doubleQuoteSubstituteRe_ = /([\u0591-\u05f2])"/g;


/**
 * Regular expression for hebrew single quote substitution, finding quote
 * directly after hebrew characters.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.singleQuoteSubstituteRe_ = /([\u0591-\u05f2])'/g;


/**
 * Replace the double and single quote directly after a Hebrew character with
 * GERESH and GERSHAYIM. In such case, most likely that's user intention.
 * @param {string} str String that need to be processed.
 * @return {string} Processed string with double/single quote replaced.
 */
goog.i18n.bidi.normalizeHebrewQuote = function(str) {
  return str.
    replace(goog.i18n.bidi.doubleQuoteSubstituteRe_, '$1\u05f4').
    replace(goog.i18n.bidi.singleQuoteSubstituteRe_, '$1\u05f3');
};


/**
 * Regular expression to split a string into "words" for directionality
 * estimation based on relative word counts.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.wordSeparatorRe_ = /\s+/;


/**
 * Regular expression to check if a string contains any numerals. Used to
 * differentiate between completely neutral strings and those containing
 * numbers, which are weakly LTR.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.hasNumeralsRe_ = /\d/;


/**
 * This constant controls threshold of RTL directionality.
 * @type {number}
 * @private
 */
goog.i18n.bidi.rtlDetectionThreshold_ = 0.40;


/**
 * Estimates the directionality of a string based on relative word counts.
 * If the number of RTL words is above a certain percentage of the total number
 * of strongly directional words, returns RTL.
 * Otherwise, if any words are strongly or weakly LTR, returns LTR.
 * Otherwise, returns UNKNOWN, which is used to mean "neutral".
 * Numbers are counted as weakly LTR.
 * @param {string} str The string to be checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {goog.i18n.bidi.Dir} Estimated overall directionality of {@code str}.
 */
goog.i18n.bidi.estimateDirection = function(str, opt_isHtml) {
  var rtlCount = 0;
  var totalCount = 0;
  var hasWeaklyLtr = false;
  var tokens = goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml).
      split(goog.i18n.bidi.wordSeparatorRe_);
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    if (goog.i18n.bidi.startsWithRtl(token)) {
      rtlCount++;
      totalCount++;
    } else if (goog.i18n.bidi.isRequiredLtrRe_.test(token)) {
      hasWeaklyLtr = true;
    } else if (goog.i18n.bidi.hasAnyLtr(token)) {
      totalCount++;
    } else if (goog.i18n.bidi.hasNumeralsRe_.test(token)) {
      hasWeaklyLtr = true;
    }
  }

  return totalCount == 0 ?
      (hasWeaklyLtr ? goog.i18n.bidi.Dir.LTR : goog.i18n.bidi.Dir.UNKNOWN) :
      (rtlCount / totalCount > goog.i18n.bidi.rtlDetectionThreshold_ ?
          goog.i18n.bidi.Dir.RTL : goog.i18n.bidi.Dir.LTR);
};


/**
 * Check the directionality of a piece of text, return true if the piece of
 * text should be laid out in RTL direction.
 * @param {string} str The piece of text that need to be detected.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether this piece of text should be laid out in RTL.
 */
goog.i18n.bidi.detectRtlDirectionality = function(str, opt_isHtml) {
  return goog.i18n.bidi.estimateDirection(str, opt_isHtml) ==
      goog.i18n.bidi.Dir.RTL;
};


/**
 * Sets text input element's directionality and text alignment based on a
 * given directionality.
 * @param {Element} element Input field element to set directionality to.
 * @param {goog.i18n.bidi.Dir|number|boolean} dir Desired directionality, given
 *     in one of the following formats:
 *     1. A goog.i18n.bidi.Dir constant.
 *     2. A number (positive = LRT, negative = RTL, 0 = unknown).
 *     3. A boolean (true = RTL, false = LTR).
 */
goog.i18n.bidi.setElementDirAndAlign = function(element, dir) {
  if (element &&
      (dir = goog.i18n.bidi.toDir(dir)) != goog.i18n.bidi.Dir.UNKNOWN) {
    element.style.textAlign = dir == goog.i18n.bidi.Dir.RTL ? 'right' : 'left';
    element.dir = dir == goog.i18n.bidi.Dir.RTL ? 'rtl' : 'ltr';
  }
};
