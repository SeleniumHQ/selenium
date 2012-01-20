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

var TreeView = classCreate();
objectExtend(TreeView.prototype, XulUtils.TreeViewHelper.prototype);
objectExtend(TreeView.prototype, {
        initialize: function(editor, document, tree) {
            this.log = new Log("TreeView");
            XulUtils.TreeViewHelper.prototype.initialize.call(this, tree);
            this.editor = editor;
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
                    case "cmd_selectAll":
                        return true;
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
                    case "cmd_selectAll": self.selectAll(); break;
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
            
            this._loadSeleniumCommands();
        },

        _createTransferable: function() {
            return Components.classes["@mozilla.org/widget/transferable;1"].
                createInstance(Components.interfaces.nsITransferable);
        },

        _createClipboardString: function() {
            return Components.classes["@mozilla.org/supports-string;1"].
                createInstance(Components.interfaces.nsISupportsString);
        },

        putCommandsToClipboard: function(commands) {
            var trans = this._createTransferable();
            var str = this._createClipboardString();
            trans.addDataFlavor("text/unicode");
            var text = this.editor.app.getClipboardFormat().getSourceForCommands(commands);
            str.data = text;
            trans.setTransferData("text/unicode", str, text.length * 2);
            var clipboard = Components.classes["@mozilla.org/widget/clipboard;1"].
                getService(Components.interfaces.nsIClipboard);
            clipboard.setData(trans, null, Components.interfaces.nsIClipboard.kGlobalClipboard);
            this.clipboard = commands;
            window.updateCommands('clipboard');
        },

        getCommandsFromClipboard: function() {
            // not reading from a real clipboard...
            return this.clipboard;
        },

        setTextBox: function(id,value,disabled) {
            this.document.getElementById(id).value = value;
            this.document.getElementById(id).disabled = disabled;
        },

        getCommand: function(row) {
            if (row < this.testCase.commands.length) {
                return this.testCase.commands[row];
            } else {
                return this.newCommand;
            }
        },
        
        /*Use to reload the command list*/
        reloadSeleniumCommands: function(){
        	
        	this._loadSeleniumCommands();
        },

        _loadSeleniumCommands: function() {
            var commands = [];
            
            var nonWaitActions = ['open', 'selectWindow', 'chooseCancelOnNextConfirmation', 'answerOnNextPrompt', 'close', 'setContext', 'setTimeout', 'selectFrame'];
            
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
                        commands.push("waitFor" + base + "NotPresent");
                    } else {
                        commands.push("assertNot" + base);
                        commands.push("verifyNot" + base);
                        commands.push("waitForNot" + base);
                    }
                }
            }
            
            commands.push("pause");
            commands.push("store");
            commands.push("echo");
            commands.push("break");
            
            commands.sort();
            Editor.GENERIC_AUTOCOMPLETE.setCandidates(XulUtils.toXPCOMString(this.editor.getAutoCompleteSearchParam("commandAction")),
                                                      XulUtils.toXPCOMArray(commands));
        },
        
        /**
         * Updates the target field auto-population dropdown
         */
        updateSeleniumTargets: function() {
            var command = this.currentCommand;
            var candidates = [];
            var targetBox = this.document.getElementById("commandTarget");
            
            // various strategies for auto-populating the target field
            if (command.isRollup() && Editor.rollupManager) {
                candidates = Editor.rollupManager.getRollupRulesForDropdown();
            }
            else {
                if (command.targetCandidates) {
                    candidates = candidates.concat(command.targetCandidates);
                }
                // if lastURL exists, load only those targets associated with it.
                // Otherwise, show all possible targets.
                if (Editor.uiMap) {
                    candidates = candidates
                        .concat(Editor.uiMap.getUISpecifierStringStubs());
                }
            }
            
            if (candidates.length > 0) {
                targetBox.setAttribute("enablehistory", "true");
                targetBox.disableAutoComplete = false;
                var locators = [candidates.length];
                var types = [candidates.length];
                for (var i = 0; i < candidates.length; i++) {
                    locators[i] = candidates[i][0];
                    types[i] = candidates[i][1];
                }
                Editor.GENERIC_AUTOCOMPLETE.setCandidatesWithComments(XulUtils.toXPCOMString(this.editor.getAutoCompleteSearchParam("commandTarget")),
                                                                      XulUtils.toXPCOMArray(locators),
                                                                      XulUtils.toXPCOMArray(types));
                this.setTextBox("commandTarget", this.encodeText(command.target), false);
            } else {
                targetBox.setAttribute("enablehistory", "false");
                targetBox.disableAutoComplete = true;
                this.setTextBox("commandTarget", this.encodeText(command.target), false);
            }
        },
        
        /**
         * Updates the value field, depending on the values of the other fields
         */
        updateSeleniumValues: function() {
            var command = this.currentCommand;
            
            // populate the arguments for rollups, but don't clobber an
            // existing value
            if (command.isRollup() && ! command.value && Editor.rollupManager) {
                var rule = Editor.rollupManager.getRollupRule(command.target);
                if (rule != null) {
                    var args = {};
                    var keys = [];
                    for (var i = 0; i < rule.args.length; ++i) {
                        var name = rule.args[i].name;
                        args[name] = "";
                        keys.push(name);
                    }
                    this.setTextBox('commandValue',
                        this.encodeText(to_kwargs(args, keys)), false);
                }
            }
        },
        
        /**
         * execute undoable action
         */
        executeAction: function(action) {
            this.undoStack.push(action);
            this.redoStack.splice(0);
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
        rowInserted: function(index) {
            this.log.debug("rowInserted: index=" + index);
            this.recordIndex++;   //Samit: Fix: Fix the annoying skip over one command when recording in the middle of a script
            this.treebox.rowCountChanged(index, 1);
            this.rowCount++;
            //this.treebox.scrollToRow(this.testCase.commands.length - 1);
            //if (index >= this.recordIndex) {
            //this.recordIndex++;   //Samit: Fix: Fix the annoying skip over one command when recording in the middle of a script
            //}
            this.treebox.ensureRowIsVisible(index);
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
                    this.updateSeleniumTargets();
                    this.setTextBox("commandValue", this.encodeText(command.value), false);
                } else if (command.type == 'comment') {
                    this.setTextBox("commandAction", command.comment, false);
                    this.setTextBox("commandTarget", '', true);
                    this.setTextBox("commandValue", '', true);
                }
                
                this.selectRecordIndex(this.tree.currentIndex);
                this.editor.showReference(command);
                this.editor.showUIReference(command.target);
                this.editor.showRollupReference(command);
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
                if (key == 'command') {
                    this.updateSeleniumTargets();
                    this.editor.showReference(this.currentCommand);
                }
                else if (key == 'target') {
                    this.updateSeleniumValues();
                    this.editor.showUIReference(value);
                    this.editor.showRollupReference(this.currentCommand);
                }
                else if (key == 'value') {
                    this.editor.showRollupReference(this.currentCommand);
                }
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
        selectAll: function() {
            if (this.testCase.commands.length > 1) {
                this.selection.rangedSelect(0, this.testCase.commands.length - 1, false);
            }
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
            } else if (command.selectedForReplacement) {
                props.AppendElement(this.atomService.getAtom(
                    'commandSelectedForReplacement'));
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
            if ((this.testCase.startPoint) && 0 == col.index && this.testCase.startPoint == command) {
                props.AppendElement(this.atomService.getAtom("startpoint"));
            }
        },

        getParentIndex: function(index){return -1;},

        getSourceIndexFromDrag: function () {
            try{
                var dragService = Cc["@mozilla.org/widget/dragservice;1"].
                               getService().QueryInterface(Ci.nsIDragService);
                var dragSession = dragService.getCurrentSession();
                var transfer = Cc["@mozilla.org/widget/transferable;1"].
                               createInstance(Ci.nsITransferable);

                transfer.addDataFlavor("text/unicode");
                dragSession.getData(transfer, 0);

                var dataObj = {};
                var len = {};
                var sourceIndex = -1;
                var out = {};

                transfer.getAnyTransferData(out, dataObj, len);

                if (dataObj.value) {
                    sourceIndex = dataObj.value.QueryInterface(Ci.nsISupportsString).data;
                    sourceIndex = parseInt(sourceIndex.substring(0, len.value));
                }

                var start = new Object();
                var end = new Object();
                var numRanges = this.selection.getRangeCount();
                var n = 0;
                for (var t = 0; t < numRanges; t++){
                    this.selection.getRangeAt(t,start,end);
                    for (var v = start.value; v <= end.value; v++){
                       n++;
                    }
                }
                sourceIndex = n > 1 ? -1 : sourceIndex;

                return sourceIndex;

            }catch(e){
                new Log("DND").error("getSourceIndexFromDrag error: "+e);
            }
        },

        canDrop: function(targetIndex, orientation) {
                var sourceIndex = this.getSourceIndexFromDrag();

                return (sourceIndex != -1 &&
                        sourceIndex != targetIndex &&
                        sourceIndex != (targetIndex + orientation));
        },

        drop: function(dropIndex, orientation) {

            var sourceIndex = this.getSourceIndexFromDrag();
            if (sourceIndex != -1)
                this.executeAction(new TreeView.dndCommandAction(this, sourceIndex, dropIndex, orientation));
        }
    });

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

