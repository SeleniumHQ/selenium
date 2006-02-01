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

var log = new Log("Recorder");
var recorder = this;

const DEFAULT_TITLE = "Selenium IDE";

function init() {
	if (!this.recorderInitialized) {
		log.info("initializing");
		this.recorderInitialized = true;
		this.setOptions(optionsManager.load());
		//this.options.load();
		this.eventManager = new EventManager(this);
		this.treeView = new TreeView(this, document, document.getElementById("commands"));
		this.sourceView = new SourceView(this, document.getElementById("source"));
		this.testCaseListeners = new Array();
		this.setTestCase = function(testCase) {
			this.testCase = testCase;
			for (var i = 0; i < this.testCaseListeners.length; i++) {
				this.testCaseListeners[i](this.testCase);
			}
		};
		this.setTestCase(new TestCase());
		this.testCaseListeners.push(function(testCase) { recorder.view.testCase = testCase });
		this.toggleView = function(view) {
			log.debug("toggle view");
			if (this.view != null) {
				this.view.onHide();
			}
			this.view = view;
			this.view.testCase = this.testCase;
			this.view.refresh();
		};
		initOptions();
		this.toggleView(this.treeView);

		var controller = {
			supportsCommand : function(cmd) {
				switch (cmd) {
				case "cmd_close":
				case "cmd_open":
				case "cmd_save":
				case "cmd_selenium_play":
				case "cmd_selenium_pause":
				case "cmd_selenium_step":
					return true;
				default:
				return false;
				}
			},
			isCommandEnabled : function(cmd){
				switch (cmd) {
				case "cmd_close":
				case "cmd_open":
				case "cmd_save":
					return true;
				case "cmd_selenium_play":
				    return self.state != 'playing';
				case "cmd_selenium_pause":
				    return self.state == 'playing' || self.state == 'paused';
				case "cmd_selenium_step":
				    return self.state == 'paused';
				default:
				    return false;
				}
			},
			doCommand : function(cmd) {
				switch (cmd) {
				case "cmd_close": if (confirmClose()) { window.close(); } break;
				case "cmd_save": saveTestCase(); break;
				case "cmd_open": loadTestCase(); break;
				case "cmd_selenium_play": seleniumDebugger.start(); break;
				case "cmd_selenium_pause": 
				    if (self.state == 'paused') {
						seleniumDebugger.doContinue();
					} else {
						seleniumDebugger.pause();
					}
				    break;
				case "cmd_selenium_step":
				    seleniumDebugger.doContinue(true);
				    break;
				default:
				}
			},
			onEvent : function(evt) {}
		};
		window.controllers.appendController(controller);
		
		document.commandDispatcher.updateCommands("selenium-ide-state");
		log.info("initialized");
	}
}

function updateSeleniumCommands() {
	["cmd_selenium_play", "cmd_selenium_pause", "cmd_selenium_step"].
		forEach(function(cmd) {
					goUpdateCommand(cmd);
				});
}

function afterInit() {
}

function setState(state) {
	this.state = state;
	if (state == 'paused') {
		document.getElementById("pause-button").setAttribute("class", "icon resume");
	} else {
		document.getElementById("pause-button").setAttribute("class", "icon pause");
	}
	window.updateCommands("selenium-ide-state");
}

function setOptions(options) {
	this.options = options;
	this.testManager = new TestManager(options);
}

function initOptions() {
	if (this.options.rememberBaseURL == 'true' && this.options.baseURL != null){
		if (document.getElementById("baseURL").value == '') {
			document.getElementById("baseURL").value = this.options.baseURL;
		}
	}
	if (this.options.selectedFormat != null) {
		try {
			testManager.selectFormat(this.options.selectedFormat);
		} catch (error) {
			log.error("failed to select format: " + error);
		}
	}
}

function newTestCase() {
	if (confirmClose()) {
		this.setTestCase(new TestCase());
		this.view.refresh();
		//document.getElementById("filename").value = '';
		//document.title = DEFAULT_TITLE;
		updateTitle();
	}
}

