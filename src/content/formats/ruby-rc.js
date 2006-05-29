/*
 * Format for Selenium Remote Control Ruby client.
 * 
 * This format doesn't include parse function, so you cannot edit it using table view.
 */

function escape(text) {
	text = text.replace(/\"/mg, '\\"');
	text = text.replace(/\n/mg, '\\n');
	return text;
}

function formatCommand(command) {
	var line = indent();
	if (command.type == 'command') {
		var accessor = command.getAccessor();
		if (accessor) {
			var call = options.prefix + underscore(accessor);
			if (accessor.match(/^is/)) { // isXXX
				var variable = null;
				if (command.command.match(/^store/)) {
					// in store command, the value would be the name of the variable
					command = command.createCopy();
					variable = command.getRealValue();
					if (command.value) {
						command.value = null;
					} else {
						command.target = null;
					}
				}
				if (command.getRealValue()) {
					call += '(';
					if (command.getRealTarget()) {
						call += '"' + escape(command.getRealTarget()) + '", ';
					}
					call += '"' + escape(command.getRealValue()) + '"';
					call += ')';
				}
				if (command.command.match(/^(verify|assert)/)) {
					line += "assert " + call;
				} else if (command.command.match(/^store/)) {
					line += variable + " = " + call;
				} else if (command.command.match(/^waitFor/)) {
					line += 'sleep 1 until ' + call;
				}
			} else { // getXXX
				if (command.getRealTarget()) {
					call += '("' + escape(command.getRealTarget()) + '")';
				}
				if (command.command.match(/^(verify|assert)/)) {
					line += 'assert_equal "' + escape(command.getRealValue()) + '", ' + call;
				} else if (command.command.match(/^store/)) {
					line += command.getRealValue() + " = " + call;
				} else if (command.command.match(/^waitFor/)) {
					line += 'sleep 1 until "' + escape(command.getRealValue()) + '" == ' + call;
				}
			}
		} else {
			line += options.prefix + underscore(command.command);
			if ((command.target != null && command.target.length > 0)
				|| (command.value != null && command.value.length > 0)) {
				line += ' "' + escape(command.target) + '"';
				if (command.value != null && command.value.length > 0) {
					line += ', "' + escape(command.value) + '"';
				}
			}
		}
	}
	return line;
}

function formatComment(comment) {
	return indent() + "# " + comment.comment;
}

this.options = {
	prefix: "@selenium."
};

this.configForm = 
	'<description>Prefix for each command</description>' +
	'<textbox id="options_prefix" />';

this.remoteControl = true;
