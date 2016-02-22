// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview Defines a library that simplifies writing assertions against
 * promised values.
 *
 * > <hr>
 * > __NOTE:__ This module is considered experimental and is subject to
 * > change, or removal, at any time!
 * > <hr>
 *
 * Sample usage:
 *
 *     var driver = new webdriver.Builder().build();
 *     driver.get('http://www.google.com');
 *
 *     assert(driver.getTitle()).equalTo('Google');
 */

'use strict';

const assert = require('assert');

function trueType(v) {
  if (v === null) {
    return 'null';
  }

  let type = typeof v;
  if (type === 'object') {
    if (Array.isArray(v)) {
      type = 'array';
    }
  }
  return type;
}


function checkType(v, want) {
  let got = trueType(v);
  if (got !== want) {
    throw new TypeError('require ' + want + ', but got ' + got);
  }
  return v;
}

const checkNumber = v => checkType(v, 'number');
const checkFunction = v => checkType(v, 'function');
const checkString = v => checkType(v, 'string');

const isFunction = v => trueType(v) === 'function';
const isNumber = v => trueType(v) === 'number';
const isObject = v => trueType(v) === 'object';
const isString = v => trueType(v) === 'string';


function describe(value) {
  let ret;
  try {
    ret = `<${String(value)}>`;
  } catch (e) {
    ret = `<toString failed: ${e.message}>`;
  }

  if (null !== value && void(0) !== value) {
    ret += ` (${trueType(value)})`;
  }

  return ret;
}


function evaluate(value, predicate) {
  if (isObject(value) && isFunction(value.then)) {
    return value.then(predicate);
  }
  predicate(value);
}


/**
 * @private
 */
class Assertion {
  /**
   * @param {?} subject The subject of this assertion.
   * @param {boolean=} opt_invert Whether to invert any assertions performed by
   *     this instance.
   */
  constructor(subject, opt_invert) {
    /** @private {?} */
    this.subject_ = subject;
    /** @private {boolean} */
    this.invert_ = !!opt_invert;
  }

  /**
   * @param {number} expected The minimum permissible value (inclusive).
   * @param {string=} opt_message An optional failure message.
   * @return {(Promise|undefined)} The result of this assertion, if the subject
   *     is a promised-value. Otherwise, the assertion is performed immediately
   *     and nothing is returned.
   */
  atLeast(expected, opt_message) {
    checkNumber(expected);
    return evaluate(this.subject_, function(actual) {
      if (!isNumber(actual) || actual < expected) {
        assert.fail(actual, expected, opt_message, '>=');
      }
    });
  }

  /**
   * @param {number} expected The maximum permissible value (inclusive).
   * @param {string=} opt_message An optional failure message.
   * @return {(Promise|undefined)} The result of this assertion, if the subject
   *     is a promised-value. Otherwise, the assertion is performed immediately
   *     and nothing is returned.
   */
  atMost(expected, opt_message) {
    checkNumber(expected);
    return evaluate(this.subject_, function (actual) {
      if (!isNumber(actual) || actual > expected) {
        assert.fail(actual, expected, opt_message, '<=');
      }
    });
  }

  /**
   * @param {number} expected The maximum permissible value (exclusive).
   * @param {string=} opt_message An optional failure message.
   * @return {(Promise|undefined)} The result of this assertion, if the subject
   *     is a promised-value. Otherwise, the assertion is performed immediately
   *     and nothing is returned.
   */
  greaterThan(expected, opt_message) {
    checkNumber(expected);
    return evaluate(this.subject_, function(actual) {
      if (!isNumber(actual) || actual <= expected) {
        assert.fail(actual, expected, opt_message, '>');
      }
    });
  }

  /**
   * @param {number} expected The minimum permissible value (exclusive).
   * @param {string=} opt_message An optional failure message.
   * @return {(Promise|undefined)} The result of this assertion, if the subject
   *     is a promised-value. Otherwise, the assertion is performed immediately
   *     and nothing is returned.
   */
  lessThan(expected, opt_message) {
    checkNumber(expected);
    return evaluate(this.subject_,  function (actual) {
      if (!isNumber(actual) || actual >= expected) {
        assert.fail(actual, expected, opt_message, '<');
      }
    });
  }

  /**
   * @param {number} expected The desired value.
   * @param {number} epsilon The maximum distance from the desired value.
   * @param {string=} opt_message An optional failure message.
   * @return {(Promise|undefined)} The result of this assertion, if the subject
   *     is a promised-value. Otherwise, the assertion is performed immediately
   *     and nothing is returned.
   */
  closeTo(expected, epsilon, opt_message) {
    checkNumber(expected);
    checkNumber(epsilon);
    return evaluate(this.subject_, function(actual) {
      checkNumber(actual);
      if (Math.abs(expected - actual) > epsilon) {
        assert.fail(opt_message || `${actual} === ${expected} (± ${epsilon})`);
      }
    });
  }

  /**
   * @param {function(new: ?)} ctor The exptected type's constructor.
   * @param {string=} opt_message An optional failure message.
   * @return {(Promise|undefined)} The result of this assertion, if the subject
   *     is a promised-value. Otherwise, the assertion is performed immediately
   *     and nothing is returned.
   */
  instanceOf(ctor, opt_message) {
    checkFunction(ctor);
    return evaluate(this.subject_, function(actual) {
      if (!(actual instanceof ctor)) {
        assert.fail(
            opt_message
                || `${describe(actual)} instanceof ${ctor.name || ctor}`);
      }
    });
  }

