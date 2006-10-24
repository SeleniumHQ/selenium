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

// This script contains a badly-organised collection of miscellaneous
// functions that really better homes.

function classCreate() {
    return function() {
      this.initialize.apply(this, arguments);
    }
}

function objectExtend(destination, source) {
  for (var property in source) {
    destination[property] = source[property];
  }
  return destination;
}

function $() {
  var results = [], element;
  for (var i = 0; i < arguments.length; i++) {
    element = arguments[i];
    if (typeof element == 'string')
      element = document.getElementById(element);
    results[results.length] = element;
  }
  return results.length < 2 ? results[0] : results;
}

function $A(iterable) {
  if (!iterable) return [];
  if (iterable.toArray) {
    return iterable.toArray();
  } else {
    var results = [];
    for (var i = 0; i < iterable.length; i++)
      results.push(iterable[i]);
    return results;
  }
}

function fnBind() {
  var args = $A(arguments), __method = args.shift(), object = args.shift();
  return function() {
    return __method.apply(object, args.concat($A(arguments)));
  }
}

function fnBindAsEventListener(fn, object) {
  var __method = fn;
  return function(event) {
    return __method.call(object, event || window.event);
  }
}

function removeClassName(element, name) {
    var re = new RegExp("\\b" + name + "\\b", "g");
    element.className = element.className.replace(re, "");
}

function addClassName(element, name) {
    element.className = element.className + ' ' + name;
}

function elementSetStyle(element, style) {
    for (var name in style) {
      element.style[name] = style[name];
    }
}

function elementGetStyle(element, style) {
    var value = element.style[style];
    if (!value) {
      if (document.defaultView && document.defaultView.getComputedStyle) {
        var css = document.defaultView.getComputedStyle(element, null);
        value = css ? css.getPropertyValue(style) : null;
      } else if (element.currentStyle) {
        value = element.currentStyle[style];
      }
    }

    /** DGF necessary? 
    if (window.opera && ['left', 'top', 'right', 'bottom'].include(style))
      if (Element.getStyle(element, 'position') == 'static') value = 'auto'; */

    return value == 'auto' ? null : value;
  }

String.prototype.trim = function() {
    var result = this.replace(/^\s+/g, "");
    // strip leading
    return result.replace(/\s+$/g, "");
    // strip trailing
};
String.prototype.lcfirst = function() {
    return this.charAt(0).toLowerCase() + this.substr(1);
};
String.prototype.ucfirst = function() {
    return this.charAt(0).toUpperCase() + this.substr(1);
};
String.prototype.startsWith = function(str) {
    return this.indexOf(str) == 0;
};

// Returns the text in this element
function getText(element) {
    var text = "";

    var isRecentFirefox = (browserVersion.isFirefox && browserVersion.firefoxVersion >= "1.5");
    if (isRecentFirefox || browserVersion.isKonqueror || browserVersion.isSafari || browserVersion.isOpera) {
        text = getTextContent(element);
    } else if (element.textContent) {
        text = element.textContent;
    } else if (element.innerText) {
        text = element.innerText;
    }

    text = normalizeNewlines(text);
    text = normalizeSpaces(text);

    return text.trim();
}

function getTextContent(element, preformatted) {
    if (element.nodeType == 3 /*Node.TEXT_NODE*/) {
        var text = element.data;
        if (!preformatted) {
            text = text.replace(/\n|\r|\t/g, " ");
        }
        return text;
    }
    if (element.nodeType == 1 /*Node.ELEMENT_NODE*/) {
        var childrenPreformatted = preformatted || (element.tagName == "PRE");
        var text = "";
        for (var i = 0; i < element.childNodes.length; i++) {
            var child = element.childNodes.item(i);
            text += getTextContent(child, childrenPreformatted);
        }
        // Handle block elements that introduce newlines
        // -- From HTML spec:
        //<!ENTITY % block
        //     "P | %heading; | %list; | %preformatted; | DL | DIV | NOSCRIPT |
        //      BLOCKQUOTE | F:wORM | HR | TABLE | FIELDSET | ADDRESS">
        //
        // TODO: should potentially introduce multiple newlines to separate blocks
        if (element.tagName == "P" || element.tagName == "BR" || element.tagName == "HR" || element.tagName == "DIV") {
            text += "\n";
        }
        return text;
    }
    return '';
}

