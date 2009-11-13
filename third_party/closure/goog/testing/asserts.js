// Copyright 2009 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.testing.JsUnitException');
goog.provide('goog.testing.asserts');

goog.require('goog.testing.stacktrace');

// TODO: Copied from JsUnit with some small modifications, we should
// reimplement the asserters.

/**
 * @type {Array|NodeList|Arguments|{length: number}}
 */
goog.testing.asserts.ArrayLike = goog.typedef;

var DOUBLE_EQUALITY_PREDICATE = function(var1, var2) {
  return var1 == var2;
};
var JSUNIT_UNDEFINED_VALUE;
var TRIPLE_EQUALITY_PREDICATE = function(var1, var2) {
  return var1 === var2;
};
var TO_STRING_EQUALITY_PREDICATE = function(var1, var2) {
  return var1.toString() === var2.toString();
};

var PRIMITIVE_EQUALITY_PREDICATES = {
  'String': DOUBLE_EQUALITY_PREDICATE,
  'Number': DOUBLE_EQUALITY_PREDICATE,
  'Boolean': DOUBLE_EQUALITY_PREDICATE,
  'Date': TRIPLE_EQUALITY_PREDICATE,
  'RegExp': TO_STRING_EQUALITY_PREDICATE,
  'Function': TO_STRING_EQUALITY_PREDICATE
};


