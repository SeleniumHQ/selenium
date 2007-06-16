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

this.Preferences = SeleniumIDE.Preferences;

function Editor(window, isSidebar) {
	this.log.debug("initializing");
	this.window = window;
	window.editor = this;
	var self = this;
	this.isSidebar = isSidebar;
	this.recordFrameTitle = false;
	this.document = document;
	this.setOptions(Preferences.load());
	this.loadExtensions();
	this.loadSeleniumAPI();
	this.selectDefaultReference();
    this.toggleRecordingEnabled(true);
	this.treeView = new TreeView(this, document, document.getElementById("commands"));
	this.sourceView = new SourceView(this, document.getElementById("source"));
    this.addObserver({
            _testCaseObserver: {
                modifiedStateUpdated: function() {
                    self.updateTitle();
                }
            },
                
            testCaseLoaded: function(testCase) {
                if (self.view) {
                    self.view.testCase = testCase;
                }
                testCase.addObserver(this._testCaseObserver);
            },

            testCaseUnloaded: function(testCase) {
                testCase.removeObserver(this._testCaseObserver);
            }
        });
    this.suiteTreeView = new SuiteTreeView(this, document.getElementById("suiteTree"));
    this.newTestSuite();
	this.initOptions();
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
	if (editor.testCase.checkTimestamp()) {
		if (window.confirm(Editor.getString('confirmReload'))) {
			var testCase = editor.currentFormat.loadFile(editor.testCase.file);
			if (testCase) {
				editor.setTestCase(testCase);
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
			return true;
		case "cmd_selenium_testrunner":
		case "cmd_selenium_play":
		case "cmd_selenium_play_suite":
		    return editor.currentFormat.getFormatter().playable && editor.selDebugger.state != Debugger.PLAYING;
		case "cmd_selenium_pause":
		    return editor.currentFormat.getFormatter().playable && (editor.selDebugger.state == Debugger.PLAYING || editor.selDebugger.state == Debugger.PAUSED);
		case "cmd_selenium_step":
			return editor.currentFormat.getFormatter().playable && editor.selDebugger.state == Debugger.PAUSED;
		default:
			return false;
		}
	},
	doCommand : function(cmd) {
		Editor.log.debug("doCommand: " + cmd);
		switch (cmd) {
		case "cmd_close": if (editor.confirmClose()) { window.close(); } break;
		case "cmd_save": editor.saveTestCase(); break;
		case "cmd_open": editor.loadTestCaseWithNewSuite(); break;
		case "cmd_new_suite": editor.newTestSuite(); break;
		case "cmd_open_suite": editor.loadTestSuite(); break;
		case "cmd_save_suite": editor.saveTestSuite(); break;
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
	if (this.testCase && this.testCase.modified) {
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
	if (this.options.rememberBaseURL == 'true'){
		this.options.baseURL = document.getElementById("baseURL").value;
		Preferences.save(this.options, 'baseURL');
	}
	
	if (this.isSidebar) {
		//this.log.debug("deregister: window=" + window + ", getBrowser=" + window.getBrowser);
		Recorder.deregisterForWindow(window.parent, this);
	} else {
		Recorder.deregisterAll(this);
	}
	top.controllers.removeController(Editor.controller);

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

Editor.prototype.setOptions = function(options) {
	this.options = options;
	this.formats = new FormatCollection(options);
	this.currentFormat = this.formats.selectFormat(options.selectedFormat || null);
	this.clipboardFormat = this.formats.selectFormat(options.clipboardFormat || null);
}

Editor.prototype.initOptions = function() {
	if (this.options.rememberBaseURL == 'true' && this.options.baseURL != null){
		if (document.getElementById("baseURL").value == '') {
			document.getElementById("baseURL").value = this.options.baseURL;
		}
	}
}

Editor.prototype.newTestCase = function() {
    var testCase = new TestCase(this.testSuite.generateNewTestCaseTitle());
    this.testSuite.addTestCaseFromContent(testCase);
    this.setTestCase(testCase);
}

Editor.prototype.loadTestCaseWithNewSuite = function(file) {
    if (this.loadTestCase(file)) {
        var testSuite = new TestSuite();
        testSuite.addTestCaseFromContent(this.testCase);
        this.setTestSuite(testSuite);
    }
}

// show specified TestSuite.TestCase object.
Editor.prototype.showTestCaseFromSuite = function(testCase) {
    if (testCase.content) {
        this.setTestCase(testCase.content);
    } else {
        this.loadTestCase(testCase.getFile(), function(test) { testCase.content = test });
    }
}

Editor.prototype.loadTestCase = function(file, testCaseHandler) {
	this.log.debug("loadTestCase");
	try {
		var testCase = null;
        if (file) {
            testCase = this.currentFormat.loadFile(file, false);
        } else {
            testCase = this.currentFormat.load();
        }
        if (testCase != null) {
            if (testCaseHandler) testCaseHandler(testCase);
			this.setTestCase(testCase);
            return true;
		}
        return false;
	} catch (error) {
		alert("error loading test case: " + error);
        return false;
	}
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

Editor.prototype.newTestSuite = function() {
	this.log.debug("newTestSuite");
    var testSuite = new TestSuite();
    var testCase = new TestCase();
    testSuite.addTestCaseFromContent(testCase);
    this.setTestSuite(testSuite);
	this.setTestCase(testCase);
}

Editor.prototype.loadTestSuite = function(path) {
	this.log.debug("loadTestSuite");
	try {
		var testSuite = null;
        if (path) {
            testSuite = TestSuite.loadFile(FileUtils.getFile(path));
        } else {
            testSuite = TestSuite.load();
        }
		if (testSuite) {
            this.setTestSuite(testSuite);
            this.addRecentTestSuite(testSuite);
		}
	} catch (error) {
		alert("error loading test suite: " + error);
	}
}

Editor.prototype.addRecentTestSuite = function(testSuite) {
    var recent = Preferences.getArray("recentTestSuites");
    var path = testSuite.file.path;
    recent.delete(path);
    recent.unshift(path);
    Preferences.setArray("recentTestSuites", recent);
}

Editor.prototype.saveTestSuite = function() {
	this.log.debug("saveTestSuite");
    var cancelled = false;
    this.testSuite.tests.forEach(function(test) {
            if (cancelled) return;
            if (test.content && test.content.modified) {
                if (confirm("The test case is modified. Do you want to save this test case?")) {
                    if (!this.currentFormat.save(test.content)) {
                        cancelled = true;
                    }
                } else {
                    cancelled = true;
                }
            }
        }, this);
    if (!cancelled) {
        if (this.testSuite.save()) {
            this.addRecentTestSuite(this.testSuite);
        }
    }
}

Editor.prototype.setTestSuite = function(testSuite) {
    this.testSuite = testSuite;
    this.suiteTreeView.refresh();
}

Editor.prototype.updateTitle = function() {
	var title;
	if (this.testCase && this.testCase.file) {
		title = this.testCase.file.leafName + " - " + Editor.DEFAULT_TITLE;
	} else {
		title = Editor.DEFAULT_TITLE;
	}
	if (this.testCase && this.testCase.modified) {
		title += " *";
	}
	document.title = title;
    
}

Editor.prototype.tabSelected = function(id) {
	if (this.testCase != null) {
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
	if (this.currentFormat.save(this.testCase)) {
		//document.getElementById("filename").value = this.testCase.filename;
		return true;
	} else {
		return false;
	}
}

Editor.prototype.saveNewTestCase = function() {
	this.view.syncModel();
	if (this.currentFormat.saveAsNew(this.testCase)) {
		//document.getElementById("filename").value = this.testCase.filename;
		this.updateTitle();
	}
}

Editor.prototype.exportTestCaseWithFormat = function(format) {
	this.view.syncModel();
	format.saveAsNew(this.testCase.createCopy(), true);
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
    var self = this;
    setTimeout(function() {
            self.appendWaitForPageToLoad(doc);
        }, 0);
}

Editor.prototype.recordTitle = function(window) {
	if (this.options.recordAssertTitle == 'true' && this.testCase.commands.length > 0) {
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
	if (result && "true" != this.options.recordAbsoluteURL) {
		path = path.substr(result[1].length);
		base = result[1] + '/';
	}
	if (!document.getElementById("baseURL").value ||
		document.getElementById("baseURL").value.indexOf(base) < 0) {
		document.getElementById("baseURL").value = base;
	}
    return [path, base];
}

Editor.prototype.clear = function(force) {
	if (this.testCase != null) {
		if (force || confirm("Really clear the test?")) {
			this.testCase.clear();
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
    this.log.debug("addCommand: command=" + command + ", window.name=" + window.name);
    if (this.lastWindow) {
        this.log.debug("window.name=" + window.name + ", lastWindow.name=" + this.lastWindow.name);
    } else {
        this.log.debug("window.name=" + window.name);
    }
	if (command != 'open' && 
        command != 'selectWindow' &&
        command != 'selectFrame') {
        if (this.testCase.commands.length == 0) {
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
	this.testCase.commands.splice(this.lastCommandIndex, 0, new Command(command, target, value));
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

Editor.prototype.appendWaitForPageToLoad = function(doc) {
    this.log.debug("appendWaitForPageToLoad");
    if (doc.defaultView != this.lastWindow) {
        this.log.debug("window did not match");
        return;
    }
	var lastCommandIndex = this.lastCommandIndex;
	if (lastCommandIndex == null || lastCommandIndex >= this.testCase.commands.length) {
		return;
	}
	this.lastCommandIndex = null;
	var lastCommand = this.testCase.commands[lastCommandIndex];
	if (lastCommand.type == 'command' && 
		!lastCommand.command.match(/^(assert|verify|store)/)) {
		if (this.currentFormat.getFormatter().remoteControl) {
			this.addCommand("waitForPageToLoad", this.options.timeout, null, this.lastWindow);
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
    this.testSuite.tests.forEach(function(test) {
            if (test.testResult) {
                delete test.testResult;
            }
        });
    this.suiteTreeView.refresh();
    var self = this;
    (function() {
        if (++index < self.testSuite.tests.length) {
            self.suiteTreeView.scrollToRow(index);
            self.showTestCaseFromSuite(self.testSuite.tests[index]);
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
                       '&userExtensionsURL=' + encodeURI(ExtensionsLoader.getURLs(this.options.userExtensionsURL).join(',')) +
                       '&baseUrl=' + document.getElementById("baseURL").value +
                       (auto ? "&auto=true" : ""), 
                       newWindow);
}

Editor.prototype.loadTestSuiteToTestRunner = function(e) {
    var content = "<table id=\"suiteTable\" cellpadding=\"1\" cellspacing=\"1\" border=\"1\" class=\"selenium\"><tbody>\n";
    content += "<tr><td><b>Test Suite</b></td></tr>\n";
    for (var i = 0; i < this.testSuite.tests.length; i++) {
        var testCase = this.testSuite.tests[i];
        content += "<tr><td><a href=\"PlayerTest.html?" + i + "\">" +
            testCase.getTitle() + "</a></td></tr>\n";
    }
    content += "</tbody></table>\n";
    e.innerHTML = content;
}

Editor.prototype.loadTestCaseToTestRunner = function(e, index) {
    this.log.debug("loading test index #" + index + " into test runner");
    var testCaseInfo = this.testSuite.tests[index];
    var testCase = testCaseInfo.content || this.currentFormat.loadFile(testCaseInfo.getFile(), false);
	e.innerHTML = this.formats.getDefaultFormat().getFormatter().format(testCase, testCaseInfo.getTitle(), false, true);
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
	document.getElementById("clipboardFormatMenu").setAttribute("disabled", !editor.currentFormat.getFormatter().playable);
	document.getElementById("internalTestsMenu").setAttribute("hidden", this.options.showInternalTestsMenu == null);
}

Editor.prototype.populateFormatsPopup = function(e, format) {
    XulUtils.clearChildren(e);
	var formats = this.formats.formats;
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
	if (this.currentFormat.getFormatter().playable) {
		editorTab.collapsed = false;
		this.toggleView(this.view || this.treeView);
	} else {
		tabs.selectedIndex = 1;
		this.toggleView(this.sourceView);
		editorTab.collapsed = true;
	}
	this.updateState();
}


Editor.prototype.setCurrentFormat = function(format) {
	this.currentFormat = format;
	this.updateViewTabs();
	this.options.selectedFormat = this.currentFormat.id;
	Preferences.save(this.options, 'selectedFormat');
	this.setClipboardFormat(format);
	this.updateState();
}

Editor.prototype.setClipboardFormat = function(format) {
	this.clipboardFormat = format;
	this.options.clipboardFormat = this.clipboardFormat.id;
	Preferences.save(this.options, 'clipboardFormat');
}

Editor.prototype.getBaseURL = function() {
	return this.document.getElementById("baseURL").value;
}

Editor.prototype.setTestCase = function(testCase) {
    if (this.testCase) {
        if (testCase == this.testCase) return;
        this.notify("testCaseUnloaded", this.testCase);
    }
	this.testCase = testCase;
    this.notify("testCaseLoaded", this.testCase);
    // this.view is not set yet when setTestCase is called from constructor
    if (this.view) {
        this.view.refresh();
        this.updateTitle();
    }
}

Editor.prototype.toggleView = function(view) {
	this.log.debug("toggle view");
	if (this.view != null) {
		this.view.onHide();
	}
	var previous = this.view;
	this.view = view;
	if (previous) previous.syncModel(true);
	this.view.testCase = this.testCase;
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
	this.setOptions(Preferences.DEFAULT_OPTIONS);
}

Editor.prototype.loadExtensions = function() {
	const subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
	if (this.options.ideExtensionsPaths) {
		try {
			ExtensionsLoader.loadSubScript(subScriptLoader, this.options.ideExtensionsPaths, window);
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
	if (this.options.userExtensionsURL) {
		try {
			ExtensionsLoader.loadSubScript(subScriptLoader, this.options.userExtensionsURL, this.seleniumAPI);
		} catch (error) {
			this.showAlert("Failed to load user-extensions.js!\nfiles=" + this.options.userExtensionsURL + "\nerror=" + error);
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

observable(Editor);

