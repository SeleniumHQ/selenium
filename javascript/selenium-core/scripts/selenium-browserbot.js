// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/*
* This script provides the Javascript API to drive the test application contained within
* a Browser Window.
* TODO:
*    Add support for more events (keyboard and mouse)
*    Allow to switch "user-entry" mode from mouse-based to keyboard-based, firing different
*          events in different modes.
*/

// The window to which the commands will be sent.  For example, to click on a
// popup window, first select that window, and then do a normal click command.
var BrowserBot = function(topLevelApplicationWindow) {
    this.topWindow = topLevelApplicationWindow;
    this.topFrame = this.topWindow;
    this.baseUrl=window.location.href;

    // the buttonWindow is the Selenium window
    // it contains the Run/Pause buttons... this should *not* be the AUT window
    this.buttonWindow = window;
    this.currentWindow = this.topWindow;
    this.currentWindowName = null;
    this.allowNativeXpath = true;
    this.xpathEvaluator = new XPathEvaluator('ajaxslt');  // change to "javascript-xpath" for the newer, faster engine

    // We need to know this in advance, in case the frame closes unexpectedly
    this.isSubFrameSelected = false;

    this.altKeyDown = false;
    this.controlKeyDown = false;
    this.shiftKeyDown = false;
    this.metaKeyDown = false;

    this.modalDialogTest = null;
    this.recordedAlerts = new Array();
    this.recordedConfirmations = new Array();
    this.recordedPrompts = new Array();
    this.openedWindows = {};
    this.nextConfirmResult = true;
    this.nextPromptResult = '';
    this.newPageLoaded = false;
    this.pageLoadError = null;

    this.ignoreResponseCode = false;
    this.xhr = null;
    this.abortXhr = false;
    this.isXhrSent = false;
    this.isXhrDone = false;
    this.xhrOpenLocation = null;
    this.xhrResponseCode = null;
    this.xhrStatusText = null;

    this.shouldHighlightLocatedElement = false;

    this.uniqueId = "seleniumMarker" + new Date().getTime();
    this.pollingForLoad = new Object();
    this.permDeniedCount = new Object();
    this.windowPollers = new Array();
    // DGF for backwards compatibility
    this.browserbot = this;

    var self = this;

    objectExtend(this, PageBot.prototype);
    this._registerAllLocatorFunctions();

    this.recordPageLoad = function(elementOrWindow) {
        LOG.debug("Page load detected");
        try {
            if (elementOrWindow.location && elementOrWindow.location.href) {
                LOG.debug("Page load location=" + elementOrWindow.location.href);
            } else if (elementOrWindow.contentWindow && elementOrWindow.contentWindow.location && elementOrWindow.contentWindow.location.href) {
                LOG.debug("Page load location=" + elementOrWindow.contentWindow.location.href);
            } else {
                LOG.debug("Page load location unknown, current window location=" + self.getCurrentWindow(true).location);
            }
        } catch (e) {
            LOG.error("Caught an exception attempting to log location; this should get noticed soon!");
            LOG.exception(e);
            self.pageLoadError = e;
            return;
        }
        self.newPageLoaded = true;
    };

    this.isNewPageLoaded = function() {
        var e;

        if (this.pageLoadError) {
            LOG.error("isNewPageLoaded found an old pageLoadError: " + this.pageLoadError);
            if (this.pageLoadError.stack) {
              LOG.warn("Stack is: " + this.pageLoadError.stack);
            }
            e = this.pageLoadError;
            this.pageLoadError = null;
            throw e;
        }

        if (self.ignoreResponseCode) {
            return self.newPageLoaded;
        } else {
            if (self.isXhrSent && self.isXhrDone) {
                if (!((self.xhrResponseCode >= 200 && self.xhrResponseCode <= 399) || self.xhrResponseCode == 0)) {
                     // TODO: for IE status like: 12002, 12007, ... provide corresponding statusText messages also.
                     LOG.error("XHR failed with message " + self.xhrStatusText);
                     e = "XHR ERROR: URL = " + self.xhrOpenLocation + " Response_Code = " + self.xhrResponseCode + " Error_Message = " + self.xhrStatusText;
                     self.abortXhr = false;
                     self.isXhrSent = false;
                     self.isXhrDone = false;
                     self.xhrResponseCode = null;
                     self.xhrStatusText = null;
                     throw new SeleniumError(e);
                }
           }
          return self.newPageLoaded && (self.isXhrSent ? (self.abortXhr || self.isXhrDone) : true);
        }
    };

    this.setAllowNativeXPath = function(allow) {
        this.xpathEvaluator.setAllowNativeXPath(allow);
    };

    this.setIgnoreAttributesWithoutValue = function(ignore) {
        this.xpathEvaluator.setIgnoreAttributesWithoutValue(ignore);
    };

    this.setXPathEngine = function(engineName) {
        this.xpathEvaluator.setCurrentEngine(engineName);
    };

    this.getXPathEngine = function() {
        return this.xpathEvaluator.getCurrentEngine();
    };
};

// DGF PageBot exists for backwards compatibility with old user-extensions
var PageBot = function(){};

BrowserBot.createForWindow = function(window, proxyInjectionMode) {
    var browserbot;
    LOG.debug('createForWindow');
    LOG.debug("browserName: " + browserVersion.name);
    LOG.debug("userAgent: " + navigator.userAgent);
    if (browserVersion.isIE) {
        browserbot = new IEBrowserBot(window);
    }
    else if (browserVersion.isKonqueror) {
        browserbot = new KonquerorBrowserBot(window);
    }
    else if (browserVersion.isOpera) {
        browserbot = new OperaBrowserBot(window);
    }
    else if (browserVersion.isSafari) {
        browserbot = new SafariBrowserBot(window);
    }
    else {
        // Use mozilla by default
        browserbot = new MozillaBrowserBot(window);
    }
    // getCurrentWindow has the side effect of modifying it to handle page loads etc
    browserbot.proxyInjectionMode = proxyInjectionMode;
    browserbot.getCurrentWindow();    // for modifyWindow side effect.  This is not a transparent style
    return browserbot;
};

// todo: rename?  This doesn't actually "do" anything.
BrowserBot.prototype.doModalDialogTest = function(test) {
    this.modalDialogTest = test;
};

BrowserBot.prototype.cancelNextConfirmation = function(result) {
    this.nextConfirmResult = result;
};

BrowserBot.prototype.setNextPromptResult = function(result) {
    this.nextPromptResult = result;
};

BrowserBot.prototype.hasAlerts = function() {
    return (this.recordedAlerts.length > 0);
};

BrowserBot.prototype.relayBotToRC = function(s) {
    // DGF need to do this funny trick to see if we're in PI mode, because
    // "this" might be the window, rather than the browserbot (e.g. during window.alert)
    var piMode = this.proxyInjectionMode;
    if (!piMode) {
        if (typeof(selenium) != "undefined") {
            piMode = selenium.browserbot && selenium.browserbot.proxyInjectionMode;
        }
    }
    if (piMode) {
        this.relayToRC("selenium." + s);
    }
};

BrowserBot.prototype.relayToRC = function(name) {
        var object = eval(name);
        var s = 'state:' + serializeObject(name, object) + "\n";
        sendToRC(s,"state=true");
};

BrowserBot.prototype.resetPopups = function() {
    this.recordedAlerts = [];
    this.recordedConfirmations = [];
    this.recordedPrompts = [];
};

BrowserBot.prototype.getNextAlert = function() {
    var t = this.recordedAlerts.shift();
    if (t) {
        t = t.replace(/\n/g, " ");  // because Selenese loses \n's when retrieving text from HTML table
    }
    this.relayBotToRC("browserbot.recordedAlerts");
    return t;
};

BrowserBot.prototype.hasConfirmations = function() {
    return (this.recordedConfirmations.length > 0);
};

BrowserBot.prototype.getNextConfirmation = function() {
    var t = this.recordedConfirmations.shift();
    this.relayBotToRC("browserbot.recordedConfirmations");
    return t;
};

BrowserBot.prototype.hasPrompts = function() {
    return (this.recordedPrompts.length > 0);
};

BrowserBot.prototype.getNextPrompt = function() {
    var t = this.recordedPrompts.shift();
    this.relayBotToRC("browserbot.recordedPrompts");
    return t;
};

/* Fire a mouse event in a browser-compatible manner */

BrowserBot.prototype.triggerMouseEvent = function(element, eventType, canBubble, clientX, clientY, button) {
    clientX = clientX ? clientX : 0;
    clientY = clientY ? clientY : 0;

    LOG.debug("triggerMouseEvent assumes setting screenX and screenY to 0 is ok");
    var screenX = 0;
    var screenY = 0;

    canBubble = (typeof(canBubble) == undefined) ? true : canBubble;
    var evt;
    if (element.fireEvent && element.ownerDocument && element.ownerDocument.createEventObject) { //IE
        evt = createEventObject(element, this.controlKeyDown, this.altKeyDown, this.shiftKeyDown, this.metaKeyDown);
        evt.detail = 0;
        evt.button = button ? button : 1; // default will be the left mouse click ( http://www.javascriptkit.com/jsref/event.shtml )
        evt.relatedTarget = null;
        if (!screenX && !screenY && !clientX && !clientY && !this.controlKeyDown && !this.altKeyDown && !this.shiftKeyDown && !this.metaKeyDown) {
            element.fireEvent('on' + eventType);
        }
        else {
            evt.screenX = screenX;
            evt.screenY = screenY;
            evt.clientX = clientX;
            evt.clientY = clientY;

            // when we go this route, window.event is never set to contain the event we have just created.
            // ideally we could just slide it in as follows in the try-block below, but this normally
            // doesn't work.  This is why I try to avoid this code path, which is only required if we need to
            // set attributes on the event (e.g., clientX).
            try {
                window.event = evt;
            }
            catch(e) {
                // getting an "Object does not support this action or property" error.  Save the event away
                // for future reference.
                // TODO: is there a way to update window.event?

                // work around for http://jira.openqa.org/browse/SEL-280 -- make the event available somewhere:
                selenium.browserbot.getCurrentWindow().selenium_event = evt;
            }
            element.fireEvent('on' + eventType, evt);
        }
    }
    else {
        var doc = goog.dom.getOwnerDocument(element);
        var view = goog.dom.getWindow(doc);

        evt = doc.createEvent('MouseEvents');
        if (evt.initMouseEvent) {
            // see http://developer.mozilla.org/en/docs/DOM:event.button and
            // http://developer.mozilla.org/en/docs/DOM:event.initMouseEvent for button ternary logic logic
            //Safari
            evt.initMouseEvent(eventType, canBubble, true, view, 1, screenX, screenY, clientX, clientY,
                this.controlKeyDown, this.altKeyDown, this.shiftKeyDown, this.metaKeyDown, button ? button : 0, null);
        } else {
          LOG.warn("element doesn't have initMouseEvent; firing an event which should -- but doesn't -- have other mouse-event related attributes here, as well as controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown");
            evt.initEvent(eventType, canBubble, true);

            evt.shiftKey = this.shiftKeyDown;
            evt.metaKey = this.metaKeyDown;
            evt.altKey = this.altKeyDown;
            evt.ctrlKey = this.controlKeyDown;
            if(button)
            {
              evt.button = button;
            }
        }
        element.dispatchEvent(evt);
    }
};