function _trueTypeOf(something) {
  var result = typeof something;
  try {
    switch (result) {
      case 'string':
        break;
      case 'boolean':
        break;
      case 'number':
        break;
      case 'object':
      case 'function':
        switch (something.constructor) {
          case new String('').constructor:
            result = 'String';
            break;
          case new Boolean(true).constructor:
            result = 'Boolean';
            break;
          case new Number(0).constructor:
            result = 'Number';
            break;
          case new Array().constructor:
            result = 'Array';
            break;
          case new RegExp().constructor:
            result = 'RegExp';
            break;
          case new Date().constructor:
            result = 'Date';
            break;
          case Function:
            result = 'Function';
            break;
          default:
            var m = something.constructor.toString().match(
                /function\s*([^( ]+)\(/);
            if (m) {
              result = m[1];
            } else {
              break;
            }
        }
        break;
    }
  } finally {
    result = result.substr(0, 1).toUpperCase() + result.substr(1);
    return result;
  }
}

function _displayStringForValue(aVar) {
  var result = '<' + aVar + '>';
  if (!(aVar === null || aVar === JSUNIT_UNDEFINED_VALUE)) {
    result += ' (' + _trueTypeOf(aVar) + ')';
  }
  return result;
}

function fail(failureMessage) {
  goog.testing.asserts.raiseException_('Call to fail()', failureMessage);
}

function argumentsIncludeComments(expectedNumberOfNonCommentArgs, args) {
  return args.length == expectedNumberOfNonCommentArgs + 1;
}

function commentArg(expectedNumberOfNonCommentArgs, args) {
  if (argumentsIncludeComments(expectedNumberOfNonCommentArgs, args)) {
    return args[0];
  }

  return null;
}

function nonCommentArg(desiredNonCommentArgIndex,
    expectedNumberOfNonCommentArgs, args) {
  return argumentsIncludeComments(expectedNumberOfNonCommentArgs, args) ?
      args[desiredNonCommentArgIndex] :
      args[desiredNonCommentArgIndex - 1];
}

function _validateArguments(expectedNumberOfNonCommentArgs, args) {
  var valid = args.length == expectedNumberOfNonCommentArgs ||
      args.length == expectedNumberOfNonCommentArgs + 1 &&
      goog.isString(args[0]);
  _assert(null, valid, 'Incorrect arguments passed to assert function');
}

function _assert(comment, booleanValue, failureMessage) {
  if (!booleanValue) {
    goog.testing.asserts.raiseException_(comment, failureMessage);
  }
}

function assert(a, opt_b) {
  _validateArguments(1, arguments);
  var comment = commentArg(1, arguments);
  var booleanValue = nonCommentArg(1, 1, arguments);

  _assert(comment, goog.isBoolean(booleanValue),
      'Bad argument to assert(boolean)');
  _assert(comment, booleanValue, 'Call to assert(boolean) with false');
}

function assertThrows(a, opt_b) {
  _validateArguments(1, arguments);
  var func = nonCommentArg(1, 1, arguments);
  _assert(commentArg(1, arguments), typeof func == 'function',
      'Argument passed to assertThrows is not a function');

  var isOk = false;
  try {
    func();
  } catch (e) {
    isOk = true;
  }
  _assert(commentArg(1, arguments), isOk,
      'No exception thrown from function passed to assertThrows');
}

function assertNotThrows(a, opt_b) {
  _validateArguments(1, arguments);
  var func = nonCommentArg(1, 1, arguments);
  _assert(commentArg(1, arguments), typeof func == 'function',
      'Argument passed to assertNotThrows is not a function');

  var isOk = true;
  try {
    func();
  } catch (e) {
    isOk = false;
  }
  _assert(commentArg(1, arguments), isOk,
      'A non expected exception was thrown from function passed to ' +
      'assertNotThrows');
}

function assertTrue(a, opt_b) {
  _validateArguments(1, arguments);
  var comment = commentArg(1, arguments);
  var booleanValue = nonCommentArg(1, 1, arguments);

  _assert(comment, goog.isBoolean(booleanValue),
      'Bad argument to assertTrue(boolean)');
  _assert(comment, booleanValue, 'Call to assertTrue(boolean) with false');
}

function assertFalse(a, opt_b) {
  _validateArguments(1, arguments);
  var comment = commentArg(1, arguments);
  var booleanValue = nonCommentArg(1, 1, arguments);

  _assert(comment, goog.isBoolean(booleanValue),
      'Bad argument to assertFalse(boolean)');
  _assert(comment, !booleanValue, 'Call to assertFalse(boolean) with true');
}

function assertEquals(a, b, opt_c) {
  _validateArguments(2, arguments);
  var var1 = nonCommentArg(1, 2, arguments);
  var var2 = nonCommentArg(2, 2, arguments);
  _assert(commentArg(2, arguments), var1 === var2,
          'Expected ' + _displayStringForValue(var1) + ' but was ' +
          _displayStringForValue(var2));
}

function assertNotEquals(a, b, opt_c) {
  _validateArguments(2, arguments);
  var var1 = nonCommentArg(1, 2, arguments);
  var var2 = nonCommentArg(2, 2, arguments);
  _assert(commentArg(2, arguments), var1 !== var2,
      'Expected not to be ' + _displayStringForValue(var2));
}

function assertNull(a, opt_b) {
  _validateArguments(1, arguments);
  var aVar = nonCommentArg(1, 1, arguments);
  _assert(commentArg(1, arguments), aVar === null,
      'Expected ' + _displayStringForValue(null) + ' but was ' +
      _displayStringForValue(aVar));
}

function assertNotNull(a, opt_b) {
  _validateArguments(1, arguments);
  var aVar = nonCommentArg(1, 1, arguments);
  _assert(commentArg(1, arguments), aVar !== null,
      'Expected not to be ' + _displayStringForValue(null));
}

function assertUndefined(a, opt_b) {
  _validateArguments(1, arguments);
  var aVar = nonCommentArg(1, 1, arguments);
  _assert(commentArg(1, arguments), aVar === JSUNIT_UNDEFINED_VALUE,
      'Expected ' + _displayStringForValue(JSUNIT_UNDEFINED_VALUE) +
      ' but was ' + _displayStringForValue(aVar));
}

function assertNotUndefined(a, opt_b) {
  _validateArguments(1, arguments);
  var aVar = nonCommentArg(1, 1, arguments);
  _assert(commentArg(1, arguments), aVar !== JSUNIT_UNDEFINED_VALUE,
      'Expected not to be ' + _displayStringForValue(JSUNIT_UNDEFINED_VALUE));
}

function assertNonEmptyString(a, opt_b) {
  _validateArguments(1, arguments);
  var aVar = nonCommentArg(1, 1, arguments);
  _assert(commentArg(1, arguments),
      aVar !== JSUNIT_UNDEFINED_VALUE && aVar !== null &&
      typeof aVar == 'string' && aVar !== '',
      'Expected non-empty string but was ' + _displayStringForValue(aVar));
}

function assertNaN(a, opt_b) {
  _validateArguments(1, arguments);
  var aVar = nonCommentArg(1, 1, arguments);
  _assert(commentArg(1, arguments), isNaN(aVar), 'Expected NaN');
}

function assertNotNaN(a, opt_b) {
  _validateArguments(1, arguments);
  var aVar = nonCommentArg(1, 1, arguments);
  _assert(commentArg(1, arguments), !isNaN(aVar), 'Expected not NaN');
}

// Notes:
// Object equality has some nasty browser quirks, and this implementation is
// not 100% correct. For example,
//
// var a = [0, 1, 2];
// var b = [0, 1, 2];
// delete a[1];
// b[1] = undefined;
// assertObjectEquals(a, b); // should fail, but currently passes
//
// See asserts_test.html for more interesting edge cases.
function assertObjectEquals(a, b, opt_c) {
  _validateArguments(2, arguments);
  var v1 = nonCommentArg(1, 2, arguments);
  var v2 = nonCommentArg(2, 2, arguments);
  var failureMessage = commentArg(2, arguments) ? commentArg(2, arguments) : '';
  // start with an empty string here so the join in the final assertion
  // puts the first failure on a new line in the output
  var failures = [''];

  function innerAssert(var1, var2, path) {
    if (var1 === var2) {
      return true;
    }

    var typeOfVar1 = _trueTypeOf(var1);
    var typeOfVar2 = _trueTypeOf(var2);

    if (typeOfVar1 == typeOfVar2) {
      var isArray = typeOfVar1 == 'Array';
      var equalityPredicate = PRIMITIVE_EQUALITY_PREDICATES[typeOfVar1];
      if (equalityPredicate) {
        if (!equalityPredicate(var1, var2)) {
          failures.push(path + ' expected ' + _displayStringForValue(var1) +
                        ' but was ' + _displayStringForValue(var2));
        }
      } else if (!isArray || var1.length === var2.length) {
        var childPath = path + (isArray ? '[%s]' : (path ? '.%s' : '%s'));

        // if an object has an __iterator__ property, we have no way of
        // actually inspecting its raw properties, and JS 1.7 doesn't
        // overload [] to make it possible for someone to generically
        // use what the iterator returns to compare the object-managed
        // properties. This gets us into deep poo with things like
        // goog.structs.Map, at least on systems that support iteration.
        if (!var1['__iterator__']) {
          for (var prop in var1) {
            if (isArray || prop in var2) {
              innerAssert(var1[prop], var2[prop],
                          childPath.replace('%s', prop));
            } else {
              failures.push('property ' + prop +
                            ' not present in actual ' + (path || typeOfVar2));
            }
          }
          if (!isArray) {
            // make sure there aren't properties in var2 that are missing
            // from var1. if there are, then by definition they don't
            // match.
            for (var prop in var2) {
              if (!(prop in var1)) {
                failures.push('property ' + prop +
                              ' not present in expected ' +
                              (path || typeOfVar1));
              }
            }
          }
        } else {
          // special-case for closure objects that have iterators
          if (goog.isFunction(var1.equals)) {
            // use the object's own equals function, assuming it accepts an
            // object and returns a boolean
            if (!var1.equals(var2)) {
              failures.push('equals() returned false for ' +
                            (path || typeOfVar1));
            }
          } else if (var1.map_) {
            // assume goog.structs.Map or goog.structs.Set, where comparing
            // their private map_ field is sufficient
            innerAssert(var1.map_, var2.map_, childPath.replace('%s', 'map_'));
          } else {
            // else die, so user knows we can't do anything
            failures.push('unable to check ' + (path || typeOfVar1) +
                          ' for equality: it has an iterator we do not ' +
                          'know how to handle. please add an equals method');
          }
        }
      } else {
        failures.push(path + ' expected ' + var1.length + '-element array ' +
                      'but got a ' + var2.length + '-element array');
      }
    } else {
      failures.push(path + ' expected ' + _displayStringForValue(var1) +
                    ' but was ' + _displayStringForValue(var2));
    }
  }

  innerAssert(v1, v2, '');
  _assert(failureMessage, failures.length == 1,
          'Expected ' + _displayStringForValue(v1) + ' but was ' +
          _displayStringForValue(v2) +
          failures.join('\n   '));
}

function assertArrayEquals(a, b, opt_c) {
  _validateArguments(2, arguments);
  var v1 = nonCommentArg(1, 2, arguments);
  var v2 = nonCommentArg(2, 2, arguments);
  var failureMessage = commentArg(2, arguments) ? commentArg(2, arguments) : '';

  var typeOfVar1 = _trueTypeOf(v1);
  _assert(failureMessage,
          typeOfVar1 == 'Array',
          'Expected an array for assertArrayEquals but found a ' + typeOfVar1);

  var typeOfVar2 = _trueTypeOf(v2);
  _assert(failureMessage,
          typeOfVar2 == 'Array',
          'Expected an array for assertArrayEquals but found a ' + typeOfVar2);

  assertObjectEquals.apply(null, arguments);
}

/**
 * Compares two array-like objects without taking their order into account.
 * @param {string|goog.testing.asserts.ArrayLike} a Assertion message or the
 *     expected elements.
 * @param {goog.testing.asserts.ArrayLike} b Expected elements or the actual
 *     elements.
 * @param {goog.testing.asserts.ArrayLike} opt_c Actual elements.
 */
function assertSameElements(a, b, opt_c) {
  _validateArguments(2, arguments);
  var expected = nonCommentArg(1, 2, arguments);
  var actual = nonCommentArg(2, 2, arguments);
  var message = commentArg(2, arguments);

  assertTrue('Bad arguments to assertSameElements(opt_message, expected: ' +
      'ArrayLike, actual: ArrayLike)',
      goog.isArrayLike(expected) && goog.isArrayLike(actual));

  // Clones expected and actual and converts them to real arrays.
  expected = goog.testing.asserts.toArray_(expected);
  actual = goog.testing.asserts.toArray_(actual);
  // TODO: It would be great to show only the difference
  // between the expected and actual elements.
  _assert(message, expected.length == actual.length,
      'Expected ' + expected.length + ' elements: [' + expected + '], ' +
      'got ' + actual.length + ' elements: [' + actual + ']');

  var toFind = goog.testing.asserts.toArray_(expected);
  for (var i = 0; i < actual.length; i++) {
    var index = goog.testing.asserts.indexOf_(toFind, actual[i]);
    _assert(message, index != -1, 'Expected [' + expected + '], got [' +
        actual + ']');
    toFind.splice(index, 1);
  }
}

function assertEvaluatesToTrue(a, opt_b) {
  _validateArguments(1, arguments);
  var value = nonCommentArg(1, 1, arguments);
  if (!value) {
    _assert(commentArg(1, arguments), false, 'Expected to evaluate to true');
  }
}

function assertEvaluatesToFalse(a, opt_b) {
  _validateArguments(1, arguments);
  var value = nonCommentArg(1, 1, arguments);
  if (value) {
    _assert(commentArg(1, arguments), false, 'Expected to evaluate to false');
  }
}

function assertHTMLEquals(a, b, opt_c) {
  _validateArguments(2, arguments);
  var var1 = nonCommentArg(1, 2, arguments);
  var var2 = nonCommentArg(2, 2, arguments);
  var var1Standardized = standardizeHTML(var1);
  var var2Standardized = standardizeHTML(var2);

  _assert(commentArg(2, arguments), var1Standardized === var2Standardized,
          'Expected ' + _displayStringForValue(var1Standardized) + ' but was ' +
          _displayStringForValue(var2Standardized));
}

/**
 * Compares two CSS property values to make sure that they represent the same
 * things. This will normalize values in the browser. For example, in Firefox,
 * this assertion will consider "rgb(0, 0, 255)" and "#0000ff" to be identical
 * values for the "color" property. This function won't normalize everything --
 * for example, in most browsers, "blue" will not match "#0000ff". It is
 * intended only to compensate for unexpected normalizations performed by
 * the browser that should also affect your expected value.
 * @param {string} a Assertion message, or the CSS property name.
 * @param {string} b CSS property name, or the expected value.
 * @param {string} c The expected value, or the actual value.
 * @param {string} opt_d The actual value.
 */
function assertCSSValueEquals(a, b, c, opt_d) {
  _validateArguments(3, arguments);
  var propertyName = nonCommentArg(1, 3, arguments);
  var expectedValue = nonCommentArg(2, 3, arguments);
  var actualValue = nonCommentArg(3, 3, arguments);
  var expectedValueStandardized =
      standardizeCSSValue(propertyName, expectedValue);
  var actualValueStandardized =
      standardizeCSSValue(propertyName, actualValue);

  _assert(commentArg(3, arguments),
          expectedValueStandardized == actualValueStandardized,
          'Expected ' + _displayStringForValue(expectedValueStandardized) +
          ' but was ' + _displayStringForValue(actualValueStandardized));
}

function assertHashEquals(a, b, opt_c) {
  _validateArguments(2, arguments);
  var var1 = nonCommentArg(1, 2, arguments);
  var var2 = nonCommentArg(2, 2, arguments);
  var message = commentArg(2, arguments);
  for (var key in var1) {
    _assert(message,
        key in var2, 'Expected hash had key ' + key + ' that was not found');
    _assert(message, var1[key] == var2[key], 'Value for key ' + key +
        ' mismatch - expected = ' + var1[key] + ', actual = ' + var2[key]);
  }

  for (var key in var2) {
    _assert(message, key in var1, 'Actual hash had key ' + key +
        ' that was not expected');
  }
}

function assertRoughlyEquals(a, b, c, opt_d) {
  _validateArguments(3, arguments);
  var expected = nonCommentArg(1, 3, arguments);
  var actual = nonCommentArg(2, 3, arguments);
  var tolerance = nonCommentArg(3, 3, arguments);
  _assert(commentArg(3, arguments), Math.abs(expected - actual) <= tolerance,
      'Expected ' + expected + ', but got ' + actual +
      ' which was more than ' + tolerance + ' away');
}

function assertContains(a, b, opt_c) {
  _validateArguments(2, arguments);
  var contained = nonCommentArg(1, 2, arguments);
  var container = nonCommentArg(2, 2, arguments);
  _assert(commentArg(2, arguments),
      goog.testing.asserts.contains_(container, contained),
      'Expected \'' + container + '\' to contain \'' + contained + '\'');
}

function assertNotContains(a, b, opt_c) {
  _validateArguments(2, arguments);
  var contained = nonCommentArg(1, 2, arguments);
  var container = nonCommentArg(2, 2, arguments);
  _assert(commentArg(2, arguments),
      !goog.testing.asserts.contains_(container, contained),
      'Expected \'' + container + '\' not to contain \'' + contained + '\'');
}

/**
 * Converts an array like object to array or clones it if it's already array.
 * @param {goog.testing.asserts.ArrayLike} arrayLike The collection.
 * @return {!Array} Copy of the collection as array.
 * @private
 */
goog.testing.asserts.toArray_ = function(arrayLike) {
  var ret = [];
  for (var i = 0; i < arrayLike.length; i++) {
    ret[i] = arrayLike[i];
  }
  return ret;
};

/**
 * Finds the position of the first occurrence of an element in a container.
 * @param {goog.testing.asserts.ArrayLike} container
 *     The array to find the element in.
 * @param {*} contained Element to find.
 * @return {number} Index of the first occurrence or -1 if not found.
 * @private
 */
goog.testing.asserts.indexOf_ = function(container, contained) {
  if (container.indexOf) {
    return container.indexOf(contained);
  } else {
    // IE6/7 do not have indexOf so do a search.
    for (var i = 0; i < container.length; i++) {
      if (container[i] === contained) {
        return i;
      }
    }
    return -1;
  }
};

/**
 * Tells whether the array contains the given element.
 * @param {goog.testing.asserts.ArrayLike} container The array to
 *     find the element in.
 * @param {*} contained Element to find.
 * @return {boolean} Whether the element is in the array.
 * @private
 */
goog.testing.asserts.contains_ = function(container, contained) {
  // TODO: Can we check for container.contains as well?
  // That would give us support for most goog.structs (though weird results
  // with anything else with a contains method, like goog.math.Range). Falling
  // back with container.some would catch all iterables, too.
  return goog.testing.asserts.indexOf_(container, contained) != -1;
};

function standardizeHTML(html) {
  var translator = document.createElement('DIV');
  translator.innerHTML = html;

  // Trim whitespace from result (without relying on goog.string)
  return translator.innerHTML.replace(/^\s+|\s+$/g, '');
}

/**
 * Standardizes a CSS value for a given property by applying it to an element
 * and then reading it back.
 * @param {string} propertyName CSS property name.
 * @param {string} value CSS value.
 * @return {string} Normalized CSS value.
 */
function standardizeCSSValue(propertyName, value) {
  var styleDeclaration = document.createElement('DIV').style;
  styleDeclaration[propertyName] = value;
  return styleDeclaration[propertyName];
}


/**
 * Raises a JsUnit exception with the given comment.
 * @param {string} comment A summary for the exception.
 * @param {string} opt_message A description of the exception.
 * @private
 */
goog.testing.asserts.raiseException_ = function(comment, opt_message) {
  if (goog.global['CLOSURE_INSPECTOR___'] &&
      goog.global['CLOSURE_INSPECTOR___']['supportsJSUnit']) {
    goog.global['CLOSURE_INSPECTOR___']['jsUnitFailure'](comment, opt_message);
  }

  throw new goog.testing.JsUnitException(comment, opt_message);
};


/**
 * @param {string} comment A summary for the exception.
 * @param {?string} opt_message A description of the exception.
 * @constructor
 */
goog.testing.JsUnitException = function(comment, opt_message) {
  this.isJsUnitException = true;
  this.message = (comment ? comment : '') +
                 (comment && opt_message ? '\n' : '') +
                 (opt_message ? opt_message : '');
  this.stackTrace = goog.testing.stacktrace.get();
};

/** @inheritDoc */
goog.testing.JsUnitException.prototype.toString = function() {
  // TODO: Fix dependency in build rules.  For more info see
  // http://b/2020085
  return '[JsUnitException]';
};

goog.exportSymbol('fail', fail);
goog.exportSymbol('assert', assert);
goog.exportSymbol('assertThrows', assertThrows);
goog.exportSymbol('assertNotThrows', assertNotThrows);
goog.exportSymbol('assertTrue', assertTrue);
goog.exportSymbol('assertFalse', assertFalse);
goog.exportSymbol('assertEquals', assertEquals);
goog.exportSymbol('assertNotEquals', assertNotEquals);
goog.exportSymbol('assertNull', assertNull);
goog.exportSymbol('assertNotNull', assertNotNull);
goog.exportSymbol('assertUndefined', assertUndefined);
goog.exportSymbol('assertNotUndefined', assertNotUndefined);
goog.exportSymbol('assertNonEmptyString', assertNonEmptyString);
goog.exportSymbol('assertNaN', assertNaN);
goog.exportSymbol('assertNotNaN', assertNotNaN);
goog.exportSymbol('assertObjectEquals', assertObjectEquals);
goog.exportSymbol('assertArrayEquals', assertArrayEquals);
goog.exportSymbol('assertSameElements', assertSameElements);
goog.exportSymbol('assertEvaluatesToTrue', assertEvaluatesToTrue);
goog.exportSymbol('assertEvaluatesToFalse', assertEvaluatesToFalse);
goog.exportSymbol('assertHTMLEquals', assertHTMLEquals);
goog.exportSymbol('assertHashEquals', assertHashEquals);
goog.exportSymbol('assertRoughlyEquals', assertRoughlyEquals);
goog.exportSymbol('assertContains', assertContains);
goog.exportSymbol('assertNotContains', assertNotContains);
