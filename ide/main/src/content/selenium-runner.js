/*
 * Copyright 2005 Shinya Kasatani
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Code for running Selenium inside Selenium IDE window.
 * This file should be read by the debugger using SubScript Loader.
 */

//
// Patches for Selenium functions
//

MozillaBrowserBot.prototype.__defineGetter__("baseUrl", function() {
  if (!this._baseUrl) {
    LOG.warn("Base URL is not set. Updating base URL from current window.");
    this._baseUrl = editor.getPathAndUpdateBaseURL(this.browserbot.getCurrentWindow())[1];
  }
  return this._baseUrl;
});

MozillaBrowserBot.prototype.__defineSetter__("baseUrl", function(baseUrl) {
  this._baseUrl = baseUrl;
});

MozillaBrowserBot.prototype.setIFrameLocation = function(iframe, location) {
  if (iframe.src) {
    iframe.src = location;
  } else {
    iframe.contentWindow.location.href = location;
  }
};

MozillaBrowserBot.prototype.getReadyState = function(windowObject, currentDocument) {
  var doc = currentDocument;
  if (doc.wrappedJSObject) {
    // document may be wrapped with XPCNativeWrapper, which doesn't allow access to readyState property
    doc = doc.wrappedJSObject;
  }
  if (doc.readyState) {
    return doc.readyState;
  } else {
    return null;
  }
};

MozillaBrowserBot.prototype.modifyWindowToRecordPopUpDialogs = function(windowToModify, browserBot) {
  if (windowToModify.wrappedJSObject) {
    windowToModify = windowToModify.wrappedJSObject;
  }
  return BrowserBot.prototype.modifyWindowToRecordPopUpDialogs.call(this, windowToModify, browserBot);
};

//Samit: Fix: Fixing the Alerts not working in Selenium IDE v1.0.11/12
MozillaBrowserBot.prototype.windowNeedsModifying = function(win, uniqueId) {
  if (!win[uniqueId]) {
    win[uniqueId] = 1;
    return true;
  }
  return false;
};

Selenium.prototype.doPause = function(waitTime) {
  currentTest.pauseInterval = waitTime;
};

Selenium.prototype.doEcho = function(message) {
  LOG.info("echo: " + message);
};

Selenium.prototype.doSetSpeed = function(speed) {
  var milliseconds = parseInt(speed);
  if (milliseconds < 0) milliseconds = 0;
  editor.setInterval(milliseconds);
};

Selenium.prototype.getSpeed = function() {
  return editor.getInterval();
};

// doStore* methods are copied from selenium-testrunner.js
Selenium.prototype.doStoreText = function(target, varName) {
  var element = this.page().findElement(target);
  storedVars[varName] = getText(element);
};

Selenium.prototype.doStoreAttribute = function(target, varName) {
  storedVars[varName] = this.page().findAttribute(target);
};

Selenium.prototype.doStore = function(value, varName) {
  storedVars[varName] = value;
};

storedVars.nbsp = String.fromCharCode(160);
storedVars.space = ' ';

