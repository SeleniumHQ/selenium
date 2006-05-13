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

function SourceView(recorder, textbox) {
	this.log = new Log("SourceView");
	this.textbox = textbox;
	this.recorder = recorder;
}

SourceView.prototype = {
	scrollToRow: function(index) {
		// TODO
	},
	rowInserted: function(index) {
		this.updateView();
		this.textbox.inputField.scrollTop = this.textbox.inputField.scrollHeight - this.textbox.inputField.clientHeight;
	},
	rowUpdated: function(index) {
		this.updateView();
	},
	refresh: function() {
		this.updateView();
	},
	// synchronize model from view
	syncModel: function(force) {
		if ((force || this.recorder.view == this) && this.lastValue != this.textbox.value) {
			this.log.debug("syncModel");
			this.recorder.testManager.setSource(this.testCase, this.textbox.value);
		} else {
			this.log.debug("skip syncModel");
		}
	},
	onHide: function() {
	}
};

SourceView.prototype.updateView = function() {
	var scrollTop = this.textbox.inputField.scrollTop;
	//this.textbox.value = this.testCase.getSource(this.recorder.options, "New Test");
	this.textbox.value = this.lastValue = this.recorder.testManager.getSourceForTestCase(this.testCase);
	this.textbox.inputField.scrollTop = scrollTop;
	//log.debug("source=" + getSource());
}
