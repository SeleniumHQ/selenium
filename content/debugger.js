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

testLoop = null;

function Debugger() {
	this.runInterval = 1000;

	var self = this;

	this.initialiseTestLoop = function() {
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var window = wm.getMostRecentWindow('navigator:browser');
		var contentWindow = window.getBrowser().contentWindow;
		
		self.selenium = self.Selenium.createForFrame(window.getBrowser());
		self.selenium.browserbot.getCurrentPage();
		self.commandFactory = new self.CommandHandlerFactory();
		self.commandFactory.registerAll(self.selenium);
		self.testCase.debugIndex = -1;
		
		testLoop = new self.TestLoop(self.commandFactory);
		
		testLoop.getCommandInterval = function() { return self.runInterval; };
		testLoop.nextCommand = function() {
			if (++self.testCase.debugIndex >= self.testCase.commands.length) {
				return null;
			}
			var command = self.testCase.commands[self.testCase.debugIndex];
			return new self.SeleniumCommand(command.command, command.target, command.value);
		}
		testLoop.firstCommand = function() {
			self.testCase.debugIndex = -1;
			//testLoop.nextCommand.apply(this);
			if (++self.testCase.debugIndex >= self.testCase.commands.length) {
				return null;
			}
			var command = self.testCase.commands[self.testCase.debugIndex];
			return new self.SeleniumCommand(command.command, command.target, command.value);
		}
		testLoop.commandStarted = function() {
			recorder.view.rowUpdated(self.testCase.debugIndex);
		}
		testLoop.commandComplete = testLoop.commandStarted;
		testLoop.commandError = testLoop.commandStarted;
		testLoop.testComplete = function() {}
		testLoop.pause = function() {}
		//self.testLoop = testLoop;
	}

	this.getBaseURL = function() {
		return recorder.document.getElementById("baseURL").value;
	}
}

Debugger.prototype.start = function() {
	this.testCase = recorder.testCase;
	const subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
	    .getService(Components.interfaces.mozIJSSubScriptLoader);
	subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium/selenium-api.js', this);
	if (recorder.options.userExtensionsURL) {
		subScriptLoader.loadSubScript(recorder.options.userExtensionsURL, this);
	}
	subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-debug-patch.js', this);
	subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium/selenium-commandhandlers.js', this);
	subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium/selenium-executionloop.js', this);
	//subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium/selenium-logging.js', this);
	this.initialiseTestLoop();
	//this.testLoop.start();
	testLoop.start();
}

var seleniumDebugger = new Debugger();
