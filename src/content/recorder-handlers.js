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

/*
 * type
 */
Recorder.addEventHandler('change', function(event) {
		var tagName = event.target.tagName.toLowerCase();
		var type = event.target.type;
		if (('input' == tagName && ('text' == type || 'password' == type || 'file' == type)) ||
			'textarea' == tagName) {
			this.record("type", this.findLocator(event.target), event.target.value);
		}
	});

/*
 * select / addSelection / removeSelection
 */
Recorder.addEventHandler('focus', function(event) {
		var tagName = event.target.nodeName.toLowerCase();
		if ('select' == tagName && event.target.multiple) {
			this.log.debug('remembering selections');
			var options = event.target.options;
			for (var i = 0; i < options.length; i++) {
				if (options[i]._wasSelected == null) {
					// is the focus was gained by mousedown event, _wasSelected would be already set
					options[i]._wasSelected = options[i].selected;
				}
			}
		}
	}, { capture: true });

Recorder.addEventHandler('mousedown', function(event) {
		var tagName = event.target.nodeName.toLowerCase();
		if ('option' == tagName) {
			var parent = event.target.parentNode;
			if (parent.multiple) {
				this.log.debug('remembering selections');
				var options = parent.options;
				for (var i = 0; i < options.length; i++) {
					options[i]._wasSelected = options[i].selected;
				}
			}
		}
	}, { capture: true });

Recorder.addEventHandler('change', function(event) {
		var tagName = event.target.tagName.toLowerCase();
		if ('select' == tagName) {
			if (!event.target.multiple) {
				var label = event.target.options[event.target.selectedIndex].innerHTML;
				var value = "label=" + label.replace(/^\s*(.*?)\s*$/, "$1");
				this.log.debug('selectedIndex=' + event.target.selectedIndex);
				this.record("select", this.findLocator(event.target), value);
			} else {
				this.log.debug('change selection on select-multiple');
				var options = event.target.options;
				for (var i = 0; i < options.length; i++) {
					this.log.debug('option=' + i + ', ' + options[i].selected);
					if (options[i]._wasSelected == null) {
						this.log.warn('_wasSelected was not recorded');
					}
					if (options[i]._wasSelected != options[i].selected) {
						var label = options[i].innerHTML;
						var value = "label=" + label.replace(/^\s*(.*?)\s*$/, "$1");
						if (options[i].selected) {
							this.record("addSelection", this.findLocator(event.target), value);
						} else {
							this.record("removeSelection", this.findLocator(event.target), value);
						}
						options[i]._wasSelected = options[i].selected;
					}
				}
			}
		}
	});

/*
 * click
 */
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
	}, { alwaysRecord: true });

