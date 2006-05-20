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

Recorder.addEventHandler('change', function(event) {
		var tagName = event.target.tagName.toLowerCase();
		var type = event.target.type;
		if (('input' == tagName && ('text' == type || 'password' == type || 'file' == type)) ||
			'textarea' == tagName) {
			this.record("type", this.findLocator(event.target), event.target.value);
		}
	});

Recorder.addEventHandler('change', function(event) {
		var tagName = event.target.tagName.toLowerCase();
		if ('select' == tagName) {
			var label = event.target.options[event.target.selectedIndex].innerHTML;
			var value = "label=" + label.replace(/^\s*(.*?)\s*$/, "$1");
			this.record("select", this.findLocator(event.target), value);
		}
	});

Recorder.addEventHandler('click', function(event) {
		if (event.button == 0) {
			var clickable = this.findClickableElement(event.target);
			if (clickable) {
				this.record("click", this.findLocator(clickable), '');
			}
		}
	});

Recorder.prototype.findClickableElement = function(e) {
	if (!e.tagName) return null;
	var tagName = e.tagName.toLowerCase();
	var type = e.type;
	if (e.hasAttribute("onclick") || e.hasAttribute("href") || tagName == "button" ||
		(tagName == "input" && 
		 (type == "submit" || type == "button" || type == "image" || type == "radio" || type == "checkbox"))) {
		return e;
	} else {
		if (e.parentNode != null) {
			return this.findClickableElement(e.parentNode);
		} else {
			return null;
		}
	}
}

// remember clicked element
Recorder.addEventHandler('mousedown', function(event) {
		this.clickedElement = event.target;
	}, true);
