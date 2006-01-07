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

function Debugger() {
	var self = this;
	
	this.init = function() {
		if (this.runner != null) return;
		
		this.paused = false;
		this.runner = new Object();

		recorder.testCaseListeners.push(function(testCase) { self.runner.testCase = testCase; });
		this.runner.testCase = recorder.testCase;
		
		const subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
	    .getService(Components.interfaces.mozIJSSubScriptLoader);
		//subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium/selenium-logging.js', this.runner);
		subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium/selenium-api.js', this.runner);
		if (recorder.options.userExtensionsURL) {
			subScriptLoader.loadSubScript(recorder.options.userExtensionsURL, this.runner);
		}
		subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium/selenium-commandhandlers.js', this.runner);
		subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium/selenium-executionloop.js', this.runner);
		subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-runner.js', this.runner);

		this.runner.getInterval = function() {
			if (self.runner.testCase.commands[self.runner.testCase.debugIndex].breakpoint) {
				return -1;
			} else if (self.paused) {
				return -1;
			} else {
				return document.getElementById("runInterval").selectedItem.value;
			}
		}
	}
}

Debugger.prototype.start = function() {
	document.getElementById("record-button").checked = false;
	toggleRecordingEnabled(false);

	this.init();
	this.paused = false;
	this.runner.start(recorder.document.getElementById("baseURL").value);
};

Debugger.prototype.pause = function() {
	this.paused = true;
}

Debugger.prototype.doContinue = function(pause) {
	document.getElementById("record-button").checked = false;
	toggleRecordingEnabled(false);

	this.init();
	if (!pause) this.paused = false;
	if (this.runner.resume) {
		// Selenium 0.7
		this.runner.resume();
	} else {
		// Selenium 0.6
		this.runner.continueCurrentTest();
	}
};

Debugger.prototype.showElement = function(locator) {
	this.init();
	this.runner.showElement(locator);
}

seleniumDebugger = new Debugger();
