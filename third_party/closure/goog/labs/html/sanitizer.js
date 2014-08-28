// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview
 * An HTML sanitizer that takes untrusted HTML snippets and produces
 * safe HTML by filtering/rewriting tags and attributes that contain
 * high-privilege instructions.
 */


goog.provide('goog.labs.html.Sanitizer');

goog.require('goog.asserts');
goog.require('goog.html.SafeUrl');
goog.require('goog.labs.html.attributeRewriterPresubmitWorkaround');
goog.require('goog.labs.html.scrubber');
goog.require('goog.object');
goog.require('goog.string');



/**
 * A sanitizer that converts untrusted, messy HTML into more regular HTML
 * that cannot abuse high-authority constructs like the ability to execute
 * arbitrary JavaScript.
 * @constructor
 */
goog.labs.html.Sanitizer = function() {
  /**
   * Maps the lower-case names of allowed elements to attribute white-lists.
   * An attribute white-list maps lower-case attribute names to functions
   * from values to values or undefined to disallow.
   *
   * The special element name {@code "*"} contains a white-list of attributes
   * allowed on any tag, which is useful for attributes like {@code title} and
   * {@code id} which are widely available with element-agnostic meanings.
   * It should not be used for attributes like {@code type} whose meaning
   * differs based on the element on which it appears:
   * e.g. {@code <input type=text>} vs {@code <style type=text/css>}.
   *
   * @type {!Object.<string, !Object.<string, goog.labs.html.AttributeRewriter>>}
   * @private
   */
  this.whitelist_ = goog.labs.html.Sanitizer.createBlankObject_();
  this.whitelist_['*'] = goog.labs.html.Sanitizer.createBlankObject_();

  // To use the sanitizer, we build inputs for the scrubber.
  // These inputs are invalidated by changes to the policy, so we (re)build them
  // lazily.

  /**
   * Maps element names to {@code true} so the scrubber does not have to do
   * own property checks for every tag filtered.
   *
   * Built lazily and invalidated when the white-list is modified.
   *
   * @type {Object.<string, boolean>}
   * @private
   */
  this.allowedElementSet_ = null;
};


// TODO(user): Should the return type be goog.html.SafeHtml?
// If we receive a safe HTML string as input, should we simply rebalance
// tags?
/**
 * Yields a string of safe HTML that contains all and only the safe
 * text-nodes and elements in the input.
 *
 * <p>
 * For the purposes of this function, "safe" is defined thus:
 * <ul>
 *   <li>Contains only elements explicitly allowed via {@code this.allow*}.
 *   <li>Contains only attributes explicitly allowed via {@code this.allow*}
 *       and having had all relevant transformations applied.
 *   <li>Contains an end tag for all and only non-void open tags.
 *   <li>Tags nest per XHTML rules.
 *   <li>Tags do not nest beyond a finite but fairly large level.
 * </ul>
 *
 * @param {!string} unsafeHtml A string of HTML which need not originate with
 *    a trusted source.
 * @return {!string} A string of HTML that contains only tags and attributes
 *    explicitly allowed by this sanitizer, and with end tags for all and only
 *    non-void elements.
 */
goog.labs.html.Sanitizer.prototype.sanitize = function(unsafeHtml) {
  var unsafeHtmlString = '' + unsafeHtml;

  /**
   * @type {!Object.<string, !Object.<string, goog.labs.html.AttributeRewriter>>}
   */
  var whitelist = this.whitelist_;
  if (!this.allowedElementSet_) {
    this.allowedElementSet_ = goog.object.createSet(
        // This can lead to '*' in the allowed element set, but the scrubber
        // will not parse "<*" as a tag beginning.
        goog.object.getKeys(whitelist));
  }

  return goog.labs.html.scrubber.scrub(
      this.allowedElementSet_, whitelist, unsafeHtmlString);
};


/**
 * Adds the element names to the white-list of elements that are allowed
 * in the safe HTML output.
 * <p>
 * Allowing elements does not, by itself, allow any attributes on
 * those elements.
 *
 * @param {...!string} var_args element names that should be allowed in the
 *     safe HTML output.
 * @return {!goog.labs.html.Sanitizer} {@code this}.
 */
goog.labs.html.Sanitizer.prototype.allowElements = function(var_args) {
  this.allowedElementSet_ = null;  // Invalidate.
  var whitelist = this.whitelist_;
  for (var i = 0; i < arguments.length; ++i) {
    var elementName = arguments[i].toLowerCase();

    goog.asserts.assert(
        goog.labs.html.Sanitizer.isValidHtmlName_(elementName), elementName);

    if (!Object.prototype.hasOwnProperty.call(whitelist, elementName)) {
      whitelist[elementName] = goog.labs.html.Sanitizer.createBlankObject_();
    }
  }
  return this;
};


