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
function Editor(window, isSidebar) {
	this.log.debug("initializing");
	this.window = window;
	window.editor = this;
	var self = this;
	this.isSidebar = isSidebar;
	this.recordFrameTitle = false;
    this.app = new Application();
    this.app.addObserver({
            baseURLChanged: function() {
                Editor.GENERIC_AUTOCOMPLETE.setCandidates(XulUtils.toXPCOMString(self.getAutoCompleteSearchParam("baseURL")),
                                                          XulUtils.toXPCOMArray(self.app.getBaseURLHistory()));
                document.getElementById("baseURL").value = self.app.getBaseURL();
            },

            testSuiteChanged: function(testSuite) {
                testSuite.addObserver(this._testSuiteObserver);
                if (testSuite.file) {
                    document.getElementById("suiteTreeSplitter").setAttribute("state", "open");
                }
                self.suiteTreeView.refresh();
            },
            
            testSuiteUnloaded: function(testSuite) {
                testSuite.removeObserver(this._testSuiteObserver);
            },
            
            testCaseChanged: function(testCase) {
                // this.view is not set yet when setTestCase is called from constructor
                if (self.view) {
                    self.view.testCase = testCase;
                    self.view.refresh();
                    self.updateTitle();
                }
                testCase.addObserver(this._testCaseObserver);
            },

            testCaseUnloaded: function(testCase) {
                testCase.removeObserver(this._testCaseObserver);
            },

            currentFormatChanged: function(format) {
                self.updateViewTabs();
                self.updateState();
            },

            clipboardFormatChanged: function(format) {
            },

            _testCaseObserver: {
                modifiedStateUpdated: function() {
                    self.updateTitle();
                }
            },

            _testSuiteObserver: {
                testCaseAdded: function() {
                    document.getElementById("suiteTreeSplitter").setAttribute("state", "open");
                }
            }
        });

	this.document = document;
	this.app.initOptions();
	this.loadExtensions();
	this.loadSeleniumAPI();
	this.selectDefaultReference();
    this.toggleRecordingEnabled(true);
	this.treeView = new TreeView(this, document, document.getElementById("commands"));
	this.sourceView = new SourceView(this, document.getElementById("source"));
    this.suiteTreeView = new SuiteTreeView(this, document.getElementById("suiteTree"));
	//this.toggleView(this.treeView);
	
	// "debugger" cannot be used since it is a reserved word in JS
	this.selDebugger = new Debugger(this);
    this.selDebugger.addObserver({
            stateUpdated: function(state) {
                if (state == Debugger.PAUSED) {
                    document.getElementById("pause-button").setAttribute("class", "icon resume");
                } else {
                    document.getElementById("pause-button").setAttribute("class", "icon pause");
                }
                self.updateState();
            }
        });
	
	//top.document.commandDispatcher.getControllers().appendController(Editor.controller);
	//window.controllers.appendController(Editor.controller);
	top.controllers.appendController(Editor.controller);

	//window.controllers.appendController(controller);

	this.updateViewTabs();
    this.infoPanel = new Editor.InfoPanel(this);
    this.app.newTestSuite();
    
	//top.document.commandDispatcher.updateCommands("selenium-ide-state");

	document.addEventListener("focus", Editor.checkTimestamp, false);
	
	this.log.info("initialized");
	
	setTimeout("editor.showLoadErrors()", 500);
	
	if (isSidebar) {
		Recorder.registerForWindow(window.parent, this);
	} else {
		Recorder.registerAll(this);
	}
}

Editor.checkTimestamp = function() {
	editor.log.debug('checkTimestamp');
	if (editor.app.getTestCase().checkTimestamp()) {
		if (window.confirm(Editor.getString('confirmReload'))) {
			var testCase = editor.app.getCurrentFormat().loadFile(editor.getTestCase().file);
			if (testCase) {
				editor.app.setTestCase(testCase);
			}
		}
	}
}

Editor.getString = function(key) {
    return document.getElementById("strings").getString(key);
}

