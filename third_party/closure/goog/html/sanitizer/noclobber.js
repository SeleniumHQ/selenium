// Copyright 2017 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Utility DOM functions resistant to DOM clobbering. Clobbering
 * resistance is offered as a best-effort feature -- it is not available on
 * older browsers such as IE <10, Chrome <43, etc. In some cases, we can at
 * least detect clobbering attempts and abort. Note that this is not intended to
 * be a general-purpose library -- it is only used by the HTML sanitizer to
 * accept and sanitize clobbered input. If your projects needs to protect
 * against clobbered content, consider using the HTML sanitizer and configuring
 * it to defuse clobbering by prefixing all element ids and names in the
 * output.
 * @supported Unless specified in the method documentation, IE 10 and newer.
 */

goog.module('goog.html.sanitizer.noclobber');
goog.module.declareLegacyNamespace();

var NodeType = goog.require('goog.dom.NodeType');
var googAsserts = goog.require('goog.asserts');
var userAgentProduct = goog.require('goog.userAgent.product');

/**
 * Note about browser support:
 * - IE 8 and 9 don't have DOM prototypes. There is no simple way of saving
 *   the methods and accessors for a clobber-safe call.
 * - Chrome <43 doesn't have attributes on DOM prototypes, so there is no way of
 *   making clobber-safe calls for attribute descriptors.
 * - IE 8 and 9 don't even have Node and HTMLElement, so there is no
 *   straightforward way of checking if the result was clobbered for many of the
 *   methods.
 * - IE 8 and 9 have alternate names for getPropertyValue/setProperty in
 *   CSSStyleDeclaration.
 * For simplicity, we don't support IE 8 and 9 for anything but the CSS methods
 * which already had IE8 and IE9 support. Chrome 41 must still be supported.
 */

/**
 * Shorthand for `Object.getOwnPropertyDescriptor(...).get` to improve
 * readability during initialization of `Methods`.
 * @param {string} className
 * @param {string} property
 * @return {?Function}
 */
function getterOrNull(className, property) {
  var ctor = goog.global[className];
  if (!ctor || !ctor.prototype) {
    return null;
  }
  var descriptor = Object.getOwnPropertyDescriptor(ctor.prototype, property);
  return (descriptor && descriptor.get) || null;
}

/**
 * Shorthand for `DOMInterface.prototype.method` to improve readability
 * during initialization of `Methods`.
 * @param {string} className
 * @param {string} method
 * @return {?Function}
 */
function prototypeMethodOrNull(className, method) {
  var ctor = goog.global[className];
  return (ctor && ctor.prototype && ctor.prototype[method]) || null;
}

// Functions we use to avoid looking up the prototypes and the descriptors
// multiple times.
/** @const @enum {?Function} */
var Methods = {
  ATTRIBUTES_GETTER: getterOrNull('Element', 'attributes') ||
      // Edge and IE10 define this Element property on Node instead of
      // Element.
      getterOrNull('Node', 'attributes'),
  HAS_ATTRIBUTE: prototypeMethodOrNull('Element', 'hasAttribute'),
  GET_ATTRIBUTE: prototypeMethodOrNull('Element', 'getAttribute'),
  SET_ATTRIBUTE: prototypeMethodOrNull('Element', 'setAttribute'),
  REMOVE_ATTRIBUTE: prototypeMethodOrNull('Element', 'removeAttribute'),
  INNER_HTML_GETTER: getterOrNull('Element', 'innerHTML') ||
      // IE 10 defines this Element property on HTMLElement.
      getterOrNull('HTMLElement', 'innerHTML'),
  GET_ELEMENTS_BY_TAG_NAME:
      prototypeMethodOrNull('Element', 'getElementsByTagName'),
  MATCHES: prototypeMethodOrNull('Element', 'matches') ||
      prototypeMethodOrNull('Element', 'msMatchesSelector'),
  NODE_NAME_GETTER: getterOrNull('Node', 'nodeName'),
  NODE_TYPE_GETTER: getterOrNull('Node', 'nodeType'),
  PARENT_NODE_GETTER: getterOrNull('Node', 'parentNode'),
  CHILD_NODES_GETTER: getterOrNull('Node', 'childNodes'),
  APPEND_CHILD: prototypeMethodOrNull('Node', 'appendChild'),
  STYLE_GETTER: getterOrNull('HTMLElement', 'style') ||
      // Safari 10 defines the property on Element instead of
      // HTMLElement.
      getterOrNull('Element', 'style'),
  SHEET_GETTER: getterOrNull('HTMLStyleElement', 'sheet'),
  GET_PROPERTY_VALUE:
      prototypeMethodOrNull('CSSStyleDeclaration', 'getPropertyValue'),
  SET_PROPERTY: prototypeMethodOrNull('CSSStyleDeclaration', 'setProperty')
};

