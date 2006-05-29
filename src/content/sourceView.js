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
		if (this.editor.currentFormat.getFormatter().playable) {
			this.textbox.setSelectionRange(this.lastValue.length, this.lastValue.length);
			this.textbox.inputField.scrollTop = this.textbox.inputField.scrollHeight - this.textbox.inputField.clientHeight;
		} else {
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
			}
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
			this.log.debug("syncModel");
			this.editor.currentFormat.setSource(this.testCase, this.textbox.value);
		} else {
			this.log.debug("skip syncModel");
		}
	},
	onHide: function() {
	},
	getRecordIndex: function() {
		if (this.editor.currentFormat.getFormatter().playable) {
			return this.testCase.commands.length;
		} else {
			var value = this.lastValue;
			var lineno = 0;
			this.log.debug("selectionStart=" + this.textbox.selectionStart);
			var cursor = this.textbox.selectionStart;
			var index = 0;
			while (true) {
				index = value.indexOf("\n", index);
				if (index < 0 || cursor <= index) break;
				lineno++;
				index++;
			}
			return lineno;
		}
	}
};

SourceView.prototype.updateView = function() {
	var scrollTop = this.textbox.inputField.scrollTop;
	//this.textbox.value = this.testCase.getSource(this.editor.options, "New Test");
	this.textbox.value = this.lastValue = this.editor.currentFormat.getSourceForTestCase(this.testCase);
	this.textbox.inputField.scrollTop = scrollTop;
	//log.debug("source=" + getSource());
}