BrowserBot.prototype._windowClosed = function(win) {
    try {
        var c = win.closed;
        if (c == null) return true;
        return c;
    } catch (ignored) {
        // Firefox 15+ may already have marked the win dead. Accessing it
        // causes an exception to be thrown. That exception tells us the window
        // is closed.
        return true;
    }
};

BrowserBot.uniqueKey = 1;

BrowserBot.prototype._modifyWindow = function(win) {
    // In proxyInjectionMode, have to suppress LOG calls in _modifyWindow to avoid an infinite loop
    if (this._windowClosed(win)) {
        if (!this.proxyInjectionMode) {
            LOG.error("modifyWindow: Window was closed!");
        }
        return null;
    }
    if (!this.proxyInjectionMode) {
        LOG.debug('modifyWindow ' + this.uniqueId + ":" + win[this.uniqueId]);
    }

    // Assign a unique label for this window. We set this on a known attribute so we can reliably
    // find it later. This is slightly different from uniqueId.
    win.seleniumKey = BrowserBot.uniqueKey++;

    this.modifyWindowToRecordPopUpDialogs(win, this);

    //Commenting out for issue 1854
    //win[this.uniqueId] = 1;

    // In proxyInjection mode, we have our own mechanism for detecting page loads
    if (!this.proxyInjectionMode) {
        this.modifySeparateTestWindowToDetectPageLoads(win);
    }
    if (win.frames && win.frames.length && win.frames.length > 0) {
        for (var i = 0; i < win.frames.length; i++) {
            try {
                this._modifyWindow(win.frames[i]);
            } catch (e) {} // we're just trying to be opportunistic; don't worry if this doesn't work out
        }
    }
    return win;
};

BrowserBot.prototype.selectWindow = function(target) {
    if (!target || target == "null") {
        this._selectTopWindow();
        return;
    }
    var result = target.match(/^([a-zA-Z]+)=(.*)/);
    if (!result) {
        this._selectWindowByWindowId(target);
        return;
    }
    locatorType = result[1];
    locatorValue = result[2];
    if (locatorType == "title") {
        this._selectWindowByTitle(locatorValue);
    }
    // TODO separate name and var into separate functions
    else if (locatorType == "name") {
        this._selectWindowByName(locatorValue);
    } else if (locatorType == "var") {
        var win = this.getCurrentWindow().eval(locatorValue);
        if (win) {
            this._selectWindowByName(win.name);
        } else {
            throw new SeleniumError("Window not found by var: " + locatorValue);
        }
    } else {
        throw new SeleniumError("Window locator not recognized: " + locatorType);
    }
};

BrowserBot.prototype.selectPopUp = function(windowId) {
    if (! windowId || windowId == 'null') {
        this._selectFirstNonTopWindow();
    }
    else {
        this._selectWindowByWindowId(windowId);
    }
};

BrowserBot.prototype._selectTopWindow = function() {
    this.currentWindowName = null;
    this.currentWindow = this.topWindow;
    this.topFrame = this.topWindow;
    this.isSubFrameSelected = false;
};

BrowserBot.prototype._selectWindowByWindowId = function(windowId) {
    try {
        this._selectWindowByName(windowId);
    }
    catch (e) {
        this._selectWindowByTitle(windowId);
    }
};

BrowserBot.prototype._selectWindowByName = function(target) {
    this.currentWindow = this.getWindowByName(target, false);
    this.topFrame = this.currentWindow;
    this.currentWindowName = target;
    this.isSubFrameSelected = false;
};

BrowserBot.prototype._selectWindowByTitle = function(target) {
    var windowName = this.getWindowNameByTitle(target);
    if (!windowName) {
        this._selectTopWindow();
    } else {
        this._selectWindowByName(windowName);
    }
};

BrowserBot.prototype._selectFirstNonTopWindow = function() {
    var names = this.getNonTopWindowNames();
    if (names.length) {
        this._selectWindowByName(names[0]);
    }
};

BrowserBot.prototype.selectFrame = function(target) {
    var frame;

    if (target.indexOf("index=") == 0) {
        target = target.substr(6);
        frame = this.getCurrentWindow().frames[target];
        if (frame == null) {
            throw new SeleniumError("Not found: frames["+target+"]");
        }
        if (!frame.document) {
            throw new SeleniumError("frames["+target+"] is not a frame");
        }
        this.currentWindow = frame;
        this.isSubFrameSelected = true;
    }
    else if (target == "relative=up" || target == "relative=parent") {
        this.currentWindow = this.getCurrentWindow().parent;
        this.isSubFrameSelected = (this._getFrameElement(this.currentWindow) != null);
    } else if (target == "relative=top") {
        this.currentWindow = this.topFrame;
        this.isSubFrameSelected = false;
    } else {
        frame = this.findElement(target);
        if (frame == null) {
            throw new SeleniumError("Not found: " + target);
        }
        // now, did they give us a frame or a frame ELEMENT?
        var match = false;
        if (frame.contentWindow) {
            // this must be a frame element
            if (browserVersion.isHTA) {
                // stupid HTA bug; can't get in the front door
                target = frame.contentWindow.name;
            } else {
                this.currentWindow = frame.contentWindow;
                this.isSubFrameSelected = true;
                match = true;
            }
        } else if (frame.document && frame.location) {
            // must be an actual window frame
            this.currentWindow = frame;
            this.isSubFrameSelected = true;
            match = true;
        }

        if (!match) {
            // neither, let's loop through the frame names
            var win = this.getCurrentWindow();

            if (win && win.frames && win.frames.length) {
                for (var i = 0; i < win.frames.length; i++) {
                    if (win.frames[i].name == target) {
                        this.currentWindow = win.frames[i];
                        this.isSubFrameSelected = true;
                        match = true;
                        break;
                    }
                }
            }
            if (!match) {
                throw new SeleniumError("Not a frame: " + target);
            }
        }
    }
    // modifies the window
    this.getCurrentWindow();
};

BrowserBot.prototype.doesThisFrameMatchFrameExpression = function(currentFrameString, target) {
    var isDom = false;
    if (target.indexOf("dom=") == 0) {
        target = target.substr(4);
        isDom = true;
    } else if (target.indexOf("index=") == 0) {
        target = "frames[" + target.substr(6) + "]";
        isDom = true;
    }
    var t;
    try {
        eval("t=" + currentFrameString + "." + target);
    } catch (e) {
    }
    var autWindow = this.browserbot.getCurrentWindow();
    if (t != null) {
        try {
            if (t.window == autWindow) {
                return true;
            }
            if (t.window.uniqueId == autWindow.uniqueId) {
                return true;
               }
            return false;
        } catch (permDenied) {
            // DGF if the windows are incomparable, they're probably not the same...
        }
    }
    if (isDom) {
        return false;
    }
    var currentFrame;
    eval("currentFrame=" + currentFrameString);
    if (target == "relative=up") {
        if (currentFrame.window.parent == autWindow) {
            return true;
        }
        return false;
    }
    if (target == "relative=top") {
        if (currentFrame.window.top == autWindow) {
            return true;
        }
        return false;
    }
    if (currentFrame.window == autWindow.parent) {
        if (autWindow.name == target) {
            return true;
        }
        try {
            var element = this.findElement(target, currentFrame.window);
            if (element.contentWindow == autWindow) {
                return true;
            }
        } catch (e) {}
    }
    return false;
};

BrowserBot.prototype.abortXhrRequest = function() {
    if (this.ignoreResponseCode) {
       LOG.debug("XHR response code being ignored. Nothing to abort.");
    } else {
        if (this.abortXhr == false && this.isXhrSent && !this.isXhrDone) {
            LOG.info("abortXhrRequest(): aborting request");
            this.abortXhr = true;
            this.xhr.abort();
        }
    }
};

BrowserBot.prototype.onXhrStateChange = function(method) {
      LOG.info("onXhrStateChange(): xhr.readyState = " + this.xhr.readyState + " method = " + method + " time = " + new Date().getTime());
      if (this.xhr.readyState == 4) {

          // check if the request got aborted.
          if (this.abortXhr == true) {
              this.xhrResponseCode = 0;
              this.xhrStatusText = "Request Aborted";
              this.isXhrDone = true;
              return;
          }

          try {
              if (method == "HEAD" && (this.xhr.status == 501 || this.xhr.status == 405)) {
                 LOG.info("onXhrStateChange(): HEAD ajax returned 501 or 405, retrying with GET");
                 // handle 501 response code from servers that do not support 'HEAD' method.
                 // send GET ajax request with range 0-1.
                 this.xhr = XmlHttp.create();
                 this.xhr.onreadystatechange = this.onXhrStateChange.bind(this, "GET");
                 this.xhr.open("GET", this.xhrOpenLocation, true);
                 this.xhr.setRequestHeader("Range", "bytes:0-1");
                 this.xhr.send("");
                 this.isXhrSent = true;
                 return;
              }
              this.xhrResponseCode = this.xhr.status;
              this.xhrStatusText = this.xhr.statusText;
          } catch (ex) {
              LOG.info("encountered exception while reading xhrResponseCode." + ex.message);
              this.xhrResponseCode = -1;
    	      this.xhrStatusText = "Request Error";
          }

          this.isXhrDone = true;
      }
};

BrowserBot.prototype.checkedOpen = function(target) {
    var url = absolutify(target, this.baseUrl);
    LOG.debug("checkedOpen(): url = " + url);
    this.isXhrDone = false;
    this.abortXhr = false;
    this.xhrResponseCode = null;
    this.xhrOpenLocation = url;
    try {
        this.xhr = XmlHttp.create();
    } catch (ex) {
        LOG.error("Your browser doesnt support Xml Http Request");
        return;
    }
    this.xhr.onreadystatechange =  this.onXhrStateChange.bind(this, "HEAD");
    this.xhr.open("HEAD", url, true);
    this.xhr.send("");
    this.isXhrSent = true;
};

BrowserBot.prototype.openLocation = function(target) {
    // We're moving to a new page - clear the current one
    var win = this.getCurrentWindow();
    LOG.debug("openLocation newPageLoaded = false");
    this.newPageLoaded = false;
    if (!this.ignoreResponseCode) {
        this.checkedOpen(target);
    }
    this.setOpenLocation(win, target);
};

BrowserBot.prototype.openWindow = function(url, windowID) {
    if (url != "") {
        url = absolutify(url, this.baseUrl);
    }
    if (browserVersion.isHTA) {
        // in HTA mode, calling .open on the window interprets the url relative to that window
        // we need to absolute-ize the URL to make it consistent
        var child = this.getCurrentWindow().open(url, windowID, 'resizable=yes');
        selenium.browserbot.openedWindows[windowID] = child;
    } else {
        this.getCurrentWindow().open(url, windowID, 'resizable=yes');
    }
};

BrowserBot.prototype.setIFrameLocation = function(iframe, location) {
    iframe.src = location;
};