Editor.controller = {
	supportsCommand : function(cmd) {
		//Editor.log.debug("supportsCommand");
		switch (cmd) {
		case "cmd_close":
		case "cmd_open":
        case "cmd_new_suite":
		case "cmd_open_suite":
		case "cmd_save":
		case "cmd_save_suite":
		case "cmd_save_suite_as":
		case "cmd_selenium_play":
		case "cmd_selenium_play_suite":
		case "cmd_selenium_pause":
		case "cmd_selenium_step":
		case "cmd_selenium_testrunner":
			return true;
		default:
			return false;
		}
	},
	isCommandEnabled : function(cmd){
		//Editor.log.debug("isCommandEnabled");
		switch (cmd) {
		case "cmd_close":
		case "cmd_open":
		case "cmd_new_suite":
		case "cmd_open_suite":
		case "cmd_save":
		case "cmd_save_suite":
		case "cmd_save_suite_as":
			return true;
		case "cmd_selenium_testrunner":
		case "cmd_selenium_play":
		case "cmd_selenium_play_suite":
		    return editor.app.getCurrentFormat().getFormatter().playable && editor.selDebugger.state != Debugger.PLAYING;
		case "cmd_selenium_pause":
		    return editor.app.getCurrentFormat().getFormatter().playable && (editor.selDebugger.state == Debugger.PLAYING || editor.selDebugger.state == Debugger.PAUSED);
		case "cmd_selenium_step":
			return editor.app.getCurrentFormat().getFormatter().playable && editor.selDebugger.state == Debugger.PAUSED;
		default:
			return false;
		}
	},
	doCommand : function(cmd) {
		Editor.log.debug("doCommand: " + cmd);
		switch (cmd) {
		case "cmd_close": if (editor.confirmClose()) { window.close(); } break;
		case "cmd_save": editor.saveTestCase(); break;
		case "cmd_open": editor.app.loadTestCaseWithNewSuite(); break;
		case "cmd_new_suite": editor.app.newTestSuite(); break;
		case "cmd_open_suite": editor.app.loadTestSuite(); break;
		case "cmd_save_suite": editor.app.saveTestSuite(); break;
		case "cmd_save_suite_as": editor.app.saveNewTestSuite(); break;
		case "cmd_selenium_play":
            editor.playCurrentTestCase();
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
		case "cmd_selenium_testrunner":
			editor.playback();
			break;
		default:
		}
	},
	onEvent : function(evt) {}
};

Editor.prototype.showLoadErrors = function() {
	if (this.errorMessage) {
		window.alert(this.errorMessage);
		delete this.errorMessage;
	}
}

Editor.DEFAULT_TITLE = "Selenium IDE";

Editor.prototype.confirmClose = function() {
	if (this.getTestCase() && this.getTestCase().modified) {
		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
		    .getService(Components.interfaces.nsIPromptService);
		
		var flags = 
			promptService.BUTTON_TITLE_SAVE * promptService.BUTTON_POS_0 +
			promptService.BUTTON_TITLE_CANCEL * promptService.BUTTON_POS_1 +
			promptService.BUTTON_TITLE_DONT_SAVE * promptService.BUTTON_POS_2;
		
		var result = promptService.confirmEx(window, "Save test?",
											 "Would you like to save the test?",
											 flags, null, null, null, null, {});
		
		switch (result) {
		case 0:
			return this.saveTestCase();
		case 1:
			return false;
		case 2:
			return true;
		}
	}
	return true;
}

Editor.prototype.log = Editor.log = new Log("Editor");

Editor.prototype.unload = function() {
    this.app.saveState();

	if (this.isSidebar) {
		//this.log.debug("deregister: window=" + window + ", getBrowser=" + window.getBrowser);
		Recorder.deregisterForWindow(window.parent, this);
	} else {
		Recorder.deregisterAll(this);
	}
	top.controllers.removeController(Editor.controller);

    this.cleanupAutoComplete();
    
	delete window.editor;
}

Editor.prototype.updateState = function() {
	window.document.commandDispatcher.updateCommands("selenium-ide-state");
}

Editor.prototype.updateSeleniumCommands = function() {
	this.log.debug("updateSeleniumCommands");
	["cmd_selenium_play_suite", "cmd_selenium_play", "cmd_selenium_pause", "cmd_selenium_step", "cmd_selenium_testrunner"].
		forEach(function(cmd) {
					goUpdateCommand(cmd);
				});
}

Editor.prototype.getOptions = function(options) {
    return this.app.getOptions();
}

