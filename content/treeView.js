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

function TreeView(recorder, document, tree) {
	this.log = new Log("TreeView");
	this.recorder = recorder;
	tree.view = this;
	this.tree = tree;
	this.document = document;
	this.rowCount = 0;
	var self = this;
	
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
		var text = this.testCase.getSourceForCommands(commands, recorder.options);
		str.data = text;
		trans.setTransferData("text/unicode", str, text.length * 2);
		clipboard.setData(trans, null, Components.interfaces.nsIClipboard.kGlobalClipboard);
		this.clipboard = commands;
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

	/*
	this.onKeydown = function(event) {
		self.log.debug("onKeydown");
	};

	tree.addEventListener("keydown", this.onKeydown, true);
	*/
}

TreeView.prototype = {
	rowInserted: function(index) {
		this.log.debug("rowInserted: " + index);
		this.treebox.rowCountChanged(index, 1);
		//this.treebox.scrollToRow(this.testCase.commands.length - 1);
		this.rowCount++;
		this.treebox.ensureRowIsVisible(index);
	},
	rowUpdated: function(index) {
		this.treebox.invalidateRow(index);
	},
	refresh: function() {
		log.debug("refresh: old rowCount=" + this.rowCount);
		this.treebox.rowCountChanged(0, -this.rowCount);
		var length = 0;
		if (this.testCase != null) {
			length = this.testCase.commands.length;
		}
		this.treebox.rowCountChanged(0, length + 1);
		this.rowCount = length + 1;
		this.newCommand = new Command();
		log.debug("refresh: new rowCount=" + this.rowCount);
	},
	// called when the command is selected in the tree view
	selectCommand: function() {
		if (this.tree.currentIndex >= 0) {
			var command = this.getCommand(this.tree.currentIndex);
			this.currentCommand = command;
			if (command.type == 'command') {
				this.setTextBox("commandAction", command.command, false);
				this.setTextBox("commandTarget", command.target, false);
				this.setTextBox("commandValue", command.value, false);
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
	},
	selectRecordIndex: function(index) {
		var oldRecordIndex = this.testCase.recordIndex;
		this.testCase.recordIndex = index;
		this.rowUpdated(oldRecordIndex);
		this.rowUpdated(this.testCase.recordIndex);
	},
	// called when the user enters any text into the textbox
	updateCurrentCommand: function(key, value) {
		if (this.currentCommand != null) {
			if (this.currentCommand.type == 'command') {
				this.currentCommand[key] = value;
			} else if (this.currentCommand.type == 'comment' && key == 'command') {
				this.currentCommand['comment'] = value;
			}
			if (this.tree.currentIndex >= 0) {
				this.treebox.invalidateRow(this.tree.currentIndex);
			}
			if (this.currentCommand == this.newCommand) {
				this.testCase.commands.push(this.currentCommand);
				this.newCommand = new Command();
				this.treebox.rowCountChanged(this.rowCount, 1);
				this.rowCount++;
				this.log.debug("added new command");
			}
		}
	},
	onHide: function() {
		this.setTextBox("commandAction", '', true);
		this.setTextBox("commandTarget", '', true);
		this.setTextBox("commandValue", '', true);
		this.currentCommand = null;
	},
	
	//
	// editing functions
	//
	copyOrDelete: function(copy, doDelete) {
		if (!this.treebox.focused) return;
		var count = this.selection.getRangeCount();
		if (count > 0) {
			var copyCommands = new Array();
			var currentIndex = this.tree.currentIndex;
			for (var i = count - 1; i >= 0; i--) {
				var start = new Object();
				var end = new Object();
				this.selection.getRangeAt(i, start, end);
				for (var v = end.value; v >= start.value; v--) {
					var command = this.getCommand(v);
					copyCommands.unshift(command.createCopy());
					if (doDelete && command != this.newCommand) {
						this.testCase.commands.splice(v, 1);
						this.treebox.rowCountChanged(v, -1);
						this.rowCount--;
						if (v < currentIndex) currentIndex--;
					}
				}
			}
			if (copy) {
				this.putCommandsToClipboard(copyCommands);
			}
			if (doDelete) {
				if (currentIndex >= this.rowCount) currentIndex = this.rowCount - 1;
				this.selection.select(currentIndex);
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
			for (var i = 0; i < commands.length; i++) {
				var command = commands[i];
				this.insertAt(currentIndex + i, command.createCopy());
			}
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
		log.debug("setTree: treebox=" + treebox);
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
	},
    getCellProperties: function(row, col, props) {
		var command = this.getCommand(row);
		if (command.type == 'comment') {
			props.AppendElement(this.atomService.getAtom("comment"));
		}
		if (command == this.currentCommand) {
			props.AppendElement(this.atomService.getAtom("currentCommand"));
		}
		if (row == this.testCase.recordIndex) {
			props.AppendElement(this.atomService.getAtom("recordIndex"));
		}
	},
    getColumnProperties: function(colid, col, props) {},
	cycleHeader: function(colID, elt) {}
};