/**
 * Convert all newlines to \m
 */
function normalizeNewlines(text)
{
    return text.replace(/\r\n|\r/g, "\n");
}

/**
 * Replace multiple sequential spaces with a single space, and then convert &nbsp; to space.
 */
function normalizeSpaces(text)
{
    // IE has already done this conversion, so doing it again will remove multiple nbsp
    if (browserVersion.isIE)
    {
        return text;
    }

    // Replace multiple spaces with a single space
    // TODO - this shouldn't occur inside PRE elements
    text = text.replace(/\ +/g, " ");

    // Replace &nbsp; with a space
    var nbspPattern = new RegExp(String.fromCharCode(160), "g");
    if (browserVersion.isSafari) {
	return replaceAll(text, String.fromCharCode(160), " ");
    } else {
	return text.replace(nbspPattern, " ");
    }
}

function replaceAll(text, oldText, newText) {
    while (text.indexOf(oldText) != -1) {
	text = text.replace(oldText, newText);
    }
    return text;
}


function xmlDecode(text) {
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&apos;/g, "'");
    text = text.replace(/&lt;/g, "<");
    text = text.replace(/&gt;/g, ">");
    text = text.replace(/&amp;/g, "&");
    return text;
}

// Sets the text in this element
function setText(element, text) {
    if (element.textContent) {
        element.textContent = text;
    } else if (element.innerText) {
        element.innerText = text;
    }
}

// Get the value of an <input> element
function getInputValue(inputElement) {
    if (inputElement.type.toUpperCase() == 'CHECKBOX' ||
        inputElement.type.toUpperCase() == 'RADIO')
    {
        return (inputElement.checked ? 'on' : 'off');
    }
    return inputElement.value;
}

/* Fire an event in a browser-compatible manner */
function triggerEvent(element, eventType, canBubble, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
    canBubble = (typeof(canBubble) == undefined) ? true : canBubble;
    if (element.fireEvent) {
        var evt = createEventObject(element, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown);        
        element.fireEvent('on' + eventType, evt);
    }
    else {
        var evt = document.createEvent('HTMLEvents');
        
        evt.shiftKey = shiftKeyDown;
        evt.metaKey = metaKeyDown;
        evt.altKey = altKeyDown;
        evt.ctrlKey = controlKeyDown;
        
        evt.initEvent(eventType, canBubble, true);
        element.dispatchEvent(evt);
    }
}

function getKeyCodeFromKeySequence(keySequence) {
    var match = /^\\(\d{1,3})$/.exec(keySequence);
    if (match != null) {
        return match[1];
    }
    match = /^.$/.exec(keySequence);
    if (match != null) {
        return match[0].charCodeAt(0);
    }
    // this is for backward compatibility with existing tests
    // 1 digit ascii codes will break however because they are used for the digit chars
    match = /^\d{2,3}$/.exec(keySequence);
    if (match != null) {
        return match[0];
    }
    throw SeleniumError("invalid keySequence");
}

function createEventObject(element, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
     var evt = element.ownerDocument.createEventObject();
     evt.shiftKey = shiftKeyDown;
     evt.metaKey = metaKeyDown;
     evt.altKey = altKeyDown;
     evt.ctrlKey = controlKeyDown;
     return evt;
}

function triggerKeyEvent(element, eventType, keySequence, canBubble, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
    var keycode = getKeyCodeFromKeySequence(keySequence);
    canBubble = (typeof(canBubble) == undefined) ? true : canBubble;
    if (element.fireEvent) {
        var keyEvent = createEventObject(element, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown);
        keyEvent.keyCode = keycode;
        element.fireEvent('on' + eventType, keyEvent);
    }
    else {
        var evt;
        if (window.KeyEvent) {
            evt = document.createEvent('KeyEvents');
            evt.initKeyEvent(eventType, true, true, window, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown, keycode, keycode);
        } else {
            evt = document.createEvent('UIEvents');
            
            evt.shiftKey = shiftKeyDown;
            evt.metaKey = metaKeyDown;
            evt.altKey = altKeyDown;
            evt.ctrlKey = controlKeyDown;

            evt.initUIEvent(eventType, true, true, window, 1);
            evt.keyCode = keycode;
        }

        element.dispatchEvent(evt);
    }
}

