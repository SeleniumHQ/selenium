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

function start(baseURL) {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var window = wm.getMostRecentWindow('navigator:browser');
	
	selenium = Selenium.createForFrame(window.getBrowser());
	selenium.browserbot.getCurrentPage();
	selenium.baseURL = baseURL;
	commandFactory = new CommandHandlerFactory();
	commandFactory.registerAll(selenium);
	testCase.debugContext.reset();
	for (var i = 0; i < testCase.commands.length; i++) {
		delete testCase.commands[i].result;
		recorder.view.rowUpdated(i);
	}
	
	testLoop = new TestLoop(commandFactory);
		
	testLoop.getCommandInterval = function() { return getInterval(); }
	testLoop.nextCommand = function() {
		if (testCase.debugContext.debugIndex >= 0)
			recorder.view.rowUpdated(testCase.debugContext.debugIndex);
		var command = testCase.debugContext.nextCommand();
		if (command == null) return null;
		return new SeleniumCommand(command.command, command.target, command.value);
	}
	testLoop.firstCommand = testLoop.nextCommand; // Selenium <= 0.6 only
	testLoop.commandStarted = function() {
		recorder.setState("playing");
		recorder.view.rowUpdated(testCase.debugContext.debugIndex);
		recorder.view.scrollToRow(testCase.debugContext.debugIndex);
	}
	testLoop.commandComplete = function(result) {
		if (result.failed) {
			testCase.debugContext.currentCommand().result = 'failed';
		} else if (result.passed) {
			testCase.debugContext.currentCommand().result = 'passed';
		} else {
			testCase.debugContext.currentCommand().result = 'done';
		}
		recorder.view.rowUpdated(testCase.debugContext.debugIndex);
	}
	testLoop.commandError = function() {
		testCase.debugContext.currentCommand().result = 'failed';
		recorder.view.rowUpdated(testCase.debugContext.debugIndex);
	}
	testLoop.testComplete = function() {
		recorder.setState(null);
		testLoop = null;
		testCase.debugContext.reset();
		recorder.view.rowUpdated(testCase.debugContext.debugIndex);
	}
	testLoop.pause = function() {
		recorder.setState("paused");
	}

	testCase.debugContext.reset();
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
				recorder.setTimeout(animateFlasher, timeout);
			}
		}

		recorder.setTimeout(animateFlasher, 300);

	} else {
		LOG.error("locator not found: " + locator);
	}
}
