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

function Debugger(editor) {
	this.log = new Log("Debugger");
	this.editor = editor;
    this.pauseTimeout = 3000;
	var self = this;
	
	this.init = function() {
		if (this.runner != null) {
			// already initialized
			return;
		}
		
		this.log.debug("init");
        
        this.setState(Debugger.STOPPED);
        
		this.runner = new Object();
		this.runner.editor = this.editor;
        this.runner.setState = function(state) {
            self.setState(state);
        }
        this.editor.app.addObserver({
                testCaseChanged: function(testCase) {
                    self.runner.LOG.info("Changed test case");
                    self.runner.testCase = testCase;
                }
            });
		this.runner.testCase = this.editor.getTestCase();
		
		const subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
	    .getService(Components.interfaces.mozIJSSubScriptLoader);
		//subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-core/selenium-logging.js', this.runner);

		subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-core/scripts/selenium-api.js', this.runner);
		subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-api-override.js', this.runner);
		subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-core/scripts/selenium-commandhandlers.js', this.runner);
		subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-core/scripts/selenium-executionloop.js', this.runner);
		subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-core/scripts/selenium-browserbot.js', this.runner);
		subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-core/scripts/selenium-testrunner-original.js', this.runner);

		if (this.editor.getOptions().userExtensionsURL) {
			try {
				ExtensionsLoader.loadSubScript(subScriptLoader, this.editor.getOptions().userExtensionsURL, this.runner);
			} catch (error) {
				this.log.error("error loading user-extensions.js: " + error);
			}
		}
		
        var pluginProvided = SeleniumIDE.Preferences.getString("pluginProvidedUserExtensions");
        if (typeof pluginProvided != 'undefined') {
            try {
                var split_pluginProvided = pluginProvided.split(",");
                for(var sp = 0; sp < split_pluginProvided.length; sp++){
                    var js_pluginProvided = split_pluginProvided[sp].split(";");
                    ExtensionsLoader.loadSubScript(subScriptLoader, js_pluginProvided[0], this.runner);
                }
            } catch (error) {
                this.log.error("error loading plugin provided user extension: " + error);
            }
        }
		subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-runner.js', this.runner);

        this.editor.infoPanel.logView.setLog(this.runner.LOG);
        
		this.runner.getInterval = function() {
			if (self.runner.testCase.debugContext.currentCommand().breakpoint) {
                self.setState(Debugger.PAUSED);
				return -1;
			} else if (self.state == Debugger.PAUSED || self.state == Debugger.PAUSE_REQUESTED || self.stepContinue) {
                self.stepContinue = false;
                self.setState(Debugger.PAUSED);
				return -1;
			} else {
                return self.editor.getInterval();
			}
		}

        this.runner.shouldAbortCurrentCommand = function() {
            if (self.state == Debugger.PAUSE_REQUESTED) {
                if ((new Date()).getTime() >= self.pauseTimeLimit) {
                    self.setState(Debugger.PAUSED);
                    return true;
                }
            }
            return false;
        }
	}
}

Debugger.STATES = defineEnum(Debugger, ["STOPPED", "PLAYING", "PAUSE_REQUESTED", "PAUSED"]);

Debugger.prototype.setState = function(state) {
    this.log.debug("setState: state changed from " + Debugger.STATES[this.state] + " to " + Debugger.STATES[state]);
    this.state = state;
    this.notify("stateUpdated", state);
}

Debugger.prototype.getLog = function() {
    this.init();
    return this.runner.LOG;
}

Debugger.prototype.start = function(complete, useLastWindow) {
	this.editor.toggleRecordingEnabled(false);

	this.log.debug("start");

    this.init();
    var self = this;
    this.setState(Debugger.PLAYING);
	this.runner.start(this.editor.getBaseURL(), {
            testComplete: function(failed) {
                self.setState(Debugger.STOPPED);
                //self.editor.view.rowUpdated(self.runner.testCase.debugContext.debugIndex);
                if (complete) {
                    try {
                        complete(failed);
                    } catch (error) {
                        self.log.error("error at the end of test case: " + error);
                    }
                }
            }
        }, useLastWindow);
};

Debugger.prototype.executeCommand = function(command) {
	this.editor.toggleRecordingEnabled(false);

	this.init();
    if (this.state != Debugger.PLAYING && this.state != Debugger.PAUSE_REQUESTED) {
        this.runner.executeCommand(this.editor.getBaseURL(), command);
    }
};

Debugger.prototype.pause = function() {
	this.log.debug("pause");
    this.setState(Debugger.PAUSE_REQUESTED);
    this.pauseTimeLimit = (new Date()).getTime() + this.pauseTimeout; // 1 second
}

Debugger.prototype.doContinue = function(step) {
	this.editor.toggleRecordingEnabled(false);

	this.log.debug("doContinue: pause=" + step);
	this.init();
    this.stepContinue = step;
    this.setState(Debugger.PLAYING);
    this.runner.continueCurrentTest();
};

Debugger.prototype.showElement = function(locator) {
	this.init();
	this.runner.showElement(locator);
}

/*
 * Use to reload the Selenium Core API 
 * and its overrides and extensions (user-extensions file)
 */
Debugger.prototype.reInit = function(){

	this.runner = null;
	this.init();
}

observable(Debugger);
