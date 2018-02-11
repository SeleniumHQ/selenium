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
 * An UI of Selenium IDE.
 */
function Editor(window) {
  this.log.debug("initializing");
  this.window = window;
  window.editor = this;
  var self = this;
  this.health = new HealthService();
  this.health.attach(window, 'editor');
  this.health.addEvent('editor', 'initializing');
  this.safeLastWindow = new LastWindow();
  this.recordFrameTitle = false;
  this.app = new Application();
  this.app.addObserver({
    baseURLChanged: function () {
      Editor.GENERIC_AUTOCOMPLETE.setCandidates(
          XulUtils.toXPCOMString(self.getAutoCompleteSearchParam("baseURL")),
          XulUtils.toXPCOMArray(self.app.getBaseURLHistory())
      );
      $("baseURL").value = self.app.getBaseURL();
      if (self.view) {
        self.view.refresh();
      }
    },

    optionsChanged: function () {
      self.health.addEvent('editor', 'optionsChanged');
      if (self.view) {
        self.view.refresh();
      }
      LocatorBuilders.setPreferredOrder(self.app.options.locatorBuildersOrder);
      //Samit: Enh: now sync other UI elements with the options
      self.updateDeveloperTools(self.app.getBooleanOption('showDeveloperTools'));
      self.updateExperimentalFeatures(self.app.getBooleanOption('enableExperimentalFeatures'));
      self.updateVisualEye(self.app.getBooleanOption('visualEye'));
      self.health.showAlerts(self.app.getBooleanOption('showHealthAlerts'));
      self.updateWebdriverBrowser(self.app.options.webDriverBrowserString);
    },

    testSuiteChanged: function (testSuite) {
      testSuite.addObserver(this._testSuiteObserver);
      if (testSuite.file) {
        document.getElementById("suiteTreeSplitter").setAttribute("state", "open");
      }
      self.suiteTreeView.refresh();
    },

    testSuiteUnloaded: function (testSuite) {
      testSuite.removeObserver(this._testSuiteObserver);
    },

    testCaseChanged: function (testCase) {
      // this.view is not set yet when setTestCase is called from constructor
      if (self.view) {
        self.view.testCase = testCase;
        self.view.refresh();
        self.updateTitle();
      }
      self.toggleRecordingEnabled(false);
      testCase.addObserver(this._testCaseObserver);
    },

    testCaseUnloaded: function (testCase) {
      testCase.removeObserver(this._testCaseObserver);
    },

    /**
     * called when the format is changing. It synchronizes
     * the testcase before changing the view with a converted testcase
     * in the new format
     */
    currentFormatChanging: function () {
      //sync the testcase with the view
      self.sourceView.syncModel();
      if (self.view) {
        self.view.testCase = self.app.getTestCase();
        self.view.refresh();
      }
    },

    currentFormatChanged: function (format) {
      self.updateViewTabs();
      self.updateState();
    },

    /**
     * called when the format can't be changed. It advises the user
     * of the undoable action
     */
    currentFormatUnChanged: function (format) {
      var res = confirm(Editor.getString('format.switch.loseChanges'));
      if (res) {
        if (self.sourceView) {
          self.alreadySaved = false;
          self.oldtc.edited = false;
          self.view.testCase = self.oldtc.createCopy();
          self.app.testCase.edited = false;
          self.app.currentFormat = format;
          self.app.testCase = self.oldtc;
          self.sourceView.testCase = self.oldtc.createCopy();
          self.sourceView.testCase.edited = false;
          self.sourceView.updateView();
          self.updateViewTabs();
          self.updateState();
          self.alreadySaved = false;
          self.app.currentFormat = format;
          Preferences.setAndSave(self.app.options, 'selectedFormat', format.id);
        }
      }
    },

    clipboardFormatChanged: function (format) { },

    _testCaseObserver: {
      modifiedStateUpdated: function () {
        self.updateTitle();
        if (self.view.updateView) {
          self.view.testCase = self.getTestCase();
          self.view.updateView();
        }
      }
    },

    _testSuiteObserver: {
      testCaseAdded: function () {
        document.getElementById("suiteTreeSplitter").setAttribute("state", "open");
      }
    }
  });

  LocatorBuilders.addObserver({
    preferredOrderChanged: function (preferredOrder) {
      Preferences.setAndSave(self.app.options, 'locatorBuildersOrder', preferredOrder.join(','));
    }
  });

  this.document = document;
  this.recordButton = document.getElementById("record-button");
  this.recordMenuItem = document.getElementById("menu_record");
  this.scheduleButton = document.getElementById("schedule-button");
  this.scheduleMenuItem = document.getElementById("menu_schedule");
  this.speedMaxInterval = parseInt(document.getElementById("speedSlider").getAttribute("maxpos"));
  this.initMenus();
  this.app.initOptions();
  this.pluginManager = this.app.pluginManager;
  this.health.addDiagnostic('PluginManager', this.pluginManager);
  this.loadExtensions();
  this.loadSeleniumAPI();
  //TODO show plugin errors
  if (this.pluginManager.errors.hasErrors()) {
    this.showAlert(Editor.getString('plugin.disabled.message') + "\n\n" + this.pluginManager.errors.getPluginIdsWithErrors().join("\n"));
  }
  this.selectDefaultReference();
  this.treeView = new TreeView(this, document, document.getElementById("commands"));
  this.sourceView = new SourceView(this, document.getElementById("source"));
  this.suiteTreeView = new SuiteTreeView(this, document.getElementById("suiteTree"));
  this.testSuiteProgress = new TestSuiteProgress("suiteProgress");
  //this.toggleView(this.treeView);

  // "debugger" cannot be used since it is a reserved word in JS
  this.selDebugger = new Debugger(this);
  this.selDebugger.addObserver({
    stateUpdated: function (state) {
      var pauseBtn = document.getElementById("pause-button");
      pauseBtn.classList.remove("resume");
      pauseBtn.classList.remove("pause");
      pauseBtn.classList.add(state == Debugger.PAUSED ? "resume" : "pause");
      self.updateState();
    }
  });

  //top.document.commandDispatcher.getControllers().appendController(Editor.controller);
  //window.controllers.appendController(Editor.controller);
  top.controllers.appendController(Editor.controller);

  //window.controllers.appendController(controller);

  if (this.app.getBooleanOption('showDeveloperTools') && this.app.reopenLastTestCaseOrSuite()) {
    this.toggleRecordingEnabled(false);
  } else {
    this.app.newTestSuite();
    if (this.app.options.recordOnOpen && this.app.options.recordOnOpen == 'true') {
      this.toggleRecordingEnabled(true);
    } else {
      this.toggleRecordingEnabled(false);
    }
  }

  // disable webdriver related toolbar buttons if webdriver playback is disabled
  if ( !this.app.getBooleanOption('executeUsingWebDriver') ) {
    document.getElementById("browser-button").disabled = true;
    document.getElementById("close-webdriver-button").disabled = true;
  }

  this.updateViewTabs();
  this.infoPanel = new Editor.InfoPanel(this);

  //top.document.commandDispatcher.updateCommands("selenium-ide-state");

  document.addEventListener("focus", Editor.checkTimestamp, false);

  this.log.debug("initialized");

  setTimeout("editor.showLoadErrors()", 500);

  this.registerRecorder();

  this.oldtc = null;
  this.alreadySaved = false;

  //Samit: Enh: display a webpage on the first start (and also on locale change if the version string is localised)
  var versionString = Editor.getString('selenium-ide.version');
  if (!this.app.options.currentVersion || this.app.options.currentVersion != versionString) {
    openTabOrWindow('https://github.com/SeleniumHQ/selenium/wiki/SeIDE-Release-Notes');
    Preferences.setAndSave(this.app.options, 'currentVersion', versionString);
  }

  this.seleniumScheduler = new SeleniumScheduler(this);
  this.scheduler = this.seleniumScheduler.scheduler;
  this.log.info("Ready");
  this.app.notify('initComplete');
  this.health.addEvent('editor', 'initialized');
}