BrowserBot.prototype.setOpenLocation = function(win, loc) {
    loc = absolutify(loc, this.baseUrl);
    if (browserVersion.isHTA) {
        var oldHref = win.location.href;
        win.location.href = loc;
        var marker = null;
        try {
            marker = this.isPollingForLoad(win);
            if (marker && win.location[marker]) {
                win.location[marker] = false;
            }
        } catch (e) {} // DGF don't know why, but this often fails
    } else {
        try {
            win.location.href = loc;
        } catch (err) {
            //Samit: Fix: SeleniumIDE under Firefox 4 breaks if you try to open chrome URL on (XPCNativeWrapper) unwrapped window objects
            if (err.name && err.name == "NS_ERROR_FAILURE") {
                //LOG.debug("wrapping and retrying");
                try {
                    XPCNativeWrapper(win).location.href = loc;  //wrap it and try again
                } catch(e) {
                    throw err;  //throw the original error, not this one
                }
            } else {
                throw err;  //throw the original error, since we cannot fix it
            }
        }
    }
};

BrowserBot.prototype.getCurrentPage = function() {
    return this;
};


BrowserBot.prototype.windowNeedsModifying = function(win, uniqueId) {
    // On anything but Firefox, checking the unique id is enough.
    // Firefox 4 introduces a race condition which selenium regularly loses.

    try {
        var appInfo = Components.classes['@mozilla.org/xre/app-info;1'].
            getService(Components.interfaces.nsIXULAppInfo);
        var versionChecker = Components.
            classes['@mozilla.org/xpcom/version-comparator;1'].
            getService(Components.interfaces.nsIVersionComparator);

        if (versionChecker.compare(appInfo.version, '4.0b1') >= 0) {
            return win.alert.toString().indexOf("native code") != -1;
        }
    } catch (ignored) {}
    return !win[uniqueId];
};


BrowserBot.prototype.modifyWindowToRecordPopUpDialogs = function(originalWindow, browserBot) {
    var self = this;

    // Apparently, Firefox 4 makes it possible to unwrap an object to find that
    // there's nothing in it.
    var windowToModify = core.firefox.unwrap(originalWindow);
    if (!windowToModify) {
      windowToModify = originalWindow;
    }

    windowToModify.seleniumAlert = windowToModify.alert;

    if (!self.windowNeedsModifying(windowToModify, browserBot.uniqueId)) {
        return;
    }

    windowToModify.alert = function(alert) {
        browserBot.recordedAlerts.push(alert);
        self.relayBotToRC.call(self, "browserbot.recordedAlerts");
    };

    windowToModify.confirm = function(message) {
        browserBot.recordedConfirmations.push(message);
        var result = browserBot.nextConfirmResult;
        browserBot.nextConfirmResult = true;
        self.relayBotToRC.call(self, "browserbot.recordedConfirmations");
        return result;
    };

    windowToModify.prompt = function(message) {
        browserBot.recordedPrompts.push(message);
        var result = !browserBot.nextConfirmResult ? null : browserBot.nextPromptResult;
        browserBot.nextConfirmResult = true;
        browserBot.nextPromptResult = '';
        self.relayBotToRC.call(self, "browserbot.recordedPrompts");
        return result;
    };

    // Keep a reference to all popup windows by name
    // note that in IE the "windowName" argument must be a valid javascript identifier, it seems.
    var originalOpen = windowToModify.open;
    var originalOpenReference;
    if (browserVersion.isHTA) {
        originalOpenReference = 'selenium_originalOpen' + new Date().getTime();
        windowToModify[originalOpenReference] = windowToModify.open;
    }

    var isHTA = browserVersion.isHTA;

    var newOpen = function(url, windowName, windowFeatures, replaceFlag) {
        var myOriginalOpen = originalOpen;
        if (isHTA) {
            myOriginalOpen = this[originalOpenReference];
        }
        if (windowName == "" || windowName == "_blank") {
            windowName = "selenium_blank" + Math.round(100000 * Math.random());
            LOG.warn("Opening window '_blank', which is not a real window name.  Randomizing target to be: " + windowName);
        }
        var openedWindow = myOriginalOpen(url, windowName, windowFeatures, replaceFlag);
        LOG.debug("window.open call intercepted; window ID (which you can use with selectWindow()) is \"" +  windowName + "\"");
        if (windowName!=null) {
            openedWindow["seleniumWindowName"] = windowName;
        }
        selenium.browserbot.openedWindows[windowName] = openedWindow;
        return openedWindow;
    };

    if (browserVersion.isHTA) {
        originalOpenReference = 'selenium_originalOpen' + new Date().getTime();
        newOpenReference = 'selenium_newOpen' + new Date().getTime();
        var setOriginalRef = "this['" + originalOpenReference + "'] = this.open;";

        if (windowToModify.eval) {
            windowToModify.eval(setOriginalRef);
            windowToModify.open = newOpen;
        } else {
            // DGF why can't I eval here?  Seems like I'm querying the window at a bad time, maybe?
            setOriginalRef += "this.open = this['" + newOpenReference + "'];";
            windowToModify[newOpenReference] = newOpen;
            windowToModify.setTimeout(setOriginalRef, 0);
        }
    } else {
        windowToModify.open = newOpen;
    }
};

/**
 * Call the supplied function when a the current page unloads and a new one loads.
 * This is done by polling continuously until the document changes and is fully loaded.
 */
BrowserBot.prototype.modifySeparateTestWindowToDetectPageLoads = function(windowObject) {
    // Since the unload event doesn't fire in Safari 1.3, we start polling immediately
    if (!windowObject) {
        LOG.warn("modifySeparateTestWindowToDetectPageLoads: no windowObject!");
        return;
    }
    if (this._windowClosed(windowObject)) {
        LOG.info("modifySeparateTestWindowToDetectPageLoads: windowObject was closed");
        return;
    }
    var oldMarker = this.isPollingForLoad(windowObject);
    if (oldMarker) {
        LOG.debug("modifySeparateTestWindowToDetectPageLoads: already polling this window: " + oldMarker);
        return;
    }

    var marker = 'selenium' + new Date().getTime();
    LOG.debug("Starting pollForLoad (" + marker + "): " + windowObject.location);
    this.pollingForLoad[marker] = true;
    // if this is a frame, add a load listener, otherwise, attach a poller
    var frameElement = this._getFrameElement(windowObject);
    // DGF HTA mode can't attach load listeners to subframes (yuk!)
    var htaSubFrame = this._isHTASubFrame(windowObject);
    if (frameElement && !htaSubFrame) {
        LOG.debug("modifySeparateTestWindowToDetectPageLoads: this window is a frame; attaching a load listener");
        addLoadListener(frameElement, this.recordPageLoad);
        frameElement[marker] = true;
        frameElement["frame"+this.uniqueId] = marker;
	LOG.debug("dgf this.uniqueId="+this.uniqueId);
	LOG.debug("dgf marker="+marker);
	LOG.debug("dgf frameElement['frame'+this.uniqueId]="+frameElement['frame'+this.uniqueId]);
frameElement[this.uniqueId] = marker;
LOG.debug("dgf frameElement[this.uniqueId]="+frameElement[this.uniqueId]);
    } else {
        windowObject.location[marker] = true;
        windowObject[this.uniqueId] = marker;
        this.pollForLoad(this.recordPageLoad, windowObject, windowObject.document, windowObject.location, windowObject.location.href, marker);
    }
};

BrowserBot.prototype._isHTASubFrame = function(win) {
    if (!browserVersion.isHTA) return false;
    // DGF this is wrong! what if "win" isn't the selected window?
    return this.isSubFrameSelected;
};

BrowserBot.prototype._getFrameElement = function(win) {
    var frameElement = null;
    var caught;
    try {
        frameElement = win.frameElement;
    } catch (e) {
        caught = true;
    }
    if (caught) {
        // on IE, checking frameElement in a pop-up results in a "No such interface supported" exception
        // but it might have a frame element anyway!
        var parentContainsIdenticallyNamedFrame = false;
        try {
            parentContainsIdenticallyNamedFrame = win.parent.frames[win.name];
        } catch (e) {} // this may fail if access is denied to the parent; in that case, assume it's not a pop-up

        if (parentContainsIdenticallyNamedFrame) {
            // it can't be a coincidence that the parent has a frame with the same name as myself!
            var result;
            try {
                result = parentContainsIdenticallyNamedFrame.frameElement;
                if (result) {
                    return result;
                }
            } catch (e) {} // it was worth a try! _getFrameElementsByName is often slow
            result = this._getFrameElementByName(win.name, win.parent.document, win);
            return result;
        }
    }
    LOG.debug("_getFrameElement: frameElement="+frameElement);
    if (frameElement) {
        LOG.debug("frameElement.name="+frameElement.name);
    }
    return frameElement;
};

BrowserBot.prototype._getFrameElementByName = function(name, doc, win) {
    var frames;
    var frame;
    var i;
    frames = doc.getElementsByTagName("iframe");
    for (i = 0; i < frames.length; i++) {
        frame = frames[i];
        if (frame.name === name) {
            return frame;
        }
    }
    frames = doc.getElementsByTagName("frame");
    for (i = 0; i < frames.length; i++) {
        frame = frames[i];
        if (frame.name === name) {
            return frame;
        }
    }
    // DGF weird; we only call this function when we know the doc contains the frame
    LOG.warn("_getFrameElementByName couldn't find a frame or iframe; checking every element for the name " + name);
    return BrowserBot.prototype.locateElementByName(win.name, win.parent.document);
};


/**
 * Set up a polling timer that will keep checking the readyState of the document until it's complete.
 * Since we might call this before the original page is unloaded, we first check to see that the current location
 * or href is different from the original one.
 */
BrowserBot.prototype.pollForLoad = function(loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker) {
    LOG.debug("pollForLoad original (" + marker + "): " + originalHref);
    try {
        //Samit: Fix: open command sometimes fails if current url is chrome and new is not
        windowObject = core.firefox.unwrap(windowObject);
        if (this._windowClosed(windowObject)) {
            LOG.debug("pollForLoad WINDOW CLOSED (" + marker + ")");
            delete this.pollingForLoad[marker];
            return;
        }

        var isSamePage = this._isSamePage(windowObject, originalDocument, originalLocation, originalHref, marker);
        var rs = this.getReadyState(windowObject, windowObject.document);

        if (!isSamePage && rs == 'complete') {
            var currentHref = windowObject.location.href;
            LOG.debug("pollForLoad FINISHED (" + marker + "): " + rs + " (" + currentHref + ")");
            delete this.pollingForLoad[marker];
            this._modifyWindow(windowObject);
            var newMarker = this.isPollingForLoad(windowObject);
            if (!newMarker) {
                LOG.debug("modifyWindow didn't start new poller: " + newMarker);
                this.modifySeparateTestWindowToDetectPageLoads(windowObject);
            }
            newMarker = this.isPollingForLoad(windowObject);
            var currentlySelectedWindow;
            var currentlySelectedWindowMarker;
            currentlySelectedWindow =this.getCurrentWindow(true);
            currentlySelectedWindowMarker = currentlySelectedWindow[this.uniqueId];

            LOG.debug("pollForLoad (" + marker + ") restarting " + newMarker);
            if (/(TestRunner-splash|Blank)\.html\?start=true$/.test(currentHref)) {
                LOG.debug("pollForLoad Oh, it's just the starting page.  Never mind!");
            } else if (currentlySelectedWindowMarker == newMarker) {
                loadFunction(currentlySelectedWindow);
            } else {
                LOG.debug("pollForLoad page load detected in non-current window; ignoring (currentlySelected="+currentlySelectedWindowMarker+", detection in "+newMarker+")");
            }
            return;
        }
        LOG.debug("pollForLoad continue (" + marker + "): " + currentHref);
        this.reschedulePoller(loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker);
    } catch (e) {
        LOG.debug("Exception during pollForLoad; this should get noticed soon (" + e.message + ")!");
        //DGF this is supposed to get logged later; log it at debug just in case
        //LOG.exception(e);
        this.pageLoadError = e;
    }
};

