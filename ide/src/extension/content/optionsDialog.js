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

function saveOptions() {
	var options = this.options;
	var name;
	for (name in options) {
		var e = document.getElementById(name);
		if (e != null) {
			options[name] = e.checked != undefined ? e.checked.toString() : e.value;
		}
	}
	SeleniumIDE.Loader.getEditors().forEach(function(editor) {
			editor.app.setOptions(options);
		});
	
	Preferences.save(options);
	return true;
}

function loadFromOptions(options) {
	var name;
	for (name in options) {
		var e = document.getElementById(name);
		if (e != null) {
			if (e.checked != undefined) {
				e.checked = options[name] == 'true';
				
				//initialize the reload-button state
				if (name == "showDeveloperTools"){
					document.getElementById("reload").hidden = !e.checked;
					document.getElementById('reload').disabled = document.getElementById('reload').hidden
				}
			} else {
				e.value = options[name];
			}
		}
	}
}

function loadDefaultOptions() {
	if (confirm(Message("options.confirmLoadDefaultOptions"))) {
		loadFromOptions(Preferences.DEFAULT_OPTIONS);
		for (name in this.options) {
			if (/^formats\./.test(name)) {
				delete this.options[name]
			}
		}
		if (this.format) {
			showFormatDialog();
		}
	}
}

function loadOptions() {
	var options = Preferences.load();
	loadFromOptions(options);
	this.formats = new FormatCollection(options);
	this.options = options;

	loadFormatList();
	selectFormat("default");
	
	loadPluginList();
}

function loadFormatList() {
	var list = document.getElementById("format-list");
	for (var i = list.getRowCount() - 1; i >= 0; i--) {
		list.removeItemAt(i);
	}
	for (var i = 0; i < this.formats.formats.length; i++) {
		var format = this.formats.formats[i];
		list.appendItem(format.name, format.id);
	}
}

var encodingTestConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

function chooseFile(target) {
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, "Select extensions file", nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterAll);
	var res = fp.show();
	if (res == nsIFilePicker.returnOK) {
		var e = document.getElementById(target);
		if (e.value) {
			e.value += ', ' + fp.file.path;
		} else {
			e.value = fp.file.path;
		}
	}
}

function updateFormatOptions() {
	if (this.format && this.format.options) {
		for (name in this.format.options) {
			var e = document.getElementById("options_" + name);
			if (e) {
				if (e.checked != undefined) {
					this.options["formats." + this.formatInfo.id + "." + name] = e.checked.toString();
				} else {
					this.options["formats." + this.formatInfo.id + "." + name] = e.value;
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
	this.showFormatDialog();
}

function showFormatDialog() {
	var formatListBox = document.getElementById("format-list");
	if (formatListBox.selectedItem) {
		var formatId = formatListBox.selectedItem.value;
	} else {
		var formatId = 'default';
	}
	var formatInfo = this.formats.findFormat(formatId);
	
	document.getElementById("format-name").value = formatInfo.name;
	document.getElementById("delete-button").disabled = formatInfo.saveFormat ? false : true;
	document.getElementById("rename-button").disabled = formatInfo.saveFormat ? false : true;

	var configBox = document.getElementById("format-config");
    var format;
	try {
		format = formatInfo.loadFormatter();
	} catch (error) {
        setTimeout(function() {
                alert("an error occured: " + error + ", file=" + formatInfo.getFormatURI());
            }, 50);
		format = {};
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
				var value = this.options["formats." + formatInfo.id + "." + name];
				if (value == null) {
					value = format.options[name];
				}
				if (e.checked != undefined) {
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
	var formatInfo = new UserFormat();
	window.openDialog('chrome://selenium-ide/content/format-source-dialog.xul', 'options-format-source', 'chrome', formatInfo);
	if (formatInfo.saved) {
		this.formats.reloadFormats();
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
	var formats = this.formats.userFormats;
	for (var i = 0; i < formats.length; i++) {
		if (formats[i].id == this.formatInfo.id) {
			index = i;
			break;
		}
	}
	if (index >= 0) {
		this.formats.removeUserFormatAt(index);
		this.formats.saveFormats();
		loadFormatList();
		selectFormat("default");
	}
}

function renameFormat() {
	var name = prompt("Enter new name", this.formatInfo.name);
	if (name) {
		this.formatInfo.name = name;
		this.formats.saveFormats();
		loadFormatList();
		selectFormat(this.formatInfo.id);
	}
}

function validate() {
	var hasError = false;
	for (var name in validations) {
		var e = document.getElementById(name);
		var result = validations[name](e.value);
		document.getElementById(name + 'Error').value = result;
		if (result) {
			hasError = true;
		}
	}
	document.documentElement.getButton("accept").disabled = hasError;
}

var validations = {
	encoding: function(value) {
		var result = "";
		try {
			encodingTestConverter.charset = value;
		} catch (error) {
			result = Message("error.invalidEncoding");
		}
		var encoding = value.toUpperCase();
		if (encoding == 'UTF-16' || encoding == 'UTF-32') {
			// Character encodings that contain null bytes are not supported.
			// See http://developer.mozilla.org/en/docs/Reading_textual_data
			// Let me know if there are other encodings.
			result = Message("error.encodingNotSupported", value);
		}
		return result;
	},

	timeout: function(value) {
		if (value.match(/^\d+$/)) {
			return '';
		} else {
			return Message("error.timeoutNotNumber");
		}
	}
};


/**
 * Call the reload method of the current editor
 */
function reloadUserExtFile(){

	try{
			
		SeleniumIDE.Loader.getEditors()[0].reload();
	}catch(e){
		alert("error :" + e);
	}
}

/**
 * Use to toggle the reload-button state
 */
function SDTToggle(){

	document.getElementById('reload').hidden = !document.getElementById('showDeveloperTools').checked;
	document.getElementById('reload').disabled = document.getElementById('reload').hidden;
}

function loadPluginList() {
    var list = document.getElementById("plugin-list");
    for (var i = list.getRowCount() - 1; i >= 0; i--) {
        list.removeItemAt(i);
    }
    
    var plugins = this.Preferences.getString("plugins").split(",");

    var extman = Components.classes["@mozilla.org/extensions/manager;1"].createInstance(Components.interfaces.nsIExtensionManager);
    var p;
    for (var i = 0; i < plugins.length; i++) {
        p = extman.getItemForID(plugins[i]);
        list.appendItem(p.name, p.id); 
    }
    
    list.selectItem(list.getItemAtIndex(0));
}

function updatePluginOptions() {

}

function updatePluginSelection() {
  var selected = document.getElementById("plugin-list").value;
  
  var dir = Components.classes["@mozilla.org/file/directory_service;1"].  
                       getService(Components.interfaces.nsIProperties).  
                       get("ProfD", Components.interfaces.nsIFile);
  dir.append("extensions");
  dir.append(selected);

  var extman = Components.classes["@mozilla.org/extensions/manager;1"].createInstance(Components.interfaces.nsIExtensionManager);
  var p = extman.getItemForID(selected);
  
  document.getElementById("plugin-name").value = p.name;
}