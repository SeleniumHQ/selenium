/*
 * This script provides the Javascript API to drive the test application contained within
 * a Browser Window.
 * TODO:
 *    Add support for more events (keyboard and mouse)
 *    Allow to switch "user-entry" mode from mouse-based to keyboard-based, firing different
 *          events in different modes.
 *    Use prototypes to make this all a bit more OO. Maybe modify the underlying DOM of the
 *          TestApp to provided methods like HTMLTextInput.appendText() etc...
 */

// The window to which the commands will be sent.  For example, to click on a
// popup window, first select that window, and then do a normal click command.
currentWindowName = null;

currentDocument = null;

var browserName=navigator.appName;
var isIE = (browserName =="Microsoft Internet Explorer");

// Modify the DOM of the test frame window - not sure if this is necessary.
modifyWindow(window);

//Required so "click" method can be sent to anchor ("A") tags in Mozilla
function modifyWindow(windowObject) {
    if (!isIE) {
	    windowObject.HTMLAnchorElement.prototype.click = function() {
	        var evt = this.ownerDocument.createEvent('MouseEvents');
	        evt.initMouseEvent('click', true, true, this.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
	        this.dispatchEvent(evt);
	    }

	    windowObject.HTMLImageElement.prototype.mousedown = function() {
	                    var evt = this.ownerDocument.createEvent('MouseEvents');
	                    evt.initMouseEvent('mousedown', true, true, this.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
	                    this.dispatchEvent(evt);
	    }
    }
}

/*
 * In IE, getElementById() also searches by name.
 * To provied consistent functionality with Firefox, we
 * search by name attribute if an element with the id isn't found.
 */
function findElementByIdOrName(idOrName) {
    var element = getDoc().getElementById(idOrName);

    if (element == null
        && !isIE // IE checks this without asking
        && document.evaluate // DOM3 XPath
        )
    {
        var xpath = "//*[@name='" + idOrName + "']";
        element = document.evaluate(xpath, getDoc(), null, 0, null).iterateNext();
    }

    return element;
}

function selectOptionWithLabel(element, stringValue) {
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

function replaceText(element, stringValue) {
    triggerEvent(element, 'focus', false);
    triggerEvent(element, 'select', true);
    element.value=stringValue;
    if (isIE) {
        triggerEvent(element, 'change', true);
    }
    triggerEvent(element, 'blur', false);
}

/*
 * The 'invoke' method will call the required function, and then
 * remove itself from the window object. This allows a calling app
 * to provide a callback listener for the window load event, without the
 * calling app needing to worry about cleaning up afterward.
 * TODO: This could be more generic, but suffices for now.
 */
function SelfRemovingLoadListener(fn) {
    this.fn=fn;
    var self = this;

    this.invoke=function () {
        try {
            fn();
        } finally {
            currentDocument = null;
            removeLoadListener(getIframe(), self.invoke);
        }
    }
}

function clickElement(element, loadCallback) {
    if (loadCallback) {
        var el = new SelfRemovingLoadListener(loadCallback);
        addLoadListener(getIframe(), el.invoke);
    }

    triggerEvent(element, 'focus', false);

// DD REMOVED: This appears unnecessary in all of my testing.
//         Could it be the relic of an earlier experiment?
/*
    // If this is a javascript call ("javascript:foo()"), pull out the
    // function part and just call that.
    if(element.toString().indexOf("javascript") == 0) {
        array = element.toString().split(':');

        // Prepend the window onto the javascript function.  This is very
        // hacky, but if we don't do this, the function can't be found.
        eval("getContentWindow().window." + currentWindow + "."+array[1]);
    }
    else {
*/
    var wasChecked = element.checked;
    triggerEvent(element, 'click', false);
    element.click();
    if (isIE && isDefined(element.checked) && wasChecked != element.checked) {
        triggerEvent(element, 'change', true);
    }

    triggerEvent(element, 'blur', false);
}

function onclickElement(element, loadCallback) {
    if (loadCallback) {
        var el = new SelfRemovingLoadListener(loadCallback);
        addLoadListener(getIframe(), el.invoke);
    }

    element.click();
}

function isDefined(value) {
    return typeof(value) != undefined;
}

function getContentWindow() {
    return getIframe().contentWindow
}

function getIframe() {
    return document.getElementById('myiframe');
}

function getDoc(){
    if(currentDocument == null) {
        var testWindow = getContentWindow();
        if (currentWindowName != null) {
	        commandStr = "getContentWindow().window." + currentWindowName;
	        testWindow = eval(commandStr);
        }
	    modifyWindow(testWindow);
	    currentDocument = testWindow.document;
    }

    return currentDocument;
}

function selectWindow(target) {
    if(target == "null")
        currentWindowName = null;
    else {
        // If window exists
        if(eval("getContentWindow().window." + target))
            currentWindowName = target;
        else
            throw new Error("Window does not exist");
    }
}

function openLocation(target, onloadCallback) {
    var el = new SelfRemovingLoadListener(onloadCallback);
    addLoadListener(getIframe(), el.invoke);
    getIframe().src = target;
}

function clearOnBeforeUnload(){
	//For IE: even though the event was linked to the window, the event appears to be attached to the 'body' object in IE.
    getContentWindow().document.body.onbeforeunload = null;
   	getContentWindow().onbeforeunload = null;
}