Editor.prototype.saveTC = function () {
  if (!this.alreadySaved && !this.app.getCurrentFormat().isReversible()) {
    this.oldtc = this.app.getTestCase().createCopy();
    this.oldtc.edited = false;
    this.app.testCase.edited = true;
    this.alreadySaved = true;
  }
};

Editor.checkTimestamp = function () {
  editor.log.debug('checkTimestamp');
  if (editor.app.getTestCase().checkTimestamp()) {
    if (window.confirm(Editor.getString('confirmReload'))) {
      var testCase = editor.app.getCurrentFormat().loadFile(editor.getTestCase().file);
      if (testCase) {
        editor.app.setTestCase(testCase);
      }
    }
  }
};

Editor.getString = function (key) {
  return document.getElementById("strings").getString(key);
};

//Samit: Enh: Support localised strings with parameters
Editor.getFormattedString = function (key, strArray) {
  return document.getElementById("strings").getFormattedString(key, strArray);
};

Editor.controller = {
  supportsCommand: function (cmd) {
    //Editor.log.debug("supportsCommand");
    switch (cmd) {
      case "cmd_close":
      case "cmd_open":
      case "cmd_add":
      case "cmd_new":
      case "cmd_new_suite":
      case "cmd_open_suite":
      case "cmd_save":
      case "cmd_save_suite":
      case "cmd_save_suite_as":
      case "cmd_selenium_play":
      case "cmd_selenium_play_suite":
      case "cmd_selenium_pause":
      case "cmd_selenium_step":
      case "cmd_selenium_testcase_clear":
      case "cmd_selenium_rollup":
      case "cmd_selenium_reload":
      case "cmd_selenium_record":
      case "cmd_selenium_schedule":
      case "cmd_selenium_speed_fastest":
      case "cmd_selenium_speed_faster":
      case "cmd_selenium_speed_slower":
      case "cmd_selenium_speed_slowest":
      case "cmd_selenium_clear_base_URL_history":
      case "cmd_selenium_clear_test_cases_history":
      case "cmd_selenium_clear_test_suites_history":
        return true;
      default:
        return false;
    }
  },
  isCommandEnabled: function (cmd) {
    //Editor.log.debug("isCommandEnabled");
    switch (cmd) {
      case "cmd_close":
      case "cmd_open":
      case "cmd_add":
      case "cmd_new":
      case "cmd_new_suite":
      case "cmd_open_suite":
      case "cmd_save":
      case "cmd_save_suite":
      case "cmd_save_suite_as":
      case "cmd_selenium_testcase_clear":
      case "cmd_selenium_clear_base_URL_history":
      case "cmd_selenium_clear_test_cases_history":
      case "cmd_selenium_clear_test_suites_history":
        return true;
      case "cmd_selenium_play":
        return editor.app.isPlayable() && editor.selDebugger.state != Debugger.PLAYING;
      case "cmd_selenium_rollup":
        if (Editor.rollupManager) {
          return editor.app.isPlayable() && editor.selDebugger.state != Debugger.PLAYING;
        } else {
          return false;
        }
      case "cmd_selenium_reload":
        return editor.app.isPlayable() && editor.selDebugger.state != Debugger.PLAYING && editor.app.getBooleanOption('showDeveloperTools');
      case "cmd_selenium_play_suite":
        return editor.app.isPlayable() && editor.selDebugger.state != Debugger.PLAYING;
      case "cmd_selenium_pause":
        return editor.app.isPlayable() && (editor.selDebugger.state == Debugger.PLAYING || editor.selDebugger.state == Debugger.PAUSED);
      case "cmd_selenium_step":
        return editor.app.isPlayable() && editor.selDebugger.state == Debugger.PAUSED;
      case "cmd_selenium_record":   //TODO base it on scheduler?
        return true;
      case "cmd_selenium_schedule":
        return true;
      case "cmd_selenium_speed_fastest":
        return editor.getInterval() > 0;
      case "cmd_selenium_speed_faster":
        return editor.getInterval() > 0;
      case "cmd_selenium_speed_slower":
        return editor.getInterval() < editor.speedMaxInterval;
      case "cmd_selenium_speed_slowest":
        return editor.getInterval() < editor.speedMaxInterval;
      default:
        return false;
    }
  },
  doCommand: function (cmd) {
    Editor.log.debug("doCommand: " + cmd);
    switch (cmd) {
      case "cmd_close":
        if (editor.confirmClose()) {
          window.close();
        }
        break;
      case "cmd_save":
        editor.saveTestCase();
        break;
      case "cmd_add":
        editor.app.addTestCase();
        break;
      case "cmd_new":
        editor.app.newTestCase();
        break;
      case "cmd_open":
        editor.loadRecentTestCase();
        break;
      case "cmd_new_suite":
        if (editor.confirmClose()) {
          editor.app.newTestSuite();
        }
        break;  //Samit: Enh: Prompt to save first
      case "cmd_open_suite":
        editor.loadRecentSuite();
        break;
      case "cmd_save_suite":
        editor.app.saveTestSuite(true);
        break;
      case "cmd_save_suite_as":
        editor.app.saveNewTestSuite(true);
        break;
      case "cmd_selenium_testcase_clear":
        editor.clear();
        break;
      case "cmd_selenium_play":
        editor.testSuiteProgress.reset();
        editor.playCurrentTestCase(null, 0, 1);
        break;
      case "cmd_selenium_play_suite":
        editor.playTestSuite();
        break;
      case "cmd_selenium_pause":
        if (editor.selDebugger.state == Debugger.PAUSED) {
          editor.selDebugger.doContinue();
        } else {
          editor.selDebugger.pause();
        }
        break;
      case "cmd_selenium_step":
        editor.selDebugger.doContinue(true);
        break;
      case "cmd_selenium_rollup":
        if (Editor.rollupManager) {
          try {
            Editor.rollupManager.applyRollupRules();
          } catch (e) {
            alert('Whoa! ' + e.message);
          }
        } else {
          alert('No rollup rules have been defined.');
        }
        break;
      case "cmd_selenium_reload":
        try {
          editor.reload();
        } catch (e) {
          alert('Reload error : ' + e);
        }
        break;
      case "cmd_selenium_record":
        editor.toggleRecordingEnabled();
        break;
      case "cmd_selenium_schedule":
        editor.scheduleButton.checked = !editor.scheduleButton.checked;
        if (editor.scheduleButton.checked) {
		  editor.scheduleButton.setAttribute("tooltiptext","Scheduler now on, Click to turn Scheduler off")
          //TODO hasJobs() is not enough as there may be jobs that are not valid, need hasValidJobs()
          if (editor.scheduler.hasJobs()) {
            editor.toggleRecordingEnabled(false);
            if (editor.scheduler.pendingJobCount() > 0) {
              var answer = PromptService.yesNoCancel(Editor.getString('scheduler.runNow.message'), Editor.getString('scheduler.runNow.title'));
              if (answer.yes) {
                editor.scheduler.start();
              } else if (answer.no) {
                editor.scheduler.resetNextRun();
                editor.scheduler.start();
              } else {
                //Canceled
                editor.scheduleButton.checked = !editor.scheduleButton.checked;
              }
            } else {
              editor.scheduler.start();
            }
          } else {
            if (PromptService.yesNo(Editor.getString('scheduler.setupJobs.message'), Editor.getString('scheduler.setupJobs.title')).yes) {
              editor.openSeleniumIDEScheduler();
            }
          }
        } else {
		  editor.scheduleButton.setAttribute("tooltiptext","Click to turn scheduler on")
          editor.scheduler.stop();
        }
        break;
      case "cmd_selenium_speed_fastest":
        editor.updateInterval(-1000);
        break;
      case "cmd_selenium_speed_faster":
        editor.updateInterval(-100);
        break;
      case "cmd_selenium_speed_slower":
        editor.updateInterval(100);
        break;
      case "cmd_selenium_speed_slowest":
        editor.updateInterval(1000);
        break;
      case "cmd_selenium_clear_base_URL_history":
        editor.app.baseURLHistory.clear();
        break;
      case "cmd_selenium_clear_test_cases_history":
        editor.app.recentTestCases.clear();
        break;
      case "cmd_selenium_clear_test_suites_history":
        editor.app.recentTestSuites.clear();
        break;
      default:
    }
  },
  onEvent: function (evt) { }
};

