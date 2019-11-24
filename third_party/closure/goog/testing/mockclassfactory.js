// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview This file defines a factory that can be used to mock and
 * replace an entire class.  This allows for mocks to be used effectively with
 * "new" instead of having to inject all instances.  Essentially, a given class
 * is replaced with a proxy to either a loose or strict mock.  Proxies locate
 * the appropriate mock based on constructor arguments.
 *
 * The usage is:
 * <ul>
 *   <li>Create a mock with one of the provided methods with a specifc set of
 *       constructor arguments
 *   <li>Set expectations by calling methods on the mock object
 *   <li>Call $replay() on the mock object
 *   <li>Instantiate the object as normal
 *   <li>Call $verify() to make sure that expectations were met
 *   <li>Call reset on the factory to revert all classes back to their original
 *       state
 * </ul>
 *
 * For examples, please see the unit test.
 *
 */


goog.setTestOnly('goog.testing.MockClassFactory');
goog.provide('goog.testing.MockClassFactory');
goog.provide('goog.testing.MockClassRecord');

goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.testing.LooseMock');
goog.require('goog.testing.StrictMock');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.mockmatchers');



/**
 * A record that represents all the data associated with a mock replacement of
 * a given class.
 * @param {Object} namespace The namespace in which the mocked class resides.
 * @param {string} className The name of the class within the namespace.
 * @param {Function} originalClass The original class implementation before it
 *     was replaced by a proxy.
 * @param {Function} proxy The proxy that replaced the original class.
 * @constructor
 * @final
 */
goog.testing.MockClassRecord = function(
    namespace, className, originalClass, proxy) {
  /**
   * A standard closure namespace (e.g. goog.foo.bar) that contains the mock
   * class referenced by this MockClassRecord.
   * @type {Object}
   * @private
   */
  this.namespace_ = namespace;

  /**
   * The name of the class within the provided namespace.
   * @type {string}
   * @private
   */
  this.className_ = className;

  /**
   * The original class implementation.
   * @type {Function}
   * @private
   */
  this.originalClass_ = originalClass;

  /**
   * The proxy being used as a replacement for the original class.
   * @type {Function}
   * @private
   */
  this.proxy_ = proxy;

  /**
   * A mocks that will be constructed by their argument list.  The entries are
   * objects with the format {'args': args, 'mock': mock}.
   * @type {Array<Object>}
   * @private
   */
  this.instancesByArgs_ = [];
};


/**
 * A mock associated with the static functions for a given class.
 * @type {goog.testing.StrictMock|goog.testing.LooseMock|null}
 * @private
 */
goog.testing.MockClassRecord.prototype.staticMock_ = null;


/**
 * A getter for this record's namespace.
 * @return {Object} The namespace.
 */
goog.testing.MockClassRecord.prototype.getNamespace = function() {
  return this.namespace_;
};


/**
 * A getter for this record's class name.
 * @return {string} The name of the class referenced by this record.
 */
goog.testing.MockClassRecord.prototype.getClassName = function() {
  return this.className_;
};


/**
 * A getter for the original class.
 * @return {Function} The original class implementation before mocking.
 */
goog.testing.MockClassRecord.prototype.getOriginalClass = function() {
  return this.originalClass_;
};


/**
 * A getter for the proxy being used as a replacement for the original class.
 * @return {Function} The proxy.
 */
goog.testing.MockClassRecord.prototype.getProxy = function() {
  return this.proxy_;
};


/**
 * A getter for the static mock.
 * @return {goog.testing.StrictMock|goog.testing.LooseMock|null} The static
 *     mock associated with this record.
 */
goog.testing.MockClassRecord.prototype.getStaticMock = function() {
  return this.staticMock_;
};


/**
 * A setter for the static mock.
 * @param {goog.testing.StrictMock|goog.testing.LooseMock} staticMock A mock to
 *     associate with the static functions for the referenced class.
 */
goog.testing.MockClassRecord.prototype.setStaticMock = function(staticMock) {
  this.staticMock_ = staticMock;
};


/**
 * Adds a new mock instance mapping.  The mapping connects a set of function
 * arguments to a specific mock instance.
 * @param {Array<?>} args An array of function arguments.
 * @param {goog.testing.StrictMock|goog.testing.LooseMock} mock A mock
 *     associated with the supplied arguments.
 */
goog.testing.MockClassRecord.prototype.addMockInstance = function(args, mock) {
  this.instancesByArgs_.push({args: args, mock: mock});
};


