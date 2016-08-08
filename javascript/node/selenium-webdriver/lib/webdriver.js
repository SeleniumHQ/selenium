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
 * @fileoverview The heart of the WebDriver JavaScript API.
 */

'use strict';

const actions = require('./actions');
const by = require('./by');
const Capabilities = require('./capabilities').Capabilities;
const command = require('./command');
const error = require('./error');
const input = require('./input');
const logging = require('./logging');
const Session = require('./session').Session;
const Symbols = require('./symbols');
const promise = require('./promise');


/**
 * Defines a condition for use with WebDriver's {@linkplain WebDriver#wait wait
 * command}.
 *
 * @template OUT
 */
class Condition {
  /**
   * @param {string} message A descriptive error message. Should complete the
   *     sentence "Waiting [...]"
   * @param {function(!WebDriver): OUT} fn The condition function to
   *     evaluate on each iteration of the wait loop.
   */
  constructor(message, fn) {
    /** @private {string} */
    this.description_ = 'Waiting ' + message;

    /** @type {function(!WebDriver): OUT} */
    this.fn = fn;
  }

  /** @return {string} A description of this condition. */
  description() {
    return this.description_;
  }
}


/**
 * Defines a condition that will result in a {@link WebElement}.
 *
 * @extends {Condition<!(WebElement|promise.Promise<!WebElement>)>}
 */
class WebElementCondition extends Condition {
  /**
   * @param {string} message A descriptive error message. Should complete the
   *     sentence "Waiting [...]"
   * @param {function(!WebDriver): !(WebElement|promise.Promise<!WebElement>)}
   *     fn The condition function to evaluate on each iteration of the wait
   *     loop.
   */
  constructor(message, fn) {
    super(message, fn);
  }
}


//////////////////////////////////////////////////////////////////////////////
//
//  WebDriver
//
//////////////////////////////////////////////////////////////////////////////


/**
 * Translates a command to its wire-protocol representation before passing it
 * to the given `executor` for execution.
 * @param {!command.Executor} executor The executor to use.
 * @param {!command.Command} command The command to execute.
 * @return {!Promise} A promise that will resolve with the command response.
 */
function executeCommand(executor, command) {
  return toWireValue(command.getParameters()).
      then(function(parameters) {
        command.setParameters(parameters);
        return executor.execute(command);
      });
}


/**
 * Converts an object to its JSON representation in the WebDriver wire protocol.
 * When converting values of type object, the following steps will be taken:
 * <ol>
 * <li>if the object is a WebElement, the return value will be the element's
 *     server ID
 * <li>if the object defines a {@link Symbols.serialize} method, this algorithm
 *     will be recursively applied to the object's serialized representation
 * <li>if the object provides a "toJSON" function, this algorithm will
 *     recursively be applied to the result of that function
 * <li>otherwise, the value of each key will be recursively converted according
 *     to the rules above.
 * </ol>
 *
 * @param {*} obj The object to convert.
 * @return {!Promise<?>} A promise that will resolve to the input value's JSON
 *     representation.
 */
function toWireValue(obj) {
  if (promise.isPromise(obj)) {
    return Promise.resolve(obj).then(toWireValue);
  }
  return Promise.resolve(convertValue(obj));
}


function convertValue(value) {
  if (value === void 0 || value === null) {
    return value;
  }

  if (typeof value === 'boolean'
      || typeof value === 'number'
      || typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return convertKeys(value);
  }

  if (typeof value === 'function') {
    return '' + value;
  }

  if (typeof value[Symbols.serialize] === 'function') {
    return toWireValue(value[Symbols.serialize]());
  } else if (typeof value.toJSON === 'function') {
    return toWireValue(value.toJSON());
  }
  return convertKeys(value);
}


function convertKeys(obj) {
  const isArray = Array.isArray(obj);
  const numKeys = isArray ? obj.length : Object.keys(obj).length;
  const ret = isArray ? new Array(numKeys) : {};
  if (!numKeys) {
    return Promise.resolve(ret);
  }

  let numResolved = 0;

  function forEachKey(obj, fn) {
    if (Array.isArray(obj)) {
      for (let i = 0, n = obj.length; i < n; i++) {
        fn(obj[i], i);
      }
    } else {
      for (let key in obj) {
        fn(obj[key], key);
      }
    }
  }

  return new Promise(function(done, reject) {
    forEachKey(obj, function(value, key) {
      if (promise.isPromise(value)) {
        value.then(toWireValue).then(setValue, reject);
      } else {
        value = convertValue(value);
        if (promise.isPromise(value)) {
          value.then(toWireValue).then(setValue, reject);
        } else {
          setValue(value);
        }
      }

      function setValue(value) {
        ret[key] = value;
        maybeFulfill();
      }
    });

    function maybeFulfill() {
      if (++numResolved === numKeys) {
        done(ret);
      }
    }
  });
}


/**
 * Converts a value from its JSON representation according to the WebDriver wire
 * protocol. Any JSON object that defines a WebElement ID will be decoded to a
 * {@link WebElement} object. All other values will be passed through as is.
 *
 * @param {!WebDriver} driver The driver to use as the parent of any unwrapped
 *     {@link WebElement} values.
 * @param {*} value The value to convert.
 * @return {*} The converted value.
 */
function fromWireValue(driver, value) {
  if (Array.isArray(value)) {
    value = value.map(v => fromWireValue(driver, v));
  } else if (WebElement.isId(value)) {
    let id = WebElement.extractId(value);
    value = new WebElement(driver, id);
  } else if (value && typeof value === 'object') {
    let result = {};
    for (let key in value) {
      if (value.hasOwnProperty(key)) {
        result[key] = fromWireValue(driver, value[key]);
      }
    }
    value = result;
  }
  return value;
}


/**
 * Creates a new WebDriver client, which provides control over a browser.
 *
 * Every command.Command returns a {@link promise.Promise} that
 * represents the result of that command. Callbacks may be registered on this
 * object to manipulate the command result or catch an expected error. Any
 * commands scheduled with a callback are considered sub-commands and will
 * execute before the next command in the current frame. For example:
 *
 *     var message = [];
 *     driver.call(message.push, message, 'a').then(function() {
 *       driver.call(message.push, message, 'b');
 *     });
 *     driver.call(message.push, message, 'c');
 *     driver.call(function() {
 *       alert('message is abc? ' + (message.join('') == 'abc'));
 *     });
 *
 */
class WebDriver {
  /**
   * @param {!(Session|promise.Promise<!Session>)} session Either a
   *     known session or a promise that will be resolved to a session.
   * @param {!command.Executor} executor The executor to use when sending
   *     commands to the browser.
   * @param {promise.ControlFlow=} opt_flow The flow to
   *     schedule commands through. Defaults to the active flow object.
   */
  constructor(session, executor, opt_flow) {
    /** @private {!promise.Promise<!Session>} */
    this.session_ = promise.fulfilled(session);

    /** @private {!command.Executor} */
    this.executor_ = executor;

    /** @private {!promise.ControlFlow} */
    this.flow_ = opt_flow || promise.controlFlow();

    /** @private {input.FileDetector} */
    this.fileDetector_ = null;
  }

  /**
   * Creates a new WebDriver client for an existing session.
   * @param {!command.Executor} executor Command executor to use when querying
   *     for session details.
   * @param {string} sessionId ID of the session to attach to.
   * @param {promise.ControlFlow=} opt_flow The control flow all
   *     driver commands should execute under. Defaults to the
   *     {@link promise.controlFlow() currently active}  control flow.
   * @return {!WebDriver} A new client for the specified session.
   */
  static attachToSession(executor, sessionId, opt_flow) {
    let flow = opt_flow || promise.controlFlow();
    let cmd = new command.Command(command.Name.DESCRIBE_SESSION)
        .setParameter('sessionId', sessionId);
    let session = flow.execute(
        () => executeCommand(executor, cmd).catch(err => {
          // The DESCRIBE_SESSION command is not supported by the W3C spec, so
          // if we get back an unknown command, just return a session with
          // unknown capabilities.
          if (err instanceof error.UnknownCommandError) {
            return new Session(sessionId, new Capabilities);
          }
          throw err;
        }),
        'WebDriver.attachToSession()');
    return new WebDriver(session, executor, flow);
  }

