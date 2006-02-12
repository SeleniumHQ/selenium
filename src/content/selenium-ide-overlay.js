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

SeleniumIDE.useAssert = true;

SeleniumIDE.checks = {
	open: function(window, element) {
		var path = window.location.href;
		var base = '';
		var r = /^(\w+:\/\/[\w\.-]+(:\d+)?)\/.*/.exec(path);
		if (r) {
			path = path.substr(r[1].length);
			base = r[1] + '/';
		}
		return {
			command: "open",
			target: path
		};
	},
	textPresent: function(window, element) {
		var result = { name: "TextPresent" };
		var selection = String(window.getSelection());
		if (selection) {
			result.target = selection;
		} else {
			result.disabled = true;
		}
		return result;
	},
	title: function(window, element) {
		var result = { name: "Title" };
		if (window.document) {
			result.target = SeleniumIDE.getRecorderWindow().exactMatchPattern(window.document.title);
		} else {
			result.disabled = true;
		}
		return result;
	},
	value: function(window, element) {
		var result = { name: "Value" };
		if (element && element.hasAttribute && element.tagName &&
			('input' == element.tagName.toLowerCase() || element.hasAttribute("value"))) {
			var locator = SeleniumIDE.getRecorderWindow().eventManager.getLocator(window, element);
			result.target = locator;
			var type = element.getAttribute("type");
			if ('input' == element.tagName.toLowerCase() && 
				(type == 'checkbox' || type == 'radio')) {
				result.value = element.checked ? 'on' : 'off';
			} else {
				result.value = SeleniumIDE.getRecorderWindow().exactMatchPattern(element.getAttribute('value'));
			}
		} else {
			result.disabled = true;
		}
		return result;
	},
	table: function(window, element) {
		var result = { name: "Table" };
		if (element && element.tagName && 'td' == element.tagName.toLowerCase()) {
			var parentTable = null;
			var temp = element.parentNode;
			while (temp != null) {
				if (temp.tagName.toLowerCase() == 'table') {
					parentTable = temp;
					break;
				}
				temp = temp.parentNode;
			}
			if (parentTable == null) {
				result.disabled = true;
				result.target = "(Unavailable: Selection not a cell of a table)";
			} else {
				//first try to locate table by id and then by name
				var tableName = parentTable.id;
				if (!tableName) {
					tableName = parentTable.name;
				}
				if (!tableName) {
					result.disabled = true;
					result.target = "(Unavailable: Table must have an id declared)";
				} else {
					result.target = tableName + '.' + element.parentNode.rowIndex + '.' + element.cellIndex;
					result.value = SeleniumIDE.getRecorderWindow().exactMatchPattern(element.innerHTML);
				}
			}
		} else {
			result.disabled = true;
		}
		return result;
	}
}

SeleniumIDE.getCheckCommand = function(menuitem) {
	var focusedWindow = menuitem.ownerDocument.commandDispatcher.focusedWindow;
	var recorder = SeleniumIDE.getRecorderWindow();
	var r = /^selenium-ide-check-(.*)$/.exec(menuitem.id);
	if (recorder && r && SeleniumIDE.checks[r[1]]) {
		var command = SeleniumIDE.checks[r[1]](focusedWindow, recorder.clickedElement);
		['name', 'target', 'value'].forEach(function(name) {
												   if (command[name] == null) command[name] = '';
											   });
		if (!command.command)
			command.command = (SeleniumIDE.useAssert ? 'assert' : 'verify') + command.name;
		command.window = focusedWindow;
		return command;
	} else {
		return null;
	}
}

SeleniumIDE.toggleCheckType = function() {
	SeleniumIDE.useAssert = !SeleniumIDE.useAssert;
}

SeleniumIDE.appendCheck = function(event) {
	var command;
	if (null != (command = SeleniumIDE.getCheckCommand(event.target))) {
		if (!command.disabled) {
			SeleniumIDE.getRecorderWindow().addCommand(command.command, command.target, command.value, command.window);
		}
	}
}

SeleniumIDE.testRecorderPopup = function(event) {
	if (event.target.id != "contentAreaContextMenu") return;
	
	contextMenu = event.target;

	function hideMenus(hidden) {
		var len = contextMenu.childNodes.length;
		for (var i = 0; i < len; i++) {
			var item = contextMenu.childNodes[i];
			if (item.id && /^selenium-ide-/.test(item.id)) {
				item.hidden = hidden;
			}
		}
	}

	var recorder = SeleniumIDE.getRecorderWindow();
	if (recorder) {
		hideMenus(false);

		var focusedWindow = contextMenu.ownerDocument.commandDispatcher.focusedWindow;
		var len = contextMenu.childNodes.length;
		for (var i = 0; i < len; i++) {
			var item = contextMenu.childNodes[i];
			var command;
			if (null != (command = SeleniumIDE.getCheckCommand(item))) {
				if (command.disabled) {
					item.setAttribute('disabled', 'true');
				} else {
					item.setAttribute('disabled', 'false');
				}
				item.label = command.command + ' ' + command.target + ' ' + command.value;
			}
		}
	} else {
		hideMenus(true);
	}
}

SeleniumIDE.onContentLoaded = function(event) {
	var isRootDocument = false;
	var browsers = window.getBrowser().browsers;
	for (var i = 0; i < browsers.length; i++) {
		var cw = browsers[i].contentWindow;
		if (cw && cw.document == event.target) {
			isRootDocument = true;
		}
	}
	SeleniumIDE.reloadRecorder(window.getBrowser().contentWindow, isRootDocument);
	
	var contextMenu = window.document.getElementById("contentAreaContextMenu");
	if (contextMenu) {
		contextMenu.addEventListener("popupshowing", SeleniumIDE.testRecorderPopup, false);
		contextMenu.addEventListener("command", SeleniumIDE.appendCheck, false);
	}
}

SeleniumIDE.initOverlay = function() {
	var appcontent = window.document.getElementById("appcontent");
	if (appcontent) {
		appcontent.addEventListener("DOMContentLoaded", SeleniumIDE.onContentLoaded, false);
	}
	window.addEventListener("beforeunload", function() { SeleniumIDE.notifyUnloadToRecorder(window.document) }, false);

}

SeleniumIDE.initOverlay();
