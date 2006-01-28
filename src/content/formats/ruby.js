/*
 * An example format for editing Driven Ruby test.
 */

function parse(testCase, source) {
	var commandLoadPattern = /^\s+([a-z0-9]+)\s+('.*?'|".*?")(\s*,\s*('.*?'|".*?")|)\s*$/i;
	var doc = source;
	var commands = [];
	var commandFound = false;
	var header = '';
	var footer = '';
	var result;
	while (doc.length > 0) {
		line = /.*\n?/.exec(doc)[0];
		
		if ((result = commandLoadPattern.exec(line)) != null) {
			this.log.debug("result=" + result);
			var command = new Command();
			command.command = result[1];
			command.target = result[2].replace(/^'(.*)'$/, "$1").replace(/^"(.*)"$/, "$1");
			command.value = result[4] ? result[4].replace(/^'(.*)'$/, "$1").replace(/^"(.*)"$/, "$1") : '';
			commands.push(command);
			commandFound = true;
		} else {
			var comment = new Comment();
			comment.comment = line.replace(/\r?\n?$/, "");
			commands.push(comment);
			
			if (!commandFound && line.match(/^\s+def\s/) && header == '') {
				header = '';
				for (var i = 0; i < commands.length; i++) {
					header += commands[i].comment + "\n";
				}
				commands = [];
			}
		}
		doc = doc.substr(line.length);
	}
	if (commandFound) {
		testCase.header = header;
		var footerCommands = [];
		for (var i = commands.length - 1; i >= 0; i--) {
			if (commands[i].type == 'comment') {
				footerCommands.unshift(commands.pop().comment);
			} else {
				break;
			}
		}
		testCase.footer = footerCommands.join("\n");
		testCase.setCommands(commands);
	} else {
		throw "no command found";
	}
}

function format(testCase, name, saveHeaderAndFooter) {
	var commandsText = "";
	var i;
	
	for (i = 0; i < testCase.commands.length; i++) {
		var text = getSourceForCommand(testCase.commands[i]);
		commandsText = commandsText + text;
	}

	if (testCase.header || testCase.footer) {
		return testCase.header + commandsText + testCase.footer;
	} else {
		var text = options.testHeader + commandsText + options.testFooter;
		if (saveHeaderAndFooter) {
			testCase.header = options.testHeader;
			testCase.footer = options.testFooter;
		}
		return text;
	}
}

function formatCommands(commands) {
	var commandsText = '';
	for (i = 0; i < commands.length; i++) {
		var text = getSourceForCommand(commands[i]);
		commandsText = commandsText + text;
	}
	return commandsText;
}


function getSourceForCommand(command) {
	if (command.type == 'command') {
		return "    " + command.command + " \"" + command.target + "\"" +
			(command.value != null && command.value.length > 0 ? ", \"" + command.value + "\"" : "") + "\n";
	} else if (command.type == 'comment') {
		return command.comment + "\n";
	}
}

options = {
	testHeader: "class NewTest\n  def test_foo\n",
	testFooter: "  end\nend\n"
};

configForm = 
	'<description>Header for new test file</description>' +
	'<textbox id="options_testHeader" multiline="true" flex="1" rows="4"/>' +
	'<separator class="thin"/>' +
	'<description>Footer for new test file</description>' +
	'<textbox id="options_testFooter" multiline="true" flex="1" rows="4"/>';
