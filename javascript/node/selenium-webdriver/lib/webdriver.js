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

const by = require('./by');
const Capabilities = require('./capabilities').Capabilities;
const command = require('./command');
const error = require('./error');
const input = require('./input');
const logging = require('./logging');
const {Session} = require('./session');
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
 * @extends {Condition<!(WebElement|IThenable<!WebElement>)>}
 */
class WebElementCondition extends Condition {
  /**
   * @param {string} message A descriptive error message. Should complete the
   *     sentence "Waiting [...]"
   * @param {function(!WebDriver): !(WebElement|IThenable<!WebElement>)}
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
  return Promise.resolve(obj).then(convertValue);
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
 * Structural interface for a WebDriver client.
 *
 * @record
 */
class IWebDriver {

  /**
   * Executes the provided {@link command.Command} using this driver's
   * {@link command.Executor}.
   *
   * @param {!command.Command} command The command to schedule.
   * @return {!Promise<T>} A promise that will be resolved with the command
   *     result.
   * @template T
   */
  execute(command) {}

  /**
   * Sets the {@linkplain input.FileDetector file detector} that should be
   * used with this instance.
   * @param {input.FileDetector} detector The detector to use or `null`.
   */
  setFileDetector(detector) {}

  /**
   * @return {!command.Executor} The command executor used by this instance.
   */
  getExecutor() {}

  /**
   * @return {!Promise<!Session>} A promise for this client's session.
   */
  getSession() {}

  /**
   * @return {!Promise<!Capabilities>} A promise that will resolve with
   *     the this instance's capabilities.
   */
  getCapabilities() {}

  /**
   * Terminates the browser session. After calling quit, this instance will be
   * invalidated and may no longer be used to issue commands against the
   * browser.
   *
   * @return {!Promise<void>} A promise that will be resolved when the
   *     command has completed.
   */
  quit() {}

  /**
   * Creates a new action sequence using this driver. The sequence will not be
   * submitted for execution until {@link ActionSequence#perform} is called.
   *
   * @return {!ActionSequence} A new action sequence for this instance.
   */
  actions() {}

  /**
   * Executes a snippet of JavaScript in the context of the currently selected
   * frame or window. The script fragment will be executed as the body of an
   * anonymous function. If the script is provided as a function object, that
   * function will be converted to a string for injection into the target
   * window.
   *
   * Any arguments provided in addition to the script will be included as script
   * arguments and may be referenced using the `arguments` object. Arguments may
   * be a boolean, number, string, or {@linkplain WebElement}. Arrays and
   * objects may also be used as script arguments as long as each item adheres
   * to the types previously mentioned.
   *
   * The script may refer to any variables accessible from the current window.
   * Furthermore, the script will execute in the window's context, thus
   * `document` may be used to refer to the current document. Any local
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
   * @return {!IThenable<T>} A promise that will resolve to the
   *    scripts return value.
   * @template T
   */
  executeScript(script, var_args) {}

  /**
   * Executes a snippet of asynchronous JavaScript in the context of the
   * currently selected frame or window. The script fragment will be executed as
   * the body of an anonymous function. If the script is provided as a function
   * object, that function will be converted to a string for injection into the
   * target window.
   *
   * Any arguments provided in addition to the script will be included as script
   * arguments and may be referenced using the `arguments` object. Arguments may
   * be a boolean, number, string, or {@linkplain WebElement}. Arrays and
   * objects may also be used as script arguments as long as each item adheres
   * to the types previously mentioned.
   *
   * Unlike executing synchronous JavaScript with {@link #executeScript},
   * scripts executed with this function must explicitly signal they are
   * finished by invoking the provided callback. This callback will always be
   * injected into the executed function as the last argument, and thus may be
   * referenced with  `arguments[arguments.length - 1]`. The following steps
   * will be taken for resolving this functions return value against the first
   * argument to the script's callback function:
   *
   * - For a HTML element, the value will resolve to a {@link WebElement}
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
   * using this format, the function is converted to a string for injection, so
   * it should not reference any symbols not defined in the scope of the page
   * under test.
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
   * @return {!IThenable<T>} A promise that will resolve to the scripts return
   *     value.
   * @template T
   */
  executeAsyncScript(script, var_args) {}

  /**
   * Executes a custom function.
   *
   * @param {function(...): (T|IThenable<T>)} fn The function to execute.
   * @param {Object=} opt_scope The object in whose scope to execute the function.
   * @param {...*} var_args Any arguments to pass to the function.
   * @return {!IThenable<T>} A promise that will be resolved' with the
   *     function's result.
   * @template T
   */
  call(fn, opt_scope, var_args) {}

  /**
   * Waits for a condition to evaluate to a "truthy" value. The condition may be
   * specified by a {@link Condition}, as a custom function, or as any
   * promise-like thenable.
   *
   * For a {@link Condition} or function, the wait will repeatedly
   * evaluate the condition until it returns a truthy value. If any errors occur
   * while evaluating the condition, they will be allowed to propagate. In the
   * event a condition returns a {@linkplain Promise}, the polling loop will
   * wait for it to be resolved and use the resolved value for whether the
   * condition has been satisfied. The resolution time for a promise is always
   * factored into whether a wait has timed out.
   *
   * If the provided condition is a {@link WebElementCondition}, then
   * the wait will return a {@link WebElementPromise} that will resolve to the
   * element that satisfied the condition.
   *
   * _Example:_ waiting up to 10 seconds for an element to be present on the
   * page.
   *
   *     async function example() {
   *       let button =
   *           await driver.wait(until.elementLocated(By.id('foo')), 10000);
   *       await button.click();
   *     }
   *
   * @param {!(IThenable<T>|
   *           Condition<T>|
   *           function(!WebDriver): T)} condition The condition to
   *     wait on, defined as a promise, condition object, or  a function to
   *     evaluate as a condition.
   * @param {number=} opt_timeout How long to wait for the condition to be true.
   * @param {string=} opt_message An optional message to use if the wait times
   *     out.
   * @return {!(IThenable<T>|WebElementPromise)} A promise that will be
   *     resolved with the first truthy value returned by the condition
   *     function, or rejected if the condition times out. If the input
   *     input condition is an instance of a {@link WebElementCondition},
   *     the returned value will be a {@link WebElementPromise}.
   * @throws {TypeError} if the provided `condition` is not a valid type.
   * @template T
   */
  wait(condition, opt_timeout, opt_message) {}

