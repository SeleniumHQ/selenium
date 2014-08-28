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
 * @fileoverview CSS Object Model helper functions.
 * References:
 * - W3C: http://dev.w3.org/csswg/cssom/
 * - MSDN: http://msdn.microsoft.com/en-us/library/ms531209(VS.85).aspx.
 * @supported in FF3, IE6, IE7, Safari 3.1.2, Chrome
 * TODO(user): Fix in Opera.
 * TODO(user): Consider hacking page, media, etc.. to work.
 *     This would be pretty challenging. IE returns the text for any rule
 *     regardless of whether or not the media is correct or not. Firefox at
 *     least supports CSSRule.type to figure out if it's a media type and then
 *     we could do something interesting, but IE offers no way for us to tell.
 */

goog.provide('goog.cssom');
goog.provide('goog.cssom.CssRuleType');

goog.require('goog.array');
goog.require('goog.dom');


/**
 * Enumeration of {@code CSSRule} types.
 * @enum {number}
 */
goog.cssom.CssRuleType = {
  STYLE: 1,
  IMPORT: 3,
  MEDIA: 4,
  FONT_FACE: 5,
  PAGE: 6,
  NAMESPACE: 7
};


/**
 * Recursively gets all CSS as text, optionally starting from a given
 * CSSStyleSheet.
 * @param {(CSSStyleSheet|StyleSheetList)=} opt_styleSheet The CSSStyleSheet.
 * @return {string} css text.
 */
goog.cssom.getAllCssText = function(opt_styleSheet) {
  var styleSheet = opt_styleSheet || document.styleSheets;
  return /** @type {string} */ (goog.cssom.getAllCss_(styleSheet, true));
};


/**
 * Recursively gets all CSSStyleRules, optionally starting from a given
 * CSSStyleSheet.
 * Note that this excludes any CSSImportRules, CSSMediaRules, etc..
 * @param {(CSSStyleSheet|StyleSheetList)=} opt_styleSheet The CSSStyleSheet.
 * @return {Array.<CSSStyleRule>} A list of CSSStyleRules.
 */
goog.cssom.getAllCssStyleRules = function(opt_styleSheet) {
  var styleSheet = opt_styleSheet || document.styleSheets;
  return /** @type {Array.<CSSStyleRule>} */ (
      goog.cssom.getAllCss_(styleSheet, false));
};


/**
 * Returns the CSSRules from a styleSheet.
 * Worth noting here is that IE and FF differ in terms of what they will return.
 * Firefox will return styleSheet.cssRules, which includes ImportRules and
 * anything which implements the CSSRules interface. IE returns simply a list of
 * CSSRules.
 * @param {CSSStyleSheet} styleSheet The CSSStyleSheet.
 * @throws {Error} If we cannot access the rules on a stylesheet object - this
 *     can  happen if a stylesheet object's rules are accessed before the rules
 *     have been downloaded and parsed and are "ready".
 * @return {CSSRuleList} An array of CSSRules or null.
 */
goog.cssom.getCssRulesFromStyleSheet = function(styleSheet) {
  var cssRuleList = null;
  try {
    // Select cssRules unless it isn't present.  For pre-IE9 IE, use the rules
    // collection instead.
    // It's important to be consistent in using only the W3C or IE apis on
    // IE9+ where both are present to ensure that there is no indexing
    // mismatches - the collections are subtly different in what the include or
    // exclude which can lead to one collection being longer than the other
    // depending on the page's construction.
    cssRuleList = styleSheet.cssRules /* W3C */ || styleSheet.rules /* IE */;
  } catch (e) {
    // This can happen if we try to access the CSSOM before it's "ready".
    if (e.code == 15) {
      // Firefox throws an NS_ERROR_DOM_INVALID_ACCESS_ERR error if a stylesheet
      // is read before it has been fully parsed. Let the caller know which
      // stylesheet failed.
      e.styleSheet = styleSheet;
      throw e;
    }
  }
  return cssRuleList;
};


/**
 * Gets all CSSStyleSheet objects starting from some CSSStyleSheet. Note that we
 * want to return the sheets in the order of the cascade, therefore if we
 * encounter an import, we will splice that CSSStyleSheet object in front of
 * the CSSStyleSheet that contains it in the returned array of CSSStyleSheets.
 * @param {(CSSStyleSheet|StyleSheetList)=} opt_styleSheet A CSSStyleSheet.
 * @param {boolean=} opt_includeDisabled If true, includes disabled stylesheets,
 *    defaults to false.
 * @return {!Array.<CSSStyleSheet>} A list of CSSStyleSheet objects.
 */
