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

function Commands(testCase) {
	this.testCase = testCase;
}
	
Commands.prototype = new Array;

Commands.prototype.push = function(command) {
	Array.prototype.push.call(this, command);
	this.testCase.recordIndex++;
}

Commands.prototype.splice = function(index, removeCount, command) {
	if (command != null) {
		Array.prototype.splice.call(this, index, removeCount, command);
	} else {
		Array.prototype.splice.call(this, index, removeCount);
	}
	if (index <= this.testCase.recordIndex) {
		if (command != null) {
			this.testCase.recordIndex++;
		}
		this.testCase.recordIndex -= removeCount;
		if (this.testCase.recordIndex < index) {
			this.testCase.recordIndex = index;
		}
	}
}

function TestCase() {
	this.log = new Log("TestCase");
	
	this.recordIndex = 0;
	
	this.commands = new Commands(this);

	var testCase = this;

	this.decodeText = function(text, options) {
		var escapeXml = options.escapeXmlEntities;
		if (escapeXml == 'always' || escapeXml == 'partial') {
			text = text.replace(/&lt;/g, '<');
			text = text.replace(/&gt;/g, '>');
		}
		if (escapeXml == 'always') {
			text = text.replace(/&apos;/g, "'");
			text = text.replace(/&quot;/g, '"');
			text = text.replace(/&amp;/g, '&');
		}
		if ('true' == options.escapeDollar) {
			text = text.replace(/([^\\])\$\{/g, '$1$$$${'); // replace ${...} to $${...}
			text = text.replace(/^\$\{/g, '$$$${'); // replace ${...} to $${...}
			text = text.replace(/\\\$\{/g, '$${'); // replace \${...} to ${...}
		}
		return text;
	}

	this.debugContext = {
		reset: function() {
			this.debugIndex = -1;
		},
		
		nextCommand: function() {
			while (++this.debugIndex < testCase.commands.length) {
				var command = testCase.commands[this.debugIndex];
				if (command.type == 'command') {
					return command;
				}
			}
			return null;
		},

		currentCommand: function() {
			return testCase.commands[this.debugIndex];
		}
	}
}


TestCase.prototype.clear = function() {
	var length = this.commands.length;
	this.commands.splice(0, this.commands.length);
};
