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

function loadDialog() {
	this.formatInfo = window.arguments[0];
	document.getElementById('format-name').value = this.formatInfo.name;
	var sourceTextbox = document.getElementById('format-source');
	sourceTextbox.value = this.formatInfo.getSource();
	if (!this.formatInfo.saveFormat) {
		// preset format
		sourceTextbox.setAttribute("readonly","true");
		document.getElementById("note").hidden = false;
	}else{
		sourceTextbox.removeAttribute("readonly");
		var saveLabel = document.getElementById("strings").getString('format.save.label');
		document.documentElement.getButton("accept").setAttribute("label",saveLabel);
	}
	if (!this.formatInfo.id) {
		// new format
		document.getElementById("name-box").hidden = false;
	}
}

function saveDialog() {
	if (!this.formatInfo.id) {
		var name = document.getElementById('format-name').value;
		if (name.length > 0) {
			this.formatInfo.name = name;
		} else {
			window.alert("Please specify a name");
			return false;
		}
	}
	//only save an editable formatx
	if (this.formatInfo.saveFormat){
		this.formatInfo.saveFormat(document.getElementById('format-source').value);
		this.formatInfo.saved = true;
		return true;
	}
	return false;
	
}
