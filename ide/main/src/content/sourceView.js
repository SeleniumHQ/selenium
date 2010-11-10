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

function SourceView(editor, textbox) {
	this.log = new Log("SourceView");
	this.textbox = textbox;
	this.editor = editor;
}

SourceView.prototype = {
	scrollToRow: function(index) {
		// TODO
	},
	rowInserted: function(rowIndex) {
		this.updateView();
		if (this.editor.app.getCurrentFormat().getFormatter().playable) {
			this.textbox.setSelectionRange(this.lastValue.length, this.lastValue.length);
			this.textbox.inputField.scrollTop = this.textbox.inputField.scrollHeight - this.textbox.inputField.clientHeight;
		} else {
			var insertedCommand = this.testCase.commands[rowIndex];
			var index = insertedCommand.charIndex + insertedCommand.line.length + 1;
			this.textbox.setSelectionRange(index, index);
			this.scrollToCursorPosition();
			/*
			var value = this.lastValue;
			var lineno = 0;
			var index = 0;
			while (true) {
				if (lineno == rowIndex + 1) {
					this.textbox.setSelectionRange(index, index);
					break;
				}
				index = value.indexOf("\n", index);
				if (index < 0) break;
				index++;
				lineno++;
				}*/
		}
	},
	scrollToCursorPosition: function() {
		var start = this.textbox.selectionStart;
		var lines = this.textbox.value.split(/\n/).length + 1;
		var offset = this.textbox.value.substring(0, start).split(/\n/).length;
		var yPos = this.textbox.inputField.scrollHeight * offset / lines;
		var lineHeight = this.textbox.inputField.scrollHeight / lines;
		var scrollTop = this.textbox.inputField.scrollTop;
		if (yPos < scrollTop) {
			this.textbox.inputField.scrollTop = yPos;
		} else if (scrollTop + this.textbox.inputField.clientHeight - lineHeight < yPos) {
			this.textbox.inputField.scrollTop = yPos + this.textbox.inputField.clientHeight - lineHeight;
		}
	},
	rowUpdated: function(index) {
		this.updateView();
	},
	refresh: function() {
		this.updateView();
	},
	// synchronize model from view
	syncModel: function(force) {
		if ((force || this.editor.view == this) && this.lastValue != this.textbox.value) {
			this.editor.app.getCurrentFormat().setSource(this.testCase, this.textbox.value);
		} else {
                        this.editor.app.getTestCase().edited = false;
		}
	},
	onHide: function() {
	},
	getRecordIndex: function() {
		if (this.editor.app.getCurrentFormat().getFormatter().playable) {
			return this.testCase.commands.length;
		} else {
			return this.testCase.getCommandIndexByTextIndex(this.lastValue, this.textbox.selectionStart, this.editor.app.getCurrentFormat().getFormatter());
		}
	}
};

SourceView.prototype.countNewLine = function(value, cursor) {
	if (cursor != null) {
		value = value.substring(0, cursor);
	}
	return value.split(/\n/).length;
}

SourceView.prototype.updateView = function() {
    this.log.debug("updateView: testCase=" + this.testCase);
	var scrollTop = this.textbox.inputField.scrollTop;
	//this.textbox.value = this.testCase.getSource(this.editor.options, "New Test");
	this.textbox.value = this.lastValue = this.editor.app.getCurrentFormat().getSourceForTestCase(this.testCase);
	this.textbox.inputField.scrollTop = scrollTop;
	
        //reinitialize the "edited" attribute of the testcase for
        //a good synchronization
        this.editor.app.getTestCase().edited = false;
}
