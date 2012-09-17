// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview Context information about nodes in their nodeset.
 */

goog.provide('wgxpath.Context');



/**
 * Provides information for where something is in the DOM.
 *
 * @param {!wgxpath.Node} node A node in the DOM.
 * @param {number=} opt_position The position of this node in its nodeset,
 *     defaults to 1.
 * @param {number=} opt_last Index of the last node in this nodeset,
 *     defaults to 1.
 * @constructor
 */
wgxpath.Context = function(node, opt_position, opt_last) {

  /**
    * @private
    * @type {!wgxpath.Node}
    */
  this.node_ = node;

  /**
   * @private
   * @type {number}
   */
  this.position_ = opt_position || 1;

  /**
   * @private
   * @type {number} opt_last
   */
  this.last_ = opt_last || 1;
};


/**
 * Returns the node for this context object.
 *
 * @return {!wgxpath.Node} The node for this context object.
 */
wgxpath.Context.prototype.getNode = function() {
  return this.node_;
};


/**
 * Returns the position for this context object.
 *
 * @return {number} The position for this context object.
 */
wgxpath.Context.prototype.getPosition = function() {
  return this.position_;
};


/**
 * Returns the last field for this context object.
 *
 * @return {number} The last field for this context object.
 */
wgxpath.Context.prototype.getLast = function() {
  return this.last_;
};
