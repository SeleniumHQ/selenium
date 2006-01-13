function load(source, options) {
	var testCase = new TestCase();
	var commandLoadPattern = /^\s+([a-z0-9]+)\s+('.*?'|".*?")(\s*,\s*('.*?'|".*?")|)\s*$/i;
	var doc = source;
	var commands = new Commands(testCase);
	while (doc.length > 0) {
		line = /.*\n?/.exec(doc)[0];
		
		if ((result = commandLoadPattern.exec(line)) != null) {
			this.log.debug("result=" + result);
			var command = new Command();
			command.command = result[1];
			command.target = result[2].replace(/^'(.*)'$/, "$1").replace(/^"(.*)"$/, "$1");
			command.value = result[4] ? result[4].replace(/^'(.*)'$/, "$1").replace(/^"(.*)"$/, "$1") : '';
			commands.push(command);
		} else {
			var comment = new Comment();
			comment.comment = line;
			commands.push(comment);
		}
		doc = doc.substr(line.length);
	}
	if (commands.length > 0) {
		testCase.commands = commands;
		return testCase;
	} else {
		throw "no command found";
	}
}

function save(testCase, options, name, saveHeaderAndFooter) {
	var commandsText = "";
	var i;
	
	for (i = 0; i < testCase.commands.length; i++) {
		var text = getSourceForCommand(testCase.commands[i], options);
		commandsText = commandsText + text;
	}

	return commandsText;
}

function getSourceForCommand(command, options) {
	if (command.type == 'command') {
		return "    " + command.command + " \"" + command.target + "\"" +
			(command.value != null && command.value.length > 0 ? ", \"" + command.value + "\"" : "") + "\n";
	} else if (command.type == 'comment') {
		return command.comment;
	}
}

