/** @license
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * @fileoverview The heart of the WebDriver JavaScript API.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

goog.provide('webdriver.WebDriver');
goog.provide('webdriver.WebDriver.EventType');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('webdriver.Command');
goog.require('webdriver.CommandName');
goog.require('webdriver.Context');
goog.require('webdriver.Response');
goog.require('webdriver.Wait');
goog.require('webdriver.WebElement');
goog.require('webdriver.logging');
goog.require('webdriver.timing');


/**
 * The main interface for controlling a web browser.  How the browser is
 * controlled is dictated by the injected {@code commandProcessor}. The command
 * processor may control the browser either through an extension or plugin, or
 * by sending commands to a RemoteWebDriver server.
 *
 * Any WebDriver command that is expected to produce a return value will return
 * a {@code webdriver.Future}.  This Future can passed as an argument to another
 * command, or an assertion function in the {@code webdriver.asserts} namespace.
 * For example:
 *   driver.get('http://www.google.com');
 *   var futureTitle = driver.getTitle();
 *   assertThat(futureTitle, equals('Google Search'));
 *
 * The WebDriver will dispatch the following events:
 * <ul>
 * <li>webdriver.WebDriver.EventType.PAUSED - Command execution has been halted
 *     and no more commands will be processed until {@code #resume()} is called
 * </li>
 * <li>webdriver.WebDriver.EventType.RESUMED - The driver has resumed execution
 *     after being paused</li>
 * <li>webdriver.WebDriver.EventType.ERROR - Dispatched whenever a WebDriver
 *     command fails</li>
 * </ul>
 *
 * @param {Object} commandProcessor The command processor to use for executing
 *     individual {@code webdriver.Command}s.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
webdriver.WebDriver = function(commandProcessor) {
  goog.events.EventTarget.call(this);

  /**
   * The command processor to use for executing commands.
   * @type {Object}
   * @private
   */
  this.commandProcessor_ = commandProcessor;

  /**
   * List of commands that have been sent to the command processor and are
   * await results. This array should only ever have three sizes:
   * 0: there are no pending commands with the command processor
   * 1: a single command is pending with the command processor
   * 2: a command within a wait condition is pending with the command
   *    processor
   * @type {Array.<webdriver.Command>}
   * @private
   */
  this.pendingCommands_ = [];

  /**
   * A stack of frames for managing batched command execution order.
   * @type {Array.<Array.<webdriver.Command>>}
   * @private
   */
  this.frames_ = [[]];

  /**
   * A list of commands that have been successfully completed since the last
   * reset.
   * @type {Array.<webdriver.Command>}
   * @priate
   */
  this.commandHistory_ = [];

  /**
   * Whether this instance is paused. When paused, commands can still be issued,
   * but no commands will be executed.
   * @type {boolean}
   * @private
   */
  this.isPaused_ = false;

  /**
   * This instances current context (window and frame ID).
   * @type {webdriver.Context}
   * @private
   */
  this.context_ = new webdriver.Context();

  /**
   * Whether this instance is locked into its current session. Once locked in,
   * any further calls to {@code webdriver.WebDriver.prototype.newSession} will
   * be ignored.
   * @type {boolean}
   * @private
   */
  this.sessionLocked_ = false;

  /**
   * This instance's current session ID.  Set with the
   * {@code webdriver.WebDriver.prototype.newSession} command.
   * @type {?string}
   * @private
   */
  this.sessionId_ = null;

  /**
   * Interval ID for the command processing loop.
   * @type {number}
   * @private
   */
  this.commandInterval_ = webdriver.timing.setInterval(
      goog.bind(this.processCommands_, this),
      webdriver.WebDriver.COMMAND_INTERVAL_LENGTH_);
};
goog.inherits(webdriver.WebDriver, goog.events.EventTarget);


/**
 * The amount of time in milliseconds between ticks of the command processing
 * interval.
 * @type {number}
 * @private
 */
webdriver.WebDriver.COMMAND_INTERVAL_LENGTH_ = 10;


/**
 * Enumeration of the events that may be dispatched by an instance of
 * {@code webdriver.WebDriver}.
 * @enum {string}
 */
webdriver.WebDriver.EventType = {
  ERROR: 'ERROR',
  PAUSED: 'PAUSED',
  RESUMED: 'RESUMED'
};