  /**
   * Creates a new WebDriver session.
   *
   * By default, the requested session `capabilities` are merely "desired" and
   * the remote end will still create a new session even if it cannot satisfy
   * all of the requested capabilities. You can query which capabilities a
   * session actually has using the
   * {@linkplain #getCapabilities() getCapabilities()} method on the returned
   * WebDriver instance.
   *
   * To define _required capabilities_, provide the `capabilities` as an object
   * literal with `required` and `desired` keys. The `desired` key may be
   * omitted if all capabilities are required, and vice versa. If the server
   * cannot create a session with all of the required capabilities, it will
   * return an {@linkplain error.SessionNotCreatedError}.
   *
   *     let required = new Capabilities().set('browserName', 'firefox');
   *     let desired = new Capabilities().set('version', '45');
   *     let driver = WebDriver.createSession(executor, {required, desired});
   *
   * This function will always return a WebDriver instance. If there is an error
   * creating the session, such as the aforementioned SessionNotCreatedError,
   * the driver will have a rejected {@linkplain #getSession session} promise.
   * It is recommended that this promise is left _unhandled_ so it will
   * propagate through the {@linkplain promise.ControlFlow control flow} and
   * cause subsequent commands to fail.
   *
   *     let required = Capabilities.firefox();
   *     let driver = WebDriver.createSession(executor, {required});
   *
   *     // If the createSession operation failed, then this command will also
   *     // also fail, propagating the creation failure.
   *     driver.get('http://www.google.com').catch(e => console.log(e));
   *
   * @param {!command.Executor} executor The executor to create the new session
   *     with.
   * @param {(!Capabilities|
   *          {desired: (Capabilities|undefined),
   *           required: (Capabilities|undefined)})} capabilities The desired
   *     capabilities for the new session.
   * @param {promise.ControlFlow=} opt_flow The control flow all driver
   *     commands should execute under, including the initial session creation.
   *     Defaults to the {@link promise.controlFlow() currently active}
   *     control flow.
   * @return {!WebDriver} The driver for the newly created session.
   */
  static createSession(executor, capabilities, opt_flow) {
    let flow = opt_flow || promise.controlFlow();
    let cmd = new command.Command(command.Name.NEW_SESSION);

    if (capabilities && (capabilities.desired || capabilities.required)) {
      cmd.setParameter('desiredCapabilities', capabilities.desired);
      cmd.setParameter('requiredCapabilities', capabilities.required);
    } else {
      cmd.setParameter('desiredCapabilities', capabilities);
    }

    let session = flow.execute(
        () => executeCommand(executor, cmd),
        'WebDriver.createSession()');
    return new WebDriver(session, executor, flow);
  }

  /**
   * @return {!promise.ControlFlow} The control flow used by this
   *     instance.
   */
  controlFlow() {
    return this.flow_;
  }

  /**
   * Schedules a {@link command.Command} to be executed by this driver's
   * {@link command.Executor}.
   *
   * @param {!command.Command} command The command to schedule.
   * @param {string} description A description of the command for debugging.
   * @return {!promise.Promise<T>} A promise that will be resolved
   *     with the command result.
   * @template T
   */
  schedule(command, description) {
    var self = this;

    checkHasNotQuit();
    command.setParameter('sessionId', this.session_);

    // If any of the command parameters are rejected promises, those
    // rejections may be reported as unhandled before the control flow
    // attempts to execute the command. To ensure parameters errors
    // propagate through the command itself, we resolve all of the
    // command parameters now, but suppress any errors until the ControlFlow
    // actually executes the command. This addresses scenarios like catching
    // an element not found error in:
    //
    //     driver.findElement(By.id('foo')).click().catch(function(e) {
    //       if (e instanceof NoSuchElementError) {
    //         // Do something.
    //       }
    //     });
    var prepCommand = toWireValue(command.getParameters());
    prepCommand.catch(function() {});

    var flow = this.flow_;
    var executor = this.executor_;
    return flow.execute(function() {
      // A call to WebDriver.quit() may have been scheduled in the same event
      // loop as this |command|, which would prevent us from detecting that the
      // driver has quit above.  Therefore, we need to make another quick check.
      // We still check above so we can fail as early as possible.
      checkHasNotQuit();

      // Retrieve resolved command parameters; any previously suppressed errors
      // will now propagate up through the control flow as part of the command
      // execution.
      return prepCommand.then(function(parameters) {
        command.setParameters(parameters);
        return executor.execute(command);
      }).then(value => fromWireValue(self, value));
    }, description);

    function checkHasNotQuit() {
      if (!self.session_) {
        throw new error.NoSuchSessionError(
          'This driver instance does not have a valid session ID ' +
          '(did you call WebDriver.quit()?) and may no longer be ' +
          'used.');
      }
    }
  }

  /**
   * Sets the {@linkplain input.FileDetector file detector} that should be
   * used with this instance.
   * @param {input.FileDetector} detector The detector to use or {@code null}.
   */
  setFileDetector(detector) {
    this.fileDetector_ = detector;
  }

  /**
   * @return {!command.Executor} The command executor used by this instance.
   */
  getExecutor() {
    return this.executor_;
  }

  /**
   * @return {!promise.Promise<!Session>} A promise for this client's
   *     session.
   */
  getSession() {
    return this.session_;
  }

  /**
   * @return {!promise.Promise<!Capabilities>} A promise
   *     that will resolve with the this instance's capabilities.
   */
  getCapabilities() {
    return this.session_.then(session => session.getCapabilities());
  }

  /**
   * Schedules a command to quit the current session. After calling quit, this
   * instance will be invalidated and may no longer be used to issue commands
   * against the browser.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the command has completed.
   */
  quit() {
    var result = this.schedule(
        new command.Command(command.Name.QUIT),
        'WebDriver.quit()');
    // Delete our session ID when the quit command finishes; this will allow us
    // to throw an error when attemnpting to use a driver post-quit.
    return result.finally(() => delete this.session_);
  }

  /**
   * Creates a new action sequence using this driver. The sequence will not be
   * scheduled for execution until {@link actions.ActionSequence#perform} is
   * called. Example:
   *
   *     driver.actions().
   *         mouseDown(element1).
   *         mouseMove(element2).
   *         mouseUp().
   *         perform();
   *
   * @return {!actions.ActionSequence} A new action sequence for this instance.
   */
  actions() {
    return new actions.ActionSequence(this);
  }

  /**
   * Creates a new touch sequence using this driver. The sequence will not be
   * scheduled for execution until {@link actions.TouchSequence#perform} is
   * called. Example:
   *
   *     driver.touchActions().
   *         tap(element1).
   *         doubleTap(element2).
   *         perform();
   *
   * @return {!actions.TouchSequence} A new touch sequence for this instance.
   */
  touchActions() {
    return new actions.TouchSequence(this);
  }

  /**
   * Schedules a command to execute JavaScript in the context of the currently
   * selected frame or window. The script fragment will be executed as the body
   * of an anonymous function. If the script is provided as a function object,
   * that function will be converted to a string for injection into the target
   * window.
   *
   * Any arguments provided in addition to the script will be included as script
   * arguments and may be referenced using the {@code arguments} object.
   * Arguments may be a boolean, number, string, or {@linkplain WebElement}.
   * Arrays and objects may also be used as script arguments as long as each item
   * adheres to the types previously mentioned.
   *
   * The script may refer to any variables accessible from the current window.
   * Furthermore, the script will execute in the window's context, thus
   * {@code document} may be used to refer to the current document. Any local
   * variables will not be available once the script has finished executing,
   * though global variables will persist.
   *
   * If the script has a return value (i.e. if the script contains a return
   * statement), then the following steps will be taken for resolving this
   * functions return value:
   *
   * - For a HTML element, the value will resolve to a {@linkplain WebElement}
   * - Null and undefined return values will resolve to null</li>
   * - Booleans, numbers, and strings will resolve as is</li>
   * - Functions will resolve to their string representation</li>
   * - For arrays and objects, each member item will be converted according to
   *     the rules above
   *
   * @param {!(string|Function)} script The script to execute.
   * @param {...*} var_args The arguments to pass to the script.
   * @return {!promise.Promise<T>} A promise that will resolve to the
   *    scripts return value.
   * @template T
   */
  executeScript(script, var_args) {
    if (typeof script === 'function') {
      script = 'return (' + script + ').apply(null, arguments);';
    }
    let args =
        arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : [];
   return this.schedule(
        new command.Command(command.Name.EXECUTE_SCRIPT).
            setParameter('script', script).
            setParameter('args', args),
        'WebDriver.executeScript()');
  }

