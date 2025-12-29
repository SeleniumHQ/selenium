/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utilities for detecting, adding and removing classes.  Prefer
 * this over goog.dom.classes for new code since it attempts to use classList
 * (DOMTokenList: http://dom.spec.whatwg.org/#domtokenlist) which is faster
 * and requires less code.
 *
 * Note: these utilities are meant to operate on HTMLElements and SVGElements
 * and may have unexpected behavior on elements with differing interfaces.
 */


goog.provide('goog.dom.classlist');

goog.require('goog.array');


/**
 * Override this define at build-time if you know your target supports it.
 * @define {boolean} Whether to use the classList property (DOMTokenList).
 */
goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST =
    goog.define('goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST', false);


/**
 * A wrapper which ensures correct functionality when interacting with
 * SVGElements
 * @param {?Element} element DOM node to get the class name of.
 * @return {string}
 * @private
 */
goog.dom.classlist.getClassName_ = function(element) {
  'use strict';
  // If className is an instance of SVGAnimatedString use getAttribute
  return typeof element.className == 'string' ?
      element.className :
      element.getAttribute && element.getAttribute('class') || '';
};


/**
 * Gets an array-like object of class names on an element.
 * @param {Element} element DOM node to get the classes of.
 * @return {!IArrayLike<?>} Class names on `element`.
 */
goog.dom.classlist.get = function(element) {
  'use strict';
  if (goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    return element.classList;
  }

  return goog.dom.classlist.getClassName_(element).match(/\S+/g) || [];
};


/**
 * Sets the entire class name of an element.
 * @param {Element} element DOM node to set class of.
 * @param {string} className Class name(s) to apply to element.
 */
goog.dom.classlist.set = function(element, className) {
  'use strict';
  // If className is an instance of SVGAnimatedString use setAttribute
  if ((typeof element.className) == 'string') {
    element.className = className;
    return;
  } else if (element.setAttribute) {
    element.setAttribute('class', className);
  }
};


/**
 * Returns true if an element has a class.  This method may throw a DOM
 * exception for an invalid or empty class name if DOMTokenList is used.
 * @param {Element} element DOM node to test.
 * @param {string} className Class name to test for.
 * @return {boolean} Whether element has the class.
 */
goog.dom.classlist.contains = function(element, className) {
  'use strict';
  if (goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    return element.classList.contains(className);
  }
  return goog.array.contains(goog.dom.classlist.get(element), className);
};


/**
 * Adds a class to an element.  Does not add multiples of class names.  This
 * method may throw a DOM exception for an invalid or empty class name if
 * DOMTokenList is used.
 * @param {Element} element DOM node to add class to.
 * @param {string} className Class name to add.
 */
goog.dom.classlist.add = function(element, className) {
  'use strict';
  if (goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    element.classList.add(className);
    return;
  }

  if (!goog.dom.classlist.contains(element, className)) {
    // Ensure we add a space if this is not the first class name added.
    var oldClassName = goog.dom.classlist.getClassName_(element);
    goog.dom.classlist.set(
        element,
        oldClassName +
            (oldClassName.length > 0 ? (' ' + className) : className));
  }
};


/**
 * Convenience method to add a number of class names at once.
 * @param {Element} element The element to which to add classes.
 * @param {IArrayLike<string>} classesToAdd An array-like object
 * containing a collection of class names to add to the element.
 * This method may throw a DOM exception if classesToAdd contains invalid
 * or empty class names.
 */
goog.dom.classlist.addAll = function(element, classesToAdd) {
  'use strict';
  if (goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    Array.prototype.forEach.call(classesToAdd, function(className) {
      'use strict';
      goog.dom.classlist.add(element, className);
    });
    return;
  }

  var classMap = {};

  // Get all current class names into a map.
  Array.prototype.forEach.call(
      goog.dom.classlist.get(element), function(className) {
        'use strict';
        classMap[className] = true;
      });

  // Add new class names to the map.
  Array.prototype.forEach.call(classesToAdd, function(className) {
    'use strict';
    classMap[className] = true;
  });

  // Flatten the keys of the map into the className.
  var newClassName = '';
  for (var className in classMap) {
    newClassName += newClassName.length > 0 ? (' ' + className) : className;
  }
  goog.dom.classlist.set(element, newClassName);
};


/**
 * Removes a class from an element.  This method may throw a DOM exception
 * for an invalid or empty class name if DOMTokenList is used.
 * @param {Element} element DOM node to remove class from.
 * @param {string} className Class name to remove.
 */
goog.dom.classlist.remove = function(element, className) {
  'use strict';
  if (goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    element.classList.remove(className);
    return;
  }

  if (goog.dom.classlist.contains(element, className)) {
    // Filter out the class name.
    goog.dom.classlist.set(
        element,
        Array.prototype.filter
            .call(
                goog.dom.classlist.get(element),
                function(c) {
                  'use strict';
                  return c != className;
                })
            .join(' '));
  }
};


/**
 * Removes a set of classes from an element.  Prefer this call to
 * repeatedly calling `goog.dom.classlist.remove` if you want to remove
 * a large set of class names at once.
 * @param {Element} element The element from which to remove classes.
 * @param {IArrayLike<string>} classesToRemove An array-like object
 * containing a collection of class names to remove from the element.
 * This method may throw a DOM exception if classesToRemove contains invalid
 * or empty class names.
 */
goog.dom.classlist.removeAll = function(element, classesToRemove) {
  'use strict';
  if (goog.dom.classlist.ALWAYS_USE_DOM_TOKEN_LIST || element.classList) {
    Array.prototype.forEach.call(classesToRemove, function(className) {
      'use strict';
      goog.dom.classlist.remove(element, className);
    });
    return;
  }

  // Filter out those classes in classesToRemove.
  goog.dom.classlist.set(
      element,
      Array.prototype.filter
          .call(
              goog.dom.classlist.get(element),
              function(className) {
                'use strict';
                // If this class is not one we are trying to remove,
                // add it to the array of new class names.
                return !goog.array.contains(classesToRemove, className);
              })
          .join(' '));
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
  'use strict';
  if (enabled) {
    goog.dom.classlist.add(element, className);
  } else {
    goog.dom.classlist.remove(element, className);
  }
};


/**
 * Adds or removes a set of classes depending on the enabled argument.  This
 * method may throw a DOM exception for an invalid or empty class name if
 * DOMTokenList is used.
 * @param {!Element} element DOM node to add or remove the class on.
 * @param {?IArrayLike<string>} classesToEnable An array-like object
 *     containing a collection of class names to add or remove from the element.
 * @param {boolean} enabled Whether to add or remove the classes (true adds,
 *     false removes).
 */
goog.dom.classlist.enableAll = function(element, classesToEnable, enabled) {
  'use strict';
  var f = enabled ? goog.dom.classlist.addAll : goog.dom.classlist.removeAll;
  f(element, classesToEnable);
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
  'use strict';
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
  'use strict';
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
  'use strict';
  goog.dom.classlist.remove(element, classToRemove);
  goog.dom.classlist.add(element, classToAdd);
};