function build_sendkeys_maps() {

//  add_sendkeys_key("NULL", '\uE000');
//  add_sendkeys_key("CANCEL", '\uE001'); // ^break
//  add_sendkeys_key("HELP", '\uE002');
  add_sendkeys_key("BACKSPACE", '\uE003', "BKSP");
  add_sendkeys_key("TAB", '\uE004');
//  add_sendkeys_key("CLEAR", '\uE005');
//  add_sendkeys_key("RETURN", '\uE006');
  add_sendkeys_key("ENTER", '\uE007');
  add_sendkeys_key("SHIFT", '\uE008');
  add_sendkeys_key("CONTROL", '\uE009', "CTRL");
  add_sendkeys_key("ALT", '\uE00A');
  add_sendkeys_key("PAUSE", '\uE00B');
  add_sendkeys_key("ESC", '\uE00C', "ESCAPE");
  add_sendkeys_key("SPACE", '\uE00D');
  add_sendkeys_key("PAGE_UP", '\uE00E', "PGUP");
  add_sendkeys_key("PAGE_DOWN", '\uE00F', "PGDN");
  add_sendkeys_key("END", '\uE010');
  add_sendkeys_key("HOME", '\uE011');
  add_sendkeys_key("LEFT", '\uE012');
  add_sendkeys_key("UP", '\uE013');
  add_sendkeys_key("RIGHT", '\uE014');
  add_sendkeys_key("DOWN", '\uE015');
  add_sendkeys_key("INSERT", '\uE016', "INS");
  add_sendkeys_key("DELETE", '\uE017', "DEL");
  add_sendkeys_key("SEMICOLON", '\uE018');
  add_sendkeys_key("EQUALS", '\uE019');

  add_sendkeys_key("NUMPAD0", '\uE01A', "N0", "NUM_ZERO");  // number pad keys
  add_sendkeys_key("NUMPAD1", '\uE01B', "N1", "NUM_ONE");
  add_sendkeys_key("NUMPAD2", '\uE01C', "N2", "NUM_TWO");
  add_sendkeys_key("NUMPAD3", '\uE01D', "N3", "NUM_THREE");
  add_sendkeys_key("NUMPAD4", '\uE01E', "N4", "NUM_FOUR");
  add_sendkeys_key("NUMPAD5", '\uE01F', "N5", "NUM_FIVE");
  add_sendkeys_key("NUMPAD6", '\uE020', "N6", "NUM_SIX");
  add_sendkeys_key("NUMPAD7", '\uE021', "N7", "NUM_SEVEN");
  add_sendkeys_key("NUMPAD8", '\uE022', "N8", "NUM_EIGHT");
  add_sendkeys_key("NUMPAD9", '\uE023', "N9", "NUM_NINE");
  add_sendkeys_key("MULTIPLY", '\uE024', "MUL", "NUM_MULTIPLY");
  add_sendkeys_key("ADD", '\uE025', "PLUS", "NUM_PLUS");
  add_sendkeys_key("SEPARATOR", '\uE026', "SEP");
  add_sendkeys_key("SUBTRACT", '\uE027', "MINUS", "NUM_MINUS");
  add_sendkeys_key("DECIMAL", '\uE028', "PERIOD", "NUM_PERIOD");
  add_sendkeys_key("DIVIDE", '\uE029', "DIV", "NUM_DIVISION");

  add_sendkeys_key("F1", '\uE031');  // function keys
  add_sendkeys_key("F2", '\uE032');
  add_sendkeys_key("F3", '\uE033');
  add_sendkeys_key("F4", '\uE034');
  add_sendkeys_key("F5", '\uE035');
  add_sendkeys_key("F6", '\uE036');
  add_sendkeys_key("F7", '\uE037');
  add_sendkeys_key("F8", '\uE038');
  add_sendkeys_key("F9", '\uE039');
  add_sendkeys_key("F10", '\uE03A');
  add_sendkeys_key("F11", '\uE03B');
  add_sendkeys_key("F12", '\uE03C');

  add_sendkeys_key("META", '\uE03D', "COMMAND");

}

function add_sendkeys_key(key, unicodeChar, alias, botKey) {
  botKey = botKey || key;
  if (bot.Keyboard.Keys[botKey]) {
    storedVars['KEY_' + key] = unicodeChar;
    if (alias) {
      storedVars['KEY_' + alias] = unicodeChar;
    }
    return true;
  }
  return false;
}

build_sendkeys_maps();