  /**
   * Schedules a command to execute asynchronous JavaScript in the context of the
   * currently selected frame or window. The script fragment will be executed as
   * the body of an anonymous function. If the script is provided as a function
   * object, that function will be converted to a string for injection into the
   * target window.
   *
   * Any arguments provided in addition to the script will be included as script
   * arguments and may be referenced using the {@code arguments} object.
   * Arguments may be a boolean, number, string, or {@code WebElement}.
   * Arrays and objects may also be used as script arguments as long as each item
   * adheres to the types previously mentioned.
   *
   * Unlike executing synchronous JavaScript with {@link #executeScript},
   * scripts executed with this function must explicitly signal they are finished
   * by invoking the provided callback. This callback will always be injected
   * into the executed function as the last argument, and thus may be referenced
   * with {@code arguments[arguments.length - 1]}. The following steps will be
   * taken for resolving this functions return value against the first argument
   * to the script's callback function:
   *
   * - For a HTML element, the value will resolve to a
   *     {@link WebElement}
   * - Null and undefined return values will resolve to null
   * - Booleans, numbers, and strings will resolve as is
   * - Functions will resolve to their string representation
   * - For arrays and objects, each member item will be converted according to
   *     the rules above
   *
   * __Example #1:__ Performing a sleep that is synchronized with the currently
   * selected window:
   *
   *     var start = new Date().getTime();
   *     driver.executeAsyncScript(
   *         'window.setTimeout(arguments[arguments.length - 1], 500);').
   *         then(function() {
   *           console.log(
   *               'Elapsed time: ' + (new Date().getTime() - start) + ' ms');
   *         });
   *
   * __Example #2:__ Synchronizing a test with an AJAX application:
   *
   *     var button = driver.findElement(By.id('compose-button'));
   *     button.click();
   *     driver.executeAsyncScript(
   *         'var callback = arguments[arguments.length - 1];' +
   *         'mailClient.getComposeWindowWidget().onload(callback);');
   *     driver.switchTo().frame('composeWidget');
   *     driver.findElement(By.id('to')).sendKeys('dog@example.com');
   *
   * __Example #3:__ Injecting a XMLHttpRequest and waiting for the result. In
   * this example, the inject script is specified with a function literal. When
   * using this format, the function is converted to a string for injection, so it
   * should not reference any symbols not defined in the scope of the page under
   * test.
   *
   *     driver.executeAsyncScript(function() {
   *       var callback = arguments[arguments.length - 1];
   *       var xhr = new XMLHttpRequest();
   *       xhr.open("GET", "/resource/data.json", true);
   *       xhr.onreadystatechange = function() {
   *         if (xhr.readyState == 4) {
   *           callback(xhr.responseText);
   *         }
   *       };
   *       xhr.send('');
   *     }).then(function(str) {
   *       console.log(JSON.parse(str)['food']);
   *     });
   *
   * @param {!(string|Function)} script The script to execute.
   * @param {...*} var_args The arguments to pass to the script.
   * @return {!promise.Promise<T>} A promise that will resolve to the
   *    scripts return value.
   * @template T
   */
  executeAsyncScript(script, var_args) {
    if (typeof script === 'function') {
      script = 'return (' + script + ').apply(null, arguments);';
    }
    let args = Array.prototype.slice.call(arguments, 1);
    return this.schedule(
        new command.Command(command.Name.EXECUTE_ASYNC_SCRIPT).
            setParameter('script', script).
            setParameter('args', args),
        'WebDriver.executeScript()');
  }

  /**
   * Schedules a command to execute a custom function.
   * @param {function(...): (T|promise.Promise<T>)} fn The function to
   *     execute.
   * @param {Object=} opt_scope The object in whose scope to execute the function.
   * @param {...*} var_args Any arguments to pass to the function.
   * @return {!promise.Promise<T>} A promise that will be resolved'
   *     with the function's result.
   * @template T
   */
  call(fn, opt_scope, var_args) {
    let args = Array.prototype.slice.call(arguments, 2);
    let flow = this.flow_;
    return flow.execute(function() {
      return promise.fullyResolved(args).then(function(args) {
        if (promise.isGenerator(fn)) {
          args.unshift(fn, opt_scope);
          return promise.consume.apply(null, args);
        }
        return fn.apply(opt_scope, args);
      });
    }, 'WebDriver.call(' + (fn.name || 'function') + ')');
  }

  /**
   * Schedules a command to wait for a condition to hold. The condition may be
   * specified by a {@link Condition}, as a custom function, or as any
   * promise-like thenable.
   *
   * For a {@link Condition} or function, the wait will repeatedly
   * evaluate the condition until it returns a truthy value. If any errors occur
   * while evaluating the condition, they will be allowed to propagate. In the
   * event a condition returns a {@link promise.Promise promise}, the polling
   * loop will wait for it to be resolved and use the resolved value for whether
   * the condition has been satisified. Note the resolution time for a promise
   * is factored into whether a wait has timed out.
   *
   * Note, if the provided condition is a {@link WebElementCondition}, then
   * the wait will return a {@link WebElementPromise} that will resolve to the
   * element that satisified the condition.
   *
   * _Example:_ waiting up to 10 seconds for an element to be present on the
   * page.
   *
   *     var button = driver.wait(until.elementLocated(By.id('foo')), 10000);
   *     button.click();
   *
   * This function may also be used to block the command flow on the resolution
   * of any thenable promise object. When given a promise, the command will
   * simply wait for its resolution before completing. A timeout may be provided
   * to fail the command if the promise does not resolve before the timeout
   * expires.
   *
   * _Example:_ Suppose you have a function, `startTestServer`, that returns a
   * promise for when a server is ready for requests. You can block a WebDriver
   * client on this promise with:
   *
   *     var started = startTestServer();
   *     driver.wait(started, 5 * 1000, 'Server should start within 5 seconds');
   *     driver.get(getServerUrl());
   *
   * @param {!(promise.Promise<T>|
   *           Condition<T>|
   *           function(!WebDriver): T)} condition The condition to
   *     wait on, defined as a promise, condition object, or  a function to
   *     evaluate as a condition.
   * @param {number=} opt_timeout How long to wait for the condition to be true.
   * @param {string=} opt_message An optional message to use if the wait times
   *     out.
   * @return {!(promise.Promise<T>|WebElementPromise)} A promise that will be
   *     resolved with the first truthy value returned by the condition
   *     function, or rejected if the condition times out. If the input
   *     input condition is an instance of a {@link WebElementCondition},
   *     the returned value will be a {@link WebElementPromise}.
   * @template T
   */
  wait(condition, opt_timeout, opt_message) {
    if (promise.isPromise(condition)) {
      return this.flow_.wait(
          /** @type {!promise.Promise} */(condition),
          opt_timeout, opt_message);
    }

    var message = opt_message;
    var fn = /** @type {!Function} */(condition);
    if (condition instanceof Condition) {
      message = message || condition.description();
      fn = condition.fn;
    }

    var driver = this;
    var result = this.flow_.wait(function() {
      if (promise.isGenerator(fn)) {
        return promise.consume(fn, null, [driver]);
      }
      return fn(driver);
    }, opt_timeout, message);

    if (condition instanceof WebElementCondition) {
      result = new WebElementPromise(this, result.then(function(value) {
        if (!(value instanceof WebElement)) {
          throw TypeError(
              'WebElementCondition did not resolve to a WebElement: '
                  + Object.prototype.toString.call(value));
        }
        return value;
      }));
    }
    return result;
  }

  /**
   * Schedules a command to make the driver sleep for the given amount of time.
   * @param {number} ms The amount of time, in milliseconds, to sleep.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the sleep has finished.
   */
  sleep(ms) {
    return this.flow_.timeout(ms, 'WebDriver.sleep(' + ms + ')');
  }

  /**
   * Schedules a command to retrieve the current window handle.
   * @return {!promise.Promise<string>} A promise that will be
   *     resolved with the current window handle.
   */
  getWindowHandle() {
    return this.schedule(
        new command.Command(command.Name.GET_CURRENT_WINDOW_HANDLE),
        'WebDriver.getWindowHandle()');
  }

  /**
   * Schedules a command to retrieve the current list of available window handles.
   * @return {!promise.Promise.<!Array<string>>} A promise that will
   *     be resolved with an array of window handles.
   */
  getAllWindowHandles() {
    return this.schedule(
        new command.Command(command.Name.GET_WINDOW_HANDLES),
        'WebDriver.getAllWindowHandles()');
  }

  /**
   * Schedules a command to retrieve the current page's source. The page source
   * returned is a representation of the underlying DOM: do not expect it to be
   * formatted or escaped in the same way as the response sent from the web
   * server.
   * @return {!promise.Promise<string>} A promise that will be
   *     resolved with the current page source.
   */
  getPageSource() {
    return this.schedule(
        new command.Command(command.Name.GET_PAGE_SOURCE),
        'WebDriver.getPageSource()');
  }

  /**
   * Schedules a command to close the current window.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when this command has completed.
   */
  close() {
    return this.schedule(new command.Command(command.Name.CLOSE),
                         'WebDriver.close()');
  }

  /**
   * Schedules a command to navigate to the given URL.
   * @param {string} url The fully qualified URL to open.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the document has finished loading.
   */
  get(url) {
    return this.navigate().to(url);
  }

  /**
   * Schedules a command to retrieve the URL of the current page.
   * @return {!promise.Promise<string>} A promise that will be
   *     resolved with the current URL.
   */
  getCurrentUrl() {
    return this.schedule(
        new command.Command(command.Name.GET_CURRENT_URL),
        'WebDriver.getCurrentUrl()');
  }

  /**
   * Schedules a command to retrieve the current page's title.
   * @return {!promise.Promise<string>} A promise that will be
   *     resolved with the current page's title.
   */
  getTitle() {
    return this.schedule(new command.Command(command.Name.GET_TITLE),
                         'WebDriver.getTitle()');
  }

  /**
   * Schedule a command to find an element on the page. If the element cannot be
   * found, a {@link bot.ErrorCode.NO_SUCH_ELEMENT} result will be returned
   * by the driver. Unlike other commands, this error cannot be suppressed. In
   * other words, scheduling a command to find an element doubles as an assert
   * that the element is present on the page. To test whether an element is
   * present on the page, use {@link #isElementPresent} instead.
   *
   * The search criteria for an element may be defined using one of the
   * factories in the {@link webdriver.By} namespace, or as a short-hand
   * {@link webdriver.By.Hash} object. For example, the following two statements
   * are equivalent:
   *
   *     var e1 = driver.findElement(By.id('foo'));
   *     var e2 = driver.findElement({id:'foo'});
   *
   * You may also provide a custom locator function, which takes as input this
   * instance and returns a {@link WebElement}, or a promise that will resolve
   * to a WebElement. If the returned promise resolves to an array of
   * WebElements, WebDriver will use the first element. For example, to find the
   * first visible link on a page, you could write:
   *
   *     var link = driver.findElement(firstVisibleLink);
   *
   *     function firstVisibleLink(driver) {
   *       var links = driver.findElements(By.tagName('a'));
   *       return promise.filter(links, function(link) {
   *         return link.isDisplayed();
   *       });
   *     }
   *
   * @param {!(by.By|Function)} locator The locator to use.
   * @return {!WebElementPromise} A WebElement that can be used to issue
   *     commands against the located element. If the element is not found, the
   *     element will be invalidated and all scheduled commands aborted.
   */
  findElement(locator) {
    let id;
    locator = by.checkedLocator(locator);
    if (typeof locator === 'function') {
      id = this.findElementInternal_(locator, this);
    } else {
      let cmd = new command.Command(command.Name.FIND_ELEMENT).
          setParameter('using', locator.using).
          setParameter('value', locator.value);
      id = this.schedule(cmd, 'WebDriver.findElement(' + locator + ')');
    }
    return new WebElementPromise(this, id);
  }

