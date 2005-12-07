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
	this.init = function() {
		if (this.runner != null) return;
		
		this.runner = new Object();
		this.state = 'paused';
		
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
			return document.getElementById("runInterval").selectedItem.value;
		}
	}
}

Debugger.prototype.start = function() {
	document.getElementById("enableRecording").checked = false;
	toggleRecordingEnabled(false);

	this.init();
	this.runner.start();
};

Debugger.prototype.doContinue = function() {
	document.getElementById("enableRecording").checked = false;
	toggleRecordingEnabled(false);

	this.init();
	this.runner.continueCurrentTest();
};

seleniumDebugger = new Debugger();