Editor.prototype.populateRecentTestSuites = function(e) {
    XulUtils.clearChildren(e);
    var files = Preferences.getArray("recentTestSuites");
    for (var i = 0; i < files.length; i++) {
        var file = FileUtils.getFile(files[i]);
        XulUtils.appendMenuItem(e, {
                label: shortenPath(file),
                value: file.path
            });
    }

    function shortenPath(file) {
        var nodes = FileUtils.splitPath(file.parent);
        if (nodes.length > 2) {
            nodes.splice(0, nodes.length - 2);
            nodes.unshift("...");
        }
        return file.leafName + " [" + nodes.join("/") + "]";
    }
}

Editor.prototype.updateTitle = function() {
	var title;
    var testCase = this.getTestCase();
	if (testCase && testCase.file) {
		title = testCase.file.leafName + " - " + Editor.DEFAULT_TITLE;
	} else {
		title = Editor.DEFAULT_TITLE;
	}
	if (testCase && testCase.modified) {
		title += " *";
	}
	document.title = title;
}

Editor.prototype.tabSelected = function(id) {
	if (this.getTestCase() != null) {
		this.log.debug("tabSelected: id=" + id);
		if (id == 'sourceTab') {
			this.toggleView(this.sourceView);
		} else if (id == 'editorTab') {
			this.toggleView(this.treeView);
		}
	}
}

Editor.prototype.saveTestCase = function() {
	this.view.syncModel();
	if (this.app.saveTestCase()) {
		//document.getElementById("filename").value = this.testCase.filename;
		return true;
	} else {
		return false;
	}
}

Editor.prototype.saveNewTestCase = function() {
	this.view.syncModel();
	if (this.app.saveNewTestCase()) {
		//document.getElementById("filename").value = this.testCase.filename;
		this.updateTitle();
	}
}

Editor.prototype.exportTestCaseWithFormat = function(format) {
	this.view.syncModel();
	format.saveAsNew(this.getTestCase().createCopy(), true);
}

Editor.prototype.loadRecorderFor = function(contentWindow, isRootDocument) {
	this.log.debug("loadRecorderFor: " + contentWindow);
	if (this.recordingEnabled && (isRootDocument || this.recordFrameTitle) &&
		contentWindow == this.lastWindow) {
		this.recordTitle(contentWindow);
	}
	Recorder.register(this, contentWindow);
	this.checkForTestRunner(contentWindow);
}

Editor.prototype.toggleRecordingEnabled = function(enabled) {
	this.recordingEnabled = enabled;
    var tooltip = Editor.getString("recordButton.tooltip." + (enabled ? "on" : "off"));
    document.getElementById("record-button").setAttribute("tooltiptext", tooltip);
}

Editor.prototype.onUnloadDocument = function(doc) {
    this.log.debug("onUnloadDocument");
    var window = doc.defaultView;
    var self = this;
    setTimeout(function() {
            self.appendWaitForPageToLoad(window);
        }, 0);
}

Editor.prototype.recordTitle = function(window) {
	if (this.getOptions().recordAssertTitle == 'true' && this.getTestCase().commands.length > 0) {
		//setTimeout("addCommand", 200, "assertTitle", window.document.title, null, window);
		this.addCommand("assertTitle", exactMatchPattern(window.document.title), null, window);
	}
}

Editor.prototype.getPathAndUpdateBaseURL = function(window) {
	if (!window || !window.location) return;
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
}

Editor.prototype.clear = function(force) {
	if (this.getTestCase() != null) {
		if (force || confirm("Really clear the test?")) {
			this.getTestCase().clear();
			this.view.refresh();
			this.log.debug("cleared");
			return true;
		}
	}
	return false;
}

// create the path represented as an array from top level window to the specified frame
Editor.prototype._createPaths = function(window) {
    var path = [];
    var lastWindow = null;
    while (window != lastWindow) {
        path.unshift(window);
        lastWindow = window;
        window = lastWindow.parent;
    }
    return path;
}

Editor.prototype._getTopWindow = function(window) {
    if (this.topWindow) {
        var top = this.topWindow; // for functional test of Selenium IDE
        delete this.topWindow;
        return top;
    } else {
        return window.top;
    }
}

Editor.prototype._isSameWindow = function(w1, w2) {
    if (w1 == null || w2 == null) return false;
    if (w1 == w1.parent && w2 == w2.parent) {
        // top level window
        return w1.name == w2.name;
    } else if (w1.parent == w2.parent) {
        // frame
        return w1.name == w2.name;
    } else {
        return false;
    }
}

