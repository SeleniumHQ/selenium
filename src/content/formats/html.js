function decodeText(text, options) {
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

function encodeText(text, options) {
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

function convertText(command, converter, options) {
	for (prop in command) {
		if (instanceOf(command[prop], String)) {
			command[prop] = converter(command[prop], options);
		}
	}
}

function load(source, options) {
	var testCase = new TestCase();
	var commandLoadPattern = options.commandLoadPattern;
	var commandRegexp = new RegExp(commandLoadPattern, 'i');
	var commentRegexp = new RegExp("^" + options.commentLoadPattern, 'i');
	var doc = source;
	var result;
	var commands = new Commands(testCase);
	var command;
	var first = true;
	var i;
	//var vars = this.options.commandLoadVars;
	while (true) {
		if ((result = commandRegexp.exec(doc)) != null) {
			if (first) {
				// treat text before the first match as header
				i = doc.indexOf(result[0]);
				testCase.header = doc.substr(0, i);
				doc = doc.substr(i);
			}
			//log.debug("result=" + result);
			command = new Command();
			eval(options.commandLoadScript);
			convertText(command, decodeText, options);
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
		testCase.footer = doc;
		//log.debug("header=" + this.header);
		//log.debug("footer=" + this.footer);
		//log.debug("commands.length=" + commands.length);
		testCase.commands = commands;
		return testCase;
	} else {
		throw "no command found";
	}
}

function getSourceForCommand(commandObj, options) {
	var command = null;
	var comment = null;
	var template = '';
	if (commandObj.type == 'command') {
		command = commandObj;
		command = command.createCopy();
		convertText(command, this.encodeText, options);
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

function getSourceForCommands(commands, options) {
	var commandsText = '';
	for (i = 0; i < commands.length; i++) {
		var text = getSourceForCommand(commands[i], options);
		commandsText = commandsText + text;
	}
	return commandsText;
}

function save(testCase, options, name, saveHeaderAndFooter) {
	var text;
	var commandsText = "";
	var testText;
	var i;
	
	for (i = 0; i < testCase.commands.length; i++) {
		var text = getSourceForCommand(testCase.commands[i], options);
		commandsText = commandsText + text;
	}
	
	var testText;
	if (testCase.header == null || testCase.footer == null) {
		testText = options.testTemplate;
		testText = testText.replace(/\$\{name\}/g, name);
		var commandsIndex = testText.indexOf("${commands}");
		if (commandsIndex >= 0) {
			var header = testText.substr(0, commandsIndex);
			var footer = testText.substr(commandsIndex + "${commands}".length);
			testText = header + commandsText + footer;
			if (saveHeaderAndFooter) {
				testCase.header = header;
				testCase.footer = footer;
			}
		}
	} else {
		testText = testCase.header + commandsText + testCase.footer;
	}
	
	return testText;
}
