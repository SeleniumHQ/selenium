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

function TestManager(options) {
	this.options = options;
	this.log = new Log("TestManager");
	
	this.presetFormatInfos = [new InternalFormatInfo("default", "HTML", "html.js"),
							  new InternalFormatInfo("ruby", "Ruby", "ruby.js")];
	this.reloadFormats();
	if (options.selectedFormat != null) {
		this.log.debug("selecting format: " + options.selectedFormat);
		try {
			this.selectFormat(options.selectedFormat);
		} catch (error) {
			this.log.error("failed to select format: " + error);
		}
	}
	if (this.currentFormatInfo == null) {
		this.log.debug("selecting default format");
		this.currentFormatInfo = this.formatInfos[0];
	}
}

TestManager.getFormatDir = function() {
	var formatDir = FileUtils.getProfileDir();
	formatDir.append("selenium-ide-scripts");
	if (!formatDir.exists()) {
		formatDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
	}
	formatDir.append("formats");
	if (!formatDir.exists()) {
		formatDir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
	}
	return formatDir;
}

TestManager.loadUserFormats = function() {
	var formatFile = TestManager.getFormatDir();
	formatFile.append("index.txt");
	
	if (!formatFile.exists()) {
		return [];
	}
	var text = FileUtils.readFile(formatFile);
	var conv = FileUtils.getUnicodeConverter('UTF-8');
	text = conv.ConvertToUnicode(text);
	var formats = [];
	while (text.length > 0) {
		var r = /^(\d+),(.*)\n?/.exec(text);
		if (r) {
			formats.push(new UserFormatInfo(r[1], r[2]));
			text = text.substr(r[0].length);
		} else {
			break;
		}
	}
	return formats;
}

TestManager.saveUserFormats = function(formats) {
	var text = '';
	for (var i = 0; i < formats.length; i++) {
		text += formats[i].id + ',' + formats[i].name + "\n";
	}
	var conv = FileUtils.getUnicodeConverter('UTF-8');
	text = conv.ConvertFromUnicode(text);
	
	var formatFile = TestManager.getFormatDir();
	formatFile.append("index.txt");
	var stream = FileUtils.openFileOutputStream(formatFile);
	stream.write(text, text.length);
	var fin = conv.Finish();
	if (fin.length > 0) {
		stream.write(fin, fin.length);
	}
	stream.close();
}

TestManager.loadFormat = function(url) {
	const subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
	  .getService(Components.interfaces.mozIJSSubScriptLoader);
	var format = {};
	format.options = {};
	format.configForm = '';
	subScriptLoader.loadSubScript(url, format);
	format.log = new Log("Format");
	if (format.configForm && format.configForm.length > 0) {
		function copyElement(doc, element) {
			var copy = doc.createElement(element.nodeName.toLowerCase());
			var atts = element.attributes;
			var i;
			for (i = 0; atts != null && i < atts.length; i++) {
				copy.setAttribute(atts[i].name, atts[i].value);
			}
			var childNodes = element.childNodes;
			for (i = 0; i < childNodes.length; i++) {
				if (childNodes[i].nodeType == 1) { // element
					copy.appendChild(copyElement(doc, childNodes[i]));
				} else if (childNodes[i].nodeType == 3) { // text
					copy.appendChild(doc.createTextNode(childNodes[i].nodeValue));
				}
			}
			return copy;
		}
			
		format.createConfigForm = function(document) {
			var xml = '<vbox id="format-config" xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">' + format.configForm + '</vbox>';
			var parser = new DOMParser();
			var element = parser.parseFromString(xml, "text/xml").documentElement;
			// If we directly return this element, "permission denied" exception occurs
			// when the user clicks on the buttons or textboxes. I haven't figured out the reason, 
			// but as a workaround I'll just re-create the element and make a deep copy.
			return copyElement(document, element);
		}
	}
	return format;
}


/**
 * FormatInfo for preset formats
 * @constructor
 */
function InternalFormatInfo(id, name, file) {
	this.id = id;
	this.name = name;
	this.url = 'chrome://selenium-ide/content/formats/' + file;
}

InternalFormatInfo.prototype.getFormat = function() {
	return TestManager.loadFormat(this.url);
}

InternalFormatInfo.prototype.getSource = function() {
	return FileUtils.readURL(this.url);
}


/**
 * FormatInfo created by users
 * @constructor
 */
function UserFormatInfo(id, name) {
	if (id && name) {
		this.id = id;
		this.name = name;
	} else {
		this.id = null;
		this.name = '';
	}
}

UserFormatInfo.prototype.save = function(source) {
	var formatDir = TestManager.getFormatDir();
	var formats = TestManager.loadUserFormats();
	if (!this.id) {
		var entries = formatDir.directoryEntries;
		var max = 0;
		while (entries.hasMoreElements()) {
			var file = entries.getNext().QueryInterface(Components.interfaces.nsIFile);
			var r;
			if ((r = /^(\d+)\.js$/.exec(file.leafName)) != null) {
				var id = parseInt(r[1]);
				if (id > max) max = id;
			}
		}
		max++;
		this.id = '' + max;
		formats.push(this);
	}
	var formatFile = formatDir.clone();
	formatFile.append(this.id + ".js");
	var stream = FileUtils.openFileOutputStream(formatFile);
	stream.write(source, source.length);
	stream.close();

	TestManager.saveUserFormats(formats);
}

