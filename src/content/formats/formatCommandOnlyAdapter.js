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
}

/**
 * Format TestCase and return the source.
 *
 * @param testCase TestCase to format
 * @param name The name of the test case, if any. It may be used to embed title into the source.
 */
function format(testCase, name) {
	return formatCommands(testCase.commands);
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
				commands.push(new Command("waitForPageToLoad"));
			} else {
				commands.push(c);
			}
		}
		return commands;
	} else {
		return originalCommands;
	}
}

function formatCommands(commands) {
	commands = filterForRemoteControl(commands);
	this.lastIndent = '';
	var result = '';
	for (var i = 0; i < commands.length; i++) {
		var line;
		var command = commands[i];
		if (command.type == 'line') {
			line = command.line;
		} else if (command.type == 'command') {
			line = formatCommand(command);
		} else if (command.type == 'comment' && this.formatComment) {
			line = formatComment(command);
		}
		var r = /^(\s*)/.exec(line);
		if (r) {
			this.lastIndent = r[1];
		}
		result += line + "\n";
	}
	return result;
}

function indent() {
	return this.lastIndent || '';
}