  /**
   * @param {string=} opt_message An optional failure message.
   * @return {(Promise|undefined)} The result of this assertion, if the subject
   *     is a promised-value. Otherwise, the assertion is performed immediately
   *     and nothing is returned.
   */
  isNull(opt_message) {
    return this.isEqualTo(null);
  }

  /**
   * @param {string=} opt_message An optional failure message.
   * @return {(Promise|undefined)} The result of this assertion, if the subject
   *     is a promised-value. Otherwise, the assertion is performed immediately
   *     and nothing is returned.
   */
  isUndefined(opt_message) {
    return this.isEqualTo(void(0));
  }

  /**
   * Ensures the subject of this assertion is either a string or array
   * containing the given `value`.
   *
   * @param {?} value The value expected to be contained within the subject.
   * @param {string=} opt_message An optional failure message.
   * @return {(Promise|undefined)} The result of this assertion, if the subject
   *     is a promised-value. Otherwise, the assertion is performed immediately
   *     and nothing is returned.
   */
  contains(value, opt_message) {
    return evaluate(this.subject_, function(actual) {
      if (actual instanceof Map || actual instanceof Set) {
        assert.ok(actual.has(value), opt_message || `${actual}.has(${value})`);
      } else if (Array.isArray(actual) || isString(actual)) {
        assert.ok(
            actual.indexOf(value) !== -1,
            opt_message || `${actual}.indexOf(${value}) !== -1`);
      } else {
        assert.fail(
            `Expected an array, map, set, or string: got ${describe(actual)}`);
      }
    });
  }

  /**
   * @param {string} str The expected suffix.
   * @param {string=} opt_message An optional failure message.
   * @return {(Promise|undefined)} The result of this assertion, if the subject
   *     is a promised-value. Otherwise, the assertion is performed immediately
   *     and nothing is returned.
   */
  endsWith(str, opt_message) {
    checkString(str);
    return evaluate(this.subject_, function(actual) {
      if (!isString(actual) || !actual.endsWith(str)) {
        assert.fail(actual, str, 'ends with');
      }
    });
  }

  /**
   * @param {string} str The expected prefix.
   * @param {string=} opt_message An optional failure message.
   * @return {(Promise|undefined)} The result of this assertion, if the subject
   *     is a promised-value. Otherwise, the assertion is performed immediately
   *     and nothing is returned.
   */
  startsWith(str, opt_message) {
    checkString(str);
    return evaluate(this.subject_, function(actual) {
      if (!isString(actual) || !actual.startsWith(str)) {
        assert.fail(actual, str, 'starts with');
      }
    });
  }

  /**
   * @param {!RegExp} regex The regex the subject is expected to match.
   * @param {string=} opt_message An optional failure message.
   * @return {(Promise|undefined)} The result of this assertion, if the subject
   *     is a promised-value. Otherwise, the assertion is performed immediately
   *     and nothing is returned.
   */
  matches(regex, opt_message) {
    if (!(regex instanceof RegExp)) {
      throw TypeError(`Not a RegExp: ${describe(regex)}`);
    }
    return evaluate(this.subject_, function(actual) {
      if (!isString(actual) || !regex.test(actual)) {
        let message = opt_message
            || `Expected a string matching ${regex}, got ${describe(actual)}`;
        assert.fail(actual, regex, message);
      }
    });
  }

  /**
   * @param {?} value The unexpected value.
   * @param {string=} opt_message An optional failure message.
   * @return {(Promise|undefined)} The result of this assertion, if the subject
   *     is a promised-value. Otherwise, the assertion is performed immediately
   *     and nothing is returned.
   */
  notEqualTo(value, opt_message) {
    return evaluate(this.subject_, function(actual) {
      assert.notStrictEqual(actual, value, opt_message);
    });
  }

  /** An alias for {@link #isEqualTo}. */
  equalTo(value, opt_message) {
    return this.isEqualTo(value, opt_message);
  }

  /** An alias for {@link #isEqualTo}. */
  equals(value, opt_message) {
    return this.isEqualTo(value, opt_message);
  }

  /**
   * @param {?} value The expected value.
   * @param {string=} opt_message An optional failure message.
   * @return {(Promise|undefined)} The result of this assertion, if the subject
   *     is a promised-value. Otherwise, the assertion is performed immediately
   *     and nothing is returned.
   */
  isEqualTo(value, opt_message) {
    return evaluate(this.subject_, function(actual) {
      assert.strictEqual(actual, value, opt_message);
    });
  }

  /**
   * @param {string=} opt_message An optional failure message.
   * @return {(Promise|undefined)} The result of this assertion, if the subject
   *     is a promised-value. Otherwise, the assertion is performed immediately
   *     and nothing is returned.
   */
  isTrue(opt_message) {
    return this.isEqualTo(true, opt_message);
  }

  /**
   * @param {string=} opt_message An optional failure message.
   * @return {(Promise|undefined)} The result of this assertion, if the subject
   *     is a promised-value. Otherwise, the assertion is performed immediately
   *     and nothing is returned.
   */
  isFalse(opt_message) {
    return this.isEqualTo(false, opt_message);
  }
}


// PUBLIC API


/**
 * Creates an assertion about the given `value`.
 * @return {!Assertion} the new assertion.
 */
module.exports = function assertThat(value) {
  return new Assertion(value);
};
module.exports.Assertion = Assertion;  // Exported to help generated docs
