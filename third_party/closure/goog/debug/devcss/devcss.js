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
 * @fileoverview Runtime development CSS Compiler emulation, via javascript.
 * This class provides an approximation to CSSCompiler's functionality by
 * hacking the live CSSOM.
 * This code is designed  to be inserted in the DOM immediately after the last
 * style block in HEAD when in development mode, i.e. you are not using a
 * running instance of a CSS Compiler to pass your CSS through.
 */


goog.provide('goog.debug.DevCss');
goog.provide('goog.debug.DevCss.UserAgent');

goog.require('goog.asserts');
goog.require('goog.cssom');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.string');
goog.require('goog.userAgent');



/**
 * A class for solving development CSS issues/emulating the CSS Compiler.
 * @param {goog.debug.DevCss.UserAgent=} opt_userAgent The user agent, if not
 *     passed in, will be determined using goog.userAgent.
 * @param {number|string=} opt_userAgentVersion The user agent's version.
 *     If not passed in, will be determined using goog.userAgent.
 * @throws {Error} When userAgent detection fails.
 * @constructor
 * @final
 */
goog.debug.DevCss = function(opt_userAgent, opt_userAgentVersion) {
  if (!opt_userAgent) {
    // Walks through the known goog.userAgents.
    if (goog.userAgent.IE) {
      opt_userAgent = goog.debug.DevCss.UserAgent.IE;
    } else if (goog.userAgent.GECKO) {
      opt_userAgent = goog.debug.DevCss.UserAgent.GECKO;
    } else if (goog.userAgent.WEBKIT) {
      opt_userAgent = goog.debug.DevCss.UserAgent.WEBKIT;
    } else if (goog.userAgent.MOBILE) {
      opt_userAgent = goog.debug.DevCss.UserAgent.MOBILE;
    } else if (goog.userAgent.OPERA) {
      opt_userAgent = goog.debug.DevCss.UserAgent.OPERA;
    } else if (goog.userAgent.EDGE) {
      opt_userAgent = goog.debug.DevCss.UserAgent.EDGE;
    }
  }
  switch (opt_userAgent) {
    case goog.debug.DevCss.UserAgent.OPERA:
    case goog.debug.DevCss.UserAgent.IE:
    case goog.debug.DevCss.UserAgent.GECKO:
    case goog.debug.DevCss.UserAgent.FIREFOX:
    case goog.debug.DevCss.UserAgent.WEBKIT:
    case goog.debug.DevCss.UserAgent.SAFARI:
    case goog.debug.DevCss.UserAgent.MOBILE:
    case goog.debug.DevCss.UserAgent.EDGE:
      break;
    default:
      throw Error('Could not determine the user agent from known UserAgents');
  }

  /**
   * One of goog.debug.DevCss.UserAgent.
   * @type {string}
   * @private
   */
  this.userAgent_ = opt_userAgent;

  /**
   * @const @private
   */
  this.userAgentTokens_ = {};

  /**
   * @type {number|string}
   * @private
   */
  this.userAgentVersion_ = opt_userAgentVersion || goog.userAgent.VERSION;
  this.generateUserAgentTokens_();

  /**
   * @type {boolean}
   * @private
   */
  this.isIe6OrLess_ = this.userAgent_ == goog.debug.DevCss.UserAgent.IE &&
      goog.string.compareVersions('7', this.userAgentVersion_) > 0;

  if (this.isIe6OrLess_) {
    /**
     * @type {Array<{classNames,combinedClassName,els}>}
     * @private
     */
    this.ie6CombinedMatches_ = [];
  }
};


/**
 * Rewrites the CSSOM as needed to activate any useragent-specific selectors.
 * @param {boolean=} opt_enableIe6ReadyHandler If true(the default), and the
 *     userAgent is ie6, we set a document "ready" event handler to walk the DOM
 *     and make combined selector className changes. Having this parameter also
 *     aids unit testing.
 */