Editor.prototype.addCommand = function(command,target,value,window) {
    this.log.debug("addCommand: command=" + command + ", target=" + target + ", value=" + value + " window.name=" + window.name);
    if (this.lastWindow) {
        this.log.debug("window.name=" + window.name + ", lastWindow.name=" + this.lastWindow.name);
    } else {
        this.log.debug("window.name=" + window.name);
    }
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
        if (this.lastWindow != null &&
            !this._isSameWindow(this.lastWindow, window)) {
            if (this._isSameWindow(window.top, this.lastWindow.top)) {
                // frame
                var destPath = this._createPaths(window);
                var srcPath = this._createPaths(this.lastWindow);
                this.log.debug("selectFrame: srcPath.length=" + srcPath.length + ", destPath.length=" + destPath.length);
                var branch = 0;
                var i;
                for (i = 0;; i++) {
                    if (i >= destPath.length || i >= srcPath.length) break;
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
                if (window.name == '') {
                    windowName = 'null';
                }
                this.addCommand('selectWindow', windowName, '', window);
            }
        }
	}
	//resultBox.inputField.scrollTop = resultBox.inputField.scrollHeight - resultBox.inputField.clientHeight;
    this.clearLastCommand();
	this.lastWindow = window;

	this.lastCommandIndex = this.view.getRecordIndex();
	this.getTestCase().commands.splice(this.lastCommandIndex, 0, new Command(command, target, value));
	this.view.rowInserted(this.lastCommandIndex);
	this.timeoutID = setTimeout("editor.clearLastCommand()", 300);
}

Editor.prototype.clearLastCommand = function() {
	this.lastCommandIndex = null;
	if (this.timeoutID != null) {
		clearTimeout(this.timeoutID);
        this.timeoutID = null;
	}
}

Editor.prototype.appendWaitForPageToLoad = function(window) {
    this.log.debug("appendWaitForPageToLoad");
    if (window != this.lastWindow) {
        this.log.debug("window did not match");
        return;
    }
	var lastCommandIndex = this.lastCommandIndex;
	if (lastCommandIndex == null || lastCommandIndex >= this.getTestCase().commands.length) {
		return;
	}
	this.lastCommandIndex = null;
	var lastCommand = this.getTestCase().commands[lastCommandIndex];
	if (lastCommand.type == 'command' && 
		!lastCommand.command.match(/^(assert|verify|store)/)) {
		if (this.app.getCurrentFormat().getFormatter().remoteControl) {
			this.addCommand("waitForPageToLoad", this.getOptions().timeout, null, this.lastWindow);
		} else {
			lastCommand.command = lastCommand.command + "AndWait";
			this.view.rowUpdated(lastCommandIndex);
		}
	}
    this.clearLastCommand();
	//updateSource();
}

Editor.prototype.openSeleniumIDEPreferences = function() {
	window.openDialog("chrome://selenium-ide/content/optionsDialog.xul", "options", "chrome,modal,resizable", null);
}

Editor.prototype.checkForTestRunner = function(contentWindow) {
	if (this.loadTestRunner && contentWindow.location && contentWindow.location.href) {
		var location = contentWindow.location.href;
		var n = location.indexOf('?');
		if (n >= 0) {
			location = location.substring(0, n);
		}
		if ('chrome://selenium-ide/content/PlayerTestSuite.html' == location) {
			this.log.debug('setting editor to TestRunner window ' + contentWindow.top);
			contentWindow.top.editor = this;
			this.loadTestRunner = false;
		}
	}
}

Editor.prototype.showInBrowser = function(url, newWindow) {
    if (newWindow) {
        return this.window.open(url);
    } else {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        var window = wm.getMostRecentWindow('navigator:browser');
        var contentWindow = window.getBrowser().contentWindow;
        contentWindow.location.href = url;
        return window;
    }
}

Editor.prototype.playCurrentTestCase = function(next) {
    var self = this;
    this.selDebugger.start(function(failed) {
            self.log.debug("finished execution of test case: failed=" + failed);
            var testCase = self.suiteTreeView.getCurrentTestCase();
            if (testCase) {
                testCase.testResult = failed ? "failed" : "passed";
            } else {
                self.log.error("current test case not found");
            }
            self.suiteTreeView.currentRowUpdated();
            if (next) next();
        });
}

