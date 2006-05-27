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

// avoid "change" event recorded twice
PageBot.prototype.replaceText = function(element, stringValue) {
    triggerEvent(element, 'focus', false);
    triggerEvent(element, 'select', true);
    element.value=stringValue;
    //triggerEvent(element, 'change', true);
    triggerEvent(element, 'blur', false);
};

function Recorder(window) {
	this.log = Recorder.log;
	this.window = window;
	this.observers = [];
	this.attach();
}

Recorder.log = new Log("Recorder");

Recorder.prototype.reattachWindowMethods = function() {
	//this.log.debug("reattach");
	if (!this.windowMethods) {
		this.originalOpen = this.window.open;
	}
	this.windowMethods = {};
	['alert', 'confirm', 'prompt', 'open'].forEach(function(method) {
			this.windowMethods[method] = this.window[method];
		}, this);
	var self = this;
	this.window.alert = function(alert) {
		self.windowMethods['alert'].call(self.window, alert);
		setTimeout(Recorder.record, 100, self, 'assertAlert', alert, null);
	}
	this.window.confirm = function(message) {
		var result = self.windowMethods['confirm'].call(self.window, message);
		if (!result) {
			self.record('chooseCancelOnNextConfirmation');
		}
		setTimeout(Recorder.record, 100, self, 'assertConfirmation', message, null);
		return result;
	}
	this.window.prompt = function(message) {
		var result = self.windowMethods['prompt'].call(self.window, message);
		self.record('answerOnNextPrompt', result);
		setTimeout(Recorder.record, 100, self, 'assertPrompt', message, null);
		return result;
	}
	this.window.open = function(url, windowName, windowFeatures, replaceFlag) {
		if (self.openCalled) {
			// stop the recursion called by modifyWindowToRecordPopUpDialogs
			return self.originalOpen.call(self.window, url, windowName, windowFeatures, replaceFlag);
		} else {
			self.openCalled = true;
			var result = self.windowMethods['open'].call(self.window, url, windowName, windowFeatures, replaceFlag);
			self.openCalled = false;
			setTimeout(Recorder.record, 100, self, 'waitForPopUp', windowName, null);
			return result;
		}
	}
}

Recorder.prototype.parseEventKey = function(eventKey) {
	if (eventKey.match(/^C_/)) {
		return { eventName: eventKey.substring(2), capture: true };
	} else {
		return { eventName: eventKey, capture: false };
	}
}

Recorder.prototype.attach = function() {
	this.log.debug("attaching");
	this.locatorBuilders = new LocatorBuilders(this.window);
	this.eventListeners = {};
	this.reattachWindowMethods();
	var self = this;
	for (eventKey in Recorder.eventHandlers) {
		var eventInfo = this.parseEventKey(eventKey);
		var eventName = eventInfo.eventName;
		var capture = eventInfo.capture;
		// create new function so that the variables have new scope.
		function register() {
			var handlers = Recorder.eventHandlers[eventKey];
			//this.log.debug('eventName=' + eventName + ' / handlers.length=' + handlers.length);
			var listener = function(event) {
				self.log.debug('listener: event.type=' + event.type + ', target=' + event.target);
				//self.log.debug('title=' + self.window.document.title);
				var recording = false;
				for (var i = 0; i < self.observers.length; i++) {
					if (self.observers[i].recordingEnabled) recording = true;
				}
				for (var i = 0; i < handlers.length; i++) {
					if (recording || handlers[i].alwaysRecord) {
						handlers[i].call(self, event);
					}
				}
			}
			this.window.document.addEventListener(eventName, listener, capture);
			this.eventListeners[eventKey] = listener;
		}
		register.call(this);
	}
}

