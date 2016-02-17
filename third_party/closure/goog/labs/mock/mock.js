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
 * @fileoverview Provides a mocking framework in Closure to make unit tests easy
 * to write and understand. The methods provided here can be used to replace
 * implementations of existing objects with 'mock' objects to abstract out
 * external services and dependencies thereby isolating the code under test.
 * Apart from mocking, methods are also provided to just monitor calls to an
 * object (spying) and returning specific values for some or all the inputs to
 * methods (stubbing).
 *
 * Design doc : http://go/closuremock
 *
 */


goog.provide('goog.labs.mock');
goog.provide('goog.labs.mock.VerificationError');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.debug');
goog.require('goog.debug.Error');
goog.require('goog.functions');
goog.require('goog.object');


/**
 * Mocks a given object or class.
 *
 * @param {!Object} objectOrClass An instance or a constructor of a class to be
 *     mocked.
 * @return {!Object} The mocked object.
 */
goog.labs.mock.mock = function(objectOrClass) {
  // Go over properties of 'objectOrClass' and create a MockManager to
  // be used for stubbing out calls to methods.
  var mockObjectManager = new goog.labs.mock.MockObjectManager_(objectOrClass);
  var mockedObject = mockObjectManager.getMockedItem();
  goog.asserts.assertObject(mockedObject);
  return /** @type {!Object} */ (mockedObject);
};


/**
 * Mocks a given function.
 *
 * @param {!Function} func A function to be mocked.
 * @return {!Function} The mocked function.
 */
goog.labs.mock.mockFunction = function(func) {
  var mockFuncManager = new goog.labs.mock.MockFunctionManager_(func);
  var mockedFunction = mockFuncManager.getMockedItem();
  goog.asserts.assertFunction(mockedFunction);
  return /** @type {!Function} */ (mockedFunction);
};


/**
 * Spies on a given object.
 *
 * @param {!Object} obj The object to be spied on.
 * @return {!Object} The spy object.
 */
goog.labs.mock.spy = function(obj) {
  // Go over properties of 'obj' and create a MockSpyManager_ to
  // be used for spying on calls to methods.
  var mockSpyManager = new goog.labs.mock.MockSpyManager_(obj);
  var spyObject = mockSpyManager.getMockedItem();
  goog.asserts.assert(spyObject);
  return spyObject;
};


/**
 * Returns an object that can be used to verify calls to specific methods of a
 * given mock.
 *
 * @param {!Object} obj The mocked object.
 * @return {!Object} The verifier.
 */
goog.labs.mock.verify = function(obj) {
  return obj.$callVerifier;
};


/**
 * Returns a name to identify a function. Named functions return their names,
 * unnamed functions return a string of the form '#anonymous{ID}' where ID is
 * a unique identifier for each anonymous function.
 * @private
 * @param {!Function} func The function.
 * @return {string} The function name.
 */
goog.labs.mock.getFunctionName_ = function(func) {
  var funcName = goog.debug.getFunctionName(func);
  if (funcName == '' || funcName == '[Anonymous]') {
    funcName = '#anonymous' + goog.labs.mock.getUid(func);
  }
  return funcName;
};


/**
 * Returns a nicely formatted, readble representation of a method call.
 * @private
 * @param {string} methodName The name of the method.
 * @param {Array<?>=} opt_args The method arguments.
 * @return {string} The string representation of the method call.
 */
goog.labs.mock.formatMethodCall_ = function(methodName, opt_args) {
  opt_args = opt_args || [];
  opt_args = goog.array.map(opt_args, function(arg) {
    if (goog.isFunction(arg)) {
      var funcName = goog.labs.mock.getFunctionName_(arg);
      return '<function ' + funcName + '>';
    } else {
      var isObjectWithClass = goog.isObject(arg) && !goog.isFunction(arg) &&
          !goog.isArray(arg) && arg.constructor != Object;

      if (isObjectWithClass) {
        return arg.toString();
      }

      return goog.labs.mock.formatValue_(arg);
    }
  });
  return methodName + '(' + opt_args.join(', ') + ')';
};