/**
 * Enumeration of the supported mouse speeds.
 * @enum {number}
 * @see webdriver.WebDriver.prototype.setMouseSpeed
 * @see webdriver.WebDriver.prototype.getMouseSpeed
 */
webdriver.WebDriver.Speed = {
  SLOW: 1,
  MEDIUM: 10,
  FAST: 100
};


/**
 * @override
 */
webdriver.WebDriver.prototype.disposeInternal = function() {
  this.commandProcessor_.dispose();
  webdriver.timing.clearInterval(this.commandInterval_);

  delete this.commandProcessor_;
  delete this.pendingCommands_;
  delete this.frames_;
  delete this.commandHistory_;
  delete this.isPaused_;
  delete this.context_;
  delete this.sessionLocked_;
  delete this.sessionId_;
  delete this.commandInterval_;

  webdriver.WebDriver.superClass_.disposeInternal.call(this);
};


/**
 * Queues a command to execute.
 * @param {webdriver.CommandName} name The name of the command to execute.
 * @param {webdriver.WebElement} opt_element The element that is the target
 *     of the new command.
 * @return {webdriver.Command} The new command.
 * @protected
 */
webdriver.WebDriver.prototype.addCommand = function(name, opt_element) {
  var command = new webdriver.Command(this, name, opt_element);
  goog.array.peek(this.frames_).push(command);
  return command;
};


/**
 * @return {webdriver.Command} The command currently being executed or
 *     {@code undefined}.
 */
webdriver.WebDriver.prototype.getPendingCommand = function() {
  return goog.array.peek(this.pendingCommands_);
};


/**
 * Aborts the pending command, if any. If the pending command is part of a
 * {@code #wait()}, then the entire wait operation will be aborted.
 */
webdriver.WebDriver.prototype.abortPendingCommand = function() {
  goog.array.forEach(this.pendingCommands_, function(command) {
    command.abort = true;
  });
  this.pendingCommands_ = [];
  this.waitFrame_ = null;
};


/**
 * Immediately pauses the driver so it will not execute anymore commands until
 * {@code #resume()} is called.
 * Dispatches a {@code webdriver.WebDriver.EventType.PAUSED} event.
 */
webdriver.WebDriver.prototype.pauseImmediately = function() {
  this.isPaused_ = true;
  webdriver.logging.debug('Webdriver paused');
  this.dispatchEvent(webdriver.WebDriver.EventType.PAUSED);
};


/**
 * Unpauses this driver so it can execute commands again.  Dispatches a
 * {@code webdriver.WebDriver.EventType.RESUMED} event.
 */
webdriver.WebDriver.prototype.resume = function() {
  this.isPaused_ = false;
  webdriver.logging.debug('Webdriver resumed');
  this.dispatchEvent(webdriver.WebDriver.EventType.RESUMED);
};


/**
 * Event handler for whenever this driver is ready to execute a command.
 * @private
 */
webdriver.WebDriver.prototype.processCommands_ = function() {
  if (this.isPaused_) {
    return;
  }

  var pendingCommand = this.getPendingCommand();
  if (pendingCommand && webdriver.CommandName.WAIT != pendingCommand.name) {
    return;
  }

  var currentFrame = goog.array.peek(this.frames_);
  var nextCommand = currentFrame.shift();
  if (nextCommand) {
    this.pendingCommands_.push(nextCommand);
    if (nextCommand.name == webdriver.CommandName.FUNCTION) {
      this.frames_.push([]);
    } else if (nextCommand.name == webdriver.CommandName.WAIT) {
      this.waitFrame_ = [];
      this.frames_.push(this.waitFrame_);
    }

    nextCommand.setCompleteCallback(this.onCommandComplete_, this);
    this.commandProcessor_.execute(nextCommand, this.sessionId_, this.context_);
  } else if (this.frames_.length > 1) {
    if (currentFrame !== this.waitFrame_) {
      this.frames_.pop();
    }
  }
};


/**
 * Callback for when a pending {@code webdriver.Command} is finished.
 * @private
 */
