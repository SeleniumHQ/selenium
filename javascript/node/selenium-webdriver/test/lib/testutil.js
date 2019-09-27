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


class StubError extends Error {
  constructor(opt_msg) {
    super(opt_msg);
    this.name = this.constructor.name;
  }
}
exports.StubError = StubError;

exports.throwStubError = function() {
  throw new StubError;
};

exports.assertIsStubError = function(value) {
  assert.ok(value instanceof StubError, value + ' is not a ' + StubError.name);
};

exports.assertIsInstance = function(ctor, value) {
  assert.ok(value instanceof ctor, 'Not a ' + ctor.name + ': ' + value);
};

function callbackPair(cb, eb) {
  if (cb && eb) {
    throw new TypeError('can only specify one of callback or errback');
  }

  let callback = cb ? sinon.spy(cb) : sinon.spy();
  let errback = eb ? sinon.spy(eb) : sinon.spy();

  function assertCallback() {
    assert.ok(callback.called, 'callback not called');
    assert.ok(!errback.called, 'errback called');
    if (callback.threw()) {
      throw callback.exceptions[0];
    }
  }

  function assertErrback() {
    assert.ok(!callback.called, 'callback called');
    assert.ok(errback.called, 'errback not called');
    if (errback.threw()) {
      throw errback.exceptions[0];
    }
  }

  function assertNeither() {
    assert.ok(!callback.called, 'callback called');
    assert.ok(!errback.called, 'errback called');
  }

  return {
    callback,
    errback,
    assertCallback,
    assertErrback,
    assertNeither
  };
}
exports.callbackPair = callbackPair;


exports.callbackHelper = function(cb) {
  let pair = callbackPair(cb);
  let wrapped = pair.callback.bind(null);
  wrapped.assertCalled = () => pair.assertCallback();
  wrapped.assertNotCalled = () => pair.assertNeither();
  return wrapped;
};
