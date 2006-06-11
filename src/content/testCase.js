/*
 * Copyright 2005 Shinya Kasatani
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function Command(command, target, value) {
	this.command = command != null ? command : '';
	this.target = target != null ? target : '';
	this.value = value != null ? value : '';
}

Command.prototype.createCopy = function() {
	var copy = new Command();
	for (prop in this) {
		copy[prop] = this[prop];
	}
	return copy;
};

Command.prototype.getRealValue = function() {
	if (this.value) {
		return this.value;
	} else {
		return this.target;
	}
}

Command.prototype.getRealTarget = function() {
	if (this.value) {
		return this.target;
	} else {
		return null;
	}
}

Command.loadAPI = function() {
	if (!this.functions) {
		var document = this.apiDocument;
		var functionElements = document.documentElement.getElementsByTagName("function");
		var functions = {};
		for (var i = 0; i < functionElements.length; i++) {
			var element = functionElements.item(i);
			var def = new CommandDefinition(String(element.attributes.getNamedItem('name').value));
			var params = element.getElementsByTagName("param");
			for (var j = 0; j < params.length; j++) {
				var paramElement = params.item(j);
				var param = {};
				param.name = String(paramElement.attributes.getNamedItem('name').value);
				def.params.push(param);
			}
			functions[def.name] = def;
			if (def.name.match(/^(is|get)/)) {
				def.isAccessor = true;
				functions["!" + def.name] = def.negativeAccessor();
			}
		}
		this.functions = functions;
	}
	return this.functions;
}

function CommandDefinition(name) {
	this.name = name;
	this.params = [];
}

CommandDefinition.prototype.negativeAccessor = function() {
	var def = new CommandDefinition(this.name);
	def.params = this.params;
	def.isAccessor = true;
	def.negative = true;
	return def;
}

Command.prototype.getDefinition = function() {
	var api = Command.loadAPI();
	var r = /^(assert|verify|store|waitFor)(.*)$/.exec(this.command);
	if (r) {
		var suffix = r[2];
		var prefix = "";
		if ((r = /^(.*)NotPresent$/.exec(suffix)) != null) {
			suffix = r[1] + "Present";
			prefix = "!";
		} else if ((r = /^Not(.*)$/.exec(suffix)) != null) {
			suffix = r[1];
			prefix = "!";
		}
		var booleanAccessor = api[prefix + "is" + suffix];
		if (booleanAccessor) {
			return booleanAccessor;
		}
		var accessor = api[prefix + "get" + suffix];
		if (accessor) {
			return accessor;
		}
	} else {
		return api[this.command];
	}
	return null;
}

Command.prototype.getParameterAt = function(index) {
	switch (index) {
	case 0:
		return this.target;
	case 1:
		return this.value;
	default:
		return null;
	}
}

Command.prototype.getAPI = function() {
	return window.editor.seleniumAPI;
}

Command.prototype.type = 'command';

function Comment(comment) {
	this.comment = comment != null ? comment : '';
}

Comment.prototype.type = 'comment';

function Line(line) {
	this.line = line;
}

Line.prototype.type = 'line';

Comment.prototype.createCopy = function() {
	var copy = new Comment();
	for (prop in this) {
		copy[prop] = this[prop];
	}
	return copy;
};

function TestCase() {
	this.log = new Log("TestCase");

	this.formatLocalMap = {};
	
	this.setCommands([]);
	
	this.modified = false;

	var testCase = this;

	this.debugContext = {
		reset: function() {
			this.started = false;
			this.debugIndex = -1;
		},
		
		nextCommand: function() {
			if (!this.started) {
				this.started = true;
				this.debugIndex = testCase.startPoint ? testCase.commands.indexOf(testCase.startPoint) : 0
			} else {
				this.debugIndex++;
			}
			for (; this.debugIndex < testCase.commands.length; this.debugIndex++) {
				var command = testCase.commands[this.debugIndex];
				if (command.type == 'command') {
					return command;
				}
			}
			this.reset();
			return null;
		},

		currentCommand: function() {
			return testCase.commands[this.debugIndex];
		}
	}
}

// Store variables specific to each format in this hash.
TestCase.prototype.formatLocal = function(formatName) {
	var scope = this.formatLocalMap[formatName];
	if (!scope) {
		scope = {};
		this.formatLocalMap[formatName] = scope;
	}
	return scope;
}

TestCase.prototype.setCommands = function(commands) {
	var self = this;

	var _push = commands.push;
	commands.push = function(command) {
		_push.call(commands, command);
		self.setModified();
	}

	var _splice = commands.splice;
	commands.splice = function(index, removeCount, command) {
		if (command != null) {
			_splice.call(commands, index, removeCount, command);
		} else {
			_splice.call(commands, index, removeCount);
		}
		self.setModified();
	}

	var _pop = commands.pop;
	commands.pop = function() {
		var command = commands[commands.length - 1];
		commands.splice(commands.length - 1, 1);
		self.setModified();
		return command;
	}

	this.commands = commands;
	this.setModified();
}

TestCase.prototype.clear = function() {
	var length = this.commands.length;
	this.commands.splice(0, this.commands.length);
	this.setModified();
};

TestCase.prototype.setModified = function() {
	this.modified = true;
	if (this.observer) {
		this.observer.modifiedStateUpdated();
	}
}

TestCase.prototype.clearModified = function() {
	this.modified = false;
	if (this.observer) {
		this.observer.modifiedStateUpdated();
	}
}

TestCase.prototype.checkTimestamp = function() {
	if (this.file) {
		if (this.lastModifiedTime < this.file.lastModifiedTime) {
			this.lastModifiedTime = this.file.lastModifiedTime;
			return true;
		}
	}
	return false;
}
