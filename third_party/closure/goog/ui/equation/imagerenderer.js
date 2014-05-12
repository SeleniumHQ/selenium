// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Functions for rendering the equation images.
 *
 */

goog.provide('goog.ui.equation.ImageRenderer');

goog.require('goog.asserts');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.string');
goog.require('goog.uri.utils');


/**
 * The server name which renders the equations.
 * We use https as equations may be embedded in https pages
 * and using https prevents mixed content warnings. Note that
 * https equations work only on google.com domains.
 * @type {string}
 * @private
 */
goog.ui.equation.ImageRenderer.SERVER_NAME_ =
    'https://www.google.com';


/**
 * The longest equation which may be displayed, in characters.
 * @type {number}
 */
goog.ui.equation.ImageRenderer.MAX_EQUATION_LENGTH = 200;


/**
 * Class to put on our equations IMG elements.
 * @type {string}
 */
goog.ui.equation.ImageRenderer.EE_IMG_CLASS = 'ee_img';


/**
 * Non-standard to put on our equations IMG elements. Useful when classes need
 * to be scrubbed from the user-generated HTML, but non-standard attributes
 * can be white-listed.
 *
 * @type {string}
 */
goog.ui.equation.ImageRenderer.EE_IMG_ATTR = 'eeimg';


/**
 * Vertical alignment for the equations IMG elements.
 * @type {string}
 */
goog.ui.equation.ImageRenderer.EE_IMG_VERTICAL_ALIGN = 'middle';


/**
 * The default background color as used in the img url, which is fully
 * transparent white.
 * @type {string}
 */
goog.ui.equation.ImageRenderer.BACKGROUND_COLOR = 'FFFFFF00';


/**
 * The default foreground color as used in the img url, which is black.
 * @type {string}
 */
goog.ui.equation.ImageRenderer.FOREGROUND_COLOR = '000000';


/**
 * Class to put on IMG elements to keep the resize property bubble from
 * appearing. This is different from PLACEHOLDER_IMG_CLASS because it's
 * reasonable in some cases to be able to resize a placeholder (which should
 * be reflected when the placeholder is replaced with the other content).
 * @type {string}
 */
goog.ui.equation.ImageRenderer.NO_RESIZE_IMG_CLASS =
    goog.getCssName('tr_noresize');


/**
 * Returns the equation image src url given the equation.
 * @param {string} equation The equation.
 * @return {string} The equation image src url (empty string in case the
 *   equation was empty).
 */
goog.ui.equation.ImageRenderer.getImageUrl = function(equation) {
  if (!equation) {
    return '';
  }

  var url = goog.ui.equation.ImageRenderer.SERVER_NAME_ +
      '/chart?cht=tx' +
      '&chf=bg,s,' +
      goog.ui.equation.ImageRenderer.BACKGROUND_COLOR +
      '&chco=' +
      goog.ui.equation.ImageRenderer.FOREGROUND_COLOR +
      '&chl=' +
      encodeURIComponent(equation);
  return url;
};


/**
 * Returns the equation string src for given image url.
 * @param {string} imageUrl The image url.
 * @return {string?} The equation string, null if imageUrl cannot be parsed.
 */
goog.ui.equation.ImageRenderer.getEquationFromImageUrl = function(imageUrl) {
  return goog.uri.utils.getParamValue(imageUrl, 'chl');
};


/**
 * Gets the equation string from the given equation IMG node. Returns empty
 * string if the src attribute of the is not a valid equation url.
 * @param {Element} equationNode The equation IMG element.
 * @return {string} The equation string.
 */
goog.ui.equation.ImageRenderer.getEquationFromImage = function(equationNode) {
  var url = equationNode.getAttribute('src');
  if (!url) {
    // Should never happen.
    return '';
  }
  return goog.ui.equation.ImageRenderer.getEquationFromImageUrl(
      url) || '';
};


/**
 * Checks whether given node is an equation element.
 * @param {Node} node The node to check, must be an Element.
 * @return {boolean} Whether given node is an equation element.
 */
goog.ui.equation.ImageRenderer.isEquationElement = function(node) {
  var elem = goog.asserts.assertElement(node);
  return elem.nodeName == goog.dom.TagName.IMG &&
      (!!elem.getAttribute(
      goog.ui.equation.ImageRenderer.EE_IMG_ATTR) ||
          goog.dom.classlist.contains(elem,
              goog.ui.equation.ImageRenderer.EE_IMG_CLASS));
};


/**
 * Returns the html for the html image tag for the given equation.
 * @param {string} equation The equation.
 * @return {string} The html code to embed in the document.
 */
goog.ui.equation.ImageRenderer.getHtml = function(equation) {
  var imageSrc =
      goog.ui.equation.ImageRenderer.getImageUrl(equation);
  if (!imageSrc) {
    return '';
  }
  return '<img src="' + imageSrc + '" ' +
      'alt="' + goog.string.htmlEscape(equation) + '" ' +
      'class="' + goog.ui.equation.ImageRenderer.EE_IMG_CLASS +
      ' ' + goog.ui.equation.ImageRenderer.NO_RESIZE_IMG_CLASS +
      '" ' + goog.ui.equation.ImageRenderer.EE_IMG_ATTR + '="1" ' +
      'style="vertical-align: ' +
      goog.ui.equation.ImageRenderer.EE_IMG_VERTICAL_ALIGN + '">';
};


/**
 * Checks whether equation is too long to be displayed.
 * @param {string} equation The equation to test.
 * @return {boolean} Whether the equation is too long.
 */
goog.ui.equation.ImageRenderer.isEquationTooLong = function(equation) {
  return equation.length >
      goog.ui.equation.ImageRenderer.MAX_EQUATION_LENGTH;
};
