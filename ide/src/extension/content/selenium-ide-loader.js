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
// functions to call IDE from browser window.
//

if (!this.SeleniumIDE) this.SeleniumIDE = {};

SeleniumIDE.Loader = {};

SeleniumIDE.Loader.openRecorder = function() {
	toOpenWindowByType('global:selenium-ide','chrome://selenium-ide/content/selenium-ide.xul');
}

SeleniumIDE.Loader.getTopEditor = function() {
	var editors = this.getEditors();
	if (editors.length > 0) {
		return editors[0];
	} else {
		return null;
	}
}

SeleniumIDE.Loader.getEditors = function() {
	var editors = [];
	if (document) {
		var sidebarBox = document.getElementById('sidebar-box');
		if (sidebarBox && !sidebarBox.hidden) {
			var sidebar = document.getElementById('sidebar');
			try {
				if (sidebar && sidebar.contentDocument) {
					if ("chrome://selenium-ide/content/selenium-ide-sidebar.xul" == sidebar.contentDocument.documentURI) {
						var sidebarView = sidebar.contentDocument.defaultView;
						if (sidebarView && sidebarView.editor) {
							editors.push(sidebarView.editor);
						}
					}
				}
			} catch (error) {
			}
		}
	}
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var editorWindow = wm.getMostRecentWindow('global:selenium-ide');
	if (editorWindow && editorWindow.editor) {
		editors.push(editorWindow.editor);
	}
	return editors;
}

SeleniumIDE.Loader.reloadRecorder = function(contentWindow, isRootDocument) {
	var editors = this.getEditors();
	for (var i = 0; i < editors.length; i++) {
		editors[i].loadRecorderFor(contentWindow, isRootDocument);
	}
}

SeleniumIDE.Loader.notifyUnload = function(doc) {
	this.getEditors().forEach(function(editor) {
			editor.onUnloadDocument(doc);
		});
}

SeleniumIDE.Loader.getRecorder = function(window) {
	return window._Selenium_IDE_Recorder;
}