var IDETestLoop = classCreate();
objectExtend(IDETestLoop.prototype, TestLoop.prototype);
objectExtend(IDETestLoop.prototype, {
  start : function() {
    selenium.reset();
    selenium.doSetTimeout(editor.app.getOptions().timeout);
    LOG.debug("currentTest.start()");
    this.continueTest();
  },

  initialize: function(commandFactory, handler) {
    TestLoop.call(this, commandFactory);
    this.handler = handler;
  },

  continueTestWhenConditionIsTrue: function() {
    if (shouldAbortCurrentCommand()) {
      this.result = {};
      this.result.failed = true;
      this.result.failureMessage = "interrupted";
      this.commandComplete(this.result);
      this.continueTest();
    } else {
      TestLoop.prototype.continueTestWhenConditionIsTrue.call(this);
    }
  },

  nextCommand: function() {
    if (testCase.debugContext.debugIndex >= 0)
      editor.view.rowUpdated(testCase.debugContext.debugIndex);
    var command = testCase.debugContext.nextCommand();
    if (command == null) return null;
    return new SeleniumCommand(command.command, command.target, command.value);
  },

  commandStarted: function() {
    // editor.setState("playing");
    //setState(Debugger.PLAYING);
    editor.view.rowUpdated(testCase.debugContext.debugIndex);
    editor.view.scrollToRow(testCase.debugContext.debugIndex);
  },

  commandComplete: function(result) {
    this._checkExpectedFailure(result);
    if (result.failed) {
      //TODO Samit: Remove this workaround and try to connect to selenium server before starting test
      if (result.failureMessage.t && result.failureMessage.t === 'RemoteConnectError') {
        result.failureMessage = result.failureMessage.m;  //unwrap message
        setState(Debugger.PAUSED);
      }
      LOG.error(result.failureMessage);
      testCase.debugContext.failed = true;
      testCase.debugContext.currentCommand().result = 'failed';
      testCase.debugContext.currentCommand().failureMessage = result.failureMessage;
    } else if (result.passed) {
      testCase.debugContext.currentCommand().result = 'passed';
    } else {
      testCase.debugContext.currentCommand().result = 'done';
    }
    editor.view.rowUpdated(testCase.debugContext.debugIndex);
  },

  commandError: function(errorMessage) {
    var tempResult = {};
    tempResult.passed = false;
    tempResult.failed = true;
    tempResult.error = true;
    tempResult.failureMessage = errorMessage;
    this._checkExpectedFailure(tempResult);
    if (!tempResult.passed) {
      LOG.debug("commandError");
      testCase.debugContext.failed = true;
      testCase.debugContext.currentCommand().result = 'failed';
      testCase.debugContext.currentCommand().failureMessage = errorMessage;
      editor.view.rowUpdated(testCase.debugContext.debugIndex);
    }
  },

  // override _testComplete to ensure testComplete is called even when
  // ensureNoUnhandledPopups throws any errors
  _testComplete: function() {
    try {
      selenium.ensureNoUnhandledPopups();
    } catch (e) {
      LOG.error(e);
    }
    this.testComplete();
  },

  testComplete: function() {
    LOG.debug("testComplete: failed=" + testCase.debugContext.failed);
    currentTest = null;
    //editor.setState(null);
    //editor.view.rowUpdated(testCase.debugContext.debugIndex);
    var failed = testCase.debugContext.failed;
    testCase.debugContext.reset();
    if (this.handler && this.handler.testComplete) this.handler.testComplete(failed);
  },

  // overide _executeCurrentCommand so we can collect stats of the commands executed
  _executeCurrentCommand : function() {
    /**
     * Execute the current command.
     *
     * @return a function which will be used to determine when
     * execution can continue, or null if we can continue immediately
     */
    var command = this.currentCommand;
    LOG.info("Executing: |" + command.command + " | " + command.target + " | " + command.value + " |");

    var handler = this.commandFactory.getCommandHandler(command.command);
    if (handler == null) {
      throw new SeleniumError("Unknown command: '" + command.command + "'");
    }

    command.target = selenium.preprocessParameter(command.target);
    command.value = selenium.preprocessParameter(command.value);
    LOG.debug("Command found, going to execute " + command.command);
    updateStats(command.command);
    this.result = handler.execute(selenium, command);
    this.waitForCondition = this.result.terminationCondition;
  },

  pause: function() {
    // editor.setState("paused");
    setState(Debugger.PAUSED);
  },

  _checkExpectedFailure: HtmlRunnerTestLoop.prototype._checkExpectedFailure
});

