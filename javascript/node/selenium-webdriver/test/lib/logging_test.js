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

const assert = require('assert');
const sinon = require('sinon');
const logging = require('../../lib/logging');

describe('logging', function() {
  let mgr, root, clock;

  beforeEach(function setUp() {
    mgr = new logging.LogManager;
    root = mgr.getLogger('');

    clock = sinon.useFakeTimers();
  });

  afterEach(function tearDown() {
    clock.restore();
  });

  describe('LogManager', function() {
    describe('getLogger()', function() {
      it('handles falsey input', function() {
        assert.strictEqual(root, mgr.getLogger());
        assert.strictEqual(root, mgr.getLogger(''));
        assert.strictEqual(root, mgr.getLogger(null));
        assert.strictEqual(root, mgr.getLogger(0));
      });

      it('creates parent loggers', function() {
        let logger = mgr.getLogger('foo.bar.baz');
        assert.strictEqual(logger.parent_, mgr.getLogger('foo.bar'));

        logger = logger.parent_;
        assert.strictEqual(logger.parent_, mgr.getLogger('foo'));

        logger = logger.parent_;
        assert.strictEqual(logger.parent_, mgr.getLogger(''));

        assert.strictEqual(logger.parent_.parent_, null);
      });
    });
  });

  describe('Logger', function() {
    describe('getEffectiveLevel()', function() {
      it('defaults to OFF', function() {
        assert.strictEqual(root.getLevel(), logging.Level.OFF);
        assert.strictEqual(root.getEffectiveLevel(), logging.Level.OFF);

        root.setLevel(null);
        assert.strictEqual(root.getLevel(), null);
        assert.strictEqual(root.getEffectiveLevel(), logging.Level.OFF);
      });

      it('uses own level if set', function() {
        let logger = mgr.getLogger('foo.bar.baz');
        assert.strictEqual(logger.getLevel(), null);
        assert.strictEqual(logger.getEffectiveLevel(), logging.Level.OFF);

        logger.setLevel(logging.Level.INFO);
        assert.strictEqual(logger.getLevel(), logging.Level.INFO);
        assert.strictEqual(logger.getEffectiveLevel(), logging.Level.INFO);
      });

      it('uses level from set on nearest parent', function() {
        let ancestor = mgr.getLogger('foo');
        ancestor.setLevel(logging.Level.SEVERE);

        let logger = mgr.getLogger('foo.bar.baz');
        assert.strictEqual(logger.getLevel(), null);
        assert.strictEqual(logger.getEffectiveLevel(), logging.Level.SEVERE);
      });
    });

    describe('isLoggable()', function() {
      it('compares level against logger\'s effective level', function() {
        const log1 = mgr.getLogger('foo');
        log1.setLevel(logging.Level.WARNING);

        const log2 = mgr.getLogger('foo.bar.baz');

        assert(!log2.isLoggable(logging.Level.FINEST));
        assert(!log2.isLoggable(logging.Level.INFO));
        assert(log2.isLoggable(logging.Level.WARNING));
        assert(log2.isLoggable(logging.Level.SEVERE));

        log2.setLevel(logging.Level.INFO);

        assert(!log2.isLoggable(logging.Level.FINEST));
        assert(log2.isLoggable(logging.Level.INFO));
        assert(log2.isLoggable(logging.Level.WARNING));
        assert(log2.isLoggable(logging.Level.SEVERE));

        log2.setLevel(logging.Level.ALL);

        assert(log2.isLoggable(logging.Level.FINEST));
        assert(log2.isLoggable(logging.Level.INFO));
        assert(log2.isLoggable(logging.Level.WARNING));
        assert(log2.isLoggable(logging.Level.SEVERE));
      });

      it('Level.OFF is never loggable', function() {
        function test(level) {
          root.setLevel(level);
          assert(!root.isLoggable(logging.Level.OFF),
              'OFF should not be loggable at ' + level);
        }

        test(logging.Level.ALL);
        test(logging.Level.INFO);
        test(logging.Level.OFF);
      });
    });

    describe('log()', function() {
      it('does not invoke loggable if message is not loggable', function() {
        const log = mgr.getLogger('foo');
        log.setLevel(logging.Level.OFF);

        let callback = sinon.spy();
        log.addHandler(callback);
        root.addHandler(callback);

        assert(!callback.called);
      });

      it('invokes handlers for each parent logger', function() {
        const cb1 = sinon.spy();
        const cb2 = sinon.spy();
        const cb3 = sinon.spy();
        const cb4 = sinon.spy();

        const log1 = mgr.getLogger('foo');
        const log2 = mgr.getLogger('foo.bar');
        const log3 = mgr.getLogger('foo.bar.baz');
        const log4 = mgr.getLogger('foo.bar.baz.quot');

        log1.addHandler(cb1);
        log1.setLevel(logging.Level.INFO);

        log2.addHandler(cb2);
        log2.setLevel(logging.Level.WARNING);

        log3.addHandler(cb3);
        log3.setLevel(logging.Level.FINER);

        clock.tick(123456);

        log4.finest('this is the finest message');
        log4.finer('this is a finer message');
        log4.info('this is an info message');
        log4.warning('this is a warning message');
        log4.severe('this is a severe message');

        assert.equal(4, cb1.callCount);
        assert.equal(4, cb2.callCount);
        assert.equal(4, cb3.callCount);

        const entry1 = new logging.Entry(
            logging.Level.FINER,
            '[foo.bar.baz.quot] this is a finer message',
            123456);
        const entry2 = new logging.Entry(
            logging.Level.INFO,
            '[foo.bar.baz.quot] this is an info message',
            123456);
        const entry3 = new logging.Entry(
            logging.Level.WARNING,
            '[foo.bar.baz.quot] this is a warning message',
            123456);
        const entry4 = new logging.Entry(
            logging.Level.SEVERE,
            '[foo.bar.baz.quot] this is a severe message',
            123456);

        check(cb1.getCall(0).args[0], entry1);
        check(cb1.getCall(1).args[0], entry2);
        check(cb1.getCall(2).args[0], entry3);
        check(cb1.getCall(3).args[0], entry4);

        check(cb2.getCall(0).args[0], entry1);
        check(cb2.getCall(1).args[0], entry2);
        check(cb2.getCall(2).args[0], entry3);
        check(cb2.getCall(3).args[0], entry4);

        check(cb3.getCall(0).args[0], entry1);
        check(cb3.getCall(1).args[0], entry2);
        check(cb3.getCall(2).args[0], entry3);
        check(cb3.getCall(3).args[0], entry4);

        function check(entry, expected) {
          assert.equal(entry.level, expected.level, 'wrong level');
          assert.equal(entry.message, expected.message, 'wrong message');
          assert.equal(entry.timestamp, expected.timestamp, 'wrong time');
        }
      });

      it('does not invoke removed handler', function() {
        root.setLevel(logging.Level.INFO);
        const cb = sinon.spy();

        root.addHandler(cb);
        root.info('hi');
        assert.equal(1, cb.callCount);

        assert(root.removeHandler(cb));
        root.info('bye');
        assert.equal(1, cb.callCount);

        assert(!root.removeHandler(cb));
      });
    });
  });

  describe('getLevel()', function() {
    it('converts named levels', function() {
      assert.strictEqual(logging.Level.DEBUG, logging.getLevel('DEBUG'));
      assert.strictEqual(logging.Level.ALL, logging.getLevel('FAKE'));
    });

    it('converts numeric levels', function() {
      assert.strictEqual(
          logging.Level.DEBUG,
          logging.getLevel(logging.Level.DEBUG.value));
    });

    it('normalizes numeric levels', function() {
      assert.strictEqual(
          logging.Level.OFF,
          logging.getLevel(logging.Level.OFF.value * 2));

      let diff = logging.Level.SEVERE.value - logging.Level.WARNING.value;
      assert.strictEqual(
          logging.Level.WARNING,
          logging.getLevel(logging.Level.WARNING.value + (diff * .5)));

      assert.strictEqual(logging.Level.ALL, logging.getLevel(0));
      assert.strictEqual(logging.Level.ALL, logging.getLevel(-1));
    });
  });

  describe('Preferences', function() {
    it('can be converted to JSON', function() {
      let prefs = new logging.Preferences;
      assert.equal('{}', JSON.stringify(prefs));

      prefs.setLevel('foo', logging.Level.DEBUG);
      assert.equal('{"foo":"DEBUG"}', JSON.stringify(prefs));

      prefs.setLevel(logging.Type.BROWSER, logging.Level.FINE);
      assert.equal('{"foo":"DEBUG","browser":"FINE"}', JSON.stringify(prefs));
    });
  });
});
