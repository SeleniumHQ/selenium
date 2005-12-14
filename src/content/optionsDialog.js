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
	var options = new RecorderOptions();
	var name;
	for (name in OPTIONS) {
		var e = document.getElementById(name);
		if (e != null) {
			options[name] = e.checked != undefined ? e.checked.toString() : e.value;
		}
	}
	var w = SeleniumIDE.getRecorderWindow();
	if (w != null) {
		w.options = options;
		//w.initOptions();
	}
	options.save();
	return true;
}

function loadFromOptions(options) {
	var name;
	for (name in OPTIONS) {
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
	var options = new RecorderOptions();
	options.load();
	loadFromOptions(options);
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
