/** @license
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * @fileoverview Assertion functions for use in webdriver test cases.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.asserts');

goog.require('goog.math.Coordinate');
goog.require('goog.string');
goog.require('webdriver.Future');


/**
 * @param {webdriver.Future|Object} obj The object to get the value form.
 * @return {*} The value of the given object.
 */
webdriver.asserts.getValue_ = function(obj) {
  return obj instanceof webdriver.Future ? obj.getValue() : obj;
};


/**
 * Returns a string with the following format: "<$value> ($type)" where $value
 * is the String representation of the {@code obj} and $type is its type.
 * @param {*} obj The object to build a string for.
 * @return {string} A string describing the given object.
 */
webdriver.asserts.objToString = function(obj) {
  var value = webdriver.asserts.getValue_(obj);
  var valueStr = goog.isDef(value) ? String(value) : 'undefined';
  return '<' + valueStr + '> (' + goog.typeOf(value) + ')';
};


/**
 * A class for determining if a value matches a defined criteria.
 * @param {function} matchFn A function that takes a single argument and whether
 *     that argument matches the criteria defined by this Matcher.
 * @param {function} describeFn A function that returns a string describing the
 *     criteria for this matcher.  The string returned by this function should
 *     finish this sentence: "Expected to..."
 * @constructor
 */
webdriver.asserts.Matcher = function(matchFn, describeFn) {
  this.matches = matchFn;
  this.describe = describeFn;
};


/**
 * Factory method for a {@code webdriver.asserts.Matcher} that does a
 * {@code ===} comparison between the expected and actual values.
 * @param {*} expected The expected value.
 * @return {webdriver.asserts.Matcher} An equality matcher.
 */
webdriver.asserts.Matcher.equals = function(expected) {
  return new webdriver.asserts.Matcher(
      function (actual) {
        return webdriver.asserts.getValue_(expected) ===
               webdriver.asserts.getValue_(actual);
      },
      function () {
        return 'equal ' + webdriver.asserts.objToString(expected);
      });
};
goog.exportSymbol('equals', webdriver.asserts.Matcher.equals);
goog.exportSymbol('is', webdriver.asserts.Matcher.equals);


/**
 * Creates a {@code webdriver.asserts.Matcher} that tests if the actual
 * value contains the expected value.
 * @param {string} expected The string expected to be in the actual value.
 * @return {webdriver.asserts.Matcher} A new matcher.
 */
webdriver.asserts.Matcher.contains = function(expected) {
  return new webdriver.asserts.Matcher(
      function (actual) {
        var ev = webdriver.asserts.getValue_(expected);
        var av = webdriver.asserts.getValue_(actual);
        return goog.string.contains(av, ev);
      },
      function () {
        return 'contain ' + webdriver.asserts.objToString(expected);
      });
};
goog.exportSymbol('contains', webdriver.asserts.Matcher.contains);


/**
 * Creates a {@code webdriver.asserts.Matcher} that tests if the actual value
 * matches the given regular expression.
 * @param {RegEx} regex The expected regular expression.
 * @return {webdriver.asserts.Matcher} A new matcher.
 */
webdriver.asserts.Matcher.matchesRegex = function(regex) {
  if (!(regex instanceof RegExp)) {
    throw new Error('IllegalArgument; must be a RegExp, but was: ' + regex +
                    '(' + goog.typeOf(regex) + ')');
  }
  return new webdriver.asserts.Matcher(
      function (actual) {
        var av = webdriver.asserts.getValue_(actual);
        return av.match(regex) != null;
      },
      function () {
        return 'match regex ' + regex;
      });
};
goog.exportSymbol('matchesRegex', webdriver.asserts.Matcher.matchesRegex);


/**
 * Creates a {@code webdriver.asserts.Matcher} that tests if the actual value
 * starts with the given string.
 * @param {string} expected The expected beginning of the tested string.
 * @return {webdriver.asserts.Matcher} A new matcher.
 */
webdriver.asserts.Matcher.startsWith = function(expected) {
  return new webdriver.asserts.Matcher(
      function (actual) {
        var ev = webdriver.asserts.getValue_(expected);
        var av = webdriver.asserts.getValue_(actual);
        return goog.string.startsWith(av, ev);
      },
      function () {
        return 'start with ' + webdriver.asserts.objToString(expected);
      });
};
goog.exportSymbol('startsWith', webdriver.asserts.Matcher.startsWith);


/**
 * Creates a {@code webdriver.asserts.Matcher} that tests if the actual value is
 * the same location as the expected value.
 * @param {goog.math.Coordinate} expected The expected location, or a future
 *    whose pending result is the expected location.
 * @return {webdriver.asserts.Matcher} A new matcher.
 */
