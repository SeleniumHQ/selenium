/*
 * An adapter that lets you use format() function with the format
 * that only defines formatCommand() function.
 *
 */

/**
 * Parse source and update TestCase. Throw an exception if any error occurs.
 *
 * @param testCase TestCase to update
 * @param source The source to parse
 */
function parse(testCase, source) {
	testCase.header = null;
	testCase.footer = null;
	var commands = [];

	var reader = new LineReader(source);
	var line;
	while ((line = reader.read()) != null) {
		commands.push(new Line(line));
	}
	testCase.commands = commands;
	testCase.formatLocal(this.name).header = "";
	testCase.formatLocal(this.name).footer = "";
}

/**
 * Format TestCase and return the source.
 *
 * @param testCase TestCase to format
 * @param name The name of the test case, if any. It may be used to embed title into the source.
 */
function format(testCase, name) {
	this.log.info("formatting testCase: " + name);
	var result = '';
	var header = "";
	var footer = "";
	this.commandCharIndex = 0;
	if (this.formatHeader) {
		header = formatHeader(testCase);
	}
	result += header;
	this.commandCharIndex = header.length;
	testCase.formatLocal(this.name).header = header;
	result += formatCommands(testCase.commands);
	if (this.formatFooter) {
		footer = formatFooter(testCase);
	}
	result += footer;
	testCase.formatLocal(this.name).footer = footer;
	return result;
}

function filterForRemoteControl(originalCommands) {
	if (this.remoteControl) {
		var commands = [];
		for (var i = 0; i < originalCommands.length; i++) {
			var c = originalCommands[i];
			if (c.type == 'command' && c.command.match(/AndWait$/)) {
				var c1 = c.createCopy();
				c1.command = c.command.replace(/AndWait$/, '');
				commands.push(c1);
				commands.push(new Command("waitForPageToLoad", options['global.timeout'] || "30000"));
			} else {
				commands.push(c);
			}
		}
		if (this.postFilter) {
			// formats can inject command list post-processing here
			commands = this.postFilter(commands);
		}
		return commands;
	} else {
		return originalCommands;
	}
}

function addIndent(lines) {
	return lines.replace(/.+/mg, function(str) {
			return indent() + str;
		});
}

function formatCommands(commands) {
	commands = filterForRemoteControl(commands);
	if (this.lastIndent == null) {
		this.lastIndent = '';
	}
	var result = '';
	for (var i = 0; i < commands.length; i++) {
		var line = null;
		var command = commands[i];
		if (command.type == 'line') {
			line = command.line;
		} else if (command.type == 'command') {
			line = formatCommand(command);
			if (line != null) line = addIndent(line);
			command.line = line;
		} else if (command.type == 'comment' && this.formatComment) {
			line = formatComment(command);
			if (line != null) line = addIndent(line);
			command.line = line;
		}
		command.charIndex = this.commandCharIndex;
		if (line != null) {
			updateIndent(line);
			line = line + "\n";
			result += line;
			this.commandCharIndex += line.length;
		}
	}
	return result;
}

function updateIndent(line) {
	var r = /^(\s*)/.exec(line);
	if (r) {
		this.lastIndent = r[1];
	}
}

function indent() {
	return this.lastIndent || '';
}

function setIndent(i) {
  this.lastIndent = indents(i);
}