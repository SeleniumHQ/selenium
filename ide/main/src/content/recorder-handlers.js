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
			this.record("type", this.findLocators(event.target), event.target.value);
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
        return "label=regexp:" + label.replace(/[\(\)\[\]\\\^\$\*\+\?\.\|\{\}]/g, function(str) {return '\\' + str})
                                      .replace(/\s+/g, function(str) {
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
				this.record("select", this.findLocators(event.target), this.getOptionLocator(option));
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
							this.record("addSelection", this.findLocators(event.target), value);
						} else {
							this.record("removeSelection", this.findLocators(event.target), value);
						}
						options[i]._wasSelected = options[i].selected;
					}
				}
			}
		}
	});

Recorder.addEventHandler('clickLocator', 'click', function(event) {
		if (event.button == 0) {
			var clickable = this.findClickableElement(event.target);
			if (clickable) {
                // prepend any required mouseovers. These are defined as
                // handlers that set the "mouseoverLocator" attribute of the
                // interacted element to the locator that is to be used for the
                // mouseover command. For example:
                //
                // Recorder.addEventHandler('mouseoverLocator', 'mouseover', function(event) {
                //     var target = event.target;
                //     if (target.id == 'mmlink0') {
                //         this.mouseoverLocator = 'img' + target._itemRef;
                //     }
                //     else if (target.id.match(/^mmlink\d+$/)) {
                //         this.mouseoverLocator = 'lnk' + target._itemRef;
                //     }
                // }, { alwaysRecord: true, capture: true });
                //
                if (this.mouseoverLocator) {
                    this.record('mouseOver', this.mouseoverLocator, '');
                    delete this.mouseoverLocator;
                }
                this.record("click", this.findLocators(event.target), '');
            } else {
                var target = event.target;
                this.callIfMeaningfulEvent(function() {
                        this.record("click", this.findLocators(target), '');
                    });
            }
		}
	}, { capture: true });

Recorder.prototype.findClickableElement = function(e) {
	if (!e.tagName) return null;
	var tagName = e.tagName.toLowerCase();
	var type = e.type;
	if (e.hasAttribute("onclick") || e.hasAttribute("href") || tagName == "button" ||
		(tagName == "input" && 
		 (type == "submit" || type == "button" || type == "image" || type == "radio" || type == "checkbox" || type == "reset"))) {
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
		this.clickedElementLocators = this.findLocators(event.target);
	}, { alwaysRecord: true, capture: true });

Recorder.addEventHandler('attrModified', 'DOMAttrModified', function(event) {
        this.log.debug('attrModified');
        this.domModified();
    }, {capture: true});

Recorder.addEventHandler('nodeInserted', 'DOMNodeInserted', function(event) {
        this.log.debug('nodeInserted');
        this.domModified();
    }, {capture: true});

Recorder.addEventHandler('nodeRemoved', 'DOMNodeRemoved', function(event) {
        this.log.debug('nodeRemoved');
        this.domModified();
    }, {capture: true});

Recorder.prototype.domModified = function() {
    if (this.delayedRecorder) {
        this.delayedRecorder.apply(this);
        this.delayedRecorder = null;
        if (this.domModifiedTimeout) {
            clearTimeout(this.domModifiedTimeout);
        }
    }
}

Recorder.prototype.callIfMeaningfulEvent = function(handler) {
    this.log.debug("callIfMeaningfulEvent");
    this.delayedRecorder = handler;
    var self = this;
    this.domModifiedTimeout = setTimeout(function() {
            self.log.debug("clear event");
            self.delayedRecorder = null;
            self.domModifiedTimeout = null;
        }, 50);
}
