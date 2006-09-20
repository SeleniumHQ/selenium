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

Selenium.prototype.real_doOpen = Selenium.prototype.doOpen;

Selenium.prototype.doOpen = function(newLocation) {
	if (newLocation) {
		if (!newLocation.match(/^\w+:\/\//)) {
			if (!this.baseURL) {
				LOG.warn("Please set Base URL before running the test.");
			}
			if (this.baseURL[this.baseURL.length - 1] == '/' && newLocation[0] == '/') {
				newLocation = this.baseURL + newLocation.substr(1);
			} else {
				newLocation = this.baseURL + newLocation;
			}
		}
	}
	return this.real_doOpen(newLocation);
};

BrowserBot.prototype.setIFrameLocation = function(iframe, location) {
	if (iframe.src) {
		iframe.src = location;
	} else {
		iframe.contentWindow.location.href = location;
	}
};

BrowserBot.prototype.getReadyState = function(windowObject, currentDocument) {
    if (currentDocument.readyState) {
        return currentDocument.readyState;
    } else {
        return null;
    }
};

Selenium.prototype.doPause = function(waitTime) {
    currentTest.pauseInterval = waitTime;
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

// In Firefox 1.5, "load" event is not fired on cached pages, so we'll use "pageshow" instead.
addLoadListener = function(element, command) {
	element.addEventListener("pageshow", command, true);
}
// use "pagehide" instead of "unload".
addUnloadListener = function(element, command) {
	element.addEventListener("pagehide", command, true);
}


function Logger() {
	var self = this;
	var levels = ["log","debug","info","warn","error"];
	
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

function stopAndDo(func, arg1, arg2) {
	if (currentTest && editor.state != 'paused') {
		LOG.debug("stopping... (state=" + editor.state + ")");
		stopping = true;
		setTimeout(func, 500, arg1, arg2);
		return false;
	}
	stopping = false;
	currentTest = null;
	testCase.debugContext.reset();
	for (var i = 0; i < testCase.commands.length; i++) {
		delete testCase.commands[i].result;
		editor.view.rowUpdated(i);
	}
	return true;
}

function createSelenium(baseURL) {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var window = wm.getMostRecentWindow('navigator:browser');
	
    var contentWindow = window.getBrowser().selectedBrowser.contentWindow;
	selenium = Selenium.createForWindow(contentWindow);
	selenium.browserbot.getCurrentPage();
	selenium.baseURL = baseURL;
    return selenium;
}

function start(baseURL) {
	if (!stopAndDo("start", baseURL)) return;
	
    selenium = createSelenium(baseURL);

	commandFactory = new CommandHandlerFactory();
	commandFactory.registerAll(selenium);

	currentTest = new TestLoop(commandFactory);
		
	currentTest.getCommandInterval = function() { return stopping ? -1 : getInterval(); }
	currentTest.nextCommand = function() {
		if (testCase.debugContext.debugIndex >= 0)
			editor.view.rowUpdated(testCase.debugContext.debugIndex);
		var command = testCase.debugContext.nextCommand();
		if (command == null) return null;
		return new SeleniumCommand(command.command, command.target, command.value);
	}
	currentTest.firstCommand = currentTest.nextCommand; // Selenium <= 0.6 only
	currentTest.commandStarted = function() {
		editor.setState("playing");
		editor.view.rowUpdated(testCase.debugContext.debugIndex);
		editor.view.scrollToRow(testCase.debugContext.debugIndex);
	}
	currentTest.commandComplete = function(result) {
		if (result.failed) {
			testCase.debugContext.currentCommand().result = 'failed';
		} else if (result.passed) {
			testCase.debugContext.currentCommand().result = 'passed';
		} else {
			testCase.debugContext.currentCommand().result = 'done';
		}
		editor.view.rowUpdated(testCase.debugContext.debugIndex);
	}
	currentTest.commandError = function() {
		LOG.debug("commandError");
		testCase.debugContext.currentCommand().result = 'failed';
		editor.view.rowUpdated(testCase.debugContext.debugIndex);
	}
    // override _testComplete to ensure testComplete is called even when
    // ensureNoUnhandledPopups throws any errors
    currentTest._testComplete = function() {
        try {
            selenium.ensureNoUnhandledPopups();
        } catch (e) {
            LOG.error(e);
        }
        this.testComplete();
    }
	currentTest.testComplete = function() {
		LOG.debug("testComplete");
		editor.setState(null);
		currentTest = null;
		testCase.debugContext.reset();
		editor.view.rowUpdated(testCase.debugContext.debugIndex);
	}
	currentTest.pause = function() {
		editor.setState("paused");
	}

	testCase.debugContext.reset();
	currentTest.start();
}

function executeCommand(baseURL, command) {
	if (!stopAndDo("executeCommand", baseURL, command)) return;

    selenium = createSelenium(baseURL);
    
	commandFactory = new CommandHandlerFactory();
	commandFactory.registerAll(selenium);
	
	currentTest = new TestLoop(commandFactory);
    
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
	currentTest.testComplete = function() {
		currentTest = null;
		testCase.debugContext.reset();
		editor.view.rowUpdated(testCase.commands.indexOf(command));
	}
	currentTest.pause = function() {
		editor.setState("paused");
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
		pageBot = PageBot.createForWindow(contentWindow);
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
