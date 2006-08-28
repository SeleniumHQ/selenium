/*
* Copyright 2004 ThoughtWorks, Inc
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
*
*/

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

var BrowserBot = function(win) {
    this.topWindow = win;
    this.window = this.topWindow;

    // the buttonWindow is the Selenium window
    // it contains the Run/Pause buttons... this should *not* be the AUT window
    this.buttonWindow = this.topWindow;
    // not sure what this is used for
    this.currentPage = null;
    this.currentWindow = this.topWindow;
    this.currentWindowName = null;

    this.windowPollers = new Array();
    this.modalDialogTest = null;
    this.recordedAlerts = new Array();
    this.recordedConfirmations = new Array();
    this.recordedPrompts = new Array();
    this.openedWindows = {};
    this.nextConfirmResult = true;
    this.nextPromptResult = '';
    this.newPageLoaded = false;
    this.pageLoadError = null;
    this.uniqueId = new Date().getTime();
    this.pollingForLoad = new Object();


    var self = this;
    this.recordPageLoad = function() {
        LOG.info("Page load detected");
        try {
            LOG.info("Page load location=" + self.getCurrentWindow(true).location);
        } catch (e) {
            self.pageLoadError = e;
            return;
        }
        self.currentPage = null;
        self.newPageLoaded = true;
    };

    this.isNewPageLoaded = function() {
        if (this.pageLoadError) {
            var e = this.pageLoadError;
            this.pageLoadError = null;
            throw e;
        }
        return self.newPageLoaded;
    };
};

BrowserBot.createForWindow = function(window) {
    var browserbot;
    LOG.info('createForWindow');
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
        LOG.info("Using MozillaBrowserBot")
        // Use mozilla by default
        browserbot = new MozillaBrowserBot(window);
    }

    browserbot.getCurrentWindow();
    return browserbot;
};

BrowserBot.prototype.doModalDialogTest = function(test) {
    this.modalDialogTest = test;
};

BrowserBot.prototype.cancelNextConfirmation = function() {
    this.nextConfirmResult = false;
};

BrowserBot.prototype.setNextPromptResult = function(result) {
    this.nextPromptResult = result;
};

BrowserBot.prototype.hasAlerts = function() {
    return (this.recordedAlerts.length > 0);
};

BrowserBot.prototype.relayBotToRC = function() {
};
// override in injection.html