  /**
   * @param {!Function} locatorFn The locator function to use.
   * @param {!(WebDriver|WebElement)} context The search
   *     context.
   * @return {!promise.Promise.<!WebElement>} A
   *     promise that will resolve to a list of WebElements.
   * @private
   */
  findElementInternal_(locatorFn, context) {
    return this.call(() => locatorFn(context)).then(function(result) {
      if (Array.isArray(result)) {
        result = result[0];
      }
      if (!(result instanceof WebElement)) {
        throw new TypeError('Custom locator did not return a WebElement');
      }
      return result;
    });
  }

  /**
   * Schedule a command to search for multiple elements on the page.
   *
   * @param {!(by.By|Function)} locator The locator to use.
   * @return {!promise.Promise.<!Array.<!WebElement>>} A
   *     promise that will resolve to an array of WebElements.
   */
  findElements(locator) {
    locator = by.checkedLocator(locator);
    if (typeof locator === 'function') {
      return this.findElementsInternal_(locator, this);
    } else {
      let cmd = new command.Command(command.Name.FIND_ELEMENTS).
          setParameter('using', locator.using).
          setParameter('value', locator.value);
      let res = this.schedule(cmd, 'WebDriver.findElements(' + locator + ')');
      return res.catch(function(e) {
        if (e instanceof error.NoSuchElementError) {
          return [];
        }
        throw e;
      });
    }
  }

  /**
   * @param {!Function} locatorFn The locator function to use.
   * @param {!(WebDriver|WebElement)} context The search context.
   * @return {!promise.Promise<!Array<!WebElement>>} A promise that
   *     will resolve to an array of WebElements.
   * @private
   */
  findElementsInternal_(locatorFn, context) {
    return this.call(() => locatorFn(context)).then(function(result) {
      if (result instanceof WebElement) {
        return [result];
      }

      if (!Array.isArray(result)) {
        return [];
      }

      return result.filter(function(item) {
        return item instanceof WebElement;
      });
    });
  }

  /**
   * Schedule a command to take a screenshot. The driver makes a best effort to
   * return a screenshot of the following, in order of preference:
   *
   * 1. Entire page
   * 2. Current window
   * 3. Visible portion of the current frame
   * 4. The entire display containing the browser
   *
   * @return {!promise.Promise<string>} A promise that will be
   *     resolved to the screenshot as a base-64 encoded PNG.
   */
  takeScreenshot() {
    return this.schedule(new command.Command(command.Name.SCREENSHOT),
        'WebDriver.takeScreenshot()');
  }

  /**
   * @return {!Options} The options interface for this instance.
   */
  manage() {
    return new Options(this);
  }

  /**
   * @return {!Navigation} The navigation interface for this instance.
   */
  navigate() {
    return new Navigation(this);
  }

  /**
   * @return {!TargetLocator} The target locator interface for this
   *     instance.
   */
  switchTo() {
    return new TargetLocator(this);
  }
}


/**
 * Interface for navigating back and forth in the browser history.
 *
 * This class should never be instantiated directly. Insead, obtain an instance
 * with
 *
 *    webdriver.navigate()
 *
 * @see WebDriver#navigate()
 */
class Navigation {
  /**
   * @param {!WebDriver} driver The parent driver.
   * @private
   */
  constructor(driver) {
    /** @private {!WebDriver} */
    this.driver_ = driver;
  }

  /**
   * Schedules a command to navigate to a new URL.
   * @param {string} url The URL to navigate to.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the URL has been loaded.
   */
  to(url) {
    return this.driver_.schedule(
        new command.Command(command.Name.GET).
            setParameter('url', url),
        'WebDriver.navigate().to(' + url + ')');
  }

  /**
   * Schedules a command to move backwards in the browser history.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the navigation event has completed.
   */
  back() {
    return this.driver_.schedule(
        new command.Command(command.Name.GO_BACK),
        'WebDriver.navigate().back()');
  }

  /**
   * Schedules a command to move forwards in the browser history.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the navigation event has completed.
   */
  forward() {
    return this.driver_.schedule(
        new command.Command(command.Name.GO_FORWARD),
        'WebDriver.navigate().forward()');
  }

  /**
   * Schedules a command to refresh the current page.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the navigation event has completed.
   */
  refresh() {
    return this.driver_.schedule(
        new command.Command(command.Name.REFRESH),
        'WebDriver.navigate().refresh()');
  }
}


/**
 * Provides methods for managing browser and driver state.
 *
 * This class should never be instantiated directly. Insead, obtain an instance
 * with {@linkplain WebDriver#manage() webdriver.manage()}.
 */
class Options {
  /**
   * @param {!WebDriver} driver The parent driver.
   * @private
   */
  constructor(driver) {
    /** @private {!WebDriver} */
    this.driver_ = driver;
  }

  /**
   * Schedules a command to add a cookie.
   *
   * __Sample Usage:__
   *
   *     // Set a basic cookie.
   *     driver.options().addCookie({name: 'foo', value: 'bar'});
   *
   *     // Set a cookie that expires in 10 minutes.
   *     let expiry = new Date(Date.now() + (10 * 60 * 1000));
   *     driver.options().addCookie({name: 'foo', value: 'bar', expiry});
   *
   *     // The cookie expiration may also be specified in seconds since epoch.
   *     driver.options().addCookie({
   *       name: 'foo',
   *       value: 'bar',
   *       expiry: Math.floor(Date.now() / 1000)
   *     });
   *
   * @param {!Options.Cookie} spec Defines the cookie to add.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the cookie has been added to the page.
   * @throws {error.InvalidArgumentError} if any of the cookie parameters are
   *     invalid.
   * @throws {TypeError} if `spec` is not a cookie object.
   */
  addCookie(spec) {
    if (!spec || typeof spec !== 'object') {
      throw TypeError('addCookie called with non-cookie parameter');
    }

    // We do not allow '=' or ';' in the name.
    let name = spec.name;
    if (/[;=]/.test(name)) {
      throw new error.InvalidArgumentError(
          'Invalid cookie name "' + name + '"');
    }

    // We do not allow ';' in value.
    let value = spec.value;
    if (/;/.test(value)) {
      throw new error.InvalidArgumentError(
          'Invalid cookie value "' + value + '"');
    }

    let cookieString = name + '=' + value +
        (spec.domain ? ';domain=' + spec.domain : '') +
        (spec.path ? ';path=' + spec.path : '') +
        (spec.secure ? ';secure' : '');

    let expiry;
    if (typeof spec.expiry === 'number') {
      expiry = Math.floor(spec.expiry);
      cookieString += ';expires=' + new Date(spec.expiry * 1000).toUTCString();
    } else if (spec.expiry instanceof Date) {
      let date = /** @type {!Date} */(spec.expiry);
      expiry = Math.floor(date.getTime() / 1000);
      cookieString += ';expires=' + date.toUTCString();
    }

    return this.driver_.schedule(
        new command.Command(command.Name.ADD_COOKIE).
            setParameter('cookie', {
              'name': name,
              'value': value,
              'path': spec.path,
              'domain': spec.domain,
              'secure': !!spec.secure,
              'expiry': expiry
            }),
        'WebDriver.manage().addCookie(' + cookieString + ')');
  }

  /**
   * Schedules a command to delete all cookies visible to the current page.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when all cookies have been deleted.
   */
  deleteAllCookies() {
    return this.driver_.schedule(
        new command.Command(command.Name.DELETE_ALL_COOKIES),
        'WebDriver.manage().deleteAllCookies()');
  }

  /**
   * Schedules a command to delete the cookie with the given name. This command
   * is a no-op if there is no cookie with the given name visible to the current
   * page.
   * @param {string} name The name of the cookie to delete.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the cookie has been deleted.
   */
  deleteCookie(name) {
    return this.driver_.schedule(
        new command.Command(command.Name.DELETE_COOKIE).
            setParameter('name', name),
        'WebDriver.manage().deleteCookie(' + name + ')');
  }

  /**
   * Schedules a command to retrieve all cookies visible to the current page.
   * Each cookie will be returned as a JSON object as described by the WebDriver
   * wire protocol.
   * @return {!promise.Promise<!Array<!Options.Cookie>>} A promise that will be
   *     resolved with the cookies visible to the current browsing context.
   */
  getCookies() {
    return this.driver_.schedule(
        new command.Command(command.Name.GET_ALL_COOKIES),
        'WebDriver.manage().getCookies()');
  }