Editor.prototype.playTestSuite = function(index) {
    var index = -1;
    this.app.getTestSuite().tests.forEach(function(test) {
            if (test.testResult) {
                delete test.testResult;
            }
        });
    this.suiteTreeView.refresh();
    var self = this;
    (function() {
        if (++index < self.app.getTestSuite().tests.length) {
            self.suiteTreeView.scrollToRow(index);
            self.app.showTestCaseFromSuite(self.app.getTestSuite().tests[index]);
            self.playCurrentTestCase(arguments.callee);
        }
    })();
}

Editor.prototype.playback = function(newWindow, resultCallback) {
	// disable recording
	this.setRecordingEnabled(false);

	this.loadTestRunner = true;
    this.testRunnerResultCallback = resultCallback;
    var auto = resultCallback != null;

    this.showInBrowser('chrome://selenium-ide/content/selenium/TestRunner.html?test=/content/PlayerTestSuite.html' + 
                       '&userExtensionsURL=' + encodeURI(ExtensionsLoader.getURLs(this.getOptions().userExtensionsURL).join(',')) +
                       '&baseUrl=' + this.app.getBaseURL() +
                       (auto ? "&auto=true" : ""), 
                       newWindow);
}

Editor.prototype.loadTestSuiteToTestRunner = function(e) {
    var content = "<table id=\"suiteTable\" cellpadding=\"1\" cellspacing=\"1\" border=\"1\" class=\"selenium\"><tbody>\n";
    content += "<tr><td><b>Test Suite</b></td></tr>\n";
    var testSuite = this.app.getTestSuite();
    for (var i = 0; i < testSuite.tests.length; i++) {
        var testCase = testSuite.tests[i];
        content += "<tr><td><a href=\"PlayerTest.html?" + i + "\">" +
            testCase.getTitle() + "</a></td></tr>\n";
    }
    content += "</tbody></table>\n";
    e.innerHTML = content;
}

Editor.prototype.loadTestCaseToTestRunner = function(e, index) {
    this.log.debug("loading test index #" + index + " into test runner");
    var testSuite = this.app.getTestSuite();
    var testCaseInfo = testSuite.tests[index];
    var testCase = testCaseInfo.content || this.app.getCurrentFormat().loadFile(testCaseInfo.getFile(), false);
	e.innerHTML = this.app.getFormats().getDefaultFormat().getFormatter().format(testCase, testCaseInfo.getTitle(), false, true);
}

Editor.prototype.openLogWindow = function() {
	if (!LOG.getLogWindow()) {
		LOG.logWindow = window.open(
            "chrome://selenium-ide/content/selenium/SeleniumLog.html", "SeleniumLog",
            "chrome,width=600,height=250,bottom=0,right=0,status,scrollbars,resizable"
		);
	}
}

Editor.prototype.onPopupOptions = function() {
	document.getElementById("clipboardFormatMenu").setAttribute("disabled", !editor.app.getCurrentFormat().getFormatter().playable);
	document.getElementById("internalTestsMenu").setAttribute("hidden", this.getOptions().showInternalTestsMenu == null);
}

Editor.prototype.populateFormatsPopup = function(e, format) {
    XulUtils.clearChildren(e);
	var formats = this.app.getFormats().formats;
	for (i = 0; i < formats.length; i++) {
        XulUtils.appendMenuItem(e, {
                    type: "radio",
                    name: "formats",
                    label: formats[i].name,
                    value: formats[i].id,
                    checked: (format && format.id == formats[i].id) ? true : null});
	}
}

Editor.prototype.updateViewTabs = function() {
	var editorTab = document.getElementById('editorTab');
	var tabs = document.getElementById('viewTabs');
	if (this.app.getCurrentFormat().getFormatter().playable) {
		editorTab.collapsed = false;
		this.toggleView(this.view || this.treeView);
	} else {
		tabs.selectedIndex = 1;
		this.toggleView(this.sourceView);
		editorTab.collapsed = true;
	}
	this.updateState();
}


Editor.prototype.getBaseURL = function() {
    return this.app.getBaseURL();
}

Editor.prototype.getTestCase = function() {
    return this.app.getTestCase();
}

Editor.prototype.toggleView = function(view) {
	this.log.debug("toggle view");
	if (this.view != null) {
		this.view.onHide();
	}
	var previous = this.view;
	this.view = view;
	if (previous) previous.syncModel(true);
	this.view.testCase = this.getTestCase();
	this.view.refresh();
}

Editor.prototype.showAlert = function(message) {
	this.errorMessage = message;
	//	window.alert(message);
}