/**
 * Calls the provided DOM property descriptor and returns its result. If the
 * descriptor is not available, use fallbackPropertyName to get the property
 * value in a clobber-vulnerable way, and use fallbackTest to check if the
 * property was clobbered, throwing an exception if so.
 * @param {?Function} fn
 * @param {*} object
 * @param {string} fallbackPropertyName
 * @param {function(*):boolean} fallbackTest
 * @return {?}
 */
function genericPropertyGet(fn, object, fallbackPropertyName, fallbackTest) {
  if (fn) {
    return fn.apply(object);
  }
  var propertyValue = object[fallbackPropertyName];
  if (!fallbackTest(propertyValue)) {
    throw new Error('Clobbering detected');
  }
  return propertyValue;
}

/**
 * Calls the provided DOM prototype method and returns its result. If the
 * method is not available, use fallbackMethodName to call the method in a
 * clobber-vulnerable way, and use fallbackTest to check if the
 * method was clobbered, throwing an exception if so.
 * @param {?Function} fn
 * @param {*} object
 * @param {string} fallbackMethodName
 * @param {!Array<*>} args
 * @return {?}
 */
function genericMethodCall(fn, object, fallbackMethodName, args) {
  if (fn) {
    return fn.apply(object, args);
  }
  // IE8 and IE9 will return 'object' for
  // CSSStyleDeclaration.(get|set)Attribute, so we can't use typeof.
  if (userAgentProduct.IE && document.documentMode < 10) {
    if (!object[fallbackMethodName].call) {
      throw new Error('IE Clobbering detected');
    }
  } else if (typeof object[fallbackMethodName] != 'function') {
    throw new Error('Clobbering detected');
  }
  return object[fallbackMethodName].apply(object, args);
}

/**
 * Returns an element's attributes without falling prey to things like
 * <form><input name="attributes"></form>. Equivalent to
 * `node.attributes`.
 * @param {!Element} element
 * @return {!NamedNodeMap}
 */
function getElementAttributes(element) {
  return genericPropertyGet(
      Methods.ATTRIBUTES_GETTER, element, 'attributes', function(attributes) {
        return attributes instanceof NamedNodeMap;
      });
}

/**
 * Returns whether an element has a specific attribute, without falling prey to
 * things like <form><input name="hasAttribute"></form>.
 * Equivalent to {@code element.hasAttribute("foo")}.
 * @param {!Element} element
 * @param {string} attrName
 * @return {boolean}
 */
function hasElementAttribute(element, attrName) {
  return genericMethodCall(
      Methods.HAS_ATTRIBUTE, element, 'hasAttribute', [attrName]);
}

/**
 * Returns a specific attribute from an element without falling prey to
 * things like <form><input name="getAttribute"></form>.
 * Equivalent to {@code element.getAttribute("foo")}.
 * @param {!Element} element
 * @param {string} attrName
 * @return {?string}
 */
function getElementAttribute(element, attrName) {
  // Older browsers might return empty string instead of null to follow the
  // DOM 3 Core Specification.
  return genericMethodCall(
             Methods.GET_ATTRIBUTE, element, 'getAttribute', [attrName]) ||
      null;
}

/**
 * Sets an element's attributes without falling prey to things like
 * <form><input name="setAttribute"></form>. Equivalent to {@code
 * element.setAttribute("foo", "bar")}.
 * @param {!Element} element
 * @param {string} name
 * @param {string} value
 */
