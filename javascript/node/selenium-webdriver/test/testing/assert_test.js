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

'use strict';

const assert = require('../../testing/assert');

const AssertionError = require('assert').AssertionError;
const assertTrue = require('assert').ok;
const assertEqual = require('assert').equal;
const assertThrows = require('assert').throws;
const fail = require('assert').fail;


describe('assert', function() {
  describe('atLeast', function() {
    it('compares subject >= value', function() {
      assert(1).atLeast(0);
      assert(1).atLeast(1);
      assertThrows(() => assert(1).atLeast(2));
    });

    it('accepts failure message', function() {
      assertThrows(
          () => assert(1).atLeast(2, 'hi there!'),
          (error) => error.message.indexOf('hi there') != -1);
    });

    it('fails if given a non-numeric subject', function() {
      assertThrows(() => assert('a').atLeast(1));
    });

    it('fails if given a non-numeric bound', function() {
      assertThrows(() => assert(1).atLeast('a'));
    });

    it('waits for promised subject', function() {
      return assert(Promise.resolve(123)).atLeast(100);
    });

    it('waits for promised subject (with failure)', function() {
      return assert(Promise.resolve(100))
          .atLeast(123)
          .then(() => fail('should have failed'), function(e) {
            assertInstanceOf(AssertionError, e);
            assertEqual('100 >= 123', e.message);
          });
    });
  });

  describe('atMost', function() {
    it('compares subject <= value', function() {
      assertThrows(() => assert(1).atMost(0));
      assert(1).atMost(1);
      assert(1).atMost(2);
    });

    it('accepts failure message', function() {
      assertThrows(
          () => assert(1).atMost(0, 'hi there!'),
          (error) => error.message.indexOf('hi there!') != -1);
    });

    it('fails if given a non-numeric subject', function() {
      assertThrows(() => assert(1).atMost('a'));
    });

    it('fails if given a non-numeric bound', function() {
      assertThrows(() => assert('a').atMost(1));
    });

    it('waits for promised subject', function() {
      return assert(Promise.resolve(100)).atMost(123);
    });

    it('waits for promised subject (with failure)', function() {
      return assert(Promise.resolve(123))
          .atMost(100)
          .then(() => fail('should have failed'), function(e) {
            assertInstanceOf(AssertionError, e);
            assertEqual('123 <= 100', e.message);
          });
    });
  });

  describe('greaterThan', function() {
    it('compares subject > value', function() {
      assertThrows(() => assert(1).greaterThan(1));
      assertThrows(() => assert(1).greaterThan(2));
      assert(2).greaterThan(1);
    });

    it('accepts failure message', function() {
      assertThrows(
          () => assert(0).greaterThan(1, 'hi there!'),
          (error) => error.message.indexOf('hi there!') != -1);
    });

    it('fails if given a non-numeric subject', function() {
      assertThrows(() => assert('a').atMost(1));
    });

    it('fails if given a non-numeric bound', function() {
      assertThrows(() => assert(1).atMost('a'));
    });

    it('waits for promised subject', function() {
      return assert(Promise.resolve(123)).greaterThan(100);
    });

    it('waits for promised subject (with failure)', function() {
      return assert(Promise.resolve(100))
          .greaterThan(123)
          .then(() => fail('should have failed'), function(e) {
            assertInstanceOf(AssertionError, e);
            assertEqual('100 > 123', e.message);
          });
    });
  });

  describe('lessThan', function() {
    it('compares subject < value', function() {
      assertThrows(() => assert(1).lessThan(0));
      assertThrows(() => assert(1).lessThan(1));
      assert(1).lessThan(2);
    });

    it('accepts failure message', function() {
      assertThrows(
          () => assert(1).lessThan(0, 'hi there!'),
          (error) => error.message.indexOf('hi there!') != -1);
    });

    it('fails if given a non-numeric subject', function() {
      assertThrows(() => assert('a').lessThan(1));
    });

    it('fails if given a non-numeric bound', function() {
      assertThrows(() => assert(1).lessThan('a'));
    });

    it('waits for promised subject', function() {
      return assert(Promise.resolve(100)).lessThan(123);
    });

    it('waits for promised subject (with failure)', function() {
      return assert(Promise.resolve(123))
          .lessThan(100)
          .then(() => fail('should have failed'), function(e) {
            assertInstanceOf(AssertionError, e);
            assertEqual('123 < 100', e.message);
          });
    });
  });

  describe('closeTo', function() {
    it('accepts values within epislon of target', function() {
      assert(123).closeTo(123, 0);
      assert(123).closeTo(124, 1);
      assert(125).closeTo(124, 1);

      assertThrows(() => assert(123).closeTo(125, .1));
      assertThrows(() => assert(1./3).closeTo(.8, .01));
    });

    it('waits for promised values', function() {
      let p = new Promise(resolve => setTimeout(() => resolve(123), 10));
      return assert(p).closeTo(124, 1);
    });
  });

  describe('instanceOf', function() {
    it('works with direct instances', function() {
      assert(Error('foo')).instanceOf(Error);
    });

    it('works with sub-types', function() {
      assert(TypeError('foo')).instanceOf(Error);
    });

    it('parent types are not instances of sub-types', function() {
      assertThrows(() => assert(Error('foo')).instanceOf(TypeError));
    });
  });

  describe('isNull', function() {
    it('normal case', function() {
      assert(null).isNull();
      assertThrows(() => assert(1).isNull());
    });

    it('handles promised values', function() {
      let p = new Promise(function(f) {
        setTimeout(() => f(null), 10);
      });
      return assert(p).isNull();
    });

    it('does not match on undefined', function() {
      assertThrows(() => assert(void(0)).isNull());
    })
  });

  describe('isUndefined', function() {
    it('normal case', function() {
      assert(void(0)).isUndefined();
      assertThrows(() => assert(1).isUndefined());
    });

    it('handles promised values', function() {
      let p = new Promise(function(f) {
        setTimeout(() => f(void(0)), 10);
      });
      return assert(p).isUndefined();
    });

    it('does not match on null', function() {
      assertThrows(() => assert(null).isUndefined());
    })
  });

  describe('contains', function() {
    it('works with strings', function() {
      assert('abc').contains('a');
      assert('abc').contains('ab');
      assert('abc').contains('abc');
      assert('abc').contains('bc');
      assert('abc').contains('c');
      assertThrows(() => assert('abc').contains('d'));
    });

    it('works with arrays', function() {
      assert([1, 2, 3]).contains(1);
      assert([1, 2, 3]).contains(2);
      assert([1, 2, 3]).contains(3);
      assertThrows(() => assert([1, 2]).contains(3));
    });

    it('works with maps', function() {
      let m = new Map;
      m.set(1, 2);
      assert(m).contains(1);
      assertThrows(() => assert(m).contains(2));
    });

    it('works with sets', function() {
      let s = new Set;
      s.add(1);
      assert(s).contains(1);
      assertThrows(() => assert(s).contains(2));
    });

    it('requires an array, string, map, or set subject', function() {
      assertThrows(() => assert(123).contains('a'));
    });
  });

  describe('endsWith', function() {
    it('works', function() {
      assert('abc').endsWith('abc');
      assert('abc').endsWith('bc');
      assert('abc').endsWith('c');
      assertThrows(() => assert('abc').endsWith('d'));
    })
  });

  describe('startsWith', function() {
    it('works', function() {
      assert('abc').startsWith('abc');
      assert('abc').startsWith('ab');
      assert('abc').startsWith('a');
      assertThrows(() => assert('abc').startsWith('d'));
    })
  });

  describe('matches', function() {
    it('requires a regex value', function() {
      assertThrows(() => assert('abc').matches(1234));
    });

    it('requires a string value', function() {
      assertThrows(() => assert(1234).matches(/abc/));
    });

    it('requires a string value (promise case)', function() {
      return assert(Promise.resolve(1234))
          .matches(/abc/)
          .then(fail, function(error) {
            assertEqual(
                'Expected a string matching /abc/, got <1234> (number)',
                error.message);
          });
    });

    it('applies regex', function() {
      assert('abc').matches(/abc/);
      assertThrows(() => assert('def').matches(/abc/));
    });
  });

  describe('isTrue', function() {
    it('only accepts booleans', function() {
      assertThrows(() => assert(123).isTrue());
    });

    it('accepts true values', function() {
      assert(true).isTrue();
      assert(Boolean('abc')).isTrue();
      return assert(Promise.resolve(true)).isTrue();
    });

    it('rejects false values', function() {
      assertThrows(() => assert(false).isTrue());
      assertThrows(() => assert(Boolean(0)).isTrue());
      return assert(Promise.resolve(false)).isTrue()
          .then(fail, function() {/*no-op, ok*/});
    });
  });

  describe('isFalse', function() {
    it('only accepts booleans', function() {
      assertThrows(() => assert(123).isFalse());
    })

    it('accepts false values', function() {
      assert(false).isFalse();
      assert(Boolean('')).isFalse();
      return assert(Promise.resolve(false)).isFalse();
    });

    it('rejects true values', function() {
      assertThrows(() => assert(true).isFalse());
      assertThrows(() => assert(Boolean(1)).isFalse());
      return assert(Promise.resolve(true)).isFalse()
          .then(fail, function() {/*no-op, ok*/});
    });
  });

  describe('isEqualTo', function() {
    it('is strict equality', function() {
      assert('abc').isEqualTo('abc');
      assert('abc').equals('abc');
      assert('abc').equalTo('abc');
      assertThrows(() => assert('1').isEqualTo(1));
    });
  });

  describe('notEqualTo', function() {
    it('tests strict equality', function() {
      assert('1').notEqualTo(1);
      assert(1).notEqualTo('1');
      assertThrows(() => assert('abc').notEqualTo('abc'));
    });
  });

  function assertInstanceOf(ctor, value) {
    assertTrue(value instanceof ctor);
  }
});
