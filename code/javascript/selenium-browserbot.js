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


// Although it's generally better web development practice not to use browser-detection
// (feature detection is better), the subtle browser differences that Selenium has to
// work around seem to make it necessary. Maybe as we learn more about what we need,
// we can do this in a more "feature-centric" rather than "browser-centric" way.
// TODO we should probably reuse an available browser-detection library
var browserName=navigator.appName;
var isIE = (browserName =="Microsoft Internet Explorer");
var isKonqueror = (browserName == "Konqueror");
var isSafari = (navigator.userAgent.indexOf('Safari') != -1);

// Get the Gecko version as an 8 digit date.
var geckoResult = /^Mozilla\/5\.0 .*Gecko\/(\d{8}).*$/.exec(navigator.userAgent);
var geckoVersion = geckoResult == null ? null : geckoResult[1];

function createBrowserBot(frame, executionContext) {
    if (isIE) {
        return new IEBrowserBot(frame, executionContext);
    }
    else if (isKonqueror) {
        return new KonquerorBrowserBot(frame, executionContext);
    }
    else if (isSafari) {
        return new SafariBrowserBot(frame, executionContext);
    }
    else {
        // Use mozilla by default
        return new MozillaBrowserBot(frame, executionContext);
    }
}

function createPageBot(windowObject) {
    if (isIE) {
        return new IEPageBot(windowObject);
    }
    else if (isKonqueror) {
        return new KonquerorPageBot(windowObject);
    }
    else if (isSafari) {
        return new SafariPageBot(windowObject);
    }
    else {
        // Use mozilla by default
        return new MozillaPageBot(windowObject);
    }
}

BrowserBot = function(frame, executionContext) {
    this.frame = frame;
    this.executionContext = executionContext;
    this.currentPage = null;
    this.currentWindowName = null;

    this.modalDialogTest = null;
    this.recordedAlerts = new Array();
    this.recordedConfirmations = new Array();
    this.nextConfirmResult = true;
};

BrowserBot.prototype.doModalDialogTest = function(test) {
    this.modalDialogTest = test;
};