/**
 * Finds the mock corresponding to a given argument set.  Throws an error if
 * there is no appropriate match found.
 * @param {Array<?>} args An array of function arguments.
 * @return {goog.testing.StrictMock|goog.testing.LooseMock|null} The mock
 *     corresponding to a given argument set.
 */
goog.testing.MockClassRecord.prototype.findMockInstance = function(args) {
  for (var i = 0; i < this.instancesByArgs_.length; i++) {
    var instanceArgs = this.instancesByArgs_[i].args;
    if (goog.testing.mockmatchers.flexibleArrayMatcher(instanceArgs, args)) {
      return this.instancesByArgs_[i].mock;
    }
  }

  return null;
};


/**
 * Resets this record by reverting all the mocked classes back to the original
 * implementation and clearing out the mock instance list.
 */
goog.testing.MockClassRecord.prototype.reset = function() {
  this.namespace_[this.className_] = this.originalClass_;
  this.instancesByArgs_ = [];
};



/**
 * A factory used to create new mock class instances.  It is able to generate
 * both static and loose mocks.  The MockClassFactory is a singleton since it
 * tracks the classes that have been mocked internally.
 * @constructor
 * @final
 */
goog.testing.MockClassFactory = function() {
  if (goog.testing.MockClassFactory.instance_) {
    return goog.testing.MockClassFactory.instance_;
  }

  /**
   * A map from class name -> goog.testing.MockClassRecord.
   * @type {Object}
   * @private
   */
  this.mockClassRecords_ = {};

  goog.testing.MockClassFactory.instance_ = this;
};


/**
 * A singleton instance of the MockClassFactory.
 * @type {goog.testing.MockClassFactory?}
 * @private
 */
goog.testing.MockClassFactory.instance_ = null;


/**
 * The names of the fields that are defined on Object.prototype.
 * @type {Array<string>}
 * @private
 */
goog.testing.MockClassFactory.PROTOTYPE_FIELDS_ = [
  'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
  'toLocaleString', 'toString', 'valueOf'
];


/**
 * Iterates through a namespace to find the name of a given class.  This is done
 * solely to support compilation since string identifiers would break down.
 * Tests usually aren't compiled, but the functionality is supported.
 * @param {Object} namespace A javascript namespace (e.g. goog.testing).
 * @param {Function} classToMock The class whose name should be returned.
 * @return {string} The name of the class.
 * @private
 */
goog.testing.MockClassFactory.prototype.getClassName_ = function(
    namespace, classToMock) {
  var namespaces;
  if (namespace === goog.global) {
    namespaces = goog.testing.TestCase.getGlobals();
  } else {
    namespaces = [namespace];
  }
  for (var i = 0; i < namespaces.length; i++) {
    for (var prop in namespaces[i]) {
      if (namespaces[i][prop] === classToMock) {
        return prop;
      }
    }
  }

  throw Error('Class is not a part of the given namespace');
};


/**
 * Returns whether or not a given class has been mocked.
 * @param {string} className The name of the class.
 * @return {boolean} Whether or not the given class name has a MockClassRecord.
 * @private
 */
goog.testing.MockClassFactory.prototype.classHasMock_ = function(className) {
  return !!this.mockClassRecords_[className];
};


/**
 * Returns a proxy constructor closure.  Since this is a constructor, "this"
 * refers to the local scope of the constructed object thus bind cannot be
 * used.
 * @param {string} className The name of the class.
 * @param {Function} mockFinder A bound function that returns the mock
 *     associated with a class given the constructor's argument list.
 * @return {!Function} A proxy constructor.
 * @private
 */
goog.testing.MockClassFactory.prototype.getProxyCtor_ = function(
    className, mockFinder) {
  return function() {
    this.$mock_ = mockFinder(className, arguments);
    if (!this.$mock_) {
      // The "arguments" variable is not a proper Array so it must be converted.
      var args = Array.prototype.slice.call(arguments, 0);
      throw Error(
          'No mock found for ' + className + ' with arguments ' +
          args.join(', '));
    }
  };
};


/**
 * Returns a proxy function for a mock class instance.  This function cannot
 * be used with bind since "this" must refer to the scope of the proxy
 * constructor.
 * @param {string} fnName The name of the function that should be proxied.
 * @return {!Function} A proxy function.
 * @private
 */
goog.testing.MockClassFactory.prototype.getProxyFunction_ = function(fnName) {
  return function() {
    return this.$mock_[fnName].apply(this.$mock_, arguments);
  };
};


/**
 * Find a mock instance for a given class name and argument list.
 * @param {string} className The name of the class.
 * @param {Array<?>} args The argument list to match.
 * @return {goog.testing.StrictMock|goog.testing.LooseMock} The mock found for
 *     the given argument list.
 * @private
 */
