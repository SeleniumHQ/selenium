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

const testutil = require('./testutil');

const error = require('../../error');

const By = require('../../lib/by').By;
const Capabilities = require('../../lib/capabilities').Capabilities;
const Executor = require('../../lib/command').Executor;
const CName = require('../../lib/command').Name;
const Button = require('../../lib/input').Button;
const Key = require('../../lib/input').Key;
const logging = require('../../lib/logging');
const Session = require('../../lib/session').Session;
const promise = require('../../lib/promise');
const Alert = require('../../lib/webdriver').Alert;
const AlertPromise = require('../../lib/webdriver').AlertPromise;
const UnhandledAlertError = require('../../lib/webdriver').UnhandledAlertError;
const WebDriver = require('../../lib/webdriver').WebDriver;
const WebElement = require('../../lib/webdriver').WebElement;
const WebElementPromise = require('../../lib/webdriver').WebElementPromise;

const assert = require('assert');
const sinon = require('sinon');

const SESSION_ID = 'test_session_id';

// Aliases for readability.
const NativePromise = Promise;
const StubError = testutil.StubError;
const assertIsInstance = testutil.assertIsInstance;
const assertIsStubError = testutil.assertIsStubError;
const throwStubError = testutil.throwStubError;
const fail = (msg) => assert.fail(msg);

