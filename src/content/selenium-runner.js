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

//
// Code for running Selenium inside Selenium IDE window.
// This file should be read every time the debugger starts running the test
// using SubScript Loader.
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

testLoop = null;

function start(baseURL) {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var window = wm.getMostRecentWindow('navigator:browser');
	
	selenium = Selenium.createForFrame(window.getBrowser());
	selenium.browserbot.getCurrentPage();
	selenium.baseURL = baseURL;
	commandFactory = new CommandHandlerFactory();
	commandFactory.registerAll(selenium);
	testCase.debugIndex = -1;
	for (var i = 0; i < testCase.commands.length; i++) {
		delete testCase.commands[i].result;
		recorder.view.rowUpdated(i);
	}
	
	testLoop = new TestLoop(commandFactory);
		
	testLoop.getCommandInterval = function() { return getInterval(); }
	testLoop.nextCommand = function() {
		recorder.view.rowUpdated(testCase.debugIndex);
		if (++testCase.debugIndex >= testCase.commands.length) {
			return null;
		}
		var command = testCase.commands[testCase.debugIndex];
		return new SeleniumCommand(command.command, command.target, command.value);
	}
	testLoop.firstCommand = function() {
		testCase.debugIndex = -1;
		//testLoop.nextCommand.apply(this);
		if (++testCase.debugIndex >= testCase.commands.length) {
			return null;
		}
		var command = testCase.commands[testCase.debugIndex];
		return new SeleniumCommand(command.command, command.target, command.value);
	}
	testLoop.commandStarted = function() {
		recorder.view.rowUpdated(testCase.debugIndex);
	}
	testLoop.commandComplete = function(result) {
		if (result.failed) {
			testCase.commands[testCase.debugIndex].result = 'failed';
		} else if (result.passed) {
			testCase.commands[testCase.debugIndex].result = 'passed';
		} else {
			testCase.commands[testCase.debugIndex].result = 'done';
		}
		recorder.view.rowUpdated(testCase.debugIndex);
	}
	testLoop.commandError = function() {
		testCase.commands[testCase.debugIndex].result = 'failed';
		recorder.view.rowUpdated(testCase.debugIndex);
	}
	testLoop.testComplete = function() {
		testLoop = null;
		testCase.debugIndex = -1;
		recorder.view.rowUpdated(testCase.debugIndex);
	}
	testLoop.pause = function() {}

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
		LOG.info("bg=" + e.style['background-color']);
		e.style['background-color'] = 'red';
		LOG.info("locator found: " + locator);
	} else {
		LOG.error("locator not found: " + locator);
	}
}