/* Fire a mouse event in a browser-compatible manner */
function triggerMouseEvent(element, eventType, canBubble, clientX, clientY, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
    clientX = clientX ? clientX : 0;
    clientY = clientY ? clientY : 0;

    LOG.warn("triggerMouseEvent assumes setting screenX and screenY to 0 is ok");
    var screenX = 0;
    var screenY = 0;

    canBubble = (typeof(canBubble) == undefined) ? true : canBubble;
    if (element.fireEvent) {
        LOG.info("element has fireEvent");
        var evt = createEventObject(element, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown);
        evt.detail = 0;
        evt.button = 1;
        evt.relatedTarget = null;
        if (!screenX && !screenY && !clientX && !clientY) {
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
        LOG.info("element doesn't have fireEvent");
        var evt = document.createEvent('MouseEvents');
        if (evt.initMouseEvent)
        {
            LOG.info("element has initMouseEvent");
            //Safari
            evt.initMouseEvent(eventType, canBubble, true, document.defaultView, 1, screenX, screenY, clientX, clientY, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown, 0, null)
        }
        else {
        	LOG.warn("element doesn't have initMouseEvent; firing an event which should -- but doesn't -- have other mouse-event related attributes here, as well as controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown");
            evt.initEvent(eventType, canBubble, true);
            
            evt.shiftKey = shiftKeyDown;
            evt.metaKey = metaKeyDown;
            evt.altKey = altKeyDown;
            evt.ctrlKey = controlKeyDown;

        }
        element.dispatchEvent(evt);
    }
}

function removeLoadListener(element, command) {
    LOG.info('Removing loadListenter for ' + element + ', ' + command);
    if (window.removeEventListener)
        element.removeEventListener("load", command, true);
    else if (window.detachEvent)
        element.detachEvent("onload", command);
}

function addLoadListener(element, command) {
    LOG.info('Adding loadListenter for ' + element + ', ' + command);
    if (window.addEventListener && !browserVersion.isOpera)
        element.addEventListener("load", command, true);
    else if (window.attachEvent)
        element.attachEvent("onload", command);
}

/**
 * Override the broken getFunctionName() method from JsUnit
 * This file must be loaded _after_ the jsunitCore.js
 */
function getFunctionName(aFunction) {
    var regexpResult = aFunction.toString().match(/function (\w*)/);
    if (regexpResult && regexpResult[1]) {
        return regexpResult[1];
    }
    return 'anonymous';
}

function getDocumentBase(doc) {
    var bases = document.getElementsByTagName("base");
    if (bases && bases.length && bases[0].href) {
        return bases[0].href;
    }
    return "";
}

function describe(object, delimiter) {
    var props = new Array();
    for (var prop in object) {
        try {
            props.push(prop + " -> " + object[prop]);
        } catch (e) {
            props.push(prop + " -> [htmlutils: ack! couldn't read this property! (Permission Denied?)]");
        }
    }
    return props.join(delimiter || '\n');
}

var PatternMatcher = function(pattern) {
    this.selectStrategy(pattern);
};
PatternMatcher.prototype = {

    selectStrategy: function(pattern) {
        this.pattern = pattern;
        var strategyName = 'glob';
        // by default
        if (/^([a-z-]+):(.*)/.test(pattern)) {
            var possibleNewStrategyName = RegExp.$1;
            var possibleNewPattern = RegExp.$2;
            if (PatternMatcher.strategies[possibleNewStrategyName]) {
                strategyName = possibleNewStrategyName;
                pattern = possibleNewPattern;
            }
        }
        var matchStrategy = PatternMatcher.strategies[strategyName];
        if (!matchStrategy) {
            throw new SeleniumError("cannot find PatternMatcher.strategies." + strategyName);
        }
        this.strategy = matchStrategy;
        this.matcher = new matchStrategy(pattern);
    },

    matches: function(actual) {
        return this.matcher.matches(actual + '');
        // Note: appending an empty string avoids a Konqueror bug
    }

};

/**
 * A "static" convenience method for easy matching
 */
PatternMatcher.matches = function(pattern, actual) {
    return new PatternMatcher(pattern).matches(actual);
};

PatternMatcher.strategies = {

/**
 * Exact matching, e.g. "exact:***"
 */
    exact: function(expected) {
        this.expected = expected;
        this.matches = function(actual) {
            return actual == this.expected;
        };
    },

/**
 * Match by regular expression, e.g. "regexp:^[0-9]+$"
 */
    regexp: function(regexpString) {
        this.regexp = new RegExp(regexpString);
        this.matches = function(actual) {
            return this.regexp.test(actual);
        };
    },

    regex: function(regexpString) {
        this.regexp = new RegExp(regexpString);
        this.matches = function(actual) {
            return this.regexp.test(actual);
        };
    },

/**
 * "globContains" (aka "wildmat") patterns, e.g. "glob:one,two,*",
 * but don't require a perfect match; instead succeed if actual
 * contains something that matches globString.
 * Making this distinction is motivated by a bug in IE6 which
 * leads to the browser hanging if we implement *TextPresent tests
 * by just matching against a regular expression beginning and
 * ending with ".*".  The globcontains strategy allows us to satisfy
 * the functional needs of the *TextPresent ops more efficiently
 * and so avoid running into this IE6 freeze.
 */
    globContains: function(globString) {
        this.regexp = new RegExp(PatternMatcher.regexpFromGlobContains(globString));
        this.matches = function(actual) {
            return this.regexp.test(actual);
        };
    },


/**
 * "glob" (aka "wildmat") patterns, e.g. "glob:one,two,*"
 */
    glob: function(globString) {
        this.regexp = new RegExp(PatternMatcher.regexpFromGlob(globString));
        this.matches = function(actual) {
            return this.regexp.test(actual);
        };
    }

};

PatternMatcher.convertGlobMetaCharsToRegexpMetaChars = function(glob) {
    var re = glob;
    re = re.replace(/([.^$+(){}\[\]\\|])/g, "\\$1");
    re = re.replace(/\?/g, "(.|[\r\n])");
    re = re.replace(/\*/g, "(.|[\r\n])*");
    return re;
};

PatternMatcher.regexpFromGlobContains = function(globContains) {
    return PatternMatcher.convertGlobMetaCharsToRegexpMetaChars(globContains);
};

PatternMatcher.regexpFromGlob = function(glob) {
    return "^" + PatternMatcher.convertGlobMetaCharsToRegexpMetaChars(glob) + "$";
};

var Assert = {

    fail: function(message) {
        throw new AssertionFailedError(message);
    },

/*
* Assert.equals(comment?, expected, actual)
*/
    equals: function() {
        var args = new AssertionArguments(arguments);
        if (args.expected === args.actual) {
            return;
        }
        Assert.fail(args.comment +
                    "Expected '" + args.expected +
                    "' but was '" + args.actual + "'");
    },

/*
* Assert.matches(comment?, pattern, actual)
*/
    matches: function() {
        var args = new AssertionArguments(arguments);
        if (PatternMatcher.matches(args.expected, args.actual)) {
            return;
        }
        Assert.fail(args.comment +
                    "Actual value '" + args.actual +
                    "' did not match '" + args.expected + "'");
    },

/*
* Assert.notMtches(comment?, pattern, actual)
*/
    notMatches: function() {
        var args = new AssertionArguments(arguments);
        if (!PatternMatcher.matches(args.expected, args.actual)) {
            return;
        }
        Assert.fail(args.comment +
                    "Actual value '" + args.actual +
                    "' did match '" + args.expected + "'");
    }

};

// Preprocess the arguments to allow for an optional comment.
function AssertionArguments(args) {
    if (args.length == 2) {
        this.comment = "";
        this.expected = args[0];
        this.actual = args[1];
    } else {
        this.comment = args[0] + "; ";
        this.expected = args[1];
        this.actual = args[2];
    }
}

function AssertionFailedError(message) {
    this.isAssertionFailedError = true;
    this.isSeleniumError = true;
    this.message = message;
    this.failureMessage = message;
}

function SeleniumError(message) {
    var error = new Error(message);
    error.isSeleniumError = true;
    return error;
}

var Effect = new Object();

objectExtend(Effect, {
    highlight : function(element) {
        var highLightColor = "yellow";
        if (element.originalColor == undefined) { // avoid picking up highlight
            element.originalColor = elementGetStyle(element, "background-color");
        }
        elementSetStyle(element, {"background-color" : highLightColor});
        window.setTimeout(function() {
            //if element is orphan, probably page of it has already gone, so ignore
            if (!element.parentNode) {
                return;
            }
            elementSetStyle(element, {"background-color" : element.originalColor});
        }, 200);
    }
});


// for use from vs.2003 debugger
function o2s(obj) {
    var s = "";
    for (key in obj) {
        var line = key + "->" + obj[key];
        line.replace("\n", " ");
        s += line + "\n";
    }
    return s;
}

var seenReadyStateWarning = false;

function openSeparateApplicationWindow(url) {
    // resize the Selenium window itself
    window.resizeTo(1200, 500);
    window.moveTo(window.screenX, 0);

    var appWindow = window.open(url + '?start=true', 'main');
    try {
        var windowHeight = 500;
        if (window.outerHeight) {
            windowHeight = window.outerHeight;
        } else if (document.documentElement && document.documentElement.offsetHeight) {
            windowHeight = document.documentElement.offsetHeight;
        }

        if (window.screenLeft && !window.screenX) window.screenX = window.screenLeft;
        if (window.screenTop && !window.screenY) window.screenY = window.screenTop;

        appWindow.resizeTo(1200, screen.availHeight - windowHeight - 60);
        appWindow.moveTo(window.screenX, window.screenY + windowHeight + 25);
    } catch (e) {
        LOG.error("Couldn't resize app window");
        LOG.exception(e);
    }


    if (window.document.readyState == null && !seenReadyStateWarning) {
        alert("Beware!  Mozilla bug 300992 means that we can't always reliably detect when a new page has loaded.  Install the Selenium IDE extension or the readyState extension available from selenium.openqa.org to make page load detection more reliable.");
        seenReadyStateWarning = true;
    }

    return appWindow;
}

var URLConfiguration = classCreate();
objectExtend(URLConfiguration.prototype, {
    initialize: function() {
    },
    _isQueryParameterTrue: function (name) {
        var parameterValue = this._getQueryParameter(name);
        if (parameterValue == null) return false;
        if (parameterValue.toLowerCase() == "true") return true;
        if (parameterValue.toLowerCase() == "on") return true;
        return false;
    },

    _getQueryParameter: function(searchKey) {
        var str = this.queryString
        if (str == null) return null;
        var clauses = str.split('&');
        for (var i = 0; i < clauses.length; i++) {
            var keyValuePair = clauses[i].split('=', 2);
            var key = unescape(keyValuePair[0]);
            if (key == searchKey) {
                return unescape(keyValuePair[1]);
            }
        }
        return null;
    },

    _extractArgs: function() {
        var str = SeleniumHTARunner.commandLine;
        if (str == null || str == "") return new Array();
        var matches = str.match(/(?:\"([^\"]+)\"|(?!\"([^\"]+)\")(\S+))/g);
        // We either want non quote stuff ([^"]+) surrounded by quotes
        // or we want to look-ahead, see that the next character isn't
        // a quoted argument, and then grab all the non-space stuff
        // this will return for the line: "foo" bar
        // the results "\"foo\"" and "bar"

        // So, let's unquote the quoted arguments:
        var args = new Array;
        for (var i = 0; i < matches.length; i++) {
            args[i] = matches[i];
            args[i] = args[i].replace(/^"(.*)"$/, "$1");
        }
        return args;
    },

    isMultiWindowMode:function() {
        return this._isQueryParameterTrue('multiWindow');
    }
});


function safeScrollIntoView(element) {
    if (element.scrollIntoView) {
        element.scrollIntoView(false);
        return;
    }
    // TODO: work out how to scroll browsers that don't support
    // scrollIntoView (like Konqueror)
}
