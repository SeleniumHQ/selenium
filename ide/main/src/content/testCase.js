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
    if (target != null && target instanceof Array) {
        if (target[0]) {
            this.target = target[0][0];
            this.targetCandidates = target;
        } else {
            this.target = "LOCATOR_DETECTION_FAILED";
        }
    } else {
        this.target = target != null ? target : '';
    }
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

Command.innerHTML = function(element) {
	var html = "";
	var nodes = element.childNodes;
	for (var i = 0; i < nodes.length; i++) {
		var node = nodes.item(i);
		switch (node.nodeType) {
		case 1: // ELEMENT_NODE
			html += "<" + node.nodeName + ">";
			html += this.innerHTML(node);
			html += "</" + node.nodeName + ">";
			break;
		case 3: // TEXT_NODE
			html += node.data;
			break;
		}
	}
	return html;
}

Command.loadAPI = function() {
  if (!this.functions) {
    var document;
    var documents = this.apiDocuments;
    var functions = {};
    // document.length will be 1 by default, but will grow with plugins
    for (var d = 0; d < documents.length; d++) {
      // set the current document. again, by default this is the iedoc-core.xml
      document = documents[d];
      
      // <function name="someName">
      //   <param name="targetName">description</param>
      //   <param name="valueName">description</param> -- optional
      //   <return type="string">description</return> -- optional
      //   <comment>description for ide here</comment>
      // </function>
      var functionElements = document.documentElement.getElementsByTagName("function");
      for (var i = 0; i < functionElements.length; i++) {
        var element = functionElements.item(i);
        var def = new CommandDefinition(String(element.attributes.getNamedItem('name').value));
        
        var returns = element.getElementsByTagName("return");
        if (returns.length > 0) {
          var returnType = new String(returns.item(0).attributes.getNamedItem("type").value);
          returnType = returnType.replace(/string/, "String");
          returnType = returnType.replace(/number/, "Number");
          def.returnType = returnType;
          def.returnDescription = this.innerHTML(returns.item(0));
        }
        
        var comments = element.getElementsByTagName("comment");
        if (comments.length > 0) {
          def.comment = this.innerHTML(comments.item(0));
        }
        
        var params = element.getElementsByTagName("param");
        for (var j = 0; j < params.length; j++) {
          var paramElement = params.item(j);
          var param = {};
          param.name = String(paramElement.attributes.getNamedItem('name').value);
          param.description = this.innerHTML(paramElement);
          def.params.push(param);
        }
        
        functions[def.name] = def;

        // generate negative accessors
        if (def.name.match(/^(is|get)/)) {
          def.isAccessor = true;
          functions["!" + def.name] = def.negativeAccessor();
        }
        if (def.name.match(/^assert/)) { // only assertSelected should match
          var verifyDef = new CommandDefinition(def.name);
          verifyDef.params = def.params;
          functions["verify" + def.name.substring(6)] = verifyDef;
        }
      }
    }
    functions['assertFailureOnNext'] = new CommandDefinition('assertFailureOnNext');
    functions['verifyFailureOnNext'] = new CommandDefinition('verifyFailureOnNext');
    functions['assertErrorOnNext'] = new CommandDefinition('assertErrorOnNext');
    functions['verifyErrorOnNext'] = new CommandDefinition('verifyErrorOnNext');
    this.functions = functions;
  }
  return this.functions;
}

function CommandDefinition(name) {
	this.name = name;
	this.params = [];
}

CommandDefinition.prototype.getReferenceFor = function(command) {
    var paramNames = [];
	for (var i = 0; i < this.params.length; i++) {
        paramNames.push(this.params[i].name);
	}
    var originalParamNames = paramNames.join(", ");
    if (this.name.match(/^is|get/)) { // accessor
        if (command.command) {
            if (command.command.match(/^store/)) {
                paramNames.push("variableName");
            } else if (command.command.match(/^(assert|verify|waitFor)/)) {
                if (this.name.match(/^get/)) {
                    paramNames.push("pattern");
                }
            }
        }
    }
	var note = "";
	if (command.command && command.command != this.name) {
		note = "<dt>Generated from <strong>" + this.name + "(" +
            originalParamNames + ")</strong></dt>";
	}
    var params = "";
    if (this.params.length > 0) {
        params += "<div>Arguments:</div><ul>";
        for (var i = 0; i < this.params.length; i++) {
            params += "<li>" + this.params[i].name + " - " + this.params[i].description + "</li>";
        }
        params += "</ul>";
    }
    var returns = "";
    if (this.returnDescription) {
        returns += "<dl><dt>Returns:</dt><dd>" + this.returnDescription + "</dd></dl>";
    }
	return "<dl><dt><strong>" + (command.command || this.name) + "(" +
        paramNames.join(", ") + ")</strong></dt>" +
        note +
	    '<dd style="margin:5px;">' + 
        params + returns +
	    this.comment + "</dd></dl>";
}