BrowserBot.prototype._isSamePage = function(windowObject, originalDocument, originalLocation, originalHref, marker) {
    var currentDocument = windowObject.document;
    var currentLocation = windowObject.location;
    var currentHref = currentLocation.href;

    var sameDoc = this._isSameDocument(originalDocument, currentDocument);

    var sameLoc = (originalLocation === currentLocation);

    // hash marks don't meant the page has loaded, so we need to strip them off if they exist...
    var currentHash = currentHref.indexOf('#');
    if (currentHash > 0) {
        currentHref = currentHref.substring(0, currentHash);
    }
    var originalHash = originalHref.indexOf('#');
    if (originalHash > 0) {
        originalHref = originalHref.substring(0, originalHash);
    }
    LOG.debug("_isSamePage: currentHref: " + currentHref);
    LOG.debug("_isSamePage: originalHref: " + originalHref);

    var sameHref = (originalHref === currentHref);
    var markedLoc = currentLocation[marker];

    if (browserVersion.isKonqueror || browserVersion.isSafari) {
        // the mark disappears too early on these browsers
        markedLoc = true;
    }

    // since this is some _very_ important logic, especially for PI and multiWindow mode, we should log all these out
    LOG.debug("_isSamePage: sameDoc: " + sameDoc);
    LOG.debug("_isSamePage: sameLoc: " + sameLoc);
    LOG.debug("_isSamePage: sameHref: " + sameHref);
    LOG.debug("_isSamePage: markedLoc: " + markedLoc);

    return sameDoc && sameLoc && sameHref && markedLoc;
};

BrowserBot.prototype._isSameDocument = function(originalDocument, currentDocument) {
    return originalDocument === currentDocument;
};


BrowserBot.prototype.getReadyState = function(windowObject, currentDocument) {
    var rs = currentDocument.readyState;
    if (rs == null) {
       if ((this.buttonWindow!=null && this.buttonWindow.document.readyState == null) // not proxy injection mode (and therefore buttonWindow isn't null)
       || (top.document.readyState == null)) {                                               // proxy injection mode (and therefore everything's in the top window, but buttonWindow doesn't exist)
            // uh oh!  we're probably on Firefox with no readyState extension installed!
            // We'll have to just take a guess as to when the document is loaded; this guess
            // will never be perfect. :-(
            if (typeof currentDocument.getElementsByTagName != 'undefined'
                    && typeof currentDocument.getElementById != 'undefined'
                    && ( currentDocument.getElementsByTagName('body')[0] != null
                    || currentDocument.body != null )) {
                if (windowObject.frameElement && windowObject.location.href == "about:blank" && windowObject.frameElement.src != "about:blank") {
                    LOG.info("getReadyState not loaded, frame location was about:blank, but frame src = " + windowObject.frameElement.src);
                    return null;
                }
                LOG.debug("getReadyState = windowObject.frames.length = " + windowObject.frames.length);
                for (var i = 0; i < windowObject.frames.length; i++) {
                    LOG.debug("i = " + i);
                    if (this.getReadyState(windowObject.frames[i], windowObject.frames[i].document) != 'complete') {
                        LOG.debug("getReadyState aha! the nested frame " + windowObject.frames[i].name + " wasn't ready!");
                        return null;
                    }
                }

                rs = 'complete';
            } else {
                LOG.debug("pollForLoad readyState was null and DOM appeared to not be ready yet");
            }
        }
    }
    else if (rs == "loading" && browserVersion.isIE) {
        LOG.debug("pageUnloading = true!!!!");
        this.pageUnloading = true;
    }
    LOG.debug("getReadyState returning " + rs);
    return rs;
};

/** This function isn't used normally, but was the way we used to schedule pollers:
 asynchronously executed autonomous units.  This is deprecated, but remains here
 for future reference.
 */
BrowserBot.prototype.XXXreschedulePoller = function(loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker) {
    var self = this;
    window.setTimeout(function() {
        self.pollForLoad(loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker);
    }, 500);
};

/** This function isn't used normally, but is useful for debugging asynchronous pollers
 * To enable it, rename it to "reschedulePoller", so it will override the
 * existing reschedulePoller function
 */
BrowserBot.prototype.XXXreschedulePoller = function(loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker) {
    var doc = this.buttonWindow.document;
    var button = doc.createElement("button");
    var buttonName = doc.createTextNode(marker + " - " + windowObject.name);
    button.appendChild(buttonName);
    var tools = doc.getElementById("tools");
    var self = this;
    button.onclick = function() {
        tools.removeChild(button);
        self.pollForLoad(loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker);
    };
    tools.appendChild(button);
    window.setTimeout(button.onclick, 500);
};

BrowserBot.prototype.reschedulePoller = function(loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker) {
    var self = this;
    var pollerFunction = function() {
        self.pollForLoad(loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker);
    };
    this.windowPollers.push(pollerFunction);
};

BrowserBot.prototype.runScheduledPollers = function() {
    LOG.debug("runScheduledPollers");
    var oldPollers = this.windowPollers;
    this.windowPollers = new Array();
    for (var i = 0; i < oldPollers.length; i++) {
        oldPollers[i].call();
    }
    LOG.debug("runScheduledPollers DONE");
};

BrowserBot.prototype.isPollingForLoad = function(win) {
    var marker;
    var frameElement = this._getFrameElement(win);
    var htaSubFrame = this._isHTASubFrame(win);
    if (frameElement && !htaSubFrame) {
	marker = frameElement["frame"+this.uniqueId];
    } else {
        marker = win[this.uniqueId];
    }
    if (!marker) {
        LOG.debug("isPollingForLoad false, missing uniqueId " + this.uniqueId + ": " + marker);
        return false;
    }
    if (!this.pollingForLoad[marker]) {
        LOG.debug("isPollingForLoad false, this.pollingForLoad[" + marker + "]: " + this.pollingForLoad[marker]);
        return false;
    }
    return marker;
};

BrowserBot.prototype.getWindowByName = function(windowName, doNotModify) {
    LOG.debug("getWindowByName(" + windowName + ")");
    // First look in the map of opened windows
    var targetWindow = this.openedWindows[windowName];
    if (!targetWindow) {
        targetWindow = this.topWindow[windowName];
    }
    if (!targetWindow && windowName == "_blank") {
        for (var winName in this.openedWindows) {
            // _blank can match selenium_blank*, if it looks like it's OK (valid href, not closed)
            if (/^selenium_blank/.test(winName)) {
                targetWindow = this.openedWindows[winName];
                var ok;
                try {
                    if (!this._windowClosed(targetWindow)) {
                        ok = targetWindow.location.href;
                    }
                } catch (e) {}
                if (ok) break;
            }
        }
    }
    if (!targetWindow) {
        throw new SeleniumError("Window does not exist. If this looks like a Selenium bug, make sure to read http://seleniumhq.org/docs/02_selenium_ide.html#alerts-popups-and-multiple-windows for potential workarounds.");
    }
    if (browserVersion.isHTA) {
        try {
            targetWindow.location.href;
        } catch (e) {
            targetWindow = window.open("", targetWindow.name);
            this.openedWindows[targetWindow.name] = targetWindow;
        }
    }
    if (!doNotModify) {
        this._modifyWindow(targetWindow);
    }
    return targetWindow;
};

/**
 * Find a window name from the window title.
 */
BrowserBot.prototype.getWindowNameByTitle = function(windowTitle) {
    LOG.debug("getWindowNameByTitle(" + windowTitle + ")");

    // First look in the map of opened windows and iterate them
    for (var windowName in this.openedWindows) {
        var targetWindow = this.openedWindows[windowName];

        // If the target window's title is our title
        try {
            // TODO implement Pattern Matching here
            if (!this._windowClosed(targetWindow) &&
                targetWindow.document.title == windowTitle) {
                return windowName;
            }
        } catch (e) {
            // You'll often get Permission Denied errors here in IE
            // eh, if we can't read this window's title,
            // it's probably not available to us right now anyway
        }
    }

    try {
        if (this.topWindow.document.title == windowTitle) {
            return "";
        }
    } catch (e) {} // IE Perm denied

    throw new SeleniumError("Could not find window with title " + windowTitle);
};

BrowserBot.prototype.getNonTopWindowNames = function() {
    var nonTopWindowNames = [];

    for (var windowName in this.openedWindows) {
        var win = this.openedWindows[windowName];
        if (! this._windowClosed(win) && win != this.topWindow) {
            nonTopWindowNames.push(windowName);
        }
    }

    return nonTopWindowNames;
};

BrowserBot.prototype.getCurrentWindow = function(doNotModify) {
    if (this.proxyInjectionMode) {
        return window;
    }
    var testWindow = core.firefox.unwrap(this.currentWindow);
    if (!doNotModify) {
        this._modifyWindow(testWindow);
        LOG.debug("getCurrentWindow newPageLoaded = false");
        this.newPageLoaded = false;
    }
    testWindow = this._handleClosedSubFrame(testWindow, doNotModify);
    bot.window_ = testWindow;
    return core.firefox.unwrap(testWindow);
};

/**
 * Offer a method the end-user can reliably use to retrieve the current window.
 * This should work even for windows with an XPCNativeWrapper. Returns the
 * current window object.
 */
BrowserBot.prototype.getUserWindow = function() {
    var userWindow = this.getCurrentWindow(true);
    return userWindow;
};

BrowserBot.prototype._handleClosedSubFrame = function(testWindow, doNotModify) {
    if (this.proxyInjectionMode) {
        return testWindow;
    }

    if (this.isSubFrameSelected) {
        var missing = true;
        if (testWindow.parent && testWindow.parent.frames && testWindow.parent.frames.length) {
            for (var i = 0; i < testWindow.parent.frames.length; i++) {
                var frame = testWindow.parent.frames[i];
                if (frame == testWindow || frame.seleniumKey == testWindow.seleniumKey) {
                    missing = false;
                    break;
                }
            }
        }
        if (missing) {
            LOG.warn("Current subframe appears to have closed; selecting top frame");
            this.selectFrame("relative=top");
            return this.getCurrentWindow(doNotModify);
        }
    } else if (this._windowClosed(testWindow)) {
        var closedError = new SeleniumError("Current window or frame is closed!");
        closedError.windowClosed = true;
        throw closedError;
    }
    return testWindow;
};

