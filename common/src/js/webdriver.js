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
goog.provide('webdriver.WebDriver.Speed');

goog.require('goog.debug.Logger');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('webdriver.By.Locator');
goog.require('webdriver.Command');
goog.require('webdriver.CommandName');
goog.require('webdriver.Response');
goog.require('webdriver.WebElement');
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
   * The logger for this instance.
   * @type {!goog.debug.Logger}
   * @private
   */
  this.logger_ = goog.debug.Logger.getLogger('webdriver.WebDriver');

  /**
   * The command processor to use for executing commands.
   * @type {Object}
   * @private
   */
  this.commandProcessor_ = commandProcessor;

  /**
   * A stack of frames for queued commands. The list of commands at index 0
   * are global commands.  When the stack has more than 1 frame, the commands
   * in the list at the top of the stack are the remaining subcommands for the
   * command at the top of the {@code pendingCommands_} stack.
   * @type {Array.<Array.<webdriver.Command>>}
   * @private
   */
  this.queuedCommands_ = [[]];

  /**
   * A list of commands that are currently being executed. The command at index
   * N+1 is a subcommand to the command at index N. It will always be the case
   * that {@code queuedCommands_.length == pendingCommands_.length + 1;}.
   * @type {Array.<webdriver.Command>}
   * @private
   */
  this.pendingCommands_ = [];

  /**
   * Whether this instance is paused. When paused, commands can still be issued,
   * but no commands will be executed.
   * @type {boolean}
   * @private
   */
  this.isPaused_ = false;

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
 * Enumeration of the supported input speeds.
 * @enum {number}
 * @see webdriver.WebDriver.prototype.setSpeed
 * @see webdriver.WebDriver.prototype.getSpeed
 */
webdriver.WebDriver.Speed = {
  SLOW: 'SLOW',
  MEDIUM: 'MEDIUM',
  FAST: 'FAST'
};


/**
 * @override
 */
webdriver.WebDriver.prototype.disposeInternal = function() {
  this.commandProcessor_.dispose();
  webdriver.timing.clearInterval(this.commandInterval_);

  goog.array.forEach(this.pendingCommands_, function(command) {
    command.dispose();
  });
  goog.array.forEach(this.queuedCommands_, function(frame) {
    goog.array.forEach(frame, function(command) {
      command.dispose();
    });
  });

  delete this.commandProcessor_;
  delete this.pendingCommands_;
  delete this.queuedCommands_;
  delete this.isPaused_;
  delete this.sessionLocked_;
  delete this.sessionId_;
  delete this.commandInterval_;

  webdriver.WebDriver.superClass_.disposeInternal.call(this);
};


/**
 * Queues a command to execute.
 * @param {webdriver.CommandName} name The name of the command to execute.
 * @return {webdriver.Command} The new command.
 * @protected
 */
webdriver.WebDriver.prototype.addCommand = function(name) {
  var command = new webdriver.Command(this, name);
  goog.array.peek(this.queuedCommands_).push(command);
  return command;
};


/**
 * @return {boolean} Whether this driver is idle (there are no pending
 *     commands).
 */
webdriver.WebDriver.prototype.isIdle = function() {
  if (this.isDisposed()) {
    return true;
  }

  // If there is a finished command on the pending command queue, but it
  // failed, then the failure hasn't been dealt with yet and the driver will
  // not process any more commands, so we consider this idle.
  var pendingCommand = goog.array.peek(this.pendingCommands_);
  if (pendingCommand && pendingCommand.isFinished() &&
      !pendingCommand.getResponse().isSuccess()) {
    return true;
  }
  return !pendingCommand && this.queuedCommands_.length == 1 &&
         !this.queuedCommands_[0].length;
};


/**
 * Aborts the specified command and all of its pending subcommands.
 * @param {webdriver.Command|webdriver.WebDriver} command The command to abort.
 * @return {number} The total number of commands aborted. A value of 0
 *     indicates that the given command was not a pending command.
 */
webdriver.WebDriver.prototype.abortCommand = function(command) {
  var index = (null == command || this == command) ? 0 :
      goog.array.findIndexRight(this.pendingCommands_, function(cmd) {
        return cmd == command;
      });
  if (index >= 0) {
    var numAborted = this.pendingCommands_.length - index;
    var totalNumAborted = numAborted;
    for (var i = 0; i < numAborted; i++) {
      this.pendingCommands_.pop().dispose();
      goog.array.forEach(this.queuedCommands_.pop(), function(subCommand) {
        totalNumAborted += 1;
        subCommand.dispose();
      });
    }
    return totalNumAborted;
  }
  return 0;
};