goog.testing.MockClassFactory.prototype.findMockInstance_ = function(
    className, args) {
  return this.mockClassRecords_[className].findMockInstance(args);
};


/**
 * Create a proxy class.  A proxy will pass functions to the mock for a class.
 * The proxy class only covers prototype methods.  A static mock is not build
 * simultaneously since it might be strict or loose.  The proxy class inherits
 * from the target class in order to preserve instanceof checks.
 * @param {Object} namespace A javascript namespace (e.g. goog.testing).
 * @param {Function} classToMock The class that will be proxied.
 * @param {string} className The name of the class.
 * @return {!Function} The proxy for provided class.
 * @private
 */
goog.testing.MockClassFactory.prototype.createProxy_ = function(
    namespace, classToMock, className) {
  var proxy =
      this.getProxyCtor_(className, goog.bind(this.findMockInstance_, this));
  var protoToProxy = classToMock.prototype;
  // Preserve base() call in mocked class
  var classToMockBase = classToMock.base;
  goog.inherits(proxy, classToMock);
  proxy.base = classToMockBase;

  for (var prop in protoToProxy) {
    if (goog.isFunction(protoToProxy[prop])) {
      proxy.prototype[prop] = this.getProxyFunction_(prop);
    }
  }

  // For IE the for-in-loop does not contain any properties that are not
  // enumerable on the prototype object (for example isPrototypeOf from
  // Object.prototype) and it will also not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
  // TODO (arv): Implement goog.object.getIterator and replace this loop.

  goog.array.forEach(
      goog.testing.MockClassFactory.PROTOTYPE_FIELDS_, function(field) {
        if (Object.prototype.hasOwnProperty.call(protoToProxy, field)) {
          proxy.prototype[field] = this.getProxyFunction_(field);
        }
      }, this);

  this.mockClassRecords_[className] = new goog.testing.MockClassRecord(
      namespace, className, classToMock, proxy);
  namespace[className] = proxy;
  return proxy;
};


/**
 * Gets either a loose or strict mock for a given class based on a set of
 * arguments.
 * @param {Object} namespace A javascript namespace (e.g. goog.testing).
 * @param {Function} classToMock The class that will be mocked.
 * @param {boolean} isStrict Whether or not the mock should be strict.
 * @param {IArrayLike<?>} ctorArgs The arguments associated with this
 *     instance's constructor.
 * @return {!goog.testing.StrictMock|!goog.testing.LooseMock} The mock created
 *     for the provided class.
 * @private
 */
goog.testing.MockClassFactory.prototype.getMockClass_ = function(
    namespace, classToMock, isStrict, ctorArgs) {
  var className = this.getClassName_(namespace, classToMock);

  // The namespace and classToMock variables should be removed from the
  // passed in argument stack.
  ctorArgs = goog.array.slice(ctorArgs, 2);

  if (goog.isFunction(classToMock)) {
    var mock = isStrict ? new goog.testing.StrictMock(classToMock) :
                          new goog.testing.LooseMock(classToMock);

    if (!this.classHasMock_(className)) {
      this.createProxy_(namespace, classToMock, className);
    } else {
      var instance = this.findMockInstance_(className, ctorArgs);
      if (instance) {
        throw Error(
            'Mock instance already created for ' + className +
            ' with arguments ' + ctorArgs.join(', '));
      }
    }
    this.mockClassRecords_[className].addMockInstance(ctorArgs, mock);

    return mock;
  } else {
    throw Error(
        'Cannot create a mock class for ' + className + ' of type ' +
        typeof classToMock);
  }
};


/**
 * Gets a strict mock for a given class.
 * @param {Object} namespace A javascript namespace (e.g. goog.testing).
 * @param {Function} classToMock The class that will be mocked.
 * @param {...*} var_args The arguments associated with this instance's
 *     constructor.
 * @return {!goog.testing.StrictMock} The mock created for the provided class.
 */
goog.testing.MockClassFactory.prototype.getStrictMockClass = function(
    namespace, classToMock, var_args) {
  return /** @type {!goog.testing.StrictMock} */ (
      this.getMockClass_(namespace, classToMock, true, arguments));
};


/**
 * Gets a loose mock for a given class.
 * @param {Object} namespace A javascript namespace (e.g. goog.testing).
 * @param {Function} classToMock The class that will be mocked.
 * @param {...*} var_args The arguments associated with this instance's
 *     constructor.
 * @return {goog.testing.LooseMock} The mock created for the provided class.
 */
