/*
 * Format for Selenium Remote Control Ruby client.
 * 
 * This format doesn't include parse function, so you cannot edit it using table view.
 */

function escape(text) {
	text = text.replace(/\"/, '\"');
	text = text.replace(/\n/, '\n');
	return text;
}

function indent() {
	return '  ';
}

function formatCommand(command) {
	var line = '';
	if (command.type == 'command') {
		line = indent() + 
			options.prefix + 
			underscore(command.command) + ' "' + 
			escape(command.target) + '"';
		if (command.value != null && command.value.length > 0) {
			line += ', "' + escape(command.value) + '"';
		}
	}
	return line;
}

this.options = {
	prefix: "@selenium."
};

this.remoteControl = true;