BrowserBot.prototype.getNextAlert = function() {
    var t = this.recordedAlerts.shift();
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

BrowserBot.prototype.windowClosed = function(win) {
    var c = win.closed;
    if (c == null) return true;
    return c;
};

BrowserBot.prototype.modifyWindow = function(win) {
    if (this.windowClosed(win)) {
        LOG.error("modifyWindow: Window was closed!");
        return null;
    }
    LOG.info('modifyWindow ' + this.uniqueId + ":" + win[this.uniqueId]);
    if (!win[this.uniqueId]) {
        win[this.uniqueId] = true;
        this.modifyWindowToRecordPopUpDialogs(win, this);
        this.currentPage = PageBot.createForWindow(win, this);
        this.newPageLoaded = false;
    }
    this.modifySeparateTestWindowToDetectPageLoads(win);
    return win;
};

BrowserBot.prototype.selectWindow = function(target) {
    // we've moved to a new page - clear the current one
    this.currentPage = null;
    this.currentWindowName = null;
    this.currentWindow = this.window;
    if (target && target != "null") {
        this.currentWindow = this.getWindowByName(target);
        this.currentWindowName = target;
    }
};

BrowserBot.prototype.makeThisTheDefaultWindow = function() {
    this.window = this.getCurrentWindow();
    this.selectWindow();
};

BrowserBot.prototype.selectFrame = function(target) {
    if (target == "relative=up") {
        this.currentWindow = this.getCurrentWindow().parent;
    } else if (target == "relative=top") {
        this.currentWindow = this.topWindow;
    } else {
        var frame = this.getCurrentPage().findElement(target);
        if (frame == null) {
            throw new SeleniumError("Not found: " + target);
        }
        // now, did they give us a frame or a frame ELEMENT?
        if (frame.contentWindow) {
            // this must be a frame element
            this.currentWindow = frame.contentWindow;
        } else if (frame.document) {
            // must be an actual window frame
            this.currentWindow = frame;
        } else {
            // neither
            throw new SeleniumError("Not a frame: " + target);
        }
    }
    this.currentPage = null;
};

BrowserBot.prototype.openLocation = function(target) {
    // We're moving to a new page - clear the current one
    var win = this.getCurrentWindow();
    LOG.info("openLocation newPageLoaded = false");
    this.currentPage = null;
    this.newPageLoaded = false;

    this.setOpenLocation(win, target);
};

BrowserBot.prototype.setIFrameLocation = function(iframe, location) {
    iframe.src = location;
};

BrowserBot.prototype.setOpenLocation = function(win, loc) {

    // is there a Permission Denied risk here? setting a timeout breaks Firefox
    //win.setTimeout(function() { win.location.href = loc; }, 0);
    win.location.href = loc;
};

BrowserBot.prototype.getCurrentPage = function() {
    if (this.currentPage == null) {
        var testWindow = this.getCurrentWindow();
        this.currentPage = PageBot.createForWindow(testWindow, this);
        this.newPageLoaded = false;
    }

    return this.currentPage;
};

BrowserBot.prototype.modifyWindowToRecordPopUpDialogs = function(windowToModify, browserBot) {
    var self = this;
    windowToModify.alert = function(alert) {
        browserBot.recordedAlerts.push(alert);
        self.relayBotToRC("browserbot.recordedAlerts");
    };

    windowToModify.confirm = function(message) {
        browserBot.recordedConfirmations.push(message);
        var result = browserBot.nextConfirmResult;
        browserBot.nextConfirmResult = true;
        self.relayBotToRC("browserbot.recordedConfirmations");
        return result;
    };

    windowToModify.prompt = function(message) {
        browserBot.recordedPrompts.push(message);
        var result = !browserBot.nextConfirmResult ? null : browserBot.nextPromptResult;
        browserBot.nextConfirmResult = true;
        browserBot.nextPromptResult = '';
        self.relayBotToRC("browserbot.recordedPrompts");
        return result;
    };

    // Keep a reference to all popup windows by name
    // note that in IE the "windowName" argument must be a valid javascript identifier, it seems.
    var originalOpen = windowToModify.open;
    windowToModify.open = function(url, windowName, windowFeatures, replaceFlag) {
        var openedWindow = originalOpen(url, windowName, windowFeatures, replaceFlag);
        selenium.browserbot.openedWindows[windowName] = openedWindow;
        return openedWindow;
    };
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
    if (this.windowClosed(windowObject)) {
        LOG.info("modifySeparateTestWindowToDetectPageLoads: windowObject was closed");
        return;
    }
    var oldMarker = this.isPollingForLoad(windowObject);
    if (oldMarker) {
        LOG.info("modifySeparateTestWindowToDetectPageLoads: already polling this window: " + oldMarker);
        return;
    }

    var marker = 'selenium' + new Date().getTime();
    LOG.info("Starting pollForLoad (" + marker + "): " + windowObject.document.location);
    this.pollingForLoad[marker] = true;
    // if this is a frame, add a load listener, otherwise, attach a poller
    if (this.getFrameElement(windowObject)) {
        LOG.info("modifySeparateTestWindowToDetectPageLoads: this window is a frame; attaching a load listener");
        addLoadListener(windowObject.frameElement, this.recordPageLoad);
        windowObject.frameElement[marker] = true;
        windowObject.frameElement[this.uniqueId] = marker;
    } else {
        windowObject.document.location[marker] = true;
        windowObject[this.uniqueId] = marker;
        this.pollForLoad(this.recordPageLoad, windowObject, windowObject.document, windowObject.location, windowObject.location.href, marker);
    }
};

BrowserBot.prototype.getFrameElement = function(win) {
    var frameElement = null;
    try {
        frameElement = win.frameElement;
    } catch (e) {
    } // on IE, checking frameElement on a pop-up results in a "No such interface supported" exception
    return frameElement;
}

/**
 * Set up a polling timer that will keep checking the readyState of the document until it's complete.
 * Since we might call this before the original page is unloaded, we first check to see that the current location
 * or href is different from the original one.
 */
BrowserBot.prototype.pollForLoad = function(loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker) {
    LOG.info("pollForLoad original (" + marker + "): " + originalHref);
    var currentDocument;
    var currentLocation;
    var currentHref;
    var sameDoc;
    var sameLoc;
    var sameHref;
    var rs;
    var markedLoc;
    try {
        if (this.windowClosed(windowObject)) {
            LOG.info("pollForLoad WINDOW CLOSED (" + marker + ")");
            delete this.pollingForLoad[marker];
            return;
        }

        currentDocument = windowObject.document;
        currentLocation = windowObject.location;
        currentHref = currentLocation.href

        sameDoc = (originalDocument === currentDocument);
        sameLoc = (originalLocation === currentLocation);
        sameHref = (originalHref === currentHref);
        rs = this.getReadyState(windowObject, currentDocument);
        markedLoc = currentLocation[marker];

        if (browserVersion.isKonqueror || browserVersion.isSafari) {
            // the mark disappears too early on these browsers
            markedLoc = true;
        }

        if (!(sameDoc && sameLoc && sameHref && markedLoc) && rs == 'complete') {
            LOG.info("pollForLoad FINISHED (" + marker + "): " + rs + " (" + currentHref + ")");
            delete this.pollingForLoad[marker];
            this.modifyWindow(windowObject);
            var newMarker = this.isPollingForLoad(windowObject);
            if (!newMarker) {
                LOG.debug("modifyWindow didn't start new poller: " + newMarker);
                this.modifySeparateTestWindowToDetectPageLoads(windowObject);
            }
            newMarker = this.isPollingForLoad(windowObject);
            LOG.info("pollForLoad (" + marker + ") restarting " + newMarker);
            if (/(TestRunner-splash|Blank)\.html\?start=true$/.test(currentHref)) {
                LOG.info("pollForLoad Oh, it's just the starting page.  Never mind!");
            } else if (this.currentWindow[this.uniqueId] == newMarker) {
                loadFunction();
            } else {
                LOG.info("pollForLoad page load detected in non-current window; ignoring");
            }
            return;
        }
        LOG.info("pollForLoad continue (" + marker + "): " + currentHref);
        this.reschedulePoller(loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker);
    } catch (e) {
        LOG.error("Exception during pollForLoad; this should get noticed soon (" + e.message + ")!");
        LOG.exception(e);
        this.pageLoadError = e;
    }
};

BrowserBot.prototype.getReadyState = function(windowObject, currentDocument) {
    var rs = currentDocument.readyState;
    if (rs == null) {
        if (this.buttonWindow.document.readyState == null) {
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
                LOG.info("getReadyState = windowObject.frames.length = " + windowObject.frames.length);
                for (var i = 0; i < windowObject.frames.length; i++) {
                    LOG.info("i = " + i);
                    if (this.getReadyState(windowObject.frames[i], windowObject.frames[i].document) != 'complete') {
                        LOG.info("getReadyState aha! the nested frame " + windowObject.frames[i].name + " wasn't ready!");
                        return null;
                    }
                }

                rs = 'complete';
            } else {
                LOG.info("pollForLoad readyState was null and DOM appeared to not be ready yet");
            }
        }
    }
    else if (rs == "loading" && browserVersion.isIE) {
        LOG.info("pageUnloading = true!!!!");
        this.pageUnloading = true;
    }
    LOG.info("getReadyState returning " + rs);
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
    var oldPollers = this.windowPollers;
    this.windowPollers = new Array();
    for (var i = 0; i < oldPollers.length; i++) {
        oldPollers[i].call();
    }
};

