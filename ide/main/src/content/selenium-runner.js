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
                LOG.error(result.failureMessage);
                testCase.debugContext.failed = true;
                testCase.debugContext.currentCommand().result = 'failed';
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
        var msg = "Unexpected Exception: " + describe(exception, ', ');
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
		this.observers.forEach(function(o) {o.onAppendEntry(entry)});
	}

	this.clear = function() {
		this.entries.splice(0, this.entries.length);
		this.observers.forEach(function(o) {o.onClear()});
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

    selenium = createSelenium(baseURL, useLastWindow);
    selenium.browserbot.selectWindow(null);

	commandFactory = new CommandHandlerFactory();
	commandFactory.registerAll(selenium);

	currentTest = new IDETestLoop(commandFactory, handler);

	currentTest.getCommandInterval = function() {return getInterval();};
	testCase.debugContext.reset();
	currentTest.start();
    //setState(Debugger.PLAYING);
}

function executeCommand(baseURL, command) {
	//if (!stopAndDo("executeCommand", baseURL, command)) return;
    resetCurrentTest();

    selenium = createSelenium(baseURL);

	commandFactory = new CommandHandlerFactory();
	commandFactory.registerAll(selenium);

    currentTest = new IDETestLoop(commandFactory);

	currentTest.getCommandInterval = function() {return 0;};
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

            if(pattern.test(locator)) {
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
            }else {
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