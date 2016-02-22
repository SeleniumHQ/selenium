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
const promise = require('../../lib/promise');

describe('promise.consume()', function() {
  it('requires inputs to be generator functions', function() {
    assert.throws(function() {
      promise.consume(function() {});
    });
  });

  it('handles a basic generator with no yielded promises', function() {
    var values = [];
    return promise.consume(function* () {
      var i = 0;
      while (i < 4) {
        i = yield i + 1;
        values.push(i);
      }
    }).then(function() {
      assert.deepEqual([1, 2, 3, 4], values);
    });
  });

  it('handles a promise yielding generator', function() {
    var values = [];
    return promise.consume(function* () {
      var i = 0;
      while (i < 4) {
        // Test that things are actually async here.
        setTimeout(function() {
          values.push(i * 2);
        }, 10);

        yield promise.delayed(10).then(function() {
          values.push(i++);
        });
      }
    }).then(function() {
      assert.deepEqual([0, 0, 2, 1, 4, 2, 6, 3], values);
    });
  });

  it('assignemnts to yielded promises get fulfilled value', function() {
    return promise.consume(function* () {
      var p = promise.fulfilled(2);
      var x = yield p;
      assert.equal(2, x);
    });
  });

  it('is possible to cancel promise generators', function() {
    var values = [];
    var p = promise.consume(function* () {
      var i = 0;
      while (i < 3) {
        yield promise.delayed(100).then(function() {
          values.push(i++);
        });
      }
    });
    return promise.delayed(75).then(function() {
      p.cancel();
      return p.thenCatch(function() {
        return promise.delayed(300);
      });
    }).then(function() {
      assert.deepEqual([0], values);
    });
  });

  it('uses final return value as fulfillment value', function() {
    return promise.consume(function* () {
      yield 1;
      yield 2;
      return 3;
    }).then(function(value) {
      assert.equal(3, value);
    });
  });

  it('throws rejected promise errors within the generator', function() {
    var values = [];
    return promise.consume(function* () {
      values.push('a');
      var e = Error('stub error');
      try {
        yield promise.rejected(e);
        values.push('b');
      } catch (ex) {
        assert.equal(e, ex);
        values.push('c');
      }
      values.push('d');
    }).then(function() {
      assert.deepEqual(['a', 'c', 'd'], values);
    });
  });

  it('aborts the generator if there is an unhandled rejection', function() {
    var values = [];
    var e = Error('stub error');
    return promise.consume(function* () {
      values.push(1);
      yield promise.rejected(e);
      values.push(2);
    }).thenCatch(function() {
      assert.deepEqual([1], values);
    });
  });

  it('yield waits for promises', function() {
    var values = [];
    var d = promise.defer();

    setTimeout(function() {
      assert.deepEqual([1], values);
      d.fulfill(2);
    }, 100);

    return promise.consume(function* () {
      values.push(1);
      values.push((yield d.promise), 3);
    }).then(function() {
      assert.deepEqual([1, 2, 3], values);
    });
  });

  it('accepts custom scopes', function() {
    return promise.consume(function* () {
      return this.name;
    }, {name: 'Bob'}).then(function(value) {
      assert.equal('Bob', value);
    });
  });

  it('accepts initial generator arguments', function() {
    return promise.consume(function* (a, b) {
      assert.equal('red', a);
      assert.equal('apples', b);
    }, null, 'red', 'apples');
  });

  it('executes generator within the control flow', function() {
    var promises = [
        promise.defer(),
        promise.defer()
    ];
    var values = [];

    setTimeout(function() {
      assert.deepEqual([], values);
      promises[0].fulfill(1);
    }, 100);

    setTimeout(function() {
      assert.deepEqual([1], values);
      promises[1].fulfill(2);
    }, 200);

    return promise.controlFlow().execute(function* () {
      values.push(yield promises[0].promise);
      values.push(yield promises[1].promise);
      values.push('fin');
    }).then(function() {
      assert.deepEqual([1, 2, 'fin'], values);
    });
  });

  it('handles tasks scheduled in generator', function() {
    var flow = promise.controlFlow();
    return flow.execute(function* () {
      var x = yield flow.execute(function() {
        return promise.delayed(10).then(function() {
          return 1;
        });
      });

      var y = yield flow.execute(function() {
        return 2;
      });

      return x + y;
    }).then(function(value) {
      assert.equal(3, value);
    });
  });

  it('blocks the control flow while processing generator', function() {
    var values = [];
    return promise.controlFlow().wait(function* () {
      yield values.push(1);
      values.push(yield promise.delayed(10).then(function() {
        return 2;
      }));
      yield values.push(3);
      return values.length === 6;
    }, 250).then(function() {
      assert.deepEqual([1, 2, 3, 1, 2, 3], values);
    });
  });

  it('ControlFlow.wait() will timeout on long generator', function() {
    var values = [];
    return promise.controlFlow().wait(function* () {
      var i = 0;
      while (i < 3) {
        yield promise.delayed(100).then(function() {
          values.push(i++);
        });
      }
    }, 75).thenCatch(function() {
      assert.deepEqual(
          [0, 1, 2], values, 'Should complete one loop of wait condition');
    });
  });

  describe('generators in promise callbacks', function() {
    it('works with no initial value', function() {
      var promises = [
        promise.defer(),
        promise.defer()
      ];
      var values = [];

      setTimeout(function() {
        promises[0].fulfill(1);
      }, 50);

      setTimeout(function() {
        promises[1].fulfill(2);
      }, 100);

      return promise.fulfilled().then(function*() {
        values.push(yield promises[0].promise);
        values.push(yield promises[1].promise);
        values.push('fin');
      }).then(function() {
        assert.deepEqual([1, 2, 'fin'], values);
      });
    });

    it('starts the generator with promised value', function() {
      var promises = [
        promise.defer(),
        promise.defer()
      ];
      var values = [];

      setTimeout(function() {
        promises[0].fulfill(1);
      }, 50);

      setTimeout(function() {
        promises[1].fulfill(2);
      }, 100);

      return promise.fulfilled(3).then(function*(value) {
        var p1 = yield promises[0].promise;
        var p2 = yield promises[1].promise;
        values.push(value + p1);
        values.push(value + p2);
        values.push('fin');
      }).then(function() {
        assert.deepEqual([4, 5, 'fin'], values);
      });
    });

    it('throws yielded rejections within the generator callback', function() {
      var d = promise.defer();
      var e = Error('stub');

      setTimeout(function() {
        d.reject(e);
      }, 50);

      return promise.fulfilled().then(function*() {
        var threw = false;
        try {
          yield d.promise;
        } catch (ex) {
          threw = true;
          assert.equal(e, ex);
        }
        assert.ok(threw);
      });
    });
  });
});

