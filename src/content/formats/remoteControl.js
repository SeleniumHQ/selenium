/*
 * An adapter that lets you use format() function with the format
 * that only defines formatCommand() function.
 *
 */

load('formatCommandOnlyAdapter.js');

function underscore(text) {
	return text.replace(/[A-Z]/g, function(str) {
			return '_' + str.toLowerCase();
		});
}

function not(expression) {
	return expression.not();
}

function is(expression) {
	return expression;
}

function equals(e1, e2) {
	return new Equals(e1, e2);
}

function Equals(e1, e2) {
	this.e1 = e1;
	this.e2 = e2;
}

Equals.prototype.not = function() {
	return new NotEquals(this.e1, this.e2);
}

function NotEquals(e1, e2) {
	this.e1 = e1;
	this.e2 = e2;
	this.negative = true;
}

NotEquals.prototype.not = function() {
	return new Equals(this.e1, this.e2);
}

function string(value) {
	if (value != null) {
		value = value.replace(/\"/mg, '\\"');
		value = value.replace(/\n/mg, '\\n');
		return '"' + value + '"';
	} else {
		return '""';
	}
}

function CallSelenium(message) {
	this.message = message;
	this.args = [];
}

CallSelenium.prototype.not = function() {
	var call = new CallSelenium(this.message);
	call.args = this.args;
	call.negative = !this.negative;
	return call;
}


function formatCommand(command) {
	var line = indent();
	if (command.type == 'command') {
		var def = command.getDefinition();
		if (def && def.isAccessor) {
			var call = new CallSelenium(def.name);
			for (var i = 0; i < def.params.length; i++) {
				call.args.push(string(command.getParameterAt(i)));
			}
			var extraArg = command.getParameterAt(def.params.length)
			if (def.name.match(/^is/)) { // isXXX
				if (command.command.match(/^(verify|assert)/)) {
					line += statement((def.negative ? assertFalse : assertTrue)(call));
				} else if (command.command.match(/^store/)) {
					line += statement(assignToVariable('boolean', extraArg, call));
				} else if (command.command.match(/^waitFor/)) {
					line += waitFor((def.negative ? not : is)(call));
				}
			} else { // getXXX
				if (command.command.match(/^(verify|assert)/)) {
					line += statement((def.negative ? assertNotEquals : assertEquals)(string(extraArg), call));
				} else if (command.command.match(/^store/)) {
					line += statement(assignToVariable('String', extraArg, call));
				} else if (command.command.match(/^waitFor/)) {
					line += waitFor((def.negative ? not : is)(equals(string(extraArg), call)));
				}
			}
		} else if (def) {
			var call = new CallSelenium(def.name);
			for (var i = 0; i < def.params.length; i++) {
				call.args.push(string(command.getParameterAt(i)));
			}
			line += statement(call);
		} else {
			// TODO
			var call = new CallSelenium(command.command);
			if ((command.target != null && command.target.length > 0)
				|| (command.value != null && command.value.length > 0)) {
				call.args.push(string(command.target));
				if (command.value != null && command.value.length > 0) {
					call.args.push(string(command.value));
				}
			}
			line += statement(call);
		}
	}
	return line;
}

this.remoteControl = true;
this.playable = false;