function loadTestCase() {
	log.debug("loadTestCase");
	try {
		var testCase = null;
		if (testCase = this.testManager.load()) {
			this.setTestCase(testCase);
			this.view.refresh();
			//document.getElementById("filename").value = this.testCase.filename;
			//document.title = this.testCase.filename + " - " + DEFAULT_TITLE;
			updateTitle();
		}
	} catch (error) {
		alert(error);
	}
}

function updateTitle() {
	var title;
	if (this.testCase && this.testCase.baseFilename) {
		title = this.testCase.baseFilename + " - " + DEFAULT_TITLE;
	} else {
		title = DEFAULT_TITLE;
	}
	if (this.testCase && this.testCase.modified) {
		title += " *";
	}
	document.title = title;
}

function tabSelected(id) {
	if (this.testCase != null) {
		log.debug("tabSelected: id=" + id);
		if (id == 'sourceTab') {
			this.toggleView(this.sourceView);
		} else if (id == 'editorTab') {
			this.toggleView(this.treeView);
		}
	}
}

function saveTestCase() {
	if (this.testManager.save(this.testCase)) {
		//document.getElementById("filename").value = this.testCase.filename;
		return true;
	} else {
		return false;
	}
}

function saveNewTestCase() {
	if (this.testManager.saveAsNew(this.testCase)) {
		//document.getElementById("filename").value = this.testCase.filename;
		updateTitle();
	}
}

function loadRecorder() {
	this.recordingEnabled = true;
	init();
	this.eventManager.startForAllBrowsers();
}

function loadRecorderFor(contentWindow, isRootDocument) {
	init();
	if (this.recordingEnabled && isRootDocument) {
		recordTitle(contentWindow);
	}
	this.eventManager.startForContentWindow(contentWindow);
}

function confirmClose() {
	if (this.testCase && this.testCase.modified) {
		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService);
		
		var flags = 
			promptService.BUTTON_TITLE_SAVE * promptService.BUTTON_POS_0 +
			promptService.BUTTON_TITLE_CANCEL * promptService.BUTTON_POS_1 +
			promptService.BUTTON_TITLE_DONT_SAVE * promptService.BUTTON_POS_2;
		
		result = promptService.confirmEx(window, "Save test?",
										 "Would you like to save the test?",
										 flags, null, null, null, null, {});
		
		switch (result) {
		case 0:
			return saveTestCase();
		case 1:
			return false;
		case 2:
			return true;
		}
	}
	return true;
}

function unloadRecorder() {
	if (this.options.rememberBaseURL == 'true'){
		this.options.baseURL = document.getElementById("baseURL").value;
		optionsManager.save(this.options, 'baseURL');
	}
	this.options.selectedFormat = this.testManager.currentFormatInfo.id;
	optionsManager.save(this.options, 'selectedFormat');
	
	this.eventManager.stopForAllBrowsers();
}

function toggleRecordingEnabled(enabled) {
	this.recordingEnabled = enabled;
}

function onUnloadDocument(doc) {
	if (this.unloadTimeoutID != null) {
		clearTimeout(this.unloadTimeoutID);
	}
	this.unloadTimeoutID = setTimeout("appendAND_WAIT()", 100);
}

function recordTitle(window) {
	if (this.options.recordAssertTitle == 'true' && this.testCase.commands.length > 0) {
		//setTimeout("addCommand", 200, "assertTitle", window.document.title, null, window);
		addCommand("assertTitle", window.document.title, null, window);
	}
}

function recordOpen(window) {
	var path = window.location.href;
	var regexp = new RegExp(/^(\w+:\/\/[\w\.]+(:\d+)?)\/.*/);
	var base = '';
	var result = regexp.exec(path);
	if (result) {
		path = path.substr(result[1].length);
		base = result[1] + '/';
	}
	addCommand("open", path, '', window);
	if (!document.getElementById("baseURL").value) {
		document.getElementById("baseURL").value = base;
	}
}

function clear() {
	if (this.testCase != null) {
		if (confirm("Really clear the test?")) {
			this.testCase.clear();
			this.view.refresh();
			log.debug("cleared");
			return true;
		}
	}
	return false;
}