goog.cssom.getAllCssStyleSheets = function(opt_styleSheet,
    opt_includeDisabled) {
  var styleSheetsOutput = [];
  var styleSheet = opt_styleSheet || document.styleSheets;
  var includeDisabled = goog.isDef(opt_includeDisabled) ? opt_includeDisabled :
      false;

  // Imports need to go first.
  if (styleSheet.imports && styleSheet.imports.length) {
    for (var i = 0, n = styleSheet.imports.length; i < n; i++) {
      goog.array.extend(styleSheetsOutput,
          goog.cssom.getAllCssStyleSheets(styleSheet.imports[i]));
    }

  } else if (styleSheet.length) {
    // In case we get a StyleSheetList object.
    // http://dev.w3.org/csswg/cssom/#the-stylesheetlist
    for (var i = 0, n = styleSheet.length; i < n; i++) {
      goog.array.extend(styleSheetsOutput,
          goog.cssom.getAllCssStyleSheets(styleSheet[i]));
    }
  } else {
    // We need to walk through rules in browsers which implement .cssRules
    // to see if there are styleSheets buried in there.
    // If we have a CSSStyleSheet within CssRules.
    var cssRuleList = goog.cssom.getCssRulesFromStyleSheet(
        /** @type {CSSStyleSheet} */ (styleSheet));
    if (cssRuleList && cssRuleList.length) {
      // Chrome does not evaluate cssRuleList[i] to undefined when i >=n;
      // so we use a (i < n) check instead of cssRuleList[i] in the loop below
      // and in other places where we iterate over a rules list.
      // See issue # 5917 in Chromium.
      for (var i = 0, n = cssRuleList.length, cssRule; i < n; i++) {
        cssRule = cssRuleList[i];
        // There are more stylesheets to get on this object..
        if (cssRule.styleSheet) {
          goog.array.extend(styleSheetsOutput,
              goog.cssom.getAllCssStyleSheets(cssRule.styleSheet));
        }
      }
    }
  }

  // This is a CSSStyleSheet. (IE uses .rules, W3c and Opera cssRules.)
  if ((styleSheet.type || styleSheet.rules || styleSheet.cssRules) &&
      (!styleSheet.disabled || includeDisabled)) {
    styleSheetsOutput.push(styleSheet);
  }

  return styleSheetsOutput;
};


/**
 * Gets the cssText from a CSSRule object cross-browserly.
 * @param {CSSRule} cssRule A CSSRule.
 * @return {string} cssText The text for the rule, including the selector.
 */
goog.cssom.getCssTextFromCssRule = function(cssRule) {
  var cssText = '';

  if (cssRule.cssText) {
    // W3C.
    cssText = cssRule.cssText;
  } else if (cssRule.style && cssRule.style.cssText && cssRule.selectorText) {
    // IE: The spacing here is intended to make the result consistent with
    // FF and Webkit.
    // We also remove the special properties that we may have added in
    // getAllCssStyleRules since IE includes those in the cssText.
    var styleCssText = cssRule.style.cssText.
        replace(/\s*-closure-parent-stylesheet:\s*\[object\];?\s*/gi, '').
        replace(/\s*-closure-rule-index:\s*[\d]+;?\s*/gi, '');
    var thisCssText = cssRule.selectorText + ' { ' + styleCssText + ' }';
    cssText = thisCssText;
  }

  return cssText;
};


/**
 * Get the index of the CSSRule in it's CSSStyleSheet.
 * @param {CSSRule} cssRule A CSSRule.
 * @param {CSSStyleSheet=} opt_parentStyleSheet A reference to the stylesheet
 *     object this cssRule belongs to.
 * @throws {Error} When we cannot get the parentStyleSheet.
 * @return {number} The index of the CSSRule, or -1.
 */
