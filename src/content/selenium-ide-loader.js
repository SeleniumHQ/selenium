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

var SeleniumIDE = new Object();

SeleniumIDE.openRecorder = function() {
	toOpenWindowByType('global:selenium-ide','chrome://selenium-ide/content/selenium-ide.xul');
}

SeleniumIDE.getRecorderWindow = function() {
	if (document) {
		var sidebarBox = document.getElementById('sidebar-box');
		if (sidebarBox && !sidebarBox.hidden) {
			var sidebar = document.getElementById('sidebar');
			if (sidebar && sidebar.contentDocument) {
				if ("chrome://selenium-ide/content/selenium-ide-sidebar.xul" == sidebar.contentDocument.documentURI) {
					return sidebar.contentDocument.defaultView;
				}
			}
		}
	}
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	return wm.getMostRecentWindow('global:selenium-ide');
}

SeleniumIDE.reloadRecorder = function(contentWindow, isRootDocument) {
	var window = SeleniumIDE.getRecorderWindow();
	if (window != null) {
		window.loadRecorderFor(contentWindow, isRootDocument);
	}
}

SeleniumIDE.notifyUnloadToRecorder = function(doc) {
	var window = SeleniumIDE.getRecorderWindow();
	if (window != null) {
		window.onUnloadDocument(doc);
	}
}

