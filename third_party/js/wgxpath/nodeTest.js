// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview An interface for the NodeTest construct.
 */

goog.provide('wgxpath.NodeTest');



/**
 * The NodeTest interface to represent the NodeTest production
 * in the xpath grammar:
 * http://www.w3.org/TR/xpath-30/#prod-xpath30-NodeTest
 *
 * @interface
 */
wgxpath.NodeTest = function() {};


/**
 * Tests if a node matches the stored characteristics.
 *
 * @param {wgxpath.Node} node The node to be tested.
 * @return {boolean} Whether the node passes the test.
 */
wgxpath.NodeTest.prototype.matches = goog.abstractMethod;


/**
 * Returns the name of the test.
 *
 * @return {string} The name, either nodename or type name.
 */
wgxpath.NodeTest.prototype.getName = goog.abstractMethod;


/**
 * Returns the string representation of the NodeTest for debugging.
 *
 * @param {string=} opt_indent Optional indentation.
 * @return {string} The string representation.
 */
wgxpath.NodeTest.prototype.toString = goog.abstractMethod;