goog.cssom.getCssRuleIndexInParentStyleSheet = function(cssRule,
    opt_parentStyleSheet) {
  // Look for our special style.ruleIndex property from getAllCss.
  if (cssRule.style && cssRule.style['-closure-rule-index']) {
    return cssRule.style['-closure-rule-index'];
  }

  var parentStyleSheet = opt_parentStyleSheet ||
      goog.cssom.getParentStyleSheet(cssRule);

  if (!parentStyleSheet) {
    // We could call getAllCssStyleRules() here to get our special indexes on
    // the style object, but that seems like it could be wasteful.
    throw Error('Cannot find a parentStyleSheet.');
  }

  var cssRuleList = goog.cssom.getCssRulesFromStyleSheet(parentStyleSheet);
  if (cssRuleList && cssRuleList.length) {
    for (var i = 0, n = cssRuleList.length, thisCssRule; i < n; i++) {
      thisCssRule = cssRuleList[i];
      if (thisCssRule == cssRule) {
        return i;
      }
    }
  }
  return -1;
};


/**
 * We do some trickery in getAllCssStyleRules that hacks this in for IE.
 * If the cssRule object isn't coming from a result of that function call, this
 * method will return undefined in IE.
 * @param {CSSRule} cssRule The CSSRule.
 * @return {CSSStyleSheet} A styleSheet object.
 */
goog.cssom.getParentStyleSheet = function(cssRule) {
  return cssRule.parentStyleSheet ||
      cssRule.style &&
      cssRule.style['-closure-parent-stylesheet'];
};


/**
 * Replace a cssRule with some cssText for a new rule.
 * If the cssRule object is not one of objects returned by
 * getAllCssStyleRules, then you'll need to provide both the styleSheet and
 * possibly the index, since we can't infer them from the standard cssRule
 * object in IE. We do some trickery in getAllCssStyleRules to hack this in.
 * @param {CSSRule} cssRule A CSSRule.
 * @param {string} cssText The text for the new CSSRule.
 * @param {CSSStyleSheet=} opt_parentStyleSheet A reference to the stylesheet
 *     object this cssRule belongs to.
 * @param {number=} opt_index The index of the cssRule in its parentStylesheet.
 * @throws {Error} If we cannot find a parentStyleSheet.
 * @throws {Error} If we cannot find a css rule index.
 */
goog.cssom.replaceCssRule = function(cssRule, cssText, opt_parentStyleSheet,
    opt_index) {
  var parentStyleSheet = opt_parentStyleSheet ||
      goog.cssom.getParentStyleSheet(cssRule);
  if (parentStyleSheet) {
    var index = opt_index >= 0 ? opt_index :
        goog.cssom.getCssRuleIndexInParentStyleSheet(cssRule, parentStyleSheet);
    if (index >= 0) {
      goog.cssom.removeCssRule(parentStyleSheet, index);
      goog.cssom.addCssRule(parentStyleSheet, cssText, index);
    } else {
      throw Error('Cannot proceed without the index of the cssRule.');
    }
  } else {
    throw Error('Cannot proceed without the parentStyleSheet.');
  }
};


/**
 * Cross browser function to add a CSSRule into a CSSStyleSheet, optionally
 * at a given index.
 * @param {CSSStyleSheet} cssStyleSheet The CSSRule's parentStyleSheet.
 * @param {string} cssText The text for the new CSSRule.
 * @param {number=} opt_index The index of the cssRule in its parentStylesheet.
 * @throws {Error} If the css rule text appears to be ill-formatted.
 * TODO(bowdidge): Inserting at index 0 fails on Firefox 2 and 3 with an
 *     exception warning "Node cannot be inserted at the specified point in
 *     the hierarchy."
 */