webdriver.WebDriver.prototype.onCommandComplete_ = function(command) {
  this.commandHistory_.push(command);
  if (command.response.isFailure || command.response.errors.length) {
    if (webdriver.CommandName.WAIT == command.name) {
      // The wait terminated early. Abort all other commands issued inside the
      // wait condition.
      for (var i = 1; i < this.pendingCommands_.length; i++) {
        this.pendingCommands_[i].abort = true;
      }
      this.pendingCommands_ = [this.pendingCommands_[0]];
    }
    this.dispatchEvent(webdriver.WebDriver.EventType.ERROR);
  } else {
    this.pendingCommands_.pop();
    if (webdriver.CommandName.WAIT == command.name) {
      this.waitFrame_ = null;
    }
  }
};



/**
 * @return {?string} This instance's current session ID or {@code null} if it
 *     does not have one yet.
 */
webdriver.WebDriver.prototype.getSessionId = function() {
  return this.sessionId_;
};


/**
 * @return {webdriver.Context} This instance's current context.
 */
webdriver.WebDriver.prototype.getContext = function() {
  return this.context_;
};


// ----------------------------------------------------------------------------
// Client command functions:
// ----------------------------------------------------------------------------

/**
 * Adds an event handler to catch any {@code ERROR} events from the previous
 * command. If the previous command generates an ERROR, that error will be
 * suppressed and this instance will continue executing commands. If an error
 * was not raised, a new {@code webdriver.WebDriver.EventType.ERROR} event will
 * be dispatched for the unexpected behavior.
 * @param {string} opt_errorMsg The message to include with the ERROR event if
 *     the expected error does not occur.
 */
webdriver.WebDriver.prototype.catchExpectedError = function(opt_errorMsg,
                                                            opt_handlerFn) {
  var currentFrame = goog.array.peek(this.frames_);
  var previousCommand = currentFrame.pop();
  if (!previousCommand) {
    throw new Error('No commands in the queue to expect an error from');
  }

  var listener =
      goog.events.getListener(this, webdriver.WebDriver.EventType.ERROR, true);
  if (listener) {
    throw new Error('IllegalState: Driver already has a registered ' +
                    'expected error handler');
  }

  var caughtError = false;
  var handleError = function(e) {
    caughtError = true;
    e.stopPropagation();
    e.preventDefault();
    if (goog.isFunction(opt_handlerFn)) {
      opt_handlerFn(e.target.getPendingCommand());
    }
    goog.events.removeAll(
        e.target, webdriver.WebDriver.EventType.ERROR, /*capture=*/true);

    // Errors cause the pending command to hang. Go ahead and abort that command
    // so we can proceed.
    this.abortPendingCommand();
    var frame = goog.array.peek(this.frames_);
    while (frame !== currentFrame) {
      this.frames_.pop();
      frame = goog.array.peek(this.frames_);
    }
    return false;
  };

  // Surround the last command with two new commands. The first enables our
  // error listener which cancels any errors. The second verifies that we
  // caught an error. If not, it fails the test.
  this.callFunction(function() {
    goog.events.listenOnce(this,
        webdriver.WebDriver.EventType.ERROR, handleError, /*capture=*/true);
  }, this);
  currentFrame.push(previousCommand);
  this.callFunction(function() {
    // Need to unlisten for error events so the error below doesn't get
    // blocked.
    goog.events.unlisten(this, webdriver.WebDriver.EventType.ERROR,
                         handleError, /*capture=*/true);
    if (!caughtError) {
      throw new Error(
          (opt_errorMsg ? (opt_errorMsg + '\n') : '') +
          'Expected an error but none were raised.');
    }
  }, this);
};


/**
 * Adds a command to pause this driver so it will not execute anymore commands
 * until {@code #resume()} is called. When this command executes, a
 * {@code webdriver.WebDriver.EventType.PAUSED} event will be dispatched.
 */
webdriver.WebDriver.prototype.pause = function() {
  this.callFunction(goog.bind(this.pauseImmediately, this));
};


/**
 * Has the driver temporarily halt command execution. This command does
 * <em>not</em> result in a {@code webdriver.WebDriver.EventType.PAUSED} event.
 * @param {number} ms The amount of time in milliseconds for the driver to
 *     sleep.
 */
webdriver.WebDriver.prototype.sleep = function(ms) {
  this.addCommand(webdriver.CommandName.SLEEP).setParameters(ms);
};


/**
 * Inserts a function into the command queue for the driver to call. The
 * function will be passed the last {@code webdriver.Response} retrieved from
 * the command processor.  The result of the function will be stored in a new
 * {@code webdriver.Response} and passed to any subsequent function commands.
 * @param {function} fn The function to call; should take a single
 *     {@code webdriver.Response} object.
 * @return {webdriver.Future} The result of the function wrapped in a future.
 */
