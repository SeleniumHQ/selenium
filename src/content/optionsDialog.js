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

function saveOptions() {
	var options = this.options;
	var name;
	for (name in options) {
		var e = document.getElementById(name);
		if (e != null) {
			options[name] = e.checked != undefined ? e.checked.toString() : e.value;
		}
	}
	var w = SeleniumIDE.getRecorderWindow();
	if (w != null) {
		w.setOptions(options);
	}
	optionsManager.save(options);
	return true;
}

function loadFromOptions(options) {
	var name;
	for (name in options) {
		var e = document.getElementById(name);
		if (e != null) {
			if (e.checked != undefined) {
				e.checked = options[name] == 'true';
			} else {
				e.value = options[name];
			}
		}
	}
	testEncoding();
}

function loadDefaultOptions() {
	if (confirm("Do you really want to load default settings?")) {
		loadFromOptions(OPTIONS);
	}
}

function loadOptions() {
	var options = optionsManager.load();
	loadFromOptions(options);
	this.testManager = new TestManager(options);
	this.options = options;

	loadFormatList();
	selectFormat("default");
}

function loadFormatList() {
	var list = document.getElementById("format-list");
	for (var i = list.getRowCount() - 1; i >= 0; i--) {
		list.removeItemAt(i);
	}
	for (var i = 0; i < this.testManager.formatInfos.length; i++) {
		var format = this.testManager.formatInfos[i];
		list.appendItem(format.name, format.id);
	}
}

var encodingTestConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

function testEncoding() {
	var element = document.getElementById("encoding");
	var checkLabel = document.getElementById("encodingCheck");
	var result = "";
	try {
		encodingTestConverter.charset = element.value;
	} catch (error) {
		result = "Invalid encoding.";
	}
	var encoding = element.value.toUpperCase();
	if (encoding == 'UTF-16' || encoding == 'UTF-32') {
		// Character encodings that contain null bytes are not supported.
		// See http://developer.mozilla.org/en/docs/Reading_textual_data
		// Let me know if there are other encodings.
		result = element.value + " is currently not supported.";
	}
	checkLabel.value = result;
	document.documentElement.getButton("accept").disabled = "" != result;
}

function chooseUserExtensionsURL() {
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"]
	    .createInstance(nsIFilePicker);
	fp.init(window, "Select user-extensions.js file", nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterAll);
	var res = fp.show();
	if (res == nsIFilePicker.returnOK) {
		document.getElementById("userExtensionsURL").value = "file:" + fp.file.path;
	}
}

function updateFormatOptions() {
	if (this.format && this.format.options) {
		for (name in this.format.options) {
			var e = document.getElementById("options_" + name);
			if (e) {
				if (e.hasAttribute("checked")) {
					this.options["formats." + formatInfo.id + "." + name] = e.checked ? 'true' : 'false';
				} else {
					this.options["formats." + formatInfo.id + "." + name] = e.value;
				}
			}
		}	
	}
}

function selectFormat(id) {
	document.getElementById("format-list").value = id;
	updateFormatSelection();
}

function updateFormatSelection() {
	this.updateFormatOptions();

	var formatListBox = document.getElementById("format-list");
	var formatId = formatListBox.selectedItem.value;
	var formatInfo = this.testManager.findFormatInfo(formatId);
	
	document.getElementById("format-name").value = formatInfo.name;
	document.getElementById("delete-button").disabled = formatInfo.save ? false : true;
	document.getElementById("rename-button").disabled = formatInfo.save ? false : true;

	var configBox = document.getElementById("format-config");
	try {
		var format = formatInfo.getFormat();
	} catch (error) {
		alert("an error occured: " + error);
		var format = {};
	}
	var newConfigBox;
	if (format.createConfigForm) {
		newConfigBox = format.createConfigForm(document);
	} else {
		newConfigBox = document.createElement("box");
		newConfigBox.setAttribute("id", "format-config");
		var note = document.createElement("description");
		newConfigBox.appendChild(note);
		note.appendChild(document.createTextNode("There are no options."));
	}
	configBox.parentNode.replaceChild(newConfigBox, configBox);
	configBox = newConfigBox;
	if (format.options) {
		for (name in format.options) {
			var e = document.getElementById("options_" + name);
			if (e) {
				var value = this.options["formats." + formatInfo.id + "." + name] || format.options[name];
				if (e.hasAttribute("checked")) {
					e.checked = 'true' == value;
				} else {
					e.value = value;
				}
			}
		}
	}
	var self = this;
	this.format = format;
	this.formatInfo = formatInfo;
	configBox.addEventListener("blur", function(event) {
								   self.updateFormatOptions();
								   /*
								   var e = event.target;
								   var r;
								   if (formatInfo && (r = /^options_(.*)$/.exec(e.id)) != null) {
									   self.options["formats." + formatInfo.id + "." + r[1]] = e.value;
									   }*/
							   }, true);
}

function openFormatSource() {
	this.formatInfo.saved = false;
	window.openDialog('chrome://selenium-ide/content/format-source-dialog.xul', 'options-format-source', 'chrome', this.formatInfo);
	if (this.formatInfo.saved) {
		updateFormatSelection();
	}
}

function createNewFormat() {
	var formatInfo = new UserFormatInfo();
	window.openDialog('chrome://selenium-ide/content/format-source-dialog.xul', 'options-format-source', 'chrome', formatInfo);
	if (formatInfo.saved) {
		this.testManager.reloadFormats();
		loadFormatList();
		selectFormat(formatInfo.id);
	}
}

function findFormatIndex(formatInfo) {
	return -1;
}

function deleteFormat() {
	if (!confirm("Really delete this format?")) {
		return;
	}
	var index = -1;
	if (!this.formatInfo) return;
	var formats = this.testManager.userFormatInfos;
	for (var i = 0; i < formats.length; i++) {
		if (formats[i].id == this.formatInfo.id) {
			index = i;
			break;
		}
	}
	if (index >= 0) {
		this.testManager.removeUserFormatAt(index);
		this.testManager.saveFormats();
		loadFormatList();
		selectFormat("default");
	}
}

function renameFormat() {
	var name = prompt("Enter new name", this.formatInfo.name);
	if (name) {
		this.formatInfo.name = name;
		this.testManager.saveFormats();
		loadFormatList();
		selectFormat(this.formatInfo.id);
	}
}
