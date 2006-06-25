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

function TreeView(editor, document, tree) {
	this.log = new Log("TreeView");
	this.editor = editor;
	tree.view = this;
	this.tree = tree;
	this.document = document;
	this.rowCount = 0;
	this.recordIndex = 0;
	this.undoStack = [];
	this.redoStack = [];
	var self = this;

	var controller = {
		supportsCommand : function(cmd) {
			switch (cmd) {
			case "cmd_delete":
			case "cmd_copy":
			case "cmd_cut":
			case "cmd_paste":
			case "cmd_selectAll":
			case "cmd_undo":
			case "cmd_redo":
			case "cmd_selenium_startpoint":
			case "cmd_selenium_breakpoint":
			case "cmd_selenium_exec_command":
				return true;
			default:
				return false;
			}
		},
		isCommandEnabled : function(cmd){
			switch (cmd) {
			case "cmd_delete":
			case "cmd_copy":
			case "cmd_cut":
			    return self.selection.getRangeCount() > 0;
			case "cmd_paste":
			    return self.clipboard != null;
			case "cmd_undo":
			    return self.undoStack.length > 0;
			case "cmd_redo":
			    return self.redoStack.length > 0;
			case "cmd_selenium_startpoint":
			    return self.selection.getRangeCount() > 0;
			case "cmd_selenium_breakpoint":
			    return self.selection.getRangeCount() > 0;
			case "cmd_selenium_exec_command":
			    return self.selection.getRangeCount() > 0;
			default:
				return false;
			}
		},
		doCommand : function(cmd) {
			switch (cmd) {
			case "cmd_delete": self.deleteSelected(); break;
			case "cmd_copy": self.copy(); break;
			case "cmd_cut": self.cut(); break;
			case "cmd_paste": self.paste(); break;
			case "cmd_undo": self.undo(); break;
			case "cmd_redo": self.redo(); break;
			case "cmd_selenium_breakpoint": self.setBreakpoint(); break;
			case "cmd_selenium_startpoint": self.setStartPoint(); break;
			case "cmd_selenium_exec_command": self.executeCurrentCommand(); break;
			}
		},
		onEvent : function(evt) {}
	};
	this.tree.controllers.appendController(controller);

	this.atomService = Components.classes["@mozilla.org/atom-service;1"].
		getService(Components.interfaces.nsIAtomService);

	var clipboard = Components.classes["@mozilla.org/widget/clipboard;1"].
		getService(Components.interfaces.nsIClipboard);

	function createTransferable() {
		return Components.classes["@mozilla.org/widget/transferable;1"].
			createInstance(Components.interfaces.nsITransferable);
	}

	function createClipboardString() {
		return Components.classes["@mozilla.org/supports-string;1"].
            createInstance(Components.interfaces.nsISupportsString);
	}

	this.putCommandsToClipboard = function(commands) {
		var trans = createTransferable();
		var str = createClipboardString();
		trans.addDataFlavor("text/unicode");
		var text = this.editor.clipboardFormat.getSourceForCommands(commands);
		str.data = text;
		trans.setTransferData("text/unicode", str, text.length * 2);
		clipboard.setData(trans, null, Components.interfaces.nsIClipboard.kGlobalClipboard);
		this.clipboard = commands;
		window.updateCommands('clipboard');
	};

	this.getCommandsFromClipboard = function() {
		// not reading from a real clipboard...
		return this.clipboard;
	};

	this.setTextBox = function(id,value,disabled) {
		this.document.getElementById(id).value = value;
		this.document.getElementById(id).disabled = disabled;
	};

	this.getCommand = function(row) {
		if (row < this.testCase.commands.length) {
			return this.testCase.commands[row];
		} else {
			return this.newCommand;
		}
	};

	function loadSeleniumCommands() {
		var commands = [];
		
		var nonWaitActions = ['open', 'selectWindow', 'chooseCancelOnNextConfirmation', 'answerOnNextPrompt', 'close', 'setContext', 'setTimeout'];
		
		for (func in this.editor.seleniumAPI.Selenium.prototype) {
			//this.log.debug("func=" + func);
			var r;
			if (func.match(/^do[A-Z]/)) {
				var action = func.substr(2,1).toLowerCase() + func.substr(3);
				commands.push(action);
				if (!action.match(/^waitFor/) && nonWaitActions.indexOf(action) < 0) {
					commands.push(action + "AndWait");
				}
			} else if (func.match(/^assert.+/)) {
				commands.push(func);
				commands.push("verify" + func.substr(6));
			} else if ((r = func.match(/^(get|is)(.+)$/))) {
				var base = r[2];
				commands.push("assert" + base);
				commands.push("verify" + base);
				commands.push("store" + base);
				commands.push("waitFor" + base);
				var r2;
				if ((r = func.match(/^is(.*)Present$/))) {
					base = r[1];
					commands.push("assert" + base + "NotPresent");
					commands.push("verify" + base + "NotPresent");
				} else {
					commands.push("assertNot" + base);
					commands.push("verifyNot" + base);
				}
			}
		}

		commands.push("pause");

		commands.sort();
		var array = Components.classes["@mozilla.org/supports-array;1"].createInstance(Components.interfaces.nsISupportsArray);
		for (var i = 0; i < commands.length; i++) {
			var string = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
			string.data = commands[i];
			array.AppendElement(string);
		}
		var autocomplete = Components.classes["@mozilla.org/autocomplete/search;1?name=selenium-commands"].getService(Components.interfaces.nsISeleniumAutoCompleteSearch);
		autocomplete.setSeleniumCommands(array);
	}
	
	loadSeleniumCommands();
}

