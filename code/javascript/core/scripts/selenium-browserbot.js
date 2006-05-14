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

BrowserBot = function(frame) {
    this.frame = frame;
    this.currentPage = null;
    this.currentWindowName = null;

    this.modalDialogTest = null;
    this.recordedAlerts = new Array();
    this.recordedConfirmations = new Array();
    this.recordedPrompts = new Array();
    this.openedWindows = {};
    this.nextConfirmResult = true;
    this.nextPromptResult = '';
    this.newPageLoaded = false;
    this.pageLoadError = null;

    var self = this;
    this.recordPageLoad = function() {
    	LOG.debug("Page load detected");
        try {
        	LOG.debug("Page load location=" + self.getCurrentWindow().location);
        } catch (e) {
        	self.pageLoadError = e;
        	return;
        }
        self.currentPage = null;
        self.newPageLoaded = true;
    };

    this.isNewPageLoaded = function() {
    	if (this.pageLoadError) throw this.pageLoadError;
        return self.newPageLoaded;
    };
};

BrowserBot.createForFrame = function(frame) {
    var browserbot;
    LOG.debug("browserName: " + browserVersion.name);
    LOG.debug("userAgent: " + navigator.userAgent);
    if (browserVersion.isIE) {
        browserbot = new IEBrowserBot(frame);
    }
    else if (browserVersion.isKonqueror) {
        browserbot = new KonquerorBrowserBot(frame);
    }
    else if (browserVersion.isSafari) {
        browserbot = new SafariBrowserBot(frame);
    }
    else {
        LOG.info("Using MozillaBrowserBot")
        // Use mozilla by default
        browserbot = new MozillaBrowserBot(frame);
    }

    // Modify the test IFrame so that page loads are detected.
    addLoadListener(browserbot.getFrame(), browserbot.recordPageLoad);
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
    return (this.recordedAlerts.length > 0) ;
};

BrowserBot.prototype.getNextAlert = function() {
    return this.recordedAlerts.shift();
};

BrowserBot.prototype.hasConfirmations = function() {
    return (this.recordedConfirmations.length > 0) ;
};

BrowserBot.prototype.getNextConfirmation = function() {
    return this.recordedConfirmations.shift();
};

BrowserBot.prototype.hasPrompts = function() {
    return (this.recordedPrompts.length > 0) ;
};

BrowserBot.prototype.getNextPrompt = function() {
    return this.recordedPrompts.shift();
};

BrowserBot.prototype.getFrame = function() {
    return this.frame;
};

BrowserBot.prototype.selectWindow = function(target) {
    // we've moved to a new page - clear the current one
    this.currentPage = null;
    this.currentWindowName = null;
    if (target && target != "null") {
        // If window exists
        if (this.getTargetWindow(target)) {
            this.currentWindowName = target;
        }
    }
};

BrowserBot.prototype.openLocation = function(target) {
    // We're moving to a new page - clear the current one
    this.currentPage = null;
    this.newPageLoaded = false;

    this.setOpenLocation(target);
};

BrowserBot.prototype.setIFrameLocation = function(iframe, location) {
    iframe.src = location;
};

BrowserBot.prototype.setOpenLocation = function(location) {
    this.getCurrentWindow().location.href = location;
};

BrowserBot.prototype.getCurrentPage = function() {
    if (this.currentPage == null) {
        var testWindow = this.getCurrentWindow();
        this.modifyWindowToRecordPopUpDialogs(testWindow, this);
        this.modifySeparateTestWindowToDetectPageLoads(testWindow);
        this.currentPage = PageBot.createForWindow(testWindow);
        this.newPageLoaded = false;
    }

    return this.currentPage;
};