webdriver.WebDriver.prototype.callFunction = function(fn, opt_selfObj,
                                                      var_args) {
  var args = goog.array.slice(arguments, 2);
  var wrappedFunction = goog.bind(function() {
    var lastCommand = goog.array.peek(this.commandHistory_);
    args.push(lastCommand ? lastCommand.response :null);
    return fn.apply(opt_selfObj, args);
  }, this);
  return this.addCommand(webdriver.CommandName.FUNCTION).
      setParameters(wrappedFunction).
      getFutureResult();
};


/**
 * Waits for a condition to be true before executing the next command. If the
 * condition does not hold after the given {@code timeout}, an error will be
 * raised. Only one wait may be performed at a time (e.g. no nesting).
 * Example:
 * <code>
 *   driver.get('http://www.google.com');
 *   var element = driver.findElement({name: 'q'});
 *   driver.wait(element.isDisplayed, 3000, element);
 * </code>
 * @param {function} conditionFn The function to evaluate.
 * @param {number} timeout The maximum amount of time to wait, in milliseconds.
 * @param {Object} opt_self (Optional) The object in whose context to execute
 *     the {@code conditionFn}.
 * @throws If this driver is currently executing another wait command.
 * @see webdriver.Wait
 */
webdriver.WebDriver.prototype.wait = function(conditionFn, timeout, opt_self) {
  if (this.pendingCommands_.length) {
    var command = this.pendingCommands_[0];
    if (webdriver.CommandName.WAIT == command.name) {
      throw new Error('Nested waits are not supported');
    }
  }

  if (opt_self) {
    conditionFn = goog.bind(conditionFn, opt_self);
  }
  var waitOp = new webdriver.Wait(conditionFn, timeout);
  this.addCommand(webdriver.CommandName.WAIT).setParameters(waitOp);
};


/**
 * Waits for the inverse of a condition to be true before executing the next
 * command. If the condition does not hold after the given {@code timeout}, an
 * error will be raised. Example:
 * <code>
 *   driver.get('http://www.google.com');
 *   var element = driver.findElement({name: 'q'});
 *   driver.waitNot(element.isDisplayed, 3000, element);
 * </code>
 * @param {function} conditionFn The function to evaluate.
 * @param {number} timeout The maximum amount of time to wait, in milliseconds.
 * @param {Object} opt_self (Optional) The object in whose context to execute
 *     the {@code conditionFn}.
 * @see webdriver.Wait
 */
webdriver.WebDriver.prototype.waitNot = function(conditionFn, timeout,
                                                 opt_self) {
  if (opt_self) {
    conditionFn = goog.bind(conditionFn, opt_self);
  }
  var waitOp = new webdriver.Wait(conditionFn, timeout);
  waitOp.waitOnInverse(true);
  this.addCommand(webdriver.CommandName.WAIT).setParameters(waitOp);
};


/**
 * Request a new session ID.  This is a no-op if this instance is already locked
 * into a session.
 * @param {boolean} lockSession Whether to lock this instance into the returned
 *     session. Once locked into a session, the driver cannot ask for a new
 *     session (a new instance must be created).
 */
webdriver.WebDriver.prototype.newSession = function(lockSession) {
  if (lockSession) {
    this.addCommand(webdriver.CommandName.NEW_SESSION).
        setSuccessCallback(function(response) {
          this.sessionLocked_ = lockSession;
          this.sessionId_ = response.value;
          this.context_ = response.context;
        }, this);
  } else {
    webdriver.logging.warn(
        'Cannot start new session; driver is locked into current session');
  }
};


/**
 * Switch the focus of future commands for this driver to the window with the
 * given name.
 * @param {string|webdriver.Future} name The name of the window to transfer
 *     control to.  Alternatively, the UUID of a window handle, returned by
 *     {@code #getWindowHandle()} or {@code #getAllWindowHandles()}.
 */
webdriver.WebDriver.prototype.switchToWindow = function(name) {
  this.addCommand(webdriver.CommandName.SWITCH_TO_WINDOW).
      setParameters(name).
      setSuccessCallback(function(response) {
        this.context_ = response.value;
      }, this);
};