  /**
   * Makes the driver sleep for the given amount of time.
   *
   * @param {number} ms The amount of time, in milliseconds, to sleep.
   * @return {!Promise<void>} A promise that will be resolved when the sleep has
   *     finished.
   */
  sleep(ms) {}

  /**
   * Retrieves the current window handle.
   *
   * @return {!Promise<string>} A promise that will be resolved with the current
   *     window handle.
   */
  getWindowHandle() {}

  /**
   * Retrieves a list of all available window handles.
   *
   * @return {!Promise<!Array<string>>} A promise that will be resolved with an
   *     array of window handles.
   */
  getAllWindowHandles() {}

  /**
   * Retrieves the current page's source. The returned souce is a representation
   * of the underlying DOM: do not expect it to be formatted or escaped in the
   * same way as the raw response sent from the web server.
   *
   * @return {!Promise<string>} A promise that will be resolved with the current
   *     page source.
   */
  getPageSource() {}

  /**
   * Closes the current window.
   *
   * @return {!Promise<void>} A promise that will be resolved when this command
   *     has completed.
   */
  close() {}

  /**
   * Navigates to the given URL.
   *
   * @param {string} url The fully qualified URL to open.
   * @return {!Promise<void>} A promise that will be resolved when the document
   *     has finished loading.
   */
  get(url) {}

  /**
   * Retrieves the URL for the current page.
   *
   * @return {!Promise<string>} A promise that will be resolved with the
   *     current URL.
   */
  getCurrentUrl() {}

  /**
   * Retrieves the current page title.
   *
   * @return {!Promise<string>} A promise that will be resolved with the current
   *     page's title.
   */
  getTitle() {}

  /**
   * Locates an element on the page. If the element cannot be found, a
   * {@link error.NoSuchEementError} will be returned by the driver.
   *
   * This function should not be used to test whether an element is present on
   * the page. Rather, you should use {@link #findElements}:
   *
   *     driver.findElements(By.id('foo'))
   *         .then(found => console.log('Element found? %s', !!found.length));
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
  findElement(locator) {}

  /**
   * Search for multiple elements on the page. Refer to the documentation on
   * {@link #findElement(by)} for information on element locator strategies.
   *
   * @param {!(by.By|Function)} locator The locator to use.
   * @return {!Promise<!Array<!WebElement>>} A promise that will resolve to an
   *     array of WebElements.
   */
  findElements(locator) {}

  /**
   * Takes a screenshot of the current page. The driver makes a best effort to
   * return a screenshot of the following, in order of preference:
   *
   * 1. Entire page
   * 2. Current window
   * 3. Visible portion of the current frame
   * 4. The entire display containing the browser
   *
   * @return {!Promise<string>} A promise that will be resolved to the
   *     screenshot as a base-64 encoded PNG.
   */
  takeScreenshot() {}

  /**
   * @return {!Options} The options interface for this instance.
   */
  manage() {}

  /**
   * @return {!Navigation} The navigation interface for this instance.
   */
  navigate() {}