goog.cssom.addCssRule = function(cssStyleSheet, cssText, opt_index) {
  var index = opt_index;
  if (index < 0 || index == undefined) {
    // If no index specified, insert at the end of the current list
    // of rules.
    var rules = goog.cssom.getCssRulesFromStyleSheet(cssStyleSheet);
    index = rules.length;
  }
  if (cssStyleSheet.insertRule) {
    // W3C (including IE9+).
    cssStyleSheet.insertRule(cssText, index);

  } else {
    // IE, pre 9: We have to parse the cssRule text to get the selector
    // separated from the style text.
    // aka Everything that isn't a colon, followed by a colon, then
    // the rest is the style part.
    var matches = /^([^\{]+)\{([^\{]+)\}/.exec(cssText);
    if (matches.length == 3) {
      var selector = matches[1];
      var style = matches[2];
      cssStyleSheet.addRule(selector, style, index);
    } else {
      throw Error('Your CSSRule appears to be ill-formatted.');
    }
  }
};


/**
 * Cross browser function to remove a CSSRule in a CSSStyleSheet at an index.
 * @param {CSSStyleSheet} cssStyleSheet The CSSRule's parentStyleSheet.
 * @param {number} index The CSSRule's index in the parentStyleSheet.
 */
goog.cssom.removeCssRule = function(cssStyleSheet, index) {
  if (cssStyleSheet.deleteRule) {
    // W3C.
    cssStyleSheet.deleteRule(index);

  } else {
    // IE.
    cssStyleSheet.removeRule(index);
  }
};


/**
 * Appends a DOM node to HEAD containing the css text that's passed in.
 * @param {string} cssText CSS to add to the end of the document.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper user for
 *     document interactions.
 * @return {!Element} The newly created STYLE element.
 */
goog.cssom.addCssText = function(cssText, opt_domHelper) {
  var document = opt_domHelper ? opt_domHelper.getDocument() :
      goog.dom.getDocument();
  var cssNode = document.createElement('style');
  cssNode.type = 'text/css';
  var head = document.getElementsByTagName('head')[0];
  head.appendChild(cssNode);
  if (cssNode.styleSheet) {
    // IE.
    cssNode.styleSheet.cssText = cssText;
  } else {
    // W3C.
    var cssTextNode = document.createTextNode(cssText);
    cssNode.appendChild(cssTextNode);
  }
  return cssNode;
};


/**
 * Cross browser method to get the filename from the StyleSheet's href.
 * Explorer only returns the filename in the href, while other agents return
 * the full path.
 * @param {!StyleSheet} styleSheet Any valid StyleSheet object with an href.
 * @throws {Error} When there's no href property found.
 * @return {?string} filename The filename, or null if not an external
 *    styleSheet.
 */
goog.cssom.getFileNameFromStyleSheet = function(styleSheet) {
  var href = styleSheet.href;

  // Another IE/FF difference. IE returns an empty string, while FF and others
  // return null for CSSStyleSheets not from an external file.
  if (!href) {
    return null;
  }

  // We need the regexp to ensure we get the filename minus any query params.
  var matches = /([^\/\?]+)[^\/]*$/.exec(href);
  var filename = matches[1];
  return filename;
};


/**
 * Recursively gets all CSS text or rules.
 * @param {CSSStyleSheet|StyleSheetList} styleSheet The CSSStyleSheet.
 * @param {boolean} isTextOutput If true, output is cssText, otherwise cssRules.
 * @return {string|!Array.<CSSRule>} cssText or cssRules.
 * @private
 */
goog.cssom.getAllCss_ = function(styleSheet, isTextOutput) {
  var cssOut = [];
  var styleSheets = goog.cssom.getAllCssStyleSheets(styleSheet);

  for (var i = 0; styleSheet = styleSheets[i]; i++) {
    var cssRuleList = goog.cssom.getCssRulesFromStyleSheet(styleSheet);

    if (cssRuleList && cssRuleList.length) {

      // We're going to track cssRule index if we want rule output.
      if (!isTextOutput) {
        var ruleIndex = 0;
      }

      for (var j = 0, n = cssRuleList.length, cssRule; j < n; j++) {
        cssRule = cssRuleList[j];
        // Gets cssText output, ignoring CSSImportRules.
        if (isTextOutput && !cssRule.href) {
          var res = goog.cssom.getCssTextFromCssRule(cssRule);
          cssOut.push(res);

        } else if (!cssRule.href) {
          // Gets cssRules output, ignoring CSSImportRules.
          if (cssRule.style) {
            // This is a fun little hack to get parentStyleSheet into the rule
            // object for IE since it failed to implement rule.parentStyleSheet.
            // We can later read this property when doing things like hunting
            // for indexes in order to delete a given CSSRule.
            // Unfortunately we have to use the style object to store these
            // pieces of info since the rule object is read-only.
            if (!cssRule.parentStyleSheet) {
              cssRule.style['-closure-parent-stylesheet'] = styleSheet;
            }

            // This is a hack to help with possible removal of the rule later,
            // where we just append the rule's index in its parentStyleSheet
            // onto the style object as a property.
            // Unfortunately we have to use the style object to store these
            // pieces of info since the rule object is read-only.
            cssRule.style['-closure-rule-index'] = ruleIndex;
          }
          cssOut.push(cssRule);
        }

        if (!isTextOutput) {
          ruleIndex++;
        }
      }
    }
  }
  return isTextOutput ? cssOut.join(' ') : cssOut;
};

