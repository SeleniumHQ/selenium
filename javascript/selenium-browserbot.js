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

var browserName=navigator.appName;
var isIE = (browserName =="Microsoft Internet Explorer");
// Get the Gecko version as an 8 digit date. 
var geckoResult = /^Mozilla\/5\.0 .*Gecko\/(\d{8}).*$/.exec(navigator.userAgent);
var geckoVersion = geckoResult == null ? null : geckoResult[1];



/*
 * The 'invoke' method will call the required function, and then
 * remove itself from the window object. This allows a calling app
 * to provide a callback listener for the window load event, without the
 * calling app needing to worry about cleaning up afterward.
 * TODO: This could be more generic, but suffices for now.
 */
function SelfRemovingLoadListener(fn, frame) {
    var self = this;

    this.invoke=function () {
        try {
            // we've moved to a new page - clear the current one
            browserbot.currentPage = null;
            fn();
        } finally {
            removeLoadListener(frame, self.invoke);
        }
    }
}

BrowserBot = function(frame) {
    this.frame = frame;
    this.currentPage = null;
    this.currentWindowName = null;
    
    this.recordedAlerts = new Array();

}

BrowserBot.prototype.recordAlert = function(alert) {
   this.recordedAlerts.push(alert);
}

/*
 *  Indicates any alerts have been generated
 */
BrowserBot.prototype.hasAlerts = function() {
   return (this.recordedAlerts.length > 0) ;
}

/*
 * Retreives the next alert
 */
BrowserBot.prototype.getNextAlert = function() {
   return this.recordedAlerts.shift();
}

BrowserBot.prototype.getFrame = function() {
    return this.frame;
}

BrowserBot.prototype.getContentWindow = function() {
    return this.getFrame().contentWindow
}

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
}

BrowserBot.prototype.openLocation = function(target, onloadCallback) {
    // We're moving to a new page - clear the current one
    this.currentPage = null;
    this.callOnNextPageLoad(onloadCallback);
    this.getFrame().src = target;
}

BrowserBot.prototype.getCurrentPage = function() {
    if (this.currentPage == null) {
        var testWindow = this.getContentWindow().window;
        if (this.currentWindowName != null) {
            testWindow = this.getTargetWindow(this.currentWindowName);
        }
        this.currentPage = new PageBot(testWindow, this)
    }
    return this.currentPage;
}

BrowserBot.prototype.getTargetWindow = function(windowName) {
    var evalString = "this.getContentWindow().window." + windowName;
    var targetWindow = eval(evalString);
    if (!targetWindow) {
        throw new Error("Window does not exist");
    }
    return targetWindow;
}

BrowserBot.prototype.callOnNextPageLoad = function(onloadCallback) {
    if (onloadCallback) {
        var el = new SelfRemovingLoadListener(onloadCallback, this.frame);
        addLoadListener(this.getFrame(), el.invoke);
    }
}


PageBot = function(pageWindow, browserBot) {
    this.currentWindow = pageWindow;
    this.browserBot = browserBot;
    this.currentDocument = pageWindow.document;
    this.location = pageWindow.location.pathname;
    this.title = function() {return this.currentDocument.title};

    modifyWindowToRecordAlerts(pageWindow, browserBot);

    //SPIKE factor this better via TDD
    function clearPageCache() {
       browserbot.currentPage = null;
    }
    
    if (window.addEventListener) {
        this.currentWindow.addEventListener("unload",clearPageCache, true);
    }     
    else if (window.attachEvent) {
        this.currentWindow.attachEvent("onunload",clearPageCache);
    } 
    // End SPIKE
    
    function modifyWindowToRecordAlerts(window, browserBot) {     
         window.alert = function(alert){browserBot.recordAlert(alert);};
    }

    this.locators = new Array();
    this.locators.push(this.findIdentifiedElement);
    this.locators.push(this.findElementByDomTraversal);
    this.locators.push(this.findElementByXPath);
}

/*
 * Finds an element on the current page, using various lookup protocols
 */