Recorder.prototype.detach = function() {
	this.log.debug("detaching");
	this.locatorBuilders.detach();
	for (eventKey in this.eventListeners) {
		var eventInfo = this.parseEventKey(eventKey);
		this.log.debug("removeEventListener: " + eventInfo.eventName + ", " + eventKey + ", " + eventInfo.capture);
		this.window.document.removeEventListener(eventInfo.eventName, this.eventListeners[eventKey], eventInfo.capture);
	}
	delete this.eventListeners;
	for (method in this.windowMethods) {
		this.window[method] = this.windowMethods[method];
	}
}

Recorder.record = function(recorder, command, target, value) {
	recorder.record(command, target, value);
}

Recorder.prototype.record = function(command, target, value) {
	for (var i = 0; i < this.observers.length; i++) {
		if (this.observers[i].recordingEnabled) {
			this.observers[i].addCommand(command, target, value, this.window);
		}
	}
}

Recorder.prototype.findLocator = function(element) {
	return this.locatorBuilders.build(element);
}

Recorder.prototype.deregister = function(observer) {
	this.log.debug("deregister: observer=" + observer);
	var i;
	var len = this.observers.length;
	for (i = 0; i < len; i++) {
		if (this.observers[i] == observer) {
			this.observers.splice(i, 1);
			break;
		}
	}
	if (i == len) {
		this.log.error("observer not found");
	}
	if (this.observers.length == 0) {
		this.detach();
		delete this.window._Selenium_IDE_Recorder;
	}
}

/*
 * Class methods
 */

Recorder.addEventHandler = function(eventName, handler, options) {
	if (!options) options = {};
	var key = options['capture'] ? ('C_' + eventName) : eventName;
	if (!this.eventHandlers[key]) {
		this.eventHandlers[key] = [];
	}
	if (options['alwaysRecord']) handler.alwaysRecord = true;
	this.eventHandlers[key].push(handler);
}

Recorder.register = function(observer, window) {
	var recorder = window._Selenium_IDE_Recorder;
	if (!recorder) {
		recorder = new Recorder(window);
		window._Selenium_IDE_Recorder = recorder;
	}
	recorder.observers.push(observer);
	this.log.debug("register: observers.length=" + recorder.observers.length);
	return recorder;
}

Recorder.deregister = function(observer, window) {
	var recorder = window._Selenium_IDE_Recorder;
	if (recorder) {
		recorder.deregister(observer);
		this.log.debug("deregister: observers.length=" + recorder.observers.length);
	} else {
		this.log.warn("deregister: recorder not found");
	}
}

Recorder.get = function(window) {
	return window._Selenium_IDE_Recorder;
}

Recorder.registerAll = function(observer) {
	Recorder.forEachWindow(function(window) {
			Recorder.registerForWindow(window, observer);
		});
}

Recorder.deregisterAll = function(observer) {
	Recorder.forEachWindow(function(window) {
			Recorder.deregisterForWindow(window, observer);
		});
}

Recorder.registerForWindow = function(window, observer) {
	Recorder.forEachTab(window, function(tab) {
			Recorder.forEachFrame(tab, function(frame) {
					Recorder.register(observer, frame);
				})});
}

Recorder.deregisterForWindow = function(window, observer) {
	Recorder.forEachTab(window, function(tab) {
			Recorder.forEachFrame(tab, function(frame) {
					Recorder.deregister(observer, frame);
				})});
}

Recorder.forEachWindow = function(handler) {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var e = wm.getEnumerator("navigator:browser");
	var window;
	while (e.hasMoreElements()) {
		window = e.getNext();
		this.log.debug("window=" + window);
		handler(window);
	}
}

Recorder.forEachTab = function(window, handler) {
	var browsers = window.getBrowser().browsers;
	for (var i = 0; i < browsers.length; i++) {
		this.log.debug("browser=" + browsers[i]);
		handler(browsers[i].contentWindow);
	}
}

Recorder.forEachFrame = function(window, handler) {
	handler(window);
	var frames = window.frames;
	for (var i = 0; i < frames.length; i++) {
		Recorder.forEachFrame(frames[i], handler);
	}
}

Recorder.eventHandlers = {};
