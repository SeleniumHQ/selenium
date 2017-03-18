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

  this.init = function () {
    if (this.runner != null) {
      // already initialized
      return;
    }

    this.log.debug("init");
    this.editor.health.addEvent('debugger', 'initializing');

    this.setState(Debugger.STOPPED);

    this.runner = new Object();
    this.runner.editor = this.editor;
    var executeUsingWebDriver = this.editor.app.getBooleanOption('executeUsingWebDriver');
    this.runner.executeUsingWebDriver = executeUsingWebDriver;
    this.runner.setState = function (state) {
      self.setState(state);
    };
    this.editor.app.addObserver({
      testCaseChanged:function (testCase) {
        self.runner.testCase = testCase;
      }
    });
    this.runner.testCase = this.editor.getTestCase();
    this.runner.updateStats = function (command) {
      editor.health.increaseCounter('commands', command);
    };

    const subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
    //subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-core/selenium-logging.js', this.runner);

    subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-core/scripts/selenium-api.js', this.runner);
    subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-api-override.js', this.runner);
    if (executeUsingWebDriver) {
      subScriptLoader.loadSubScript('chrome://selenium-ide/content/remote-selenium-commandhandlers.js', this.runner);
    } else {
      subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-core/scripts/selenium-commandhandlers.js', this.runner);
    }
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

    var pluginManager = editor.pluginManager;
    pluginManager.getEnabledUserExtensions().forEach(function (plugin) {
      for (var i = 0; i < plugin.code.length; i++) {
        try {
          var js_pluginProvided = plugin.code[i].split(";");
          if (!(js_pluginProvided.length >= 2 && js_pluginProvided[2] == "1")) {
            // Load the user extensions that cannot handle webdriver playback here
            ExtensionsLoader.loadSubScript(subScriptLoader, js_pluginProvided[0], self.runner);
          }
        } catch (error) {
          pluginManager.setPluginError(plugin.id, plugin.code[i], error);
          break;
        }
      }
    });

    if (executeUsingWebDriver) {
      subScriptLoader.loadSubScript('chrome://selenium-ide/content/webdriver-backed-selenium.js', this.runner);
    }
    pluginManager.getEnabledUserExtensions().forEach(function (plugin) {
      for (var i = 0; i < plugin.code.length; i++) {
        try {
          var js_pluginProvided = plugin.code[i].split(";");
          if (js_pluginProvided.length >= 2 && js_pluginProvided[2] == "1") {
            // User extensions that can handle webdriver playback are loaded here, so that they can access webdriver
            // playback stuff
            ExtensionsLoader.loadSubScript(subScriptLoader, js_pluginProvided[0], self.runner);
          }
        } catch (error) {
          pluginManager.setPluginError(plugin.id, plugin.code[i], error);
          break;
        }
      }
    });
    subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-runner.js', this.runner);

    this.editor.infoPanel.logView.setLog(this.runner.LOG);

    this.runner.getInterval = function () {
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
    };

    this.runner.shouldAbortCurrentCommand = function () {
      if (self.state == Debugger.PAUSE_REQUESTED) {
        if ((new Date()).getTime() >= self.pauseTimeLimit) {
          self.setState(Debugger.PAUSED);
          return true;
        }
      }
      return false;
    };
    this.editor.health.addEvent('debugger', 'initialized');
  }
}

Debugger.STATES = defineEnum(Debugger, ["STOPPED", "PLAYING", "PAUSE_REQUESTED", "PAUSED"]);

Debugger.prototype.setState = function (state) {
  this.log.debug("setState: state changed from " + Debugger.STATES[this.state] + " to " + Debugger.STATES[state]);
  this.state = state;
  this.notify("stateUpdated", state);
};

Debugger.prototype.getLog = function () {
  this.init();
  return this.runner.LOG;
};

Debugger.prototype.start = function (complete, useLastWindow) {
  this.log.debug("start");
  this.editor.toggleRecordingEnabled(false);
  this.init();
  var self = this;
  this.setState(Debugger.PLAYING);
  this.runner.start(this.editor.getBaseURL(), {
    testComplete:function (failed) {
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

Debugger.prototype.executeCommand = function (command) {
  this.editor.toggleRecordingEnabled(false);
  this.init();
  if (this.state != Debugger.PLAYING && this.state != Debugger.PAUSE_REQUESTED) {
    this.runner.executeCommand(this.editor.getBaseURL(), command);
  }
};

Debugger.prototype.pause = function () {
  this.log.debug("pause");
  this.setState(Debugger.PAUSE_REQUESTED);
  this.pauseTimeLimit = (new Date()).getTime() + this.pauseTimeout; // 1 second
};

Debugger.prototype.doContinue = function (step) {
  this.log.debug("doContinue: pause=" + step);
  this.editor.toggleRecordingEnabled(false);
  this.init();
  this.stepContinue = step;
  this.setState(Debugger.PLAYING);
  this.runner.continueCurrentTest();
};

Debugger.prototype.closeWebDriverSession = function () {
  this.init();
  this.runner.closeSession();
};

Debugger.prototype.showElement = function (locator) {
  this.init();
  this.runner.showElement(locator);
};

Debugger.prototype.selectElement = function () {
  this.init();
  var button = document.getElementById("selectElementButton");
  var help = document.getElementById("selectElementTip");
  if (this.targetSelecter) {
    this.targetSelecter.cleanup();
    this.targetSelecter = null;
    return;
  }
  var self = this;
  var isRecording = this.editor.recordingEnabled;
  if (isRecording) {
    this.editor.setRecordingEnabled(false);
  }
  button.label = "Cancel";
  help.removeAttribute("style");
  this.targetSelecter = new TargetSelecter(function (element, win) {
    if (element && win) {
      var locatorBuilders = new LocatorBuilders(win);
      var target = locatorBuilders.buildAll(element);
      locatorBuilders.detach();
      if (target != null && target instanceof Array) {
        if (target[0]) {
          self.editor.treeView.updateCurrentCommand('targetCandidates', target);
        } else {
          alert("LOCATOR_DETECTION_FAILED");
        }
      }

    }
    self.targetSelecter = null;
  }, function () {
    button.label = "Select";
    help.setAttribute("style", "display: none;");
    if (isRecording) {
      self.editor.setRecordingEnabled(true);
    }
  });
};

Debugger.prototype.unload = function () {
  if (this.targetSelecter) {
    this.targetSelecter.cleanup();
    this.targetSelecter = null;
  }
};

/*
 * Use to reload the Selenium Core API 
 * and its overrides and extensions (user-extensions file)
 */
Debugger.prototype.reInit = function () {
  this.runner = null;
  this.init();
};

observable(Debugger);