PageBot.prototype.findElement = function(locator) {
    // Try the locators one at a time.
    for (var i = 0; i < this.locators.length; i++) {
        var locatorFunction = this.locators[i];
        var element = locatorFunction.call(this, locator);
        if (element != null) {
            return element;
        }
    }

    // Element was not found by any locator function.
    throw new Error("Element " + locator + " not found");
}

/*
 * In IE, getElementById() also searches by name.
 * To provied consistent functionality with Firefox, we
 * search by name attribute if an element with the id isn't found.
 */
PageBot.prototype.findIdentifiedElement = function(identifier) {
    // Since we try to get an id with _any_ string, we need to handle
    // cases where this causes an exception.
    try {
        var element = this.currentDocument.getElementById(identifier);
        if (element == null
            && !isIE // IE checks this without asking
            && document.evaluate )// DOM3 XPath
        {
             var xpath = "//*[@name='" + identifier + "']";
             element = document.evaluate(xpath, this.currentDocument, null, 0, null).iterateNext();
        }
    } catch (e) {
        return null;
    }

    return element;
}

/**
 * Finds an element using by evaluating the "document.*" string against the
 * current document object. Dom expressions must begin with "document."
 */
PageBot.prototype.findElementByDomTraversal = function(domTraversal) {
    if (domTraversal.indexOf("document.") != 0) {
        return null;
    }

    // Trim the leading 'document'
    domTraversal = domTraversal.substr(9);
    var locatorScript = "this.currentDocument." + domTraversal;
    var element = eval(locatorScript);

    if (!element) {
         return null;
    }

    return element;
}

/**
 * Finds an element identified by the xpath expression. Expressions _must_
 * begin with "//".
 */
PageBot.prototype.findElementByXPath = function(xpath) {
    if (xpath.indexOf("//") != 0) {
        return null;
    }

    // If the document doesn't support XPath, mod it with html-xpath.
    // This only works for IE.
    if (!this.currentDocument.evaluate) {
        addXPathSupport(this.currentDocument);
    }

    // If we still don't have XPath bail.
    // TODO implement subset of XPath for browsers without native support.
    if (!this.currentDocument.evaluate) {
        throw new Error("XPath not supported");
    }

    return this.currentDocument.evaluate(xpath, this.currentDocument, null, 0, null).iterateNext();
}

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
        }
    }
    triggerEvent(element, 'blur', false);
}

PageBot.prototype.replaceText = function(element, stringValue) {
    triggerEvent(element, 'focus', false);
    triggerEvent(element, 'select', true);
    element.value=stringValue;
    if (isIE) {
        triggerEvent(element, 'change', true);
    }
    triggerEvent(element, 'blur', false);
}

PageBot.prototype.clickElement = function(element) {

    triggerEvent(element, 'focus', false);

    var wasChecked = element.checked;
    if (isIE) {
        element.click();
    }
    else {
        // Add an event listener that detects if the default action has been prevented.
        var preventDefault = false;
        element.addEventListener("click", function(evt) {preventDefault = evt.getPreventDefault()}, false);

        // Trigger the click event.
        triggerMouseEvent(element, 'click', true);

        // In FireFox < 1.0 Final, and Mozilla <= 1.7.3, just sending the click event is enough.
        // But in newer versions, we need to do it ourselves.
        var needsProgrammaticClick = (geckoVersion > '20041025');
        // Perform the link action if preventDefault was set.
        if (needsProgrammaticClick && element.href  && !preventDefault) {
            this.currentWindow.location.href = element.href;
        }
    }

    if (this.windowClosed()) {
        return;
    }
    // Onchange event is not triggered automatically in IE.
    if (isIE && isDefined(element.checked) && wasChecked != element.checked) {
        triggerEvent(element, 'change', true);
    }

    triggerEvent(element, 'blur', false);
}

PageBot.prototype.windowClosed = function(element) {
    return this.currentWindow.closed;
}

PageBot.prototype.bodyText = function() {
    return getText(this.currentDocument.body)
}

function isDefined(value) {
    return typeof(value) != undefined;
}