BrowserBot.prototype.isPollingForLoad = function(win) {
    var marker;
    if (this.getFrameElement(win)) {
        marker = win.frameElement[this.uniqueId];
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
        targetWindow = this.window[windowName];
    }
    if (!targetWindow) {
        throw new SeleniumError("Window does not exist");
    }
    if (!doNotModify) {
        this.modifyWindow(targetWindow);
    }
    return targetWindow;
};

BrowserBot.prototype.getCurrentWindow = function(doNotModify) {
    var testWindow = this.currentWindow;
    if (!doNotModify) {
        this.modifyWindow(testWindow);
    }
    return testWindow;
};

function MozillaBrowserBot(frame) {
    BrowserBot.call(this, frame);
}
MozillaBrowserBot.prototype = new BrowserBot;

function KonquerorBrowserBot(frame) {
    BrowserBot.call(this, frame);
}
KonquerorBrowserBot.prototype = new BrowserBot;

KonquerorBrowserBot.prototype.setIFrameLocation = function(iframe, location) {
    // Window doesn't fire onload event when setting src to the current value,
    // so we set it to blank first.
    iframe.src = "about:blank";
    iframe.src = location;
};

KonquerorBrowserBot.prototype.setOpenLocation = function(win, loc) {
    // Window doesn't fire onload event when setting src to the current value,
    // so we set it to blank first.
    win.location.href = "about:blank";
    win.location.href = loc;
    // force the current polling thread to detect a page load
    var marker = this.isPollingForLoad(win);
    if (marker) {
        delete win.location[marker];
    }
};