Editor.prototype.setRecordingEnabled = function(enabled) {
	document.getElementById("record-button").checked = enabled;
	this.toggleRecordingEnabled(enabled);
}

/*
 * Load default options.
 * Used for self-testing Selenium IDE.
 */
Editor.prototype.loadDefaultOptions = function() {
	this.app.setOptions(Preferences.DEFAULT_OPTIONS);
}

Editor.prototype.loadExtensions = function() {
	const subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
	if (this.getOptions().ideExtensionsPaths) {
		try {
			ExtensionsLoader.loadSubScript(subScriptLoader, this.getOptions().ideExtensionsPaths, window);
		} catch (error) {
			this.showAlert("error loading Selenium IDE extensions: " + error);
		}
	}
}

Editor.prototype.loadSeleniumAPI = function() {
	// load API document
	var parser = new DOMParser();
	var document = parser.parseFromString(FileUtils.readURL("chrome://selenium-ide/content/selenium/iedoc-core.xml"), "text/xml");
	Command.apiDocument = document;
	
	// load functions
	this.seleniumAPI = {};
	
	const subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
		.getService(Components.interfaces.mozIJSSubScriptLoader);
	
	subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium/scripts/selenium-api.js', this.seleniumAPI);
	if (this.getOptions().userExtensionsURL) {
		try {
			ExtensionsLoader.loadSubScript(subScriptLoader, this.getOptions().userExtensionsURL, this.seleniumAPI);
		} catch (error) {
			this.showAlert("Failed to load user-extensions.js!\nfiles=" + this.getOptions().userExtensionsURL + "\nerror=" + error);
		}
	}
}

Editor.prototype.showReference = function(command) {
	var def = command.getDefinition();
	if (def) {
        this.infoPanel.switchView(this.infoPanel.helpView);
		this.log.debug("showReference: " + def.name);
		this.reference.show(def, command);
	}
}

Editor.prototype.getAutoCompleteSearchParam = function(id) {
    var textbox = document.getElementById(id);
    if (!this.autoCompleteSearchParams)
        this.autoCompleteSearchParams = {};
    if (this.autoCompleteSearchParams[id]) {
        return this.autoCompleteSearchParams[id];
    } else {
        var param = id + "_";
        for (var i = 0; i < 10; i++) {
            param += Math.floor(Math.random()*36).toString(36);
        }
        this.autoCompleteSearchParams[id] = param;
        textbox.searchParam = param;
        return param;
    }
}

Editor.prototype.cleanupAutoComplete = function() {
    if (this.autoCompleteSearchParams) {
        for (id in this.autoCompleteSearchParams) {
            Editor.GENERIC_AUTOCOMPLETE.clearCandidates(XulUtils.toXPCOMString(this.autoCompleteSearchParams[id]));
        }
    }
}

Editor.GENERIC_AUTOCOMPLETE = Components.classes["@mozilla.org/autocomplete/search;1?name=selenium-ide-generic"].getService(Components.interfaces.nsISeleniumIDEGenericAutoCompleteSearch);

//

function AbstractReference() {
}

AbstractReference.prototype.load = function(frame) {
	var self = this;
    this.frame = document.getElementById("helpView");
	this.frame.addEventListener("load", 
						   function() {
							   if (self.selectedDefinition) {
                                   self.doShow();
                               }
						   }, 
						   true);
}

AbstractReference.prototype.show = function(def, command) {
	this.selectedDefinition = def;
    this.selectedCommand = command;
    this.doShow();
}

// GeneratedReference: reference generated from iedoc.xml

function GeneratedReference(name) {
	this.name = name;
}

GeneratedReference.prototype = new AbstractReference;

GeneratedReference.prototype.doShow = function(frame) {
	this.frame.contentDocument.body.innerHTML = this.selectedDefinition.getReferenceFor(this.selectedCommand);
}

// HTMLReference: reference based on single HTML page

function HTMLReference(name, url) {
	this.name = name;
	this.url = url;
}

HTMLReference.prototype = new AbstractReference;

HTMLReference.prototype.load = function() {
    AbstractReference.prototype.load.call(this);
	this.frame.setAttribute("src", this.url);
}

HTMLReference.prototype.doShow = function() {
	var func = this.selectedDefinition.name.replace(/^(get|is)/, "store");
	this.frame.contentWindow.location.hash = func;
}

