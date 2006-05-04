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
	this.type = "command";
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

function Comment(comment) {
	this.type = "comment";
	this.comment = comment != null ? comment : '';
}

Comment.prototype.createCopy = function() {
	var copy = new Comment();
	for (prop in this) {
		copy[prop] = this[prop];
	}
	return copy;
};

function TestCase() {
	this.log = new Log("TestCase");
	
	this.recordIndex = 0;
	
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

TestCase.prototype.setCommands = function(commands) {
	var self = this;

	var _push = commands.push;
	commands.push = function(command) {
		_push.call(commands, command);
		self.recordIndex++;
		self.setModified();
	}

	var _splice = commands.splice;
	commands.splice = function(index, removeCount, command) {
		if (command != null) {
			_splice.call(commands, index, removeCount, command);
		} else {
			_splice.call(commands, index, removeCount);
		}
		if (index <= self.recordIndex) {
			if (command != null) {
				self.recordIndex++;
		}
		self.recordIndex -= removeCount;
			if (self.recordIndex < index) {
				self.recordIndex = index;
			}
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
		this.observer.updateTitle();
	}
}

TestCase.prototype.clearModified = function() {
	this.modified = false;
	if (this.observer) {
		this.observer.updateTitle();
	}
}