TreeView.prototype = {
	/*
	 * internal methods
	 */
	
	/**
	 * execute undoable action
	 */
	executeAction: function(action) {
		this.undoStack.push(action);
		this.redoStack.splice(0, this.redoStack.length);
		action.execute();
		window.updateCommands("undo");
	},

	encodeText: function(text) {
		text = text.replace(/\\/g, "\\\\");
		text = text.replace(/\n/g, "\\n");
		return text;
	},

	decodeText: function(text) {
		text = text.replace(/\\n/g, "\n");
		text = text.replace(/\\\\/g, "\\");
		return text;
	},

	/*
	 * public methods
	 */
	scrollToRow: function(index) {
		this.treebox.ensureRowIsVisible(index);
	},
	rowInserted: function(index) {
		this.log.debug("rowInserted: index=" + index);
		this.treebox.rowCountChanged(index, 1);
		this.rowCount++;
		//this.treebox.scrollToRow(this.testCase.commands.length - 1);
		if (index >= this.recordIndex) {
			this.recordIndex++;
		}
		this.treebox.ensureRowIsVisible(index);
	},
	rowUpdated: function(index) {
		this.treebox.invalidateRow(index);
	},
	refresh: function() {
		this.log.debug("refresh: old rowCount=" + this.rowCount);
		this.treebox.rowCountChanged(0, -this.rowCount);
		var length = 0;
		if (this.testCase != null) {
			length = this.testCase.commands.length;
		}
		this.treebox.rowCountChanged(0, length + 1);
		this.rowCount = length + 1;
		if (this.recordIndex > length) {
			this.recordIndex = length;
		}
		this.newCommand = new Command();
		this.log.debug("refresh: new rowCount=" + this.rowCount);
	},
	// synchronize model from view
	syncModel: function(force) {
	},
	// called when the command is selected in the tree view
	selectCommand: function() {
		if (this.tree.currentIndex >= 0) {
			var command = this.getCommand(this.tree.currentIndex);
			this.currentCommand = command;
			if (command.type == 'command') {
				this.setTextBox("commandAction", command.command, false);
				this.setTextBox("commandTarget", this.encodeText(command.target), false);
				this.setTextBox("commandValue", this.encodeText(command.value), false);
			} else if (command.type == 'comment') {
				this.setTextBox("commandAction", command.comment, false);
				this.setTextBox("commandTarget", '', true);
				this.setTextBox("commandValue", '', true);
			}

			this.selectRecordIndex(this.tree.currentIndex);
		} else {
			this.setTextBox("commandAction", '', true);
			this.setTextBox("commandTarget", '', true);
			this.setTextBox("commandValue", '', true);
			this.currentCommand = null;
		}
		window.updateCommands('select');
	},
	selectRecordIndex: function(index) {
		var oldRecordIndex = this.recordIndex;
		this.recordIndex = index;
		this.rowUpdated(oldRecordIndex);
		this.rowUpdated(this.recordIndex);
	},
	// called when the user enters any text into the textbox
	updateCurrentCommand: function(key, value) {
		if (this.currentCommand != null) {
			this.executeAction(new TreeView.UpdateCommandAction(this, key, value));
		}
	},
	onHide: function() {
		this.setTextBox("commandAction", '', true);
		this.setTextBox("commandTarget", '', true);
		this.setTextBox("commandValue", '', true);
		this.currentCommand = null;
	},
	getRecordIndex: function() {
		return this.recordIndex;
	},
	
	//
	// editing functions
	//
	copyOrDelete: function(copy, doDelete) {
		if (!this.treebox.focused) return;
		var count = this.selection.getRangeCount();
		if (count > 0) {
			var copyCommands = [];
			var deleteRanges = [];
			var currentIndex = this.tree.currentIndex;
			for (var i = 0; i < count; i++) {
				var start = new Object();
				var end = new Object();
				this.selection.getRangeAt(i, start, end);
				var deleteCommands = {start: start.value, commands:[]};
				for (var v = start.value; v <= end.value; v++) {
					var command = this.getCommand(v);
					copyCommands.push(command.createCopy());
					if (doDelete && command != this.newCommand) {
						deleteCommands.commands.push(command);
					}
				}
				deleteRanges.push(deleteCommands);
			}
			if (copy) {
				this.putCommandsToClipboard(copyCommands);
			}
			if (doDelete) {
				this.executeAction(new TreeView.DeleteCommandAction(this, deleteRanges));
			}
		}
	},
	deleteSelected: function() {
		this.copyOrDelete(false, true);
	},
	paste: function() {
		if (!this.treebox.focused) return;
		if (this.clipboard != null) {
			//var commands = this.clipboard;
			var commands = this.getCommandsFromClipboard();
			var currentIndex = this.tree.currentIndex;
			if (this.selection.getRangeCount() == 0) {
				currentIndex = this.rowCount;
			}
			this.executeAction(new TreeView.PasteCommandAction(this, currentIndex, commands));
			/*
			for (var i = 0; i < commands.length; i++) {
				var command = commands[i];
				this.insertAt(currentIndex + i, command.createCopy());
				}*/
		}
	},
	insertAt: function(pos, command) {
		this.testCase.commands.splice(pos, 0, command);
		this.treebox.rowCountChanged(pos, 1);
		this.treebox.ensureRowIsVisible(pos);
		this.rowCount++;
		this.log.debug("insertAt");
	},
	cut: function() {
		this.copyOrDelete(true, true);
	},
	copy: function() {
		this.copyOrDelete(true, false);
	},
	insertCommand: function() {
		if (this.tree.currentIndex >= 0) {
			var currentIndex = this.tree.currentIndex;
			this.insertAt(this.tree.currentIndex, new Command());
			this.selection.select(currentIndex);
		}
	},
	insertComment: function() {
		if (this.tree.currentIndex >= 0) {
			var currentIndex = this.tree.currentIndex;
			this.insertAt(this.tree.currentIndex, new Comment());
			this.selection.select(currentIndex);
		}
	},
	setBreakpoint: function() {
		if (this.tree.currentIndex >= 0) {
			var command = this.getCommand(this.tree.currentIndex);
			command.breakpoint = command.breakpoint ? null : true;
			if (command == this.testCase.startPoint) {
				this.testCase.startPoint = null;
			}
			this.rowUpdated(this.tree.currentIndex);
		}
	},
	setStartPoint: function() {
		if (this.tree.currentIndex >= 0) {
			var command = this.getCommand(this.tree.currentIndex);
			var oldStartPoint = this.testCase.startPoint;
			if (command.breakpoint) {
				command.breakpoint = null;
			}
			if (oldStartPoint == command) {
				// clear startpoint
				this.testCase.startPoint = null;
			} else {
				this.testCase.startPoint = command;
				this.rowUpdated(this.tree.currentIndex);
			}
			if (oldStartPoint) {
				this.rowUpdated(this.testCase.commands.indexOf(oldStartPoint));
			}
		}
	},
	executeCurrentCommand: function() {
		if (this.tree.currentIndex >= 0) {
			var command = this.getCommand(this.tree.currentIndex);
			if (this.newCommand != command && command.type == 'command') {
				this.selection.clearSelection();
				this.editor.selDebugger.executeCommand(command);
			}
		}
	},

	undo: function() {
		var action = this.undoStack.pop();
		if (action != null) {
			action.undo();
			this.redoStack.push(action);
			window.updateCommands("undo");
		}
	},

	redo: function() {
		var action = this.redoStack.pop();
		if (action != null) {
			action.execute();
			this.undoStack.push(action);
			window.updateCommands("undo");
		}
	},

	//
	// nsITreeView interfaces
	//
    getCellText : function(row, column){
		var colId = column.id != null ? column.id : column;
		var command = this.getCommand(row);
		if (command.type == 'command') {
			return command[colId];
		} else if (command.type == 'comment') {
			return colId == 'command' ? command.comment : '';
		} else {
			return null;
		}
    },
    setTree: function(treebox) {
		this.log.debug("setTree: treebox=" + treebox);
		this.treebox = treebox;
	},
    isContainer: function(row) {
		return false;
	},
    isSeparator: function(row) {
		return false;
	},
    isSorted: function(row) {
		return false;
	},
    getLevel: function(row) {
		return 0;
	},
    getImageSrc: function(row,col) {
		return null;
	},
    getRowProperties: function(row, props) {
		var command = this.getCommand(row);
		if (this.selection.isSelected(row)) return;
		if (row == this.testCase.debugContext.debugIndex) {
			props.AppendElement(this.atomService.getAtom("debugIndex"));
		} else if (command.result == 'done') {
			props.AppendElement(this.atomService.getAtom("commandDone"));
		} else if (command.result == 'passed') {
			props.AppendElement(this.atomService.getAtom("commandPassed"));
		} else if (command.result == 'failed') {
			props.AppendElement(this.atomService.getAtom("commandFailed"));
		}
	},
    getCellProperties: function(row, col, props) {
		var command = this.getCommand(row);
		if (command.type == 'comment') {
			props.AppendElement(this.atomService.getAtom("comment"));
		}
		if (command == this.currentCommand) {
			props.AppendElement(this.atomService.getAtom("currentCommand"));
		}
		if (row == this.recordIndex) {
			props.AppendElement(this.atomService.getAtom("recordIndex"));
		}
		if (0 == col.index && command.breakpoint) {
			props.AppendElement(this.atomService.getAtom("breakpoint"));
		}
		if (0 == col.index && this.testCase.startPoint == command) {
			props.AppendElement(this.atomService.getAtom("startpoint"));
		}
	},
    getColumnProperties: function(colid, col, props) {},
	cycleHeader: function(colID, elt) {}
};