Editor.prototype.showLoadErrors = function () {
  if (this.errorMessage) {
    window.alert(this.errorMessage);
    delete this.errorMessage;
  }
};

//Samit: Enh: Prompt to save first
Editor.prototype.loadRecentTestCase = function (path) {
  if (this.confirmClose()) {
    this.app.loadTestCaseWithNewSuite(path);
  }
};

//Samit: Enh: Prompt to save first
Editor.prototype.loadRecentSuite = function (path) {
  if (this.confirmClose()) {
    this.app.loadTestSuite(path);
  }
};

Editor.prototype.confirmClose = function () {
  //Samit: Enh: Prompt if test suite and/or any of the test cases have changed and save them
  var curSuite = this.app.getTestSuite();
  if (curSuite) {
    var saveSuite = !curSuite.isTempSuite() && curSuite.isModified();
    var changedTestCases = 0;
    for (var i = 0; i < curSuite.tests.length; i++) {
      if (curSuite.tests[i].content && curSuite.tests[i].content.modified) {
        changedTestCases++;
      }
    }

    if (saveSuite || changedTestCases > 0) {
      var promptType = (saveSuite ? 1 : 0) + (changedTestCases > 0 ? 2 : 0) - 1;
      var prompt = [
        Editor.getString('saveTestSuite.confirm'),
        Editor.getFormattedString('saveTestCase.confirm', [changedTestCases]),
        Editor.getFormattedString('saveTestSuiteAndCase.confirm', [changedTestCases])
      ][promptType];

      var result = PromptService.save(prompt, Editor.getString('save'));
      if (result.save) {
        if (curSuite.isTempSuite()) {
          //For temp suites, just save the test case (as there is only one test case)
          return this.saveTestCase();
        }
        //For all others, save the suite (perhaps unnecessary) and all test cases that have changed
        return this.app.saveTestSuite(true);
      } else if (result.cancel) {
        return false;
      }
      //result.dontSave
      return true;
    }
  } else {
    //TODO: Why is there no current suite???
  }
  return true;
};

Editor.prototype.log = Editor.log = new Log("Editor");

Editor.prototype.unload = function () {
  this.app.saveState();

  this.selDebugger.unload();
  this.deregisterRecorder();
  top.controllers.removeController(Editor.controller);

  this.cleanupAutoComplete();

  delete window.editor;
};

Editor.prototype.updateState = function () {
  window.document.commandDispatcher.updateCommands("selenium-ide-state");
};

Editor.prototype.updateSeleniumCommands = function () {
  this.log.debug("updateSeleniumCommands");
  [ "cmd_selenium_play_suite",
    "cmd_selenium_play",
    "cmd_selenium_pause",
    "cmd_selenium_step",
    "cmd_selenium_rollup",
    "cmd_selenium_reload",
    "cmd_delete_suite",
    "cmd_play_suite_from_here"
  ].forEach(function (cmd) {
    goUpdateCommand(cmd);
  });
};

Editor.prototype.updateSeleniumActionCommands = function () {
  this.log.debug("updateSeleniumActionCommands");
  [ "cmd_selenium_speed_faster",
    "cmd_selenium_speed_fastest",
    "cmd_selenium_speed_slower",
    "cmd_selenium_speed_slowest"
  ].forEach(function (cmd) {
    goUpdateCommand(cmd);
  });
};

Editor.prototype.getOptions = function (options) {
  return this.app.getOptions();
};

Editor.prototype.updateTitle = function () {
  var testCase = this.getTestCase();
  var title = testCase ? testCase.getTitle() : '';
  var testSuite = this.app.getTestSuite();
  title += " (" + (testSuite && testSuite.file ? testSuite.file.leafName : 'untitled suite') + ") ";
  title += " - " + Editor.getString('selenium-ide.name') + " " + Editor.getString('selenium-ide.version');
  if (testCase && testCase.modified) {
    title += " *";
  }
  document.title = title;
};

Editor.prototype.tabSelected = function (id) {
  if (this.getTestCase() != null) {
    this.log.debug("tabSelected: id=" + id);
    if (id == 'sourceTab') {
      this.toggleView(this.sourceView);
    } else if (id == 'editorTab') {
      this.toggleView(this.treeView);
    }
  }
};

Editor.prototype.saveTestCase = function () {
  this.view.syncModel();
  return this.app.saveTestCase();
};

Editor.prototype.saveNewTestCase = function () {
  this.view.syncModel();
  if (this.app.saveNewTestCase()) {
    //document.getElementById("filename").value = this.testCase.filename;
    this.updateTitle();
  }
};

Editor.prototype.exportTestCaseWithFormat = function (format) {
  this.view.syncModel();
  format.saveAsNew(this.getTestCase().createCopy(), true);
};

Editor.prototype.exportTestSuiteWithFormat = function (format) {
  this.view.syncModel();
  format.saveSuiteAsNew(this.app.getTestSuite().createCopy(), true);
};

Editor.prototype.loadRecorderFor = function (contentWindow, isRootDocument) {
  this.log.debug("loadRecorderFor: " + contentWindow);
  if (this.recordingEnabled && (isRootDocument || this.recordFrameTitle) && this.safeLastWindow.windowEquals(contentWindow)) {
    this.recordTitle(contentWindow);
  }
  Recorder.register(this, contentWindow);
};

Editor.prototype.toggleRecordingEnabled = function (enabled) {
  if (arguments.length == 0) {
    enabled = !this.recordingEnabled;
  }
  this.recordingEnabled = enabled;
  this.recordButton.checked = enabled;
  this.recordMenuItem.setAttribute('checked', enabled);
  var tooltip = Editor.getString("recordButton.tooltip." + (enabled ? "on" : "off"));
  this.recordButton.setAttribute("tooltiptext", tooltip);
};