function SafariBrowserBot(frame) {
    BrowserBot.call(this, frame);
}
SafariBrowserBot.prototype = new BrowserBot;

SafariBrowserBot.prototype.setIFrameLocation = KonquerorBrowserBot.prototype.setIFrameLocation;
SafariBrowserBot.prototype.setOpenLocation = KonquerorBrowserBot.prototype.setOpenLocation;


function OperaBrowserBot(frame) {
    BrowserBot.call(this, frame);
}
OperaBrowserBot.prototype = new BrowserBot;
OperaBrowserBot.prototype.setIFrameLocation = function(iframe, location) {
    if (iframe.src == location) {
        iframe.src = location + '?reload';
    } else {
        iframe.src = location;
    }
}

function IEBrowserBot(frame) {
    BrowserBot.call(this, frame);
}
IEBrowserBot.prototype = new BrowserBot;

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

        var fullURL = base_ref + "TestRunner.html?singletest=" + escape(browserBot.modalDialogTest) + "&autoURL=" + escape(url) + "&runInterval=" + runInterval;
        browserBot.modalDialogTest = null;

        var returnValue = oldShowModalDialog(fullURL, args, features);
        return returnValue;
    };
};

IEBrowserBot.prototype.modifySeparateTestWindowToDetectPageLoads = function(windowObject) {
    this.pageUnloading = false;
    this.permDeniedCount = 0;
    var self = this;
    var pageUnloadDetector = function() {
        self.pageUnloading = true;
    };
    windowObject.attachEvent("onbeforeunload", pageUnloadDetector);
    BrowserBot.prototype.modifySeparateTestWindowToDetectPageLoads.call(this, windowObject);
};

IEBrowserBot.prototype.pollForLoad = function(loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker) {
    BrowserBot.prototype.pollForLoad.call(this, loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker);
    if (this.pageLoadError) {
        if (this.pageUnloading) {
            var self = this;
            LOG.warn("pollForLoad UNLOADING (" + marker + "): caught exception while firing events on unloading page: " + this.pageLoadError.message);
            this.reschedulePoller(loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker);
            this.pageLoadError = null;
            return;
        } else if (((this.pageLoadError.message == "Permission denied") || (/^Access is denied/.test(this.pageLoadError.message)))
                && this.permDeniedCount++ < 4) {
            var self = this;
            LOG.warn("pollForLoad (" + marker + "): " + this.pageLoadError.message + " (" + this.permDeniedCount + "), waiting to see if it goes away");
            this.reschedulePoller(loadFunction, windowObject, originalDocument, originalLocation, originalHref, marker);
            this.pageLoadError = null;
            return;
        }
        //handy for debugging!
        //throw this.pageLoadError;
    }
};

IEBrowserBot.prototype.windowClosed = function(win) {
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
        // Got an exception trying to read win.closed; we'll have to take a guess!
        if (browserVersion.isHTA) {
            if (e.message == "Permission denied") {
                // the window is probably unloading, which means it's probably not closed yet
                return false;
            } else {
                // there's a good chance that we've lost contact with the window object if it is closed
                return true;
            }
        } else {
            // the window is probably unloading, which means it's probably not closed yet
            return false;
        }
    }
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

        return originalOpen(newUrl, windowName, windowFeatures, replaceFlag);
    };
};