  /**
   * Schedules a command to retrieve the cookie with the given name. Returns null
   * if there is no such cookie. The cookie will be returned as a JSON object as
   * described by the WebDriver wire protocol.
   *
   * @param {string} name The name of the cookie to retrieve.
   * @return {!promise.Promise<?Options.Cookie>} A promise that will be resolved
   *     with the named cookie, or `null` if there is no such cookie.
   */
  getCookie(name) {
    return this.getCookies().then(function(cookies) {
      for (let cookie of cookies) {
        if (cookie && cookie['name'] === name) {
          return cookie;
        }
      }
      return null;
    });
  }

  /**
   * @return {!Logs} The interface for managing driver
   *     logs.
   */
  logs() {
    return new Logs(this.driver_);
  }

  /**
   * @return {!Timeouts} The interface for managing driver timeouts.
   */
  timeouts() {
    return new Timeouts(this.driver_);
  }

  /**
   * @return {!Window} The interface for managing the current window.
   */
  window() {
    return new Window(this.driver_);
  }
}


/**
 * A record object describing a browser cookie.
 *
 * @record
 */
Options.Cookie = function() {};


/**
 * The name of the cookie.
 *
 * @type {string}
 */
Options.Cookie.prototype.name;


/**
 * The cookie value.
 *
 * @type {string}
 */
Options.Cookie.prototype.value;


/**
 * The cookie path. Defaults to "/" when adding a cookie.
 *
 * @type {(string|undefined)}
 */
Options.Cookie.prototype.path;


/**
 * The domain the cookie is visible to. Defaults to the current browsing
 * context's document's URL when adding a cookie.
 *
 * @type {(string|undefined)}
 */
Options.Cookie.prototype.domain;


/**
 * Whether the cookie is a secure cookie. Defaults to false when adding a new
 * cookie.
 *
 * @type {(boolean|undefined)}
 */
Options.Cookie.prototype.secure;


/**
 * Whether the cookie is an HTTP only cookie. Defaults to false when adding a
 * new cookie.
 *
 * @type {(boolean|undefined)}
 */
Options.Cookie.prototype.httpOnly;


/**
 * When the cookie expires.
 *
 * When {@linkplain Options#addCookie() adding a cookie}, this may be specified
 * in _seconds_ since Unix epoch (January 1, 1970). The expiry will default to
 * 20 years in the future if omitted.
 *
 * The expiry is always returned in seconds since epoch when
 * {@linkplain Options#getCookies() retrieving cookies} from the browser.
 *
 * @type {(!Date|number|undefined)}
 */
Options.Cookie.prototype.expiry;


/**
 * An interface for managing timeout behavior for WebDriver instances.
 *
 * This class should never be instantiated directly. Insead, obtain an instance
 * with
 *
 *    webdriver.manage().timeouts()
 *
 * @see WebDriver#manage()
 * @see Options#timeouts()
 */
class Timeouts {
  /**
   * @param {!WebDriver} driver The parent driver.
   * @private
   */
  constructor(driver) {
    /** @private {!WebDriver} */
    this.driver_ = driver;
  }

  /**
   * Specifies the amount of time the driver should wait when searching for an
   * element if it is not immediately present.
   *
   * When searching for a single element, the driver should poll the page
   * until the element has been found, or this timeout expires before failing
   * with a {@link bot.ErrorCode.NO_SUCH_ELEMENT} error. When searching
   * for multiple elements, the driver should poll the page until at least one
   * element has been found or this timeout has expired.
   *
   * Setting the wait timeout to 0 (its default value), disables implicit
   * waiting.
   *
   * Increasing the implicit wait timeout should be used judiciously as it
   * will have an adverse effect on test run time, especially when used with
   * slower location strategies like XPath.
   *
   * @param {number} ms The amount of time to wait, in milliseconds.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the implicit wait timeout has been set.
   */
  implicitlyWait(ms) {
    return this._scheduleCommand(ms, 'implicit', 'implicitlyWait');
  }

  /**
   * Sets the amount of time to wait, in milliseconds, for an asynchronous
   * script to finish execution before returning an error. If the timeout is
   * less than or equal to 0, the script will be allowed to run indefinitely.
   *
   * @param {number} ms The amount of time to wait, in milliseconds.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the script timeout has been set.
   */
  setScriptTimeout(ms) {
    return this._scheduleCommand(ms, 'script', 'setScriptTimeout');
  }

  /**
   * Sets the amount of time to wait for a page load to complete before
   * returning an error.  If the timeout is negative, page loads may be
   * indefinite.
   *
   * @param {number} ms The amount of time to wait, in milliseconds.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the timeout has been set.
   */
  pageLoadTimeout(ms) {
    return this._scheduleCommand(ms, 'page load', 'pageLoadTimeout');
  }

  _scheduleCommand(ms, timeoutIdentifier, timeoutName) {
    return this.driver_.schedule(
        new command.Command(command.Name.SET_TIMEOUT).
            setParameter('type', timeoutIdentifier).
            setParameter('ms', ms),
        `WebDriver.manage().timeouts().${timeoutName}(${ms})`);
  }
}


/**
 * An interface for managing the current window.
 *
 * This class should never be instantiated directly. Insead, obtain an instance
 * with
 *
 *    webdriver.manage().window()
 *
 * @see WebDriver#manage()
 * @see Options#window()
 */
class Window {
  /**
   * @param {!WebDriver} driver The parent driver.
   * @private
   */
  constructor(driver) {
    /** @private {!WebDriver} */
    this.driver_ = driver;
  }

  /**
   * Retrieves the window's current position, relative to the top left corner of
   * the screen.
   * @return {!promise.Promise.<{x: number, y: number}>} A promise
   *     that will be resolved with the window's position in the form of a
   *     {x:number, y:number} object literal.
   */
  getPosition() {
    return this.driver_.schedule(
        new command.Command(command.Name.GET_WINDOW_POSITION).
            setParameter('windowHandle', 'current'),
        'WebDriver.manage().window().getPosition()');
  }

  /**
   * Repositions the current window.
   * @param {number} x The desired horizontal position, relative to the left
   *     side of the screen.
   * @param {number} y The desired vertical position, relative to the top of the
   *     of the screen.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the command has completed.
   */
  setPosition(x, y) {
    return this.driver_.schedule(
        new command.Command(command.Name.SET_WINDOW_POSITION).
            setParameter('windowHandle', 'current').
            setParameter('x', x).
            setParameter('y', y),
        'WebDriver.manage().window().setPosition(' + x + ', ' + y + ')');
  }

  /**
   * Retrieves the window's current size.
   * @return {!promise.Promise<{width: number, height: number}>} A
   *     promise that will be resolved with the window's size in the form of a
   *     {width:number, height:number} object literal.
   */
  getSize() {
    return this.driver_.schedule(
        new command.Command(command.Name.GET_WINDOW_SIZE).
            setParameter('windowHandle', 'current'),
        'WebDriver.manage().window().getSize()');
  }

  /**
   * Resizes the current window.
   * @param {number} width The desired window width.
   * @param {number} height The desired window height.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the command has completed.
   */
  setSize(width, height) {
    return this.driver_.schedule(
        new command.Command(command.Name.SET_WINDOW_SIZE).
            setParameter('windowHandle', 'current').
            setParameter('width', width).
            setParameter('height', height),
        'WebDriver.manage().window().setSize(' + width + ', ' + height + ')');
  }

  /**
   * Maximizes the current window.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the command has completed.
   */
  maximize() {
    return this.driver_.schedule(
        new command.Command(command.Name.MAXIMIZE_WINDOW).
            setParameter('windowHandle', 'current'),
        'WebDriver.manage().window().maximize()');
  }
}


/**
 * Interface for managing WebDriver log records.
 *
 * This class should never be instantiated directly. Instead, obtain an
 * instance with
 *
 *     webdriver.manage().logs()
 *
 * @see WebDriver#manage()
 * @see Options#logs()
 */
class Logs {
  /**
   * @param {!WebDriver} driver The parent driver.
   * @private
   */
  constructor(driver) {
    /** @private {!WebDriver} */
    this.driver_ = driver;
  }

  /**
   * Fetches available log entries for the given type.
   *
   * Note that log buffers are reset after each call, meaning that available
   * log entries correspond to those entries not yet returned for a given log
   * type. In practice, this means that this call will return the available log
   * entries since the last call, or from the start of the session.
   *
   * @param {!logging.Type} type The desired log type.
   * @return {!promise.Promise.<!Array.<!logging.Entry>>} A
   *   promise that will resolve to a list of log entries for the specified
   *   type.
   */
  get(type) {
    let cmd = new command.Command(command.Name.GET_LOG).
        setParameter('type', type);
    return this.driver_.schedule(
        cmd, 'WebDriver.manage().logs().get(' + type + ')').
        then(function(entries) {
          return entries.map(function(entry) {
            if (!(entry instanceof logging.Entry)) {
              return new logging.Entry(
                  entry['level'], entry['message'], entry['timestamp'],
                  entry['type']);
            }
            return entry;
          });
        });
  }