goog.debug.DevCss.prototype.activateBrowserSpecificCssRules = function(
    opt_enableIe6ReadyHandler) {
  var enableIe6EventHandler =
      goog.isDef(opt_enableIe6ReadyHandler) ? opt_enableIe6ReadyHandler : true;
  var cssRules = goog.cssom.getAllCssStyleRules();

  for (var i = 0, cssRule; cssRule = cssRules[i]; i++) {
    this.replaceBrowserSpecificClassNames_(cssRule);
  }

  // Since we may have manipulated the rules above, we'll have to do a
  // complete sweep again if we're in IE6. Luckily performance doesn't
  // matter for this tool.
  if (this.isIe6OrLess_) {
    cssRules = goog.cssom.getAllCssStyleRules();
    for (var i = 0, cssRule; cssRule = cssRules[i]; i++) {
      this.replaceIe6CombinedSelectors_(cssRule);
    }
  }

  // Add an event listener for document ready to rewrite any necessary
  // combined classnames in IE6.
  if (this.isIe6OrLess_ && enableIe6EventHandler) {
    goog.events.listen(
        document, goog.events.EventType.LOAD,
        goog.bind(this.addIe6CombinedClassNames_, this));
  }
};


/**
 * A list of possible user agent strings.
 * @enum {string}
 */
goog.debug.DevCss.UserAgent = {
  OPERA: 'OPERA',
  IE: 'IE',
  GECKO: 'GECKO',
  FIREFOX: 'GECKO',
  WEBKIT: 'WEBKIT',
  SAFARI: 'WEBKIT',
  MOBILE: 'MOBILE',
  EDGE: 'EDGE'
};


/**
 * A list of strings that may be used for matching in CSS files/development.
 * @enum {string}
 * @private
 */
goog.debug.DevCss.CssToken_ = {
  USERAGENT: 'USERAGENT',
  SEPARATOR: '-',
  LESS_THAN: 'LT',
  GREATER_THAN: 'GT',
  LESS_THAN_OR_EQUAL: 'LTE',
  GREATER_THAN_OR_EQUAL: 'GTE',
  IE6_SELECTOR_TEXT: 'goog-ie6-selector',
  IE6_COMBINED_GLUE: '_'
};


/**
 * Generates user agent token match strings with comparison and version bits.
 * For example:
 *   userAgentTokens_.ANY will be like 'GECKO'
 *   userAgentTokens_.LESS_THAN will be like 'GECKO-LT3' etc...
 * @private
 */
goog.debug.DevCss.prototype.generateUserAgentTokens_ = function() {
  this.userAgentTokens_.ANY = goog.debug.DevCss.CssToken_.USERAGENT +
      goog.debug.DevCss.CssToken_.SEPARATOR + this.userAgent_;
  this.userAgentTokens_.EQUALS =
      this.userAgentTokens_.ANY + goog.debug.DevCss.CssToken_.SEPARATOR;
  this.userAgentTokens_.LESS_THAN = this.userAgentTokens_.ANY +
      goog.debug.DevCss.CssToken_.SEPARATOR +
      goog.debug.DevCss.CssToken_.LESS_THAN;
  this.userAgentTokens_.LESS_THAN_OR_EQUAL = this.userAgentTokens_.ANY +
      goog.debug.DevCss.CssToken_.SEPARATOR +
      goog.debug.DevCss.CssToken_.LESS_THAN_OR_EQUAL;
  this.userAgentTokens_.GREATER_THAN = this.userAgentTokens_.ANY +
      goog.debug.DevCss.CssToken_.SEPARATOR +
      goog.debug.DevCss.CssToken_.GREATER_THAN;
  this.userAgentTokens_.GREATER_THAN_OR_EQUAL = this.userAgentTokens_.ANY +
      goog.debug.DevCss.CssToken_.SEPARATOR +
      goog.debug.DevCss.CssToken_.GREATER_THAN_OR_EQUAL;
};


/**
 * Gets the version number bit from a selector matching userAgentToken.
 * @param {string} selectorText The selector text of a CSS rule.
 * @param {string} userAgentToken Includes the LTE/GTE bit to see if it matches.
 * @return {string|undefined} The version number.
 * @private
 */
goog.debug.DevCss.prototype.getVersionNumberFromSelectorText_ = function(
    selectorText, userAgentToken) {
  var regex = new RegExp(userAgentToken + '([\\d\\.]+)');
  var matches = regex.exec(selectorText);
  if (matches && matches.length == 2) {
    return matches[1];
  }
};


