// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utilities for detecting, adding and removing classes.  Prefer
 * this over goog.dom.classes for new code since it attempts to use classList
 * (DOMTokenList: http://dom.spec.whatwg.org/#domtokenlist) which is faster
 * and requires less code.
 *
 * Note: these utilities are meant to operate on HTMLElements and
 * will not work on elements with differing interfaces (such as SVGElements).
 */


goog.provide('goog.dom.classlist');

goog.require('goog.array');
goog.require('goog.asserts');


/**
 * Override this define at build-time if you know your target supports it.
 * @define {boolean} Whether to use the classList property (DOMTokenList).
 */
goog.define('goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST', false);


/**
 * Enables use of the native DOMTokenList methods.  See the spec at
 * {@link http://dom.spec.whatwg.org/#domtokenlist}.
 * @type {boolean}
 * @private
 */
goog.dom.classlist.NATIVE_DOM_TOKEN_LIST_ =
    goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST ||
    // Whether DOMTokenList exists.
    (!!goog.global['DOMTokenList']);


/**
 * Gets an array-like object of class names on an element.
 * @param {Element} element DOM node to get the classes of.
 * @return {!goog.array.ArrayLike} Class names on {@code element}.
 */
goog.dom.classlist.get = goog.dom.classlist.NATIVE_DOM_TOKEN_LIST_ ?
    function(element) {
      return element.classList;
    } :
    function(element) {
      var className = element.className;
      // Some types of elements don't have a className in IE (e.g. iframes).
      // Furthermore, in Firefox, className is not a string when the element is
      // an SVG element.
      return goog.isString(className) && className.match(/\S+/g) || [];
    };


/**
 * Sets the entire class name of an element.
 * @param {Element} element DOM node to set class of.
 * @param {string} className Class name(s) to apply to element.
 */
goog.dom.classlist.set = function(element, className) {
  element.className = className;
};


/**
 * Returns true if an element has a class.  This method may throw a DOM
 * exception for an invalid or empty class name if DOMTokenList is used.
 * @param {Element} element DOM node to test.
 * @param {string} className Class name to test for.
 * @return {boolean} Whether element has the class.
 */
goog.dom.classlist.contains = goog.dom.classlist.NATIVE_DOM_TOKEN_LIST_ ?
    function(element, className) {
      goog.asserts.assert(!!element.classList);
      return element.classList.contains(className);
    } :
    function(element, className) {
      return goog.array.contains(goog.dom.classlist.get(element), className);
    };


/**
 * Adds a class to an element.  Does not add multiples of class names.  This
 * method may throw a DOM exception for an invalid or empty class name if
 * DOMTokenList is used.
 * @param {Element} element DOM node to add class to.
 * @param {string} className Class name to add.
 */
goog.dom.classlist.add = goog.dom.classlist.NATIVE_DOM_TOKEN_LIST_ ?
    function(element, className) {
      element.classList.add(className);
    } :
    function(element, className) {
      if (!goog.dom.classlist.contains(element, className)) {
        // Ensure we add a space if this is not the first class name added.
        element.className += element.className.length > 0 ?
            (' ' + className) : className;
      }
    };


/**
 * Convenience method to add a number of class names at once.
 * @param {Element} element The element to which to add classes.
 * @param {goog.array.ArrayLike.<string>} classesToAdd An array-like object
 * containing a collection of class names to add to the element.
 * This method may throw a DOM exception if classesToAdd contains invalid
 * or empty class names.
 */
goog.dom.classlist.addAll = goog.dom.classlist.NATIVE_DOM_TOKEN_LIST_ ?
    function(element, classesToAdd) {
      goog.array.forEach(classesToAdd, function(className) {
        goog.dom.classlist.add(element, className);
      });
    } :
    function(element, classesToAdd) {
      var classMap = {};

      // Get all current class names into a map.
      goog.array.forEach(goog.dom.classlist.get(element),
          function(className) {
            classMap[className] = true;
          });

      // Add new class names to the map.
      goog.array.forEach(classesToAdd,
          function(className) {
            classMap[className] = true;
          });

      // Flatten the keys of the map into the className.
      element.className = '';
      for (var className in classMap) {
        element.className += element.className.length > 0 ?
            (' ' + className) : className;
      }
    };


/**
 * Removes a class from an element.  This method may throw a DOM exception
 * for an invalid or empty class name if DOMTokenList is used.
 * @param {Element} element DOM node to remove class from.
 * @param {string} className Class name to remove.
 */
goog.dom.classlist.remove = goog.dom.classlist.NATIVE_DOM_TOKEN_LIST_ ?
    function(element, className) {
      element.classList.remove(className);
    } :
    function(element, className) {
      if (goog.dom.classlist.contains(element, className)) {
        // Filter out the class name.
        element.className = goog.array.filter(
            goog.dom.classlist.get(element),
            function(c) {
              return c != className;
            }).join(' ');
      }
    };


/**
 * Removes a set of classes from an element.  Prefer this call to
 * repeatedly calling {@code goog.dom.classlist.remove} if you want to remove
 * a large set of class names at once.
 * @param {Element} element The element from which to remove classes.
 * @param {goog.array.ArrayLike.<string>} classesToRemove An array-like object
 * containing a collection of class names to remove from the element.
 * This method may throw a DOM exception if classesToRemove contains invalid
 * or empty class names.
 */
goog.dom.classlist.removeAll = goog.dom.classlist.NATIVE_DOM_TOKEN_LIST_ ?
    function(element, classesToRemove) {
      goog.array.forEach(classesToRemove, function(className) {
        goog.dom.classlist.remove(element, className);
      });
    } :
    function(element, classesToRemove) {
      // Filter out those classes in classesToRemove.
      element.className = goog.array.filter(
          goog.dom.classlist.get(element),
          function(className) {
            // If this class is not one we are trying to remove,
            // add it to the array of new class names.
            return !goog.array.contains(classesToRemove, className);
          }).join(' ');
    };


/**
 * Adds or removes a class depending on the enabled argument.  This method
 * may throw a DOM exception for an invalid or empty class name if DOMTokenList
 * is used.
 * @param {Element} element DOM node to add or remove the class on.
 * @param {string} className Class name to add or remove.
 * @param {boolean} enabled Whether to add or remove the class (true adds,
 *     false removes).
 */
goog.dom.classlist.enable = function(element, className, enabled) {
  if (enabled) {
    goog.dom.classlist.add(element, className);
  } else {
    goog.dom.classlist.remove(element, className);
  }
};


/**
 * Switches a class on an element from one to another without disturbing other
 * classes. If the fromClass isn't removed, the toClass won't be added.  This
 * method may throw a DOM exception if the class names are empty or invalid.
 * @param {Element} element DOM node to swap classes on.
 * @param {string} fromClass Class to remove.
 * @param {string} toClass Class to add.
 * @return {boolean} Whether classes were switched.
 */
goog.dom.classlist.swap = function(element, fromClass, toClass) {
  if (goog.dom.classlist.contains(element, fromClass)) {
    goog.dom.classlist.remove(element, fromClass);
    goog.dom.classlist.add(element, toClass);
    return true;
  }
  return false;
};


/**
 * Removes a class if an element has it, and adds it the element doesn't have
 * it.  Won't affect other classes on the node.  This method may throw a DOM
 * exception if the class name is empty or invalid.
 * @param {Element} element DOM node to toggle class on.
 * @param {string} className Class to toggle.
 * @return {boolean} True if class was added, false if it was removed
 *     (in other words, whether element has the class after this function has
 *     been called).
 */
goog.dom.classlist.toggle = function(element, className) {
  var add = !goog.dom.classlist.contains(element, className);
  goog.dom.classlist.enable(element, className, add);
  return add;
};


/**
 * Adds and removes a class of an element.  Unlike
 * {@link goog.dom.classlist.swap}, this method adds the classToAdd regardless
 * of whether the classToRemove was present and had been removed.  This method
 * may throw a DOM exception if the class names are empty or invalid.
 *
 * @param {Element} element DOM node to swap classes on.
 * @param {string} classToRemove Class to remove.
 * @param {string} classToAdd Class to add.
 */
goog.dom.classlist.addRemove = function(element, classToRemove, classToAdd) {
  goog.dom.classlist.remove(element, classToRemove);
  goog.dom.classlist.add(element, classToAdd);
};