  /**
   * Retrieves the log types available to this driver.
   * @return {!promise.Promise<!Array<!logging.Type>>} A
   *     promise that will resolve to a list of available log types.
   */
  getAvailableLogTypes() {
    return this.driver_.schedule(
        new command.Command(command.Name.GET_AVAILABLE_LOG_TYPES),
        'WebDriver.manage().logs().getAvailableLogTypes()');
  }
}


/**
 * An interface for changing the focus of the driver to another frame or window.
 *
 * This class should never be instantiated directly. Instead, obtain an
 * instance with
 *
 *     webdriver.switchTo()
 *
 * @see WebDriver#switchTo()
 */
class TargetLocator {
  /**
   * @param {!WebDriver} driver The parent driver.
   * @private
   */
  constructor(driver) {
    /** @private {!WebDriver} */
    this.driver_ = driver;
  }

  /**
   * Schedules a command retrieve the {@code document.activeElement} element on
   * the current document, or {@code document.body} if activeElement is not
   * available.
   * @return {!WebElementPromise} The active element.
   */
  activeElement() {
    var id = this.driver_.schedule(
        new command.Command(command.Name.GET_ACTIVE_ELEMENT),
        'WebDriver.switchTo().activeElement()');
    return new WebElementPromise(this.driver_, id);
  }

  /**
   * Schedules a command to switch focus of all future commands to the topmost
   * frame on the page.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the driver has changed focus to the default content.
   */
  defaultContent() {
    return this.driver_.schedule(
        new command.Command(command.Name.SWITCH_TO_FRAME).
            setParameter('id', null),
        'WebDriver.switchTo().defaultContent()');
  }

  /**
   * Schedules a command to switch the focus of all future commands to another
   * frame on the page. The target frame may be specified as one of the
   * following:
   *
   * - A number that specifies a (zero-based) index into [window.frames](
   *   https://developer.mozilla.org/en-US/docs/Web/API/Window.frames).
   * - A {@link WebElement} reference, which correspond to a `frame` or `iframe`
   *   DOM element.
   * - The `null` value, to select the topmost frame on the page. Passing `null`
   *   is the same as calling {@link #defaultContent defaultContent()}.
   *
   * If the specified frame can not be found, the returned promise will be
   * rejected with a {@linkplain error.NoSuchFrameError}.
   *
   * @param {(number|WebElement|null)} id The frame locator.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the driver has changed focus to the specified frame.
   */
  frame(id) {
    return this.driver_.schedule(
        new command.Command(command.Name.SWITCH_TO_FRAME).
            setParameter('id', id),
        'WebDriver.switchTo().frame(' + id + ')');
  }

  /**
   * Schedules a command to switch the focus of all future commands to another
   * window. Windows may be specified by their {@code window.name} attribute or
   * by its handle (as returned by {@link WebDriver#getWindowHandles}).
   *
   * If the specified window cannot be found, the returned promise will be
   * rejected with a {@linkplain error.NoSuchWindowError}.
   *
   * @param {string} nameOrHandle The name or window handle of the window to
   *     switch focus to.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the driver has changed focus to the specified window.
   */
  window(nameOrHandle) {
    return this.driver_.schedule(
        new command.Command(command.Name.SWITCH_TO_WINDOW).
            setParameter('name', nameOrHandle),
        'WebDriver.switchTo().window(' + nameOrHandle + ')');
  }

  /**
   * Schedules a command to change focus to the active modal dialog, such as
   * those opened by `window.alert()`, `window.confirm()`, and
   * `window.prompt()`. The returned promise will be rejected with a
   * {@linkplain error.NoSuchAlertError} if there are no open alerts.
   *
   * @return {!AlertPromise} The open alert.
   */
  alert() {
    var text = this.driver_.schedule(
        new command.Command(command.Name.GET_ALERT_TEXT),
        'WebDriver.switchTo().alert()');
    var driver = this.driver_;
    return new AlertPromise(driver, text.then(function(text) {
      return new Alert(driver, text);
    }));
  }
}


//////////////////////////////////////////////////////////////////////////////
//
//  WebElement
//
//////////////////////////////////////////////////////////////////////////////


const LEGACY_ELEMENT_ID_KEY = 'ELEMENT';
const ELEMENT_ID_KEY = 'element-6066-11e4-a52e-4f735466cecf';


/**
 * Represents a DOM element. WebElements can be found by searching from the
 * document root using a {@link WebDriver} instance, or by searching
 * under another WebElement:
 *
 *     driver.get('http://www.google.com');
 *     var searchForm = driver.findElement(By.tagName('form'));
 *     var searchBox = searchForm.findElement(By.name('q'));
 *     searchBox.sendKeys('webdriver');
 */
class WebElement {
  /**
   * @param {!WebDriver} driver the parent WebDriver instance for this element.
   * @param {(!IThenable<string>|string)} id The server-assigned opaque ID for
   *     the underlying DOM element.
   */
  constructor(driver, id) {
    /** @private {!WebDriver} */
    this.driver_ = driver;

    /** @private {!promise.Promise<string>} */
    this.id_ = promise.fulfilled(id);
  }

  /**
   * @param {string} id The raw ID.
   * @param {boolean=} opt_noLegacy Whether to exclude the legacy element key.
   * @return {!Object} The element ID for use with WebDriver's wire protocol.
   */
  static buildId(id, opt_noLegacy) {
    return opt_noLegacy
        ? {[ELEMENT_ID_KEY]: id}
        : {[ELEMENT_ID_KEY]: id, [LEGACY_ELEMENT_ID_KEY]: id};
  }

  /**
   * Extracts the encoded WebElement ID from the object.
   *
   * @param {?} obj The object to extract the ID from.
   * @return {string} the extracted ID.
   * @throws {TypeError} if the object is not a valid encoded ID.
   */
  static extractId(obj) {
    if (obj && typeof obj === 'object') {
      if (typeof obj[ELEMENT_ID_KEY] === 'string') {
        return obj[ELEMENT_ID_KEY];
      } else if (typeof obj[LEGACY_ELEMENT_ID_KEY] === 'string') {
        return obj[LEGACY_ELEMENT_ID_KEY];
      }
    }
    throw new TypeError('object is not a WebElement ID');
  }

  /**
   * @param {?} obj the object to test.
   * @return {boolean} whether the object is a valid encoded WebElement ID.
   */
  static isId(obj) {
    return obj && typeof obj === 'object'
        && (typeof obj[ELEMENT_ID_KEY] === 'string'
            || typeof obj[LEGACY_ELEMENT_ID_KEY] === 'string');
  }

  /**
   * Compares two WebElements for equality.
   *
   * @param {!WebElement} a A WebElement.
   * @param {!WebElement} b A WebElement.
   * @return {!promise.Promise<boolean>} A promise that will be
   *     resolved to whether the two WebElements are equal.
   */
  static equals(a, b) {
    if (a === b) {
      return promise.fulfilled(true);
    }
    let ids = [a.getId(), b.getId()];
    return promise.all(ids).then(function(ids) {
      // If the two element's have the same ID, they should be considered
      // equal. Otherwise, they may still be equivalent, but we'll need to
      // ask the server to check for us.
      if (ids[0] === ids[1]) {
        return true;
      }

      let cmd = new command.Command(command.Name.ELEMENT_EQUALS);
      cmd.setParameter('id', ids[0]);
      cmd.setParameter('other', ids[1]);
      return a.driver_.schedule(cmd, 'WebElement.equals()');
    });
  }

  /** @return {!WebDriver} The parent driver for this instance. */
  getDriver() {
    return this.driver_;
  }

  /**
   * @return {!promise.Promise<string>} A promise that resolves to
   *     the server-assigned opaque ID assigned to this element.
   */
  getId() {
    return this.id_;
  }

  /**
   * @return {!Object} Returns the serialized representation of this WebElement.
   */
  [Symbols.serialize]() {
    return this.getId().then(WebElement.buildId);
  }

  /**
   * Schedules a command that targets this element with the parent WebDriver
   * instance. Will ensure this element's ID is included in the command
   * parameters under the "id" key.
   *
   * @param {!command.Command} command The command to schedule.
   * @param {string} description A description of the command for debugging.
   * @return {!promise.Promise<T>} A promise that will be resolved
   *     with the command result.
   * @template T
   * @see WebDriver#schedule
   * @private
   */
  schedule_(command, description) {
    command.setParameter('id', this.getId());
    return this.driver_.schedule(command, description);
  }

  /**
   * Schedule a command to find a descendant of this element. If the element
   * cannot be found, the returned promise will be rejected with a
   * {@linkplain error.NoSuchElementError NoSuchElementError}.
   *
   * The search criteria for an element may be defined using one of the static
   * factories on the {@link by.By} class, or as a short-hand
   * {@link ./by.ByHash} object. For example, the following two statements
   * are equivalent:
   *
   *     var e1 = element.findElement(By.id('foo'));
   *     var e2 = element.findElement({id:'foo'});
   *
   * You may also provide a custom locator function, which takes as input this
   * instance and returns a {@link WebElement}, or a promise that will resolve
   * to a WebElement. If the returned promise resolves to an array of
   * WebElements, WebDriver will use the first element. For example, to find the
   * first visible link on a page, you could write:
   *
   *     var link = element.findElement(firstVisibleLink);
   *
   *     function firstVisibleLink(element) {
   *       var links = element.findElements(By.tagName('a'));
   *       return promise.filter(links, function(link) {
   *         return link.isDisplayed();
   *       });
   *     }
   *
   * @param {!(by.By|Function)} locator The locator strategy to use when
   *     searching for the element.
   * @return {!WebElementPromise} A WebElement that can be used to issue
   *     commands against the located element. If the element is not found, the
   *     element will be invalidated and all scheduled commands aborted.
   */
  findElement(locator) {
    locator = by.checkedLocator(locator);
    let id;
    if (typeof locator === 'function') {
      id = this.driver_.findElementInternal_(locator, this);
    } else {
      let cmd = new command.Command(
          command.Name.FIND_CHILD_ELEMENT).
          setParameter('using', locator.using).
          setParameter('value', locator.value);
      id = this.schedule_(cmd, 'WebElement.findElement(' + locator + ')');
    }
    return new WebElementPromise(this.driver_, id);
  }