BrowserBot.prototype.highlight = function (element, force) {
    if (force || this.shouldHighlightLocatedElement) {
        try {
            highlight(element);
        } catch (e) {} // DGF element highlighting is low-priority and possibly dangerous
    }
    return element;
};

BrowserBot.prototype.setShouldHighlightElement = function (shouldHighlight) {
    this.shouldHighlightLocatedElement = shouldHighlight;
};

/*****************************************************************/
/* BROWSER-SPECIFIC FUNCTIONS ONLY AFTER THIS LINE */


BrowserBot.prototype._registerAllLocatorFunctions = function() {
    // TODO - don't do this in the constructor - only needed once ever
    this.locationStrategies = {};
    for (var functionName in this) {
        var result = /^locateElementBy([A-Z].+)$/.exec(functionName);
        if (result != null) {
            var locatorFunction = this[functionName];
            if (typeof(locatorFunction) != 'function') {
                continue;
            }
            // Use a specified prefix in preference to one generated from
            // the function name
            var locatorPrefix = locatorFunction.prefix || result[1].toLowerCase();
            this.locationStrategies[locatorPrefix] = locatorFunction;
        }
    }

    /**
     * Find a locator based on a prefix.
     */
    this.findElementBy = function(locatorType, locator, inDocument, inWindow) {
        var locatorFunction = this.locationStrategies[locatorType];
        if (! locatorFunction) {
            throw new SeleniumError("Unrecognised locator type: '" + locatorType + "'");
        }
        return locatorFunction.call(this, locator, inDocument, inWindow);
    };

    /**
     * The implicit locator, that is used when no prefix is supplied.
     */
    this.locationStrategies['implicit'] = function(locator, inDocument, inWindow) {
        if (locator.startsWith('//')) {
            return this.locateElementByXPath(locator, inDocument, inWindow);
        }
        if (locator.startsWith('document.')) {
            return this.locateElementByDomTraversal(locator, inDocument, inWindow);
        }
        return this.locateElementByIdentifier(locator, inDocument, inWindow);
    };
};

BrowserBot.prototype.getDocument = function() {
    return core.firefox.unwrap(this.getCurrentWindow().document);
};

BrowserBot.prototype.getTitle = function() {
    var t = this.getDocument().title;
    if (typeof(t) == "string") {
        t = t.trim();
    }
    return t;
};

BrowserBot.prototype.getCookieByName = function(cookieName, doc) {
    if (!doc) doc = this.getDocument();
    var ck = doc.cookie;
    if (!ck) return null;
    var ckPairs = ck.split(/;/);
    for (var i = 0; i < ckPairs.length; i++) {
        var ckPair = ckPairs[i].trim();
        var ckNameValue = ckPair.split(/=/);
        var ckName = decodeURIComponent(ckNameValue[0]);
        if (ckName === cookieName) {
            return decodeURIComponent(ckNameValue.slice(1).join("="));
        }
    }
    return null;
};

BrowserBot.prototype.getAllCookieNames = function(doc) {
    if (!doc) doc = this.getDocument();
    var ck = doc.cookie;
    if (!ck) return [];
    var cookieNames = [];
    var ckPairs = ck.split(/;/);
    for (var i = 0; i < ckPairs.length; i++) {
        var ckPair = ckPairs[i].trim();
        var ckNameValue = ckPair.split(/=/);
        var ckName = decodeURIComponent(ckNameValue[0]);
        cookieNames.push(ckName);
    }
    return cookieNames;
};

BrowserBot.prototype.getAllRawCookieNames = function(doc) {
    if (!doc) doc = this.getDocument();
    var ck = doc.cookie;
    if (!ck) return [];
    var cookieNames = [];
    var ckPairs = ck.split(/;/);
    for (var i = 0; i < ckPairs.length; i++) {
        var ckPair = ckPairs[i].trim();
        var ckNameValue = ckPair.split(/=/);
        var ckName = ckNameValue[0];
        cookieNames.push(ckName);
    }
    return cookieNames;
};

function encodeURIComponentWithASPHack(uri) {
  var regularEncoding = encodeURIComponent(uri);
  var aggressiveEncoding = regularEncoding.replace(".", "%2E");
  aggressiveEncoding = aggressiveEncoding.replace("_", "%5F");
  return aggressiveEncoding;
}

BrowserBot.prototype.deleteCookie = function(cookieName, domain, path, doc) {
    if (!doc) doc = this.getDocument();
    var expireDateInMilliseconds = (new Date()).getTime() + (-1 * 1000);

    // we can't really be sure if we're dealing with encoded or unencoded cookie names
    var _cookieName;
    var rawCookieNames = this.getAllRawCookieNames(doc);
    for (rawCookieNumber in rawCookieNames) {
      if (rawCookieNames[rawCookieNumber] == cookieName) {
        _cookieName = cookieName;
        break;
      } else if (rawCookieNames[rawCookieNumber] == encodeURIComponent(cookieName)) {
        _cookieName = encodeURIComponent(cookieName);
        break;
      } else if (rawCookieNames[rawCookieNumber] == encodeURIComponentWithASPHack(cookieName)) {
        _cookieName = encodeURIComponentWithASPHack(cookieName);
        break;
      }
    }

    var cookie = _cookieName + "=deleted; ";
    if (path) {
        cookie += "path=" + path + "; ";
    }
    if (domain) {
        cookie += "domain=" + domain + "; ";
    }
    cookie += "expires=" + new Date(expireDateInMilliseconds).toGMTString();
    LOG.debug("Setting cookie to: " + cookie);
    doc.cookie = cookie;
};

/** Try to delete cookie, return false if it didn't work */
BrowserBot.prototype._maybeDeleteCookie = function(cookieName, domain, path, doc) {
    this.deleteCookie(cookieName, domain, path, doc);
    return (!this.getCookieByName(cookieName, doc));
};


BrowserBot.prototype._recursivelyDeleteCookieDomains = function(cookieName, domain, path, doc) {
    var deleted = this._maybeDeleteCookie(cookieName, domain, path, doc);
    if (deleted) return true;
    var dotIndex = domain.indexOf(".");
    if (dotIndex == 0) {
        return this._recursivelyDeleteCookieDomains(cookieName, domain.substring(1), path, doc);
    } else if (dotIndex != -1) {
        return this._recursivelyDeleteCookieDomains(cookieName, domain.substring(dotIndex), path, doc);
    } else {
        // No more dots; try just not passing in a domain at all
        return this._maybeDeleteCookie(cookieName, null, path, doc);
    }
};

BrowserBot.prototype._recursivelyDeleteCookie = function(cookieName, domain, path, doc) {
    var slashIndex = path.lastIndexOf("/");
    var finalIndex = path.length-1;
    if (slashIndex == finalIndex) {
        slashIndex--;
    }
    if (slashIndex != -1) {
        deleted = this._recursivelyDeleteCookie(cookieName, domain, path.substring(0, slashIndex+1), doc);
        if (deleted) return true;
    }
    return this._recursivelyDeleteCookieDomains(cookieName, domain, path, doc);
};

BrowserBot.prototype.recursivelyDeleteCookie = function(cookieName, domain, path, win) {
    if (!win) win = this.getCurrentWindow();
    var doc = win.document;
    if (!domain) {
        domain = doc.domain;
    }
    if (!path) {
        path = win.location.pathname;
    }
    var deleted = this._recursivelyDeleteCookie(cookieName, "." + domain, path, doc);
    if (deleted) return;
    // Finally try a null path (Try it last because it's uncommon)
    deleted = this._recursivelyDeleteCookieDomains(cookieName, "." + domain, null, doc);
    if (deleted) return;
    throw new SeleniumError("Couldn't delete cookie " + cookieName);
};

/*
 * Finds an element recursively in frames and nested frames
 * in the specified document, using various lookup protocols
 */
BrowserBot.prototype.findElementRecursive = function(locatorType, locatorString, inDocument, inWindow) {

    var element = this.findElementBy(locatorType, locatorString, inDocument, inWindow);
    if (element != null) {
        return element;
    }

    for (var i = 0; i < inWindow.frames.length; i++) {
        // On some browsers, the document object is undefined for third-party
        // frames.  Make sure the document is valid before continuing.
        if (inWindow.frames[i].document) {
            element = this.findElementRecursive(locatorType, locatorString, inWindow.frames[i].document, inWindow.frames[i]);

            if (element != null) {
                return element;
            }
        }
    }
};

/*
* Finds an element on the current page, using various lookup protocols
*/
BrowserBot.prototype.findElementOrNull = function(locator, win) {
    locator = parse_locator(locator);

    if (win == null) {
        win = this.getCurrentWindow();
    }
    var element = this.findElementRecursive(locator.type, locator.string, win.document, win);
    element = core.firefox.unwrap(element);

    if (element != null) {
        return this.browserbot.highlight(element);
    }

    // Element was not found by any locator function.
    return null;
};

BrowserBot.prototype.findElement = function(locator, win) {
    var element = this.findElementOrNull(locator, win);
    if (element == null) throw new SeleniumError("Element " + locator + " not found");
    return core.firefox.unwrap(element);
};


/**
 * Finds a list of elements using the same mechanism as webdriver.
 *
 * @param {string} how The finding mechanism to use.
 * @param {string} using The selector to use.
 * @param {Document|Element} root The root of the search path.
 */
BrowserBot.prototype.findElementsLikeWebDriver = function(how, using, root) {
  var by = {};
  by[how] = using;

  var all = bot.locators.findElements(by, root);
  var toReturn = '';

  for (var i = 0; i < all.length - 1; i++) {
    toReturn += bot.inject.cache.addElement(core.firefox.unwrap(all[i])) + ',';
  }
  if (all[all.length - 1]) {
    var last = core.firefox.unwrap(all[all.length - 1]);
    toReturn += bot.inject.cache.addElement(core.firefox.unwrap(all[all.length - 1]));
  }

  return toReturn;
};

/**
 * In non-IE browsers, getElementById() does not search by name.  Instead, we
 * we search separately by id and name.
 */
BrowserBot.prototype.locateElementByIdentifier = function(identifier, inDocument, inWindow) {
    // HBC - use "this" instead of "BrowserBot.prototype"; otherwise we lose
    // the non-prototype fields of the object!
    return this.locateElementById(identifier, inDocument, inWindow)
            || BrowserBot.prototype.locateElementByName(identifier, inDocument, inWindow)
            || null;
};

/**
 * Find the element with id - can't rely on getElementById, coz it returns by name as well in IE..
 */