goog.testing.MockClassFactory.prototype.getLooseMockClass = function(
    namespace, classToMock, var_args) {
  return /** @type {goog.testing.LooseMock} */ (
      this.getMockClass_(namespace, classToMock, false, arguments));
};


/**
 * Creates either a loose or strict mock for the static functions of a given
 * class.
 * @param {Function} classToMock The class whose static functions will be
 *     mocked.  This should be the original class and not the proxy.
 * @param {string} className The name of the class.
 * @param {Function} proxy The proxy that will replace the original class.
 * @param {boolean} isStrict Whether or not the mock should be strict.
 * @return {!goog.testing.StrictMock|!goog.testing.LooseMock} The mock created
 *     for the static functions of the provided class.
 * @private
 */
goog.testing.MockClassFactory.prototype.createStaticMock_ = function(
    classToMock, className, proxy, isStrict) {
  var mock = isStrict ? new goog.testing.StrictMock(classToMock, true) :
                        new goog.testing.LooseMock(classToMock, false, true);

  for (var prop in classToMock) {
    if (goog.isFunction(classToMock[prop])) {
      proxy[prop] = goog.bind(mock.$mockMethod, mock, prop);
    } else if (classToMock[prop] !== classToMock.prototype) {
      proxy[prop] = classToMock[prop];
    }
  }

  this.mockClassRecords_[className].setStaticMock(mock);
  return mock;
};


/**
 * Gets either a loose or strict mock for the static functions of a given class.
 * @param {Object} namespace A javascript namespace (e.g. goog.testing).
 * @param {Function} classToMock The class whose static functions will be
 *     mocked.  This should be the original class and not the proxy.
 * @param {boolean} isStrict Whether or not the mock should be strict.
 * @return {goog.testing.StrictMock|goog.testing.LooseMock} The mock created
 *     for the static functions of the provided class.
 * @private
 */
goog.testing.MockClassFactory.prototype.getStaticMock_ = function(
    namespace, classToMock, isStrict) {
  var className = this.getClassName_(namespace, classToMock);

  if (goog.isFunction(classToMock)) {
    if (!this.classHasMock_(className)) {
      var proxy = this.createProxy_(namespace, classToMock, className);
      var mock =
          this.createStaticMock_(classToMock, className, proxy, isStrict);
      return mock;
    }

    if (!this.mockClassRecords_[className].getStaticMock()) {
      var proxy = this.mockClassRecords_[className].getProxy();
      var originalClass = this.mockClassRecords_[className].getOriginalClass();
      var mock =
          this.createStaticMock_(originalClass, className, proxy, isStrict);
      return mock;
    } else {
      var mock = this.mockClassRecords_[className].getStaticMock();
      var mockIsStrict = mock instanceof goog.testing.StrictMock;

      if (mockIsStrict != isStrict) {
        var mockType =
            mock instanceof goog.testing.StrictMock ? 'strict' : 'loose';
        var requestedType = isStrict ? 'strict' : 'loose';
        throw Error(
            'Requested a ' + requestedType + ' static mock, but a ' + mockType +
            ' mock already exists.');
      }

      return mock;
    }
  } else {
    throw Error(
        'Cannot create a mock for the static functions of ' + className +
        ' of type ' + typeof classToMock);
  }
};


/**
 * Gets a strict mock for the static functions of a given class.
 * @param {Object} namespace A javascript namespace (e.g. goog.testing).
 * @param {Function} classToMock The class whose static functions will be
 *     mocked.  This should be the original class and not the proxy.
 * @return {goog.testing.StrictMock} The mock created for the static functions
 *     of the provided class.
 */
goog.testing.MockClassFactory.prototype.getStrictStaticMock = function(
    namespace, classToMock) {
  return /** @type {goog.testing.StrictMock} */ (
      this.getStaticMock_(namespace, classToMock, true));
};


/**
 * Gets a loose mock for the static functions of a given class.
 * @param {Object} namespace A javascript namespace (e.g. goog.testing).
 * @param {Function} classToMock The class whose static functions will be
 *     mocked.  This should be the original class and not the proxy.
 * @return {goog.testing.LooseMock} The mock created for the static functions
 *     of the provided class.
 */
goog.testing.MockClassFactory.prototype.getLooseStaticMock = function(
    namespace, classToMock) {
  return /** @type {goog.testing.LooseMock} */ (
      this.getStaticMock_(namespace, classToMock, false));
};


/**
 * Resests the factory by reverting all mocked classes to their original
 * implementations and removing all MockClassRecords.
 */
goog.testing.MockClassFactory.prototype.reset = function() {
  goog.object.forEach(
      this.mockClassRecords_, function(record) { record.reset(); });
  this.mockClassRecords_ = {};
};