describe('WebDriver', function() {
  const LOG = logging.getLogger('webdriver.test');

  // before(function() {
  //   logging.getLogger('webdriver').setLevel(logging.Level.ALL);
  //   logging.installConsoleHandler();
  // });

  // after(function() {
  //   logging.getLogger('webdriver').setLevel(null);
  //   logging.removeConsoleHandler();
  // });

  var driver;
  var flow;
  var uncaughtExceptions;

  beforeEach(function setUp() {
    flow = promise.controlFlow();
    uncaughtExceptions = [];
    flow.on('uncaughtException', onUncaughtException);
  });

  afterEach(function tearDown() {
    return waitForIdle(flow).then(function() {
      assert.deepEqual([], uncaughtExceptions);
      flow.reset();
    });
  });

  function onUncaughtException(e) {
    uncaughtExceptions.push(e);
  }

  function waitForIdle(opt_flow) {
    var theFlow = opt_flow || flow;
    return new Promise(function(fulfill, reject) {
      if (theFlow.isIdle()) {
        fulfill();
        return;
      }
      theFlow.once('idle', fulfill);
      theFlow.once('uncaughtException', reject);
    });
  }

  function waitForAbort(opt_flow, opt_n) {
    var n = opt_n || 1;
    var theFlow = opt_flow || flow;
    theFlow.removeAllListeners(
        promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION);
    return new Promise(function(fulfill, reject) {
      theFlow.once('idle', function() {
        reject(Error('expected flow to report an unhandled error'));
      });

      var errors = [];
      theFlow.on('uncaughtException', onError);
      function onError(e) {
        errors.push(e);
        if (errors.length === n) {
          theFlow.removeListener('uncaughtException', onError);
          fulfill(n === 1 ? errors[0] : errors);
        }
      }
    });
  }

  function expectedError(ctor, message) {
    return function(e) {
      assertIsInstance(ctor, e);
      assert.equal(message, e.message);
    };
  }

  class Expectation {
    constructor(executor, name, opt_parameters) {
      this.executor_ = executor;
      this.name_ = name;
      this.times_ = 1;
      this.sessionId_ = SESSION_ID;
      this.check_ = null;
      this.toDo_ = null;
      this.withParameters(opt_parameters || {});
    }

    anyTimes() {
      this.times_ = Infinity;
      return this;
    }

    times(n) {
      this.times_ = n;
      return this;
    }

    withParameters(parameters) {
      this.parameters_ = parameters;
      if (this.name_ !== CName.NEW_SESSION) {
        this.parameters_['sessionId'] = this.sessionId_;
      }
      return this;
    }

    andReturn(code, opt_value) {
      this.toDo_ = function(command) {
        LOG.info('executing ' + command.getName() + '; returning ' + code);
        return Promise.resolve(opt_value !== void(0) ? opt_value : null);
      };
      return this;
    }

    andReturnSuccess(opt_value) {
      this.toDo_ = function(command) {
        LOG.info('executing ' + command.getName() + '; returning success');
        return Promise.resolve(opt_value !== void(0) ? opt_value : null);
      };
      return this;
    }

    andReturnError(error) {
      if (typeof error === 'number') {
        throw Error('need error type');
      }
      this.toDo_ = function(command) {
        LOG.info('executing ' + command.getName() + '; returning failure');
        return Promise.reject(error);
      };
      return this;
    }

    expect(name, opt_parameters) {
      this.end();
      return this.executor_.expect(name, opt_parameters);
    }

    end() {
      if (!this.toDo_) {
        this.andReturnSuccess(null);
      }
      return this.executor_;
    }

    execute(command) {
      assert.deepEqual(this.parameters_, command.getParameters());
      return this.toDo_(command);
    }
  }

  class FakeExecutor {
    constructor() {
      this.commands_ = new Map;
    }

    execute(command) {
      let expectations = this.commands_.get(command.getName());
      if (!expectations || !expectations.length) {
        assert.fail('unexpected command: ' + command.getName());
        return;
      }

      let next = expectations[0];
      let result = next.execute(command);
      if (next.times_ != Infinity) {
        next.times_ -= 1;
        if (!next.times_) {
          expectations.shift();
        }
      }
      return result;
    }

    expect(commandName, opt_parameters) {
      if (!this.commands_.has(commandName)) {
        this.commands_.set(commandName, []);
      }
      let e = new Expectation(this, commandName, opt_parameters);
      this.commands_.get(commandName).push(e);
      return e;
    }

    createDriver(opt_session) {
      let session = opt_session || new Session(SESSION_ID, {});
      return new WebDriver(session, this);
    }
  }


  /////////////////////////////////////////////////////////////////////////////
  //
  //    Tests
  //
  /////////////////////////////////////////////////////////////////////////////


  describe('testAttachToSession', function() {
    it('sessionIsAvailable', function() {
      let aSession = new Session(SESSION_ID, {'browserName': 'firefox'});
      let executor = new FakeExecutor().
          expect(CName.DESCRIBE_SESSION).
          withParameters({'sessionId': SESSION_ID}).
          andReturnSuccess(aSession).
          end();

      let driver = WebDriver.attachToSession(executor, SESSION_ID);
      return driver.getSession().then(v => assert.strictEqual(v, aSession));
    });

    it('failsToGetSessionInfo', function() {
      let e = new Error('boom');
      let executor = new FakeExecutor().
          expect(CName.DESCRIBE_SESSION).
          withParameters({'sessionId': SESSION_ID}).
          andReturnError(e).
          end();

      let driver = WebDriver.attachToSession(executor, SESSION_ID);
      return driver.getSession()
          .then(() => assert.fail('should have failed!'),
                (actual) => assert.strictEqual(actual, e));
    });

    it('remote end does not recognize DESCRIBE_SESSION command', function() {
      let e = new error.UnknownCommandError;
      let executor = new FakeExecutor().
          expect(CName.DESCRIBE_SESSION).
          withParameters({'sessionId': SESSION_ID}).
          andReturnError(e).
          end();

      let driver = WebDriver.attachToSession(executor, SESSION_ID);
      return driver.getSession().then(session => {
        assert.ok(session instanceof Session);
        assert.strictEqual(session.getId(), SESSION_ID);
        assert.equal(session.getCapabilities().size, 0);
      });
    });

    it('usesActiveFlowByDefault', function() {
      let executor = new FakeExecutor().
          expect(CName.DESCRIBE_SESSION).
          withParameters({'sessionId': SESSION_ID}).
          andReturnSuccess({}).
          end();

      var driver = WebDriver.attachToSession(executor, SESSION_ID);
      assert.equal(driver.controlFlow(), promise.controlFlow());

      return waitForIdle(driver.controlFlow());
    });

    it('canAttachInCustomFlow', function() {
      let executor = new FakeExecutor().
          expect(CName.DESCRIBE_SESSION).
          withParameters({'sessionId': SESSION_ID}).
          andReturnSuccess({}).
          end();

      var otherFlow = new promise.ControlFlow();
      var driver = WebDriver.attachToSession(executor, SESSION_ID, otherFlow);
      assert.equal(otherFlow, driver.controlFlow());
      assert.notEqual(otherFlow, promise.controlFlow());

      return waitForIdle(otherFlow);
    });
  });

  describe('testCreateSession', function() {
    it('happyPathWithCapabilitiesHashObject', function() {
      let aSession = new Session(SESSION_ID, {'browserName': 'firefox'});
      let executor = new FakeExecutor().
          expect(CName.NEW_SESSION).
          withParameters({
            'desiredCapabilities': {'browserName': 'firefox'}
          }).
          andReturnSuccess(aSession).
          end();

      var driver = WebDriver.createSession(executor, {
        'browserName': 'firefox'
      });
      return driver.getSession().then(v => assert.strictEqual(v, aSession));
    });

    it('happyPathWithCapabilitiesInstance', function() {
      let aSession = new Session(SESSION_ID, {'browserName': 'firefox'});
      let executor = new FakeExecutor().
          expect(CName.NEW_SESSION).
          withParameters({'desiredCapabilities': {'browserName': 'firefox'}}).
          andReturnSuccess(aSession).
          end();

      var driver = WebDriver.createSession(executor, Capabilities.firefox());
      return driver.getSession().then(v => assert.strictEqual(v, aSession));
    });

    it('failsToCreateSession', function() {
      let executor = new FakeExecutor().
          expect(CName.NEW_SESSION).
          withParameters({'desiredCapabilities': {'browserName': 'firefox'}}).
          andReturnError(new StubError()).
          end();

      var driver =
          WebDriver.createSession(executor, {'browserName': 'firefox'});
      return driver.getSession().then(fail, assertIsStubError);
    });

    it('usesActiveFlowByDefault', function() {
      let executor = new FakeExecutor().
          expect(CName.NEW_SESSION).
          withParameters({'desiredCapabilities': {}}).
          andReturnSuccess(new Session(SESSION_ID)).
          end();

      var driver = WebDriver.createSession(executor, {});
      assert.equal(promise.controlFlow(), driver.controlFlow());

      return waitForIdle(driver.controlFlow());
    });

    it('canCreateInCustomFlow', function() {
      let executor = new FakeExecutor().
          expect(CName.NEW_SESSION).
          withParameters({'desiredCapabilities': {}}).
          andReturnSuccess({}).
          end();

      var otherFlow = new promise.ControlFlow();
      var driver = WebDriver.createSession(executor, {}, otherFlow);
      assert.equal(otherFlow, driver.controlFlow());
      assert.notEqual(otherFlow, promise.controlFlow());

      return waitForIdle(otherFlow);
    });
  });

  it('testDoesNotExecuteCommandIfSessionDoesNotResolve', function() {
    var session = Promise.reject(new StubError);
    new FakeExecutor().createDriver(session).getTitle();
    return waitForAbort().then(assertIsStubError);
  });

  it('testCommandReturnValuesArePassedToFirstCallback', function() {
    let executor = new FakeExecutor().
        expect(CName.GET_TITLE).andReturnSuccess('Google Search').
        end();

    var driver = executor.createDriver();
    return driver.getTitle().then(function(title) {
      assert.equal('Google Search', title);
    });
  });

  it('testStopsCommandExecutionWhenAnErrorOccurs', function() {
    let e = new error.NoSuchWindowError('window not found');
    let executor = new FakeExecutor().
        expect(CName.SWITCH_TO_WINDOW).
        withParameters({'name': 'foo'}).
        andReturnError(e).
        end();

    var driver = executor.createDriver();
    driver.switchTo().window('foo');
    driver.getTitle();  // mock should blow if this gets executed

    return waitForAbort().then(v => assert.strictEqual(v, e));
  });

  it('testCanSuppressCommandFailures', function() {
    let e = new error.NoSuchWindowError('window not found');
    let executor = new FakeExecutor().
        expect(CName.SWITCH_TO_WINDOW).
            withParameters({'name': 'foo'}).
            andReturnError(e).
        expect(CName.GET_TITLE).
            andReturnSuccess('Google Search').
        end();

    var driver = executor.createDriver();
    driver.switchTo().window('foo')
        .catch(v => assert.strictEqual(v, e));
    driver.getTitle();
    return waitForIdle();
  });

  it('testErrorsPropagateUpToTheRunningApplication', function() {
    let e = new error.NoSuchWindowError('window not found');
    let executor = new FakeExecutor().
        expect(CName.SWITCH_TO_WINDOW).
            withParameters({'name':'foo'}).
            andReturnError(e).
        end();

    executor.createDriver().switchTo().window('foo');
    return waitForAbort().then(v => assert.strictEqual(v, e));
  });

  it('testErrbacksThatReturnErrorsStillSwitchToCallbackChain', function() {
    let executor = new FakeExecutor().
        expect(CName.SWITCH_TO_WINDOW).
            withParameters({'name':'foo'}).
            andReturnError(new error.NoSuchWindowError('window not found')).
        end();

    var driver = executor.createDriver();
    return driver.switchTo().window('foo').
        catch(function() { return new StubError; });
        then(assertIsStubError);
  });

  it('testErrbacksThrownCanOverrideOriginalError', function() {
    let executor = new FakeExecutor().
        expect(CName.SWITCH_TO_WINDOW, {'name': 'foo'}).
        andReturnError(new error.NoSuchWindowError('window not found')).
        end();

    var driver = executor.createDriver();
    driver.switchTo().window('foo').catch(throwStubError);

    return waitForAbort().then(assertIsStubError);
  });

  it('testCannotScheduleCommandsIfTheSessionIdHasBeenDeleted', function() {
    var driver = new FakeExecutor().createDriver();
    delete driver.session_;
    assert.throws(() => driver.get('http://www.google.com'));
  });

  it('testDeletesSessionIdAfterQuitting', function() {
    var driver;
    let executor = new FakeExecutor().
        expect(CName.QUIT).
        end();

    driver = executor.createDriver();
    return driver.quit().then(function() {
      assert.equal(void 0, driver.session_);
    });
  });

  it('testReportsErrorWhenExecutingCommandsAfterExecutingAQuit', function() {
    let executor = new FakeExecutor().
        expect(CName.QUIT).
        end();

    var driver = executor.createDriver();
    driver.quit();
    driver.get('http://www.google.com');
    return waitForAbort().
        then(expectedError(
            error.NoSuchSessionError,
            'This driver instance does not have a valid session ID ' +
            '(did you call WebDriver.quit()?) and may no longer be used.'));
  });

  it('testCallbackCommandsExecuteBeforeNextCommand', function() {
    let executor = new FakeExecutor().
        expect(CName.GET_CURRENT_URL).
        expect(CName.GET, {'url': 'http://www.google.com'}).
        expect(CName.CLOSE).
        expect(CName.GET_TITLE).
        end();

    var driver = executor.createDriver();
    driver.getCurrentUrl().then(function() {
      driver.get('http://www.google.com').then(function() {
        driver.close();
      });
    });
    driver.getTitle();

    return waitForIdle();
  });

  it('testEachCallbackFrameRunsToCompletionBeforeTheNext', function() {
    let executor = new FakeExecutor().
        expect(CName.GET_TITLE).
        expect(CName.GET_CURRENT_URL).
        expect(CName.GET_CURRENT_WINDOW_HANDLE).
        expect(CName.CLOSE).
        expect(CName.QUIT).
        end();

    var driver = executor.createDriver();
    driver.getTitle().
        // Everything in this callback...
        then(function() {
          driver.getCurrentUrl();
          driver.getWindowHandle();
        }).
        // ...should execute before everything in this callback.
        then(function() {
          driver.close();
        });
    // This should execute after everything above
    driver.quit();

    return waitForIdle();
  });

  describe('nestedCommandFailures', function() {
    it('bubbleUpToGlobalHandlerIfUnsuppressed', function() {
      let e = new error.NoSuchWindowError('window not found');
      let executor = new FakeExecutor().
          expect(CName.GET_TITLE).
          expect(CName.SWITCH_TO_WINDOW, {'name': 'foo'}).
          andReturnError(e).
          end();

      var driver = executor.createDriver();
      driver.getTitle().then(function() {
        driver.switchTo().window('foo');
      });

      return waitForAbort().then(v => assert.strictEqual(v, e));
    });

    it('canBeSuppressWhenTheyOccur', function() {
      let executor = new FakeExecutor().
          expect(CName.GET_TITLE).
          expect(CName.SWITCH_TO_WINDOW, {'name':'foo'}).
              andReturnError(new error.NoSuchWindowError('window not found')).
          expect(CName.CLOSE).
          end();

      var driver = executor.createDriver();
      driver.getTitle().then(function() {
        driver.switchTo().window('foo').catch(function() {});
      });
      driver.close();

      return waitForIdle();
    });

    it('bubbleUpThroughTheFrameStack', function() {
      let e = new error.NoSuchWindowError('window not found');
      let executor = new FakeExecutor().
          expect(CName.GET_TITLE).
          expect(CName.SWITCH_TO_WINDOW, {'name':'foo'}).
          andReturnError(e).
          end();

      var driver = executor.createDriver();
      driver.getTitle().
          then(function() {
            return driver.switchTo().window('foo');
          }).
          catch(v => assert.strictEqual(v, e));

      return waitForIdle();
    });

    it('canBeCaughtAndSuppressed', function() {
      let executor = new FakeExecutor().
          expect(CName.GET_TITLE).
          expect(CName.GET_CURRENT_URL).
          expect(CName.SWITCH_TO_WINDOW, {'name':'foo'}).
              andReturnError(new StubError()).
          expect(CName.CLOSE).
          end();

      var driver = executor.createDriver();
      driver.getTitle().then(function() {
        driver.getCurrentUrl().
            then(function() {
              return driver.switchTo().window('foo');
            }).
            catch(function() {});
        driver.close();
      });

      return waitForIdle();
    });
  });

  describe('returningAPromise', function() {
    it('fromACallback', function() {
      let executor = new FakeExecutor().
          expect(CName.GET_TITLE).
          expect(CName.GET_CURRENT_URL).
              andReturnSuccess('http://www.google.com').
          end();

      var driver = executor.createDriver();
      driver.getTitle().
          then(function() {
            return driver.getCurrentUrl();
          }).
          then(function(value) {
            assert.equal('http://www.google.com', value);
          });
      return waitForIdle();
    });

    it('fromAnErrbackSuppressesTheError', function() {
      var count = 0;
      let executor = new FakeExecutor().
          expect(CName.SWITCH_TO_WINDOW, {'name':'foo'}).
              andReturnError(new StubError()).
          expect(CName.GET_CURRENT_URL).
              andReturnSuccess('http://www.google.com').
          end();

      var driver = executor.createDriver();
      driver.switchTo().window('foo').
          catch(function(e) {
            assertIsStubError(e);
            count += 1;
            return driver.getCurrentUrl();
          }).
          then(function(url) {
            count += 1;
            assert.equal('http://www.google.com', url);
          });
      return waitForIdle().then(function() {
        assert.equal(2, count);
      });
    });
  });

  describe('customFunctions', function() {
    it('returnsANonPromiseValue', function() {
      var driver = new FakeExecutor().createDriver();
      return driver.call(() => 'abc123').then(function(value) {
        assert.equal('abc123', value);
      });
    });

    it('executionOrderWithCustomFunctions', function() {
      var msg = [];
      let executor = new FakeExecutor().
          expect(CName.GET_TITLE).andReturnSuccess('cheese ').
          expect(CName.GET_CURRENT_URL).andReturnSuccess('tasty').
          end();

      var driver = executor.createDriver();

      var pushMsg = msg.push.bind(msg);
      driver.getTitle().then(pushMsg);
      driver.call(() => 'is ').then(pushMsg);
      driver.getCurrentUrl().then(pushMsg);
      driver.call(() => '!').then(pushMsg);

      return waitForIdle().then(function() {
        assert.equal('cheese is tasty!', msg.join(''));
      });
    });

    it('passingArgumentsToACustomFunction', function() {
      var add = function(a, b) {
        return a + b;
      };
      var driver = new FakeExecutor().createDriver();
      return driver.call(add, null, 1, 2).then(function(value) {
        assert.equal(3, value);
      });
    });

    it('passingPromisedArgumentsToACustomFunction', function() {
      var promisedArg = promise.fulfilled(2);
      var add = function(a, b) {
        return a + b;
      };
      var driver = new FakeExecutor().createDriver();
      return driver.call(add, null, 1, promisedArg).then(function(value) {
        assert.equal(3, value);
      });
    });

    it('passingArgumentsAndScopeToACustomFunction', function() {
      function Foo(name) {
        this.name = name;
      }
      Foo.prototype.getName = function() {
        return this.name;
      };
      var foo = new Foo('foo');

      var driver = new FakeExecutor().createDriver();
      return driver.call(foo.getName, foo).then(function(value) {
        assert.equal('foo', value);
      });
    });

    it('customFunctionThrowsAnError', function() {
      var driver = new FakeExecutor().createDriver();
      return driver.call(throwStubError).then(fail, assertIsStubError);
    });

    it('customFunctionSchedulesCommands', function() {
      let executor = new FakeExecutor().
          expect(CName.GET_TITLE).
          expect(CName.CLOSE).
          expect(CName.QUIT).
          end();

      var driver = executor.createDriver();
      driver.call(function() {
        driver.getTitle();
        driver.close();
      });
      driver.quit();
      return waitForIdle();
    });

    it('returnsATaskResultAfterSchedulingAnother', function() {
      let executor = new FakeExecutor().
          expect(CName.GET_TITLE).
              andReturnSuccess('Google Search').
          expect(CName.CLOSE).
          end();

      var driver = executor.createDriver();
      return driver.call(function() {
        var title = driver.getTitle();
        driver.close();
        return title;
      }).then(function(title) {
        assert.equal('Google Search', title);
      });
    });

    it('hasANestedCommandThatFails', function() {
      let executor = new FakeExecutor().
          expect(CName.SWITCH_TO_WINDOW, {'name': 'foo'}).
              andReturnError(new StubError()).
          end();

      var driver = executor.createDriver();
      return driver.call(function() {
        return driver.switchTo().window('foo');
      }).then(fail, assertIsStubError);
    });

    it('doesNotCompleteUntilReturnedPromiseIsResolved', function() {
      var order = [];
      var driver = new FakeExecutor().createDriver();

      var d = promise.defer();
      d.promise.then(function() {
        order.push('b');
      });

      driver.call(function() {
        order.push('a');
        return d.promise;
      });
      driver.call(function() {
        order.push('c');
      });

      // timeout to ensure the first function starts its execution before we
      // trigger d's callbacks.
      return new Promise(f => setTimeout(f, 0)).then(function() {
        assert.deepEqual(['a'], order);
        d.fulfill();
        return waitForIdle().then(function() {
          assert.deepEqual(['a', 'b', 'c'], order);
        });
      });
    });

    it('returnsADeferredAction', function() {
      let executor = new FakeExecutor().
          expect(CName.GET_TITLE).andReturnSuccess('Google').
          end();

      var driver = executor.createDriver();
      driver.call(function() {
        return driver.getTitle();
      }).then(function(title) {
        assert.equal('Google', title);
      });
      return waitForIdle();
    });
  });

  describe('nestedCommands', function() {
    it('commandExecutionOrder', function() {
      var msg = [];
      var driver = new FakeExecutor().createDriver();
      driver.call(msg.push, msg, 'a');
      driver.call(function() {
        driver.call(msg.push, msg, 'c');
        driver.call(function() {
          driver.call(msg.push, msg, 'e');
          driver.call(msg.push, msg, 'f');
        });
        driver.call(msg.push, msg, 'd');
      });
      driver.call(msg.push, msg, 'b');
      return waitForIdle().then(function() {
        assert.equal('acefdb', msg.join(''));
      });
    });

    it('basicUsage', function() {
      var msg = [];
      var driver = new FakeExecutor().createDriver();
      var pushMsg = msg.push.bind(msg);
      driver.call(() => 'cheese ').then(pushMsg);
      driver.call(function() {
        driver.call(() => 'is ').then(pushMsg);
        driver.call(() => 'tasty').then(pushMsg);
      });
      driver.call(() => '!').then(pushMsg);
      return waitForIdle().then(function() {
        assert.equal('cheese is tasty!', msg.join(''));
      });
    });

    it('canReturnValueFromNestedFunction', function() {
      var driver = new FakeExecutor().createDriver();
      return driver.call(function() {
        return driver.call(function() {
          return driver.call(() => 'foobar');
        });
      }).then(function(value) {
        assert.equal('foobar', value);
      });
    });

    it('normalCommandAfterNestedCommandThatReturnsAnAction', function() {
      var msg = [];
      let executor = new FakeExecutor().
          expect(CName.CLOSE).
          end();
      var driver = executor.createDriver();
      driver.call(function() {
        return driver.call(function() {
          msg.push('a');
          return driver.call(() => 'foobar');
        });
      });
      driver.close().then(function() {
        msg.push('b');
      });
      return waitForIdle().then(function() {
        assert.equal('ab', msg.join(''));
      });
    });

    it('errorsBubbleUp_caught', function() {
      var driver = new FakeExecutor().createDriver();
      var result = driver.call(function() {
        return driver.call(function() {
          return driver.call(throwStubError);
        });
      }).then(fail, assertIsStubError);
      return Promise.all([waitForIdle(), result]);
    });

    it('errorsBubbleUp_uncaught', function() {
      var driver = new FakeExecutor().createDriver();
      driver.call(function() {
        return driver.call(function() {
          return driver.call(throwStubError);
        });
      });
      return waitForAbort().then(assertIsStubError);
    });

    it('canScheduleCommands', function() {
      let executor = new FakeExecutor().
          expect(CName.GET_TITLE).
          expect(CName.CLOSE).
          end();

      var driver = executor.createDriver();
      driver.call(function() {
        driver.call(function() {
          driver.getTitle();
        });
        driver.close();
      });
      return waitForIdle();
    });
  });

  describe('WebElementPromise', function() {
    it('resolvesWhenUnderlyingElementDoes', function() {
      var el = new WebElement({}, {'ELEMENT': 'foo'});
      return new WebElementPromise({}, promise.fulfilled(el)).then(function(e) {
        assert.strictEqual(e, el);
      });
    });

    it('resolvesBeforeCallbacksOnWireValueTrigger', function() {
      var el = new promise.Deferred();

      var element = new WebElementPromise({}, el.promise);
      var messages = [];

      element.then(function() {
        messages.push('element resolved');
      });
      element.getId().then(function() {
        messages.push('wire value resolved');
      });

      assert.deepEqual([], messages);
      el.fulfill(new WebElement({}, {'ELEMENT': 'foo'}));
      return waitForIdle().then(function() {
        assert.deepEqual([
          'element resolved',
          'wire value resolved'
        ], messages);
      });
    });

    it('isRejectedIfUnderlyingIdIsRejected', function() {
      var element = new WebElementPromise({}, promise.rejected(new StubError));
      return element.then(fail, assertIsStubError);
    });
  });

  describe('executeScript', function() {
    it('nullReturnValue', function() {
      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT).
              withParameters({
                'script': 'return document.body;',
                'args': []
              }).
              andReturnSuccess(null).
          end();

      var driver = executor.createDriver();
      return driver.executeScript('return document.body;')
          .then((result) => assert.equal(null, result));
    });

    it('primitiveReturnValue', function() {
      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT).
              withParameters({
                'script': 'return document.body;',
                'args': []
              }).
              andReturnSuccess(123).
          end();

      var driver = executor.createDriver();
      return driver.executeScript('return document.body;')
          .then((result) => assert.equal(123, result));
    });

    it('webElementReturnValue', function() {
      var json = WebElement.buildId('foo');

      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT).
              withParameters({
                'script': 'return document.body;',
                'args': []
              }).
              andReturnSuccess(json).
          end();

      var driver = executor.createDriver();
      return driver.executeScript('return document.body;')
          .then((element) => element.getId())
          .then((id) => assert.equal(id, 'foo'));
    });

    it('arrayReturnValue', function() {
      var json = [WebElement.buildId('foo')];

      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT).
              withParameters({
                'script': 'return document.body;',
                'args': []
              }).
              andReturnSuccess(json).
          end();

      var driver = executor.createDriver();
      return driver.executeScript('return document.body;')
          .then(function(array) {
            assert.equal(1, array.length);
            return array[0].getId();
          })
          .then((id) => assert.equal('foo', id));
    });

    it('objectReturnValue', function() {
      var json = {'foo': WebElement.buildId('foo')};

      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT).
              withParameters({
                'script': 'return document.body;',
                'args': []
              }).
              andReturnSuccess(json).
          end();

      var driver = executor.createDriver();
      var callback;
      return driver.executeScript('return document.body;')
          .then((obj) => obj['foo'].getId())
          .then((id) => assert.equal(id, 'foo'));
    });

    it('scriptAsFunction', function() {
      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT).
              withParameters({
                'script': 'return (' + function() {} +
                          ').apply(null, arguments);',
                'args': []
              }).
              andReturnSuccess(null).
          end();

      var driver = executor.createDriver();
      return driver.executeScript(function() {});
    });

    it('simpleArgumentConversion', function() {
      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT).
              withParameters({
                'script': 'return 1;',
                'args': ['abc', 123, true, [123, {'foo': 'bar'}]]
              }).
              andReturnSuccess(null).
          end();

      var driver = executor.createDriver();
      return driver.executeScript(
          'return 1;', 'abc', 123, true, [123, {'foo': 'bar'}]);
    });

    it('webElementArgumentConversion', function() {
      var elementJson = WebElement.buildId('fefifofum');

      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT).
              withParameters({
                'script': 'return 1;',
                'args': [elementJson]
              }).
              andReturnSuccess(null).
          end();

      var driver = executor.createDriver();
      return driver.executeScript('return 1;',
          new WebElement(driver, 'fefifofum'));
    });

    it('webElementPromiseArgumentConversion', function() {
      var elementJson = WebElement.buildId('bar');

      let executor = new FakeExecutor().
          expect(CName.FIND_ELEMENT,
              {'using': 'css selector', 'value': '*[id="foo"]'}).
              andReturnSuccess(elementJson).
          expect(CName.EXECUTE_SCRIPT).
              withParameters({
                'script': 'return 1;',
                'args': [elementJson]
              }).
              andReturnSuccess(null).
          end();

      var driver = executor.createDriver();
      var element = driver.findElement(By.id('foo'));
      return driver.executeScript('return 1;', element);
    });

    it('argumentConversion', function() {
      var elementJson = WebElement.buildId('fefifofum');

      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT).
              withParameters({
                'script': 'return 1;',
                'args': ['abc', 123, true, elementJson, [123, {'foo': 'bar'}]]
              }).
              andReturnSuccess(null).
          end();

      var driver = executor.createDriver();
      var element = new WebElement(driver, 'fefifofum');
      return driver.executeScript('return 1;',
          'abc', 123, true, element, [123, {'foo': 'bar'}]);
    });

    it('scriptReturnsAnError', function() {
      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT).
              withParameters({
                'script': 'throw Error(arguments[0]);',
                'args': ['bam']
              }).
              andReturnError(new StubError).
          end();
      var driver = executor.createDriver();
      return driver.executeScript('throw Error(arguments[0]);', 'bam').
          then(fail, assertIsStubError);
    });

    it('failsIfArgumentIsARejectedPromise', function() {
      let executor = new FakeExecutor();

      var arg = promise.rejected(new StubError);
      arg.catch(function() {});  // Suppress default handler.

      var driver = executor.createDriver();
      return driver.executeScript(function() {}, arg).
          then(fail, assertIsStubError);
    });
  });

  describe('executeAsyncScript', function() {
    it('failsIfArgumentIsARejectedPromise', function() {
      var arg = promise.rejected(new StubError);
      arg.catch(function() {});  // Suppress default handler.

      var driver = new FakeExecutor().createDriver();
      return driver.executeAsyncScript(function() {}, arg).
          then(fail, assertIsStubError);
    });
  });

  describe('findElement', function() {
    it('elementNotFound', function() {
      let executor = new FakeExecutor().
          expect(CName.FIND_ELEMENT,
                 {using: 'css selector', value: '*[id="foo"]'}).
          andReturnError(new StubError).
          end();

      var driver = executor.createDriver();
      var element = driver.findElement(By.id('foo'));
      element.click();  // This should never execute.
      return waitForAbort().then(assertIsStubError);
    });

    it('elementNotFoundInACallback', function() {
      let executor = new FakeExecutor().
          expect(CName.FIND_ELEMENT,
                 {using: 'css selector', value: '*[id="foo"]'}).
          andReturnError(new StubError).
          end();

      var driver = executor.createDriver();
      promise.fulfilled().then(function() {
        var element = driver.findElement(By.id('foo'));
        return element.click();  // Should not execute.
      });
      return waitForAbort().then(assertIsStubError);
    });

    it('elementFound', function() {
      let executor = new FakeExecutor().
          expect(CName.FIND_ELEMENT,
                 {using: 'css selector', value: '*[id="foo"]'}).
              andReturnSuccess(WebElement.buildId('bar')).
          expect(CName.CLICK_ELEMENT, {'id': 'bar'}).
              andReturnSuccess().
          end();

      var driver = executor.createDriver();
      var element = driver.findElement(By.id('foo'));
      element.click();
      return waitForIdle();
    });

    it('canUseElementInCallback', function() {
      let executor = new FakeExecutor().
          expect(CName.FIND_ELEMENT,
                 {using: 'css selector', value: '*[id="foo"]'}).
              andReturnSuccess(WebElement.buildId('bar')).
          expect(CName.CLICK_ELEMENT, {'id': 'bar'}).
              andReturnSuccess().
          end();

      var driver = executor.createDriver();
      driver.findElement(By.id('foo')).then(function(element) {
        element.click();
      });
      return waitForIdle();
    });

    it('byJs', function() {
      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT, {
            'script': 'return document.body',
            'args': []
          }).
          andReturnSuccess(WebElement.buildId('bar')).
          expect(CName.CLICK_ELEMENT, {'id': 'bar'}).
          end();

      var driver = executor.createDriver();
      var element = driver.findElement(By.js('return document.body'));
      element.click();  // just to make sure
      return waitForIdle();
    });

    it('byJs_returnsNonWebElementValue', function() {
      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT, {'script': 'return 123', 'args': []}).
          andReturnSuccess(123).
          end();

      var driver = executor.createDriver();
      var element = driver.findElement(By.js('return 123'));
      element.click();  // Should not execute.
      return waitForAbort().then(function(e) {
        assertIsInstance(TypeError, e);
        assert.equal('Custom locator did not return a WebElement', e.message);
      });
    });

    it('byJs_canPassArguments', function() {
      var script = 'return document.getElementsByTagName(arguments[0]);';
      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT, {
            'script': script,
            'args': ['div']
          }).
          andReturnSuccess({'ELEMENT':'one'}).
          end();
      var driver = executor.createDriver();
      driver.findElement(By.js(script, 'div'));
      return waitForIdle();
    });

    it('customLocator', function() {
      let executor = new FakeExecutor().
          expect(CName.FIND_ELEMENTS, {'using': 'css selector', 'value': 'a'}).
              andReturnSuccess([
                  WebElement.buildId('foo'),
                  WebElement.buildId('bar')]).
          expect(CName.CLICK_ELEMENT, {'id': 'foo'}).
          andReturnSuccess().
          end();

      var driver = executor.createDriver();
      var element = driver.findElement(function(d) {
        assert.equal(driver, d);
        return d.findElements(By.tagName('a'));
      });
      element.click();
      return waitForIdle();
    });

    it('customLocatorThrowsIfresultIsNotAWebElement', function() {
      var driver = new FakeExecutor().createDriver();
      driver.findElement(function() {
        return 1;
      });
      return waitForAbort().then(function(e) {
        assertIsInstance(TypeError, e);
        assert.equal('Custom locator did not return a WebElement', e.message);
      });
    });
  });

  describe('isElementPresent', function() {
    it('elementNotFound', function() {
      let executor = new FakeExecutor().
          expect(CName.FIND_ELEMENTS,
                 {using: 'css selector', value: '*[id="foo"]'}).
          andReturnSuccess([]).
          end();

      var driver = executor.createDriver();
      return driver.isElementPresent(By.id('foo'))
          .then((found) => assert.ok(!found));
    });

    it('elementFound', function() {
      let executor = new FakeExecutor().
          expect(CName.FIND_ELEMENTS,
                 {using: 'css selector', value: '*[id="foo"]'}).
          andReturnSuccess([WebElement.buildId('bar')]).
          end();

      var driver = executor.createDriver();
      return driver.isElementPresent(By.id('foo')).then(assert.ok);
    });

    it('letsErrorsPropagate', function() {
      let executor = new FakeExecutor().
          expect(CName.FIND_ELEMENTS,
                 {using: 'css selector', value: '*[id="foo"]'}).
          andReturnError(new StubError).
          end();

      var driver = executor.createDriver();
      driver.isElementPresent(By.id('foo'));
      return waitForAbort().then(assertIsStubError);
    });

    it('byJs', function() {
      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT, {'script': 'return 123', 'args': []}).
          andReturnSuccess([WebElement.buildId('bar')]).
          end();

      var driver = executor.createDriver();
      return driver.isElementPresent(By.js('return 123')).then(assert.ok);
    });

    it('byJs_canPassScriptArguments', function() {
      var script = 'return document.getElementsByTagName(arguments[0]);';
      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT, {
            'script': script,
            'args': ['div']
          }).
          andReturnSuccess([WebElement.buildId('one')]).
          end();

      var driver = executor.createDriver();
      driver.isElementPresent(By.js(script, 'div')).then(assert.ok);
      return waitForIdle();
    });
  });

  describe('findElements', function() {
    it('returnsMultipleElements', function() {
      var ids = ['foo', 'bar', 'baz'];
      let executor = new FakeExecutor().
          expect(CName.FIND_ELEMENTS, {'using':'css selector', 'value':'a'}).
          andReturnSuccess(ids.map(WebElement.buildId)).
          end();

      var driver = executor.createDriver();
      return driver.findElements(By.tagName('a'))
          .then(function(elements) {
            return promise.all(elements.map(function(e) {
              assert.ok(e instanceof WebElement);
              return e.getId();
            }));
          })
          .then((actual) => assert.deepEqual(ids, actual));
    });

    it('byJs', function() {
      var ids = ['foo', 'bar', 'baz'];
      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT, {
            'script': 'return document.getElementsByTagName("div");',
            'args': []
          }).
          andReturnSuccess(ids.map(WebElement.buildId)).
          end();

      var driver = executor.createDriver();

      return driver.
          findElements(By.js('return document.getElementsByTagName("div");')).
          then(function(elements) {
            return promise.all(elements.map(function(e) {
              assert.ok(e instanceof WebElement);
              return e.getId();
            }));
          }).
          then((actual) => assert.deepEqual(ids, actual));
    });

    it('byJs_filtersOutNonWebElementResponses', function() {
      var ids = ['foo', 'bar', 'baz'];
      var json = [
          WebElement.buildId(ids[0]),
          123,
          'a',
          false,
          WebElement.buildId(ids[1]),
          {'not a web element': 1},
          WebElement.buildId(ids[2])
      ];
      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT, {
            'script': 'return document.getElementsByTagName("div");',
            'args': []
          }).
          andReturnSuccess(json).
          end();

      var driver = executor.createDriver();
      driver.findElements(By.js('return document.getElementsByTagName("div");')).
          then(function(elements) {
            return promise.all(elements.map(function(e) {
              assert.ok(e instanceof WebElement);
              return e.getId();
            }));
          }).
          then((actual) => assert.deepEqual(ids, actual));
      return waitForIdle();
    });

    it('byJs_convertsSingleWebElementResponseToArray', function() {
      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT, {
            'script': 'return document.getElementsByTagName("div");',
            'args': []
          }).
          andReturnSuccess(WebElement.buildId('foo')).
          end();

      var driver = executor.createDriver();
      return driver.
          findElements(By.js('return document.getElementsByTagName("div");')).
          then(function(elements) {
            return promise.all(elements.map(function(e) {
              assert.ok(e instanceof WebElement);
              return e.getId();
            }));
          }).
          then((actual) => assert.deepEqual(['foo'], actual));
    });

    it('byJs_canPassScriptArguments', function() {
      var script = 'return document.getElementsByTagName(arguments[0]);';
      let executor = new FakeExecutor().
          expect(CName.EXECUTE_SCRIPT, {
            'script': script,
            'args': ['div']
          }).
          andReturnSuccess([
              WebElement.buildId('one'),
              WebElement.buildId('two')
          ]).
          end();

      var driver = executor.createDriver();
      return driver.findElements(By.js(script, 'div'))
          then(function(elements) {
            return promise.all(elements.map(function(e) {
              assert.ok(e instanceof WebElement);
              return e.getId();
            }));
          }).
          then((actual) => assert.deepEqual(['one', 'two'], actual));
    });
  });

  describe('sendKeys', function() {
    it('convertsVarArgsIntoStrings_simpleArgs', function() {
      let executor = new FakeExecutor().
          expect(CName.SEND_KEYS_TO_ELEMENT,
                 {'id': 'one', 'value':'12abc3'.split('')}).
              andReturnSuccess().
          end();

      var driver = executor.createDriver();
      var element = new WebElement(driver, 'one');
      element.sendKeys(1, 2, 'abc', 3);
      return waitForIdle();
    });

    it('convertsVarArgsIntoStrings_promisedArgs', function() {
      let executor = new FakeExecutor().
          expect(CName.FIND_ELEMENT,
                 {'using':'css selector', 'value':'*[id="foo"]'}).
              andReturnSuccess(WebElement.buildId('one')).
          expect(CName.SEND_KEYS_TO_ELEMENT,
                 {'id':'one', 'value':'abc123def'.split('')}).
              andReturnSuccess().
          end();

      var driver = executor.createDriver();
      var element = driver.findElement(By.id('foo'));
      element.sendKeys(
          promise.fulfilled('abc'), 123,
          promise.fulfilled('def'));
      return waitForIdle();
    });

    it('sendKeysWithAFileDetector', function() {
      let executor = new FakeExecutor().
          expect(CName.FIND_ELEMENT,
                 {'using':'css selector', 'value':'*[id="foo"]'}).
              andReturnSuccess(WebElement.buildId('one')).
          expect(CName.SEND_KEYS_TO_ELEMENT, {'id': 'one',
                                              'value':['modified/path']}).
              andReturnSuccess().
          end();

      let driver = executor.createDriver();
      let handleFile = function(d, path) {
        assert.strictEqual(driver, d);
        assert.equal(path, 'original/path');
        return promise.fulfilled('modified/path');
      };
      driver.setFileDetector({handleFile});

      var element = driver.findElement(By.id('foo'));
      element.sendKeys('original/', 'path');
      return waitForIdle();
    });
  });

  describe('elementEquality', function() {
    it('isReflexive', function() {
      var a = new WebElement({}, 'foo');
      return WebElement.equals(a, a).then(assert.ok);
    });

    it('failsIfAnInputElementCouldNotBeFound', function() {
      var id = promise.rejected(new StubError);
      id.catch(function() {});  // Suppress default handler.

      var driver = new FakeExecutor().createDriver();
      var a = new WebElement(driver, 'foo');
      var b = new WebElementPromise(driver, id);

      return WebElement.equals(a, b).then(fail, assertIsStubError);
    });
  });

  describe('waiting', function() {
    it('waitSucceeds', function() {
      let executor = new FakeExecutor().
          expect(CName.FIND_ELEMENTS,
                 {using: 'css selector', value: '*[id="foo"]'}).
              andReturnSuccess([]).
              times(2).
          expect(CName.FIND_ELEMENTS,
                 {using: 'css selector', value: '*[id="foo"]'}).
              andReturnSuccess([WebElement.buildId('bar')]).
          end();

      var driver = executor.createDriver();
      driver.wait(function() {
        return driver.isElementPresent(By.id('foo'));
      }, 200);
      return waitForIdle();
    });

    it('waitTimesout_timeoutCaught', function() {
      let executor = new FakeExecutor().
          expect(CName.FIND_ELEMENTS,
                 {using: 'css selector', value: '*[id="foo"]'}).
              andReturnSuccess([]).
              anyTimes().
          end();

      var driver = executor.createDriver();
      return driver.wait(function() {
        return driver.isElementPresent(By.id('foo'));
      }, 25).then(fail, function(e) {
        assert.equal('Wait timed out after ',
            e.message.substring(0, 'Wait timed out after '.length));
      });
    });

    it('waitTimesout_timeoutNotCaught', function() {
      let executor = new FakeExecutor().
          expect(CName.FIND_ELEMENTS,
                 {using: 'css selector', value: '*[id="foo"]'}).
              andReturnSuccess([]).
              anyTimes().
          end();

      var driver = executor.createDriver();
      driver.wait(function() {
        return driver.isElementPresent(By.id('foo'));
      }, 25);
      return waitForAbort().then(function(e) {
        assert.equal('Wait timed out after ',
            e.message.substring(0, 'Wait timed out after '.length));
      });
    });
  });

  describe('alert handling', function() {
    it('alertResolvesWhenPromisedTextResolves', function() {
      var textPromise = new promise.Deferred();

      var alert = new AlertPromise({}, textPromise);
      assert.ok(alert.isPending());

      textPromise.fulfill(new Alert({}, 'foo'));
      return alert.getText().then(function(text) {
        assert.equal('foo', text);
      });
    });

    it('cannotSwitchToAlertThatIsNotPresent', function() {
      let e = new error.NoSuchAlertError;
      let executor = new FakeExecutor()
          .expect(CName.GET_ALERT_TEXT)
          .andReturnError(e)
          .end();

      var driver = executor.createDriver();
      var alert = driver.switchTo().alert();
      alert.dismiss();  // Should never execute.
      return waitForAbort().then(v => assert.strictEqual(v, e));
    });

    it('alertsBelongToSameFlowAsParentDriver', function() {
      let executor = new FakeExecutor()
          .expect(CName.GET_ALERT_TEXT).andReturnSuccess('hello')
          .end();

      var driver = executor.createDriver();
      var otherFlow = new promise.ControlFlow();
      otherFlow.execute(function() {
        driver.switchTo().alert().then(function() {
          assert.strictEqual(
              driver.controlFlow(), promise.controlFlow(),
              'Alert should belong to the same flow as its parent driver');
        });
      });

      assert.notEqual(otherFlow, driver.controlFlow);
      return Promise.all([
        waitForIdle(otherFlow),
        waitForIdle(driver.controlFlow())
      ]);
    });

    it('commandsFailIfAlertNotPresent', function() {
      let e = new error.NoSuchAlertError;
      let executor = new FakeExecutor()
          .expect(CName.GET_ALERT_TEXT)
          .andReturnError(e)
          .end();

      var driver = executor.createDriver();
      var alert = driver.switchTo().alert();

      var expectError = (v) => assert.strictEqual(v, e);

      return alert.getText()
          .then(fail, expectedError)
          .then(() => alert.accept())
          .then(fail, expectedError)
          .then(() => alert.dismiss())
          .then(fail, expectError)
          .then(() => alert.sendKeys('hi'))
          .then(fail, expectError);
    });
  });

  it('testWebElementsBelongToSameFlowAsParentDriver', function() {
    let executor = new FakeExecutor()
        .expect(CName.FIND_ELEMENT,
                {using: 'css selector', value: '*[id="foo"]'})
        .andReturnSuccess(WebElement.buildId('abc123'))
        .end();

    var driver = executor.createDriver();
    var otherFlow = new promise.ControlFlow();
    otherFlow.execute(function() {
      driver.findElement({id: 'foo'}).then(function() {
        assert.equal(driver.controlFlow(), promise.controlFlow());
      });
    });

    assert.notEqual(otherFlow, driver.controlFlow);
    return Promise.all([
      waitForIdle(otherFlow),
      waitForIdle(driver.controlFlow())
    ]);
  });

  it('testFetchingLogs', function() {
    let executor = new FakeExecutor().
        expect(CName.GET_LOG, {'type': 'browser'}).
        andReturnSuccess([
            {'level': 'INFO', 'message': 'hello', 'timestamp': 1234},
            {'level': 'DEBUG', 'message': 'abc123', 'timestamp': 5678}
        ]).
        end();

    var driver = executor.createDriver();
    return driver.manage().logs().get('browser').then(function(entries) {
      assert.equal(2, entries.length);

      assert.ok(entries[0] instanceof logging.Entry);
      assert.equal(logging.Level.INFO.value, entries[0].level.value);
      assert.equal('hello', entries[0].message);
      assert.equal(1234, entries[0].timestamp);

      assert.ok(entries[1] instanceof logging.Entry);
      assert.equal(logging.Level.DEBUG.value, entries[1].level.value);
      assert.equal('abc123', entries[1].message);
      assert.equal(5678, entries[1].timestamp);
    });
  });

  it('testCommandsFailIfInitialSessionCreationFailed', function() {
    var session = promise.rejected(new StubError);

    var driver = new FakeExecutor().createDriver(session);
    var navigateResult = driver.get('some-url').then(fail, assertIsStubError);
    var quitResult = driver.quit().then(fail, assertIsStubError);

    return waitForIdle().then(function() {
      return promise.all(navigateResult, quitResult);
    });
  });

  it('testWebElementCommandsFailIfInitialDriverCreationFailed', function() {
    var session = Promise.reject(new StubError);
    var driver = new FakeExecutor().createDriver(session);
    return driver.findElement(By.id('foo')).click().
        then(fail, assertIsStubError);
  });

  it('testWebElementCommansFailIfElementCouldNotBeFound', function() {
    let e = new error.NoSuchElementError('Unable to find element');
    let executor = new FakeExecutor().
        expect(CName.FIND_ELEMENT,
               {using: 'css selector', value: '*[id="foo"]'}).
            andReturnError(e).
        end();

    var driver = executor.createDriver();
    return driver.findElement(By.id('foo')).click()
        .then(fail, v => assert.strictEqual(v, e));
  });

  it('testCannotFindChildElementsIfParentCouldNotBeFound', function() {
    let e = new error.NoSuchElementError('Unable to find element');
    let executor = new FakeExecutor().
        expect(CName.FIND_ELEMENT,
               {using: 'css selector', value: '*[id="foo"]'}).
        andReturnError(e).
        end();

    var driver = executor.createDriver();
    return driver.findElement(By.id('foo'))
        .findElement(By.id('bar'))
        .findElement(By.id('baz'))
        .then(fail, v => assert.strictEqual(v, e));
  });

  describe('actions()', function() {
    it('failsIfInitialDriverCreationFailed', function() {
      let session = promise.rejected(new StubError);
      session.catch(function() {});
      return new FakeExecutor().
          createDriver(session).
          actions().
          mouseDown().
          mouseUp().
          perform().
          catch(assertIsStubError);
    });

    describe('mouseMove', function() {
      it('noElement', function() {
        let executor = new FakeExecutor()
            .expect(CName.MOVE_TO, {'xoffset': 0, 'yoffset': 125})
            .andReturnSuccess()
            .end();

        return executor.createDriver().
            actions().
            mouseMove({x: 0, y: 125}).
            perform();
      });

      it('element', function() {
        let executor = new FakeExecutor()
            .expect(CName.FIND_ELEMENT,
                    {using: 'css selector', value: '*[id="foo"]'})
                .andReturnSuccess(WebElement.buildId('abc123'))
            .expect(CName.MOVE_TO,
                    {'element': 'abc123', 'xoffset': 0, 'yoffset': 125})
                .andReturnSuccess()
            .end();

        var driver = executor.createDriver();
        var element = driver.findElement(By.id('foo'));
        return driver.actions()
            .mouseMove(element, {x: 0, y: 125})
            .perform();
      });
    });

    it('supportsMouseDown', function() {
      let executor = new FakeExecutor()
          .expect(CName.MOUSE_DOWN, {'button': Button.LEFT})
              .andReturnSuccess()
          .end();

      return executor.createDriver().
          actions().
          mouseDown().
          perform();
    });

    it('testActionSequence', function() {
      let executor = new FakeExecutor()
          .expect(CName.FIND_ELEMENT,
                  {using: 'css selector', value: '*[id="a"]'})
              .andReturnSuccess(WebElement.buildId('id1'))
          .expect(CName.FIND_ELEMENT,
                  {using: 'css selector', value: '*[id="b"]'})
              .andReturnSuccess(WebElement.buildId('id2'))
          .expect(CName.SEND_KEYS_TO_ACTIVE_ELEMENT,
              {'value': [Key.SHIFT]})
              .andReturnSuccess()
          .expect(CName.MOVE_TO, {'element': 'id1'})
              .andReturnSuccess()
          .expect(CName.CLICK, {'button': Button.LEFT})
              .andReturnSuccess()
          .expect(CName.MOVE_TO, {'element': 'id2'})
              .andReturnSuccess()
          .expect(CName.CLICK, {'button': Button.LEFT})
              .andReturnSuccess()
          .end();

      var driver = executor.createDriver();
      var element1 = driver.findElement(By.id('a'));
      var element2 = driver.findElement(By.id('b'));

      return driver.actions()
          .keyDown(Key.SHIFT)
          .click(element1)
          .click(element2)
          .perform();
    });
  });

  describe('touchActions()', function() {
    it('failsIfInitialDriverCreationFailed', function() {
      let session = promise.rejected(new StubError);
      session.catch(function() {});
      return new FakeExecutor().
          createDriver(session).
          touchActions().
          scroll({x: 3, y: 4}).
          perform().
          catch(assertIsStubError);
    });

    it('testTouchActionSequence', function() {
      let executor = new FakeExecutor()
          .expect(CName.TOUCH_DOWN, {x: 1, y: 2}).andReturnSuccess()
          .expect(CName.TOUCH_MOVE, {x: 3, y: 4}).andReturnSuccess()
          .expect(CName.TOUCH_UP, {x: 5, y: 6}).andReturnSuccess()
          .end();

      var driver = executor.createDriver();
      return driver.touchActions()
          .tapAndHold({x: 1, y: 2})
          .move({x: 3, y: 4})
          .release({x: 5, y: 6})
          .perform();
    });
  });

  describe('generator support', function() {
    var driver;

    beforeEach(function() {
      driver = new WebDriver(
          new Session('test-session', {}),
          new ExplodingExecutor());
    });

    it('canUseGeneratorsWithWebDriverCall', function() {
      return driver.call(function* () {
        var x = yield promise.fulfilled(1);
        var y = yield promise.fulfilled(2);
        return x + y;
      }).then(function(value) {
        assert.deepEqual(3, value);
      });
    });

    it('canDefineScopeOnGeneratorCall', function() {
      return driver.call(function* () {
        var x = yield promise.fulfilled(1);
        return this.name + x;
      }, {name: 'Bob'}).then(function(value) {
        assert.deepEqual('Bob1', value);
      });
    });

    it('canSpecifyArgsOnGeneratorCall', function() {
      return driver.call(function* (a, b) {
        var x = yield promise.fulfilled(1);
        var y = yield promise.fulfilled(2);
        return [x + y, a, b];
      }, null, 'abc', 123).then(function(value) {
        assert.deepEqual([3, 'abc', 123], value);
      });
    });

    it('canUseGeneratorWithWebDriverWait', function() {
      var values = [];
      return driver.wait(function* () {
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

    /**
     * @constructor
     * @implements {CommandExecutor}
     */
    function ExplodingExecutor() {}


    /** @override */
    ExplodingExecutor.prototype.execute = function(command, cb) {
      cb(Error('Unsupported operation'));
    };
  });

  describe('wire format', function() {
    describe('can serialize', function() {
      function runSerializeTest(input, want) {
        let executor = new FakeExecutor().
            expect(CName.NEW_SESSION).
            withParameters({'desiredCapabilities': want}).
            andReturnSuccess({'browserName': 'firefox'}).
            end();
        return WebDriver.createSession(executor, input)
            .getSession();
      }

      it('function as a string', function() {
        function foo() { return 'foo'; }
        return runSerializeTest(foo, '' + foo);
      });

      it('object with toJSON()', function() {
        return runSerializeTest(
            new Date(605728511546),
            '1989-03-12T17:55:11.546Z');
      });

      it('Session', function() {
        return runSerializeTest(new Session('foo', {}), 'foo');
      });

      it('Capabilities', function() {
        var prefs = new logging.Preferences();
        prefs.setLevel(logging.Type.BROWSER, logging.Level.DEBUG);

        var caps = Capabilities.chrome();
        caps.setLoggingPrefs(prefs);

        return runSerializeTest(
            caps,
            {
              'browserName': 'chrome',
              'loggingPrefs': {'browser': 'DEBUG'}
            });
      });

      it('WebElement', function() {
        return runSerializeTest(
            new WebElement({}, 'fefifofum'),
            WebElement.buildId('fefifofum'));
      });

      it('WebElementPromise', function() {
        return runSerializeTest(
            new WebElementPromise(
                {}, promise.fulfilled(new WebElement({}, 'fefifofum'))),
            WebElement.buildId('fefifofum'));
      });

      describe('an array', function() {
        it('with Serializable', function() {
          return runSerializeTest([new Session('foo', {})], ['foo']);
        });

        it('with WebElement', function() {
          return runSerializeTest(
              [new WebElement({}, 'fefifofum')],
              [WebElement.buildId('fefifofum')]);
        });

        it('with WebElementPromise', function() {
          return runSerializeTest(
              [new WebElementPromise(
                  {}, promise.fulfilled(new WebElement({}, 'fefifofum')))],
              [WebElement.buildId('fefifofum')]);
        });

        it('complex array', function() {
          var expected = [
            'abc', 123, true, WebElement.buildId('fefifofum'),
            [123, {'foo': 'bar'}]
          ];

          var element = new WebElement({}, 'fefifofum');
          var input = ['abc', 123, true, element, [123, {'foo': 'bar'}]];
          return runSerializeTest(input, expected);
        });

        it('nested promises', function() {
          return runSerializeTest(
              ['abc', Promise.resolve([123, Promise.resolve(true)])],
              ['abc', [123, true]]);
        });
      });

      describe('an object', function() {
        it('literal', function() {
          var expected = {sessionId: 'foo'};
          return runSerializeTest({sessionId: 'foo'}, expected);
        });

        it('with sub-objects', function() {
          var expected = {sessionId: {value: 'foo'}};
          return runSerializeTest(
              {sessionId: {value: 'foo'}}, expected);
        });

        it('with values that have toJSON', function() {
          return runSerializeTest(
              {a: {b: new Date(605728511546)}},
              {a: {b: '1989-03-12T17:55:11.546Z'}});
        });

        it('with a Session', function() {
          return runSerializeTest(
              {a: new Session('foo', {})},
              {a: 'foo'});
        });

        it('nested', function() {
          var elementJson = WebElement.buildId('fefifofum');
          var expected = {
            'script': 'return 1',
            'args': ['abc', 123, true, elementJson, [123, {'foo': 'bar'}]],
            'sessionId': 'foo'
          };

          var element = new WebElement({}, 'fefifofum');
          var parameters = {
            'script': 'return 1',
            'args':['abc', 123, true, element, [123, {'foo': 'bar'}]],
            'sessionId': new Session('foo', {})
          };

          return runSerializeTest(parameters, expected);
        });
      });
    });

    describe('can deserialize', function() {
      function runDeserializeTest(original, want) {
        let executor = new FakeExecutor()
            .expect(CName.GET_CURRENT_URL)
            .andReturnSuccess(original)
            .end();
        let driver = executor.createDriver();
        return driver.getCurrentUrl().then(function(got) {
          assert.deepEqual(got, want);
        });
      }

      it('primitives', function() {
        return Promise.all([
            runDeserializeTest(1, 1),
            runDeserializeTest('', ''),
            runDeserializeTest(true, true),
            runDeserializeTest(undefined, undefined),
            runDeserializeTest(null, null)
        ]);
      });

      it('simple object', function() {
        return runDeserializeTest(
            {sessionId: 'foo'},
            {sessionId: 'foo'});
      });

      it('nested object', function() {
        return runDeserializeTest(
            {'foo': {'bar': 123}},
            {'foo': {'bar': 123}});
      });

      it('array', function() {
        return runDeserializeTest(
            [{'foo': {'bar': 123}}],
            [{'foo': {'bar': 123}}]);
      });

      it('passes through function properties', function() {
        function bar() {}
        return runDeserializeTest(
            [{foo: {'bar': 123}, func: bar}],
            [{foo: {'bar': 123}, func: bar}]);
      });
    });
  });
});