  /**
   * Schedules a command to find all of the descendants of this element that
   * match the given search criteria.
   *
   * @param {!(by.By|Function)} locator The locator strategy to use when
   *     searching for the element.
   * @return {!promise.Promise<!Array<!WebElement>>} A
   *     promise that will resolve to an array of WebElements.
   */
  findElements(locator) {
    locator = by.checkedLocator(locator);
    let id;
    if (typeof locator === 'function') {
      return this.driver_.findElementsInternal_(locator, this);
    } else {
      var cmd = new command.Command(
          command.Name.FIND_CHILD_ELEMENTS).
          setParameter('using', locator.using).
          setParameter('value', locator.value);
      return this.schedule_(cmd, 'WebElement.findElements(' + locator + ')');
    }
  }

  /**
   * Schedules a command to click on this element.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the click command has completed.
   */
  click() {
    return this.schedule_(
        new command.Command(command.Name.CLICK_ELEMENT),
        'WebElement.click()');
  }

  /**
   * Schedules a command to type a sequence on the DOM element represented by
   * this instance.
   *
   * Modifier keys (SHIFT, CONTROL, ALT, META) are stateful; once a modifier is
   * processed in the keysequence, that key state is toggled until one of the
   * following occurs:
   *
   * - The modifier key is encountered again in the sequence. At this point the
   *   state of the key is toggled (along with the appropriate keyup/down
   *   events).
   * - The {@link input.Key.NULL} key is encountered in the sequence. When
   *   this key is encountered, all modifier keys current in the down state are
   *   released (with accompanying keyup events). The NULL key can be used to
   *   simulate common keyboard shortcuts:
   *
   *         element.sendKeys("text was",
   *                          Key.CONTROL, "a", Key.NULL,
   *                          "now text is");
   *         // Alternatively:
   *         element.sendKeys("text was",
   *                          Key.chord(Key.CONTROL, "a"),
   *                          "now text is");
   *
   * - The end of the keysequence is encountered. When there are no more keys
   *   to type, all depressed modifier keys are released (with accompanying
   *   keyup events).
   *
   * If this element is a file input ({@code <input type="file">}), the
   * specified key sequence should specify the path to the file to attach to
   * the element. This is analgous to the user clicking "Browse..." and entering
   * the path into the file select dialog.
   *
   *     var form = driver.findElement(By.css('form'));
   *     var element = form.findElement(By.css('input[type=file]'));
   *     element.sendKeys('/path/to/file.txt');
   *     form.submit();
   *
   * For uploads to function correctly, the entered path must reference a file
   * on the _browser's_ machine, not the local machine running this script. When
   * running against a remote Selenium server, a {@link input.FileDetector}
   * may be used to transparently copy files to the remote machine before
   * attempting to upload them in the browser.
   *
   * __Note:__ On browsers where native keyboard events are not supported
   * (e.g. Firefox on OS X), key events will be synthesized. Special
   * punctionation keys will be synthesized according to a standard QWERTY en-us
   * keyboard layout.
   *
   * @param {...(number|string|!IThenable<(number|string)>)} var_args The
   *     sequence of keys to type. Number keys may be referenced numerically or
   *     by string (1 or '1'). All arguments will be joined into a single
   *     sequence.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when all keys have been typed.
   */
  sendKeys(var_args) {
    let keys = Promise.all(Array.prototype.slice.call(arguments, 0)).
        then(keys => {
          let ret = [];
          keys.forEach(key => {
            let type = typeof key;
            if (type === 'number') {
              key = String(key);
            } else if (type !== 'string') {
              throw TypeError(
                  'each key must be a number of string; got ' + type);
            }

            // The W3C protocol requires keys to be specified as an array where
            // each element is a single key.
            ret.push.apply(ret, key.split(''));
          });
          return ret;
        });

    if (!this.driver_.fileDetector_) {
      return this.schedule_(
          new command.Command(command.Name.SEND_KEYS_TO_ELEMENT).
              setParameter('value', keys),
          'WebElement.sendKeys()');
    }

    // Suppress unhandled rejection errors until the flow executes the command.
    keys.catch(function() {});

    var element = this;
    return this.driver_.flow_.execute(function() {
      return keys.then(function(keys) {
        return element.driver_.fileDetector_
            .handleFile(element.driver_, keys.join(''));
      }).then(function(keys) {
        return element.schedule_(
            new command.Command(command.Name.SEND_KEYS_TO_ELEMENT).
                setParameter('value', keys.split('')),
            'WebElement.sendKeys()');
      });
    }, 'WebElement.sendKeys()');
  }

  /**
   * Schedules a command to query for the tag/node name of this element.
   * @return {!promise.Promise<string>} A promise that will be
   *     resolved with the element's tag name.
   */
  getTagName() {
    return this.schedule_(
        new command.Command(command.Name.GET_ELEMENT_TAG_NAME),
        'WebElement.getTagName()');
  }

  /**
   * Schedules a command to query for the computed style of the element
   * represented by this instance. If the element inherits the named style from
   * its parent, the parent will be queried for its value.  Where possible, color
   * values will be converted to their hex representation (e.g. #00ff00 instead
   * of rgb(0, 255, 0)).
   *
   * _Warning:_ the value returned will be as the browser interprets it, so
   * it may be tricky to form a proper assertion.
   *
   * @param {string} cssStyleProperty The name of the CSS style property to look
   *     up.
   * @return {!promise.Promise<string>} A promise that will be
   *     resolved with the requested CSS value.
   */
  getCssValue(cssStyleProperty) {
    var name = command.Name.GET_ELEMENT_VALUE_OF_CSS_PROPERTY;
    return this.schedule_(
        new command.Command(name).
            setParameter('propertyName', cssStyleProperty),
        'WebElement.getCssValue(' + cssStyleProperty + ')');
  }

  /**
   * Schedules a command to query for the value of the given attribute of the
   * element. Will return the current value, even if it has been modified after
   * the page has been loaded. More exactly, this method will return the value
   * of the given attribute, unless that attribute is not present, in which case
   * the value of the property with the same name is returned. If neither value
   * is set, null is returned (for example, the "value" property of a textarea
   * element). The "style" attribute is converted as best can be to a
   * text representation with a trailing semi-colon. The following are deemed to
   * be "boolean" attributes and will return either "true" or null:
   *
   * async, autofocus, autoplay, checked, compact, complete, controls, declare,
   * defaultchecked, defaultselected, defer, disabled, draggable, ended,
   * formnovalidate, hidden, indeterminate, iscontenteditable, ismap, itemscope,
   * loop, multiple, muted, nohref, noresize, noshade, novalidate, nowrap, open,
   * paused, pubdate, readonly, required, reversed, scoped, seamless, seeking,
   * selected, spellcheck, truespeed, willvalidate
   *
   * Finally, the following commonly mis-capitalized attribute/property names
   * are evaluated as expected:
   *
   * - "class"
   * - "readonly"
   *
   * @param {string} attributeName The name of the attribute to query.
   * @return {!promise.Promise<?string>} A promise that will be
   *     resolved with the attribute's value. The returned value will always be
   *     either a string or null.
   */
  getAttribute(attributeName) {
    return this.schedule_(
        new command.Command(command.Name.GET_ELEMENT_ATTRIBUTE).
            setParameter('name', attributeName),
        'WebElement.getAttribute(' + attributeName + ')');
  }

  /**
   * Get the visible (i.e. not hidden by CSS) innerText of this element,
   * including sub-elements, without any leading or trailing whitespace.
   *
   * @return {!promise.Promise<string>} A promise that will be
   *     resolved with the element's visible text.
   */
  getText() {
    return this.schedule_(
        new command.Command(command.Name.GET_ELEMENT_TEXT),
        'WebElement.getText()');
  }

  /**
   * Schedules a command to compute the size of this element's bounding box, in
   * pixels.
   * @return {!promise.Promise.<{width: number, height: number}>} A
   *     promise that will be resolved with the element's size as a
   *     {@code {width:number, height:number}} object.
   */
  getSize() {
    return this.schedule_(
        new command.Command(command.Name.GET_ELEMENT_SIZE),
        'WebElement.getSize()');
  }

  /**
   * Schedules a command to compute the location of this element in page space.
   * @return {!promise.Promise.<{x: number, y: number}>} A promise that
   *     will be resolved to the element's location as a
   *     {@code {x:number, y:number}} object.
   */
  getLocation() {
    return this.schedule_(
        new command.Command(command.Name.GET_ELEMENT_LOCATION),
        'WebElement.getLocation()');
  }

