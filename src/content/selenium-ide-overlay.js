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

SeleniumIDE.Overlay = {};

SeleniumIDE.Overlay.toggleCheckType = function() {
	var CheckBuilders = SeleniumIDE.Loader.getTopEditor().window.CheckBuilders;
	CheckBuilders.useAssert = !CheckBuilders.useAssert;
}

SeleniumIDE.Overlay.appendCheck = function(event) {
	var command = event.target._Selenium_IDE_command;
	SeleniumIDE.Loader.getTopEditor().addCommand(command.command, command.target, command.value, command.window);
}

SeleniumIDE.Overlay.testRecorderPopup = function(event) {
	if (event.target.id != "contentAreaContextMenu") return;
	
	contextMenu = event.target;

	for (var i = contextMenu.childNodes.length - 1; i >= 0; i--) {
		var item = contextMenu.childNodes[i];
		if (item.id && /^selenium-ide-check-/.test(item.id)) {
			contextMenu.removeChild(item);
		}
	}
	
	var recorder = SeleniumIDE.Loader.getTopEditor();
	if (recorder) {
		var CheckBuilders = SeleniumIDE.Loader.getTopEditor().window.CheckBuilders;
		for (var i = 0; i < CheckBuilders.builders.length; i++) {
			var builder = CheckBuilders.builders[i];
			var menuitem = document.createElement("menuitem");
			var focusedWindow = contextMenu.ownerDocument.commandDispatcher.focusedWindow;
			var command = CheckBuilders.callBuilder(builder, focusedWindow/*window.gBrowser.contentWindow*/);
			menuitem.setAttribute("id", "selenium-ide-check-" + builder.name);
			menuitem.setAttribute("disabled", command.disabled ? 'true' : 'false');
			menuitem.setAttribute("label", command.command + ' ' + command.target + ' ' + command.value);
			menuitem._Selenium_IDE_command = command;
			contextMenu.appendChild(menuitem);
		}
	}
}

SeleniumIDE.Overlay.onContentLoaded = function(event) {
	var isRootDocument = false;
	var browsers = window.getBrowser().browsers;
	for (var i = 0; i < browsers.length; i++) {
		var cw = browsers[i].contentWindow;
		if (cw && cw.document == event.target) {
			isRootDocument = true;
		}
	}
	SeleniumIDE.Loader.reloadRecorder(window.getBrowser().contentWindow, isRootDocument);
	
	var contextMenu = window.document.getElementById("contentAreaContextMenu");
	if (contextMenu) {
		contextMenu.addEventListener("popupshowing", SeleniumIDE.Overlay.testRecorderPopup, false);
		contextMenu.addEventListener("command", SeleniumIDE.Overlay.appendCheck, false);
	}
}

SeleniumIDE.Overlay.init = function() {
	var appcontent = window.document.getElementById("appcontent");
	if (appcontent) {
		appcontent.addEventListener("DOMContentLoaded", SeleniumIDE.Overlay.onContentLoaded, false);
	}
	window.addEventListener("beforeunload", 
							function() {
								SeleniumIDE.Loader.getEditors().forEach(function(editor) {
										editor.onUnloadDocument(window.document);
									});
							}, false);
}

SeleniumIDE.Overlay.init();