function setElementAttribute(element, name, value) {
  try {
    genericMethodCall(
        Methods.SET_ATTRIBUTE, element, 'setAttribute', [name, value]);
  } catch (e) {
    // IE throws an exception if the src attribute contains HTTP credentials.
    // However the attribute gets set anyway.
    if (e.message.indexOf('A security problem occurred') != -1) {
      return;
    }
    throw e;
  }
}

/**
 * Deletes a specific attribute from an element without falling prey to
 * things like <form><input name="removeAttribute"></form>.
 * Equivalent to {@code element.removeAttribute("foo")}.
 * @param {!Element} element
 * @param {string} attrName
 */
function removeElementAttribute(element, attrName) {
  genericMethodCall(
      Methods.REMOVE_ATTRIBUTE, element, 'removeAttribute', [attrName]);
}

/**
 * Returns a node's innerHTML property value without falling prey to things like
 * <form><input name="innerHTML"></form>. Equivalent to
 * `element.innerHTML`.
 * @param {!Element} element
 * @return {string}
 */
function getElementInnerHTML(element) {
  return genericPropertyGet(
      Methods.INNER_HTML_GETTER, element, 'innerHTML', function(html) {
        return typeof html == 'string';
      });
}

/**
 * Returns an element's style without falling prey to things like
 * <form><input name="style"></form>.
 * @param {!Element} element
 * @return {!CSSStyleDeclaration}
 */
function getElementStyle(element) {
  assertHTMLElement(element);
  return genericPropertyGet(
      Methods.STYLE_GETTER, element, 'style', function(style) {
        return style instanceof CSSStyleDeclaration;
      });
}

/**
 * Asserts that the Element is an HTMLElement, or throws an exception.
 * @param {!Element} element
 */
function assertHTMLElement(element) {
  if (googAsserts.ENABLE_ASSERTS && !(element instanceof HTMLElement)) {
    throw new Error('Not an HTMLElement');
  }
}

/**
 * Get the children of a specific tag matching the provided tag name without
 * falling prey to things like <form><input name="getElementsByTagName"></form>.
 * Equivalent to {@code element.getElementsByTagName("foo")}.
 * @param {!Element} element
 * @param {string} name
 * @return {!Array<!Element>}
 */
function getElementsByTagName(element, name) {
  return Array.from(genericMethodCall(
      Methods.GET_ELEMENTS_BY_TAG_NAME, element, 'getElementsByTagName',
      [name]));
}

/**
 * Returns an element's style without falling prey to things like
 * <form><input name="style"></form>.
 * @param {!Element} element
 * @return {!CSSStyleSheet}
 */
function getElementStyleSheet(element) {
  assertHTMLElement(element);
  return genericPropertyGet(
      Methods.SHEET_GETTER, element, 'sheet', function(sheet) {
        return sheet instanceof CSSStyleSheet;
      });
}

/**
 * Returns true if the element would be selected by the provided selector,
 * without falling prey to things like <form><input name="setAttribute"></form>.
 * Equivalent to {@code element.matches("foo")}.
 * @param {!Element} element
 * @param {string} selector
 * @return {boolean}
 */
function elementMatches(element, selector) {
  return genericMethodCall(
      Methods.MATCHES, element,
      element.matches ? 'matches' : 'msMatchesSelector', [selector]);
}

/**
 * Asserts that a Node is an Element, without falling prey to things like
 * <form><input name="nodeType"></form>.
 * @param {!Node} node
 * @return {!Element}
 */
function assertNodeIsElement(node) {
  if (googAsserts.ENABLE_ASSERTS && !isNodeElement(node)) {
    googAsserts.fail(
        'Expected Node of type Element but got Node of type %s',
        getNodeType(node));
  }
  return /** @type {!Element} */ (node);
}

/**
 * Returns whether the node is an Element, without falling prey to things like
 * <form><input name="nodeType"></form>.
 * @param {!Node} node
 * @return {boolean}
 */
function isNodeElement(node) {
  return getNodeType(node) == NodeType.ELEMENT;
}

/**
 * Returns a node's nodeName without falling prey to things like
 * <form><input name="nodeName"></form>.
 * @param {!Node} node
 * @return {string}
 */