Editor.prototype.setRecordingEnabled = function (enabled) {
  this.toggleRecordingEnabled(enabled);
};

Editor.prototype.onUnloadDocument = function (doc) {
  this.log.debug("onUnloadDocument");
  var window = doc.defaultView;
  var self = this;
  setTimeout(function () {
    self.appendWaitForPageToLoad(window);
  }, 0);
};

Editor.prototype.recordTitle = function (window) {
  if (this.getOptions().recordAssertTitle == 'true' && this.getTestCase().commands.length > 0) {
    //setTimeout("addCommand", 200, "assertTitle", window.document.title, null, window);
    this.addCommand("assertTitle", exactMatchPattern(window.document.title), null, window);
  }
};

Editor.prototype.getPathAndUpdateBaseURL = function (window) {
  if (!window || !window.location) {
    return [null, null];
  }
  var path = window.location.href;
  var regexp = new RegExp(/^(https?:\/\/[^/:]+(:\d+)?)\/.*/);
  var base = '';
  var result = regexp.exec(path);
  if (result && "true" != this.getOptions().recordAbsoluteURL) {
    path = path.substr(result[1].length);
    base = result[1] + '/';
  }
  if (!this.app.getBaseURL() ||
      this.app.getBaseURL().indexOf(base) < 0) {
    this.app.setBaseURL(base);
  }
  return [path, base];
};

Editor.prototype.clear = function (force) {
  if (this.getTestCase() != null) {
    if (force || confirm("Really clear the test?")) {
      this.getTestCase().clear();
      this.view.refresh();
      this.log.debug("cleared");
      return true;
    }
  }
  return false;
};

Editor.prototype._getTopWindow = function (window) {
  if (this.topWindow) {
    var top = this.topWindow; // for functional test of Selenium IDE
    delete this.topWindow;
    return top;
  } else {
    return window.top;
  }
};

//Samit: Enh: Provide a way to reset the window size and position in the rare case that you have to change to a smaller monitor and you cannot access the lower pane
Editor.prototype.resetWindow = function () {
  if (this instanceof StandaloneEditor) {
    try {
      window.restore();
      window.resizeTo(400, 520);
      window.moveTo(0, 0);
    } catch (err) {
      alert("Error: [" + err + "] while trying to reset window size and position.");
    }
  }
};
Editor.prototype.submitDiagInfo = function(){
  this.health.runDiagnostics();
  var data = {
    data: this.health.getJSON(true)
  };
  window.openDialog("chrome://selenium-ide/content/health/diag-info.xul", "diagInfo", "chrome,modal,resizable", data);
  if (data.data.length > 0) {
    GitHub.createGistWithFiles("Selenium IDE diagnostic information", data).then(function(url){
      alert("Gist created with diagnostic information.\nPlease update the issue on https://github.com/SeleniumHQ/selenium/issues with this url.\nURL: " + url);
    }, function(response, success, status){
      alert("Gist creation failed with status " + status + " and response:-\n" + (response || ''));
    });
  }
};

//Samit: Enh: Introduced experimental features to enable or disable experimental and unstable features
Editor.prototype.updateExperimentalFeatures = function (show) {
  //$("menu_choose_format").disabled = !show;
  if (show == false && this.app.options.selectedFormat != 'default') {
    //reset format to html
    this.app.setCurrentFormat(this.app.formats.selectFormat('default'));
  }
};

Editor.prototype.showFormatsPopup = function (e) {
  if (this.app.getBooleanOption('enableExperimentalFeatures')) {
    this.populateFormatsPopup(e, 'switchFormat', this.app.getCurrentFormat());
  } else {
    XulUtils.clearChildren(e);
    XulUtils.appendMenuItem(e, {
      label: Editor.getString('format.switch.read'),
      value: "stuff"
    });
  }
};

Editor.prototype.formatsPopupClicked = function (value) {
  if (this.app.getBooleanOption('enableExperimentalFeatures')) {
    this.app.userSetCurrentFormat(this.app.formats.selectFormat(value));
  } else {
    openTabOrWindow("http://blog.reallysimplethoughts.com/2011/06/10/does-selenium-ide-v1-0-11-support-changing-formats/");
  }
};

//Samit: Ref: Refactored the developer tools to be simpler
Editor.prototype.updateDeveloperTools = function (show) {
  //use when the developer tools have to be enabled or not
  $("reload-button").hidden = !show;
  $("reload-button").disabled = !show;
};

//Samit: Enh: Provide a bit of visual assistance
Editor.prototype.updateVisualEye = function (show) {
  var container = document.getElementById("selenium-ide") || document.getElementById("selenium-ide-sidebar");
  show ? container.classList.add("visualeye") : container.classList.remove("visualeye");
};

Editor.prototype.autoCompleteCommand = function (command) {
  var newcmd = command.replace(/^.+ >> /, '');
  if (newcmd !== command) {
    $('commandAction').value = newcmd;
    this.treeView.updateCurrentCommand('command', newcmd);
  }
};

Editor.prototype.addCommand = function (command, target, value, window, insertBeforeLastCommand) {
  this.log.debug("addCommand: command=" + command + ", target=" + target + ", value=" + value + " window.name=" + window.name);
  if (command != 'open' &&
      command != 'selectWindow' &&
      command != 'selectFrame') {
    if (this.getTestCase().commands.length == 0) {
      var top = this._getTopWindow(window);
      this.log.debug("top=" + top);
      var path = this.getPathAndUpdateBaseURL(top)[0];
      this.addCommand("open", path, '', top);
      this.recordTitle(top);
    }
    if (!this.safeLastWindow.isSameWindow(window)) {
      if (this.safeLastWindow.isSameTopWindow(window)) {
        // frame
        var destPath = this.safeLastWindow.createPath(window);
        var srcPath = this.safeLastWindow.getPath();
        this.log.debug("selectFrame: srcPath.length=" + srcPath.length + ", destPath.length=" + destPath.length);
        var branch = 0;
        var i;
        for (i = 0; ; i++) {
          if (i >= destPath.length || i >= srcPath.length) {
            break;
          }
          if (destPath[i] == srcPath[i]) {
            branch = i;
          }
        }
        this.log.debug("branch=" + branch);
        if (branch == 0 && srcPath.size > 1) {
          // go to root
          this.addCommand('selectFrame', 'relative=top', '', window);
        } else {
          for (i = srcPath.length - 1; i > branch; i--) {
            this.addCommand('selectFrame', 'relative=up', '', window);
          }
        }
        for (i = branch + 1; i < destPath.length; i++) {
          this.addCommand('selectFrame', destPath[i].name, '', window);
        }
      } else {
        // popup
        var windowName = window.name;
        if (windowName == '') {
          this.addCommand('selectWindow', 'null', '', window);
        } else {
          this.addCommand('selectWindow', "name=" + windowName, '', window);
        }
      }
    }
  }
  //resultBox.inputField.scrollTop = resultBox.inputField.scrollHeight - resultBox.inputField.clientHeight;
  this.clearLastCommand();
  this.safeLastWindow.setWindow(window);
  var command = new Command(command, target, value);
  // bind to the href attribute instead of to window.document.location, which
  // is an object reference
  command.lastURL = window.document.location.href;

  if (insertBeforeLastCommand && this.view.getRecordIndex() > 0) {
    var index = this.view.getRecordIndex() - 1;
    this.getTestCase().commands.splice(index, 0, command);
    this.view.rowInserted(index);
  } else {
    //this.lastCommandIndex = this.getTestCase().commands.length;
    this.lastCommandIndex = this.view.getRecordIndex(); //Samit: Revert patch for issue 419 as it disables recording in the middle of a test script
    this.getTestCase().commands.splice(this.lastCommandIndex, 0, command);
    this.view.rowInserted(this.lastCommandIndex);
    this.timeoutID = setTimeout("editor.clearLastCommand()", 300);
  }
};