BrowserBot.prototype.cancelNextConfirmation = function() {
    this.nextConfirmResult = false;
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


BrowserBot.prototype.getFrame = function() {
    return this.frame;
};

BrowserBot.prototype.getContentWindow = function() {
    return this.executionContext.getContentWindow(this.getFrame());

};

BrowserBot.prototype.selectWindow = function(target) {
    // we've moved to a new page - clear the current one
    this.currentPage = null;
    this.currentWindowName = null;
    if (target != "null") {
        // If window exists
        if (this.getTargetWindow(target)) {
            this.currentWindowName = target;
        }
    }
};

BrowserBot.prototype.openLocation = function(target, onloadCallback) {
    // We're moving to a new page - clear the current one
    this.currentPage = null;
    this.executionContext.open(target,this.getFrame());
};

BrowserBot.prototype.getCurrentPage = function() {
    if (this.currentPage == null) {
        var testWindow = this.getContentWindow().window;
        if (this.currentWindowName != null) {
            testWindow = this.getTargetWindow(this.currentWindowName);
        }
        this.modifyWindowToRecordPopUpDialogs(testWindow, this);
        this.modifyWindowToClearPageCache(testWindow, this);
        this.currentPage = createPageBot(testWindow);
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
};

BrowserBot.prototype.modifyWindowToClearPageCache = function(windowToModify, browserBot) {
    var clearCachedPage = function() {
        LOG.debug("UNLOAD: clearCachedPage()");
        browserbot.currentPage = null;
    };

    if (window.addEventListener) {
        windowToModify.addEventListener("unload", clearCachedPage, true);
    } else if (window.attachEvent) {
        windowToModify.attachEvent("onunload", clearCachedPage);
    }
};

BrowserBot.prototype.getTargetWindow = function(windowName) {
    var evalString = "this.getContentWindow().window." + windowName;
    var targetWindow = eval(evalString);
    if (!targetWindow) {
        throw new Error("Window does not exist");
    }
    return targetWindow;
};

BrowserBot.prototype.callOnNextPageLoad = function(onloadCallback) {
    addLoadListener(this.frame, onloadCallback);
};

function MozillaBrowserBot(frame, executionContext) {
    BrowserBot.call(this, frame, executionContext);
}
MozillaBrowserBot.prototype = new BrowserBot;

function KonquerorBrowserBot(frame, executionContext) {
    BrowserBot.call(this, frame, executionContext);
}
KonquerorBrowserBot.prototype = new BrowserBot;

function SafariBrowserBot(frame, executionContext) {
    BrowserBot.call(this, frame, executionContext);
}
SafariBrowserBot.prototype = new BrowserBot;

/**
 * Since Safari 1.3 doesn't trigger unload, we clear cached page as soon as
 * we know that we're expecting a new page.
 */
SafariBrowserBot.prototype.callOnNextPageLoad = function(onloadCallback) {
    this.currentPage = null;

    try {
        addLoadListener(this.frame, onloadCallback);
    } catch (e) {
        LOG.debug("Got on error adding LoadListener in BrowserBot.prototype.callOnNextPageLoad." +
                  "This occurs on the second and all subsequent calls in Safari");
    }
};

function IEBrowserBot(frame, executionContext) {
    BrowserBot.call(this, frame, executionContext);
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
        this.location = pageWindow.location.pathname;
        this.title = function() {return this.currentDocument.title;};

        // Register all locate* functions
        this.locatorFunctions = new Array();
        for (var f in this) {
            if (typeof(this[f]) == 'function' && f.match(/^locate/)) {
                this.locatorFunctions.push(this[f]);
            }
        }
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
    var element = this.findElementInDocument(locator, this.currentDocument);

    if (element != null) {
        return element;
    } else {
        for (var i = 0; i < this.currentWindow.frames.length; i++) {
            element = this.findElementInDocument(locator, this.currentWindow.frames[i].document);
            if (element != null) {
                return element;
            }
        }
    }

    // Element was not found by any locator function.
    throw new Error("Element " + locator + " not found");
};

PageBot.prototype.findElementInDocument = function(locator, inDocument) {
    // Try the locatorFunctions one at a time.
    for (var i = 0; i < this.locatorFunctions.length; i++) {
        var locatorFunction = this.locatorFunctions[i];
        var element = locatorFunction.call(this, locator, inDocument);
        if (element != null) {
            return element;
        }
    }
};

/**
 * In IE, getElementById() also searches by name.
 */
IEPageBot.prototype.locateElementById = function(identifier, inDocument) {
    try {
        return inDocument.getElementById(identifier);
    } catch (e) {
        return null;
    }
};

/**
 * In other browsers, getElementById() does not search by name.  To provide
 * functionality consistent with IE, we search by @name if an element with
 * the @id isn't found.
 */
PageBot.prototype.locateElementById = function(identifier, inDocument) {
    try {
        var element = inDocument.getElementById(identifier);
        if (element == null)
        {
            if ( document.evaluate ) {// DOM3 XPath
                var xpath = "//*[@name='" + identifier + "']";
                element = document.evaluate(xpath, inDocument, null, 0, null).iterateNext();
            }
            // Search through all elements for Konqueror/Safari
            else {
                var allElements = inDocument.getElementsByTagName("*");
                for (var i = 0; i < allElements.length; i++) {
                    var testElement = allElements[i];
                    if (testElement.name && testElement.name === identifier) {
                        element = testElement;
                        break;
                    }
                }
            }
        }
    } catch (e) {
        return null;
    }

    return element;
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

/**
* Finds an element identified by the xpath expression. Expressions _must_
* begin with "//".
*/
PageBot.prototype.locateElementByXPath = function(xpath, inDocument) {
    if (xpath.indexOf("//") != 0) {
        return null;
    }

    // If don't have XPath bail.
    // TODO implement subset of XPath for browsers without native support.
    if (!inDocument.evaluate) {
        throw new Error("XPath not supported");
    }

    // Trim any trailing "/": not valid xpath, and remains from attribute locator.
    if (xpath.charAt(xpath.length - 1) == '/') {
        xpath = xpath.slice(0, xpath.length - 1);
    }

    return inDocument.evaluate(xpath, inDocument, null, 0, null).iterateNext();
};

/**
 * For IE, we implement XPath support using the html-xpath library.
 */
IEPageBot.prototype.locateElementByXPath = function(xpath, inDocument) {
    if (xpath.indexOf("//") != 0) {
        return null;
    }

    if (!inDocument.evaluate) {
        addXPathSupport(inDocument);
    }

    return PageBot.prototype.locateElementByXPath(xpath, inDocument);
};

/**
* Finds a link element with text matching the expression supplied. Expressions must
* begin with "link:".
*/
PageBot.prototype.locateLinkByText = function(linkDescription, inDocument) {
    var prefix = "link:";
    if (linkDescription.indexOf(prefix) != 0) {
        return null;
    }

    var linkText = linkDescription.substring(prefix.length);
    var links = inDocument.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
        var element = links[i];
        if (getText(element) == linkText) {
            return element;
        }
    }
    return null;
};

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
    if (isIE && attributeName == "class") {
        attributeName = "className";
    }

    // Get the attribute value.
    var attributeValue = element.getAttribute(attributeName);

    return attributeValue ? attributeValue.toString() : null;
};

/*
* Selects the first option with a matching label from the select box element
* provided. If no matching element is found, nothing happens.
*/
PageBot.prototype.selectOptionWithLabel = function(element, stringValue) {
    triggerEvent(element, 'focus', false);
    for (var i = 0; i < element.options.length; i++) {
        var option = element.options[i];
        if (option.text == stringValue) {
            if (!option.selected) {
                option.selected = true;
                triggerEvent(element, 'change', true);
            }
            triggerEvent(element, 'blur', false);
            return;
        }
    }
    throw new Error("Option with label '" + stringValue + "' not found");
};

PageBot.prototype.replaceText = function(element, stringValue) {
    triggerEvent(element, 'focus', false);
    triggerEvent(element, 'select', true);
    element.value=stringValue;
    if (isIE || isKonqueror || isSafari) {
        triggerEvent(element, 'change', true);
    }
    triggerEvent(element, 'blur', false);
};

MozillaPageBot.prototype.clickElement = function(element) {

    triggerEvent(element, 'focus', false);

    // Add an event listener that detects if the default action has been prevented.
    // (This is caused by a javascript onclick handler returning false)
    var preventDefault = false;
    if (geckoVersion) {
        element.addEventListener("click", function(evt) {preventDefault = evt.getPreventDefault();}, false);
    }

    // Trigger the click event.
    triggerMouseEvent(element, 'click', true);

    // In FireFox < 1.0 Final, and Mozilla <= 1.7.3, just sending the click event is enough.
    // But in newer versions, we need to do it ourselves.
    var needsProgrammaticClick = (geckoVersion > '20041025');
    // Perform the link action if preventDefault was set.
    if (needsProgrammaticClick && !preventDefault) {
        // Try the element itself, as well as it's parent - this handles clicking images inside links.
        if (element.href) {
            this.currentWindow.location.href = element.href;
        }
        else if (element.parentNode.href) {
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
        triggerEvent(element, 'click', true);

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

    // Onchange event is not triggered automatically in Safari.
    if (isDefined(element.checked) && wasChecked != element.checked) {
        triggerEvent(element, 'change', true);
    }

    if (this.windowClosed()) {
        return;
    }

    triggerEvent(element, 'blur', false);
};

IEPageBot.prototype.clickElement = function(element) {

    triggerEvent(element, 'focus', false);

    var wasChecked = element.checked;
    element.click();

    if (this.windowClosed()) {
        return;
    }
    // Onchange event is not triggered automatically in IE.
    if (isDefined(element.checked) && wasChecked != element.checked) {
        triggerEvent(element, 'change', true);
    }

    triggerEvent(element, 'blur', false);
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

PageBot.prototype.setContext = function(strContext) {
     //set the current test title
    context.innerHTML=strContext;
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