function Logger() {
  var self = this;
  var levels = ["log","debug","info","warn","error"];
  this.maxEntries = 2000;
  this.entries = [];

  levels.forEach(function(level) {
    self[level] = function(message) {
      self.log(message, level);
    }
  });

  this.observers = [];

  this.exception = function(exception) {
    var msg = "Unexpected Exception: " + exception + ". " + describe(exception, ', ');
    this.error(msg);
  }

  this.log = function(message, level) {
    var entry = {
      message: message,
      level: level,
      line: function() {
        return '[' + this.level + '] ' + message + "\n";
      }
    };
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) this.entries.shift();
    this.observers.forEach(function(o) {
      o.onAppendEntry(entry)
    });
  }

  this.clear = function() {
    this.entries.splice(0, this.entries.length);
    this.observers.forEach(function(o) {
      o.onClear()
    });
  }
}

var LOG = new Logger();

//
// runner functions
//

this.currentTest = null;
this.stopping = false;

function resetCurrentTest() {
  currentTest = null;
  testCase.debugContext.reset();
  for (var i = 0; i < testCase.commands.length; i++) {
    delete testCase.commands[i].result;
    editor.view.rowUpdated(i);
  }
}

function createSelenium(baseURL, useLastWindow) {
  var window;
  if (useLastWindow) {
    window = this.lastWindow;
  }
  if (!window) {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    window = wm.getMostRecentWindow('navigator:browser');
  }

  this.lastWindow = window;

  var contentWindow = window.getBrowser().selectedBrowser.contentWindow;
  var selenium = Selenium.createForWindow(contentWindow);
  selenium.browserbot.getCurrentPage();
  selenium.browserbot.baseUrl = baseURL;
  return selenium;
}

function start(baseURL, handler, useLastWindow) {
  //if (!stopAndDo("start", baseURL)) return;
  resetCurrentTest();
  //Samit: use the web driver backed selenium
  if (this.executeUsingWebDriver) {
    var webDriverBrowserString = this.editor.getOptions().webDriverBrowserString;
    var reuseBrowser = this.editor.getOptions().webDriverReuseWindow;
    var server = this.editor.getOptions().webDriverServer;
    selenium = new WebdriverBackedSelenium(baseURL, useLastWindow, webDriverBrowserString, reuseBrowser, server);
  } else {
    selenium = createSelenium(baseURL, useLastWindow);
    selenium.browserbot.selectWindow(null);
  }

  commandFactory = new CommandHandlerFactory();
  commandFactory.registerAll(selenium);

  currentTest = new IDETestLoop(commandFactory, handler);

  currentTest.getCommandInterval = function() {
    return getInterval();
  };
  testCase.debugContext.reset();
  currentTest.start();
  //setState(Debugger.PLAYING);
}

function closeSession() {
  //Samit: If we are using the web driver backed selenium, close the session
  if (this.executeUsingWebDriver && WebdriverBackedSelenium && WebdriverBackedSelenium.closeWebdriverSession) {
    WebdriverBackedSelenium.closeWebdriverSession();
  }
}

function executeCommand(baseURL, command) {
  //if (!stopAndDo("executeCommand", baseURL, command)) return;
  resetCurrentTest();

  //Samit: use the web driver backed selenium
  if (this.executeUsingWebDriver) {
    var webDriverBrowserString = this.editor.getOptions().webDriverBrowserString;
    selenium = new WebdriverBackedSelenium(baseURL, webDriverBrowserString);
  } else {
    selenium = createSelenium(baseURL);
  }

  commandFactory = new CommandHandlerFactory();
  commandFactory.registerAll(selenium);

  currentTest = new IDETestLoop(commandFactory);

  currentTest.getCommandInterval = function() {
    return 0;
  };
  var first = true;
  currentTest.nextCommand = function() {
    if (first) {
      first = false;
      testCase.debugContext.debugIndex = testCase.commands.indexOf(command);
      return new SeleniumCommand(command.command, command.target, command.value);
    } else {
      return null;
    }
  }
  currentTest.firstCommand = currentTest.nextCommand; // Selenium <= 0.6 only
  currentTest.commandStarted = function() {
    editor.view.rowUpdated(testCase.commands.indexOf(command));
  }
  currentTest.commandComplete = function(result) {
    if (result.failed) {
      command.result = 'failed';
    } else if (result.passed) {
      command.result = 'passed';
    } else {
      command.result = 'done';
    }
    editor.view.rowUpdated(testCase.commands.indexOf(command));
  }
  currentTest.commandError = function() {
    command.result = 'failed';
    editor.view.rowUpdated(testCase.commands.indexOf(command));
  }

  currentTest.start();
}

