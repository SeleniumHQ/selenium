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
	if (this.baseURL && newLocation) {
		if (!newLocation.match(/^\w+:\/\//)) {
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

Selenium.prototype.doPause = function(waitTime) {
    testLoop.pauseInterval = waitTime;
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

// Replace clickElement to prevent double-popup
MozillaPageBot.prototype.clickElement = function(element) {
    triggerEvent(element, 'focus', false);

    // Trigger the click event.
    triggerMouseEvent(element, 'click', true);

    if (this.windowClosed()) {
        return;
    }

    triggerEvent(element, 'blur', false);
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

testLoop = null;
stopping = false;

function stopAndDo(func, arg1, arg2) {
	if (testLoop && editor.state != 'paused') {
		LOG.debug("stopping... (state=" + editor.state + ")");
		stopping = true;
		setTimeout(func, 500, arg1, arg2);
		return false;
	}
	stopping = false;
	testLoop = null;
	testCase.debugContext.reset();
	for (var i = 0; i < testCase.commands.length; i++) {
		delete testCase.commands[i].result;
		editor.view.rowUpdated(i);
	}
	return true;
}

function start(baseURL) {
	if (!stopAndDo("start", baseURL)) return;
	
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var window = wm.getMostRecentWindow('navigator:browser');
	
	selenium = Selenium.createForFrame(window.getBrowser().selectedBrowser);
	selenium.browserbot.getCurrentPage();
	selenium.baseURL = baseURL;
	commandFactory = new CommandHandlerFactory();
	commandFactory.registerAll(selenium);

	testLoop = new TestLoop(commandFactory);
		
	testLoop.getCommandInterval = function() { return stopping ? -1 : getInterval(); }
	testLoop.nextCommand = function() {
		if (testCase.debugContext.debugIndex >= 0)
			editor.view.rowUpdated(testCase.debugContext.debugIndex);
		var command = testCase.debugContext.nextCommand();
		if (command == null) return null;
		return new SeleniumCommand(command.command, command.target, command.value);
	}
	testLoop.firstCommand = testLoop.nextCommand; // Selenium <= 0.6 only
	testLoop.commandStarted = function() {
		editor.setState("playing");
		editor.view.rowUpdated(testCase.debugContext.debugIndex);
		editor.view.scrollToRow(testCase.debugContext.debugIndex);
	}
	testLoop.commandComplete = function(result) {
		if (result.failed) {
			testCase.debugContext.currentCommand().result = 'failed';
		} else if (result.passed) {
			testCase.debugContext.currentCommand().result = 'passed';
		} else {
			testCase.debugContext.currentCommand().result = 'done';
		}
		editor.view.rowUpdated(testCase.debugContext.debugIndex);
	}
	testLoop.commandError = function() {
		LOG.debug("commandError");
		testCase.debugContext.currentCommand().result = 'failed';
		editor.view.rowUpdated(testCase.debugContext.debugIndex);
	}
	testLoop.testComplete = function() {
		LOG.debug("testComplete");
		editor.setState(null);
		testLoop = null;
		testCase.debugContext.reset();
		editor.view.rowUpdated(testCase.debugContext.debugIndex);
	}
	testLoop.pause = function() {
		editor.setState("paused");
	}

	testCase.debugContext.reset();
	testLoop.start();
}

function executeCommand(baseURL, command) {
	if (!stopAndDo("executeCommand", baseURL, command)) return;

	// TODO refactor with start()

	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var window = wm.getMostRecentWindow('navigator:browser');
	
	selenium = Selenium.createForFrame(window.getBrowser().selectedBrowser);
	selenium.browserbot.getCurrentPage();
	selenium.baseURL = baseURL;
	commandFactory = new CommandHandlerFactory();
	commandFactory.registerAll(selenium);
	
	testLoop = new TestLoop(commandFactory);
		
	testLoop.getCommandInterval = function() { return 0; }
	var first = true;
	testLoop.nextCommand = function() {
		if (first) {
			first = false;
			testCase.debugContext.debugIndex = testCase.commands.indexOf(command);
			return new SeleniumCommand(command.command, command.target, command.value);
		} else {
			return null;
		}
	}
	testLoop.firstCommand = testLoop.nextCommand; // Selenium <= 0.6 only
	testLoop.commandStarted = function() {
		editor.view.rowUpdated(testCase.commands.indexOf(command));
	}
	testLoop.commandComplete = function(result) {
		if (result.failed) {
			command.result = 'failed';
		} else if (result.passed) {
			command.result = 'passed';
		} else {
			command.result = 'done';
		}
		editor.view.rowUpdated(testCase.commands.indexOf(command));
	}
	testLoop.commandError = function() {
		command.result = 'failed';
		editor.view.rowUpdated(testCase.commands.indexOf(command));
	}
	testLoop.testComplete = function() {
		testLoop = null;
		testCase.debugContext.reset();
		editor.view.rowUpdated(testCase.commands.indexOf(command));
	}
	testLoop.pause = function() {
		editor.setState("paused");
	}

	testLoop.start();
}

function continueCurrentTest() {
	if (testLoop != null) {
		if (testLoop.resume) {
			// Selenium 0.7?
			testLoop.resume();
		} else {
			// Selenium 0.6
			testLoop.finishCommandExecution();
		}
	} else {
		LOG.error("testLoop is null");
	}
}

function showElement(locator) {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var window = wm.getMostRecentWindow('navigator:browser').getBrowser().contentWindow;
	
	var pageBot = window._test_pageBot;
	if (pageBot == null) {
		pageBot = PageBot.createForWindow(window);
		window._test_pageBot = pageBot;
	}

	var e = pageBot.findElement(locator);
	if (e) {
		//LOG.info("bg=" + e.style['background-color']);
		//e.style['background-color'] = 'red';
		//LOG.info("locator found: " + locator);

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
}