BrowserBot.prototype.locateElementById = function(identifier, inDocument, inWindow) {
    var element = inDocument.getElementById(identifier);
    if (element && element.getAttribute('id') === identifier) {
        return element;
    }
    else if (browserVersion.isIE || browserVersion.isOpera) {
        // SEL-484
        var elements = inDocument.getElementsByTagName('*');

        for (var i = 0, n = elements.length; i < n; ++i) {
            element = elements[i];

            if (element.tagName.toLowerCase() == 'form') {
                if (element.attributes['id'].nodeValue == identifier) {
                    return element;
                }
            }
            else if (element.getAttribute('id') == identifier) {
                return element;
            }
        }

        return null;
    }
    else {
        return null;
    }
};

/**
 * Find an element by name, refined by (optional) element-filter
 * expressions.
 */
BrowserBot.prototype.locateElementByName = function(locator, document, inWindow) {
    var elements = document.getElementsByTagName("*");

    var filters = locator.split(' ');
    filters[0] = 'name=' + filters[0];

    while (filters.length) {
        var filter = filters.shift();
        elements = this.selectElements(filter, elements, 'value');
    }

    if (elements.length > 0) {
        return elements[0];
    }
    return null;
};

/**
 * Finds an element using by evaluating the specfied string.
 */
BrowserBot.prototype.locateElementByDomTraversal = function(domTraversal, document, window) {

    var browserbot = this.browserbot;
    var element = null;
    try {
        element = eval(domTraversal);
    } catch (e) {
        return null;
    }

    if (!element) {
        return null;
    }

    return element;
};

BrowserBot.prototype.locateElementByDomTraversal.prefix = "dom";


BrowserBot.prototype.locateElementByStoredReference = function(locator, document, window) {
  try {
    return core.locators.findElement("stored=" + locator);
  } catch (e) {
    return null;
  }
};
BrowserBot.prototype.locateElementByStoredReference.prefix = "stored";


BrowserBot.prototype.locateElementByWebDriver = function(locator, document, window) {
  try {
    return core.locators.findElement("webdriver=" + locator);
  } catch (e) {
    return null;
  }
};
BrowserBot.prototype.locateElementByWebDriver.prefix = "webdriver";

/**
 * Finds an element identified by the xpath expression. Expressions _must_
 * begin with "//".
 */
BrowserBot.prototype.locateElementByXPath = function(xpath, inDocument, inWindow) {
    return this.xpathEvaluator.selectSingleNode(inDocument, xpath, null,
        inDocument.createNSResolver
          ? inDocument.createNSResolver(inDocument.documentElement)
          : this._namespaceResolver);
};


/**
 * Find many elements using xpath.
 *
 * @param {string} xpath XPath expression to search for.
 * @param {=Document} inDocument The document to search in.
 * @param {=Window} inWindow The window the document is in.
 */
BrowserBot.prototype.locateElementsByXPath = function(xpath, inDocument, inWindow) {
    return this.xpathEvaluator.selectNodes(inDocument, xpath, null,
        inDocument.createNSResolver
          ? inDocument.createNSResolver(inDocument.documentElement)
          : this._namespaceResolver);
};


BrowserBot.prototype._namespaceResolver = function(prefix) {
    if (prefix == 'html' || prefix == 'xhtml' || prefix == 'x') {
        return 'http://www.w3.org/1999/xhtml';
    } else if (prefix == 'mathml') {
        return 'http://www.w3.org/1998/Math/MathML';
    } else if (prefix == 'svg') {
        return 'http://www.w3.org/2000/svg';
    } else {
        throw new Error("Unknown namespace: " + prefix + ".");
    }
};

/**
 * Returns the number of xpath results.
 */
BrowserBot.prototype.evaluateXPathCount = function(selector, inDocument) {
    var locator = parse_locator(selector);
    var opts = {};
    opts['namespaceResolver'] =
        inDocument.createNSResolver
          ? inDocument.createNSResolver(inDocument.documentElement)
          : this._namespaceResolver;
    if (locator.type == 'xpath' || locator.type == 'implicit') {
    	return eval_xpath(locator.string, inDocument, opts).length;
    } else {
        LOG.error("Locator does not use XPath strategy: " + selector);
        return 0;
    }
};

/**
 * Returns the number of css results.
 */
BrowserBot.prototype.evaluateCssCount = function(selector, inDocument) {
    var locator = parse_locator(selector);
    if (locator.type == 'css' || locator.type == 'implicit') {
        return eval_css(locator.string, inDocument).length;
    } else {
        LOG.error("Locator does not use CSS strategy: " + selector);
        return 0;
    }
};

/**
 * Finds a link element with text matching the expression supplied. Expressions must
 * begin with "link:".
 */
BrowserBot.prototype.locateElementByLinkText = function(linkText, inDocument, inWindow) {
    var links = inDocument.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
        var element = links[i];
        if (PatternMatcher.matches(linkText, getText(element))) {
            return element;
        }
    }
    return null;
};

BrowserBot.prototype.locateElementByLinkText.prefix = "link";

/**
 * Returns an attribute based on an attribute locator. This is made up of an element locator
 * suffixed with @attribute-name.
 */
BrowserBot.prototype.findAttribute = function(locator) {
    // Split into locator + attributeName
    var attributePos = locator.lastIndexOf("@");
    var elementLocator = locator.slice(0, attributePos);
    var attributeName = locator.slice(attributePos + 1);

    // Find the element.
    var element = this.findElement(elementLocator);
    var attributeValue = bot.dom.getAttribute(element, attributeName);
    return goog.isDefAndNotNull(attributeValue) ? attributeValue.toString() : null;
};

/*
* Select the specified option and trigger the relevant events of the element.
*/
BrowserBot.prototype.selectOption = function(element, optionToSelect) {
    bot.events.fire(element, bot.events.EventType.FOCUS);
    var changed = false;
    for (var i = 0; i < element.options.length; i++) {
        var option = element.options[i];
        if (option.selected && option != optionToSelect) {
            option.selected = false;
            changed = true;
        }
        else if (!option.selected && option == optionToSelect) {
            option.selected = true;
            changed = true;
        }
    }

    if (changed) {
        bot.events.fire(element, bot.events.EventType.CHANGE);
    }
};

/*
* Select the specified option and trigger the relevant events of the element.
*/
BrowserBot.prototype.addSelection = function(element, option) {
    this.checkMultiselect(element);
    bot.events.fire(element, bot.events.EventType.FOCUS);
    if (!option.selected) {
        option.selected = true;
        bot.events.fire(element, bot.events.EventType.CHANGE);
    }
};

/*
* Select the specified option and trigger the relevant events of the element.
*/
BrowserBot.prototype.removeSelection = function(element, option) {
    this.checkMultiselect(element);
    bot.events.fire(element, bot.events.EventType.FOCUS);
    if (option.selected) {
        option.selected = false;
        bot.events.fire(element, bot.events.EventType.CHANGE);
    }
};

BrowserBot.prototype.checkMultiselect = function(element) {
    if (!element.multiple)
    {
        throw new SeleniumError("Not a multi-select");
    }

};

BrowserBot.prototype.replaceText = function(element, stringValue) {
    bot.events.fire(element, bot.events.EventType.FOCUS);
    bot.events.fire(element, bot.events.EventType.SELECT);
    var maxLengthAttr = element.getAttribute("maxLength");
    var actualValue = stringValue;
    if (maxLengthAttr != null) {
        var maxLength = parseInt(maxLengthAttr);
        if (stringValue.length > maxLength) {
            actualValue = stringValue.substr(0, maxLength);
        }
    }

    if (getTagName(element) == "body") {
        if (element.ownerDocument && element.ownerDocument.designMode) {
            var designMode = new String(element.ownerDocument.designMode).toLowerCase();
            if (designMode == "on") {
                // this must be a rich text control!
                element.innerHTML = actualValue;
            }
        }
    } else {
        element.value = actualValue;
    }
    // DGF this used to be skipped in chrome URLs, but no longer.  Is xpcnativewrappers to blame?
    try {
        bot.events.fire(element, bot.events.EventType.CHANGE);
    } catch (e) {}
};

BrowserBot.prototype.submit = function(formElement) {
    var actuallySubmit = true;
    this._modifyElementTarget(formElement);

    if (formElement.onsubmit) {
        if (browserVersion.isHTA) {
            // run the code in the correct window so alerts are handled correctly even in HTA mode
            var win = this.browserbot.getCurrentWindow();
            var now = new Date().getTime();
            var marker = 'marker' + now;
            win[marker] = formElement;
            win.setTimeout("var actuallySubmit = "+marker+".onsubmit();" +
                "if (actuallySubmit) { " +
                    marker+".submit(); " +
                    "if ("+marker+".target && !/^_/.test("+marker+".target)) {"+
                        "window.open('', "+marker+".target);"+
                    "}"+
                "};"+
                marker+"=null", 0);
            // pause for up to 2s while this command runs
            var terminationCondition = function () {
                return !win[marker];
            };
            return Selenium.decorateFunctionWithTimeout(terminationCondition, 2000);
        } else {
            actuallySubmit = formElement.onsubmit();
            if (actuallySubmit) {
                formElement.submit();
                if (formElement.target && !/^_/.test(formElement.target)) {
                    this.browserbot.openWindow('', formElement.target);
                }
            }
        }
    } else {
        formElement.submit();
    }
};

BrowserBot.prototype.clickElement = function(element, clientX, clientY) {
       this._fireEventOnElement("click", element, clientX, clientY);
};

BrowserBot.prototype.doubleClickElement = function(element, clientX, clientY) {
       this._fireEventOnElement("dblclick", element, clientX, clientY);
};

// The contextmenu event is fired when the user right-clicks to open the context menu
BrowserBot.prototype.contextMenuOnElement = function(element, clientX, clientY) {
       this._fireEventOnElement("contextmenu", element, clientX, clientY);
};

BrowserBot.prototype._modifyElementTarget = function(element) {
    if (element.target) {
        if (element.target == "_blank" || /^selenium_blank/.test(element.target) ) {
            var tagName = getTagName(element);
            if (tagName == "a" || tagName == "form") {
                var newTarget = "selenium_blank" + Math.round(100000 * Math.random());
                LOG.warn("Link has target '_blank', which is not supported in Selenium!  Randomizing target to be: " + newTarget);
                this.browserbot.openWindow('', newTarget);
                element.target = newTarget;
            }
        }
    }
};


BrowserBot.prototype._handleClickingImagesInsideLinks = function(targetWindow, element) {
    var itrElement = element;
    while (itrElement != null) {
        if (itrElement.href) {
            targetWindow.location.href = itrElement.href;
            break;
        }
        itrElement = itrElement.parentNode;
    }
};

BrowserBot.prototype._getTargetWindow = function(element) {
    var targetWindow = element.ownerDocument.defaultView;
    if (element.target) {
        targetWindow = this._getFrameFromGlobal(element.target);
    }
    return targetWindow;
};

BrowserBot.prototype._getFrameFromGlobal = function(target) {

    if (target == "_self") {
        return this.getCurrentWindow();
    }
    if (target == "_top") {
        return this.topFrame;
    } else if (target == "_parent") {
        return this.getCurrentWindow().parent;
    } else if (target == "_blank") {
        // TODO should this set cleverer window defaults?
        return this.getCurrentWindow().open('', '_blank');
    }
    var frameElement = this.findElementBy("implicit", target, this.topFrame.document, this.topFrame);
    if (frameElement) {
        return frameElement.contentWindow;
    }
    var win = this.getWindowByName(target);
    if (win) return win;
    return this.getCurrentWindow().open('', target);
};