/**
 * Immediately pauses the driver so it will not execute anymore commands until
 * {@code #resume()} is called.
 * Dispatches a {@code webdriver.WebDriver.EventType.PAUSED} event.
 */
webdriver.WebDriver.prototype.pauseImmediately = function() {
  this.isPaused_ = true;
  this.logger_.fine('WebDriver paused');
  this.dispatchEvent(webdriver.WebDriver.EventType.PAUSED);
};


/**
 * Unpauses this driver so it can execute commands again.  Dispatches a
 * {@code webdriver.WebDriver.EventType.RESUMED} event.
 */
webdriver.WebDriver.prototype.resume = function() {
  this.isPaused_ = false;
  this.logger_.fine('WebDriver resumed');
  this.dispatchEvent(webdriver.WebDriver.EventType.RESUMED);
};


/**
 * Event handler for whenever this driver is ready to execute a command.
 * @private
 */
webdriver.WebDriver.prototype.processCommands_ = function() {
  var pendingCommand = goog.array.peek(this.pendingCommands_);
  if (this.isPaused_ || (pendingCommand && !pendingCommand.isFinished())) {
    return;
  }

  if (pendingCommand && !pendingCommand.getResponse().isSuccess()) {
    // Or should we be throwing this to be caught by window.onerror?
    this.logger_.severe(
        'Unhandled command failure; halting command processing:\n' +
        pendingCommand.getResponse().getErrorMessage());
    return;
  }

  var currentFrame = goog.array.peek(this.queuedCommands_);
  var nextCommand = currentFrame.shift();
  while (!nextCommand && this.queuedCommands_.length > 1) {
    this.queuedCommands_.pop();
    this.pendingCommands_.pop();
    currentFrame = goog.array.peek(this.queuedCommands_);
    nextCommand = currentFrame.shift();
  }

  if (nextCommand) {
    var parentTarget = goog.array.peek(this.pendingCommands_) || this;
    nextCommand.setParentEventTarget(parentTarget);
    this.pendingCommands_.push(nextCommand);
    this.queuedCommands_.push([]);
    this.commandProcessor_.execute(nextCommand);
  }
};


/**
 * @return {?string} This instance's current session ID or {@code null} if it
 *     does not have one yet.
 */