TreeView.UpdateCommandAction = function(treeView, key, value) {
	this.treeView = treeView;
	this.command = treeView.currentCommand;
	this.key = key;
	this.value = value;
	this.index = this.treeView.tree.currentIndex;
	this.wasNewCommand = this.command == treeView.newCommand;
}

TreeView.UpdateCommandAction.prototype = {
	execute: function() {
		if (this.command.type == 'command') {
			this.oldValue = this.command[this.key];
			this.command[this.key] = this.value;
		} else if (this.command.type == 'comment' && this.key == 'command') {
			this.oldValue = this.command['comment'];
			this.command['comment'] = this.value;
		}
		if (this.index >= 0) {
			this.treeView.treebox.invalidateRow(this.index);
		}
		if (this.wasNewCommand) {
			this.treeView.testCase.commands.push(this.command);
			this.treeView.newCommand = new Command();
			this.treeView.treebox.rowCountChanged(this.treeView.rowCount, 1);
			this.treeView.rowCount++;
			this.treeView.log.debug("added new command");
		}
		this.treeView.testCase.setModified();
	},
	
	undo: function() {
		if (this.command.type == 'command') {
			this.command[this.key] = this.oldValue;
		} else if (this.command.type == 'comment' && this.key == 'command') {
			this.command['comment'] = this.oldValue;
		}
		if (this.index >= 0) {
			this.treeView.treebox.invalidateRow(this.index);
		}
		if (this.wasNewCommand) {
			this.treeView.testCase.commands.pop();
			this.treeView.newCommand = new Command();
			this.treeView.treebox.rowCountChanged(this.treeView.rowCount - 1, -1);
			this.treeView.rowCount--;
			this.treeView.log.debug("removed new command");
		}
	}
}

