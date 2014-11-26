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

/**
 * @fileoverview Utility methods to deal with CSS3 transitions
 * programmatically.
 * @author chrishenry@google.com (Chris Henry)
 */

goog.provide('goog.style.transition');
goog.provide('goog.style.transition.Css3Property');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom.safe');
goog.require('goog.dom.vendor');
goog.require('goog.functions');
goog.require('goog.html.SafeHtml');
goog.require('goog.style');
goog.require('goog.userAgent');


/**
 * A typedef to represent a CSS3 transition property. Duration and delay
 * are both in seconds. Timing is CSS3 timing function string, such as
 * 'easein', 'linear'.
 *
 * Alternatively, specifying string in the form of '[property] [duration]
 * [timing] [delay]' as specified in CSS3 transition is fine too.
 *
 * @typedef { {
 *   property: string,
 *   duration: number,
 *   timing: string,
 *   delay: number
 * } | string }
 */
goog.style.transition.Css3Property;


/**
 * Sets the element CSS3 transition to properties.
 * @param {Element} element The element to set transition on.
 * @param {goog.style.transition.Css3Property|
 *     Array<goog.style.transition.Css3Property>} properties A single CSS3
 *     transition property or array of properties.
 */
goog.style.transition.set = function(element, properties) {
  if (!goog.isArray(properties)) {
    properties = [properties];
  }
  goog.asserts.assert(
      properties.length > 0, 'At least one Css3Property should be specified.');

  var values = goog.array.map(
      properties, function(p) {
        if (goog.isString(p)) {
          return p;
        } else {
          goog.asserts.assertObject(p,
              'Expected css3 property to be an object.');
          var propString = p.property + ' ' + p.duration + 's ' + p.timing +
              ' ' + p.delay + 's';
          goog.asserts.assert(p.property && goog.isNumber(p.duration) &&
              p.timing && goog.isNumber(p.delay),
              'Unexpected css3 property value: %s', propString);
          return propString;
        }
      });
  goog.style.transition.setPropertyValue_(element, values.join(','));
};


/**
 * Removes any programmatically-added CSS3 transition in the given element.
 * @param {Element} element The element to remove transition from.
 */
goog.style.transition.removeAll = function(element) {
  goog.style.transition.setPropertyValue_(element, '');
};


/**
 * @return {boolean} Whether CSS3 transition is supported.
 */
goog.style.transition.isSupported = goog.functions.cacheReturnValue(function() {
  // Since IE would allow any attribute, we need to explicitly check the
  // browser version here instead.
  if (goog.userAgent.IE) {
    return goog.userAgent.isVersionOrHigher('10.0');
  }

  // We create a test element with style=-vendor-transition
  // We then detect whether those style properties are recognized and
  // available from js.
  var el = document.createElement('div');
  var transition = 'opacity 1s linear';
  var vendorPrefix = goog.dom.vendor.getVendorPrefix();
  var style = {'transition': transition};
  if (vendorPrefix) {
    style[vendorPrefix + '-transition'] = transition;
  }
  goog.dom.safe.setInnerHtml(el,
      goog.html.SafeHtml.create('div', {'style': style}));

  var testElement = /** @type {Element} */ (el.firstChild);
  goog.asserts.assert(testElement.nodeType == Node.ELEMENT_NODE);

  return goog.style.getStyle(testElement, 'transition') != '';
});


/**
 * Sets CSS3 transition property value to the given value.
 * @param {Element} element The element to set transition on.
 * @param {string} transitionValue The CSS3 transition property value.
 * @private
 */
goog.style.transition.setPropertyValue_ = function(element, transitionValue) {
  goog.style.setStyle(element, 'transition', transitionValue);
};
