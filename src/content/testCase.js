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

function Command(command, target, value) {
	this.type = "command";
	this.command = command != null ? command : '';
	this.target = target != null ? target : '';
	this.value = value != null ? value : '';
}

Command.prototype.createCopy = function() {
	var copy = new Command();
	for (prop in this) {
		copy[prop] = this[prop];
	}
	return copy;
};

function Comment(comment) {
	this.type = "comment";
	this.comment = comment != null ? comment : '';
}

Comment.prototype.createCopy = function() {
	var copy = new Comment();
	for (prop in this) {
		copy[prop] = this[prop];
	}
	return copy;
};

function Commands(testCase) {
	this.testCase = testCase;
}
	
Commands.prototype = new Array;

Commands.prototype.push = function(command) {
	Array.prototype.push.call(this, command);
	this.testCase.recordIndex++;
}

Commands.prototype.splice = function(index, removeCount, command) {
	if (command != null) {
		Array.prototype.splice.call(this, index, removeCount, command);
	} else {
		Array.prototype.splice.call(this, index, removeCount);
	}
	if (index <= this.testCase.recordIndex) {
		if (command != null) {
			this.testCase.recordIndex++;
		}
		this.testCase.recordIndex -= removeCount;
		if (this.testCase.recordIndex < index) {
			this.testCase.recordIndex = index;
		}
	}
}

