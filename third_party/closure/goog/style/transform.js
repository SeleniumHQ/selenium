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
 * @fileoverview Utility methods to deal with CSS3 transforms programmatically.
 */

goog.provide('goog.style.transform');

goog.require('goog.functions');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Coordinate3');
goog.require('goog.style');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product.isVersion');


/**
 * Whether CSS3 transform translate() is supported. IE 9 supports 2D transforms
 * and IE 10 supports 3D transforms. IE 8 supports neither.
 * @return {boolean} Whether the current environment supports CSS3 transforms.
 */
goog.style.transform.isSupported = goog.functions.cacheReturnValue(function() {
  return !goog.userAgent.IE || goog.userAgent.product.isVersion(9);
});


/**
 * Whether CSS3 transform translate3d() is supported. If the current browser
 * supports this transform strategy.
 * @return {boolean} Whether the current environment supports CSS3 transforms.
 */
goog.style.transform.is3dSupported =
    goog.functions.cacheReturnValue(function() {
      return goog.userAgent.WEBKIT || goog.userAgent.EDGE ||
          (goog.userAgent.GECKO && goog.userAgent.product.isVersion(10)) ||
          (goog.userAgent.IE && goog.userAgent.product.isVersion(10));
    });


/**
 * Returns the x,y translation component of any CSS transforms applied to the
 * element, in pixels.
 *
 * @param {!Element} element The element to get the translation of.
 * @return {!goog.math.Coordinate} The CSS translation of the element in px.
 */
goog.style.transform.getTranslation = function(element) {
  var transform = goog.style.getComputedTransform(element);
  var matrixConstructor = goog.style.transform.matrixConstructor_();
  if (transform && matrixConstructor) {
    var matrix = new matrixConstructor(transform);
    if (matrix) {
      return new goog.math.Coordinate(matrix.m41, matrix.m42);
    }
  }
  return new goog.math.Coordinate(0, 0);
};


/**
 * Translates an element's position using the CSS3 transform property.
 * NOTE: This replaces all other transforms already defined on the element.
 * @param {Element} element The element to translate.
 * @param {number} x The horizontal translation.
 * @param {number} y The vertical translation.
 * @return {boolean} Whether the CSS translation was set.
 */
goog.style.transform.setTranslation = function(element, x, y) {
  if (!goog.style.transform.isSupported()) {
    return false;
  }
  // TODO(user): After http://crbug.com/324107 is fixed, it will be faster to
  // use something like: translation = new CSSMatrix().translate(x, y, 0);
  var translation = goog.style.transform.is3dSupported() ?
      'translate3d(' + x + 'px,' + y + 'px,' +
          '0px)' :
      'translate(' + x + 'px,' + y + 'px)';
  goog.style.setStyle(
      element, goog.style.transform.getTransformProperty_(), translation);
  return true;
};


/**
 * Returns the scale of the x, y and z dimensions of CSS transforms applied to
 * the element.
 *
 * @param {!Element} element The element to get the scale of.
 * @return {!goog.math.Coordinate3} The scale of the element.
 */
goog.style.transform.getScale = function(element) {
  var transform = goog.style.getComputedTransform(element);
  var matrixConstructor = goog.style.transform.matrixConstructor_();
  if (transform && matrixConstructor) {
    var matrix = new matrixConstructor(transform);
    if (matrix) {
      return new goog.math.Coordinate3(matrix.m11, matrix.m22, matrix.m33);
    }
  }
  return new goog.math.Coordinate3(0, 0, 0);
};


/**
 * Scales an element using the CSS3 transform property.
 * NOTE: This replaces all other transforms already defined on the element.
 * @param {!Element} element The element to scale.
 * @param {number} x The horizontal scale.
 * @param {number} y The vertical scale.
 * @param {number} z The depth scale.
 * @return {boolean} Whether the CSS scale was set.
 */
goog.style.transform.setScale = function(element, x, y, z) {
  if (!goog.style.transform.isSupported()) {
    return false;
  }
  var scale = goog.style.transform.is3dSupported() ?
      'scale3d(' + x + ',' + y + ',' + z + ')' :
      'scale(' + x + ',' + y + ')';
  goog.style.setStyle(
      element, goog.style.transform.getTransformProperty_(), scale);
  return true;
};


/**
 * Returns the rotation CSS transform applied to the element.
 * @param {!Element} element The element to get the rotation of.
 * @return {number} The rotation of the element in degrees.
 */
goog.style.transform.getRotation = function(element) {
  var transform = goog.style.getComputedTransform(element);
  var matrixConstructor = goog.style.transform.matrixConstructor_();
  if (transform && matrixConstructor) {
    var matrix = new matrixConstructor(transform);
    if (matrix) {
      var x = matrix.m11 + matrix.m22;
      var y = matrix.m12 - matrix.m21;
      return Math.atan2(y, x) * (180 / Math.PI);
    }
  }
  return 0;
};


/**
 * Rotates an element using the CSS3 transform property.
 * NOTE: This replaces all other transforms already defined on the element.
 * @param {!Element} element The element to rotate.
 * @param {number} degrees The number of degrees to rotate by.
 * @return {boolean} Whether the CSS rotation was set.
 */
goog.style.transform.setRotation = function(element, degrees) {
  if (!goog.style.transform.isSupported()) {
    return false;
  }
  var rotation = goog.style.transform.is3dSupported() ?
      'rotate3d(0,0,1,' + degrees + 'deg)' :
      'rotate(' + degrees + 'deg)';
  goog.style.setStyle(
      element, goog.style.transform.getTransformProperty_(), rotation);
  return true;
};


/**
 * A cached value of the transform property depending on whether the useragent
 * is IE9.
 * @return {string} The transform property depending on whether the useragent
 *     is IE9.
 * @private
 */
goog.style.transform.getTransformProperty_ =
    goog.functions.cacheReturnValue(function() {
      return goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE == 9 ?
          '-ms-transform' :
          'transform';
    });


/**
 * Gets the constructor for a CSSMatrix object.
 * @return {function(new:CSSMatrix, string)?} A constructor for a CSSMatrix
 *     object (or null).
 * @private
 */
goog.style.transform.matrixConstructor_ =
    goog.functions.cacheReturnValue(function() {
      if (goog.isDef(goog.global['WebKitCSSMatrix'])) {
        return goog.global['WebKitCSSMatrix'];
      }
      if (goog.isDef(goog.global['MSCSSMatrix'])) {
        return goog.global['MSCSSMatrix'];
      }
      if (goog.isDef(goog.global['CSSMatrix'])) {
        return goog.global['CSSMatrix'];
      }
      return null;
    });