var PageBot = function(pageWindow, browserbot) {
    this.title = function() {
        var t = this.document().title;
        if (typeof(t) == "string") {
            t = t.trim();
        }
        return t;
    }

    this.browserbot = browserbot;

    this.document = function() {
        return this.currentWindow().document;
    }

    this.currentWindow = function() {
        return this.browserbot.getCurrentWindow();
    }




    // Register all locateElementBy* functions
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

PageBot.createForWindow = function(windowObject, browserbot) {
    if (browserVersion.isIE) {
        return new IEPageBot(windowObject, browserbot);
    }
    else if (browserVersion.isKonqueror) {
        return new KonquerorPageBot(windowObject, browserbot);
    }
    else if (browserVersion.isSafari) {
        return new SafariPageBot(windowObject, browserbot);
    }
    else if (browserVersion.isOpera) {
        return new OperaPageBot(windowObject, browserbot);
    }
    else {
        LOG.info("Using MozillaPageBot")
        // Use mozilla by default
        return new MozillaPageBot(windowObject, browserbot);
    }
};

var MozillaPageBot = function(pageWindow, browserbot) {
    PageBot.call(this, pageWindow, browserbot);
};
MozillaPageBot.prototype = new PageBot();

var KonquerorPageBot = function(pageWindow, browserbot) {
    PageBot.call(this, pageWindow, browserbot);
};
KonquerorPageBot.prototype = new PageBot();

var SafariPageBot = function(pageWindow, browserbot) {
    PageBot.call(this, pageWindow, browserbot);
};
SafariPageBot.prototype = new PageBot();

var IEPageBot = function(pageWindow, browserbot) {
    PageBot.call(this, pageWindow, browserbot);
};
IEPageBot.prototype = new PageBot();

var OperaPageBot = function(pageWindow, browserbot) {
    PageBot.call(this, pageWindow, browserbot);
};
OperaPageBot.prototype = new PageBot();

/*
* Finds an element on the current page, using various lookup protocols
*/
PageBot.prototype.findElement = function(locator) {
    var locatorType = 'implicit';
    var locatorString = locator;

    // If there is a locator prefix, use the specified strategy
    var result = locator.match(/^([A-Za-z]+)=(.+)/);
    if (result) {
        locatorType = result[1].toLowerCase();
        locatorString = result[2];
    }

    var element = this.findElementBy(locatorType, locatorString, this.document(), this.currentWindow());
    if (element != null) {
        return this.highlight(element);
    }
    for (var i = 0; i < this.currentWindow().frames.length; i++) {
        element = this.findElementBy(locatorType, locatorString, this.currentWindow().frames[i].document, this.currentWindow().frames[i]);
        if (element != null) {
            return this.highlight(element);
        }
    }

    // Element was not found by any locator function.
    throw new SeleniumError("Element " + locator + " not found");
};

PageBot.prototype.highlight = function (element) {
    if (shouldHighlightLocatedElement) {
        Effect.highlight(element);
    }
    return element;
}

// as a static variable.
var shouldHighlightLocatedElement = false;

PageBot.prototype.setHighlightElement = function (shouldHighlight) {
    shouldHighlightLocatedElement = shouldHighlight;
}

/**
 * In non-IE browsers, getElementById() does not search by name.  Instead, we
 * we search separately by id and name.
 */
PageBot.prototype.locateElementByIdentifier = function(identifier, inDocument, inWindow) {
    return PageBot.prototype.locateElementById(identifier, inDocument, inWindow)
            || PageBot.prototype.locateElementByName(identifier, inDocument, inWindow)
            || null;
};

/**
 * In IE, getElementById() also searches by name - this is an optimisation for IE.
 */
IEPageBot.prototype.locateElementByIdentifer = function(identifier, inDocument, inWindow) {
    return inDocument.getElementById(identifier);
};

/**
 * Find the element with id - can't rely on getElementById, coz it returns by name as well in IE..
 */
PageBot.prototype.locateElementById = function(identifier, inDocument, inWindow) {
    var element = inDocument.getElementById(identifier);
    if (element && element.id === identifier) {
        return element;
    }
    else {
        return null;
    }
};

/**
 * Find an element by name, refined by (optional) element-filter
 * expressions.
 */
PageBot.prototype.locateElementByName = function(locator, document, inWindow) {
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
PageBot.prototype.locateElementByDomTraversal = function(domTraversal, inDocument, inWindow) {

    var element = null;
    try {
        if (browserVersion.isOpera) {
            element = inWindow.eval(domTraversal);
        } else {
            element = eval("inWindow." + domTraversal);
        }
    } catch (e) {
        e.isSeleniumError = true;
        throw e;
    }

    if (!element) {
        return null;
    }

    return element;
};
PageBot.prototype.locateElementByDomTraversal.prefix = "dom";

/**
 * Finds an element identified by the xpath expression. Expressions _must_
 * begin with "//".
 */
PageBot.prototype.locateElementByXPath = function(xpath, inDocument, inWindow) {

    // Trim any trailing "/": not valid xpath, and remains from attribute
    // locator.
    if (xpath.charAt(xpath.length - 1) == '/') {
        xpath = xpath.slice(0, -1);
    }

    // Handle //tag
    var match = xpath.match(/^\/\/(\w+|\*)$/);
    if (match) {
        var elements = inDocument.getElementsByTagName(match[1].toUpperCase());
        if (elements == null) return null;
        return elements[0];
    }

    // Handle //tag[@attr='value']
    var match = xpath.match(/^\/\/(\w+|\*)\[@(\w+)=('([^\']+)'|"([^\"]+)")\]$/);
    if (match) {
        return this._findElementByTagNameAndAttributeValue(
                inDocument,
                match[1].toUpperCase(),
                match[2].toLowerCase(),
                match[3].slice(1, -1)
                );
    }

    // Handle //tag[text()='value']
    var match = xpath.match(/^\/\/(\w+|\*)\[text\(\)=('([^\']+)'|"([^\"]+)")\]$/);
    if (match) {
        return this._findElementByTagNameAndText(
                inDocument,
                match[1].toUpperCase(),
                match[2].slice(1, -1)
                );
    }

    return this._findElementUsingFullXPath(xpath, inDocument);
};

PageBot.prototype._findElementByTagNameAndAttributeValue = function(
        inDocument, tagName, attributeName, attributeValue
        ) {
    if (browserVersion.isIE && attributeName == "class") {
        attributeName = "className";
    }
    var elements = inDocument.getElementsByTagName(tagName);
    for (var i = 0; i < elements.length; i++) {
        var elementAttr = elements[i].getAttribute(attributeName);
        if (elementAttr == attributeValue) {
            return elements[i];
        }
    }
    return null;
};

PageBot.prototype._findElementByTagNameAndText = function(
        inDocument, tagName, text
        ) {
    var elements = inDocument.getElementsByTagName(tagName);
    for (var i = 0; i < elements.length; i++) {
        if (getText(elements[i]) == text) {
            return elements[i];
        }
    }
    return null;
};

PageBot.prototype._findElementUsingFullXPath = function(xpath, inDocument, inWindow) {
    // Use document.evaluate() if it's available
    if (inDocument.evaluate) {
        return inDocument.evaluate(xpath, inDocument, null, 0, null).iterateNext();
    }

    // If not, fall back to slower JavaScript implementation
    var context = new ExprContext(inDocument);
    var xpathObj = xpathParse(xpath);
    var xpathResult = xpathObj.evaluate(context);
    if (xpathResult && xpathResult.value) {
        return xpathResult.value[0];
    }
    return null;
};

/**
 * Finds a link element with text matching the expression supplied. Expressions must
 * begin with "link:".
 */
PageBot.prototype.locateElementByLinkText = function(linkText, inDocument, inWindow) {
    var links = inDocument.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
        var element = links[i];
        if (PatternMatcher.matches(linkText, getText(element))) {
            return element;
        }
    }
    return null;
};
PageBot.prototype.locateElementByLinkText.prefix = "link";

/**
 * Returns an attribute based on an attribute locator. This is made up of an element locator
 * suffixed with @attribute-name.
 */
PageBot.prototype.findAttribute = function(locator) {
    // Split into locator + attributeName
    var attributePos = locator.lastIndexOf("@");
    var elementLocator = locator.slice(0, attributePos);
    var attributeName = locator.slice(attributePos + 1);

    // Find the element.
    var element = this.findElement(elementLocator);

    // Handle missing "class" attribute in IE.
    if (browserVersion.isIE && attributeName == "class") {
        attributeName = "className";
    }

    // Get the attribute value.
    var attributeValue = element.getAttribute(attributeName);

    return attributeValue ? attributeValue.toString() : null;
};

/*
* Select the specified option and trigger the relevant events of the element.
*/
PageBot.prototype.selectOption = function(element, optionToSelect) {
    triggerEvent(element, 'focus', false);
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
        triggerEvent(element, 'change', true);
    }
};