Editor.prototype.clearLastCommand = function () {
  this.lastCommandIndex = null;
  if (this.timeoutID != null) {
    clearTimeout(this.timeoutID);
    this.timeoutID = null;
  }
};

Editor.prototype.appendWaitForPageToLoad = function (window) {
  this.log.debug("appendWaitForPageToLoad");
  if (!this.safeLastWindow.windowEquals(window)) {
    this.log.debug("window did not match");
    return;
  }
  var lastCommandIndex = this.lastCommandIndex;
  if (lastCommandIndex == null || lastCommandIndex >= this.getTestCase().commands.length) {
    return;
  }
  this.lastCommandIndex = null;
  var lastCommand = this.getTestCase().commands[lastCommandIndex];
  if (lastCommand.type == 'command' && !lastCommand.command.match(/^(assert|verify|store)/)) {
    if (this.app.getCurrentFormat().getFormatter().remoteControl) {
      this.addCommand("waitForPageToLoad", this.getOptions().timeout, null, window);
    } else {
      lastCommand.command = lastCommand.command + "AndWait";
      this.view.rowUpdated(lastCommandIndex);
    }
  }
  this.clearLastCommand();
  //updateSource();
};

Editor.prototype.openSeleniumIDEPreferences = function () {
  window.openDialog("chrome://selenium-ide/content/optionsDialog.xul", "options", "chrome,modal,resizable", null);
};

Editor.prototype.openSeleniumIDEScheduler = function (event) {
  if (event) {
    event.stopPropagation();
  }
  window.openDialog("chrome://selenium-ide/content/scheduler/schedulerui.xul", "scheduler", "chrome,modal,resizable", this);
  this.scheduleButton.checked = this.scheduler.isActive();
};

Editor.prototype.showInBrowser = function (url, newWindow) {
  if (newWindow) {
    return this.window.open(url);
  } else {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    var window = wm.getMostRecentWindow('navigator:browser');
    var contentWindow = window.getBrowser().contentWindow;
    contentWindow.location.href = url;
    return window;
  }
};

Editor.prototype.playCurrentTestCase = function (next, index, total) {
  var start = Date.now();
  var self = this;
  this.health.increaseCounter('editor', 'playCurrentTestCase');
  self.getUserLog().info("Playing test case " + (self.app.getTestCase().getTitle() || ''));
  self.app.notify("testCasePlayStart", self.app.getTestCase());
  this.selDebugger.start(function (failed) {
    self.log.debug("finished execution of test case: failed=" + failed);
    var testCase = self.suiteTreeView.getCurrentTestCase();
    if (testCase) {
      testCase.testResult = {
        summary: failed ? "failed" : "passed",
        // remember all in milliseconds
        start: start,
        end: Date.now(),
        dur: Date.now() - start
      };
      self.getUserLog().info("Test case " + testCase.testResult.summary);
      self.app.notify("testCasePlayDone", testCase);
    } else {
      self.getUserLog().error("current test case not found");
      self.log.error("current test case not found");
    }
    self.suiteTreeView.currentRowUpdated();
    self.testSuiteProgress.update(index + 1, total, failed);
    if (next) {
      next();
    }
  }, index > 0 /* reuse last window if index > 0 */);
};

Editor.prototype.playTestSuite = function (startIndex) {
  if (!startIndex) {
    startIndex = 0;
  }
  if (startIndex === 0) {
    this.health.increaseCounter('editor', 'playTestSuite');
  } else {
    this.health.increaseCounter('editor', 'playPartialTestSuite');
  }
  var index = startIndex - 1;
  var testSuite = this.app.getTestSuite();
  testSuite.tests.forEach(function (test) {
    if (test.testResult) {
      delete test.testResult;
    }
  });
  this.suiteTreeView.refresh();
  this.testSuiteProgress.reset();
  var start = Date.now();
  testSuite.testSuiteProgress = this.testSuiteProgress;
  var self = this;
  self.app.notify("testSuitePlayStart");
  var total = testSuite.tests.length - startIndex;
  (function () {
    if (++index < testSuite.tests.length) {
      self.suiteTreeView.scrollToRow(index);
      self.app.showTestCaseFromSuite(testSuite.tests[index]);
      self.playCurrentTestCase(arguments.callee, index, total);
    } else {
      //Suite done
      testSuite.suiteResult = {
        summary: total == self.testSuiteProgress.runs && self.testSuiteProgress.failures == 0 ? 'passed' : 'failed',
        total: total,
        ran: self.testSuiteProgress.runs,
        failed: self.testSuiteProgress.failures,
        passed: self.testSuiteProgress.runs - self.testSuiteProgress.failures,
        // remember all in milliseconds
        start: start,
        end: Date.now(),
        dur: Date.now() - start
      };
      self.getUserLog().info("Test suite completed: " + self.testSuiteProgress.runs + " played, " + (self.testSuiteProgress.failures ? self.testSuiteProgress.failures + " failed" : " all passed!"));
      self.app.notify("testSuitePlayDone", testSuite.suiteResult);
    }
  })();
};

Editor.prototype.openLogWindow = function () {
  if (!LOG.getLogWindow()) {
    LOG.logWindow = window.open(
        "chrome://selenium-ide/content/selenium-core/SeleniumLog.html", "SeleniumLog",
        "chrome,width=600,height=250,bottom=0,right=0,status,scrollbars,resizable"
    );
  }
};

Editor.prototype.onPopupOptions = function () {
  document.getElementById("clipboardFormatMenu").setAttribute("disabled", !editor.app.isPlayable());
  document.getElementById("internalTestsMenu").setAttribute("hidden", this.getOptions().showInternalTestsMenu == null);
};

Editor.prototype.populateFormatsPopup = function (e, action, format) {
  XulUtils.clearChildren(e);
  var formats = this.app.getFormats().formats;
  for (var i = 0; i < formats.length; i++) {
    if (formats[i].id == "default" && action.indexOf("export") != -1) {
      continue;
    }
    if (action == "exportTestSuite" && typeof(formats[i].getFormatter().formatSuite) != 'function') {
      continue;
    }
    XulUtils.appendMenuItem(e, {
      type: "radio",
      name: action + "Formats",
      label: formats[i].name,
      value: formats[i].id,
      checked: (format && format.id == formats[i].id) ? true : null
    });
  }
};

Editor.prototype.setWebdriverBrowser = function (browser) {
  this.getOptions().webDriverBrowserString = browser;
  this.updateWebdriverBrowser(browser);
};

