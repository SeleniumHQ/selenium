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

function TestManager(app) {
	this.getOptions = function() {
		return app.options;
	}
	this.log = new Log("TestManager");
}

/*
 * INTERNAL METHODS
 */

TestManager.prototype.getFormat = function() {
	const subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Components.interfaces.mozIJSSubScriptLoader);
	var scope = {};
	//subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/ruby.js', scope);
	subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/html.js', scope);
	scope.log = this.log;
	return scope;
}

TestManager.prototype.getUnicodeConverter = function() {
	var unicodeConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
	//log.debug("setting encoding to " + this.getOptions().encoding);
	try {
		unicodeConverter.charset = this.getOptions().encoding;
	} catch (error) {
		alert("setting encoding failed: " + this.getOptions().encoding);
	}
	return unicodeConverter;
}

/*
 * PUBLIC METHODS
 */

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
			var text = converter.ConvertFromUnicode(this.getFormat().save(testCase, this.getOptions(), file.leafName.replace(/\.\w+$/,''), true));
			outputStream.write(text, text.length);
			var fin = converter.Finish();
			if (fin.length > 0) {
				outputStream.write(fin, fin.length);
			}
			outputStream.close();
			this.log.info("saved " + file.path);
			testCase.filename = file.path;
			testCase.baseFilename = file.leafName;
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
	return this.getFormat().save(testCase, this.getOptions(), null, true);
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
		testCase = this.getFormat().load(text, this.getOptions());
		
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