function getNodeName(node) {
  return genericPropertyGet(
      Methods.NODE_NAME_GETTER, node, 'nodeName', function(name) {
        return typeof name == 'string';
      });
}

/**
 * Returns a node's nodeType without falling prey to things like
 * `<form><input name="nodeType"></form>`.
 * @param {!Node} node
 * @return {number}
 */
function getNodeType(node) {
  return genericPropertyGet(
      Methods.NODE_TYPE_GETTER, node, 'nodeType', function(type) {
        return typeof type == 'number';
      });
}

/**
 * Returns a node's parentNode without falling prey to things like
 * <form><input name="parentNode"></form>.
 * @param {!Node} node
 * @return {?Node}
 */
function getParentNode(node) {
  return genericPropertyGet(
      Methods.PARENT_NODE_GETTER, node, 'parentNode', function(parentNode) {
        // We need to ensure that parentNode is returning the actual parent node
        // and not a child node that happens to have a name of "parentNode".
        // We check that the node returned by parentNode is itself not named
        // "parentNode" - this could happen legitimately but on IE we have no
        // better means of avoiding the pitfall.
        return !(
            parentNode && typeof parentNode.name == 'string' &&
            parentNode.name && parentNode.name.toLowerCase() == 'parentnode');
      });
}

/**
 * Returns the value of node.childNodes without falling prey to things like
 * <form><input name="childNodes"></form>.
 * @param {!Node} node
 * @return {!NodeList<!Node>}
 */
function getChildNodes(node) {
  return genericPropertyGet(
      Methods.CHILD_NODES_GETTER, node, 'childNodes', function(childNodes) {
        return childNodes instanceof NodeList;
      });
}

/**
 * Appends a child to a node without falling prey to things like
 * <form><input name="appendChild"></form>.
 * @param {!Node} parent
 * @param {!Node} child
 * @return {!Node}
 */
function appendNodeChild(parent, child) {
  return genericMethodCall(
      Methods.APPEND_CHILD, parent, 'appendChild', [child]);
}

/**
 * Provides a way cross-browser way to get a CSS value from a CSS declaration.
 * @param {!CSSStyleDeclaration} cssStyle A CSS style object.
 * @param {string} propName A property name.
 * @return {string} Value of the property as parsed by the browser.
 * @supported IE8 and newer.
 */
function getCssPropertyValue(cssStyle, propName) {
  return genericMethodCall(
             Methods.GET_PROPERTY_VALUE, cssStyle,
             cssStyle.getPropertyValue ? 'getPropertyValue' : 'getAttribute',
             [propName]) ||
      '';
}

/**
 * Provides a cross-browser way to set a CSS value on a CSS declaration.
 * @param {!CSSStyleDeclaration} cssStyle A CSS style object.
 * @param {string} propName A property name.
 * @param {string} sanitizedValue Sanitized value of the property to be set
 *     on the CSS style object.
 * @supported IE8 and newer.
 */
function setCssProperty(cssStyle, propName, sanitizedValue) {
  genericMethodCall(
      Methods.SET_PROPERTY, cssStyle,
      cssStyle.setProperty ? 'setProperty' : 'setAttribute',
      [propName, sanitizedValue]);
}

exports = {
  getElementAttributes: getElementAttributes,
  hasElementAttribute: hasElementAttribute,
  getElementAttribute: getElementAttribute,
  setElementAttribute: setElementAttribute,
  removeElementAttribute: removeElementAttribute,
  getElementInnerHTML: getElementInnerHTML,
  getElementStyle: getElementStyle,
  getElementsByTagName: getElementsByTagName,
  getElementStyleSheet: getElementStyleSheet,
  elementMatches: elementMatches,
  assertNodeIsElement: assertNodeIsElement,
  isNodeElement: isNodeElement,
  getNodeName: getNodeName,
  getNodeType: getNodeType,
  getParentNode: getParentNode,
  getChildNodes: getChildNodes,
  appendNodeChild: appendNodeChild,
  getCssPropertyValue: getCssPropertyValue,
  setCssProperty: setCssProperty,
  /** @package */
  Methods: Methods,
};