/**
 * Switch the focus of future commands for this driver to the frame with the
 * given name or ID.  To select sub-frames, simply separate the frame names/IDs
 * by dots. As an example, {@code 'main.child'} will select the frame with the
 * name 'main' and hten its child 'child'.  If a frame name is a number, then it
 * will be treated as an index into the {@code window.frames} array of the
 * current window.
 * @param {string|number|webdriver.WebElement} frame Identifier for the frame
 *     to transfer control to.
 */
webdriver.WebDriver.prototype.switchToFrame = function(frame) {
  var commandName = webdriver.CommandName.SWITCH_TO_FRAME;
  var command;
  if (goog.isString(frame) || goog.isNumber(frame)) {
    command = this.addCommand(commandName).setParameters(frame);
  } else {
    command = this.addCommand(commandName, frame);
  }
  command.setSuccessCallback(function(response) {
    this.context_ = response.context;
  }, this);
};


/**
 * Selects either the first frame on the page, or the main document when a page
 * contains iframes.
 */
webdriver.WebDriver.prototype.switchToDefaultContent = function() {
  this.addCommand(webdriver.CommandName.SWITCH_TO_DEFAULT_CONTENT).
      setParameters(null).
      setSuccessCallback(function(response) {
        this.context_ = response.context;
      }, this);
};


/**
 * Retrieves the internal UUID handle for the current window.
 * @return {webdriver.Future} The current handle wrapped in a Future.
 */
webdriver.WebDriver.prototype.getWindowHandle = function() {
  return this.addCommand(webdriver.CommandName.GET_CURRENT_WINDOW_HANDLE).
      getFutureResult();
};


/**
 * Retrieves the handles for all known windows.
 */
webdriver.WebDriver.prototype.getAllWindowHandles = function() {
  this.addCommand(webdriver.CommandName.GET_WINDOW_HANDLES);
};


/**
 * Retrieves the HTML source of the current page.
 * @return {webdriver.Future} The page source wrapped in a Future.
 */
webdriver.WebDriver.prototype.getPageSource = function() {
  return this.addCommand(webdriver.CommandName.GET_PAGE_SOURCE).
      getFutureResult();
};


/**
 * Closes the current window.
 * <strong>WARNING: This command provides no protection against closing the
 * script window (e.g. the window sending commands to the driver)</strong>
 */
webdriver.WebDriver.prototype.close = function() {
  this.addCommand(webdriver.CommandName.CLOSE);
};



/**
 * Helper function for converting an argument to a script into a parameter
 * object to send with the {@code webdriver.Command}.
 * @param {*} arg The value to convert.
 * @return {Object} A JSON object with "type" and "value" properties.
 * @see {webdriver.WebDriver.prototype.executeScript}
 * @private
 */
webdriver.WebDriver.wrapScriptArgument_ = function(arg) {
  var type, value;
  if (arg instanceof webdriver.WebElement) {
    type = 'ELEMENT';
    value = arg.getId();
  } else if (goog.isBoolean(arg) ||
             goog.isNumber(arg) ||
             goog.isString(arg)) {
    type = goog.typeOf(arg).toUpperCase();
    value = arg;
  } else if (goog.isArray(arg)) {
    type = goog.typeOf(arg).toUpperCase();
    value = goog.array.map(arg, webdriver.WebDriver.wrapScriptArgument_);
  } else {
    throw new Error('Invalid script argument type: ' + goog.typeOf(arg));
  }
  return {'type': type, 'value': value};
};


/**
 * Helper function for unwrapping an executeScript result.
 * @param {{type:string,value:*}|Array.<{type:string,value:*}>} result The
 *     result to unwrap.
 * @return {*} The unwrapped result.
 * @private
 */
webdriver.WebDriver.prototype.unwrapScriptResult_ = function(result) {
  switch (result.type) {
    case 'ELEMENT':
      var element = new webdriver.WebElement(this);
      element.getId().setValue(result.value);
      return element;

    case 'ARRAY':
      return goog.array.map(result.value, goog.bind(
          this.unwrapScriptResult_, this));

    default:
      return result.value;
  }
};


/**
 * Adds a command to execute a JavaScript snippet in the window of the page
 * currently under test.
 * @param {string} script The JavaScript snippet to execute.
 * @param {*} var_args The arguments to pass to the script.
 * @return {webdriver.Future} The result of the executed script, wrapped in a
 *     {@code webdriver.Future} instance.
 */