/*
* Select the specified option and trigger the relevant events of the element.
*/
PageBot.prototype.addSelection = function(element, option) {
    this.checkMultiselect(element);
    triggerEvent(element, 'focus', false);
    if (!option.selected) {
        option.selected = true;
        triggerEvent(element, 'change', true);
    }
};

/*
* Select the specified option and trigger the relevant events of the element.
*/
PageBot.prototype.removeSelection = function(element, option) {
    this.checkMultiselect(element);
    triggerEvent(element, 'focus', false);
    if (option.selected) {
        option.selected = false;
        triggerEvent(element, 'change', true);
    }
};

PageBot.prototype.checkMultiselect = function(element) {
    if (!element.multiple)
    {
        throw new SeleniumError("Not a multi-select");
    }

};

PageBot.prototype.replaceText = function(element, stringValue) {
    triggerEvent(element, 'focus', false);
    triggerEvent(element, 'select', true);
    element.value = stringValue;
    // DGF this used to be skipped in chrome URLs, but no longer.  Is xpcnativewrappers to blame?
    triggerEvent(element, 'change', true);
};

MozillaPageBot.prototype.clickElement = function(element, clientX, clientY) {

    triggerEvent(element, 'focus', false);

    // Add an event listener that detects if the default action has been prevented.
    // (This is caused by a javascript onclick handler returning false)
    var preventDefault = false;

    element.addEventListener("click", function(evt) {
        preventDefault = evt.getPreventDefault();
    }, false);

    // Trigger the click event.
    triggerMouseEvent(element, 'click', true, clientX, clientY);

    // Perform the link action if preventDefault was set.
    // In chrome URL, the link action is already executed by triggerMouseEvent.
    if (!browserVersion.isChrome && !preventDefault) {
        // Try the element itself, as well as it's parent - this handles clicking images inside links.
        targetName = element.target;
        if (targetName) {
            originWindow = selenium.browserbot.getCurrentWindow();
            selenium.browserbot.selectFrame("relative=top");
            selenium.browserbot.selectFrame(targetName);
        }
        if (element.href) {
            this.currentWindow().location.href = element.href;
        }
        else if (element.parentNode && element.parentNode.href) {
            this.currentWindow().location.href = element.parentNode.href;
        }
        if (targetName) {
            selenium.browserbot.currentWindow = originWindow;
        }
    }

    if (this.windowClosed()) {
        return;
    }

};