//D'n'D action for the undo/redo process
TreeView.dndCommandAction = function(treeView, sourceIndex, dropIndex, orientation){

    this.treeView = treeView;
    this.sourceIndex = sourceIndex;
    this.dropIndex = dropIndex;
    this.orientation = orientation;
    this.sourceIndexU = dropIndex;
    this.dropIndexU = sourceIndex;
	if (this.dropIndex > this.sourceIndex) {
               if (this.orientation == Ci.nsITreeView.DROP_BEFORE)
                   this.sourceIndexU--;
    }else{
        if (this.orientation == Ci.nsITreeView.DROP_AFTER)
                   this.sourceIndexU++;
    }
    this.orientationU = this.orientation == Ci.nsITreeView.DROP_BEFORE ? Ci.nsITreeView.DROP_AFTER : Ci.nsITreeView.DROP_BEFORE;
}

TreeView.dndCommandAction.prototype = {

    execute: function(){

     try{
           if (this.dropIndex > this.sourceIndex) {
               if (this.orientation == Ci.nsITreeView.DROP_BEFORE)
                   this.dropIndex--;
           }else{
               if (this.orientation == Ci.nsITreeView.DROP_AFTER)
                   this.dropIndex++;
           }

           var removedRow = this.treeView.testCase.commands.splice(this.sourceIndex, 1)[0];
           this.treeView.testCase.commands.splice(this.dropIndex, 0, removedRow);

           this.treeView.treebox.invalidate();
           this.treeView.selection.clearSelection();
           this.treeView.selection.select(this.dropIndex);
       }catch(e){
           new Log("DND").error("dndCommandAction.execute error : "+e);
       }
    },

    undo: function(){

        try{
           if (this.dropIndexU > this.sourceIndexU) {
               if (this.orientationU == Ci.nsITreeView.DROP_BEFORE)
                   this.dropIndexU--;
           }else{
               if (this.orientationU == Ci.nsITreeView.DROP_AFTER)
                   this.dropIndexU++;
           }

           var removedRow = this.treeView.testCase.commands.splice(this.sourceIndexU, 1)[0];
           this.treeView.testCase.commands.splice(this.dropIndexU, 0, removedRow);

           this.treeView.treebox.invalidate();
           this.treeView.selection.clearSelection();
           this.treeView.selection.select(this.dropIndexU);
        }catch(e){
           new Log("DND").error("dndCommandAction.undo error : "+e);
        }

    }
}