CommandDefinition.prototype.negativeAccessor = function() {
	var def = new CommandDefinition(this.name);
	for (var name in this) {
		def[name] = this[name];
	}
	def.isAccessor = true;
	def.negative = true;
	return def;
}

Command.prototype.getDefinition = function() {
	if (this.command == null) return null;
	var commandName = this.command.replace(/AndWait$/, '');
	var api = Command.loadAPI();
	var r = /^(assert|verify|store|waitFor)(.*)$/.exec(commandName);
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
	}
	return api[commandName];
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

/**
 * The string representation of a command is the command, target, and value
 * delimited by padded pipes.
 */
Command.prototype.toString = function()
{
    var s = this.command
    if (this.target) {
        s += ' | ' + this.target;
        if (this.value) {
            s += ' | ' + this.value;
        }
    }
    return s;
}

Command.prototype.isRollup = function()
{
    return /^rollup(?:AndWait)?$/.test(this.command);
}

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

function TestCase(tempTitle) {
    if (!tempTitle) tempTitle = "Untitled";
	this.log = new Log("TestCase");
    this.tempTitle = tempTitle;
	this.formatLocalMap = {};
    this.commands = [];
    this.recordModifiedInCommands();
    this.baseURL = "";

	var testCase = this;

	this.debugContext = {
		reset: function() {
            this.failed = false;
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
			return null;
		},

		currentCommand: function() {
			var command = testCase.commands[this.debugIndex];
            if (!command) {
                testCase.log.warn("currentCommand() not found: commands.length=" + testCase.commands.length + ", debugIndex=" + this.debugIndex);
            }
            return command;
		}
	}
}

// Create a shallow copy of testcase
TestCase.prototype.createCopy = function() {
	var copy = new TestCase();
	for (prop in this) {
		copy[prop] = this[prop];
	}
	return copy;
};


// Store variables specific to each format in this hash.
TestCase.prototype.formatLocal = function(formatName) {
	var scope = this.formatLocalMap[formatName];
	if (!scope) {
		scope = {};
		this.formatLocalMap[formatName] = scope;
	}
	return scope;
}

// For backwards compatibility
TestCase.prototype.setCommands = function(commands) {
    this.commands = commands;
    this.recordModifiedInCommands();
}

TestCase.prototype.recordModifiedInCommands = function() {
    if (this.commands.recordModified) {
        return;
    }
    this.commands.recordModified = true;
	var self = this;
    var commands = this.commands;

	var _push = commands.push;
	commands.push = function(command) {
		_push.call(commands, command);
		self.setModified();
	}

	var _splice = commands.splice;
	commands.splice = function(index, removeCount, command) {

                var removed = null;
		if (command !== undefined && command != null) {
			removed = _splice.call(commands, index, removeCount, command);
		} else {
			removed = _splice.call(commands, index, removeCount);
		}
		self.setModified();

                return removed;
	}

	var _pop = commands.pop;
	commands.pop = function() {
		var command = commands[commands.length - 1];
		commands.splice(commands.length - 1, 1);
		self.setModified();
		return command;
	}
}

TestCase.prototype.clear = function() {
	var length = this.commands.length;
	this.commands.splice(0, this.commands.length);
	this.setModified();
};

TestCase.prototype.setModified = function() {
	this.modified = true;
    this.notify("modifiedStateUpdated");
}

TestCase.prototype.clearModified = function() {
	this.modified = false;
    this.notify("modifiedStateUpdated");
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

TestCase.prototype.getCommandIndexByTextIndex = function(text, index, formatter) {
	this.log.debug("getCommandIndexByTextIndex: index=" + index);
	var lineno = text.substring(0, index).split(/\n/).length - 1;
	var header = this.formatLocal(formatter.name).header;
	this.log.debug("lineno=" + lineno + ", header=" + header);
	if (header) {
		lineno -= header.split(/\n/).length - 1;
	}
	this.log.debug("this.commands.length=" + this.commands.length);
	for (var i = 0; i < this.commands.length; i++) {
		this.log.debug("lineno=" + lineno + ", i=" + i);
		if (lineno <= 0) {
			return i;
		}
		var command = this.commands[i];
		if (command.line != null) {
			lineno -= command.line.split(/\n/).length;
		}
	}
	return this.commands.length;
}

TestCase.prototype.getTitle = function() {
    if (this.title) {
        return this.title;
    } else if (this.file && this.file.leafName) {
        return this.file.leafName.replace(/\.\w+$/,'');
    } else if (this.tempTitle) {
        return this.tempTitle;
    } else {
        return null;
    }
}

TestCase.prototype.setBaseURL = function(baseURL) {
    this.baseURL = baseURL;
}

TestCase.prototype.getBaseURL = function() {
    if (!this.baseURL || this.baseURL == "") {
		return "http://change-this-to-the-site-you-are-testing/";
    } else {
		return this.baseURL;
	}
}

observable(TestCase);
