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

function Editor(window, isSidebar) {
	this.log.debug("initializing");
	this.window = window;
	window.editor = this;
	var self = this;
	this.isSidebar = isSidebar;
	this.recordFrameTitle = false;
	this.document = document;
	this.recordingEnabled = true;
	this.setOptions(optionsManager.load());
	this.loadExtensions();
	this.loadSeleniumAPI();
	this.treeView = new TreeView(this, document, document.getElementById("commands"));
	this.sourceView = new SourceView(this, document.getElementById("source"));
	this.testCaseListeners = new Array();
	this.testCaseListeners.push(function(testCase) {
			if (self.view) {
				self.view.testCase = testCase;
			}
			testCase.observer = {
				modifiedStateUpdated: function() {
					self.updateTitle();
				}
			};
		});
	this.setTestCase(new TestCase());
	this.initOptions();
	//this.toggleView(this.treeView);
	
	
	// "debugger" cannot be used since it is a reserved word in JS
	this.selDebugger = new Debugger(this);
	
	//top.document.commandDispatcher.getControllers().appendController(Editor.controller);
	//window.controllers.appendController(Editor.controller);
	top.controllers.appendController(Editor.controller);

	//window.controllers.appendController(controller);

	this.updateViewTabs();
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
				editor.view.refresh();
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
		case "cmd_save":
		case "cmd_selenium_play":
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
		case "cmd_save":
			return true;
		case "cmd_selenium_testrunner":
		case "cmd_selenium_play":
		    return editor.currentFormat.getFormatter().playable && editor.state != 'playing';
		case "cmd_selenium_pause":
		    return editor.currentFormat.getFormatter().playable && (editor.state == 'playing' || editor.state == 'paused');
		case "cmd_selenium_step":
			return editor.currentFormat.getFormatter().playable && editor.state == 'paused';
		default:
			return false;
		}
	},
	doCommand : function(cmd) {
		Editor.log.debug("doCommand: " + cmd);
		switch (cmd) {
		case "cmd_close": if (editor.confirmClose()) { window.close(); } break;
		case "cmd_save": editor.saveTestCase(); break;
		case "cmd_open": editor.loadTestCase(); break;
		case "cmd_selenium_play":
			editor.selDebugger.start();
			break;
		case "cmd_selenium_pause": 
			if (editor.state == 'paused') {
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
		optionsManager.save(this.options, 'baseURL');
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
	["cmd_selenium_play", "cmd_selenium_pause", "cmd_selenium_step", "cmd_selenium_testrunner"].
		forEach(function(cmd) {
					goUpdateCommand(cmd);
				});
}

Editor.prototype.setState = function(state) {
	this.state = state;
	if (state == 'paused') {
		document.getElementById("pause-button").setAttribute("class", "icon resume");
	} else {
		document.getElementById("pause-button").setAttribute("class", "icon pause");
	}
	this.updateState();
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
	if (this.confirmClose()) {
		this.setTestCase(new TestCase());
		this.view.refresh();
		//document.getElementById("filename").value = '';
		//document.title = DEFAULT_TITLE;
		this.updateTitle();
	}
}

Editor.prototype.loadTestCase = function() {
	this.log.debug("loadTestCase");
	try {
		var testCase = null;
		if ((testCase = this.currentFormat.load()) != null) {
			this.setTestCase(testCase);
			this.view.refresh();
			//document.getElementById("filename").value = this.testCase.filename;
			//document.title = this.testCase.filename + " - " + DEFAULT_TITLE;
			this.updateTitle();
		}
	} catch (error) {
		alert(error);
	}
}

Editor.prototype.updateTitle = function() {
	var title;
	if (this.testCase && this.testCase.baseFilename) {
		title = this.testCase.baseFilename + " - " + Editor.DEFAULT_TITLE;
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
}

Editor.prototype.onUnloadDocument = function(doc) {
	if (doc.defaultView == this.lastWindow) {
		if (this.unloadTimeoutID != null) {
			clearTimeout(this.unloadTimeoutID);
		}
		this.unloadTimeoutID = setTimeout("Editor.appendWaitForPageToLoad()", 20);
	}
}

Editor.prototype.recordTitle = function(window) {
	if (this.options.recordAssertTitle == 'true' && this.testCase.commands.length > 0) {
		//setTimeout("addCommand", 200, "assertTitle", window.document.title, null, window);
		this.addCommand("assertTitle", exactMatchPattern(window.document.title), null, window);
	}
}

Editor.prototype.recordOpen = function(window) {
	if (!window.location) return;
	var path = window.location.href;
	var regexp = new RegExp(/^(\w+:\/\/[^/:]+(:\d+)?)\/.*/);
	var base = '';
	var result = regexp.exec(path);
	if (result) {
		path = path.substr(result[1].length);
		base = result[1] + '/';
	}
	this.addCommand("open", path, '', window);
	if (!document.getElementById("baseURL").value ||
		document.getElementById("baseURL").value.indexOf(base) < 0) {
		document.getElementById("baseURL").value = base;
	}
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

Editor.prototype.addCommand = function(command,target,value,window) {
	this.log.debug("addCommand");
	var windowName;
	if (command != 'open' && this.testCase.commands.length == 0) {
		this.recordOpen(window);
		//if (command != 'assertTitle' && command != 'verifyTitle') {
		this.recordTitle(window);
			//}
	}
	if (command != 'selectWindow' &&
		this.lastWindow != null &&
		window.name != this.lastWindow.name) {
		windowName = window.name;
		if (window.name == '') {
			windowName = 'null';
		}
		this.addCommand('selectWindow', windowName, '', 0, window);
	}
	//resultBox.inputField.scrollTop = resultBox.inputField.scrollHeight - resultBox.inputField.clientHeight;
	if (this.timeoutID != null) {
		clearTimeout(this.timeoutID);
	}
	this.lastWindow = window;

	this.lastCommandIndex = this.view.getRecordIndex();
	this.testCase.commands.splice(this.lastCommandIndex, 0, new Command(command, target, value));
	this.view.rowInserted(this.lastCommandIndex);
	this.timeoutID = setTimeout("editor.clearLastCommand()", 300);
}

Editor.prototype.clearLastCommand = function() {
	this.lastCommandIndex = null;
}

Editor.appendWaitForPageToLoad = function() {
	var lastCommandIndex = editor.lastCommandIndex;
	if (lastCommandIndex == null || lastCommandIndex >= editor.testCase.commands.length) {
		return;
	}
	editor.lastCommandIndex = null;
	var lastCommand = editor.testCase.commands[lastCommandIndex];
	if (lastCommand.type == 'command' && 
		!lastCommand.command.match(/^(assert|verify|store)/)) {
		if (editor.currentFormat.getFormatter().remoteControl) {
			editor.addCommand("waitForPageToLoad", editor.options.timeout, null, editor.lastWindow);
		} else {
			lastCommand.command = lastCommand.command + "AndWait";
			editor.view.rowUpdated(lastCommandIndex);
		}
	}
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

Editor.prototype.playback = function() {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var window = wm.getMostRecentWindow('navigator:browser');
	var contentWindow = window.getBrowser().contentWindow;
	this.seleniumStartPage = contentWindow.location.href;
	this.seleniumWindow = contentWindow;
	
	// disable recording
	this.setRecordingEnabled(false);

	this.loadTestRunner = true;
	
	contentWindow.location.href = 'chrome://selenium-ide/content/selenium/TestRunner.html?test=/content/PlayerTestSuite.html' + 
		'&userExtensionsURL=' + ExtensionsLoader.getURLs(this.options.userExtensionsURL).join(',') +
	    '&baseURL=' + document.getElementById("baseURL").value;
	
}

Editor.prototype.loadPlayerTest = function(e) {
	e.innerHTML = this.formats.getDefaultFormat().getFormatter().format(this.testCase, "Test Player", false, true);
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
}

Editor.prototype.populateFormatsPopup = function(e, format) {
	var i;
	for (i = e.childNodes.length - 1; i >= 0; i--) {
		e.removeChild(e.childNodes[i]);
	}
	var formats = this.formats.formats;
	for (i = 0; i < formats.length; i++) {
		var menuitem = document.createElement("menuitem");
		//menuitem.label = formats[i].name;
		menuitem.setAttribute("type", "radio");
		menuitem.setAttribute("name", "formats");
		menuitem.setAttribute("label", formats[i].name);
		menuitem.setAttribute("value", formats[i].id);
		if (format.id == formats[i].id) {
			menuitem.setAttribute("checked", true);
		}
		e.appendChild(menuitem);
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
	optionsManager.save(this.options, 'selectedFormat');
	this.setClipboardFormat(format);
	this.updateState();
}

Editor.prototype.setClipboardFormat = function(format) {
	this.clipboardFormat = format;
	this.options.clipboardFormat = this.clipboardFormat.id;
	optionsManager.save(this.options, 'clipboardFormat');
}

Editor.prototype.getBaseURL = function() {
	return this.document.getElementById("baseURL").value;
}

Editor.prototype.setTestCase = function(testCase) {
	this.testCase = testCase;
	for (var i = 0; i < this.testCaseListeners.length; i++) {
		this.testCaseListeners[i].call(this, this.testCase);
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
	this.setOptions(OPTIONS);
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