TreeView.DeleteCommandAction = function(treeView, ranges) {
	this.treeView = treeView;
	this.ranges = ranges;
}

TreeView.DeleteCommandAction.prototype = {
	execute: function() {
		var currentIndex = this.treeView.tree.currentIndex;
		for (var i = this.ranges.length - 1; i >= 0; i--) {
			var range = this.ranges[i];
			this.treeView.testCase.commands.splice(range.start, range.commands.length);
			this.treeView.treebox.rowCountChanged(range.start, -range.commands.length);
			this.treeView.rowCount -= range.commands.length;
			if (range.start < currentIndex) {
				currentIndex -= range.commands.length;
				if (currentIndex < range.start) {
					currentIndex = range.start;
				}
			}
		}
		if (currentIndex >= this.treeView.rowCount) currentIndex = this.treeView.rowCount - 1;
		this.treeView.selection.select(currentIndex);
	},

	undo: function() {
		var currentIndex = this.treeView.tree.currentIndex;
		for (var i = 0; i < this.ranges.length; i++) {
			var range = this.ranges[i];
			for (var j = 0; j < range.commands.length; j++) {
				this.treeView.testCase.commands.splice(range.start + j, 0, range.commands[j].createCopy());
			}
			this.treeView.treebox.rowCountChanged(range.start, range.commands.length);
			this.treeView.rowCount += range.commands.length;
			if (currentIndex <= range.start) {
				currentIndex += range.commands.length;
			}
		}
		this.treeView.selection.select(currentIndex);
	}
}