  /**
   * Schedules a command to query whether the DOM element represented by this
   * instance is enabled, as dicted by the {@code disabled} attribute.
   * @return {!promise.Promise<boolean>} A promise that will be
   *     resolved with whether this element is currently enabled.
   */
  isEnabled() {
    return this.schedule_(
        new command.Command(command.Name.IS_ELEMENT_ENABLED),
        'WebElement.isEnabled()');
  }

  /**
   * Schedules a command to query whether this element is selected.
   * @return {!promise.Promise<boolean>} A promise that will be
   *     resolved with whether this element is currently selected.
   */
  isSelected() {
    return this.schedule_(
        new command.Command(command.Name.IS_ELEMENT_SELECTED),
        'WebElement.isSelected()');
  }

  /**
   * Schedules a command to submit the form containing this element (or this
   * element if it is a FORM element). This command is a no-op if the element is
   * not contained in a form.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the form has been submitted.
   */
  submit() {
    return this.schedule_(
        new command.Command(command.Name.SUBMIT_ELEMENT),
        'WebElement.submit()');
  }

  /**
   * Schedules a command to clear the `value` of this element. This command has
   * no effect if the underlying DOM element is neither a text INPUT element
   * nor a TEXTAREA element.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when the element has been cleared.
   */
  clear() {
    return this.schedule_(
        new command.Command(command.Name.CLEAR_ELEMENT),
        'WebElement.clear()');
  }

  /**
   * Schedules a command to test whether this element is currently displayed.
   * @return {!promise.Promise<boolean>} A promise that will be
   *     resolved with whether this element is currently visible on the page.
   */
  isDisplayed() {
    return this.schedule_(
        new command.Command(command.Name.IS_ELEMENT_DISPLAYED),
        'WebElement.isDisplayed()');
  }

  /**
   * Take a screenshot of the visible region encompassed by this element's
   * bounding rectangle.
   *
   * @param {boolean=} opt_scroll Optional argument that indicates whether the
   *     element should be scrolled into view before taking a screenshot.
   *     Defaults to false.
   * @return {!promise.Promise<string>} A promise that will be
   *     resolved to the screenshot as a base-64 encoded PNG.
   */
  takeScreenshot(opt_scroll) {
    var scroll = !!opt_scroll;
    return this.schedule_(
        new command.Command(command.Name.TAKE_ELEMENT_SCREENSHOT)
            .setParameter('scroll', scroll),
        'WebElement.takeScreenshot(' + scroll + ')');
  }
}


/**
 * WebElementPromise is a promise that will be fulfilled with a WebElement.
 * This serves as a forward proxy on WebElement, allowing calls to be
 * scheduled without directly on this instance before the underlying
 * WebElement has been fulfilled. In other words, the following two statements
 * are equivalent:
 *
 *     driver.findElement({id: 'my-button'}).click();
 *     driver.findElement({id: 'my-button'}).then(function(el) {
 *       return el.click();
 *     });
 *
 * @implements {promise.Thenable<!WebElement>}
 * @final
 */
class WebElementPromise extends WebElement {
  /**
   * @param {!WebDriver} driver The parent WebDriver instance for this
   *     element.
   * @param {!promise.Promise<!WebElement>} el A promise
   *     that will resolve to the promised element.
   */
  constructor(driver, el) {
    super(driver, 'unused');

    /** @override */
    this.cancel = el.cancel.bind(el);

    /** @override */
    this.isPending = el.isPending.bind(el);

    /** @override */
    this.then = el.then.bind(el);

    /** @override */
    this.catch = el.catch.bind(el);

    /** @override */
    this.finally = el.finally.bind(el);

    /**
     * Defers returning the element ID until the wrapped WebElement has been
     * resolved.
     * @override
     */
    this.getId = function() {
      return el.then(function(el) {
        return el.getId();
      });
    };
  }
}
promise.Thenable.addImplementation(WebElementPromise);


//////////////////////////////////////////////////////////////////////////////
//
//  Alert
//
//////////////////////////////////////////////////////////////////////////////


/**
 * Represents a modal dialog such as {@code alert}, {@code confirm}, or
 * {@code prompt}. Provides functions to retrieve the message displayed with
 * the alert, accept or dismiss the alert, and set the response text (in the
 * case of {@code prompt}).
 */
class Alert {
  /**
   * @param {!WebDriver} driver The driver controlling the browser this alert
   *     is attached to.
   * @param {string} text The message text displayed with this alert.
   */
  constructor(driver, text) {
    /** @private {!WebDriver} */
    this.driver_ = driver;

    /** @private {!promise.Promise<string>} */
    this.text_ = promise.fulfilled(text);
  }

  /**
   * Retrieves the message text displayed with this alert. For instance, if the
   * alert were opened with alert("hello"), then this would return "hello".
   *
   * @return {!promise.Promise<string>} A promise that will be
   *     resolved to the text displayed with this alert.
   */
  getText() {
    return this.text_;
  }

  /**
   * Sets the username and password in an alert prompting for credentials (such
   * as a Basic HTTP Auth prompt). This method will implicitly
   * {@linkplain #accept() submit} the dialog.
   *
   * @param {string} username The username to send.
   * @param {string} password The password to send.
   * @return {!promise.Promise<void>} A promise that will be resolved when this
   *     command has completed.
   */
  authenticateAs(username, password) {
    return this.driver_.schedule(
        new command.Command(command.Name.SET_ALERT_CREDENTIALS),
        'WebDriver.switchTo().alert()'
            + `.authenticateAs("${username}", "${password}")`);
  }

  /**
   * Accepts this alert.
   *
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when this command has completed.
   */
  accept() {
    return this.driver_.schedule(
        new command.Command(command.Name.ACCEPT_ALERT),
        'WebDriver.switchTo().alert().accept()');
  }

  /**
   * Dismisses this alert.
   *
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when this command has completed.
   */
  dismiss() {
    return this.driver_.schedule(
        new command.Command(command.Name.DISMISS_ALERT),
        'WebDriver.switchTo().alert().dismiss()');
  }

  /**
   * Sets the response text on this alert. This command will return an error if
   * the underlying alert does not support response text (e.g. window.alert and
   * window.confirm).
   *
   * @param {string} text The text to set.
   * @return {!promise.Promise<void>} A promise that will be resolved
   *     when this command has completed.
   */
  sendKeys(text) {
    return this.driver_.schedule(
        new command.Command(command.Name.SET_ALERT_TEXT).
            setParameter('text', text),
        'WebDriver.switchTo().alert().sendKeys(' + text + ')');
  }
}


/**
 * AlertPromise is a promise that will be fulfilled with an Alert. This promise
 * serves as a forward proxy on an Alert, allowing calls to be scheduled
 * directly on this instance before the underlying Alert has been fulfilled. In
 * other words, the following two statements are equivalent:
 *
 *     driver.switchTo().alert().dismiss();
 *     driver.switchTo().alert().then(function(alert) {
 *       return alert.dismiss();
 *     });
 *
 * @implements {promise.Thenable.<!webdriver.Alert>}
 * @final
 */
class AlertPromise extends Alert {
  /**
   * @param {!WebDriver} driver The driver controlling the browser this
   *     alert is attached to.
   * @param {!promise.Thenable<!Alert>} alert A thenable
   *     that will be fulfilled with the promised alert.
   */
  constructor(driver, alert) {
    super(driver, 'unused');

    /** @override */
    this.cancel = alert.cancel.bind(alert);

    /** @override */
    this.isPending = alert.isPending.bind(alert);

    /** @override */
    this.then = alert.then.bind(alert);

    /** @override */
    this.catch = alert.catch.bind(alert);

    /** @override */
    this.finally = alert.finally.bind(alert);

    /**
     * Defer returning text until the promised alert has been resolved.
     * @override
     */
    this.getText = function() {
      return alert.then(function(alert) {
        return alert.getText();
      });
    };

    /**
     * Defers action until the alert has been located.
     * @override
     */
    this.authenticateAs = function(username, password) {
      return alert.then(function(alert) {
        return alert.authenticateAs(username, password);
      });
    };

    /**
     * Defers action until the alert has been located.
     * @override
     */
    this.accept = function() {
      return alert.then(function(alert) {
        return alert.accept();
      });
    };

    /**
     * Defers action until the alert has been located.
     * @override
     */
    this.dismiss = function() {
      return alert.then(function(alert) {
        return alert.dismiss();
      });
    };

    /**
     * Defers action until the alert has been located.
     * @override
     */
    this.sendKeys = function(text) {
      return alert.then(function(alert) {
        return alert.sendKeys(text);
      });
    };
  }
}
promise.Thenable.addImplementation(AlertPromise);


// PUBLIC API


module.exports = {
  Alert: Alert,
  AlertPromise: AlertPromise,
  Condition: Condition,
  Logs: Logs,
  Navigation: Navigation,
  Options: Options,
  TargetLocator: TargetLocator,
  Timeouts: Timeouts,
  WebDriver: WebDriver,
  WebElement: WebElement,
  WebElementCondition: WebElementCondition,
  WebElementPromise: WebElementPromise,
  Window: Window
};