/**
 * Allows in the sanitized output
 * <tt>&lt;<i>element</i> <i>attr</i>="..."&gt;</tt>
 * when <i>element</i> is in {@code elementNames} and
 * <i>attrNames</i> is in {@code attrNames}.
 *
 * If specified, {@code opt_valueXform} is a function that takes the
 * HTML-entity-decoded attribute value, and can choose to disallow the
 * attribute by returning {@code null} or substitute a new value
 * by returning a string with the new value.
 *
 * @param {!Array.<string>|string} elementNames names (or name) on which the
 *     attributes are allowed.
 *
 *     Element names should be allowed via {@code allowElements(...)} prior
 *     to white-listing attributes.
 *
 *     The special element name {@code "*"} has the same meaning as in CSS
 *     selectors: it can be used to white-list attributes like {@code title}
 *     and {@code id} which are widely available with element-agnostic
 *     meanings.
 *
 *     It should not be used for attributes like {@code type} whose meaning
 *     differs based on the element on which it appears:
 *     e.g. {@code <input type=text>} vs {@code <style type=text/css>}.
 *
 * @param {!Array.<string>|string} attrNames names (or name) of the attribute
 *     that should be allowed.
 *
 * @param {goog.labs.html.AttributeRewriter=} opt_rewriteValue A function
 *     that receives the HTML-entity-decoded attribute value and can return
 *     {@code null} to disallow the attribute entirely or the value for the
 *     attribute as a string.
 *     <p>
 *     The default is the identity function ({@code function(x){return x}}),
 *     and the value rewriter is composed with an attribute specific handler:
 *     <table>
 *      <tr>
 *        <th>href, src</th>
 *        <td>Requires that the value be an absolute URL with a protocol in
 *            (http, https, mailto) or a protocol relative URL.
 *      </tr>
 *     </table>
 *
 * @return {!goog.labs.html.Sanitizer} {@code this}.
 */
goog.labs.html.Sanitizer.prototype.allowAttributes =
    function(elementNames, attrNames, opt_rewriteValue) {
  if (!goog.isArray(elementNames)) {
    elementNames = [elementNames];
  }
  if (!goog.isArray(attrNames)) {
    attrNames = [attrNames];
  }
  goog.asserts.assert(
      !opt_rewriteValue || 'function' === typeof opt_rewriteValue,
      'opt_rewriteValue should be a function');

  var whitelist = this.whitelist_;
  for (var ei = 0; ei < elementNames.length; ++ei) {
    var elementName = elementNames[ei].toLowerCase();
    goog.asserts.assert(
        goog.labs.html.Sanitizer.isValidHtmlName_(elementName) ||
        '*' === elementName,
        elementName);
    // If the element has not been white-listed then panic.
    // TODO(user): allow allow{Elements,Attributes} to be called in any
    // order if someone needs it.
    if (!Object.prototype.hasOwnProperty.call(whitelist, elementName)) {
      throw new Error(elementName);
    }
    var attrWhitelist = whitelist[elementName];
    for (var ai = 0, an = attrNames.length; ai < an; ++ai) {
      var attrName = attrNames[ai].toLowerCase();
      goog.asserts.assert(
          goog.labs.html.Sanitizer.isValidHtmlName_(attrName), attrName);

      // If the value has already been allowed, then chain the rewriters
      // so that both white-listers concerns are met.
      // We do not use the default rewriter here since it should have
      // been introduced by the call that created the initial white-list
      // entry.
      attrWhitelist[attrName] = goog.labs.html.Sanitizer.chain_(
          opt_rewriteValue || goog.labs.html.Sanitizer.valueIdentity_,
          Object.prototype.hasOwnProperty.call(attrWhitelist, attrName) ?
              attrWhitelist[attrName] :
              goog.labs.html.Sanitizer.defaultRewriterForAttr_(attrName));
    }
  }
  return this;
};


/**
 * A new object that is as blank as possible.
 *
 * Using {@code Object.create} to create an object with
 * no prototype speeds up whitelist access since there's fewer prototypes
 * to fall-back to for a common case where an element is not in the
 * white-list, and reduces the chance of confusing a member of
 * {@code Object.prototype} with a whitelist entry.
 *
 * @return {!Object.<string, ?>} a reference to a newly allocated object that
 *    does not alias any reference that existed prior.
 * @private
 */