webdriver.WebDriver.prototype.executeScript = function(script, var_args) {
  var args = goog.array.map(
      goog.array.slice(arguments, 1),
      webdriver.WebDriver.wrapScriptArgument_);
  return this.addCommand(webdriver.CommandName.EXECUTE_SCRIPT).
      setParameters(script, args).
      setSuccessCallback(function(response) {
        response.value = this.unwrapScriptResult_(response.value);
      }, this).
      getFutureResult();
};


/**
 * Adds a command to fetch the given URL.
 * @param {goog.Uri|string} url The URL to fetch.
 */
webdriver.WebDriver.prototype.get = function(url) {
  this.addCommand(webdriver.CommandName.GET).
      setParameters(url.toString()).
      setSuccessCallback(function(response) {
        this.context_ = response.context;
      }, this);
};


/**
 * Navigate backwards in the current browser window's history.
 */
webdriver.WebDriver.prototype.back = function() {
  this.addCommand(webdriver.CommandName.BACK);
};


/**
 * Navigate forwards in the current browser window's history.
 */
webdriver.WebDriver.prototype.forward = function() {
  this.addCommand(webdriver.CommandName.FORWARD);
};


/**
 * Refresh the current page.
 */
webdriver.WebDriver.prototype.refresh = function() {
  this.addCommand(webdriver.CommandName.REFRESH);
};


/**
 * Retrieves the current window URL.
 * @return {webdriver.Future} The current URL in a webdriver.Future.
 */
webdriver.WebDriver.prototype.getCurrentUrl = function() {
  return this.addCommand(webdriver.CommandName.GET_CURRENT_URL).
      getFutureResult();
};


/**
 * Retrieves the current page's title.
 * @return {webdriver.Future} The current page title.
 */
webdriver.WebDriver.prototype.getTitle = function() {
  return this.addCommand(webdriver.CommandName.GET_TITLE).
      getFutureResult();
};


/**
 * Find an element on the current page. If the element cannot be found, an
 * {@code webdriver.WebDriver.EventType.ERROR} event will be dispatched.
 * @param {webdriver.By.Locator|object} by An object describing the locator
 *     strategy to use.
 * @return {webdriver.WebElement} A WebElement wrapper that can be used to
 *     issue commands against the located element.
 */
webdriver.WebDriver.prototype.findElement = function(by) {
  return webdriver.WebElement.findElement(this, by);
};


/**
 * Determine if an element is present on the page.
 * @param {webdriver.By.Locator|{*: string}} by The locator to use for finding
 *     the element, or a short-hand object that can be converted into a locator.
 * @return {webdriver.Future} Whether the element was present on the page. The
 *    return value is wrapped in a Future that will be defined when the driver
 *    completes the command.
 * @see webdriver.By.Locator.createFromObj
 */
webdriver.WebDriver.prototype.isElementPresent = function(by) {
  return webdriver.WebElement.isElementPresent(this, by);
};



/**
 * Search for multiple elements on the current page. The result of this
 * operation can be accessed from the last saved {@code webdriver.Response}
 * object:
 * driver.findElements({xpath: '//div'});
 * driver.callFunction(function(response) {
 *   response.value[0].click();
 *   response.value[1].click();
 *   // etc.
 * });
 * @param {webdriver.By.Locator|{*: string}} by The locator to use for finding
 *     the element, or a short-hand object that can be converted into a locator.
 * @see webdriver.By.Locator.createFromObj
 */
webdriver.WebDriver.prototype.findElements = function(by) {
  return webdriver.WebElement.findElements(this, by);
};


/**
 * Adjust the speed of the mouse for mouse related commands.
 * @param {webdriver.WebDriver.Speed} speed The new speed setting.
 */
webdriver.WebDriver.prototype.setMouseSpeed = function(speed) {
  this.addCommand(webdriver.CommandName.SET_MOUSE_SPEED).
      setParameters(speed);
};


/**
 * Fetch the current mouse speed.
 * @return {webdriver.Future} A Future whose value will be set by this driver
 *     when the query command completes.
 */
webdriver.WebDriver.prototype.getMouseSpeed = function() {
  return this.addCommand(webdriver.CommandName.GET_MOUSE_SPEED).
      getFutureResult();
};
