'use strict';
var objectAssign = require('object-assign');
var hasOwnProp = Object.prototype.hasOwnProperty;

var Base = module.exports = function () {};
Base.extend = extend;

/**
 * Extend this Class to create a new one inherithing this one.
 * Also add a helper __super__ object poiting to the parent prototypes methods
 * @param  {Object} protoProps  Prototype properties (available on the instances)
 * @param  {Object} staticProps Static properties (available on the contructor)
 * @return {Object}             New sub class
 */
function extend(protoProps, staticProps) {
  var parent = this;
  var child;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (protoProps && hasOwnProp.call(protoProps, 'constructor')) {
    child = protoProps.constructor;
  } else {
    child = function () { return parent.apply(this, arguments); };
  }

  // Add static properties to the constructor function, if supplied.
  objectAssign(child, parent, staticProps);

  // Set the prototype chain to inherit from `parent`
  child.prototype = Object.create(parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (protoProps) objectAssign(child.prototype, protoProps);

  // Set a convenience property in case the parent's prototype is needed
  // later.
  child.__super__ = parent.prototype;

  return child;
};