Editor.prototype.updateWebdriverBrowser = function (browser) {
  var class_name = "";
  var tooltip = "";
  if (browser == "firefox") {
    class_name = "fx";
    tooltip = "Webdriver playback in Firefox";
  } else if (browser == "chrome") {
    class_name = "gc";
    tooltip = "Webdriver playback in Google Chrome";
  } else if (browser == "internet explorer") {
    class_name = "ie";
    tooltip = "Webdriver playback in Internet Explorer";
  } else if (browser == "safari") {
    class_name = "sa";
    tooltip = "Webdriver playback in Safari";
  }
  if ( !this.app.getBooleanOption('executeUsingWebDriver') ) {
    tooltip = "Webdriver playback is off. Turn it on in the options.";
  }
  var btn = document.getElementById("browser-button");
  btn.setAttribute('class', class_name);
  btn.setAttribute('tooltiptext', tooltip);
};

Editor.prototype.updateViewTabs = function () {
  var editorTab = $('editorTab');
  var tabs = $('viewTabs');
  var tableViewUnavailable = $('tableViewUnavailable');
  if (this.app.isPlayable()) {
    editorTab.setAttribute("disabled", false);
    tableViewUnavailable.setAttribute("hidden", true);
    this.toggleView(this.view || this.treeView);
  } else {
    tabs.selectedIndex = 1;
    this.toggleView(this.sourceView);
    editorTab.setAttribute("disabled", true);
    tableViewUnavailable.setAttribute("hidden", false);
    tableViewUnavailable.style.backgroundColor = window.getComputedStyle(tableViewUnavailable.parentNode.parentNode, "").backgroundColor;
  }
  this.updateState();
};

Editor.prototype.getBaseURL = function () {
  return this.app.getBaseURL();
};

Editor.prototype.getTestCase = function () {
  return this.app.getTestCase();
};

Editor.prototype.toggleView = function (view) {
  this.log.debug("toggle view: testCase=" + this.getTestCase());
  if (this.view != null) {
    this.view.onHide();
  }
  var previous = this.view;
  this.view = view;
  if (previous) {
    previous.syncModel(true);
  }
  this.view.testCase = this.getTestCase();
  this.view.refresh();
  //notify app to change the base URL
  this.app.notify("baseURLChanged");
};

Editor.prototype.showAlert = function (message) {
  this.errorMessage = message;
  //window.alert(message);
};

/*
 * Load default options.
 * Used for self-testing Selenium IDE.
 */
Editor.prototype.loadDefaultOptions = function () {
  this.app.setOptions(Preferences.DEFAULT_OPTIONS);
};

Editor.prototype.loadExtensions = function () {
  const subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
  if (this.getOptions().ideExtensionsPaths) {
    try {
      ExtensionsLoader.loadSubScript(subScriptLoader, this.getOptions().ideExtensionsPaths, window);
    } catch (error) {
      this.health.addException('editor', 'ide-extensions: ' + this.getOptions().ideExtensionsPaths, error);
      this.showAlert(Editor.getFormattedString('ide.extensions.failed', [error.toString()]));
    }
  }
  var health = this.health;
  var pluginManager = this.pluginManager;
  pluginManager.getEnabledIDEExtensions().forEach(function (plugin) {
    for (var i = 0; i < plugin.code.length; i++) {
      try {
        ExtensionsLoader.loadSubScript(subScriptLoader, plugin.code[i], window);
      } catch (error) {
        health.addException('editor', 'plugin: ' + plugin.id, error);
        pluginManager.setPluginError(plugin.id, plugin.code[i], error);
        break;
      }
    }
  });
};

Editor.prototype.loadSeleniumAPI = function () {
  // load API document
  var parser = new DOMParser();
  var document = parser.parseFromString(FileUtils.readURL("chrome://selenium-ide/content/selenium-core/iedoc-core.xml"), "text/xml");
  Command.apiDocuments = new Array(document);

  // load functions
  var seleniumAPI = {};

  const subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

  subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-core/scripts/selenium-api.js', seleniumAPI);
  subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-api-override.js', seleniumAPI);

  // user supplied extensions
  if (this.getOptions().userExtensionsURL) {
    try {
      ExtensionsLoader.loadSubScript(subScriptLoader, this.getOptions().userExtensionsURL, seleniumAPI);
    } catch (error) {
      this.health.addException('editor', 'user-extensions: ' + this.getOptions().userExtensionsURL, error);
      this.showAlert(Editor.getFormattedString('user.extensions.failed', [error.toString()]));
    }
  }

  var pluginManager = this.pluginManager;
  pluginManager.getEnabledUserExtensions().forEach(function (plugin) {
    for (var i = 0; i < plugin.code.length; i++) {
      try {
        var js_url = plugin.code[i].split(";");
        ExtensionsLoader.loadSubScript(subScriptLoader, js_url[0], seleniumAPI);
        if (js_url[1] != 'undefined') {
          Command.apiDocuments.push(parser.parseFromString(FileUtils.readURL(js_url[1]), "text/xml"));
        }
      } catch (error) {
        pluginManager.setPluginError(plugin.id, plugin.code[i], error);
        break;
      }
    }
  });

  this.seleniumAPI = seleniumAPI;
};

Editor.prototype.reload = function () {
  try {
    this.loadSeleniumAPI();
    this.selDebugger.reInit();
    this.treeView.reloadSeleniumCommands();
  } catch (e) {
    alert("error reload: " + e);
  }
};

Editor.prototype.showReference = function (command) {
  if (command.type == 'command') {
    var def = command.getDefinition();
    if (def) {
      this.infoPanel.switchView(this.infoPanel.helpView);
      this.log.debug("showReference: " + def.name);
      this.reference.show(def, command);
    }
  }
};

Editor.prototype.showUIReference = function (target) {
  if (!Editor.uiMap) {
    return;
  }
  var re = new RegExp('^' + Editor.UI_PREFIX + '=');
  if (re.test(target)) {
    var uiSpecifierString = target.replace(re, "");
    // trim the offset locator, if any
    if (!/\)$/.test(uiSpecifierString)) {
      var matches = /^([^\)]+\))(.+)$/.exec(uiSpecifierString);
      uiSpecifierString = matches[1];
    }
    var pageset = Editor.uiMap.getPageset(uiSpecifierString);
    var uiElement = Editor.uiMap.getUIElement(uiSpecifierString);
    if (pageset != null && uiElement != null) {
      this.infoPanel.switchView(this.infoPanel.uiView);
      this.uiReference.show(uiSpecifierString);
    }
  }
};

Editor.prototype.showRollupReference = function (command) {
  try {
    if (command.isRollup()) {
      var rule = Editor.rollupManager.getRollupRule(command.target);
      if (rule != null) {
        this.infoPanel.switchView(this.infoPanel.rollupView);
        this.rollupReference.show(rule, command);
      }
    }
  } catch (e) {
    alert('Hoo! ' + e.message);
  }
};

Editor.prototype.getAutoCompleteSearchParam = function (id) {
  var textbox = document.getElementById(id);
  if (!this.autoCompleteSearchParams) {
    this.autoCompleteSearchParams = {};
  }
  if (this.autoCompleteSearchParams[id]) {
    return this.autoCompleteSearchParams[id];
  } else {
    var param = id + "_";
    for (var i = 0; i < 10; i++) {
      param += Math.floor(Math.random() * 36).toString(36);
    }
    this.autoCompleteSearchParams[id] = param;
    textbox.searchParam = param;
    return param;
  }
};

