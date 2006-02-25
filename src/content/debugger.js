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
	this.log = new Log("Debugger");
	var self = this;
	
	this.init = function() {
		if (this.runner != null) {
			// already initialized
			return;
		}
		
		this.log.debug("init");
		this.paused = false;
		this.runner = new Object();

		recorder.testCaseListeners.push(function(testCase) { self.runner.testCase = testCase; });
		this.runner.testCase = recorder.testCase;
		
		const subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
	    .getService(Components.interfaces.mozIJSSubScriptLoader);
		//subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium/selenium-logging.js', this.runner);
		subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium/selenium-api.js', this.runner);
		subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium/selenium-commandhandlers.js', this.runner);
		subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium/selenium-executionloop.js', this.runner);
		subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium/selenium-browserbot.js', this.runner);
		if (recorder.options.userExtensionsURL) {
			try {
				subScriptLoader.loadSubScript(recorder.options.userExtensionsURL, this.runner);
			} catch (error) {
				this.log.error("error loading user-extensions.js: " + error);
			}
		}
		subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-runner.js', this.runner);

		this.logFrame = new LogFrame(this.runner.LOG);

		this.runner.getInterval = function() {
			if (self.runner.testCase.debugContext.currentCommand().breakpoint) {
				self.paused = true;
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

	this.log.debug("start");

	this.init();
	this.paused = false;
	this.runner.start(recorder.document.getElementById("baseURL").value);
};

Debugger.prototype.executeCommand = function(command) {
	document.getElementById("record-button").checked = false;
	toggleRecordingEnabled(false);

	this.init();
	this.runner.executeCommand(recorder.document.getElementById("baseURL").value, command);
};

Debugger.prototype.pause = function() {
	this.log.debug("pause");
	this.paused = true;
}

Debugger.prototype.doContinue = function(pause) {
	document.getElementById("record-button").checked = false;
	toggleRecordingEnabled(false);

	this.log.debug("doContinue: pause=" + pause);
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

Debugger.prototype.clearLog = function() {
	if (this.runner)
		this.runner.LOG.clear();
}

Debugger.prototype.reloadLog = function() {
	if (this.logFrame)
		this.logFrame.reload();
}

function LogFrame(log) {
	this.log = log;
	this.log.observers.push(this);
	this.view = document.getElementById("logView");
	this.filter = document.getElementById("logFilter");
	this.viewDoc = this.view.contentDocument;
	this.logElement = this.viewDoc.getElementById("log");
}

LogFrame.prototype.onClear = function() {
	var nodes = this.logElement.childNodes;
	var i;
	for (i = nodes.length - 1; i >= 0; i--) {
		this.logElement.removeChild(nodes[i]);
	}
}

LogFrame.prototype.reload = function() {
	var self = this;
	this.onClear();
	this.log.entries.forEach(function(entry) { self.onAppendEntry(entry); });
}

LogFrame.prototype.onAppendEntry = function(entry) {
	var levels = { debug: 0, info: 1, warn: 2, error: 3 };
	var entryValue = levels[entry.level];
	var filterValue = this.filter.selectedItem.value;
	if (filterValue <= entryValue) {
		var newEntry = this.viewDoc.createElement('li');
		newEntry.className = entry.level;
		newEntry.appendChild(this.viewDoc.createTextNode(entry.line()));
		this.logElement.appendChild(newEntry);
		newEntry.scrollIntoView();
	}
}

var seleniumDebugger = new Debugger();
