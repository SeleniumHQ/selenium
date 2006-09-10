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
Recorder.addEventHandler('type', 'change', function(event) {
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
Recorder.addEventHandler('selectFocus', 'focus', function(event) {
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

Recorder.addEventHandler('selectMousedown', 'mousedown', function(event) {
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

Recorder.prototype.getOptionLocator = function(option) {
    var label = option.text.replace(/^ *(.*?) *$/, "$1");
    if (label.match(/\xA0/)) { // if the text contains &nbsp;
        return "label=regexp:" + label.replace(/\s+/g, function(str) {
                if (str.match(/\xA0/)) {
                    if (str.length > 1) {
                        return "\\s+";
                    } else {
                        return "\\s";
                    }
                } else {
                    return str;
                }
            });
    } else {
        return "label=" + label;
    }
}

Recorder.addEventHandler('select', 'change', function(event) {
		var tagName = event.target.tagName.toLowerCase();
		if ('select' == tagName) {
			if (!event.target.multiple) {
                var option = event.target.options[event.target.selectedIndex];
				this.log.debug('selectedIndex=' + event.target.selectedIndex);
				this.record("select", this.findLocator(event.target), this.getOptionLocator(option));
			} else {
				this.log.debug('change selection on select-multiple');
				var options = event.target.options;
				for (var i = 0; i < options.length; i++) {
					this.log.debug('option=' + i + ', ' + options[i].selected);
					if (options[i]._wasSelected == null) {
						this.log.warn('_wasSelected was not recorded');
					}
					if (options[i]._wasSelected != options[i].selected) {
                        var value = this.getOptionLocator(options[i]);
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
 * Save element locator for clicked element.
 * This sets capture to true because some click handlers can remove DOM element,
 * so we will record element locator earlier.
 */
Recorder.addEventHandler('clickLocator', 'click', function(event) {
		if (event.button == 0) {
			var clickable = this.findClickableElement(event.target);
			if (clickable) {
				this.clickLocator = this.findLocator(clickable);
			}
		}
	}, { capture: true });

/*
 * Record click event.
 * This is done without setting capture to true, because confirmations
 * (such as chooseCancelOnNextConfirmation) must be inserted before the click command.
 */
Recorder.addEventHandler('click', 'click', function(event) {
		if (event.button == 0) {
			if (this.clickLocator) {
				this.record("click", this.clickLocator, '');
				delete this.clickLocator;
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

// remember clicked element to be used in CommandBuilders
Recorder.addEventHandler('rememberClickedElement', 'mousedown', function(event) {
		this.clickedElement = event.target;
		this.clickedElementLocator = this.findLocator(event.target);
	}, { alwaysRecord: true, capture: true });