Editor.prototype.cleanupAutoComplete = function () {
  if (this.autoCompleteSearchParams) {
    for (var id in this.autoCompleteSearchParams) {
      Editor.GENERIC_AUTOCOMPLETE.clearCandidates(XulUtils.toXPCOMString(this.autoCompleteSearchParams[id]));
    }
  }
};

Editor.prototype.updateInterval = function (milliseconds) {  //Samit: Enh: Support for speed slider from menu
  var newpos = this.getInterval() + milliseconds;
  if (newpos > this.speedMaxInterval) {
    newpos = this.speedMaxInterval;
  }
  if (newpos < 0) {
    newpos = 0;
  }
  this.setInterval(newpos);
};

Editor.prototype.setInterval = function (milliseconds) {
  document.getElementById("speedSlider").setAttribute("curpos", milliseconds);
};

Editor.prototype.getInterval = function () {
  return parseInt(document.getElementById("speedSlider").getAttribute("curpos"));
};

Editor.prototype.initMenus = function () { };

/*
 * A logger that is shown to user. (i.e. not internal log used with this.log)
 */
Editor.prototype.getUserLog = function () {
  return this.selDebugger.getLog();
};

Editor.GENERIC_AUTOCOMPLETE = Components.classes["@mozilla.org/autocomplete/search;1?name=selenium-ide-generic"].getService(Components.interfaces.nsISeleniumIDEGenericAutoCompleteSearch);

//

function AbstractReference() { };

AbstractReference.prototype.load = function (frame) {
  var self = this;
  this.frame = document.getElementById("helpView");
  this.frame.addEventListener("load", function () {
    if (self.selectedDefinition) {
      self.doShow();
    }
  }, true);
};

AbstractReference.prototype.show = function (def, command) {
  this.selectedDefinition = def;
  this.selectedCommand = command;
  this.doShow();
};

// GeneratedReference: reference generated from iedoc.xml

function GeneratedReference(name) {
  this.name = name;
};

GeneratedReference.prototype = new AbstractReference;

GeneratedReference.prototype.doShow = function (frame) {
  this.frame.contentDocument.body.innerHTML =
  this.selectedDefinition.getReferenceFor(this.selectedCommand);
};

// HTMLReference: reference based on single HTML page

function HTMLReference(name, url) {
  this.name = name;
  this.url = url;
}

HTMLReference.prototype = new AbstractReference;

HTMLReference.prototype.load = function () {
  AbstractReference.prototype.load.call(this);
  this.frame.setAttribute("src", this.url);
};

HTMLReference.prototype.doShow = function () {
  var func = this.selectedDefinition.name.replace(/^(get|is)/, "store");
  this.frame.contentWindow.location.hash = func;
};

//******************************************************************************
/**
 * A reference object must implement the load() and doShow() methods. Since
 * the load() from the AbstractReference prototype is very specific to the
 * helpView functionality, we override it here.
 */
function UIReference(name) {
  this.name = name;
}

UIReference.prototype = new AbstractReference;

UIReference.prototype.load = function () {
  var self = this;
  this.frame = document.getElementById('uiView');
  this.frame.addEventListener('load', function () {
    if (self.selectedDefinition) {
      self.doShow();
    }
  }, true);
};

UIReference.prototype.doShow = function () {
  var uiSpecifierString = this.selectedDefinition;
  var pageset = Editor.uiMap.getPageset(uiSpecifierString);
  var uiElement = Editor.uiMap.getUIElement(uiSpecifierString);

  // name and description
  var html = '<div><span class="target-pageset-name">'
      + pageset.name.escapeHTML2() + '::</span>'
      + '<span class="target-element-name">'
      + uiElement.name.escapeHTML2() + '</span></div>'
      + '<div class="target-pageset-description">'
      + pageset.description.escapeHTML2().formatAsHTML() + '</div>'
      + '<div class="target-element-description">'
      + uiElement.description.escapeHTML2().formatAsHTML() + '</div>'
      + '<dl class="target-arg-list">';
  // arguments
  for (var i = 0; i < uiElement.args.length; ++i) {
    var arg = uiElement.args[i];
    try {
      var defaultValues = arg.getDefaultValues();
      var defaultValuesDisplay = defaultValues.slice(0, 5).join(', ').escapeHTML2();
      var defaultValuesHide = defaultValues.slice(5).join(', ');
      if (defaultValues.length > 5) {
        defaultValuesDisplay += ', <a onclick="this.innerHTML=\'' + defaultValuesHide.escapeHTML2() + '\'">...</a>';
      }
      defaultValuesDisplay = '[ ' + defaultValuesDisplay + ' ]';
    }
    catch (e) {
      defaultValuesDisplay = 'default values dynamically constructed';
    }
    html += '<dt class="target-arg-name">'
      + arg.name.escapeHTML2() + '</dt><dd class="target-arg-description">'
      + '<div>' + arg.description.escapeHTML2().formatAsHTML() + '</div>'
      + '<div class="target-arg-default-values">'
      + defaultValuesDisplay + '</div></dd>';
  }
  html += '</dl>';
  html += '<dl class="example-list"><dt class="example-title">'
      + 'current specifier maps to locator:</dt>';
  html += '<dd class="example-locator">'
      + Editor.uiMap.getLocator(uiSpecifierString).escapeHTML2().replace(/undefined/g, '<span class="undefined">undefined</span>')
      + '</dd></dl>';
  var uiView = document.getElementById('uiView');
  uiView.contentDocument.body.innerHTML = html;
};

function RollupReference(name) {
  this.name = name;
}

RollupReference.prototype = new AbstractReference;

RollupReference.prototype.load = function () {
  var self = this;
  this.frame = document.getElementById('rollupView');
  this.frame.addEventListener('load', function () {
    if (self.selectedDefinition) {
      self.doShow();
    }
  }, true);
};

RollupReference.prototype.doShow = function () {
  var rule = this.selectedDefinition;
  var command = this.selectedCommand;

  // name and description
  var html = '<div class="rollup-name">'
      + rule.name.escapeHTML2() + '</div>'
      + '<div class="rollup-description">'
      + rule.description.escapeHTML2().formatAsHTML() + '</div>'
      + '<div><span class="rollup-pre-header">preconditions</span>: '
      + '<span class="rollup-pre">'
      + rule.pre.escapeHTML2().formatAsHTML() + '</span></div>'
      + '<div><span class="rollup-post-header">postconditions</span>: '
      + '<span class="rollup-post">'
      + rule.post.escapeHTML2().formatAsHTML() + '</span></div>'
      + '<dl class="rollup-arg-list">';
  // arguments
  for (i = 0; i < rule.args.length; ++i) {
    var arg = rule.args[i];
    var exampleValues = arg.exampleValues || [];
    var exampleValuesDisplay = exampleValues.slice(0, 5).join(', ').escapeHTML2();
    var exampleValuesHide = exampleValues.slice(5).join(', ');
    if (exampleValues.length > 5) {
      exampleValuesDisplay += ', <a onclick="this.innerHTML=\'' + exampleValuesHide.escapeHTML2() + '\'">...</a>';
    }
    exampleValuesDisplay = '[ ' + exampleValuesDisplay + ' ]';
    html += '<dt class="rollup-arg-name">'
        + arg.name.escapeHTML2() + '</dt><dd class="rollup-arg-description">'
        + '<div>' + arg.description.escapeHTML2().formatAsHTML() + '</div>'
        + '<div class="rollup-arg-example-values">'
        + exampleValuesDisplay + '</div></dd>';
  }
  html += '</dl>';
  html += '<dl class="example-list"><dt class="example-title">current rollup expands to:</dt>'
  var expandedCommands = rule.getExpandedCommands(command.value);
  for (var i = 0; i < expandedCommands.length; ++i) {
    html += '<dd class="example-command">'
        + expandedCommands[i].toString().escapeHTML2().replace(/undefined/g, '<span class="undefined">undefined</span>')
        + '</dd>';
  }
  html += '</dl>';

  var rollupView = document.getElementById('rollupView');
  rollupView.contentDocument.body.innerHTML = html;
};

