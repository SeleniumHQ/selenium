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

const EventEmitter = require('../../lib/events').EventEmitter;

const assert = require('assert');
const sinon = require('sinon');

describe('EventEmitter', function() {
  describe('#emit()', function() {
    it('can emit events when nothing is registered', function() {
      let emitter = new EventEmitter;
      emitter.emit('foo');
      // Ok if no errors are thrown.
    });

    it('can pass args to listeners on emit', function() {
      let emitter = new EventEmitter;
      let now = Date.now();

      let messages = [];
      emitter.on('foo', (arg) => messages.push(arg));

      emitter.emit('foo', now);
      assert.deepEqual([now], messages);

      emitter.emit('foo', now + 15);
      assert.deepEqual([now, now + 15], messages);
    });
  });

  describe('#addListener()', function() {
    it('can add multiple listeners for one event', function() {
      let emitter = new EventEmitter;
      let count = 0;
      emitter.addListener('foo', () => count++);
      emitter.addListener('foo', () => count++);
      emitter.addListener('foo', () => count++);
      emitter.emit('foo');
      assert.equal(3, count);
    });

    it('only registers each listener function once', function() {
      let emitter = new EventEmitter;
      let count = 0;
      let onFoo = () => count++;
      emitter.addListener('foo', onFoo);
      emitter.addListener('foo', onFoo);
      emitter.addListener('foo', onFoo);

      emitter.emit('foo');
      assert.equal(1, count);

      emitter.emit('foo');
      assert.equal(2, count);
    });

    it('allows users to specify a custom scope', function() {
      let obj = {
        count: 0,
        inc: function() {
          this.count++;
        }
      };
      let emitter = new EventEmitter;
      emitter.addListener('foo', obj.inc, obj);

      emitter.emit('foo');
      assert.equal(1, obj.count);

      emitter.emit('foo');
      assert.equal(2, obj.count);
    });
  });

  describe('#once()', function() {
    it('only calls registered callback once', function() {
      let emitter = new EventEmitter;
      let count = 0;
      emitter.once('foo', () => count++);
      emitter.once('foo', () => count++);
      emitter.once('foo', () => count++);

      emitter.emit('foo');
      assert.equal(3, count);

      emitter.emit('foo');
      assert.equal(3, count);

      emitter.emit('foo');
      assert.equal(3, count);
    });
  });

  describe('#removeListeners()', function() {
    it('only removes the given listener function', function() {
      let emitter = new EventEmitter;
      let count = 0;
      emitter.addListener('foo', () => count++);
      emitter.addListener('foo', () => count++);

      let toRemove = () => count++;
      emitter.addListener('foo', toRemove);

      emitter.emit('foo');
      assert.equal(3, count);

      emitter.removeListener('foo', toRemove);
      emitter.emit('foo');
      assert.equal(5, count);
    });
  });

  describe('#removeAllListeners()', function() {
    it('only removes listeners for type if specified', function() {
      let emitter = new EventEmitter;
      let count = 0;
      emitter.addListener('foo', () => count++);
      emitter.addListener('foo', () => count++);
      emitter.addListener('foo', () => count++);
      emitter.addListener('bar', () => count++);

      emitter.emit('foo');
      assert.equal(3, count);

      emitter.removeAllListeners('foo');

      emitter.emit('foo');
      assert.equal(3, count);

      emitter.emit('bar');
      assert.equal(4, count);
    });

    it('removes absolutely all listeners if no type specified', function() {
      let emitter = new EventEmitter;
      let count = 0;
      emitter.addListener('foo', () => count++);
      emitter.addListener('bar', () => count++);
      emitter.addListener('baz', () => count++);
      emitter.addListener('baz', () => count++);

      emitter.emit('foo');
      assert.equal(1, count);

      emitter.emit('baz');
      assert.equal(3, count);

      emitter.removeAllListeners();

      emitter.emit('foo');
      assert.equal(3, count);

      emitter.emit('bar');
      assert.equal(3, count);

      emitter.emit('baz');
      assert.equal(3, count);
    });
  });
});
