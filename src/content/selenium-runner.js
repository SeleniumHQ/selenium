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
    if (currentDocument.readyState) {
        return currentDocument.readyState;
    } else {
        return null;
    }
};

Selenium.prototype.doPause = function(waitTime) {
    currentTest.pauseInterval = waitTime;
};

Selenium.prototype.doEcho = function(message) {
    LOG.info("echo: " + message);
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

var IDETestLoop = classCreate();
objectExtend(IDETestLoop.prototype, TestLoop.prototype);
objectExtend(IDETestLoop.prototype, {
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
            updateLastURL();
            // editor.setState("playing");
            //setState(Debugger.PLAYING);
            LOG.info("commandStarted");
            editor.view.rowUpdated(testCase.debugContext.debugIndex);
            editor.view.scrollToRow(testCase.debugContext.debugIndex);
        },
        
        commandComplete: function(result) {
            updateLastURL(1);
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
            LOG.debug("testComplete");
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
		this.observers.forEach(function(o) { o.onAppendEntry(entry) });
	}

	this.clear = function() {
		this.entries.splice(0, this.entries.length);
		this.observers.forEach(function(o) { o.onClear() });
	}
}

var LOG = new Logger();

//
// runner functions
//

currentTest = null;
stopping = false;

function resetCurrentTest() {
	currentTest = null;
	testCase.debugContext.reset();
	for (var i = 0; i < testCase.commands.length; i++) {
		delete testCase.commands[i].result;
		editor.view.rowUpdated(i);
	}
}

function createSelenium(baseURL) {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var window = wm.getMostRecentWindow('navigator:browser');
	
    var contentWindow = window.getBrowser().selectedBrowser.contentWindow;
	var selenium = Selenium.createForWindow(contentWindow);
	selenium.browserbot.getCurrentPage();
	selenium.browserbot.baseUrl = baseURL;
    return selenium;
}

function start(baseURL, handler) {
	//if (!stopAndDo("start", baseURL)) return;
    resetCurrentTest();
	
    selenium = createSelenium(baseURL);

	commandFactory = new CommandHandlerFactory();
	commandFactory.registerAll(selenium);

	currentTest = new IDETestLoop(commandFactory, handler);
		
	currentTest.getCommandInterval = function() { return getInterval(); }
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
    
	currentTest.getCommandInterval = function() { return 0; }
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
        updateLastURL();
		editor.view.rowUpdated(i);
	}
	currentTest.commandComplete = function(result) {
        updateLastURL(1);
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

function showElement(locator) {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var contentWindow = wm.getMostRecentWindow('navigator:browser').getBrowser().contentWindow;
	
	var pageBot = contentWindow._test_pageBot;
	if (pageBot == null) {
		pageBot = new MozillaBrowserBot(contentWindow);
        pageBot.getCurrentWindow = function() {
            return contentWindow;
        }
		contentWindow._test_pageBot = pageBot;
	}

    try {
        var e = pageBot.findElement(locator);
        if (e) {
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
            
        } else {
            LOG.error("locator not found: " + locator);
        }
    } catch (error) {
        LOG.error("locator not found: " + locator + ", error = " + error);
    }
}

/**
 * Updates the lastURL attribute of a command as attached to the editor object.
 * This is used to populate the locator dropdown. This is typically done either
 * for the current command before its execution, or for the subsequent command
 * after current command execution. This function probably shouldn't be used
 * outside of the context of the runner, as both the debugContext and selenium
 * objects need to be available.
 *
 * @param commandOffset  the offset of the command to update relative to the
 *                       current command, according to the debug context
 */
function updateLastURL(commandOffset)
{
    var i = testCase.debugContext.debugIndex
        + (arguments.length < 1 ? 0 : commandOffset);
    LOG.debug('Updating commands[' + i + '].lastURL');
    try {
        var doc = selenium.browserbot.getCurrentWindow().document;
        editor.getTestCase().commands[i].lastURL = doc.location.href;
    }
    catch (e) {
        LOG.info('Failed updating commands[' + i + '].lastURL');
    }
}