OperaPageBot.prototype.clickElement = function(element, clientX, clientY) {

    triggerEvent(element, 'focus', false);

    // Trigger the click event.
    triggerMouseEvent(element, 'click', true, clientX, clientY);

    if (isDefined(element.checked)) {
        // In Opera, clicking won't check/uncheck
        if (element.type == "checkbox") {
            element.checked = !element.checked;
        } else {
            element.checked = true;
        }
    }

    if (this.windowClosed()) {
        return;
    }

};


KonquerorPageBot.prototype.clickElement = function(element, clientX, clientY) {

    triggerEvent(element, 'focus', false);

    if (element.click) {
        element.click();
    }
    else {
        triggerMouseEvent(element, 'click', true, clientX, clientY);
    }

    if (this.windowClosed()) {
        return;
    }

};

SafariPageBot.prototype.clickElement = function(element, clientX, clientY) {

    triggerEvent(element, 'focus', false);

    var wasChecked = element.checked;

    // For form element it is simple.
    if (element.click) {
        element.click();
    }
    // For links and other elements, event emulation is required.
    else {
        triggerMouseEvent(element, 'click', true, clientX, clientY);

        // Unfortunately, triggering the event doesn't seem to activate onclick handlers.
        // We currently call onclick for the link, but I'm guessing that the onclick for containing
        // elements is not being called.
        var success = true;
        if (element.onclick) {
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent('click', true, true);
            var onclickResult = element.onclick(evt);
            if (onclickResult === false) {
                success = false;
            }
        }

        if (success) {
            // Try the element itself, as well as it's parent - this handles clicking images inside links.
            if (element.href) {
                this.currentWindow().location.href = element.href;
            }
            else if (element.parentNode.href) {
                this.currentWindow().location.href = element.parentNode.href;
            } else {
                // This is true for buttons outside of forms, and maybe others.
                LOG.warn("Ignoring 'click' call for button outside form, or link without href."
                        + "Using buttons without an enclosing form can cause wierd problems with URL resolution in Safari.");
                // I implemented special handling for window.open, but unfortunately this behaviour is also displayed
                // when we have a button without an enclosing form that sets document.location in the onclick handler.
                // The solution is to always use an enclosing form for a button.
            }
        }
    }

    if (this.windowClosed()) {
        return;
    }

};