TreeView.PasteCommandAction = function(treeView, index, commands) {
	this.treeView = treeView;
	this.index = index;
	this.commands = commands;
}

TreeView.PasteCommandAction.prototype = {
	execute: function() {
		var currentIndex = this.treeView.tree.currentIndex;
		for (var i = 0; i < this.commands.length; i++) {
			this.treeView.testCase.commands.splice(this.index + i, 0, this.commands[i].createCopy());
		}
		this.treeView.treebox.rowCountChanged(this.index, this.commands.length);
		this.treeView.rowCount += this.commands.length;
		if (currentIndex <= this.index) {
			currentIndex += this.commands.length;
		}
		this.treeView.selection.select(currentIndex);
		this.treeView.treebox.ensureRowIsVisible(currentIndex);
	},
	
	undo: function() {
		var currentIndex = this.treeView.tree.currentIndex;
		this.treeView.testCase.commands.splice(this.index, this.commands.length);
		this.treeView.treebox.rowCountChanged(this.index, -this.commands.length);
		this.treeView.rowCount -= this.commands.length;
		if (this.index < currentIndex) {
			currentIndex -= this.commands.length;
			if (currentIndex < this.index) {
				currentIndex = this.index;
			}
		}
		this.treeView.selection.select(currentIndex);
		this.treeView.treebox.ensureRowIsVisible(currentIndex);
	}
}
