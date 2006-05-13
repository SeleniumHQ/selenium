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
	var result = '';
	for (var i = 0; i < testCase.commands.length; i++) {
		var line;
		var command = testCase.commands[i];
		if (command.type == 'line') {
			line = command.line;
		} else if (command.type == 'command') {
			line = formatCommand(command);
		}
		result += line + "\n";
	}
	return result;
}