BrowserBot.prototype.bodyText = function() {
    if (!this.getDocument().body) {
        throw new SeleniumError("Couldn't access document.body.  Is this HTML page fully loaded?");
    }
    return getText(this.getDocument().body);
};

BrowserBot.prototype.getAllButtons = function() {
    var elements = this.getDocument().getElementsByTagName('input');
    var result = [];

    for (var i = 0; i < elements.length; i++) {
        if (elements[i].type == 'button' || elements[i].type == 'submit' || elements[i].type == 'reset') {
            result.push(elements[i].id);
        }
    }

    return result;
};


BrowserBot.prototype.getAllFields = function() {
    var elements = this.getDocument().getElementsByTagName('input');
    var result = [];

    for (var i = 0; i < elements.length; i++) {
        if (elements[i].type == 'text') {
            result.push(elements[i].id);
        }
    }

    return result;
};

BrowserBot.prototype.getAllLinks = function() {
    var elements = this.getDocument().getElementsByTagName('a');
    var result = [];

    for (var i = 0; i < elements.length; i++) {
        result.push(elements[i].id);
    }

    return result;
};

function isDefined(value) {
    return typeof(value) != undefined;
};

BrowserBot.prototype.goBack = function() {
    this.getCurrentWindow().history.back();
};

BrowserBot.prototype.goForward = function() {
    this.getCurrentWindow().history.forward();
};

BrowserBot.prototype.close = function() {
    if (browserVersion.isIE) {
        // fix "do you want to close this window" warning in IE
        // You can only close windows that you have opened.
        // So, let's "open" it.
        try {
            this.topFrame.name=new Date().getTime();
            window.open("", this.topFrame.name, "");
            this.topFrame.close();
            return;
        } catch (e) {}
    }
    if (browserVersion.isChrome || browserVersion.isSafari || browserVersion.isOpera) {
        this.topFrame.close();
    } else {
        this.getCurrentWindow().eval("window.top.close();");
    }
};

BrowserBot.prototype.refresh = function() {
    this.getCurrentWindow().location.reload(true);
};

/**
 * Refine a list of elements using a filter.
 */
BrowserBot.prototype.selectElementsBy = function(filterType, filter, elements) {
    var filterFunction = BrowserBot.filterFunctions[filterType];
    if (! filterFunction) {
        throw new SeleniumError("Unrecognised element-filter type: '" + filterType + "'");
    }

    return filterFunction(filter, elements);
};

BrowserBot.filterFunctions = {};

BrowserBot.filterFunctions.name = function(name, elements) {
    var selectedElements = [];
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].name === name) {
            selectedElements.push(elements[i]);
        }
    }
    return selectedElements;
};

BrowserBot.filterFunctions.value = function(value, elements) {
    var selectedElements = [];
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].value === value) {
            selectedElements.push(elements[i]);
        }
    }
    return selectedElements;
};

BrowserBot.filterFunctions.index = function(index, elements) {
    index = Number(index);
    if (isNaN(index) || index < 0) {
        throw new SeleniumError("Illegal Index: " + index);
    }
    if (elements.length <= index) {
        throw new SeleniumError("Index out of range: " + index);
    }
    return [elements[index]];
};

BrowserBot.prototype.selectElements = function(filterExpr, elements, defaultFilterType) {

    var filterType = (defaultFilterType || 'value');

    // If there is a filter prefix, use the specified strategy
    var result = filterExpr.match(/^([A-Za-z]+)=(.+)/);
    if (result) {
        filterType = result[1].toLowerCase();
        filterExpr = result[2];
    }

    return this.selectElementsBy(filterType, filterExpr, elements);
};

/**
 * Find an element by class
 */
BrowserBot.prototype.locateElementByClass = function(locator, document) {
    return elementFindFirstMatchingChild(document,
            function(element) {
                return element.className == locator;
            }
            );
};

/**
 * Find an element by alt
 */
BrowserBot.prototype.locateElementByAlt = function(locator, document) {
    return elementFindFirstMatchingChild(document,
            function(element) {
                return element.alt == locator;
            }
            );
};

/**
 * Find an element by css selector
 */
BrowserBot.prototype.locateElementByCss = function(locator, document) {
    var elements = eval_css(locator, document);
    if (elements.length != 0)
        return elements[0];
    return null;
};

/**
 * This function is responsible for mapping a UI specifier string to an element
 * on the page, and returning it. If no element is found, null is returned.
 * Returning null on failure to locate the element is part of the undocumented
 * API for locator strategies.
 */
BrowserBot.prototype.locateElementByUIElement = function(locator, inDocument) {
    // offset locators are delimited by "->", which is much simpler than the
    // previous scheme involving detecting the close-paren.
    var locators = locator.split(/->/, 2);

    var locatedElement = null;
    var pageElements = UIMap.getInstance()
        .getPageElements(locators[0], inDocument);

    if (locators.length > 1) {
        for (var i = 0; i < pageElements.length; ++i) {
            var locatedElements = eval_locator(locators[1], inDocument,
                pageElements[i]);
            if (locatedElements.length) {
                locatedElement = locatedElements[0];
                break;
            }
        }
    }
    else if (pageElements.length) {
        locatedElement = pageElements[0];
    }

    return locatedElement;
};

BrowserBot.prototype.locateElementByUIElement.prefix = 'ui';

// define a function used to compare the result of a close UI element
// match with the actual interacted element. If they are close enough
// according to the heuristic, consider them a match.
/**
 * A heuristic function for comparing a node with a target node. Typically the
 * node is specified in a UI element definition, while the target node is
 * returned by the recorder as the leaf element which had some event enacted
 * upon it. This particular heuristic covers the case where the anchor element
 * contains other inline tags, such as "em" or "img".
 *
 * @param node    the node being compared to the target node
 * @param target  the target node
 * @return        true if node equals target, or if node is a link
 *                element and target is its descendant, or if node has
 *                an onclick attribute and target is its descendant.
 *                False otherwise.
 */
BrowserBot.prototype.locateElementByUIElement.is_fuzzy_match = function(node, target) {
    try {
        var isMatch = (
            (node == target) ||
            ((node.nodeName == 'A' || node.onclick) && is_ancestor(node, target))
        );
        return isMatch;
    }
    catch (e) {
        return false;
    }
};

/*****************************************************************/
/* BROWSER-SPECIFIC FUNCTIONS ONLY AFTER THIS LINE */

function MozillaBrowserBot(frame) {
    BrowserBot.call(this, frame);
}
objectExtend(MozillaBrowserBot.prototype, BrowserBot.prototype);

function KonquerorBrowserBot(frame) {
    BrowserBot.call(this, frame);
}
objectExtend(KonquerorBrowserBot.prototype, BrowserBot.prototype);

KonquerorBrowserBot.prototype.setIFrameLocation = function(iframe, location) {
    // Window doesn't fire onload event when setting src to the current value,
    // so we set it to blank first.
    iframe.src = "about:blank";
    iframe.src = location;
};

KonquerorBrowserBot.prototype.setOpenLocation = function(win, loc) {
    // Window doesn't fire onload event when setting src to the current value,
    // so we just refresh in that case instead.
    loc = absolutify(loc, this.baseUrl);
    loc = canonicalize(loc);
    var startUrl = win.location.href;
    if ("about:blank" != win.location.href) {
        var startLoc = parseUrl(win.location.href);
        startLoc.hash = null;
        startUrl = reassembleLocation(startLoc);
    }
    LOG.debug("startUrl="+startUrl);
    LOG.debug("win.location.href="+win.location.href);
    LOG.debug("loc="+loc);
    if (startUrl == loc) {
        LOG.debug("opening exact same location");
        this.refresh();
    } else {
        LOG.debug("locations differ");
        win.location.href = loc;
    }
    // force the current polling thread to detect a page load
    var marker = this.isPollingForLoad(win);
    if (marker) {
        delete win.location[marker];
    }
};

KonquerorBrowserBot.prototype._isSameDocument = function(originalDocument, currentDocument) {
    // under Konqueror, there may be this case:
    // originalDocument and currentDocument are different objects
    // while their location are same.
    if (originalDocument) {
        return originalDocument.location == currentDocument.location;
    } else {
        return originalDocument === currentDocument;
    }
};

function SafariBrowserBot(frame) {
    BrowserBot.call(this, frame);
}
objectExtend(SafariBrowserBot.prototype, BrowserBot.prototype);

SafariBrowserBot.prototype.setIFrameLocation = KonquerorBrowserBot.prototype.setIFrameLocation;
SafariBrowserBot.prototype.setOpenLocation = KonquerorBrowserBot.prototype.setOpenLocation;


function OperaBrowserBot(frame) {
    BrowserBot.call(this, frame);
};
objectExtend(OperaBrowserBot.prototype, BrowserBot.prototype);
OperaBrowserBot.prototype.setIFrameLocation = function(iframe, location) {
    if (iframe.src == location) {
        iframe.src = location + '?reload';
    } else {
        iframe.src = location;
    }
};

function IEBrowserBot(frame) {
    BrowserBot.call(this, frame);
};
objectExtend(IEBrowserBot.prototype, BrowserBot.prototype);

IEBrowserBot.prototype._handleClosedSubFrame = function(testWindow, doNotModify) {
    if (this.proxyInjectionMode) {
        return testWindow;
    }

    try {
        testWindow.location.href;
        this.permDenied = 0;
    } catch (e) {
        this.permDenied++;
    }
    if (this._windowClosed(testWindow) || this.permDenied > 4) {
        if (this.isSubFrameSelected) {
            LOG.warn("Current subframe appears to have closed; selecting top frame");
            this.selectFrame("relative=top");
            return this.getCurrentWindow(doNotModify);
        } else {
            var closedError = new SeleniumError("Current window or frame is closed!");
            closedError.windowClosed = true;
            throw closedError;
        }
    }
    return testWindow;
};

IEBrowserBot.prototype.modifyWindowToRecordPopUpDialogs = function(windowToModify, browserBot) {
    BrowserBot.prototype.modifyWindowToRecordPopUpDialogs(windowToModify, browserBot);

    // we will call the previous version of this method from within our own interception
    oldShowModalDialog = windowToModify.showModalDialog;

    windowToModify.showModalDialog = function(url, args, features) {
        // Get relative directory to where TestRunner.html lives
        // A risky assumption is that the user's TestRunner is named TestRunner.html
        var doc_location = document.location.toString();
        var end_of_base_ref = doc_location.indexOf('TestRunner.html');
        var base_ref = doc_location.substring(0, end_of_base_ref);
        var runInterval = '';

        // Only set run interval if options is defined
        if (typeof(window.runOptions) != 'undefined') {
            runInterval = "&runInterval=" + runOptions.runInterval;
        }

        var testRunnerURL = "TestRunner.html?auto=true&singletest="
            + escape(browserBot.modalDialogTest)
            + "&autoURL="
            + escape(url)
            + runInterval;
        var fullURL = base_ref + testRunnerURL;
        browserBot.modalDialogTest = null;

        // If using proxy injection mode
        if (this.proxyInjectionMode) {
            var sessionId = runOptions.getSessionId();
            if (sessionId == undefined) {
                sessionId = injectedSessionId;
            }
            if (sessionId != undefined) {
                LOG.debug("Invoking showModalDialog and injecting URL " + fullURL);
            }
            fullURL = url;
        }
        var returnValue = oldShowModalDialog(fullURL, args, features);
        return returnValue;
    };
};

