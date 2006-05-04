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

function Recorder(window) {
	this.log = Recorder.log;
	this.locatorFinder = new LocatorFinder(window);
	this.window = window;
	this.observers = [];
	this.attach();
}

Recorder.log = new Log("Recorder");

Recorder.prototype.attach = function() {
	this.log.debug("attaching");
	var self = this;
	this.forEachDocument(function(doc) {
			this.eventListeners = {};
			for (eventName in Recorder.eventHandlers) {
				// create new function so that the variables have new scope.
				function register() {
					var handlers = Recorder.eventHandlers[eventName];
					this.log.debug('eventName=' + eventName + ' / handlers.length=' + handlers.length);
					var listener = function(event) {
						self.log.debug('listener: event=' + event);
						var recording = false;
						for (var i = 0; i < self.observers.length; i++) {
							if (self.observers[i].recordingEnabled) recording = true;
						}
						if (recording) {
							for (var i = 0; i < handlers.length; i++) {
								handlers[i].call(self, event);
							}
						}
					}
					doc.addEventListener(eventName, listener, false);
					this.eventListeners[eventName] = listener;
				}
				register.call(this);
			}
		});
}

Recorder.prototype.detach = function() {
	this.log.debug("detaching");
	this.forEachDocument(function(doc) {
			for (eventName in this.eventListeners) {
				doc.removeEventListener(eventName, this.eventListeners[eventName], false);
			}
			delete this.eventListeners;
		});
}

Recorder.prototype.getDocuments = function(frame) {
	var documents = new Array();
	var frames = frame.frames;
	documents.push(frame.document);
	for (var i = 0; i < frames.length; i++) {
		documents = documents.concat(this.getDocuments(frames[i]));
	}
	return documents;
}

Recorder.prototype.forEachDocument = function(handler) {
	var documents = this.getDocuments(this.window);
	for (var i = 0; i < documents.length; i++) {
		handler.call(this, documents[i]);
	}
}

Recorder.prototype.record = function(command, target, value) {
	for (var i = 0; i < this.observers.length; i++) {
		this.observers[i].addCommand(command, target, value, this.window);
	}
}

Recorder.prototype.findLocator = function(element) {
	return this.locatorFinder.find(element);
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

Recorder.addHandler = function(name, eventName, handler) {
	if (!this.eventHandlers[eventName]) {
		this.eventHandlers[eventName] = [];
	}
	this.eventHandlers[eventName].push(handler);
}

Recorder.register = function(observer, window) {
	var recorder = window._Selenium_IDE_Recorder;
	if (!recorder) {
		recorder = new Recorder(window);
		window._Selenium_IDE_Recorder = recorder;
	}
	recorder.observers.push(observer);
	this.log.debug("observers.length=" + recorder.observers.length);
	return recorder;
}

Recorder.deregister = function(observer, window) {
	var recorder = window._Selenium_IDE_Recorder;
	if (recorder) {
		recorder.deregister(observer);
	}
}

Recorder.registerAll = function(observer) {
	this.forEachTabInAllWindows(function(window) { Recorder.register(observer, window) });
}

Recorder.deregisterAll = function(observer) {
	this.forEachTabInAllWindows(function(window) { Recorder.deregister(observer, window) });
}

Recorder.registerForWindow = function(w, observer) {
	this.forEachTab(w, function(window) { Recorder.register(observer, window) });
}

Recorder.deregisterForWindow = function(w, observer) {
	this.forEachTab(w, function(window) { Recorder.deregister(observer, window) });
}

Recorder.forEachTabInAllWindows = function(handler) {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var e = wm.getEnumerator("navigator:browser");
	var window;
	while (e.hasMoreElements()) {
		window = e.getNext();
		this.log.debug("window=" + window);
		this.forEachTab(window, handler);
	}
}

Recorder.forEachTab = function(window, handler) {
	var browsers = window.getBrowser().browsers;
	for (var i = 0; i < browsers.length; i++) {
		this.log.debug("browser=" + browsers[i]);
		handler(browsers[i].contentWindow);
	}
}

Recorder.eventHandlers = {};
