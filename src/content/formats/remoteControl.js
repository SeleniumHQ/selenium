/*
 * An adapter that lets you use format() function with the format
 * that only defines formatCommand() function.
 *
 */

load('formatCommandOnlyAdapter.js');

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
	value = value.replace(/\"/mg, '\\"');
	value = value.replace(/\n/mg, '\\n');
	return '"' + value + '"';
}


function formatCommand(command) {
	var line = indent();
	if (command.type == 'command') {
		var accessor = command.getAccessor();
		if (accessor) {
			var call = new CallSelenium(accessor.name);
			call.args = [];
			if (accessor.name.match(/^is/)) { // isXXX
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
					if (command.getRealTarget()) {
						call.args.push(string(command.getRealTarget()));
					}
					call.args.push(string(command.getRealValue()));
				}
				if (command.command.match(/^(verify|assert)/)) {
					line += statement((accessor.negative ? assertFalse : assertTrue)(call));
				} else if (command.command.match(/^store/)) {
					line += statement(assignToVariable('boolean', variable, call));
				} else if (command.command.match(/^waitFor/)) {
					line += waitFor((accessor.negative ? not : is)(call));
				}
			} else { // getXXX
				if (command.getRealTarget()) {
					call.args.push(string(command.getRealTarget()));
				}
				if (command.command.match(/^(verify|assert)/)) {
					line += statement((accessor.negative ? assertNotEquals : assertEquals)(string(command.getRealValue()), call));
				} else if (command.command.match(/^store/)) {
					line += statement(assignToVariable('String', command.getRealValue(), call));
				} else if (command.command.match(/^waitFor/)) {
					line += waitFor((accessor.negative ? not : is)(equals(string(command.getRealValue()), call)));
				}
			}
		} else {
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