//******************************************************************************

Editor.references = [];

Editor.prototype.selectDefaultReference = function () {
  this.reference = Editor.references[0];
  this.reference.load();
  this.uiReference = Editor.references[2];
  this.uiReference.load();
  this.rollupReference = Editor.references[3];
  this.rollupReference.load();
};

Editor.references.push(new GeneratedReference("Generated"));
Editor.references.push(new HTMLReference("Internal HTML", "chrome://selenium-ide/content/selenium-core/reference.html"));
Editor.references.push(new UIReference('UI-Element'));
Editor.references.push(new RollupReference('Rollup'));
//Editor.references.push(new HTMLReference("Japanese", "Reference HTML contained in Selenium IDE", "http://wiki.openqa.org/display/SEL/Selenium+0.7+Reference+%28Japanese%29"));

/*
 * InfoPanel
 */

Editor.InfoPanel = function (editor) {
  this.logView = new Editor.LogView(this, editor);
  this.helpView = new Editor.HelpView(this);
  this.uiView = new Editor.UIView(this);
  this.rollupView = new Editor.RollupView(this);
  this.currentView = this.logView;
};

Editor.InfoPanel.prototype.switchView = function (view) {
  if (this.currentView == view) {
    return;
  }
  this.currentView.hide();
  view.show();
  this.currentView = view;
};

/*
 * InfoView
 */

Editor.InfoView = function () { };

Editor.InfoView.prototype.show = function () {
  document.getElementById(this.name + "View").style.display = "block";
  document.getElementById(this.name + "Tab").setAttribute("selected", "true");
};

Editor.InfoView.prototype.hide = function () {
  document.getElementById(this.name + "Tab").removeAttribute("selected");
  document.getElementById(this.name + "View").style.display = "none";
};

/*
 * LogView
 */

Editor.LogView = function (panel, editor) {
  this.name = "log";
  this.changeLogLevel("1"); // INFO
  this.view = document.getElementById("logView");
  this.panel = panel;
  //this.log = editor.selDebugger.runner.LOG;
  //this.log.observers.push(this.infoPanel.logView);
  var self = this;
  this.view.addEventListener("load", function () {
    self.reload()
  }, true);
};

Editor.LogView.prototype = new Editor.InfoView;

Editor.LogView.prototype.show = function () {
  Editor.InfoView.prototype.show.call(this);
  document.getElementById("logButtons").style.display = "flex";
};

Editor.LogView.prototype.hide = function () {
  Editor.InfoView.prototype.hide.call(this);
  document.getElementById("logButtons").style.display = "none";
} ;

Editor.LogView.prototype.setLog = function (log) {
  this.log = log;
  log.observers.push(this);
};

Editor.LogView.prototype.changeLogLevel = function (level, reload) {
  var filterElement = document.getElementById("logFilter");
  var popup = document.getElementById("logFilterPopup");
  this.filterValue = level;
  for (var i = 0; i < popup.childNodes.length; i++) {
    var node = popup.childNodes[i];
    if (level == node.value) {
      filterElement.label = node.label;
      break;
    }
  }

  if (reload) {
    this.reload();
  }
};

Editor.LogView.prototype.getLogElement = function () {
  return this.view.contentDocument.getElementById("log");
};

Editor.LogView.prototype.isHidden = function () {
  return this.view.hidden || this.getLogElement() == null;
};

Editor.LogView.prototype.clear = function () {
  if (!this.isHidden() && this.log) {
    this.log.clear();
  }
};

Editor.LogView.prototype.onClear = function () {
  if (!this.isHidden()) {
    var nodes = this.getLogElement().childNodes;
    var i;
    for (i = nodes.length - 1; i >= 0; i--) {
      this.getLogElement().removeChild(nodes[i]);
    }
  }
};

Editor.LogView.prototype.reload = function () {
  if (!this.isHidden() && this.log) {
    var self = this;
    this.onClear();
    this.log.entries.forEach(function (entry) {
      self.onAppendEntry(entry);
    });
  }
};

Editor.LogView.prototype.onAppendEntry = function (entry) {
  var levels = {debug: 0, info: 1, warn: 2, error: 3};
  var entryValue = levels[entry.level];
  var filterValue = parseInt(this.filterValue);
  if (filterValue <= entryValue) {
    //Samit: Fix: If another pane is active, the entry is lost
    if (this.isHidden()) {
      this.panel.switchView(this);
    }
    var newEntry = this.view.contentDocument.createElement('li');
    newEntry.className = entry.level;
    newEntry.appendChild(this.view.contentDocument.createTextNode(entry.line()));
    this.getLogElement().appendChild(newEntry);
    newEntry.scrollIntoView();
  }
};

/*
 * HelpView
 */

Editor.HelpView = function () {
  this.name = "help";
};

Editor.HelpView.prototype = new Editor.InfoView;

Editor.UIView = function () {
  this.name = 'ui';
};

Editor.UIView.prototype = new Editor.InfoView;

Editor.RollupView = function () {
  this.name = 'rollup';
};

Editor.RollupView.prototype = new Editor.InfoView;

/*
 * LastWindow is is a safe way to keep the last window information to avoid the dead object
 * error in Firefox
 */
function LastWindow() {
  this.window = null;
  this.path = [];
}

LastWindow.prototype.setWindow = function (window) {
  if (this.window != window) {
    this.window = window;
    this.parent = window.parent;
    this.name = window.name;
    this.isTopLevel = window == window.parent;
    this.topName = window.top.name;
    this.path = this.createPath(window);
  }
};

LastWindow.prototype.windowEquals = function (window) {
  if (this.window == null || window == null) {
    return false;
  }
  return window == this.window;
};

LastWindow.prototype.isSameWindow = function (window) {
  if (this.window == null || window == null) {
    return false;
  }
  if (this.isTopLevel && window == window.parent) {
    // top level window
    return this.name == window.name;
  } else if (this.parent == window.parent) {
    // frame
    return this.name == window.name;
  }
  return false;
};

LastWindow.prototype.isSameTopWindow = function (window) {
  if (this.window == null || window == null) {
    return false;
  }
  if (this.isTopLevel && window.top == window.top.parent) {
    // top level window
    return this.topName == window.top.name;
  }
  return false;
};

LastWindow.prototype.getPath = function () {
  return this.path;
};

// create the path represented as an array from top level window to the specified frame
LastWindow.prototype.createPath = function (window) {
  var path = [];
  var lastWindow = null;
  while (window != lastWindow) {
    path.unshift(window);
    lastWindow = window;
    window = lastWindow.parent;
  }
  return path;
};