/**
 * Extracts a rule version from the selector text, and if it finds one, calls
 * compareVersions against it and the passed in token string to provide the
 * value needed to determine if we have a match or not.
 * @param {CSSRule} cssRule The rule to test against.
 * @param {string} token The match token to test against the rule.
 * @return {!Array|undefined} A tuple with the result of the compareVersions
 *     call and the matched ruleVersion.
 * @private
 */
goog.debug.DevCss.prototype.getRuleVersionAndCompare_ = function(
    cssRule, token) {
  if (!cssRule.selectorText.match(token)) {
    return;
  }
  var ruleVersion =
      this.getVersionNumberFromSelectorText_(cssRule.selectorText, token);
  if (!ruleVersion) {
    return;
  }

  var comparison =
      goog.string.compareVersions(this.userAgentVersion_, ruleVersion);
  return [comparison, ruleVersion];
};


/**
 * Replaces a CSS selector if we have matches based on our useragent/version.
 * Example: With a selector like ".USERAGENT-IE-LTE6 .class { prop: value }" if
 * we are running IE6 we'll end up with ".class { prop: value }", thereby
 * "activating" the selector.
 * @param {CSSRule} cssRule The cssRule to potentially replace.
 * @private
 */
goog.debug.DevCss.prototype.replaceBrowserSpecificClassNames_ = function(
    cssRule) {

  // If we don't match the browser token, we can stop now.
  if (!cssRule.selectorText.match(this.userAgentTokens_.ANY)) {
    return;
  }

  // We know it will begin as a classname.
  var additionalRegexString;

  // Tests "Less than or equals".
  var compared = this.getRuleVersionAndCompare_(
      cssRule, this.userAgentTokens_.LESS_THAN_OR_EQUAL);
  if (compared && compared.length) {
    if (compared[0] > 0) {
      return;
    }
    additionalRegexString =
        this.userAgentTokens_.LESS_THAN_OR_EQUAL + compared[1];
  }

  // Tests "Less than".
  compared =
      this.getRuleVersionAndCompare_(cssRule, this.userAgentTokens_.LESS_THAN);
  if (compared && compared.length) {
    if (compared[0] > -1) {
      return;
    }
    additionalRegexString = this.userAgentTokens_.LESS_THAN + compared[1];
  }

  // Tests "Greater than or equals".
  compared = this.getRuleVersionAndCompare_(
      cssRule, this.userAgentTokens_.GREATER_THAN_OR_EQUAL);
  if (compared && compared.length) {
    if (compared[0] < 0) {
      return;
    }
    additionalRegexString =
        this.userAgentTokens_.GREATER_THAN_OR_EQUAL + compared[1];
  }

  // Tests "Greater than".
  compared = this.getRuleVersionAndCompare_(
      cssRule, this.userAgentTokens_.GREATER_THAN);
  if (compared && compared.length) {
    if (compared[0] < 1) {
      return;
    }
    additionalRegexString = this.userAgentTokens_.GREATER_THAN + compared[1];
  }

  // Tests "Equals".
  compared =
      this.getRuleVersionAndCompare_(cssRule, this.userAgentTokens_.EQUALS);
  if (compared && compared.length) {
    if (compared[0] != 0) {
      return;
    }
    additionalRegexString = this.userAgentTokens_.EQUALS + compared[1];
  }

  // If we got to here without generating the additionalRegexString, then
  // we did not match any of our comparison token strings, and we want a
  // general browser token replacement.
  if (!additionalRegexString) {
    additionalRegexString = this.userAgentTokens_.ANY;
  }

  // We need to match at least a single whitespace character to know that
  // we are matching the entire useragent string token.
  var regexString = '\\.' + additionalRegexString + '\\s+';
  var re = new RegExp(regexString, 'g');

  var currentCssText = goog.cssom.getCssTextFromCssRule(cssRule);

  // Replacing the token with '' activates the selector for this useragent.
  var newCssText = currentCssText.replace(re, '');

  if (newCssText != currentCssText) {
    goog.cssom.replaceCssRule(cssRule, newCssText);
  }
};