function TestCase() {
	this.log = new Log("TestCase");
	
	this.recordIndex = 0;
	
	this.commands = new Commands(this);

	this.decodeText = function(text, options) {
		var escapeXml = options.escapeXmlEntities;
		if (escapeXml == 'always' || escapeXml == 'partial') {
			text = text.replace(/&lt;/g, '<');
			text = text.replace(/&gt;/g, '>');
		}
		if (escapeXml == 'always') {
			text = text.replace(/&apos;/g, "'");
			text = text.replace(/&quot;/g, '"');
			text = text.replace(/&amp;/g, '&');
		}
		if ('true' == options.escapeDollar) {
			text = text.replace(/([^\\])\$\{/g, '$1$$$${'); // replace ${...} to $${...}
			text = text.replace(/^\$\{/g, '$$$${'); // replace ${...} to $${...}
			text = text.replace(/\\\$\{/g, '$${'); // replace \${...} to ${...}
		}
		return text;
	}

	this.encodeText = function(text, options) {
		var escapeXml = options.escapeXmlEntities;
		if (escapeXml == 'always') {
			// & -> &amp;
			// &amp; -> &amp;amp;
			// &quot; -> &amp;quot;
			// &nbsp; -> &nbsp;
			text = text.replace(/&(\w+);/g, '%%tmp_entity%%$1%%');
			text = text.replace(/%%tmp_entity%%(amp|apos|quot|lt|gt)%%/g, '&$1;');
			text = text.replace(/&/g, '&amp;');
			text = text.replace(/%%tmp_entity%%(\w+)%%/g, '&$1;');
			text = text.replace(/\'/g, '&apos;');
			text = text.replace(/\"/g, '&quot;');
		}
		if (escapeXml == 'always' || escapeXml == 'partial') {
			text = text.replace(/</g, '&lt;');
			text = text.replace(/>/g, '&gt;');
		}
		if ('true' == options.escapeDollar) {
			text = text.replace(/([^\$])\$\{/g, '$1\\${'); // replace ${...} to \${...}
			text = text.replace(/^\$\{/g, '\\${'); // replace ${...} to \${...}
			text = text.replace(/\$\$\{/g, '${'); // replace $${...} to ${...}
		}
		return text;
	}

	this.getConverter = function(options) {
		var unicodeConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		//log.debug("setting encoding to " + options.encoding);
		try {
			unicodeConverter.charset = options.encoding;
		} catch (error) {
			alert("setting encoding failed: " + options.encoding);
		}
		return unicodeConverter;
	}

	this.convertText = function(command, converter, options) {
		for (prop in command) {
			if (instanceOf(command[prop], String)) {
				command[prop] = converter(command[prop], options);
			}
		}
	}
}

TestCase.prototype.getSourceForCommands = function(commands, options) {
	var commandsText = '';
	for (i = 0; i < commands.length; i++) {
		var text = this.getSourceForCommand(commands[i], options);
		commandsText = commandsText + text;
	}
	return commandsText;
}

TestCase.prototype.getSourceForCommand = function(commandObj, options) {
	var command = null;
	var comment = null;
	var template = '';
	if (commandObj.type == 'command') {
		command = commandObj;
		command = command.createCopy();
		this.convertText(command, this.encodeText, options);
		template = options.commandTemplate;
	} else if (commandObj.type == 'comment') {
		comment = commandObj;
		template = options.commentTemplate;
	}
	var result;
	var text = template.replace(/\$\{([a-zA-Z0-9_\.]+)\}/g, 
								function(str, p1, offset, s) {
									 result = eval(p1);
									 return result != null ? result : '';
								 });
	return text;
}

TestCase.prototype.getSource = function(options, name, saveHeaderAndFooter) {
	try {
		//this.log.debug("createText");
		var text;
		var commandsText = "";
		var testText;
		var i;
		
		for (i = 0; i < this.commands.length; i++) {
			var text = this.getSourceForCommand(this.commands[i], options);
			commandsText = commandsText + text;
		}
			
		var testText;
		if (this.header == null || this.footer == null) {
			testText = options.testTemplate;
			testText = testText.replace(/\$\{name\}/g, name);
			var commandsIndex = testText.indexOf("${commands}");
			if (commandsIndex >= 0) {
				var header = testText.substr(0, commandsIndex);
				var footer = testText.substr(commandsIndex + "${commands}".length);
				testText = header + commandsText + footer;
				if (saveHeaderAndFooter) {
					this.header = header;
					this.footer = footer;
				}
			}
		} else {
			testText = this.header + commandsText + this.footer;
		}
		
		return testText;
	} catch (error) {
		alert("error in createText: " + error);
		return null;
	}
};

TestCase.prototype.clear = function() {
	var length = this.commands.length;
	this.commands.splice(0, this.commands.length);
};

TestCase.prototype.setSource = function(document, options) {
	try {
		var commandLoadPattern = options.commandLoadPattern;
		var commandRegexp = new RegExp(commandLoadPattern, 'i');
		var commentRegexp = new RegExp("^" + options.commentLoadPattern, 'i');
		var doc = document;
		var result;
		var commands = new Commands(this);
		var command;
		var first = true;
		var i;
		//var vars = this.options.commandLoadVars;
		while (true) {
			if ((result = commandRegexp.exec(doc)) != null) {
				if (first) {
					// treat text before the first match as header
					i = doc.indexOf(result[0]);
					this.header = doc.substr(0, i);
					doc = doc.substr(i);
				}
				//log.debug("result=" + result);
				command = new Command();
				eval(options.commandLoadScript);
				this.convertText(command, this.decodeText, options);
				commands.push(command);
				doc = doc.substr(result[0].length);
				if (first) {
					commandRegexp = new RegExp("^" + commandLoadPattern, 'i');
				}
				first = false;
			} else if ((result = commentRegexp.exec(doc)) != null) {
				if (first) {
					// no command found, but found a comment
					break;
				}
				var comment = new Comment();
				eval(options.commentLoadScript);
				commands.push(comment);
				doc = doc.substr(result[0].length);
			} else {
				break;
			}
		}
		if (commands.length > 0) {
			this.footer = doc;
			//log.debug("header=" + this.header);
			//log.debug("footer=" + this.footer);
			//log.debug("commands.length=" + commands.length);
			this.commands = commands;
			return true;
		} else {
			throw "no command found";
		}
	} catch (error) {
		throw "error in setSource: " + error;
	}
}

TestCase.prototype.load = function(options) {
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
		return false;
	}
	
	var is = Components.classes["@mozilla.org/network/file-input-stream;1"]
	    .createInstance( Components.interfaces.nsIFileInputStream );
	is.init(thefile, 0x01, 00004, null);
	var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
	    .createInstance( Components.interfaces.nsIScriptableInputStream );
	sis.init(is);
	var text = this.getConverter(options).ConvertToUnicode(sis.read(sis.available()));
	this.setSource(text, options);
	
	sis.close();
	is.close();
	this.filename = thefile.path;
	this.baseFilename = thefile.leafName;
	
	return true;
};

TestCase.prototype.save = function(options) {
	return this.saveAs(options, this.filename);
};

TestCase.prototype.saveAsNew = function(options) {
	return this.saveAs(options, null);
};

TestCase.prototype.saveAs = function(options, filename) {
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
			var converter = this.getConverter(options);
			var text = converter.ConvertFromUnicode(this.getSource(options, file.leafName.replace(/\.\w+$/,''), true));
			outputStream.write(text, text.length);
			var fin = converter.Finish();
			if (fin.length > 0) {
				outputStream.write(fin, fin.length);
			}
			outputStream.close();
			this.log.info("saved " + file.path);
			this.filename = file.path;
			this.baseFilename = file.leafName;
			return true;
		} else {
			return false;
		}
	} catch (err) {
		alert("error: " + err);
		return false;
	}
};