/**
 * An array to store objects for unique id generation.
 * @private
 * @type {!Array<!Object>}
 */
goog.labs.mock.uid_ = [];


/**
 * A unique Id generator that does not modify the object.
 * @param {Object!} obj The object whose unique ID we want to generate.
 * @return {number} an unique id for the object.
 */
goog.labs.mock.getUid = function(obj) {
  var index = goog.array.indexOf(goog.labs.mock.uid_, obj);
  if (index == -1) {
    index = goog.labs.mock.uid_.length;
    goog.labs.mock.uid_.push(obj);
  }
  return index;
};


/**
 * This is just another implementation of goog.debug.deepExpose with a more
 * compact format.
 * @private
 * @param {*} obj The object whose string representation will be returned.
 * @param {boolean=} opt_id Whether to include the id of objects or not.
 *     Defaults to true.
 * @return {string} The string representation of the object.
 */
goog.labs.mock.formatValue_ = function(obj, opt_id) {
  var id = goog.isDef(opt_id) ? opt_id : true;
  var previous = [];
  var output = [];

  var helper = function(obj) {
    var indentMultiline = function(output) {
      return output.replace(/\n/g, '\n');
    };

    /** @preserveTry */
    try {
      if (!goog.isDef(obj)) {
        output.push('undefined');
      } else if (goog.isNull(obj)) {
        output.push('NULL');
      } else if (goog.isString(obj)) {
        output.push('"' + indentMultiline(obj) + '"');
      } else if (goog.isFunction(obj)) {
        var funcName = goog.labs.mock.getFunctionName_(obj);
        output.push('<function ' + funcName + '>');
      } else if (goog.isObject(obj)) {
        if (goog.array.contains(previous, obj)) {
          if (id) {
            output.push(
                '<recursive/dupe obj_' + goog.labs.mock.getUid(obj) + '>');
          } else {
            output.push('<recursive/dupe>');
          }
        } else {
          previous.push(obj);
          output.push('{');
          var inner_obj = [];
          for (var x in obj) {
            output.push(' ');
            output.push(
                '"' + x + '"' +
                ':');
            helper(obj[x]);
          }
          if (id) {
            output.push(' _id:' + goog.labs.mock.getUid(obj));
          }
          output.push('}');
        }
      } else {
        output.push(obj);
      }
    } catch (e) {
      output.push('*** ' + e + ' ***');
    }
  };

  helper(obj);
  return output.join('')
      .replace(/"closure_uid_\d+"/g, '_id')
      .replace(/{ /g, '{');

};



/**
 * Error thrown when verification failed.
 *
 * @param {Array<!goog.labs.mock.MethodBinding_>} recordedCalls
 *     The recorded calls that didn't match the expectation.
 * @param {!string} methodName The expected method call.
 * @param {!Array<?>} args The expected arguments.
 * @constructor
 * @extends {goog.debug.Error}
 * @final
 */
goog.labs.mock.VerificationError = function(recordedCalls, methodName, args) {
  var msg = goog.labs.mock.VerificationError.getVerificationErrorMsg_(
      recordedCalls, methodName, args);
  goog.labs.mock.VerificationError.base(this, 'constructor', msg);
};
goog.inherits(goog.labs.mock.VerificationError, goog.debug.Error);


/** @override */
goog.labs.mock.VerificationError.prototype.name = 'VerificationError';


/**
 * This array contains the name of the functions that are part of the base
 * Object prototype.
 * Basically a copy of goog.object.PROTOTYPE_FIELDS_.
 * @const
 * @type {!Array<string>}
 * @private
 */
goog.labs.mock.PROTOTYPE_FIELDS_ = [
  'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
  'toLocaleString', 'toString', 'valueOf'
];


/**
 * Constructs a descriptive error message for an expected method call.
 * @private
 * @param {Array<!goog.labs.mock.MethodBinding_>} recordedCalls
 *     The recorded calls that didn't match the expectation.
 * @param {!string} methodName The expected method call.
 * @param {!Array<?>} args The expected arguments.
 * @return {string} The error message.
 */
goog.labs.mock.VerificationError.getVerificationErrorMsg_ = function(
    recordedCalls, methodName, args) {

  recordedCalls = goog.array.filter(recordedCalls, function(binding) {
    return binding.getMethodName() == methodName;
  });

  var expected = goog.labs.mock.formatMethodCall_(methodName, args);

  var msg = '\nExpected: ' + expected.toString();
  msg += '\nRecorded: ';

  if (recordedCalls.length > 0) {
    msg += recordedCalls.join(',\n          ');
  } else {
    msg += 'No recorded calls';
  }

  return msg;
};



/**
 * Base class that provides basic functionality for creating, adding and
 * finding bindings, offering an executor method that is called when a call to
 * the stub is made, an array to hold the bindings and the mocked item, among
 * other things.
 *
 * @constructor
 * @struct
 * @private
 */
goog.labs.mock.MockManager_ = function() {
  /**
   * Proxies the methods for the mocked object or class to execute the stubs.
   * @type {!Object}
   * @protected
   */
  this.mockedItem = {};

  /**
   * A reference to the object or function being mocked.
   * @type {Object|Function}
   * @protected
   */
  this.mockee = null;

  /**
   * Holds the stub bindings established so far.
   * @protected
   */
  this.methodBindings = [];

  /**
   * Holds a reference to the binder used to define stubs.
   * @protected
   */
  this.$stubBinder = null;

  /**
   * Record method calls with no stub definitions.
   * @type {!Array<!goog.labs.mock.MethodBinding_>}
   * @private
   */
  this.callRecords_ = [];
};


/**
 * Handles the first step in creating a stub, returning a stub-binder that
 * is later used to bind a stub for a method.
 *
 * @param {string} methodName The name of the method being bound.
 * @param {...*} var_args The arguments to the method.
 * @return {!goog.labs.mock.StubBinder_} The stub binder.
 * @private
 */
goog.labs.mock.MockManager_.prototype.handleMockCall_ = function(
    methodName, var_args) {
  var args = goog.array.slice(arguments, 1);
  return new goog.labs.mock.StubBinder_(this, methodName, args);
};


/**
 * Returns the mock object. This should have a stubbed method for each method
 * on the object being mocked.
 *
 * @return {!Object|!Function} The mock object.
 */
goog.labs.mock.MockManager_.prototype.getMockedItem = function() {
  return this.mockedItem;
};


/**
 * Adds a binding for the method name and arguments to be stubbed.
 *
 * @param {?string} methodName The name of the stubbed method.
 * @param {!Array<?>} args The arguments passed to the method.
 * @param {!Function} func The stub function.
 *
 */
goog.labs.mock.MockManager_.prototype.addBinding = function(
    methodName, args, func) {
  var binding = new goog.labs.mock.MethodBinding_(methodName, args, func);
  this.methodBindings.push(binding);
};


/**
 * Returns a stub, if defined, for the method name and arguments passed in.
 * If there are multiple stubs for this method name and arguments, then
 * the first one is returned and removed from the list.
 *
 * @param {string} methodName The name of the stubbed method.
 * @param {!Array<?>} args The arguments passed to the method.
 * @return {Function} The stub function or undefined.
 * @protected
 */
goog.labs.mock.MockManager_.prototype.getNextBinding = function(
    methodName, args) {
  var first = -1;
  var count = 0;
  var stub = null;
  goog.array.forEach(this.methodBindings, function(binding, i) {
    if (binding.matches(methodName, args, false /* isVerification */)) {
      count++;
      if (goog.isNull(stub)) {
        first = i;
        stub = binding;
      }
    }
  });
  if (count > 1) {
    goog.array.removeAt(this.methodBindings, first);
  }
  return stub && stub.getStub();
};


/**
 * Returns a stub, if defined, for the method name and arguments passed in as
 * parameters.
 *
 * @param {string} methodName The name of the stubbed method.
 * @param {!Array<?>} args The arguments passed to the method.
 * @return {Function} The stub function or undefined.
 * @protected
 */
goog.labs.mock.MockManager_.prototype.getExecutor = function(methodName, args) {
  return this.getNextBinding(methodName, args);
};


/**
 * Looks up the list of stubs defined on the mock object and executes the
 * function associated with that stub.
 *
 * @param {string} methodName The name of the method to execute.
 * @param {...*} var_args The arguments passed to the method.
 * @return {*} Value returned by the stub function.
 * @protected
 */
goog.labs.mock.MockManager_.prototype.executeStub = function(
    methodName, var_args) {
  var args = goog.array.slice(arguments, 1);

  // Record this call
  this.recordCall_(methodName, args);

  var func = this.getExecutor(methodName, args);
  if (func) {
    return func.apply(null, args);
  }
};


/**
 * Records a call to 'methodName' with arguments 'args'.
 *
 * @param {string} methodName The name of the called method.
 * @param {!Array<?>} args The array of arguments.
 * @private
 */
goog.labs.mock.MockManager_.prototype.recordCall_ = function(methodName, args) {
  var callRecord =
      new goog.labs.mock.MethodBinding_(methodName, args, goog.nullFunction);

  this.callRecords_.push(callRecord);
};


/**
 * Verify invocation of a method with specific arguments.
 *
 * @param {string} methodName The name of the method.
 * @param {...*} var_args The arguments passed.
 * @protected
 */
goog.labs.mock.MockManager_.prototype.verifyInvocation = function(
    methodName, var_args) {
  var args = goog.array.slice(arguments, 1);
  var binding = goog.array.find(this.callRecords_, function(binding) {
    return binding.matches(methodName, args, true /* isVerification */);
  });

  if (!binding) {
    throw new goog.labs.mock.VerificationError(
        this.callRecords_, methodName, args);
  }
};



/**
 * Sets up mock for the given object (or class), stubbing out all the defined
 * methods. By default, all stubs return {@code undefined}, though stubs can be
 * later defined using {@code goog.labs.mock.when}.
 *
 * @param {!Object|!Function} objOrClass The object or class to set up the mock
 *     for. A class is a constructor function.
 *
 * @constructor
 * @struct
 * @extends {goog.labs.mock.MockManager_}
 * @private
 */
goog.labs.mock.MockObjectManager_ = function(objOrClass) {
  goog.labs.mock.MockObjectManager_.base(this, 'constructor');

  /**
   * Proxies the calls to establish the first step of the stub bindings (object
   * and method name)
   * @private
   */
  this.objectStubBinder_ = {};

  this.mockee = objOrClass;

  /**
   * The call verifier is used to verify the calls. It maps property names to
   * the method that does call verification.
   * @type {!Object<string, function(string, ...)>}
   * @private
   */
  this.objectCallVerifier_ = {};

  var obj;
  if (goog.isFunction(objOrClass)) {
    // Create a temporary subclass with a no-op constructor so that we can
    // create an instance and determine what methods it has.
    /**
 * @constructor
 * @final
 */
    var tempCtor = function() {};
    goog.inherits(tempCtor, objOrClass);
    obj = new tempCtor();
  } else {
    obj = objOrClass;
  }

  // Put the object being mocked in the prototype chain of the mock so that
  // it has all the correct properties and instanceof works.
  /**
 * @constructor
 * @final
 */
  var mockedItemCtor = function() {};
  mockedItemCtor.prototype = obj;
  this.mockedItem = new mockedItemCtor();

  var enumerableProperties = goog.object.getKeys(obj);
  // The non enumerable properties are added due to the fact that IE8 does not
  // enumerate any of the prototype Object functions even when overriden and
  // mocking these is sometimes needed.
  for (var i = 0; i < goog.labs.mock.PROTOTYPE_FIELDS_.length; i++) {
    var prop = goog.labs.mock.PROTOTYPE_FIELDS_[i];
    if (!goog.array.contains(enumerableProperties, prop)) {
      enumerableProperties.push(prop);
    }
  }

  // Adds the properties to the mock, creating a proxy stub for each method on
  // the instance.
  for (var i = 0; i < enumerableProperties.length; i++) {
    var prop = enumerableProperties[i];
    if (goog.isFunction(obj[prop])) {
      this.mockedItem[prop] = goog.bind(this.executeStub, this, prop);
      // The stub binder used to create bindings.
      this.objectStubBinder_[prop] =
          goog.bind(this.handleMockCall_, this, prop);
      // The verifier verifies the calls.
      this.objectCallVerifier_[prop] =
          goog.bind(this.verifyInvocation, this, prop);
    }
  }
  // The alias for stub binder exposed to the world.
  this.mockedItem.$stubBinder = this.objectStubBinder_;

  // The alias for verifier for the world.
  this.mockedItem.$callVerifier = this.objectCallVerifier_;
};
goog.inherits(goog.labs.mock.MockObjectManager_, goog.labs.mock.MockManager_);



/**
 * Sets up the spying behavior for the given object.
 *
 * @param {!Object} obj The object to be spied on.
 *
 * @constructor
 * @struct
 * @extends {goog.labs.mock.MockObjectManager_}
 * @private
 */
goog.labs.mock.MockSpyManager_ = function(obj) {
  goog.labs.mock.MockSpyManager_.base(this, 'constructor', obj);
};
goog.inherits(
    goog.labs.mock.MockSpyManager_, goog.labs.mock.MockObjectManager_);


/**
 * Return a stub, if defined, for the method and arguments passed in. If we lack
 * a stub, instead look for a call record that matches the method and arguments.
 *
 * @return {!Function} The stub or the invocation logger, if defined.
 * @override
 */
goog.labs.mock.MockSpyManager_.prototype.getNextBinding = function(
    methodName, args) {
  var stub = goog.labs.mock.MockSpyManager_.base(
      this, 'getNextBinding', methodName, args);

  if (!stub) {
    stub = goog.bind(this.mockee[methodName], this.mockee);
  }

  return stub;
};



/**
 * Sets up mock for the given function, stubbing out. By default, all stubs
 * return {@code undefined}, though stubs can be later defined using
 * {@code goog.labs.mock.when}.
 *
 * @param {!Function} func The function to set up the mock for.
 *
 * @constructor
 * @struct
 * @extends {goog.labs.mock.MockManager_}
 * @private
 */
goog.labs.mock.MockFunctionManager_ = function(func) {
  goog.labs.mock.MockFunctionManager_.base(this, 'constructor');

  this.func_ = func;

  /**
   * The stub binder used to create bindings.
   * Sets the first argument of handleMockCall_ to the function name.
   * @type {!Function}
   * @private
   */
  this.functionStubBinder_ = this.useMockedFunctionName_(this.handleMockCall_);

  this.mockedItem = this.useMockedFunctionName_(this.executeStub);
  this.mockedItem.$stubBinder = this.functionStubBinder_;

  /**
   * The call verifier is used to verify function invocations.
   * Sets the first argument of verifyInvocation to the function name.
   * @type {!Function}
   */
  this.mockedItem.$callVerifier =
      this.useMockedFunctionName_(this.verifyInvocation);
};
goog.inherits(goog.labs.mock.MockFunctionManager_, goog.labs.mock.MockManager_);


/**
 * Given a method, returns a new function that calls the first one setting
 * the first argument to the mocked function name.
 * This is used to dynamically override the stub binders and call verifiers.
 * @private
 * @param {Function} nextFunc The function to override.
 * @return {!Function} The overloaded function.
 */
goog.labs.mock.MockFunctionManager_.prototype.useMockedFunctionName_ = function(
    nextFunc) {
  return goog.bind(function(var_args) {
    var args = goog.array.slice(arguments, 0);
    var name = '#mockFor<' + goog.labs.mock.getFunctionName_(this.func_) + '>';
    goog.array.insertAt(args, name, 0);
    return nextFunc.apply(this, args);
  }, this);
};



/**
 * The stub binder is the object that helps define the stubs by binding
 * method name to the stub method.
 *
 * @param {!goog.labs.mock.MockManager_}
 *   mockManager The mock manager.
 * @param {?string} name The method name.
 * @param {!Array<?>} args The other arguments to the method.
 *
 * @constructor
 * @struct
 * @private
 */
goog.labs.mock.StubBinder_ = function(mockManager, name, args) {
  /**
   * The mock manager instance.
   * @type {!goog.labs.mock.MockManager_}
   * @private
   */
  this.mockManager_ = mockManager;

  /**
   * Holds the name of the method to be bound.
   * @type {?string}
   * @private
   */
  this.name_ = name;

  /**
   * Holds the arguments for the method.
   * @type {!Array<?>}
   * @private
   */
  this.args_ = args;
};


/**
 * Defines the stub to be called for the method name and arguments bound
 * earlier.
 * TODO(user): Add support for the 'Answer' interface.
 *
 * @param {!Function} func The stub.
 */
goog.labs.mock.StubBinder_.prototype.then = function(func) {
  this.mockManager_.addBinding(this.name_, this.args_, func);
};


/**
 * Defines the stub to return a specific value for a method name and arguments.
 *
 * @param {*} value The value to return.
 */
goog.labs.mock.StubBinder_.prototype.thenReturn = function(value) {
  this.mockManager_.addBinding(
      this.name_, this.args_, goog.functions.constant(value));
};


/**
 * Facilitates (and is the first step in) setting up stubs. Obtains an object
 * on which, the method to be mocked is called to create a stub. Sample usage:
 *
 * var mockObj = goog.labs.mock.mock(objectBeingMocked);
 * goog.labs.mock.when(mockObj).getFoo(3).thenReturn(4);
 *
 * @param {!Object} mockObject The mocked object.
 * @return {!goog.labs.mock.StubBinder_} The property binder.
 */
goog.labs.mock.when = function(mockObject) {
  goog.asserts.assert(mockObject.$stubBinder, 'Stub binder cannot be null!');
  return mockObject.$stubBinder;
};



/**
 * Represents a binding between a method name, args and a stub.
 *
 * @param {?string} methodName The name of the method being stubbed.
 * @param {!Array<?>} args The arguments passed to the method.
 * @param {!Function} stub The stub function to be called for the given method.
 * @constructor
 * @struct
 * @private
 */
goog.labs.mock.MethodBinding_ = function(methodName, args, stub) {
  /**
   * The name of the method being stubbed.
   * @type {?string}
   * @private
   */
  this.methodName_ = methodName;

  /**
   * The arguments for the method being stubbed.
   * @type {!Array<?>}
   * @private
   */
  this.args_ = args;

  /**
   * The stub function.
   * @type {!Function}
   * @private
   */
  this.stub_ = stub;
};


/**
 * @return {!Function} The stub to be executed.
 */
goog.labs.mock.MethodBinding_.prototype.getStub = function() {
  return this.stub_;
};


/**
 * @override
 * @return {string} A readable string representation of the binding
 *  as a method call.
 */
goog.labs.mock.MethodBinding_.prototype.toString = function() {
  return goog.labs.mock.formatMethodCall_(this.methodName_ || '', this.args_);
};


/**
 * @return {string} The method name for this binding.
 */
goog.labs.mock.MethodBinding_.prototype.getMethodName = function() {
  return this.methodName_ || '';
};


/**
 * Determines whether the given args match the stored args_. Used to determine
 * which stub to invoke for a method.
 *
 * @param {string} methodName The name of the method being stubbed.
 * @param {!Array<?>} args An array of arguments.
 * @param {boolean} isVerification Whether this is a function verification call
 *     or not.
 * @return {boolean} If it matches the stored arguments.
 */
goog.labs.mock.MethodBinding_.prototype.matches = function(
    methodName, args, isVerification) {
  var specs = isVerification ? args : this.args_;
  var calls = isVerification ? this.args_ : args;

  // TODO(user): More elaborate argument matching. Think about matching
  //    objects.
  return this.methodName_ == methodName &&
      goog.array.equals(calls, specs, function(arg, spec) {
        // Duck-type to see if this is an object that implements the
        // goog.labs.testing.Matcher interface.
        if (goog.isFunction(spec.matches)) {
          return spec.matches(arg);
        } else {
          return goog.array.defaultCompareEquality(spec, arg);
        }
      });
};