  /**
   * @return {!TargetLocator} The target locator interface for this
   *     instance.
   */
  switchTo() {}
}


/**
 * Each WebDriver instance provides automated control over a browser session.
 *
 * @implements {IWebDriver}
 */
class WebDriver {
  /**
   * @param {!(Session|IThenable<!Session>)} session Either a known session or a
   *     promise that will be resolved to a session.
   * @param {!command.Executor} executor The executor to use when sending
   *     commands to the browser.
   * @param {(function(this: void): ?)=} onQuit A function to call, if any,
   *     when the session is terminated.
   */
  constructor(session, executor, onQuit = undefined) {
    /** @private {!Promise<!Session>} */
    this.session_ = Promise.resolve(session);

    // If session is a rejected promise, add a no-op rejection handler.
    // This effectively hides setup errors until users attempt to interact
    // with the session.
    this.session_.catch(function() {});

    /** @private {!command.Executor} */
    this.executor_ = executor;

    /** @private {input.FileDetector} */
    this.fileDetector_ = null;

    /** @private @const {(function(this: void): ?|undefined)} */
    this.onQuit_ = onQuit;
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
   * This rejection will propagate through any subsequent commands scheduled
   * on the returned WebDriver instance.
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
   * @param {(function(this: void): ?)=} opt_onQuit A callback to invoke when
   *    the newly created session is terminated. This should be used to clean
   *    up any resources associated with the session.
   * @return {!WebDriver} The driver for the newly created session.
   */
  static createSession(executor, capabilities, opt_onQuit) {
    let cmd = new command.Command(command.Name.NEW_SESSION);

    if (capabilities && (capabilities.desired || capabilities.required)) {
      cmd.setParameter('desiredCapabilities', capabilities.desired);
      cmd.setParameter('requiredCapabilities', capabilities.required);
    } else {
      cmd.setParameter('desiredCapabilities', capabilities);
    }

    let session = executeCommand(executor, cmd);
    if (typeof opt_onQuit === 'function') {
      session = session.catch(err => {
        return Promise.resolve(opt_onQuit.call(void 0)).then(_ => {throw err;});
      });
    }
    return new this(session, executor, opt_onQuit);
  }

  /** @override */
  execute(command) {
    command.setParameter('sessionId', this.session_);
    return toWireValue(command.getParameters())
        .then((parameters) => {
          command.setParameters(parameters);
          return this.executor_.execute(command);
        })
        .then(value => fromWireValue(this, value));
  }

  /** @override */
  setFileDetector(detector) {
    this.fileDetector_ = detector;
  }

  /** @override */
  getExecutor() {
    return this.executor_;
  }

  /** @override */
  getSession() {
    return this.session_;
  }

  /** @override */
  getCapabilities() {
    return this.session_.then(s => s.getCapabilities());
  }

  /** @override */
  quit() {
    let result = this.execute(new command.Command(command.Name.QUIT));
    // Delete our session ID when the quit command finishes; this will allow us
    // to throw an error when attempting to use a driver post-quit.
    return promise.finally(result, () => {
      this.session_ = Promise.reject(new error.NoSuchSessionError(
            'This driver instance does not have a valid session ID ' +
            '(did you call WebDriver.quit()?) and may no longer be used.'));

      // Only want the session rejection to bubble if accessed.
      this.session_.catch(function() {});

      if (this.onQuit_) {
        return this.onQuit_.call(void 0);
      }
    });
  }

  /** @override */
  actions() {
    return new ActionSequence(this);
  }

  /** @override */
  executeScript(script, var_args) {
    if (typeof script === 'function') {
      script = 'return (' + script + ').apply(null, arguments);';
    }
    let args =
        arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : [];
   return this.execute(
        new command.Command(command.Name.EXECUTE_SCRIPT).
            setParameter('script', script).
            setParameter('args', args));
  }

  /** @override */
  executeAsyncScript(script, var_args) {
    if (typeof script === 'function') {
      script = 'return (' + script + ').apply(null, arguments);';
    }
    let args = Array.prototype.slice.call(arguments, 1);
    return this.execute(
        new command.Command(command.Name.EXECUTE_ASYNC_SCRIPT).
            setParameter('script', script).
            setParameter('args', args));
  }

  /** @override */
  call(fn, opt_scope, var_args) {
    let args = Array.prototype.slice.call(arguments, 2);
    return promise.fullyResolved(args).then(function(args) {
      return fn.apply(opt_scope, args);
    });
  }

  /** @override */
  wait(condition, timeout = 0, message = undefined) {
    if (typeof timeout !== 'number' || timeout < 0) {
      throw TypeError('timeout must be a number >= 0: ' + timeout);
    }

    if (promise.isPromise(condition)) {
      return new Promise((resolve, reject) => {
        if (!timeout) {
          resolve(condition);
          return;
        }

        let start = Date.now();
        let timer = setTimeout(function() {
          timer = null;
          reject(
              new error.TimeoutError(
                  (message ? `${message}\n` : '')
                      + 'Timed out waiting for promise to resolve after '
                      + (Date.now() - start) + 'ms'));
        }, timeout);
        const clearTimer = () => timer && clearTimeout(timer);

        /** @type {!IThenable} */(condition).then(
            function(value) {
              clearTimer();
              resolve(value);
            },
            function(error) {
              clearTimer();
              reject(error);
            });
      });
    }

    let fn = /** @type {!Function} */(condition);
    if (condition instanceof Condition) {
      message = message || condition.description();
      fn = condition.fn;
    }

    if (typeof fn !== 'function') {
      throw TypeError(
          'Wait condition must be a promise-like object, function, or a '
              + 'Condition object');
    }

    const driver = this;
    function evaluateCondition() {
      return new Promise((resolve, reject) => {
        try {
          resolve(fn(driver));
        } catch (ex) {
          reject(ex);
        }
      });
    }

    let result = new Promise((resolve, reject) => {
      const startTime = Date.now();
      const pollCondition = () => {
        evaluateCondition().then(function(value) {
          const elapsed = Date.now() - startTime;
          if (!!value) {
            resolve(value);
          } else if (timeout && elapsed >= timeout) {
            reject(
                new error.TimeoutError(
                  (message ? `${message}\n` : '')
                        + `Wait timed out after ${elapsed}ms`));
          } else {
            setTimeout(pollCondition, 0);
          }
        }, reject);
      };
      pollCondition();
    });

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

  /** @override */
  sleep(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
  }

  /** @override */
  getWindowHandle() {
    return this.execute(
        new command.Command(command.Name.GET_CURRENT_WINDOW_HANDLE));
  }

  /** @override */
  getAllWindowHandles() {
    return this.execute(
        new command.Command(command.Name.GET_WINDOW_HANDLES));
  }

  /** @override */
  getPageSource() {
    return this.execute(
        new command.Command(command.Name.GET_PAGE_SOURCE));
  }

  /** @override */
  close() {
    return this.execute(new command.Command(command.Name.CLOSE));
  }

  /** @override */
  get(url) {
    return this.navigate().to(url);
  }

  /** @override */
  getCurrentUrl() {
    return this.execute(new command.Command(command.Name.GET_CURRENT_URL));
  }

  /** @override */
  getTitle() {
    return this.execute(new command.Command(command.Name.GET_TITLE));
  }

  /** @override */
  findElement(locator) {
    let id;
    locator = by.checkedLocator(locator);
    if (typeof locator === 'function') {
      id = this.findElementInternal_(locator, this);
    } else {
      let cmd = new command.Command(command.Name.FIND_ELEMENT).
          setParameter('using', locator.using).
          setParameter('value', locator.value);
      id = this.execute(cmd);
    }
    return new WebElementPromise(this, id);
  }

  /**
   * @param {!Function} locatorFn The locator function to use.
   * @param {!(WebDriver|WebElement)} context The search context.
   * @return {!Promise<!WebElement>} A promise that will resolve to a list of
   *     WebElements.
   * @private
   */
  findElementInternal_(locatorFn, context) {
    return Promise.resolve(locatorFn(context)).then(function(result) {
      if (Array.isArray(result)) {
        result = result[0];
      }
      if (!(result instanceof WebElement)) {
        throw new TypeError('Custom locator did not return a WebElement');
      }
      return result;
    });
  }

  /** @override */
  findElements(locator) {
    locator = by.checkedLocator(locator);
    if (typeof locator === 'function') {
      return this.findElementsInternal_(locator, this);
    } else {
      let cmd = new command.Command(command.Name.FIND_ELEMENTS).
          setParameter('using', locator.using).
          setParameter('value', locator.value);
      return this.execute(cmd)
          .then(
              (res) => Array.isArray(res) ? res : [],
              (e) =>  {
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
   * @return {!Promise<!Array<!WebElement>>} A promise that will resolve to an
   *     array of WebElements.
   * @private
   */
  findElementsInternal_(locatorFn, context) {
    return Promise.resolve(locatorFn(context)).then(function(result) {
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

  /** @override */
  takeScreenshot() {
    return this.execute(new command.Command(command.Name.SCREENSHOT));
  }

  /** @override */
  manage() {
    return new Options(this);
  }

  /** @override */
  navigate() {
    return new Navigation(this);
  }

  /** @override */
  switchTo() {
    return new TargetLocator(this);
  }
}


/**
 * Interface for navigating back and forth in the browser history.
 *
 * This class should never be instantiated directly. Instead, obtain an instance
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
   * Navigates to a new URL.
   *
   * @param {string} url The URL to navigate to.
   * @return {!Promise<void>} A promise that will be resolved when the URL
   *     has been loaded.
   */
  to(url) {
    return this.driver_.execute(
        new command.Command(command.Name.GET).
            setParameter('url', url));
  }

  /**
   * Moves backwards in the browser history.
   *
   * @return {!Promise<void>} A promise that will be resolved when the
   *     navigation event has completed.
   */
  back() {
    return this.driver_.execute(new command.Command(command.Name.GO_BACK));
  }

  /**
   * Moves forwards in the browser history.
   *
   * @return {!Promise<void>} A promise that will be resolved when the
   *     navigation event has completed.
   */
  forward() {
    return this.driver_.execute(new command.Command(command.Name.GO_FORWARD));
  }

  /**
   * Refreshes the current page.
   *
   * @return {!Promise<void>} A promise that will be resolved when the
   *     navigation event has completed.
   */
  refresh() {
    return this.driver_.execute(new command.Command(command.Name.REFRESH));
  }
}


/**
 * Provides methods for managing browser and driver state.
 *
 * This class should never be instantiated directly. Instead, obtain an instance
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
   * Adds a cookie.
   *
   * __Sample Usage:__
   *
   *     // Set a basic cookie.
   *     driver.manage().addCookie({name: 'foo', value: 'bar'});
   *
   *     // Set a cookie that expires in 10 minutes.
   *     let expiry = new Date(Date.now() + (10 * 60 * 1000));
   *     driver.manage().addCookie({name: 'foo', value: 'bar', expiry});
   *
   *     // The cookie expiration may also be specified in seconds since epoch.
   *     driver.manage().addCookie({
   *       name: 'foo',
   *       value: 'bar',
   *       expiry: Math.floor(Date.now() / 1000)
   *     });
   *
   * @param {!Options.Cookie} spec Defines the cookie to add.
   * @return {!Promise<void>} A promise that will be resolved
   *     when the cookie has been added to the page.
   * @throws {error.InvalidArgumentError} if any of the cookie parameters are
   *     invalid.
   * @throws {TypeError} if `spec` is not a cookie object.
   */
  addCookie({name, value, path, domain, secure, httpOnly, expiry}) {
    // We do not allow '=' or ';' in the name.
    if (/[;=]/.test(name)) {
      throw new error.InvalidArgumentError(
          'Invalid cookie name "' + name + '"');
    }

    // We do not allow ';' in value.
    if (/;/.test(value)) {
      throw new error.InvalidArgumentError(
          'Invalid cookie value "' + value + '"');
    }

    if (typeof expiry === 'number') {
      expiry = Math.floor(expiry);
    } else if (expiry instanceof Date) {
      let date = /** @type {!Date} */(expiry);
      expiry = Math.floor(date.getTime() / 1000);
    }

    return this.driver_.execute(
        new command.Command(command.Name.ADD_COOKIE).
            setParameter('cookie', {
              'name': name,
              'value': value,
              'path': path,
              'domain': domain,
              'secure': !!secure,
              'httpOnly': !!httpOnly,
              'expiry': expiry
            }));
  }

  /**
   * Deletes all cookies visible to the current page.
   *
   * @return {!Promise<void>} A promise that will be resolved
   *     when all cookies have been deleted.
   */
  deleteAllCookies() {
    return this.driver_.execute(
        new command.Command(command.Name.DELETE_ALL_COOKIES));
  }

  /**
   * Deletes the cookie with the given name. This command is a no-op if there is
   * no cookie with the given name visible to the current page.
   *
   * @param {string} name The name of the cookie to delete.
   * @return {!Promise<void>} A promise that will be resolved
   *     when the cookie has been deleted.
   */
  deleteCookie(name) {
    return this.driver_.execute(
        new command.Command(command.Name.DELETE_COOKIE).
            setParameter('name', name));
  }

  /**
   * Retrieves all cookies visible to the current page. Each cookie will be
   * returned as a JSON object as described by the WebDriver wire protocol.
   *
   * @return {!Promise<!Array<!Options.Cookie>>} A promise that will be
   *     resolved with the cookies visible to the current browsing context.
   */
  getCookies() {
    return this.driver_.execute(
        new command.Command(command.Name.GET_ALL_COOKIES));
  }

  /**
   * Retrieves the cookie with the given name. Returns null if there is no such
   * cookie. The cookie will be returned as a JSON object as described by the
   * WebDriver wire protocol.
   *
   * @param {string} name The name of the cookie to retrieve.
   * @return {!Promise<?Options.Cookie>} A promise that will be resolved
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
   * Fetches the timeouts currently configured for the current session.
   *
   * @return {!Promise<{script: number,
   *                             pageLoad: number,
   *                             implicit: number}>} A promise that will be
   *     resolved with the timeouts currently configured for the current
   *     session.
   * @see #setTimeouts()
   */
  getTimeouts() {
    return this.driver_.execute(
        new command.Command(command.Name.GET_TIMEOUT));
  }

  /**
   * Sets the timeout durations associated with the current session.
   *
   * The following timeouts are supported (all timeouts are specified in
   * milliseconds):
   *
   * -  `implicit` specifies the maximum amount of time to wait for an element
   *    locator to succeed when {@linkplain WebDriver#findElement locating}
   *    {@linkplain WebDriver#findElements elements} on the page.
   *    Defaults to 0 milliseconds.
   *
   * -  `pageLoad` specifies the maximum amount of time to wait for a page to
   *    finishing loading. Defaults to 300000 milliseconds.
   *
   * -  `script` specifies the maximum amount of time to wait for an
   *    {@linkplain WebDriver#executeScript evaluated script} to run. If set to
   *    `null`, the script timeout will be indefinite.
   *    Defaults to 30000 milliseconds.
   *
   * @param {{script: (number|null|undefined),
   *          pageLoad: (number|null|undefined),
   *          implicit: (number|null|undefined)}} conf
   *     The desired timeout configuration.
   * @return {!Promise<void>} A promise that will be resolved when the timeouts
   *     have been set.
   * @throws {!TypeError} if an invalid options object is provided.
   * @see #getTimeouts()
   * @see <https://w3c.github.io/webdriver/webdriver-spec.html#dfn-set-timeouts>
   */
  setTimeouts({script, pageLoad, implicit} = {}) {
    let cmd = new command.Command(command.Name.SET_TIMEOUT);

    let valid = false;
    function setParam(key, value) {
      if (value === null || typeof value === 'number') {
        valid = true;
        cmd.setParameter(key, value);
      } else if (typeof value !== 'undefined') {
        throw TypeError(
            'invalid timeouts configuration:'
                + ` expected "${key}" to be a number, got ${typeof value}`);
      }
    }
    setParam('implicit', implicit);
    setParam('pageLoad', pageLoad);
    setParam('script', script);

    if (valid) {
      return this.driver_.execute(cmd)
          .catch(() => {
            // Fallback to the legacy method.
            let cmds = [];
            if (typeof script === 'number') {
              cmds.push(legacyTimeout(this.driver_, 'script', script));
            }
            if (typeof implicit === 'number') {
              cmds.push(legacyTimeout(this.driver_, 'implicit', implicit));
            }
            if (typeof pageLoad === 'number') {
              cmds.push(legacyTimeout(this.driver_, 'page load', pageLoad));
            }
            return Promise.all(cmds);
          });
    }
    throw TypeError('no timeouts specified');
  }

  /**
   * @return {!Logs} The interface for managing driver logs.
   */
  logs() {
    return new Logs(this.driver_);
  }

  /**
   * @return {!Timeouts} The interface for managing driver timeouts.
   * @deprecated Use {@link #setTimeouts()} instead.
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
 * @param {!WebDriver} driver
 * @param {string} type
 * @param {number} ms
 * @return {!Promise<void>}
 */
function legacyTimeout(driver, type, ms) {
  return driver.execute(
      new command.Command(command.Name.SET_TIMEOUT)
          .setParameter('type', type)
          .setParameter('ms', ms));
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
 * as a {@link Date} object, or in _seconds_ since Unix epoch (January 1, 1970).
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
 * This class should never be instantiated directly. Instead, obtain an instance
 * with
 *
 *    webdriver.manage().timeouts()
 *
 * @deprecated This has been deprecated in favor of
 *     {@link Options#setTimeouts()}, which supports setting multiple timeouts
 *     at once.
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
   * @return {!Promise<void>} A promise that will be resolved
   *     when the implicit wait timeout has been set.
   * @deprecated Use {@link Options#setTimeouts()
   *     driver.manage().setTimeouts({implicit: ms})}.
   */
  implicitlyWait(ms) {
    return this.driver_.manage().setTimeouts({implicit: ms});
  }

  /**
   * Sets the amount of time to wait, in milliseconds, for an asynchronous
   * script to finish execution before returning an error. If the timeout is
   * less than or equal to 0, the script will be allowed to run indefinitely.
   *
   * @param {number} ms The amount of time to wait, in milliseconds.
   * @return {!Promise<void>} A promise that will be resolved
   *     when the script timeout has been set.
   * @deprecated Use {@link Options#setTimeouts()
   *     driver.manage().setTimeouts({script: ms})}.
   */
  setScriptTimeout(ms) {
    return this.driver_.manage().setTimeouts({script: ms});
  }

  /**
   * Sets the amount of time to wait for a page load to complete before
   * returning an error.  If the timeout is negative, page loads may be
   * indefinite.
   *
   * @param {number} ms The amount of time to wait, in milliseconds.
   * @return {!Promise<void>} A promise that will be resolved
   *     when the timeout has been set.
   * @deprecated Use {@link Options#setTimeouts()
   *     driver.manage().setTimeouts({pageLoad: ms})}.
   */
  pageLoadTimeout(ms) {
    return this.driver_.manage().setTimeouts({pageLoad: ms});
  }
}


/**
 * An interface for managing the current window.
 *
 * This class should never be instantiated directly. Instead, obtain an instance
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
   * @return {!Promise<{x: number, y: number}>} A promise
   *     that will be resolved with the window's position in the form of a
   *     {x:number, y:number} object literal.
   */
  getPosition() {
    return this.driver_.execute(
        new command.Command(command.Name.GET_WINDOW_POSITION).
            setParameter('windowHandle', 'current'));
  }

  /**
   * Repositions the current window.
   * @param {number} x The desired horizontal position, relative to the left
   *     side of the screen.
   * @param {number} y The desired vertical position, relative to the top of the
   *     of the screen.
   * @return {!Promise<void>} A promise that will be resolved
   *     when the command has completed.
   */
  setPosition(x, y) {
    return this.driver_.execute(
        new command.Command(command.Name.SET_WINDOW_POSITION).
            setParameter('windowHandle', 'current').
            setParameter('x', x).
            setParameter('y', y));
  }

  /**
   * Retrieves the window's current size.
   * @return {!Promise<{width: number, height: number}>} A
   *     promise that will be resolved with the window's size in the form of a
   *     {width:number, height:number} object literal.
   */
  getSize() {
    return this.driver_.execute(
        new command.Command(command.Name.GET_WINDOW_SIZE).
            setParameter('windowHandle', 'current'));
  }

  /**
   * Resizes the current window.
   * @param {number} width The desired window width.
   * @param {number} height The desired window height.
   * @return {!Promise<void>} A promise that will be resolved
   *     when the command has completed.
   */
  setSize(width, height) {
    return this.driver_.execute(
        new command.Command(command.Name.SET_WINDOW_SIZE).
            setParameter('windowHandle', 'current').
            setParameter('width', width).
            setParameter('height', height));
  }

  /**
   * Maximizes the current window. The exact behavior of this command is
   * specific to individual window managers, but typically involves increasing
   * the window to the maximum available size without going full-screen.
   *
   * @return {!Promise<void>} A promise that will be resolved when the command
   *     has completed.
   */
  maximize() {
    return this.driver_.execute(
        new command.Command(command.Name.MAXIMIZE_WINDOW).
            setParameter('windowHandle', 'current'));
  }

  /**
   * Minimizes the current window. The exact behavior of this command is
   * specific to individual window managers, but typicallly involves hiding
   * the window in the system tray.
   *
   * @return {!Promise<void>} A promise that will be resolved when the command
   *     has completed.
   */
  minimize() {
    return this.driver_.execute(
        new command.Command(command.Name.MINIMIZE_WINDOW));
  }

  /**
   * Invokes the "full screen" operation on the current window. The exact
   * behavior of this command is specific to individual window managers, but
   * this will typically increase the window size to the size of the physical
   * display and hide the browser chrome.
   *
   * @return {!Promise<void>} A promise that will be resolved when the command
   *     has completed.
   * @see <https://fullscreen.spec.whatwg.org/#fullscreen-an-element>
   */
  fullscreen() {
    return this.driver_.execute(
        new command.Command(command.Name.FULLSCREEN_WINDOW));
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
   * @return {!Promise<!Array.<!logging.Entry>>} A
   *   promise that will resolve to a list of log entries for the specified
   *   type.
   */
  get(type) {
    let cmd = new command.Command(command.Name.GET_LOG).
        setParameter('type', type);
    return this.driver_.execute(cmd).
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
   * @return {!Promise<!Array<!logging.Type>>} A
   *     promise that will resolve to a list of available log types.
   */
  getAvailableLogTypes() {
    return this.driver_.execute(
        new command.Command(command.Name.GET_AVAILABLE_LOG_TYPES));
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
   * Locates the DOM element on the current page that corresponds to
   * `document.activeElement` or `document.body` if the active element is not
   * available.
   *
   * @return {!WebElementPromise} The active element.
   */
  activeElement() {
    var id = this.driver_.execute(
        new command.Command(command.Name.GET_ACTIVE_ELEMENT));
    return new WebElementPromise(this.driver_, id);
  }

  /**
   * Switches focus of all future commands to the topmost frame in the current
   * window.
   *
   * @return {!Promise<void>} A promise that will be resolved
   *     when the driver has changed focus to the default content.
   */
  defaultContent() {
    return this.driver_.execute(
        new command.Command(command.Name.SWITCH_TO_FRAME).
            setParameter('id', null));
  }

  /**
   * Changes the focus of all future commands to another frame on the page. The
   * target frame may be specified as one of the following:
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
   * @return {!Promise<void>} A promise that will be resolved
   *     when the driver has changed focus to the specified frame.
   */
  frame(id) {
    return this.driver_.execute(
        new command.Command(command.Name.SWITCH_TO_FRAME).
            setParameter('id', id));
  }

  /**
   * Changes the focus of all future commands to another window. Windows may be
   * specified by their {@code window.name} attribute or by its handle
   * (as returned by {@link WebDriver#getWindowHandles}).
   *
   * If the specified window cannot be found, the returned promise will be
   * rejected with a {@linkplain error.NoSuchWindowError}.
   *
   * @param {string} nameOrHandle The name or window handle of the window to
   *     switch focus to.
   * @return {!Promise<void>} A promise that will be resolved
   *     when the driver has changed focus to the specified window.
   */
  window(nameOrHandle) {
    return this.driver_.execute(
        new command.Command(command.Name.SWITCH_TO_WINDOW).
            // "name" supports the legacy drivers. "handle" is the W3C
            // compliant parameter.
            setParameter('name', nameOrHandle).
            setParameter('handle', nameOrHandle));
  }

  /**
   * Changes focus to the active modal dialog, such as those opened by
   * `window.alert()`, `window.confirm()`, and `window.prompt()`. The returned
   * promise will be rejected with a
   * {@linkplain error.NoSuchAlertError} if there are no open alerts.
   *
   * @return {!AlertPromise} The open alert.
   */
  alert() {
    var text = this.driver_.execute(
        new command.Command(command.Name.GET_ALERT_TEXT));
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

    /** @private {!Promise<string>} */
    this.id_ = Promise.resolve(id);
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
   * @return {!Promise<boolean>} A promise that will be
   *     resolved to whether the two WebElements are equal.
   */
  static equals(a, b) {
    if (a === b) {
      return Promise.resolve(true);
    }
    let ids = [a.getId(), b.getId()];
    return Promise.all(ids).then(function(ids) {
      // If the two element's have the same ID, they should be considered
      // equal. Otherwise, they may still be equivalent, but we'll need to
      // ask the server to check for us.
      if (ids[0] === ids[1]) {
        return true;
      }

      let cmd = new command.Command(command.Name.ELEMENT_EQUALS);
      cmd.setParameter('id', ids[0]);
      cmd.setParameter('other', ids[1]);
      return a.driver_.execute(cmd);
    });
  }

  /** @return {!WebDriver} The parent driver for this instance. */
  getDriver() {
    return this.driver_;
  }

  /**
   * @return {!Promise<string>} A promise that resolves to
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
   * @return {!Promise<T>} A promise that will be resolved with the result.
   * @template T
   * @see WebDriver#schedule
   * @private
   */
  execute_(command) {
    command.setParameter('id', this);
    return this.driver_.execute(command);
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
      id = this.execute_(cmd);
    }
    return new WebElementPromise(this.driver_, id);
  }

  /**
   * Locates all of the descendants of this element that match the given search
   * criteria.
   *
   * @param {!(by.By|Function)} locator The locator strategy to use when
   *     searching for the element.
   * @return {!Promise<!Array<!WebElement>>} A promise that will resolve to an
   *     array of WebElements.
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
      return this.execute_(cmd)
          .then(result => Array.isArray(result) ? result : []);
    }
  }

  /**
   * Clicks on this element.
   *
   * @return {!Promise<void>} A promise that will be resolved when the click
   *     command has completed.
   */
  click() {
    return this.execute_(new command.Command(command.Name.CLICK_ELEMENT));
  }

  /**
   * Types a key sequence on the DOM element represented by this instance.
   *
   * Modifier keys (SHIFT, CONTROL, ALT, META) are stateful; once a modifier is
   * processed in the key sequence, that key state is toggled until one of the
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
   * - The end of the key sequence is encountered. When there are no more keys
   *   to type, all depressed modifier keys are released (with accompanying
   *   keyup events).
   *
   * If this element is a file input ({@code <input type="file">}), the
   * specified key sequence should specify the path to the file to attach to
   * the element. This is analogous to the user clicking "Browse..." and entering
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
   * punctuation keys will be synthesized according to a standard QWERTY en-us
   * keyboard layout.
   *
   * @param {...(number|string|!IThenable<(number|string)>)} var_args The
   *     sequence of keys to type. Number keys may be referenced numerically or
   *     by string (1 or '1'). All arguments will be joined into a single
   *     sequence.
   * @return {!Promise<void>} A promise that will be resolved when all keys
   *     have been typed.
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
      return this.execute_(
          new command.Command(command.Name.SEND_KEYS_TO_ELEMENT).
              setParameter('text', keys.then(keys => keys.join(''))).
              setParameter('value', keys));
    }

    return keys.then(keys => {
      let driver = this.driver_;
      return driver.fileDetector_.handleFile(driver, keys.join(''));
    }).then(keys => {
      return this.execute_(
          new command.Command(command.Name.SEND_KEYS_TO_ELEMENT).
              setParameter('text', keys).
              setParameter('value', keys.split('')));
    });
  }

  /**
   * Retrieves the element's tag name.
   *
   * @return {!Promise<string>} A promise that will be resolved with the
   *     element's tag name.
   */
  getTagName() {
    return this.execute_(
        new command.Command(command.Name.GET_ELEMENT_TAG_NAME));
  }

  /**
   * Retrieves the value of a computed style property for this instance. If
   * the element inherits the named style from its parent, the parent will be
   * queried for its value.  Where possible, color values will be converted to
   * their hex representation (e.g. #00ff00 instead of rgb(0, 255, 0)).
   *
   * _Warning:_ the value returned will be as the browser interprets it, so
   * it may be tricky to form a proper assertion.
   *
   * @param {string} cssStyleProperty The name of the CSS style property to look
   *     up.
   * @return {!Promise<string>} A promise that will be resolved with the
   *     requested CSS value.
   */
  getCssValue(cssStyleProperty) {
    var name = command.Name.GET_ELEMENT_VALUE_OF_CSS_PROPERTY;
    return this.execute_(
        new command.Command(name).
            setParameter('propertyName', cssStyleProperty));
  }

  /**
   * Retrieves the current value of the given attribute of this element.
   * Will return the current value, even if it has been modified after the page
   * has been loaded. More exactly, this method will return the value
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
   * @return {!Promise<?string>} A promise that will be
   *     resolved with the attribute's value. The returned value will always be
   *     either a string or null.
   */
  getAttribute(attributeName) {
    return this.execute_(
        new command.Command(command.Name.GET_ELEMENT_ATTRIBUTE).
            setParameter('name', attributeName));
  }

  /**
   * Get the visible (i.e. not hidden by CSS) innerText of this element,
   * including sub-elements, without any leading or trailing whitespace.
   *
   * @return {!Promise<string>} A promise that will be
   *     resolved with the element's visible text.
   */
  getText() {
    return this.execute_(new command.Command(command.Name.GET_ELEMENT_TEXT));
  }

  /**
   * Computes this element's bounding box, in pixels.
   *
   * @return {!Promise<{width: number, height: number}>} A
   *     promise that will be resolved with the element's size as a
   *     {@code {width:number, height:number}} object.
   */
  getSize() {
    return this.execute_(new command.Command(command.Name.GET_ELEMENT_SIZE));
  }

  /**
   * Computes the location of this element in page space.
   *
   * @return {!Promise<{x: number, y: number}>} A promise that
   *     will be resolved to the element's location as a
   *     {@code {x:number, y:number}} object.
   */
  getLocation() {
    return this.execute_(
        new command.Command(command.Name.GET_ELEMENT_LOCATION));
  }

  /**
   * Tests whether this element is enabled, as dictated by the `disabled`
   * attribute.
   *
   * @return {!Promise<boolean>} A promise that will be
   *     resolved with whether this element is currently enabled.
   */
  isEnabled() {
    return this.execute_(new command.Command(command.Name.IS_ELEMENT_ENABLED));
  }

  /**
   * Tests whether this element is selected.
   *
   * @return {!Promise<boolean>} A promise that will be
   *     resolved with whether this element is currently selected.
   */
  isSelected() {
    return this.execute_(
        new command.Command(command.Name.IS_ELEMENT_SELECTED));
  }

  /**
   * Submits the form containing this element (or this element if it is itself
   * a FORM element). his command is a no-op if the element is not contained in
   * a form.
   *
   * @return {!Promise<void>} A promise that will be resolved
   *     when the form has been submitted.
   */
  submit() {
    return this.execute_(new command.Command(command.Name.SUBMIT_ELEMENT));
  }

  /**
   * Clear the `value` of this element. This command has no effect if the
   * underlying DOM element is neither a text INPUT element nor a TEXTAREA
   * element.
   *
   * @return {!Promise<void>} A promise that will be resolved
   *     when the element has been cleared.
   */
  clear() {
    return this.execute_(new command.Command(command.Name.CLEAR_ELEMENT));
  }

  /**
   * Test whether this element is currently displayed.
   *
   * @return {!Promise<boolean>} A promise that will be
   *     resolved with whether this element is currently visible on the page.
   */
  isDisplayed() {
    return this.execute_(
        new command.Command(command.Name.IS_ELEMENT_DISPLAYED));
  }

  /**
   * Take a screenshot of the visible region encompassed by this element's
   * bounding rectangle.
   *
   * @param {boolean=} opt_scroll Optional argument that indicates whether the
   *     element should be scrolled into view before taking a screenshot.
   *     Defaults to false.
   * @return {!Promise<string>} A promise that will be
   *     resolved to the screenshot as a base-64 encoded PNG.
   */
  takeScreenshot(opt_scroll) {
    var scroll = !!opt_scroll;
    return this.execute_(
        new command.Command(command.Name.TAKE_ELEMENT_SCREENSHOT)
            .setParameter('scroll', scroll));
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
 * @implements {IThenable<!WebElement>}
 * @final
 */
class WebElementPromise extends WebElement {
  /**
   * @param {!WebDriver} driver The parent WebDriver instance for this
   *     element.
   * @param {!Promise<!WebElement>} el A promise
   *     that will resolve to the promised element.
   */
  constructor(driver, el) {
    super(driver, 'unused');

    /** @override */
    this.then = el.then.bind(el);

    /** @override */
    this.catch = el.catch.bind(el);

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

    /** @private {!Promise<string>} */
    this.text_ = Promise.resolve(text);
  }

  /**
   * Retrieves the message text displayed with this alert. For instance, if the
   * alert were opened with alert("hello"), then this would return "hello".
   *
   * @return {!Promise<string>} A promise that will be
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
   * @return {!Promise<void>} A promise that will be resolved when this
   *     command has completed.
   */
  authenticateAs(username, password) {
    return this.driver_.execute(
        new command.Command(command.Name.SET_ALERT_CREDENTIALS));
  }

  /**
   * Accepts this alert.
   *
   * @return {!Promise<void>} A promise that will be resolved
   *     when this command has completed.
   */
  accept() {
    return this.driver_.execute(
        new command.Command(command.Name.ACCEPT_ALERT));
  }

  /**
   * Dismisses this alert.
   *
   * @return {!Promise<void>} A promise that will be resolved
   *     when this command has completed.
   */
  dismiss() {
    return this.driver_.execute(
        new command.Command(command.Name.DISMISS_ALERT));
  }

  /**
   * Sets the response text on this alert. This command will return an error if
   * the underlying alert does not support response text (e.g. window.alert and
   * window.confirm).
   *
   * @param {string} text The text to set.
   * @return {!Promise<void>} A promise that will be resolved
   *     when this command has completed.
   */
  sendKeys(text) {
    return this.driver_.execute(
        new command.Command(command.Name.SET_ALERT_TEXT).
            setParameter('text', text));
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
 * @implements {IThenable<!Alert>}
 * @final
 */
class AlertPromise extends Alert {
  /**
   * @param {!WebDriver} driver The driver controlling the browser this
   *     alert is attached to.
   * @param {!Promise<!Alert>} alert A thenable
   *     that will be fulfilled with the promised alert.
   */
  constructor(driver, alert) {
    super(driver, 'unused');

    /** @override */
    this.then = alert.then.bind(alert);

    /** @override */
    this.catch = alert.catch.bind(alert);

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


/**
 * User facing API for generating complex user gestures. Each action sequence
 * will not be executed until {@link #perform()} is called.
 *
 * Action sequences are divided into a series of "ticks". At each tick, the
 * WebDriver remote end will perform a single action for each device included
 * in the action sequence. At tick 0, the driver will perform the first action
 * defined for each device, at tick 1 the second action for each device, and
 * so on until all actions have been executed. If an individual device does
 * not have an action defined at a particular tick, it will automatically
 * pause.
 *
 * For example, suppose you want to emulate a user pressing the SHIFT key,
 * clicking on two elements, then releasing the SHIFT key. This sequence
 * involves 2 devices (mouse and keyboard) with actions defined over 7
 * ticks:
 *
 * 1.  press the SHIFT key while moving the mouse over element 1
 * 2.  pressing the left mouse button
 * 3.  releasing the left mouse button
 * 4.  moving the mouse over element 2
 * 5.  pressing the left mouse button
 * 6.  releasing the left mouse button
 * 7.  releasing the SHIFT key
 *
 * Note there are no actions (or change in state) for the keyboard for
 * ticks 2 - 6, so it should pause for these ticks.
 *
 * This input sequence can be produced using the ActionSequence API with
 * the code below. Actions must be defined individually for each device and
 * explicitly kept in sync by the user. The list of actions for the mouse is
 * far longer than the keyboard. Rather than keeping track of the number of
 * steps for the keyboard to pause, there is a single call to
 * {@link #synchronize()}. This instructs the ActionSequence to ensure the
 * input sequence for all devices are the same length - inserting explicit
 * {@linkplain input.Sequence#pause pauses} as necessary.
 *
 *     let actions = driver.actions();
 *     actions.keyboard().keyDown(Key.SHIFT);
 *     actions.mouse().click(element1).click(element2);
 *
 *     // Insert pauses for the keyboard to cover the span of all mouse actions
 *     actions.synchronize();
 *
 *     actions.keyboard().keyUp(Key.SHIFT);
 *     actions.perform();
 *
 * @final
 * @see <https://www.w3.org/TR/webdriver/#actions>
 */
class ActionSequence {
  /**
   * @param {!IWebDriver} driver The driver instance to execute the configured
   *     actions with.
   */
  constructor(driver) {
    /** @private @const */
    this.driver_ = driver;

    /** @private @const */
    this.keyboard_ =
        new input.KeySequence(new input.Keyboard('default keyboard'));

    /** @private @const */
    this.mouse_ =
        new input.PointerSequence(
            new input.Pointer('default mouse', input.Pointer.Type.MOUSE));

    /** @private @const */
    this.touch_ =
        new input.PointerSequence(
            new input.Pointer('default touch', input.Pointer.Type.TOUCH));
  }

  /**
   * Ensures the action sequence for every device referenced in this action
   * sequence is the same length. For devices whose sequence is too short,
   * this will insert {@linkplain input.Sequence#pause pauses} so that every
   * device has an explicit action defined at each tick.
   *
   * @return {!ActionSequence} a self reference.
   */
  synchronize() {
    let max = this.keyboard_.length();
    max = Math.max(max, this.mouse_.length());
    max = Math.max(max, this.touch_.length());

    function extend(/** !input.Sequence */ sequence) {
      while (sequence.length() < max) {
        sequence.pause();
      }
    }

    extend(this.keyboard_);
    extend(this.mouse_);
    extend(this.touch_);

    return this;
  }

  /** @return {!input.KeySequence} the keyboard action sequence builder. */
  keyboard() {
    return this.keyboard_;
  }

  /** @return {!input.PointerSequence} the mouse action sequence builder. */
  mouse() {
    return this.mouse_;
  }

  /** @return {!input.PointerSequence} the touch action sequence builder. */
  touch() {
    return this.touch_;
  }

  /**
   * Releases all keys and pointer buttons and clears internal state.
   *
   * @return {!Promise<void>} a promise that will resolve when finished
   *     clearing all action state.
   */
  clear() {
    this.keyboard_.clear();
    this.mouse_.clear();
    this.touch_.clear();
    return this.driver_.execute(
        new command.Command(command.Name.CLEAR_ACTIONS));
  }

  /**
   * Performs the configured action sequence.
   *
   * @return {!Promise<void>} a promise that will resolve when all actions have
   *     been completed.
   */
  perform() {
    let actions = [
        this.keyboard_,
        this.mouse_,
        this.touch_
    ].filter(sequence => !sequence.isIdle());
    return this.driver_.execute(
        new command.Command(command.Name.ACTIONS)
            .setParameter('actions', actions));
  }
}


// PUBLIC API


module.exports = {
  ActionSequence,
  Alert: Alert,
  AlertPromise: AlertPromise,
  Condition: Condition,
  Logs: Logs,
  Navigation: Navigation,
  Options: Options,
  TargetLocator: TargetLocator,
  Timeouts: Timeouts,
  IWebDriver: IWebDriver,
  WebDriver: WebDriver,
  WebElement: WebElement,
  WebElementCondition: WebElementCondition,
  WebElementPromise: WebElementPromise,
  Window: Window
};