webdriver.asserts.Matcher.isTheSameLocationAs = function(expected) {
  return new webdriver.asserts.Matcher(
      function (actual) {
        var ev = webdriver.asserts.getValue_(expected);
        var av = webdriver.asserts.getValue_(actual);
        return goog.math.Coordinate.equals(ev, av);
      },
      function () {
        return 'equal ' + webdriver.asserts.objToString(expected);
      });
};
goog.exportSymbol('isTheSameLocationAs',
                  webdriver.asserts.Matcher.isTheSameLocationAs);


/**
 * Verifies that that given value matches the provided {@code Matcher}. This
 * method has two signatures based on the number of arguments:
 * Two arguments:
 *   assertThat(actualValue, matcher)
 * Three arguments:
 *   assertThat(failureMessage, actualValue, matcher)
 * @param {string} failureMessage The message to include in the resulting error
 *     if actualValue does not match matcher.
 * @param {webdriver.Future|Object} The actual value to verify.
 * @param {webdriver.asserts.Matcher} matcher The object to match the actual
 *     value against.  If not an instanceof {@code webdriver.Matcher}, will
 *     default to the matcher returned by the {@code webdriver.equals} factory
 *     function.
 */
webdriver.asserts.assertThat = function(a, b, opt_c) {
  var args = goog.array.slice(arguments, 0);
  var message = args.length > 2 ? (args[0] + '\n') : '';
  var future = args.length > 2 ? args[1] : args[0];

  var matcher = args.length > 2 ? args[2] : args[1];
  if (!(matcher instanceof webdriver.asserts.Matcher)) {
    matcher = webdriver.asserts.Matcher.equals(matcher);
  }

  var doAssertion = function() {
    if (!matcher.matches(future)) {
      throw new Error(message +
          'Expected to ' + matcher.describe() +
          '\n  but was ' + webdriver.asserts.objToString(future));
    }
  };

  if (future instanceof webdriver.Future) {
    // Schedule a function with the Future's controlling driver so the value
    // is verified after it has been set.
    future.getDriver().callFunction(doAssertion);
  } else {
    doAssertion();
  }
};
goog.exportSymbol('assertThat', webdriver.asserts.assertThat);


// ----------------------------------------------------------------------------
// Define some common xUnit paradigm assertion functions, but do not override
// any pre-existing function (e.g. if the jsapi is being used with the jsunit
// library.
// ----------------------------------------------------------------------------

goog.global.fail = goog.global.fail || function(opt_msg) {
  var msg = 'Call to fail()';
  if (opt_msg) {
    msg += ': ' + opt_msg;
  }
  throw new Error(msg);
};


goog.global.assertEquals = goog.global.assertEquals || function(a, b, opt_c) {
  var args = goog.array.slice(arguments, 0);
  var msg = args.length > 2 ? args[0] : '';
  var expected = args.length > 2 ? args[1] : args[0];
  var actual = args.length > 2 ? args[2] : args[1];
  if (expected !== actual) {
    webdriver.asserts.assertThat(msg, actual, equals(expected));
  }
};


goog.global.assertTrue = goog.global.assertTrue || function(a, opt_b) {
  var args = goog.array.slice(arguments, 0);
  if (args.length > 1) {
    goog.global.assertEquals(args[0], true, args[1]);
  } else {
    goog.global.assertEquals(true, args[0]);
  }
};


goog.global.assertFalse = goog.global.assertFalse || function(a, opt_b) {
  var args = goog.array.slice(arguments, 0);
  if (args.length > 1) {
    goog.global.assertEquals(args[0], false, args[1]);
  } else {
    goog.global.assertEquals(false, args[0]);
  }
};


/**
 * Utility function for inverting a value.  If the input is a...
 * <ul>
 * <li>{@code webdriver.asserts.Matcher}, returns a new Matcher that inverts
 * the result of the input</li>
 * <li>{@code webdriver.Future}, returns a new Future whose result will be the
 * inverse of hte input</li>
 * <li>any other type of object, it will be converted to a boolean and
 * inverted</li>
 * </ul>
 * @param {*) input The value to invert.
 * @return {webdriver.asserts.Matcher|webdriver.Future|boolean} The inverted
 *     value according to the rules defined above.
 */
webdriver.not = function(input) {
  if (input instanceof webdriver.Future) {
    var invertedFuture = new webdriver.Future(input.getDriver());
    goog.events.listen(input, goog.events.EventType.CHANGE,
        function() {
          invertedFuture.setValue(!!!input.getValue());
        });
    return invertedFuture;
  } else if (input instanceof webdriver.asserts.Matcher) {
    return new webdriver.asserts.Matcher(
        function (actual) {
          return !input.matches(actual);
        },
        function () {
          return 'not ' + input.describe();
        });
  } else {
    return !!!value;
  }
};
goog.exportSymbol('not', webdriver.not);
