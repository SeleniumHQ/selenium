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

//
// overlay functions for the browser.
//

SeleniumIDE.recordVerifyTextPresent = function() {
    var focusedWindow = document.commandDispatcher.focusedWindow;
    var selection = String(focusedWindow.getSelection());
	var window = SeleniumIDE.getRecorderWindow();
	if (window && selection != '') {
		window.recordVerifyTextPresent(selection, focusedWindow);
	}
}

SeleniumIDE.recordOpen = function() {
    var focusedWindow = document.commandDispatcher.focusedWindow;
	var window = SeleniumIDE.getRecorderWindow();
	if (window) {
		window.recordOpen(focusedWindow);
	}
}

SeleniumIDE.recordVerifyTitle = function() {
	var window = SeleniumIDE.getRecorderWindow();
	if (window) {
		window.recordVerifyTitle(document.commandDispatcher.focusedWindow);
	}
}

SeleniumIDE.testRecorderPopup = function(popup) {
	function $(id) {
		return window.document.getElementById("selenium-ide-" + id);
	}
	var focusedWindow = document.commandDispatcher.focusedWindow;
	var e;
	
	e = $("verifyTextPresent");
	var selection = String(focusedWindow.getSelection());
	if (selection) {
		e.setAttribute('disabled', 'false');
		e.label = 'verifyTextPresent "' + selection + '"';
	} else {
		e.setAttribute('disabled', 'true');
		e.label = 'verifyTextPresent';
	}
	
	e = $("verifyTitle");
	e.label = 'verifyTitle "' + focusedWindow.document.title + '"';
	
	return true;
}

SeleniumIDE.initOverlay = function() {
	var appcontent = window.document.getElementById("appcontent");
	if (appcontent) {
		if (!appcontent.recorderLoaded) {
			appcontent.recorderLoaded = true;
			appcontent.addEventListener("DOMContentLoaded", 
										function() { SeleniumIDE.reloadRecorder(window.getBrowser().contentWindow) },
										false);
		}
	}
	window.addEventListener("beforeunload", function() { SeleniumIDE.notifyUnloadToRecorder(window.document) }, false);
}

SeleniumIDE.initOverlay();
	