Editor.references = [];

Editor.prototype.selectDefaultReference = function() {
	this.reference = Editor.references[0];
	this.reference.load();
}

Editor.references.push(new GeneratedReference("Generated"));
Editor.references.push(new HTMLReference("Internal HTML", "chrome://selenium-ide/content/selenium/reference.html"));
//Editor.references.push(new HTMLReference("Japanese", "Reference HTML contained in Selenium IDE", "http://wiki.openqa.org/display/SEL/Selenium+0.7+Reference+%28Japanese%29"));

/*
 * InfoPanel
 */

Editor.InfoPanel = function(editor) {
    this.logView = new Editor.LogView(this, editor);
    this.helpView = new Editor.HelpView(this);
    this.currentView = this.logView;
}

Editor.InfoPanel.prototype.switchView = function(view) {
	if (this.currentView == view) return;
    this.currentView.hide();
    view.show();
	this.currentView = view;
}

/*
 * InfoView
 */

Editor.InfoView = function() {
}

Editor.InfoView.prototype.show = function() {
	document.getElementById(this.name + "View").hidden = false;
	document.getElementById(this.name + "Tab").setAttribute("selected", "true");
}

Editor.InfoView.prototype.hide = function() {
	document.getElementById(this.name + "Tab").removeAttribute("selected");
	document.getElementById(this.name + "View").hidden = true;
}

/*
 * LogView
 */

Editor.LogView = function(panel, editor) {
    this.name = "log";
    this.changeLogLevel("1"); // INFO
	this.view = document.getElementById("logView");
    this.panel = panel;
    //this.log = editor.selDebugger.runner.LOG;
    //this.log.observers.push(this.infoPanel.logView);
    var self = this;
	this.view.addEventListener("load", function() { self.reload() }, true);
}

Editor.LogView.prototype = new Editor.InfoView;

Editor.LogView.prototype.show = function() {
    Editor.InfoView.prototype.show.call(this);
    document.getElementById("logButtons").hidden = false;
}

Editor.LogView.prototype.hide = function() {
    Editor.InfoView.prototype.hide.call(this);
    document.getElementById("logButtons").hidden = true;
}

Editor.LogView.prototype.setLog = function(log) {
    this.log = log;
    log.observers.push(this);
}

Editor.LogView.prototype.changeLogLevel = function(level, reload) {
    var filterElement = document.getElementById("logFilter");
    var popup = document.getElementById("logFilterPopup");
    this.filterValue = level;
    var i;
    for (i = 0; i < popup.childNodes.length; i++) {
        var node = popup.childNodes[i];
        if (level == node.value) {
            filterElement.label = node.label;
            break;
        }
    }

    if (reload) {
        this.reload();
    }
}

Editor.LogView.prototype.getLogElement = function() {
	return this.view.contentDocument.getElementById("log");
}

Editor.LogView.prototype.isHidden = function() {
	return this.view.hidden || this.getLogElement() == null;
}

Editor.LogView.prototype.clear = function() {
    if (!this.isHidden() && this.log) {
        this.log.clear();
    }
}

Editor.LogView.prototype.onClear = function() {
	if (!this.isHidden()) {
		var nodes = this.getLogElement().childNodes;
		var i;
		for (i = nodes.length - 1; i >= 0; i--) {
			this.getLogElement().removeChild(nodes[i]);
		}
	}
}

Editor.LogView.prototype.reload = function() {
	if (!this.isHidden() && this.log) {
		var self = this;
		this.onClear();
		this.log.entries.forEach(function(entry) { self.onAppendEntry(entry); });
	}
}

Editor.LogView.prototype.onAppendEntry = function(entry) {
    var levels = { debug: 0, info: 1, warn: 2, error: 3 };
    var entryValue = levels[entry.level];
    var filterValue = parseInt(this.filterValue);
    if (filterValue <= entryValue) {
        if (!this.isHidden()) {
			var newEntry = this.view.contentDocument.createElement('li');
			newEntry.className = entry.level;
			newEntry.appendChild(this.view.contentDocument.createTextNode(entry.line()));
			this.getLogElement().appendChild(newEntry);
			newEntry.scrollIntoView();
        } else {
            this.panel.switchView(this);
        }
    }
}

/*
 * HelpView
 */

Editor.HelpView = function() {
    this.name = "help";
}

Editor.HelpView.prototype = new Editor.InfoView;