goog.labs.html.Sanitizer.createBlankObject_ = function() {
  return (Object.create || Object)(null);
};


/**
 * HTML element and attribute names may be almost arbitrary strings, but the
 * sanitizer is more restrictive as to what can be white-listed.
 *
 * Since HTML is case-insensitive, only lower-case identifiers composed of
 * ASCII letters, digits, and select punctuation are allowed.
 *
 * @param {string} name
 * @return {boolean} true iff name is a valid white-list key.
 * @private
 */
goog.labs.html.Sanitizer.isValidHtmlName_ = function(name) {
  return 'string' === typeof name &&  // Names must be strings.
      // Names must be lower-case and ASCII identifier chars only.
      /^[a-z][a-z0-9\-:]*$/.test(name);
};


/**
 * @param  {goog.labs.html.AttributeValue} x
 * @return {goog.labs.html.AttributeValue}
 * @private
 */
goog.labs.html.Sanitizer.valueIdentity_ = function(x) {
  return x;
};


/**
 * @param  {goog.labs.html.AttributeValue} x
 * @return {null}
 * @private
 */
goog.labs.html.Sanitizer.disallow_ = function(x) {
  return null;
};


/**
 * Chains attribute rewriters.
 *
 * @param  {goog.labs.html.AttributeRewriter} f
 * @param  {goog.labs.html.AttributeRewriter} g
 * @return {goog.labs.html.AttributeRewriter}
 *      a function that return g(f(x)) or null if f(x) is null.
 * @private
 */
goog.labs.html.Sanitizer.chain_ = function(f, g) {
  // Sometimes white-listing code ends up allowing things multiple times.
  if (f === goog.labs.html.Sanitizer.valueIdentity_) {
    return g;
  }
  if (g === goog.labs.html.Sanitizer.valueIdentity_) {
    return f;
  }
  // If someone tries to white-list a really problematic value, we reject
  // it by returning disallow_.  Disallow it quickly.
  if (f === goog.labs.html.Sanitizer.disallow_) {
    return f;
  }
  if (g === goog.labs.html.Sanitizer.disallow_) {
    return g;
  }
  return (
      /**
       * @param {goog.labs.html.AttributeValue} x
       * @return {goog.labs.html.AttributeValue}
       */
      function(x) {
        var y = f(x);
        return y != null ? g(y) : null;
      });
};


/**
 * Given an attribute name, returns a value rewriter that enforces some
 * minimal safety properties.
 *
 * <p>
 * For url atributes, it checks that any protocol is on a safe set that
 * doesn't allow script execution.
 * <p>
 * It also blanket disallows CSS and event handler attributes.
 *
 * @param  {string} attrName lower-cased attribute name.
 * @return {goog.labs.html.AttributeRewriter}
 * @private
 */
goog.labs.html.Sanitizer.defaultRewriterForAttr_ = function(attrName) {
  if ('href' === attrName || 'src' === attrName) {
    return goog.labs.html.Sanitizer.checkUrl_;
  } else if ('style' === attrName || 'on' === attrName.substr(0, 2)) {
    // TODO(user): delegate to a CSS sanitizer if one is available.
    return goog.labs.html.Sanitizer.disallow_;
  }
  return goog.labs.html.Sanitizer.valueIdentity_;
};


/**
 * Applied automatically to URL attributes to check that they are safe as per
 * {@link SafeUrl}.
 *
 * @param {goog.labs.html.AttributeValue} attrValue a decoded attribute value.
 * @return {goog.html.SafeUrl | null} a URL that is equivalent to the
 *    input or {@code null} if the input is not a safe URL.
 * @private
 */
goog.labs.html.Sanitizer.checkUrl_ = function(attrValue) {
  if (attrValue == null) {
    return null;
  }
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (attrValue instanceof goog.html.SafeUrl) {
    safeUrl = /** @type {!goog.html.SafeUrl} */ (attrValue);
  } else {
    if (typeof attrValue === 'string') {
      // Whitespace at the ends of URL-valued attributes in HTML is ignored.
      attrValue = goog.string.trim(/** @type {string} */ (attrValue));
    }
    safeUrl = goog.html.SafeUrl.sanitize(
        /** @type {!goog.string.TypedString | string} */ (attrValue));
  }
  if (goog.html.SafeUrl.unwrap(safeUrl) == goog.html.SafeUrl.INNOCUOUS_STRING) {
    return null;
  } else {
    return safeUrl;
  }
};


goog.labs.html.attributeRewriterPresubmitWorkaround();