function addCommand(command,target,value,window) {
	log.debug("addCommand");
	var windowName;
	if (command != 'open' && this.testCase.commands.length == 0) {
		recordOpen(window);
		recordTitle(window);
	}
	if (command != 'selectWindow' &&
		this.lastWindow != null &&
		window.name != this.lastWindow.name) {
		windowName = window.name;
		if (window.name == '') {
			windowName = 'null';
		}
		addCommand('selectWindow', windowName, '', 0, window);
	}
	//resultBox.inputField.scrollTop = resultBox.inputField.scrollHeight - resultBox.inputField.clientHeight;
	if (this.timeoutID != null) {
		clearTimeout(this.timeoutID);
	}
	this.lastWindow = window;
	this.lastCommandIndex = this.testCase.recordIndex;
	this.testCase.commands.splice(this.lastCommandIndex, 0, new Command(command, target, value));
	this.view.rowInserted(this.lastCommandIndex);
	this.timeoutID = setTimeout("clearLastCommand()", 1000);
	//updateSource();
}

function clearLastCommand() {
	this.lastCommandIndex = null;
}

function appendAND_WAIT() {
	var lastCommandIndex = this.lastCommandIndex;
	if (lastCommandIndex == null) {
		return;
	}
	this.lastCommandIndex = null;
	var lastCommand = this.testCase.commands[lastCommandIndex];
	if (lastCommand.type == 'command' && 
		!lastCommand.command.match(/^assert/) &&
		!lastCommand.command.match(/^verify/)) {
		lastCommand.command = lastCommand.command + "AndWait";
	}
	this.view.rowUpdated(lastCommandIndex);
	//updateSource();
}

function openSeleniumIDEPreferences() {
	window.openDialog("chrome://selenium-ide/content/optionsDialog.xul", "options", "chrome,modal,resizable", null);
}

function playback() {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var window = wm.getMostRecentWindow('navigator:browser');
	var contentWindow = window.getBrowser().contentWindow;
	this.seleniumStartPage = contentWindow.location.href;
	this.seleniumWindow = contentWindow;
	
	// disable recording
	document.getElementById("record-button").checked = false;
	toggleRecordingEnabled(false);

	contentWindow.location.href = 'chrome://selenium-ide/content/selenium/TestRunner.html?test=/content/PlayerTestSuite.html' + 
		'&userExtensionsURL=' + this.options.userExtensionsURL +
		'&baseURL=' + document.getElementById("baseURL").value;
}

function loadPlayerTest(e) {
	e.innerHTML = this.testManager.getDefaultFormat().format(this.testCase, "Test Player", false, true);
}

function openLogWindow() {
	if (!LOG.getLogWindow()) {
		LOG.logWindow = window.open(
            "chrome://selenium-ide/content/selenium/SeleniumLog.html", "SeleniumLog",
            "chrome,width=600,height=250,bottom=0,right=0,status,scrollbars,resizable"
		);
	}
}

function populateFormatsPopup() {
	var e = document.getElementById("popup_formats");
	var i;
	for (i = e.childNodes.length - 1; i >= 0; i--) {
		e.removeChild(e.childNodes[i]);
	}
	var formats = this.testManager.formatInfos;
	for (i = 0; i < formats.length; i++) {
		var menuitem = document.createElement("menuitem");
		//menuitem.label = formats[i].name;
		menuitem.setAttribute("type", "radio");
		menuitem.setAttribute("name", "formats");
		menuitem.setAttribute("label", formats[i].name);
		menuitem.setAttribute("value", formats[i].id);
		if (this.testManager.currentFormatInfo.id == formats[i].id) {
			menuitem.setAttribute("checked", true);
		}
		e.appendChild(menuitem);
	}
}

function selectFormatFromMenu() {
	var e = document.getElementById("popup_formats");
	var i;
	for (i = e.childNodes.length - 1; i >= 0; i--) {
		var checked = e.childNodes[i].getAttribute("checked");
		if (checked == 'true') {
			this.testManager.selectFormat(e.childNodes[i].getAttribute("value"));
			break;
		}
	}
}
