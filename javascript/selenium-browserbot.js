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
            fn();
        } finally {
            // we've moved to a new page - clear the current one
            browserbot.currentPage = null;
            removeLoadListener(frame, self.invoke);
        }
    }
}

BrowserBot = function(frame) {
    this.frame = frame;
    this.currentPage = null;
    this.currentWindowName = null;
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
// TODO: Cache the currentPage
// We currently don't do this as we have no way of telling when it becomes "stale" (eg we move to a new page, and pause).

//    if (this.currentPage == null) {
        var testWindow = this.getContentWindow().window;
        if (this.currentWindowName != null) {
            testWindow = this.getTargetWindow(this.currentWindowName);
        }
        this.currentPage = new PageBot(testWindow, this)
//    }
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

    this.location = pageWindow.location.pathname
}

/*
 * Finds an element on the current page, using various lookup protocols
 */
PageBot.prototype.findElement = function(locator) {
    // First try using id/name search
    var element = this.findIdentifiedElement(locator);

    // Next, if the locator starts with 'document.', try to use Dom traversal
    if (element == null && locator.indexOf("document.") == 0) {
        var domTraversal = locator.substr(9)
        element = this.findElementByDomTraversal(domTraversal)
    }

    // TODO: try xpath

    if (element == null) {
        throw new Error("Element " + locator + " not found");
    }

    return element;
}

/*
 * In IE, getElementById() also searches by name.
 * To provied consistent functionality with Firefox, we
 * search by name attribute if an element with the id isn't found.
 */
PageBot.prototype.findIdentifiedElement = function(identifier) {
    var element = this.currentDocument.getElementById(identifier);

    if (element == null
        && !isIE // IE checks this without asking
        && document.evaluate // DOM3 XPath
        )
    {
        var xpath = "//*[@name='" + identifier + "']";
        element = document.evaluate(xpath, this.currentDocument, null, 0, null).iterateNext();
    }

    return element;
}

PageBot.prototype.findElementByDomTraversal = function(domTraversal) {
    // Trim the leading 'document'
    if (domTraversal.indexOf("document.") == 0) {
        domTraversal = domTraversal.substr(9);
    }

    var locatorScript = "this.currentDocument." + domTraversal;
    var element = eval(locatorScript);

    if (!element) {
         return null;
    }

    return element;
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
        triggerMouseEvent(element, 'click', true);
    }
    // Onchange event is not triggered automatically in IE.
    if (isIE && isDefined(element.checked) && wasChecked != element.checked) {
        triggerEvent(element, 'change', true);
    }

    triggerEvent(element, 'blur', false);
}

PageBot.prototype.bodyText = function() {
    return getText(this.currentDocument.body)
}

function isDefined(value) {
    return typeof(value) != undefined;
}