IEBrowserBot.prototype.modifySeparateTestWindowToDetectPageLoads = function(windowObject) {
    this.pageUnloading = false;
    var self = this;
    var pageUnloadDetector = function() {
        self.pageUnloading = true;
    };
    if (windowObject.addEventListener) {
      windowObject.addEventListener('beforeunload', pageUnloadDetector, true);
    } else {
      windowObject.attachEvent('onbeforeunload', pageUnloadDetector);
    }
    BrowserBot.prototype.modifySeparateTestWindowToDetectPageLoads.call(this, windowObject);
};

IEBrowserBot.prototype.pollForLoad = function(loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker) {
    LOG.debug("IEBrowserBot.pollForLoad: " + marker);
    if (!this.permDeniedCount[marker]) this.permDeniedCount[marker] = 0;
    BrowserBot.prototype.pollForLoad.call(this, loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker);
    var self;
    if (this.pageLoadError) {
        if (this.pageUnloading) {
            self = this;
            LOG.debug("pollForLoad UNLOADING (" + marker + "): caught exception while firing events on unloading page: " + this.pageLoadError.message);
            this.reschedulePoller(loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker);
            this.pageLoadError = null;
            return;
        } else if (((this.pageLoadError.message == "Permission denied") || (/^Access is denied/.test(this.pageLoadError.message)))
                && this.permDeniedCount[marker]++ < 8) {
            if (this.permDeniedCount[marker] > 4) {
                var canAccessThisWindow;
                var canAccessCurrentlySelectedWindow;
                try {
                    windowObject.location.href;
                    canAccessThisWindow = true;
                } catch (e) {}
                try {
                    this.getCurrentWindow(true).location.href;
                    canAccessCurrentlySelectedWindow = true;
                } catch (e) {}
                if (canAccessCurrentlySelectedWindow & !canAccessThisWindow) {
                    LOG.debug("pollForLoad (" + marker + ") ABORTING: " + this.pageLoadError.message + " (" + this.permDeniedCount[marker] + "), but the currently selected window is fine");
                    // returning without rescheduling
                    this.pageLoadError = null;
                    return;
                }
            }

            self = this;
            LOG.debug("pollForLoad (" + marker + "): " + this.pageLoadError.message + " (" + this.permDeniedCount[marker] + "), waiting to see if it goes away");
            this.reschedulePoller(loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker);
            this.pageLoadError = null;
            return;
        }
        //handy for debugging!
        //throw this.pageLoadError;
    }
};

IEBrowserBot.prototype._windowClosed = function(win) {
    try {
        var c = win.closed;
        // frame windows claim to be non-closed when their parents are closed
        // but you can't access their document objects in that case
        if (!c) {
            try {
                win.document;
            } catch (de) {
                if (de.message == "Permission denied") {
                    // the window is probably unloading, which means it's probably not closed yet
                    return false;
                }
                else if (/^Access is denied/.test(de.message)) {
                    // rare variation on "Permission denied"?
                    LOG.debug("IEBrowserBot.windowClosed: got " + de.message + " (this.pageUnloading=" + this.pageUnloading + "); assuming window is unloading, probably not closed yet");
                    return false;
                } else {
                    // this is probably one of those frame window situations
                    LOG.debug("IEBrowserBot.windowClosed: couldn't read win.document, assume closed: " + de.message + " (this.pageUnloading=" + this.pageUnloading + ")");
                    return true;
                }
            }
        }
        if (c == null) {
            LOG.debug("IEBrowserBot.windowClosed: win.closed was null, assuming closed");
            return true;
        }
        return c;
    } catch (e) {
        LOG.debug("IEBrowserBot._windowClosed: Got an exception trying to read win.closed; we'll have to take a guess!");

        if (browserVersion.isHTA) {
            if (e.message == "Permission denied") {
                // the window is probably unloading, which means it's not closed yet
                return false;
            } else {
                // there's a good chance that we've lost contact with the window object if it is closed
                return true;
            }
        } else {
            // the window is probably unloading, which means it's not closed yet
            return false;
        }
    }
};

/**
 * In IE, getElementById() also searches by name - this is an optimisation for IE.
 */
IEBrowserBot.prototype.locateElementByIdentifer = function(identifier, inDocument, inWindow) {
    return inDocument.getElementById(identifier);
};

SafariBrowserBot.prototype.modifyWindowToRecordPopUpDialogs = function(windowToModify, browserBot) {
    BrowserBot.prototype.modifyWindowToRecordPopUpDialogs(windowToModify, browserBot);

    var originalOpen = windowToModify.open;
    /*
     * Safari seems to be broken, so that when we manually trigger the onclick method
     * of a button/href, any window.open calls aren't resolved relative to the app location.
     * So here we replace the open() method with one that does resolve the url correctly.
     */
    windowToModify.open = function(url, windowName, windowFeatures, replaceFlag) {

        if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
            return originalOpen(url, windowName, windowFeatures, replaceFlag);
        }

        // Reduce the current path to the directory
        var currentPath = windowToModify.location.pathname || "/";
        currentPath = currentPath.replace(/\/[^\/]*$/, "/");

        // Remove any leading "./" from the new url.
        url = url.replace(/^\.\//, "");

        newUrl = currentPath + url;

        var openedWindow = originalOpen(newUrl, windowName, windowFeatures, replaceFlag);
        LOG.debug("window.open call intercepted; window ID (which you can use with selectWindow()) is \"" +  windowName + "\"");
        if (windowName!=null) {
            openedWindow["seleniumWindowName"] = windowName;
        }
        return openedWindow;
    };
};

MozillaBrowserBot.prototype._fireEventOnElement = function(eventType, element, clientX, clientY) {
    var win = this.getCurrentWindow();
    bot.events.fire(element, bot.events.EventType.FOCUS);

    // Add an event listener that detects if the default action has been prevented.
    // (This is caused by a javascript onclick handler returning false)
    // we capture the whole event, rather than the getPreventDefault() state at the time,
    // because we need to let the entire event bubbling and capturing to go through
    // before making a decision on whether we should force the href
    var savedEvent = null;

    element.addEventListener(eventType, function(evt) {
        savedEvent = evt;
    }, false);

    this._modifyElementTarget(element);

    // Trigger the event.
    this.browserbot.triggerMouseEvent(element, eventType, true, clientX, clientY);

    if (this._windowClosed(win)) {
        return;
    }

    // Perform the link action if preventDefault was set.
    // In chrome URL, the link action is already executed by triggerMouseEvent.
    if (!browserVersion.isChrome && savedEvent != null && savedEvent.getPreventDefault && !savedEvent.getPreventDefault()) {
        var targetWindow = this.browserbot._getTargetWindow(element);
        if (element.href) {
            targetWindow.location.href = element.href;
        } else {
            this.browserbot._handleClickingImagesInsideLinks(targetWindow, element);
        }
    }

};


OperaBrowserBot.prototype._fireEventOnElement = function(eventType, element, clientX, clientY) {
    var win = this.getCurrentWindow();
    bot.events.fire(element, bot.events.EventType.FOCUS);

    this._modifyElementTarget(element);

    // Trigger the click event.
    this.browserbot.triggerMouseEvent(element, eventType, true, clientX, clientY);

    if (this._windowClosed(win)) {
        return;
    }

};


KonquerorBrowserBot.prototype._fireEventOnElement = function(eventType, element, clientX, clientY) {
    var win = this.getCurrentWindow();
    bot.events.fire(element, bot.events.EventType.FOCUS);

    this._modifyElementTarget(element);

    if (element[eventType]) {
        element[eventType]();
    }
    else {
        this.browserbot.triggerMouseEvent(element, eventType, true, clientX, clientY);
    }

    if (this._windowClosed(win)) {
        return;
    }

};

SafariBrowserBot.prototype._fireEventOnElement = function(eventType, element, clientX, clientY) {
    bot.events.fire(element, bot.events.EventType.FOCUS);
    var wasChecked = element.checked;

    this._modifyElementTarget(element);

    // For form element it is simple.
    if (element[eventType]) {
        element[eventType]();
    }
    // For links and other elements, event emulation is required.
    else {
        var targetWindow = this.browserbot._getTargetWindow(element);
        // todo: deal with anchors?
        this.browserbot.triggerMouseEvent(element, eventType, true, clientX, clientY);

    }

};

SafariBrowserBot.prototype.refresh = function() {
    var win = this.getCurrentWindow();
    if (win.location.hash) {
        // DGF Safari refuses to refresh when there's a hash symbol in the URL
        win.location.hash = "";
        var actuallyReload = function() {
            win.location.reload(true);
        };
        window.setTimeout(actuallyReload, 1);
    } else {
        win.location.reload(true);
    }
};

IEBrowserBot.prototype._fireEventOnElement = function(eventType, element, clientX, clientY) {
    var win = this.getCurrentWindow();
    bot.events.fire(element, bot.events.EventType.FOCUS);

    var wasChecked = element.checked;

    // Set a flag that records if the page will unload - this isn't always accurate, because
    // <a href="javascript:alert('foo'):"> triggers the onbeforeunload event, even thought the page won't unload
    var pageUnloading = false;
    var pageUnloadDetector = function() {
        pageUnloading = true;
    };
    if (win.addEventListener) {
      win.addEventListener('beforeunload', pageUnloadDetector, true);
    } else {
      win.attachEvent('onbeforeunload', pageUnloadDetector);
    }
    this._modifyElementTarget(element);
    if (element[eventType]) {
        element[eventType]();
    }
    else {
        this.browserbot.triggerMouseEvent(element, eventType, true, clientX, clientY);
    }


    // If the page is going to unload - still attempt to fire any subsequent events.
    // However, we can't guarantee that the page won't unload half way through, so we need to handle exceptions.
    try {
        if (win.removeEventListener) {
            win.removeEventListener('onbeforeunload', pageUnloadDetector, true);
        } else {
            win.detachEvent('onbeforeunload', pageUnloadDetector);
        }

        if (this._windowClosed(win)) {
            return;
        }

        // Onchange event is not triggered automatically in IE.
        if (isDefined(element.checked) && wasChecked != element.checked) {
            bot.events.fire(element, bot.events.EventType.CHANGE);
        }

    }
    catch (e) {
        // If the page is unloading, we may get a "Permission denied" or "Unspecified error".
        // Just ignore it, because the document may have unloaded.
        if (pageUnloading) {
            LOG.logHook = function() {
            };
            LOG.warn("Caught exception when firing events on unloading page: " + e.message);
            return;
        }
        throw e;
    }
};