function continueCurrentTest() {
  if (currentTest != null) {
    if (currentTest.resume) {
      // Selenium 0.7?
      currentTest.resume();
    } else {
      // Selenium 0.6
      currentTest.finishCommandExecution();
    }
  } else {
    LOG.error("currentTest is null");
  }
}

//Samit: Enh: Determine is we are running under Firefox 4 or under mac, so we can fallback on the Selenium Core to do the show
var useHighlightFromCore_ = (function() {
  try {
    var appInfo = Components.classes['@mozilla.org/xre/app-info;1'].
        getService(Components.interfaces.nsIXULAppInfo);
    var versionChecker = Components.classes['@mozilla.org/xpcom/version-comparator;1'].
        getService(Components.interfaces.nsIVersionComparator);

    return (versionChecker.compare(appInfo.version, '4.0') >= 0);
  } catch(e) {
    return false;
  }
})() || (navigator.appVersion.indexOf("Mac") != -1);

function showElement(locator) {
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var contentWindow = wm.getMostRecentWindow('navigator:browser').getBrowser().contentWindow;
	var selenium = Selenium.createForWindow(contentWindow);
	locator = selenium.preprocessParameter(locator);

  //var pageBot = contentWindow._test_pageBot;
  //if (pageBot == null) {
  var pageBot = new MozillaBrowserBot(contentWindow);
  pageBot.getCurrentWindow = function() {
    return contentWindow;
  }
  //contentWindow._test_pageBot = pageBot;
  //}

  try {
    try {
      var e = pageBot.findElement(locator);
    } catch (error) {   // Samit: Fix: Table locators in the form "tableName.row.column" fail
      // Retry if the locator matches "tableName.row.column", e.g. "mytable.3.4"
      var pattern = /(.*)\.(\d+)\.(\d+)/;

      if (pattern.test(locator)) {
        var pieces = locator.match(pattern);
        // if there is an exception the outer try will catch it
        var table = pageBot.findElement(pieces[1]);
        e = table.rows[pieces[2]].cells[pieces[3]];
      }
    }
    if (e) {
      /* Samit: Since Firefox 4 broke the flasher, simply use the now enhanced version of the highlight from Selenium Core */
      if (useHighlightFromCore_) {
        //Samit: Enh: Provide this functionality on Macs by using the builtin highlight function since flasher component is not supported on Mac
        // see the dom inspector bug for more info - https://bugzilla.mozilla.org/show_bug.cgi?id=368608
        e.scrollIntoView();
        highlight(e);
      } else {
        var flasher = Components.classes["@mozilla.org/inspector/flasher;1"].createInstance()
            .QueryInterface(Components.interfaces.inIFlasher);
        flasher.color = "#88ff88";
        flasher.thickness = 2;
        flasher.invert = false;

        flasher.scrollElementIntoView(e);
        flasher.drawElementOutline(e);

        var flashIndex = 0;

        function animateFlasher() {
          var timeout = 0;
          if (flashIndex % 2 == 0) {
            flasher.repaintElement(e);
            timeout = 300;
          } else {
            flasher.drawElementOutline(e);
            timeout = 300;
          }
          flashIndex++;
          if (flashIndex < 3) {
            setTimeout(animateFlasher, timeout);
          }
        }

        setTimeout(animateFlasher, 300);
      }
    } else {
      LOG.error("locator not found: " + locator);
    }
  } catch (error) {
    LOG.error("locator not found: " + locator + ", error = " + error);
  }
}