IEPageBot.prototype.clickElement = function(element, clientX, clientY) {

    triggerEvent(element, 'focus', false);

    var wasChecked = element.checked;

    // Set a flag that records if the page will unload - this isn't always accurate, because
    // <a href="javascript:alert('foo'):"> triggers the onbeforeunload event, even thought the page won't unload
    var pageUnloading = false;
    var pageUnloadDetector = function() {
        pageUnloading = true;
    };
    this.currentWindow().attachEvent("onbeforeunload", pageUnloadDetector);
    element.click();


    // If the page is going to unload - still attempt to fire any subsequent events.
    // However, we can't guarantee that the page won't unload half way through, so we need to handle exceptions.
    try {
        this.currentWindow().detachEvent("onbeforeunload", pageUnloadDetector);

        if (this.windowClosed()) {
            return;
        }

        // Onchange event is not triggered automatically in IE.
        if (isDefined(element.checked) && wasChecked != element.checked) {
            triggerEvent(element, 'change', true);
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

PageBot.prototype.windowClosed = function(element) {
    return selenium.browserbot.windowClosed(this.currentWindow());
};

PageBot.prototype.bodyText = function() {
    return getText(this.document().body);
};

PageBot.prototype.getAllButtons = function() {
    var elements = this.document().getElementsByTagName('input');
    var result = '';

    for (var i = 0; i < elements.length; i++) {
        if (elements[i].type == 'button' || elements[i].type == 'submit' || elements[i].type == 'reset') {
            result += elements[i].id;

            result += ',';
        }
    }

    return result;
};


PageBot.prototype.getAllFields = function() {
    var elements = this.document().getElementsByTagName('input');
    var result = '';

    for (var i = 0; i < elements.length; i++) {
        if (elements[i].type == 'text') {
            result += elements[i].id;

            result += ',';
        }
    }

    return result;
};

PageBot.prototype.getAllLinks = function() {
    var elements = this.document().getElementsByTagName('a');
    var result = '';

    for (var i = 0; i < elements.length; i++) {
        result += elements[i].id;

        result += ',';
    }

    return result;
};

PageBot.prototype.setContext = function(strContext, logLevel) {
    //set the current test title
    var ctx = document.getElementById("context");
    if (ctx != null) {
        ctx.innerHTML = strContext;
    }
    if (logLevel != null) {
        LOG.setLogLevelThreshold(logLevel);
    }
};

function isDefined(value) {
    return typeof(value) != undefined;
}

PageBot.prototype.goBack = function() {
    this.currentWindow().history.back();
};

PageBot.prototype.goForward = function() {
    this.currentWindow().history.forward();
};

PageBot.prototype.close = function() {
    if (browserVersion.isChrome) {
        this.currentWindow().close();
    } else {
        this.currentWindow().eval("window.close();");
    }
};

PageBot.prototype.refresh = function() {
    this.currentWindow().location.reload(true);
};

/**
 * Refine a list of elements using a filter.
 */
PageBot.prototype.selectElementsBy = function(filterType, filter, elements) {
    var filterFunction = PageBot.filterFunctions[filterType];
    if (! filterFunction) {
        throw new SeleniumError("Unrecognised element-filter type: '" + filterType + "'");
    }

    return filterFunction(filter, elements);
};

PageBot.filterFunctions = {};

PageBot.filterFunctions.name = function(name, elements) {
    var selectedElements = [];
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].name === name) {
            selectedElements.push(elements[i]);
        }
    }
    return selectedElements;
};

PageBot.filterFunctions.value = function(value, elements) {
    var selectedElements = [];
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].value === value) {
            selectedElements.push(elements[i]);
        }
    }
    return selectedElements;
};

PageBot.filterFunctions.index = function(index, elements) {
    index = Number(index);
    if (isNaN(index) || index < 0) {
        throw new SeleniumError("Illegal Index: " + index);
    }
    if (elements.length <= index) {
        throw new SeleniumError("Index out of range: " + index);
    }
    return [elements[index]];
};

PageBot.prototype.selectElements = function(filterExpr, elements, defaultFilterType) {

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
PageBot.prototype.locateElementByClass = function(locator, document) {
    return Element.findFirstMatchingChild(document,
            function(element) {
                return element.className == locator
            }
            );
}

/**
 * Find an element by alt
 */
PageBot.prototype.locateElementByAlt = function(locator, document) {
    return Element.findFirstMatchingChild(document,
            function(element) {
                return element.alt == locator
            }
            );
}

/**
 * Find an element by css selector
 */
PageBot.prototype.locateElementByCss = function(locator, document) {
    var elements = cssQuery(locator, document);
    if (elements.length != 0)
        return elements[0];
    return null;
}
