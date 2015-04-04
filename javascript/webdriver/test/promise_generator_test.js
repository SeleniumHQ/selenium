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

goog.provide('webdriver.test.promise.generator.test');
goog.setTestOnly('webdriver.test.promise.generator.test');

goog.require('goog.testing.jsunit');
goog.require('webdriver.promise');


function testRequiresInputsToBeGeneratorFunctions() {
  var thrown = assertThrows(function() {
    webdriver.promise.consume(function() {});
  });
  assertTrue(thrown instanceof TypeError);
}


function testBasicGenerator() {
  var values = [];
  return webdriver.promise.consume(function* () {
    var i = 0;
    while (i < 4) {
      i = yield i + 1;
      values.push(i);
    }
  }).then(function() {
    assertArrayEquals([1, 2, 3, 4], values);
  });
}


function testPromiseYieldingGenerator() {
  var values = [];
  return webdriver.promise.consume(function* () {
    var i = 0;
    while (i < 4) {
      // Test that things are actually async here.
      setTimeout(function() {
        values.push(i * 2);
      }, 10);

      yield webdriver.promise.delayed(10).then(function() {
        values.push(i++);
      });
    }
  }).then(function() {
    assertArrayEquals([0, 0, 2, 1, 4, 2, 6, 3], values);
  });
}


function testAssignmentsToYieldedPromisesGetFulfilledValue() {
  return webdriver.promise.consume(function* () {
    var p = webdriver.promise.fulfilled(2);
    var x = yield p;
    assertEquals(2, x);
  });
}


function testCanCancelPromiseGenerator() {
  var values = [];
  var p = webdriver.promise.consume(function* () {
    var i = 0;
    while (i < 3) {
      yield webdriver.promise.delayed(100).then(function() {
        values.push(i++);
      });
    }
  });
  return webdriver.promise.delayed(75).then(function() {
    p.cancel();
    return p.thenCatch(function() {
      return webdriver.promise.delayed(300);
    });
  }).then(function() {
    assertArrayEquals([0], values);
  });
}


function testFinalReturnValueIsUsedAsFulfillmentValue() {
  return webdriver.promise.consume(function* () {
    yield 1;
    yield 2;
    return 3;
  }).then(function(value) {
    assertEquals(3, value);
  });
}


function testRejectionsAreThrownWithinGenerator() {
  var values = [];
  return webdriver.promise.consume(function* () {
    values.push('a');
    var e = Error('stub error');
    try {
      yield webdriver.promise.rejected(e);
      values.push('b');
    } catch (ex) {
      assertEquals(e, ex);
      values.push('c');
    }
    values.push('d');
  }).then(function() {
    assertArrayEquals(['a', 'c', 'd'], values);
  });
}


function testUnhandledRejectionsAbortGenerator() {
  var values = [];
  var e = Error('stub error');
  return webdriver.promise.consume(function* () {
    values.push(1);
    yield webdriver.promise.rejected(e);
    values.push(2);
  }).thenCatch(function() {
    assertArrayEquals([1], values);
  });
}


function testYieldsWaitForPromises() {
  var values = [];
  var d = webdriver.promise.defer();

  setTimeout(function() {
    assertArrayEquals([1], values);
    d.fulfill(2);
  }, 100);

  return webdriver.promise.consume(function* () {
    values.push(1);
    values.push((yield d.promise), 3);
  }).then(function() {
    assertArrayEquals([1, 2, 3], values);
  });
}


function testCanSpecifyGeneratorScope() {
  return webdriver.promise.consume(function* () {
    return this.name;
  }, {name: 'Bob'}).then(function(value) {
    assertEquals('Bob', value);
  });
}


function testCanSpecifyGeneratorArgs() {
  return webdriver.promise.consume(function* (a, b) {
    assertEquals('red', a);
    assertEquals('apples', b);
  }, null, 'red', 'apples');
}


function testExecuteGeneratorInAFlow() {
  var promises = [
      webdriver.promise.defer(),
      webdriver.promise.defer()
  ];
  var values = [];

  setTimeout(function() {
    assertArrayEquals([], values);
    promises[0].fulfill(1);
  }, 100);

  setTimeout(function() {
    assertArrayEquals([1], values);
    promises[1].fulfill(2);
  }, 200);

  return webdriver.promise.controlFlow().execute(function* () {
    values.push(yield promises[0].promise);
    values.push(yield promises[1].promise);
    values.push('fin');
  }).then(function() {
    assertArrayEquals([1, 2, 'fin'], values);
  });
}


function testNestedGeneratorsInAFlow() {
  var flow = webdriver.promise.controlFlow();
  return flow.execute(function* () {
    var x = yield flow.execute(function() {
      return webdriver.promise.delayed(10).then(function() {
        return 1;
      });
    });

    var y = yield flow.execute(function() {
      return 2;
    });

    return x + y;
  }).then(function(value) {
    assertEquals(3, value);
  });
}


function testFlowWaitOnGenerator() {
  var values = [];
  return webdriver.promise.controlFlow().wait(function* () {
    yield values.push(1);
    values.push(yield webdriver.promise.delayed(10).then(function() {
      return 2;
    }));
    yield values.push(3);
    return values.length === 6;
  }, 250).then(function() {
    assertArrayEquals([1, 2, 3, 1, 2, 3], values);
  });
}


function testFlowWaitingOnGeneratorTimesOut() {
  var values = [];
  return webdriver.promise.controlFlow().wait(function* () {
    var i = 0;
    while (i < 3) {
      yield webdriver.promise.delayed(100).then(function() {
        values.push(i++);
      });
    }
  }, 75).thenCatch(function() {
    assertArrayEquals('Should complete one loop of wait condition',
        [0, 1, 2], values);
  });
}