webdriver.WebDriver.prototype.getSessionId = function() {
  return this.sessionId_;
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
  var currentFrame = goog.array.peek(this.queuedCommands_);
  var previousCommand = goog.array.peek(currentFrame);
  if (!previousCommand) {
    throw new Error('No commands in the queue to expect an error from');
  }

  var failedCommand = null;
  var key = goog.events.listenOnce(previousCommand,
      webdriver.Command.ERROR_EVENT, function(e) {
        failedCommand = e.target;
        this.abortCommand(e.currentTarget);
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, /*capture phase*/true, this);

  this.callFunction(function() {
    if (null == failedCommand) {
      goog.events.unlistenByKey(key);
      throw new Error(
          (opt_errorMsg ? (opt_errorMsg + '\n') : '') +
          'Expected an error but none were raised.');
    } else if (goog.isFunction(opt_handlerFn)) {
      opt_handlerFn(failedCommand);
    }
  });
};


/**
 * Queueus a command to call the given function if and only if the previous
 * command fails. Since failed commands do not have a result, the function
 * called will not be given the return value of the previous command.
 * @param {function} fn The function to call if the previous command fails.
 * @param {Object} opt_selfObj The object in whose scope to call the function.
 * @param {*} var_args Any arguments to pass to the function.
 */
webdriver.WebDriver.prototype.ifPreviousCommandFailsCall = function(
    fn, opt_selfObj, var_args) {
  var args = arguments;
  var currentFrame = goog.array.peek(this.queuedCommands_);
  var previousCommand = goog.array.peek(currentFrame);
  if (!previousCommand) {
    throw new Error('No commands in the queue to expect an error from');
  }
  var commandFailed = false;
  var key = goog.events.listenOnce(previousCommand,
      webdriver.Command.ERROR_EVENT, function(e) {
        commandFailed = true;
        this.abortCommand(e.currentTarget);
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, /*capture phase*/true, this);
  this.callFunction(function() {
    goog.events.unlistenByKey(key);
    if (commandFailed) {
      return this.callFunction.apply(this, args);
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
  this.addCommand(webdriver.CommandName.SLEEP).setParameter('ms', ms);
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
  var frame = goog.array.peek(this.queuedCommands_);
  var previousCommand = goog.array.peek(frame);
  args.push(previousCommand ? previousCommand.getFutureResult() : null);
  return this.addCommand(webdriver.CommandName.FUNCTION).
      setParameter('function', goog.bind(fn, opt_selfObj)).
      setParameter('args', args).
      getFutureResult();
};


/**
 * Waits for a condition to be true before executing the next command. If the
 * condition does not hold after the given {@code timeout}, an error will be
 * raised.
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
 * @param {boolean} opt_waitNot (Optional) Whether to wait for the inverse of
 *     the {@code conditionFn}.
 */
webdriver.WebDriver.prototype.wait = function(conditionFn, timeout, opt_self,
                                              opt_waitNot) {
  conditionFn = goog.bind(conditionFn, opt_self);
  var waitOnInverse = !!opt_waitNot;
  var callFunction = goog.bind(this.callFunction, this);

  function pollFunction(opt_startTime, opt_future) {
    var startTime = opt_startTime || goog.now();

    function checkValue(value) {
      var pendingFuture = null;
      if (value instanceof webdriver.Future) {
        if (value.isSet()) {
          value = value.getValue();
        } else {
          pendingFuture = value;
          value = null;
        }
      }

      var done = !pendingFuture && (waitOnInverse != !!value);
      if (!done) {
        var ellapsed = goog.now() - startTime;
        if (ellapsed > timeout) {
          throw Error('Wait timed out after ' + ellapsed + 'ms');
        }
        // If we pass the pending future in as is, the AbstractCommandProcessor
        // will try to resolve it to its value. However, if we're scheduling
        // this function, it's because the future has not been set yet, which
        // will lead to an error. To avoid this, wrap up the pollFunction in an
        // anonymous function so the AbstractCommandProcessor does not
        // interfere.
        callFunction(goog.bind(pollFunction, null, startTime, pendingFuture));
      }
    }

    var result = opt_future || conditionFn();
    checkValue(result);
  }

  this.addCommand(webdriver.CommandName.WAIT).
      setParameter('function', pollFunction).
      setParameter('args', [0, null]);
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
 */
webdriver.WebDriver.prototype.waitNot = function(conditionFn, timeout,
                                                 opt_self) {
  this.wait(conditionFn, timeout, opt_self, true);
};


/**
 * Request a new session ID.
 */
webdriver.WebDriver.prototype.newSession = function() {
  this.callFunction(function() {
    this.addCommand(webdriver.CommandName.NEW_SESSION);
    this.callFunction(function(value) {
      this.sessionId_ = value;
    }, this);
  }, this);
};


/**
 * Switch the focus of future commands for this driver to the window with the
 * given name.
 * @param {string|webdriver.Future} name The name of the window to transfer
 *     control to.  Alternatively, the UUID of a window handle, returned by
 *     {@code #getWindowHandle()} or {@code #getAllWindowHandles()}.
 */
webdriver.WebDriver.prototype.switchToWindow = function(name) {
  this.callFunction(function() {
    this.addCommand(webdriver.CommandName.SWITCH_TO_WINDOW).
        setParameter('name', name);
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
  this.callFunction(function() {
    this.addCommand(webdriver.CommandName.SWITCH_TO_FRAME).
        setParameter('id', frame);
  }, this);
};


/**
 * Selects either the first frame on the page, or the main document when a page
 * contains iframes.
 */
webdriver.WebDriver.prototype.switchToDefaultContent = function() {
  return this.switchToFrame(null);
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
 * @return {*} The converted value.
 * @see {webdriver.WebDriver.prototype.executeScript}
 * @private
 */
webdriver.WebDriver.wrapScriptArgument_ = function(arg) {
  if (arg instanceof webdriver.WebElement) {
    return {'ELEMENT': arg.getId()};
  } else if (arg == null || !goog.isDef(arg)) {
    return null;
  } else if (goog.isBoolean(arg) ||
             goog.isNumber(arg) ||
             goog.isString(arg)) {
    return arg;
  } else if (goog.isArray(arg)) {
    return goog.array.map(arg, webdriver.WebDriver.wrapScriptArgument_);
  } else if (goog.isFunction(arg)) {
    throw new Error('Invalid script argument type: ' + goog.typeOf(arg));
  } else {
    return goog.object.map(arg, webdriver.WebDriver.wrapScriptArgument_);
  }
};


/**
 * Helper function for unwrapping an executeScript result.
 * @param {{type:string,value:*}|Array.<{type:string,value:*}>} result The
 *     result to unwrap.
 * @return {*} The unwrapped result.
 * @private
 */
webdriver.WebDriver.prototype.unwrapScriptResult_ = function(result) {
  if (goog.isArray(result)) {
    return goog.array.map(result, goog.bind(this.unwrapScriptResult_, this));
  }

  if (result != null && goog.isObject(result) && 'ELEMENT' in result) {
    var element = new webdriver.WebElement(this);
    element.getId().setValue(result['ELEMENT']);
    return element;
  }

  return result;
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
  return this.callFunction(function() {
    this.addCommand(webdriver.CommandName.EXECUTE_SCRIPT).
        setParameter("script", script).
        setParameter("args", args);
    return this.callFunction(function(prevResult) {
      return this.unwrapScriptResult_(prevResult);
    }, this);
  }, this);
};


/**
 * Adds a command to fetch the given URL.
 * @param {goog.Uri|string} url The URL to fetch.
 */
webdriver.WebDriver.prototype.get = function(url) {
  this.callFunction(function() {
    this.addCommand(webdriver.CommandName.GET).
        setParameter('url', url.toString());
  }, this);
};


/**
 * Navigate backwards in the current browser window's history.
 */
webdriver.WebDriver.prototype.back = function() {
  this.addCommand(webdriver.CommandName.GO_BACK);
};


/**
 * Navigate forwards in the current browser window's history.
 */
webdriver.WebDriver.prototype.forward = function() {
  this.addCommand(webdriver.CommandName.GO_FORWARD);
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
  var webElement = new webdriver.WebElement(this);
  var locator = webdriver.By.Locator.checkLocator(by);
  this.callFunction(function() {
    var command = this.addCommand(webdriver.CommandName.FIND_ELEMENT).
        setParameter("using", locator.type).
        setParameter("value", locator.target);
    this.callFunction(function(id) {
      webElement.getId().setValue(id['ELEMENT']);
    });
  }, this);
  return webElement;
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
  var locator = webdriver.By.Locator.checkLocator(by);
  return this.callFunction(function() {
    var findCommand = this.addCommand(webdriver.CommandName.FIND_ELEMENT).
        setParameter("using", locator.type).
        setParameter("value", locator.target);
    var commandFailed = false;
    var key = goog.events.listenOnce(findCommand,
        webdriver.Command.ERROR_EVENT, function(e) {
          commandFailed = true;
          this.abortCommand(e.currentTarget);
          e.preventDefault();
          e.stopPropagation();
          return false;
        }, /*capture phase*/true, this);
    return this.callFunction(function() {
      goog.events.unlistenByKey(key);
      return !commandFailed;
    });
  }, this);
};



/**
 * Search for multiple elements on the current page. The result of this
 * operation can be accessed from the last saved {@code webdriver.Response}
 * object:
 * driver.findElements({xpath: '//div'});
 * driver.callFunction(function(value) {
 *   value[0].click();
 *   value[1].click();
 *   // etc.
 * });
 * @param {webdriver.By.Locator|{*: string}} by The locator to use for finding
 *     the element, or a short-hand object that can be converted into a locator.
 * @see webdriver.By.Locator.createFromObj
 */
webdriver.WebDriver.prototype.findElements = function(by) {
  var locator = webdriver.By.Locator.checkLocator(by);
  return this.callFunction(function() {
    this.addCommand(webdriver.CommandName.FIND_ELEMENTS).
        setParameter("using", locator.type).
        setParameter("value", locator.target);
    return this.callFunction(function(ids) {
      var elements = [];
      for (var i = 0; i < ids.length; i++) {
        if (ids[i]) {
          var element = new webdriver.WebElement(this);
          element.getId().setValue(ids[i]['ELEMENT']);
          elements.push(element);
        }
      }
      return elements;
    }, this);
  }, this);
};


/**
 * Adjust the speed of user input.
 * @param {webdriver.WebDriver.Speed} speed The new speed setting.
 */
webdriver.WebDriver.prototype.setSpeed = function(speed) {
  this.addCommand(webdriver.CommandName.SET_SPEED).
      setParameter("speed", speed);
};


/**
 * Fetch the current user input speed.
 * @return {webdriver.Future} A Future whose value will be set by this driver
 *     when the query command completes.
 */
webdriver.WebDriver.prototype.getSpeed = function() {
  return this.addCommand(webdriver.CommandName.GET_SPEED).
      getFutureResult();
};
