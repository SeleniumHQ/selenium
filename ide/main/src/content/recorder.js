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
	this.window = window;
	this.observers = [];
	this.attach();
    this.registerUnloadListener();
}

Recorder.WINDOW_RECORDER_PROPERTY = "_Selenium_IDE_Recorder";

Recorder.log = new Log("Recorder");

Recorder.prototype.getWrappedWindow = function() {
    if (this.window.wrappedJSObject) {
        return this.window.wrappedJSObject;
    } else {
        return this.window;
    }
}

Recorder.prototype.reattachWindowMethods = function() {
    var window = this.getWrappedWindow();
	//this.log.debug("reattach");
	if (!this.windowMethods) {
		this.originalOpen = window.open;
	}
	this.windowMethods = {};
	['alert', 'confirm', 'prompt', 'open'].forEach(function(method) {
			this.windowMethods[method] = window[method];
		}, this);
	var self = this;
	window.alert = function(alert) {
		self.windowMethods['alert'].call(self.window, alert);
        self.record('assertAlert', alert);
	}
	window.confirm = function(message) {
		var result = self.windowMethods['confirm'].call(self.window, message);
		if (!result) {
			self.record('chooseCancelOnNextConfirmation', null, null, true);
		}
        self.record('assertConfirmation', message);
		return result;
	}
	window.prompt = function(message) {
		var result = self.windowMethods['prompt'].call(self.window, message);
		self.record('answerOnNextPrompt', result, null, true);
        self.record('assertPrompt', message);
		return result;
	}
	window.open = function(url, windowName, windowFeatures, replaceFlag) {
		if (self.openCalled) {
			// stop the recursion called by modifyWindowToRecordPopUpDialogs
			return self.originalOpen.call(window, url, windowName, windowFeatures, replaceFlag);
		} else {
			self.openCalled = true;
			var result = self.windowMethods['open'].call(window, url, windowName, windowFeatures, replaceFlag);
			self.openCalled = false;
            if (result.wrappedJSObject) {
                result = result.wrappedJSObject;
            }
			setTimeout(Recorder.record, 0, self, 'waitForPopUp', windowName, "30000");
            for (var i = 0; i < self.observers.length; i++) {
                if (self.observers[i].isSidebar) {
                    self.observers[i].getUserLog().warn("Actions in popup window cannot be recorded with Selenium IDE in sidebar. Please open Selenium IDE as standalone window instead to record them.");
                }
            }
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

Recorder.prototype.registerUnloadListener = function() {
    var self = this;
    this.window.addEventListener("beforeunload", function() {
            for (var i = 0; i < self.observers.length; i++) {
                self.observers[i].onUnloadDocument(self.window.document);
            }
        }, false);
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
		this.getWrappedWindow()[method] = this.windowMethods[method];
	}
}

Recorder.record = function(recorder, command, target, value) {
	recorder.record(command, target, value);
}

Recorder.prototype.record = function(command, target, value, insertBeforeLastCommand) {
	for (var i = 0; i < this.observers.length; i++) {
		if (this.observers[i].recordingEnabled) {
			this.observers[i].addCommand(command, target, value, this.window, insertBeforeLastCommand);
		}
	}
}

Recorder.prototype.findLocator = function(element) {
	return this.locatorBuilders.build(element);
}

Recorder.prototype.findLocators = function(element) {
	return this.locatorBuilders.buildAll(element);
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
        this.window[Recorder.WINDOW_RECORDER_PROPERTY] = undefined;
        if (this.window.wrappedJSObject) {
            this.window.wrappedJSObject[Recorder.WINDOW_RECORDER_PROPERTY] = undefined;
        }
        // Firefox 3 (beta 5) throws "Security Manager vetoed action" when we use delete operator like this:
		//delete this.window[Recorder.WINDOW_RECORDER_PROPERTY];
	}
}

/*
 * Class methods
 */

Recorder.addEventHandler = function(handlerName, eventName, handler, options) {
	handler.handlerName = handlerName;
	if (!options) options = {};
	var key = options['capture'] ? ('C_' + eventName) : eventName;
	if (!this.eventHandlers[key]) {
		this.eventHandlers[key] = [];
	}
	if (options['alwaysRecord']) handler.alwaysRecord = true;
	this.eventHandlers[key].push(handler);
}

Recorder.removeEventHandler = function(handlerName) {
	for (eventKey in this.eventHandlers) {
		var handlers = this.eventHandlers[eventKey];
		for (var i = 0; i < handlers.length; i++) {
			if (handlers[i].handlerName == handlerName) {
				handlers.splice(i, 1);
				break;
			}
		}
	}
}

/**
 * Wraps an existing event handler with a decorator. The decorator is a
 * function that, given a handler, returns a function that wraps the
 * handler. You may find this useful in cases where the IDE would normally
 * record events dispatched by the page itself, i.e. not through user
 * interaction; you can skip recording under specific conditions. Here's an
 * example usage:
 *
 *  Recorder.decorateEventHandler('type', 'change', function(handler) {
 *      // the decorator has the same method signature as a handler, and invokes
 *      // the handler using call(). The event target, as well as its document
 *      // and window context, should all be available through the event
 *      // object.
 *      return function(event) {
 *          var doc = event.target.ownerDocument;
 *          if (doc.defaultView && doc.defaultView.isFireEventsComplete()) {
 *              handler.call(this, event);
 *          }
 *      };
 *  });
 *
 */
Recorder.decorateEventHandler = function(handlerName, eventName, decorator, options) {
   var eventKey = (options && options.capture)
       ? ('C_' + eventName) : eventName;
   var handlers = this.eventHandlers[eventKey];
   for (var i = 0; i < handlers.length; ++i) {
       if (handlers[i].handlerName == handlerName) {
           handlers[i] = decorator(handlers[i]);
           handlers[i].handlerName = handlerName;
       }
   }
};

Recorder.register = function(observer, window) {
    this.log.debug("register: window=" + window);
    var pushObserver = true;
	var recorder = Recorder.get(window);
	if (!recorder) {
		recorder = new Recorder(window);
		window[Recorder.WINDOW_RECORDER_PROPERTY] = recorder;
        if (window.wrappedJSObject) {
            // adding recorder to wrappedJSObject to make it visible from functional test of Selenium IDE itself
            window.wrappedJSObject[Recorder.WINDOW_RECORDER_PROPERTY] = recorder;
        }
	}else {
        //Samit: Fix: Fix Firefox 4 beta 7 recording issues
        for (var i = 0; i < recorder.observers.length; i++) {
            if (recorder.observers[i] == observer) {
                pushObserver = false;
                recorder.attach();
                recorder.registerUnloadListener();
            }
        }
    }
    if (pushObserver) {
        recorder.observers.push(observer);
    }
	this.log.debug("register: observers.length=" + recorder.observers.length);
	return recorder;
}

Recorder.deregister = function(observer, window) {
    this.log.debug("deregister: window=" + window);
	var recorder = Recorder.get(window);
	if (recorder) {
		recorder.deregister(observer);
		this.log.debug("deregister: observers.length=" + recorder.observers.length);
	} else {
		this.log.warn("deregister: recorder not found");
	}
}

Recorder.get = function(window) {
	return window[Recorder.WINDOW_RECORDER_PROPERTY] || null;
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