BrowserBot.prototype.modifyWindowToRecordPopUpDialogs = function(windowToModify, browserBot) {
    windowToModify.alert = function(alert) {
        browserBot.recordedAlerts.push(alert);
    };

    windowToModify.confirm = function(message) {
        browserBot.recordedConfirmations.push(message);
        var result = browserBot.nextConfirmResult;
        browserBot.nextConfirmResult = true;
        return result;
    };

    windowToModify.prompt = function(message) {
        browserBot.recordedPrompts.push(message);
        var result = !browserBot.nextConfirmResult ? null : browserBot.nextPromptResult;
        browserBot.nextConfirmResult = true;
        browserBot.nextPromptResult = '';
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
 * The main IFrame has a single, long-lived onload handler that clears
 * Browserbot.currentPage and sets the "newPageLoaded" flag. For separate
 * windows, we need to attach a handler each time. This uses the
 * "callOnWindowPageTransition" mechanism, which is implemented differently
 * for different browsers.
 */
BrowserBot.prototype.modifySeparateTestWindowToDetectPageLoads = function(windowToModify) {
    if (this.currentWindowName != null) {
        this.callOnWindowPageTransition(this.recordPageLoad, windowToModify);
    }
};

/**
 * Call the supplied function when a the current page unloads and a new one loads.
 * This is done by polling continuously until the document changes and is fully loaded.
 */
BrowserBot.prototype.callOnWindowPageTransition = function(loadFunction, windowObject) {
    // Since the unload event doesn't fire in Safari 1.3, we start polling immediately
    if (windowObject && !windowObject.closed) {
        LOG.debug("Starting pollForLoad: " + windowObject.document.location);
        this.pollForLoad(loadFunction, windowObject, windowObject.document.location, windowObject.document.location.href);
    }
};

/**
 * Set up a polling timer that will keep checking the readyState of the document until it's complete.
 * Since we might call this before the original page is unloaded, we first check to see that the current location
 * or href is different from the original one.
 */
BrowserBot.prototype.pollForLoad = function(loadFunction, windowObject, originalLocation, originalHref) {
    var windowClosed = true;
    try {
    	windowClosed = windowObject.closed;
    } catch (e) {
    	LOG.debug("exception detecting closed window (I guess it must be closed)");
    	LOG.exception(e);
    	// swallow exceptions which may occur in HTA mode when the window is closed
    }
    if (windowClosed) {
        return;
    }

    LOG.debug("pollForLoad original: " + originalHref);
    try {

	    var currentLocation = windowObject.document.location;
	    var currentHref = currentLocation.href

	    var sameLoc = (originalLocation === currentLocation);
	    var sameHref = (originalHref === currentHref);
	    var rs = windowObject.document.readyState;

		if (rs == null) rs = 'complete';

	    if (!(sameLoc && sameHref) && rs == 'complete') {
	        LOG.debug("pollForLoad complete: " + rs + " (" + currentHref + ")");
	        loadFunction();
	        return;
	    }
	    var self = this;
	    LOG.debug("pollForLoad continue: " + currentHref);
	    window.setTimeout(function() {self.pollForLoad(loadFunction, windowObject, originalLocation, originalHref);}, 500);
	} catch (e) {
		this.pageLoadError = e;
	}
};


BrowserBot.prototype.getContentWindow = function() {
    return this.getFrame().contentWindow || frames[this.getFrame().id];
};

BrowserBot.prototype.getTargetWindow = function(windowName) {
    LOG.debug("getTargetWindow(" + windowName + ")");
    // First look in the map of opened windows
    var targetWindow = this.openedWindows[windowName];
    if (!targetWindow) {
        var evalString = "this.getContentWindow().window." + windowName;
        targetWindow = eval(evalString);
    }
    if (!targetWindow) {
        throw new SeleniumError("Window does not exist");
    }
    return targetWindow;
};

BrowserBot.prototype.getCurrentWindow = function() {
    var testWindow = this.getContentWindow().window;
    if (this.currentWindowName != null) {
        testWindow = this.getTargetWindow(this.currentWindowName);
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

KonquerorBrowserBot.prototype.setOpenLocation = function(location) {
    // Window doesn't fire onload event when setting src to the current value,
    // so we set it to blank first.
    this.getCurrentWindow().location.href = "about:blank";
    this.getCurrentWindow().location.href = location;
};

function SafariBrowserBot(frame) {
    BrowserBot.call(this, frame);
}
SafariBrowserBot.prototype = new BrowserBot;

SafariBrowserBot.prototype.setIFrameLocation = KonquerorBrowserBot.prototype.setIFrameLocation;

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

PageBot = function(pageWindow) {
    if (pageWindow) {
        this.currentWindow = pageWindow;
        this.currentDocument = pageWindow.document;
        this.location = pageWindow.location;
        this.title = function() {return this.currentDocument.title;};
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
    this.findElementBy = function(locatorType, locator, inDocument) {
        var locatorFunction = this.locationStrategies[locatorType];
        if (! locatorFunction) {
            throw new SeleniumError("Unrecognised locator type: '" + locatorType + "'");
        }
        return locatorFunction.call(this, locator, inDocument);
    };

    /**
     * The implicit locator, that is used when no prefix is supplied.
     */
    this.locationStrategies['implicit'] = function(locator, inDocument) {
        if (locator.startsWith('//')) {
            return this.locateElementByXPath(locator, inDocument);
        }
        if (locator.startsWith('document.')) {
            return this.locateElementByDomTraversal(locator, inDocument);
        }
        return this.locateElementByIdentifier(locator, inDocument);
    };

};

PageBot.createForWindow = function(windowObject) {
    if (browserVersion.isIE) {
        return new IEPageBot(windowObject);
    }
    else if (browserVersion.isKonqueror) {
        return new KonquerorPageBot(windowObject);
    }
    else if (browserVersion.isSafari) {
        return new SafariPageBot(windowObject);
    }
    else {
        LOG.info("Using MozillaPageBot")
        // Use mozilla by default
        return new MozillaPageBot(windowObject);
    }
};

MozillaPageBot = function(pageWindow) {
    PageBot.call(this, pageWindow);
};
MozillaPageBot.prototype = new PageBot();

KonquerorPageBot = function(pageWindow) {
    PageBot.call(this, pageWindow);
};
KonquerorPageBot.prototype = new PageBot();

SafariPageBot = function(pageWindow) {
    PageBot.call(this, pageWindow);
};
SafariPageBot.prototype = new PageBot();

IEPageBot = function(pageWindow) {
    PageBot.call(this, pageWindow);
};
IEPageBot.prototype = new PageBot();

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

    var element = this.findElementBy(locatorType, locatorString, this.currentDocument);
    if (element != null) {
        return element;
    }
    for (var i = 0; i < this.currentWindow.frames.length; i++) {
        element = this.findElementBy(locatorType, locatorString, this.currentWindow.frames[i].document);
        if (element != null) {
            return element;
        }
    }

    // Element was not found by any locator function.
    throw new SeleniumError("Element " + locator + " not found");
};

/**
 * In non-IE browsers, getElementById() does not search by name.  Instead, we
 * we search separately by id and name.
 */
PageBot.prototype.locateElementByIdentifier = function(identifier, inDocument) {
    return PageBot.prototype.locateElementById(identifier, inDocument)
            || PageBot.prototype.locateElementByName(identifier, inDocument)
            || null;
};

/**
 * In IE, getElementById() also searches by name - this is an optimisation for IE.
 */
IEPageBot.prototype.locateElementByIdentifer = function(identifier, inDocument) {
    return inDocument.getElementById(identifier);
};

/**
 * Find the element with id - can't rely on getElementById, coz it returns by name as well in IE..
 */
PageBot.prototype.locateElementById = function(identifier, inDocument) {
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
PageBot.prototype.locateElementByName = function(locator, document) {
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
* Finds an element using by evaluating the "document.*" string against the
* current document object. Dom expressions must begin with "document."
*/
PageBot.prototype.locateElementByDomTraversal = function(domTraversal, inDocument) {
    if (domTraversal.indexOf("document.") != 0) {
        return null;
    }

    // Trim the leading 'document'
    domTraversal = domTraversal.substr(9);
    var locatorScript = "inDocument." + domTraversal;
    var element = eval(locatorScript);

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
PageBot.prototype.locateElementByXPath = function(xpath, inDocument) {

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
        return this.findElementByTagNameAndAttributeValue(
            inDocument,
            match[1].toUpperCase(),
            match[2].toLowerCase(),
            match[3].slice(1, -1)
        );
    }

    // Handle //tag[text()='value']
    var match = xpath.match(/^\/\/(\w+|\*)\[text\(\)=('([^\']+)'|"([^\"]+)")\]$/);
    if (match) {
        return this.findElementByTagNameAndText(
            inDocument,
            match[1].toUpperCase(),
            match[2].slice(1, -1)
        );
    }

    return this.findElementUsingFullXPath(xpath, inDocument);
};

PageBot.prototype.findElementByTagNameAndAttributeValue = function(
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

PageBot.prototype.findElementByTagNameAndText = function(
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

PageBot.prototype.findElementUsingFullXPath = function(xpath, inDocument) {
    if (browserVersion.isIE && !inDocument.evaluate) {
        addXPathSupport(inDocument);
    }

    // Use document.evaluate() if it's available
    if (inDocument.evaluate) {
        return inDocument.evaluate(xpath, inDocument, null, 0, null).iterateNext();
    }

    // If not, fall back to slower JavaScript implementation
    var context = new XPathContext();
    context.expressionContextNode = inDocument;
    var xpathResult = new XPathParser().parse(xpath).evaluate(context);
    if (xpathResult && xpathResult.toArray) {
        return xpathResult.toArray()[0];
    }
    return null;
};

/**
* Finds a link element with text matching the expression supplied. Expressions must
* begin with "link:".
*/
PageBot.prototype.locateElementByLinkText = function(linkText, inDocument) {
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
    triggerEvent(element, 'blur', false);
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
    triggerEvent(element, 'blur', false);
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
    triggerEvent(element, 'blur', false);
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
    element.value=stringValue;
    triggerEvent(element, 'change', true);
    triggerEvent(element, 'blur', false);
};

// TODO Opera uses this too - split out an Opera version so we don't need the isGecko check here
MozillaPageBot.prototype.clickElement = function(element) {

    triggerEvent(element, 'focus', false);

    // Add an event listener that detects if the default action has been prevented.
    // (This is caused by a javascript onclick handler returning false)
    var preventDefault = false;
    if (browserVersion.isGecko) {
        element.addEventListener("click", function(evt) {preventDefault = evt.getPreventDefault();}, false);
    }

    // Trigger the click event.
    triggerMouseEvent(element, 'click', true);

    // Perform the link action if preventDefault was set.
    if (browserVersion.isGecko && !preventDefault) {
        // Try the element itself, as well as it's parent - this handles clicking images inside links.
        if (element.href) {
            this.currentWindow.location.href = element.href;
        }
        else if (element.parentNode && element.parentNode.href) {
            this.currentWindow.location.href = element.parentNode.href;
        }
    }

    if (this.windowClosed()) {
        return;
    }

    triggerEvent(element, 'blur', false);
};

KonquerorPageBot.prototype.clickElement = function(element) {

    triggerEvent(element, 'focus', false);

    if (element.click) {
        element.click();
    }
    else {
        triggerMouseEvent(element, 'click', true);
    }

    if (this.windowClosed()) {
        return;
    }

    triggerEvent(element, 'blur', false);
};

SafariPageBot.prototype.clickElement = function(element) {

    triggerEvent(element, 'focus', false);

    var wasChecked = element.checked;

    // For form element it is simple.
    if (element.click) {
        element.click();
    }
    // For links and other elements, event emulation is required.
    else {
        triggerMouseEvent(element, 'click', true);

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
                this.currentWindow.location.href = element.href;
            }
            else if (element.parentNode.href) {
                this.currentWindow.location.href = element.parentNode.href;
            } else {
                // This is true for buttons outside of forms, and maybe others.
                LOG.warn("Ignoring 'click' call for button outside form, or link without href."
                        + "Using buttons without an enclosing form can cause wierd problems with URL resolution in Safari." );
                // I implemented special handling for window.open, but unfortunately this behaviour is also displayed
                // when we have a button without an enclosing form that sets document.location in the onclick handler.
                // The solution is to always use an enclosing form for a button.
            }
        }
    }

    if (this.windowClosed()) {
        return;
    }

    triggerEvent(element, 'blur', false);
};

IEPageBot.prototype.clickElement = function(element) {

    triggerEvent(element, 'focus', false);

    var wasChecked = element.checked;

    // Set a flag that records if the page will unload - this isn't always accurate, because
    // <a href="javascript:alert('foo'):"> triggers the onbeforeunload event, even thought the page won't unload
    var pageUnloading = false;
    var pageUnloadDetector = function() {pageUnloading = true;};
    this.currentWindow.attachEvent("onbeforeunload", pageUnloadDetector);

    element.click();

    // If the page is going to unload - still attempt to fire any subsequent events.
    // However, we can't guarantee that the page won't unload half way through, so we need to handle exceptions.
    try {
        this.currentWindow.detachEvent("onbeforeunload", pageUnloadDetector);

        if (this.windowClosed()) {
            return;
        }

        // Onchange event is not triggered automatically in IE.
        if (isDefined(element.checked) && wasChecked != element.checked) {
            triggerEvent(element, 'change', true);
        }

        triggerEvent(element, 'blur', false);
    }
    catch (e) {
        // If the page is unloading, we may get a "Permission denied" or "Unspecified error".
        // Just ignore it, because the document may have unloaded.
        if (pageUnloading) {
            LOG.warn("Caught exception when firing events on unloading page: " + e.message);
            return;
        }
        throw e;
    }
};

PageBot.prototype.windowClosed = function(element) {
    return this.currentWindow.closed;
};

PageBot.prototype.bodyText = function() {
    return getText(this.currentDocument.body);
};

PageBot.prototype.getAllButtons = function() {
    var elements = this.currentDocument.getElementsByTagName('input');
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
    var elements = this.currentDocument.getElementsByTagName('input');
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
    var elements = this.currentDocument.getElementsByTagName('a');
    var result = '';

    for (var i = 0; i < elements.length; i++) {
        result += elements[i].id;

        result += ',';
    }

    return result;
};

PageBot.prototype.setContext = function(strContext, logLevel) {
     //set the current test title
    document.getElementById("context").innerHTML=strContext;
    if (logLevel!=null) {
    	LOG.setLogLevelThreshold(logLevel);
    }
};

function isDefined(value) {
    return typeof(value) != undefined;
}

PageBot.prototype.goBack = function() {
    this.currentWindow.history.back();
};

PageBot.prototype.goForward = function() {
    this.currentWindow.history.forward();
};

PageBot.prototype.close = function() {
    this.currentWindow.eval("window.close();");
};

PageBot.prototype.refresh = function() {
    this.currentWindow.location.reload(true);
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