/**
 * Replaces IE6 combined selector rules with a workable development alternative.
 * IE6 actually parses .class1.class2 {} to simply .class2 {} which is nasty.
 * To fully support combined selectors in IE6 this function needs to be paired
 * with a call to replace the relevant DOM elements classNames as well.
 * @see {this.addIe6CombinedClassNames_}
 * @param {CSSRule} cssRule The rule to potentially fix.
 * @private
 */
goog.debug.DevCss.prototype.replaceIe6CombinedSelectors_ = function(cssRule) {
  // This match only ever works in IE because other UA's won't have our
  // IE6_SELECTOR_TEXT in the cssText property.
  if (cssRule.style.cssText &&
      cssRule.style.cssText.match(
          goog.debug.DevCss.CssToken_.IE6_SELECTOR_TEXT)) {
    var cssText = goog.cssom.getCssTextFromCssRule(cssRule);
    var combinedSelectorText = this.getIe6CombinedSelectorText_(cssText);
    if (combinedSelectorText) {
      var newCssText = combinedSelectorText + '{' + cssRule.style.cssText + '}';
      goog.cssom.replaceCssRule(cssRule, newCssText);
    }
  }
};


/**
 * Gets the appropriate new combined selector text for IE6.
 * Also adds an entry onto ie6CombinedMatches_ with relevant info for the
 * likely following call to walk the DOM and rewrite the class attribute.
 * Example: With a selector like
 *     ".class2 { -goog-ie6-selector: .class1.class2; prop: value }".
 * this function will return:
 *     ".class1_class2 { prop: value }".
 * @param {string} cssText The CSS selector text and css rule text combined.
 * @return {?string} The rewritten css rule text.
 * @private
 */
goog.debug.DevCss.prototype.getIe6CombinedSelectorText_ = function(cssText) {
  var regex = new RegExp(
      goog.debug.DevCss.CssToken_.IE6_SELECTOR_TEXT +
          '\\s*:\\s*\\"([^\\"]+)\\"',
      'gi');
  var matches = regex.exec(cssText);
  if (matches) {
    var combinedSelectorText = matches[1];
    // To aid in later fixing the DOM, we need to split up the possible
    // selector groups by commas.
    var groupedSelectors = combinedSelectorText.split(/\s*\,\s*/);
    for (var i = 0, selector; selector = groupedSelectors[i]; i++) {
      // Strips off the leading ".".
      var combinedClassName = selector.substr(1);
      var classNames = combinedClassName.split(
          goog.debug.DevCss.CssToken_.IE6_COMBINED_GLUE);
      var entry = {
        classNames: classNames,
        combinedClassName: combinedClassName,
        els: []
      };
      this.ie6CombinedMatches_.push(entry);
    }
    return combinedSelectorText;
  }
  return null;
};


/**
 * Adds combined selectors with underscores to make them "work" in IE6.
 * @see {this.replaceIe6CombinedSelectors_}
 * @private
 */
goog.debug.DevCss.prototype.addIe6CombinedClassNames_ = function() {
  if (!this.ie6CombinedMatches_.length) {
    return;
  }
  var allEls = document.getElementsByTagName('*');
  // Match nodes for all classNames.
  for (var i = 0, classNameEntry; classNameEntry = this.ie6CombinedMatches_[i];
       i++) {
    for (var j = 0, el; el = allEls[j]; j++) {
      var classNamesLength = classNameEntry.classNames.length;
      for (var k = 0, className; className = classNameEntry.classNames[k];
           k++) {
        if (!goog.dom.classlist.contains(el, className)) {
          break;
        }
        if (k == classNamesLength - 1) {
          classNameEntry.els.push(el);
        }
      }
    }
    // Walks over our matching nodes and fixes them.
    if (classNameEntry.els.length) {
      for (var j = 0, el; el = classNameEntry.els[j]; j++) {
        goog.asserts.assert(el);
        if (!goog.dom.classlist.contains(
                el, classNameEntry.combinedClassName)) {
          goog.dom.classlist.add(el, classNameEntry.combinedClassName);
        }
      }
    }
  }
};