UserFormatInfo.prototype.getFormatFile = function() {
	var formatDir = TestManager.getFormatDir();
	var formatFile = formatDir.clone();
	formatFile.append(this.id + ".js");
	return formatFile;
}

UserFormatInfo.prototype.getFormat = function() {
	return TestManager.loadFormat("file:" + this.getFormatFile().path);
}

UserFormatInfo.prototype.getSource = function() {
	if (this.id) {
		return FileUtils.readFile(this.getFormatFile());
	} else {
		return FileUtils.readURL('chrome://selenium-ide/content/formats/blank.js');
	}
}

/*
 * INTERNAL METHODS
 */

TestManager.prototype.getUnicodeConverter = function() {
	return FileUtils.getUnicodeConverter(this.options.encoding);
}

/*
 * PUBLIC METHODS
 */

TestManager.prototype.reloadFormats = function() {
	this.userFormatInfos = TestManager.loadUserFormats();
	this.formatInfos = this.presetFormatInfos.concat(this.userFormatInfos);
}

TestManager.prototype.removeUserFormatAt = function(index) {
	this.userFormatInfos.splice(index, 1);
	this.formatInfos = this.presetFormatInfos.concat(this.userFormatInfos);
}

TestManager.prototype.saveFormats = function() {
	TestManager.saveUserFormats(this.userFormatInfos);
}

TestManager.prototype.selectFormat = function(id) {
	var info = this.findFormatInfo(id);
	if (info) {
		this.currentFormatInfo = info;
	} else {
		throw "Format not found: " + name;
	}
}

TestManager.prototype.findFormatInfo = function(id) {
	for (var i = 0; i < this.formatInfos.length; i++) {
		if (id == this.formatInfos[i].id) {
			return this.formatInfos[i];
		}
	}
	return null;
}

TestManager.prototype.getFormat = function() {
	var format = this.currentFormatInfo.getFormat();
	if (!format.options) {
		format.options = {};
	}
	for (name in this.options) {
		var r = new RegExp('formats\.' + this.currentFormatInfo.id + '\.(.*)').exec(name);
		if (r) {
			format.options[r[1]] = this.options[name];
		} else if (name.indexOf('.') < 0) {
			format.options["global." + name] = this.options[name];
		}
	}
	return format;
}

TestManager.prototype.getDefaultFormat = function() {
	return this.findFormatInfo("default").getFormat();
}

TestManager.prototype.save = function(testCase) {
	return this.saveAs(testCase, testCase.filename);
};

TestManager.prototype.saveAsNew = function(testCase) {
	return this.saveAs(testCase, null);
};

TestManager.prototype.saveAs = function(testCase, filename) {
	//log.debug("saveAs: filename=" + filename);
	try {
		var file = null;
		if (filename == null) {
			var nsIFilePicker = Components.interfaces.nsIFilePicker;
			var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
			fp.init(window, "Save as...", nsIFilePicker.modeSave);
			fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterAll);
			var res = fp.show();
			if (res == nsIFilePicker.returnOK || res == nsIFilePicker.returnReplace) {
				file = fp.file;
			}
		} else {
			file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(filename);
		}
		if (file != null) {
			// save the directory so we can continue to load/save files from the current suite?
			var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance( Components.interfaces.nsIFileOutputStream);
			outputStream.init(file, 0x02 | 0x08 | 0x20, 440, 0);
			var converter = this.getUnicodeConverter();
			var text = converter.ConvertFromUnicode(this.getFormat().format(testCase, file.leafName.replace(/\.\w+$/,''), true));
			outputStream.write(text, text.length);
			var fin = converter.Finish();
			if (fin.length > 0) {
				outputStream.write(fin, fin.length);
			}
			outputStream.close();
			this.log.info("saved " + file.path);
			testCase.filename = file.path;
			testCase.baseFilename = file.leafName;
			testCase.clearModified();
			return true;
		} else {
			return false;
		}
	} catch (err) {
		alert("error: " + err);
		return false;
	}
};

TestManager.prototype.getSourceForTestCase = function(testCase) {
	return this.getFormat().format(testCase, "New Test", true);
}

TestManager.prototype.getSourceForCommands = function(commands) {
	return this.getFormat().formatCommands(commands);
}

TestManager.prototype.setSource = function(testCase, source) {
	try {
		this.getFormat().parse(testCase, source);
		testCase.setModified();
	} catch (err) {
		alert("error: " + err);
	}
}

TestManager.prototype.load = function() {
	var thefile;
	
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"]
	    .createInstance(nsIFilePicker);
	fp.init(window, "Select a File", nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterAll);
	var res = fp.show();
	if (res == nsIFilePicker.returnOK) {
		thefile = fp.file;
	} else {
		return null;
	}

	try {
		var is = Components.classes["@mozilla.org/network/file-input-stream;1"]
	    .createInstance( Components.interfaces.nsIFileInputStream );
		is.init(thefile, 0x01, 00004, null);
		var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
	    .createInstance( Components.interfaces.nsIScriptableInputStream );
		sis.init(is);
		var text = this.getUnicodeConverter().ConvertToUnicode(sis.read(sis.available()));
		var testCase = new TestCase();
		this.getFormat().parse(testCase, text);
		
		sis.close();
		is.close();
		testCase.filename = thefile.path;
		testCase.baseFilename = thefile.leafName;
		
		return testCase;
	} catch (err) {
		alert("error: " + err);
		return null;
	}
};
