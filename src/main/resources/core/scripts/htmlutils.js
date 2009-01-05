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

function sel$() {
  var results = [], element;
  for (var i = 0; i < arguments.length; i++) {
    element = arguments[i];
    if (typeof element == 'string')
      element = document.getElementById(element);
    results[results.length] = element;
  }
  return results.length < 2 ? results[0] : results;
}

function sel$A(iterable) {
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
  var args = sel$A(arguments), __method = args.shift(), object = args.shift();
  var retval = function() {
    return __method.apply(object, args.concat(sel$A(arguments)));
  }
  retval.__method = __method;
  return retval;
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
      var value = style[name];
      if (value == null) value = "";
      element.style[name] = value;
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

/**
 * Given a string literal that would appear in an XPath, puts it in quotes and
 * returns it. Special consideration is given to literals who themselves
 * contain quotes. It's possible for a concat() expression to be returned.
 */
String.prototype.quoteForXPath = function()
{
    if (/\'/.test(this)) {
        if (/\"/.test(this)) {
            // concat scenario
            var pieces = [];
            var a = "'", b = '"', c;
            for (var i = 0, j = 0; i < this.length;) {
                if (this.charAt(i) == a) {
                    // encountered a quote that cannot be contained in current
                    // quote, so need to flip-flop quoting scheme
                    if (j < i) {
                        pieces.push(a + this.substring(j, i) + a);
                        j = i;
                    }
                    c = a;
                    a = b;
                    b = c;
                }
                else {
                    ++i;
                }
            }
            pieces.push(a + this.substring(j) + a);
            return 'concat(' + pieces.join(', ') + ')';
        }
        else {
            // quote with doubles
            return '"' + this + '"';
        }
    }
    // quote with singles
    return "'" + this + "'";
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
 * Convert all newlines to \n
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
    if (element.textContent != null) {
        element.textContent = text;
    } else if (element.innerText != null) {
        element.innerText = text;
    }
}

// Get the value of an <input> element
function getInputValue(inputElement) {
    if (inputElement.type) {
        if (inputElement.type.toUpperCase() == 'CHECKBOX' ||
            inputElement.type.toUpperCase() == 'RADIO')
        {
            return (inputElement.checked ? 'on' : 'off');
        }
    }
    if (inputElement.value == null) {
        throw new SeleniumError("This element has no value; is it really a form field?");
    }
    return inputElement.value;
}

/* Fire an event in a browser-compatible manner */
function triggerEvent(element, eventType, canBubble, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
    canBubble = (typeof(canBubble) == undefined) ? true : canBubble;
    if (element.fireEvent && element.ownerDocument && element.ownerDocument.createEventObject) { // IE
        var evt = createEventObject(element, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown);        
        element.fireEvent('on' + eventType, evt);
    }
    else {
        var evt = document.createEvent('HTMLEvents');
        
        try {
            evt.shiftKey = shiftKeyDown;
            evt.metaKey = metaKeyDown;
            evt.altKey = altKeyDown;
            evt.ctrlKey = controlKeyDown;
        } catch (e) {
            // On Firefox 1.0, you can only set these during initMouseEvent or initKeyEvent
            // we'll have to ignore them here
            LOG.exception(e);
        }
        
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
    throw new SeleniumError("invalid keySequence");
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
    if (element.fireEvent && element.ownerDocument && element.ownerDocument.createEventObject) { // IE
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
            evt.which = keycode;
        }

        element.dispatchEvent(evt);
    }
}

function removeLoadListener(element, command) {
    LOG.debug('Removing loadListenter for ' + element + ', ' + command);
    if (window.removeEventListener)
        element.removeEventListener("load", command, true);
    else if (window.detachEvent)
        element.detachEvent("onload", command);
}

function addLoadListener(element, command) {
    LOG.debug('Adding loadListenter for ' + element + ', ' + command);
    var augmentedCommand = function() {
        command.call(this, element);
    }
    if (window.addEventListener && !browserVersion.isOpera)
        element.addEventListener("load", augmentedCommand, true);
    else if (window.attachEvent)
        element.attachEvent("onload", augmentedCommand);
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

function getTagName(element) {
    var tagName;
    if (element && element.tagName && element.tagName.toLowerCase) {
        tagName = element.tagName.toLowerCase();
    }
    return tagName;
}

function selArrayToString(a) {
    if (isArray(a)) {
        // DGF copying the array, because the array-like object may be a non-modifiable nodelist
        var retval = [];
        for (var i = 0; i < a.length; i++) {
            var item = a[i];
            var replaced = new String(item).replace(/([,\\])/g, '\\$1');
            retval[i] = replaced;
        }
        return retval;
    }
    return new String(a);
}


function isArray(x) {
    return ((typeof x) == "object") && (x["length"] != null);
}

function absolutify(url, baseUrl) {
    /** returns a relative url in its absolute form, given by baseUrl.
    * 
    * This function is a little odd, because it can take baseUrls that
    * aren't necessarily directories.  It uses the same rules as the HTML 
    * &lt;base&gt; tag; if the baseUrl doesn't end with "/", we'll assume
    * that it points to a file, and strip the filename off to find its
    * base directory.
    *
    * So absolutify("foo", "http://x/bar") will return "http://x/foo" (stripping off bar),
    * whereas absolutify("foo", "http://x/bar/") will return "http://x/bar/foo" (preserving bar).
    * Naturally absolutify("foo", "http://x") will return "http://x/foo", appropriately.
    * 
    * @param url the url to make absolute; if this url is already absolute, we'll just return that, unchanged
    * @param baseUrl the baseUrl from which we'll absolutify, following the rules above.
    * @return 'url' if it was already absolute, or the absolutized version of url if it was not absolute.
    */
    
    // DGF isn't there some library we could use for this?
        
    if (/^\w+:/.test(url)) {
        // it's already absolute
        return url;
    }
    
    var loc;
    try {
        loc = parseUrl(baseUrl);
    } catch (e) {
        // is it an absolute windows file path? let's play the hero in that case
        if (/^\w:\\/.test(baseUrl)) {
            baseUrl = "file:///" + baseUrl.replace(/\\/g, "/");
            loc = parseUrl(baseUrl);
        } else {
            throw new SeleniumError("baseUrl wasn't absolute: " + baseUrl);
        }
    }
    loc.search = null;
    loc.hash = null;
    
    // if url begins with /, then that's the whole pathname
    if (/^\//.test(url)) {
        loc.pathname = url;
        var result = reassembleLocation(loc);
        return result;
    }
    
    // if pathname is null, then we'll just append "/" + the url
    if (!loc.pathname) {
        loc.pathname = "/" + url;
        var result = reassembleLocation(loc);
        return result;
    }
    
    // if pathname ends with /, just append url
    if (/\/$/.test(loc.pathname)) {
        loc.pathname += url;
        var result = reassembleLocation(loc);
        return result;
    }
    
    // if we're here, then the baseUrl has a pathname, but it doesn't end with /
    // in that case, we replace everything after the final / with the relative url
    loc.pathname = loc.pathname.replace(/[^\/\\]+$/, url);
    var result = reassembleLocation(loc);
    return result;
    
}

var URL_REGEX = /^((\w+):\/\/)(([^:]+):?([^@]+)?@)?([^\/\?:]*):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(.+)?/;

function parseUrl(url) {
    var fields = ['url', null, 'protocol', null, 'username', 'password', 'host', 'port', 'pathname', 'search', 'hash'];
    var result = URL_REGEX.exec(url);
    if (!result) {
        throw new SeleniumError("Invalid URL: " + url);
    }
    var loc = new Object();
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (field == null) {
            continue;
        }
        loc[field] = result[i];
    }
    return loc;
}

function reassembleLocation(loc) {
    if (!loc.protocol) {
        throw new Error("Not a valid location object: " + o2s(loc));
    }
    var protocol = loc.protocol;
    protocol = protocol.replace(/:$/, "");
    var url = protocol + "://";
    if (loc.username) {
        url += loc.username;
        if (loc.password) {
            url += ":" + loc.password;
        }
        url += "@";
    }
    if (loc.host) {
        url += loc.host;
    }
    
    if (loc.port) {
        url += ":" + loc.port;
    }
    
    if (loc.pathname) {
        url += loc.pathname;
    }
    
    if (loc.search) {
        url += "?" + loc.search;
    }
    if (loc.hash) {
        var hash = loc.hash;
        hash = loc.hash.replace(/^#/, "");
        url += "#" + hash;
    }
    return url;
}

function canonicalize(url) {
    if(url == "about:blank")
    {
	return url;
    }
    var tempLink = window.document.createElement("link");
    tempLink.href = url; // this will canonicalize the href on most browsers
    var loc = parseUrl(tempLink.href)
    if (!/\/\.\.\//.test(loc.pathname)) {
    	return tempLink.href;
    }
  	// didn't work... let's try it the hard way
  	var originalParts = loc.pathname.split("/");
  	var newParts = [];
  	newParts.push(originalParts.shift());
  	for (var i = 0; i < originalParts.length; i++) {
  		var part = originalParts[i];
  		if (".." == part) {
  			newParts.pop();
  			continue;
  		}
  		newParts.push(part);
  	}
  	loc.pathname = newParts.join("/");
    return reassembleLocation(loc);
}

function extractExceptionMessage(ex) {
    if (ex == null) return "null exception";
    if (ex.message != null) return ex.message;
    if (ex.toString && ex.toString() != null) return ex.toString();
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
    
    regexpi: function(regexpString) {
        this.regexp = new RegExp(regexpString, "i");
        this.matches = function(actual) {
            return this.regexp.test(actual);
        };
    },

    regexi: function(regexpString) {
        this.regexp = new RegExp(regexpString, "i");
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

if (!this["Assert"]) Assert = {};


Assert.fail = function(message) {
    throw new AssertionFailedError(message);
};

/*
* Assert.equals(comment?, expected, actual)
*/
Assert.equals = function() {
    var args = new AssertionArguments(arguments);
    if (args.expected === args.actual) {
        return;
    }
    Assert.fail(args.comment +
                "Expected '" + args.expected +
                "' but was '" + args.actual + "'");
};

Assert.assertEquals = Assert.equals;

/*
* Assert.matches(comment?, pattern, actual)
*/
Assert.matches = function() {
    var args = new AssertionArguments(arguments);
    if (PatternMatcher.matches(args.expected, args.actual)) {
        return;
    }
    Assert.fail(args.comment +
                "Actual value '" + args.actual +
                "' did not match '" + args.expected + "'");
}

/*
* Assert.notMtches(comment?, pattern, actual)
*/
Assert.notMatches = function() {
    var args = new AssertionArguments(arguments);
    if (!PatternMatcher.matches(args.expected, args.actual)) {
        return;
    }
    Assert.fail(args.comment +
                "Actual value '" + args.actual +
                "' did match '" + args.expected + "'");
}


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
    if (typeof(arguments.caller) != 'undefined') { // IE, not ECMA
        var result = '';
        for (var a = arguments.caller; a != null; a = a.caller) {
            result += '> ' + a.callee.toString() + '\n';
            if (a.caller == a) {
                result += '*';
                break;
            }
        }
        error.stack = result;
    }
    error.isSeleniumError = true;
    return error;
}

function highlight(element) {
    var highLightColor = "yellow";
    if (element.originalColor == undefined) { // avoid picking up highlight
        element.originalColor = elementGetStyle(element, "background-color");
    }
    elementSetStyle(element, {"backgroundColor" : highLightColor});
    window.setTimeout(function() {
        try {
            //if element is orphan, probably page of it has already gone, so ignore
            if (!element.parentNode) {
                return;
            }
            elementSetStyle(element, {"backgroundColor" : element.originalColor});
        } catch (e) {} // DGF unhighlighting is very dangerous and low priority
    }, 200);
}



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

function openSeparateApplicationWindow(url, suppressMozillaWarning) {
    // resize the Selenium window itself
    window.resizeTo(1200, 500);
    window.moveTo(window.screenX, 0);

    var appWindow = window.open(url + '?start=true', 'main');
    if (appWindow == null) {
        var errorMessage = "Couldn't open app window; is the pop-up blocker enabled?"
        LOG.error(errorMessage);
        throw new Error("Couldn't open app window; is the pop-up blocker enabled?");
    }
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


    if (!suppressMozillaWarning && window.document.readyState == null && !seenReadyStateWarning) {
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
    },
    
    getBaseUrl:function() {
        return this._getQueryParameter('baseUrl');
            
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

/**
 * Returns the absolute time represented as an offset of the current time.
 * Throws a SeleniumException if timeout is invalid.
 *
 * @param timeout  the number of milliseconds from "now" whose absolute time
 *                 to return
 */
function getTimeoutTime(timeout) {
    var now = new Date().getTime();
    var timeoutLength = parseInt(timeout);
    
    if (isNaN(timeoutLength)) {
        throw new SeleniumError("Timeout is not a number: '" + timeout + "'");
    }
    
    return now + timeoutLength;
}

/**
 * Returns true iff the current environment is the IDE.
 */
function is_IDE()
{
    return (typeof(SeleniumIDE) != 'undefined');
}

/**
 * Logs a message if the Logger exists, and does nothing if it doesn't exist.
 *
 * @param level  the level to log at
 * @param msg    the message to log
 */
function safe_log(level, msg)
{
    try {
        LOG[level](msg);
    }
    catch (e) {
        // couldn't log!
    }
}

/**
 * Displays a warning message to the user appropriate to the context under
 * which the issue is encountered. This is primarily used to avoid popping up
 * alert dialogs that might pause an automated test suite.
 *
 * @param msg  the warning message to display
 */
function safe_alert(msg)
{
    if (is_IDE()) {
        alert(msg);
    }
}

/**
 * Returns true iff the given element represents a link with a javascript
 * href attribute, and does not have an onclick attribute defined.
 *
 * @param element  the element to test
 */
function hasJavascriptHref(element) {
    if (getTagName(element) != 'a') {
        return false;
    }
    if (element.onclick) {
        return false;
    }
    if (! element.href) {
        return false;
    }
    if (! /\s*javascript:/i.test(element.href)) {
        return false;
    }
    return true;
}

/**
 * Returns the given element, or its nearest ancestor, that satisfies
 * hasJavascriptHref(). Returns null if none is found.
 *
 * @param element  the element whose ancestors to test
 */
function getAncestorOrSelfWithJavascriptHref(element) {
    if (hasJavascriptHref(element)) {
        return element;
    }
    if (element.parentNode == null) {
        return null;
    }
    return getAncestorOrSelfWithJavascriptHref(element.parentNode);
}

//******************************************************************************
// Locator evaluation support

/**
 * Parses a Selenium locator, returning its type and the unprefixed locator
 * string as an object.
 *
 * @param locator  the locator to parse
 */
function parse_locator(locator)
{
    var result = locator.match(/^([A-Za-z]+)=(.+)/);
    if (result) {
        return { type: result[1].toLowerCase(), string: result[2] };
    }
    return { type: 'implicit', string: locator };
}

/**
 * Evaluates an xpath on a document, and returns a list containing nodes in the
 * resulting nodeset. The browserbot xpath methods are now backed by this
 * function. A context node may optionally be provided, and the xpath will be
 * evaluated from that context.
 *
 * @param xpath       the xpath to evaluate
 * @param inDocument  the document in which to evaluate the xpath.
 * @param opts        (optional) An object containing various flags that can
 *                    modify how the xpath is evaluated. Here's a listing of
 *                    the meaningful keys:
 *
 *                     contextNode: 
 *                       the context node from which to evaluate the xpath. If
 *                       unspecified, the context will be the root document
 *                       element.
 *
 *                     namespaceResolver:
 *                       the namespace resolver function. Defaults to null.
 *
 *                     xpathLibrary:
 *                       the javascript library to use for XPath. "ajaxslt" is
 *                       the default. "javascript-xpath" is newer and faster,
 *                       but needs more testing.
 *
 *                     allowNativeXpath:
 *                       whether to allow native evaluate(). Defaults to true.
 *
 *                     ignoreAttributesWithoutValue:
 *                       whether it's ok to ignore attributes without value
 *                       when evaluating the xpath. This can greatly improve
 *                       performance in IE; however, if your xpaths depend on
 *                       such attributes, you can't ignore them! Defaults to
 *                       true.
 *
 *                     returnOnFirstMatch:
 *                       whether to optimize the XPath evaluation to only
 *                       return the first match. The match, if any, will still
 *                       be returned in a list. Defaults to false.
 */
function eval_xpath(xpath, inDocument, opts)
{
    if (!opts) {
        var opts = {};
    }
    var contextNode = opts.contextNode
        ? opts.contextNode : inDocument;
    var namespaceResolver = opts.namespaceResolver
        ? opts.namespaceResolver : null;
    var xpathLibrary = opts.xpathLibrary
        ? opts.xpathLibrary : null;
    var allowNativeXpath = (opts.allowNativeXpath != undefined)
        ? opts.allowNativeXpath : true;
    var ignoreAttributesWithoutValue = (opts.ignoreAttributesWithoutValue != undefined)
        ? opts.ignoreAttributesWithoutValue : true;
    var returnOnFirstMatch = (opts.returnOnFirstMatch != undefined)
        ? opts.returnOnFirstMatch : false;

    // Trim any trailing "/": not valid xpath, and remains from attribute
    // locator.
    if (xpath.charAt(xpath.length - 1) == '/') {
        xpath = xpath.slice(0, -1);
    }
    // HUGE hack - remove namespace from xpath for IE
    if (browserVersion && browserVersion.isIE) {
        xpath = xpath.replace(/x:/g, '')
    }
    
    var nativeXpathAvailable = inDocument.evaluate;
    var useNativeXpath = allowNativeXpath && nativeXpathAvailable;
    var useDocumentEvaluate = useNativeXpath;

    // When using the new and faster javascript-xpath library,
    // we'll use the TestRunner's document object, not the App-Under-Test's document.
    // The new library only modifies the TestRunner document with the new 
    // functionality.
    if (xpathLibrary == 'javascript-xpath' && !useNativeXpath) {
        documentForXpath = document;
        useDocumentEvaluate = true;
    } else {
        documentForXpath = inDocument;
    }
    var results = [];
    
    // this is either native xpath or javascript-xpath via TestRunner.evaluate 
    if (useDocumentEvaluate) {
        try {
            // Regarding use of the second argument to document.evaluate():
            // http://groups.google.com/group/comp.lang.javascript/browse_thread/thread/a59ce20639c74ba1/a9d9f53e88e5ebb5
            var xpathResult = documentForXpath
                .evaluate((contextNode == inDocument ? xpath : '.' + xpath),
                    contextNode, namespaceResolver, 0, null);
        }
        catch (e) {
            throw new SeleniumError("Invalid xpath: " + extractExceptionMessage(e));
        }
        finally{
            if (xpathResult == null) {
                // If the result is null, we should still throw an Error.
                throw new SeleniumError("Invalid xpath: " + xpath); 
            }
        }
        var result = xpathResult.iterateNext();
        while (result) {
            results.push(result);
            result = xpathResult.iterateNext();
        }
        return results;
    }

    // If not, fall back to slower JavaScript implementation
    // DGF set xpathdebug = true (using getEval, if you like) to turn on JS XPath debugging
    //xpathdebug = true;
    var context;
    if (contextNode == inDocument) {
        context = new ExprContext(inDocument);
    }
    else {
        // provide false values to get the default constructor values
        context = new ExprContext(contextNode, false, false,
            contextNode.parentNode);
    }
    context.setCaseInsensitive(true);
    context.setIgnoreAttributesWithoutValue(ignoreAttributesWithoutValue);
    context.setReturnOnFirstMatch(returnOnFirstMatch);
    var xpathObj;
    try {
        xpathObj = xpathParse(xpath);
    }
    catch (e) {
        throw new SeleniumError("Invalid xpath: " + extractExceptionMessage(e));
    }
    var xpathResult = xpathObj.evaluate(context);
    if (xpathResult && xpathResult.value) {
        for (var i = 0; i < xpathResult.value.length; ++i) {
            results.push(xpathResult.value[i]);
        }
    }
    return results;
}

/**
 * Returns the full resultset of a CSS selector evaluation.
 */
function eval_css(locator, inDocument)
{
    return cssQuery(locator, inDocument);
}

/**
 * This function duplicates part of BrowserBot.findElement() to open up locator
 * evaluation on arbitrary documents. It returns a plain old array of located
 * elements found by using a Selenium locator.
 * 
 * Multiple results may be generated for xpath and CSS locators. Even though a
 * list could potentially be generated for other locator types, such as link,
 * we don't try for them, because they aren't very expressive location
 * strategies; if you want a list, use xpath or CSS. Furthermore, strategies
 * for these locators have been optimized to only return the first result. For
 * these types of locators, performance is more important than ideal behavior.
 * 
 * @param locator          a locator string
 * @param inDocument       the document in which to apply the locator
 * @param opt_contextNode  the context within which to evaluate the locator
 *
 * @return  a list of result elements
 */
function eval_locator(locator, inDocument, opt_contextNode)
{
    locator = parse_locator(locator);
    
    var pageBot;
    if (typeof(selenium) != 'undefined' && selenium != undefined) {
        if (typeof(editor) == 'undefined' || editor.state == 'playing') {
            safe_log('info', 'Trying [' + locator.type + ']: '
                + locator.string);
        }
        pageBot = selenium.browserbot;
    }
    else {
        if (!UI_GLOBAL.mozillaBrowserBot) {
            // create a browser bot to evaluate the locator. Hand it the IDE
            // window as a dummy window, and cache it for future use.
            UI_GLOBAL.mozillaBrowserBot = new MozillaBrowserBot(window)
        }
        pageBot = UI_GLOBAL.mozillaBrowserBot;
    }
    
    var results = [];
    
    if (locator.type == 'xpath' || (locator.string.charAt(0) == '/' &&
        locator.type == 'implicit')) {
        results = eval_xpath(locator.string, inDocument,
            { contextNode: opt_contextNode });
    }
    else if (locator.type == 'css') {
        results = eval_css(locator.string, inDocument);
    }
    else {
        var element = pageBot
            .findElementBy(locator.type, locator.string, inDocument);
        if (element != null) {
            results.push(element);
        }
    }
    
    return results;
}

//******************************************************************************
// UI-Element

/**
 * Escapes the special regular expression characters in a string intended to be
 * used as a regular expression.
 *
 * Based on: http://simonwillison.net/2006/Jan/20/escape/
 */
RegExp.escape = (function() {
    var specials = [
        '/', '.', '*', '+', '?', '|', '^', '$',
        '(', ')', '[', ']', '{', '}', '\\'
    ];
    
    var sRE = new RegExp(
        '(\\' + specials.join('|\\') + ')', 'g'
    );
  
    return function(text) {
        return text.replace(sRE, '\\$1');
    }
})();

/**
 * Returns true if two arrays are identical, and false otherwise.
 *
 * @param a1  the first array, may only contain simple values (strings or
 *            numbers)
 * @param a2  the second array, same restricts on data as for a1
 * @return    true if the arrays are equivalent, false otherwise.
 */
function are_equal(a1, a2)
{
    if (typeof(a1) != typeof(a2))
        return false;
    
    switch(typeof(a1)) {
        case 'object':
            // arrays
            if (a1.length) {
                if (a1.length != a2.length)
                    return false;
                for (var i = 0; i < a1.length; ++i) {
                    if (!are_equal(a1[i], a2[i]))
                        return false
                }
            }
            // associative arrays
            else {
                var keys = {};
                for (var key in a1) {
                    keys[key] = true;
                }
                for (var key in a2) {
                    keys[key] = true;
                }
                for (var key in keys) {
                    if (!are_equal(a1[key], a2[key]))
                        return false;
                }
            }
            return true;
            
        default:
            return a1 == a2;
    }
}


/**
 * Create a clone of an object and return it. This is a deep copy of everything
 * but functions, whose references are copied. You shouldn't expect a deep copy
 * of functions anyway.
 *
 * @param orig  the original object to copy
 * @return      a deep copy of the original object. Any functions attached,
 *              however, will have their references copied only.
 */
function clone(orig) {
    var copy;
    switch(typeof(orig)) {
        case 'object':
            copy = (orig.length) ? [] : {};
            for (var attr in orig) {
                copy[attr] = clone(orig[attr]);
            }
            break;
        default:
            copy = orig;
            break;
    }
    return copy;
}

/**
 * Emulates php's print_r() functionality. Returns a nicely formatted string
 * representation of an object. Very useful for debugging.
 *
 * @param object    the object to dump
 * @param maxDepth  the maximum depth to recurse into the object. Ellipses will
 *                  be shown for objects whose depth exceeds the maximum.
 * @param indent    the string to use for indenting progressively deeper levels
 *                  of the dump.
 * @return          a string representing a dump of the object
 */
function print_r(object, maxDepth, indent)
{
    var parentIndent, attr, str = "";
    if (arguments.length == 1) {
        var maxDepth = Number.MAX_VALUE;
    } else {
        maxDepth--;
    }
    if (arguments.length < 3) {
        parentIndent = ''
        var indent = '    ';
    } else {
        parentIndent = indent;
        indent += '    ';
    }

    switch(typeof(object)) {
    case 'object':
        if (object.length != undefined) {
            if (object.length == 0) {
                str += "Array ()\r\n";
            }
            else {
                str += "Array (\r\n";
                for (var i = 0; i < object.length; ++i) {
                    str += indent + '[' + i + '] => ';
                    if (maxDepth == 0)
                        str += "...\r\n";
                    else
                        str += print_r(object[i], maxDepth, indent);
                }
                str += parentIndent + ")\r\n";
            }
        }
        else {
            str += "Object (\r\n";
            for (attr in object) {
                str += indent + "[" + attr + "] => ";
                if (maxDepth == 0)
                    str += "...\r\n";
                else
                    str += print_r(object[attr], maxDepth, indent);
            }
            str += parentIndent + ")\r\n";
        }
        break;
    case 'boolean':
        str += (object ? 'true' : 'false') + "\r\n";
        break;
    case 'function':
        str += "Function\r\n";
        break;
    default:
        str += object + "\r\n";
        break;

    }
    return str;
}

/**
 * Return an array containing all properties of an object. Perl-style.
 *
 * @param object  the object whose keys to return
 * @return        array of object keys, as strings
 */
function keys(object)
{
    var keys = [];
    for (var k in object) {
        keys.push(k);
    }
    return keys;
}

/**
 * Emulates python's range() built-in. Returns an array of integers, counting
 * up (or down) from start to end. Note that the range returned is up to, but
 * NOT INCLUDING, end.
 *.
 * @param start  integer from which to start counting. If the end parameter is
 *               not provided, this value is considered the end and start will
 *               be zero.
 * @param end    integer to which to count. If omitted, the function will count
 *               up from zero to the value of the start parameter. Note that
 *               the array returned will count up to but will not include this
 *               value.
 * @return       an array of consecutive integers. 
 */
function range(start, end)
{
    if (arguments.length == 1) {
        var end = start;
        start = 0;
    }
    
    var r = [];
    if (start < end) {
        while (start != end)
            r.push(start++);
    }
    else {
        while (start != end)
            r.push(start--);
    }
    return r;
}

/**
 * Parses a python-style keyword arguments string and returns the pairs in a
 * new object.
 *
 * @param  kwargs  a string representing a set of keyword arguments. It should
 *                 look like <tt>keyword1=value1, keyword2=value2, ...</tt>
 * @return         an object mapping strings to strings
 */
function parse_kwargs(kwargs)
{
    var args = new Object();
    var pairs = kwargs.split(/,/);
    for (var i = 0; i < pairs.length;) {
        if (i > 0 && pairs[i].indexOf('=') == -1) {
            // the value string contained a comma. Glue the parts back together.
            pairs[i-1] += ',' + pairs.splice(i, 1)[0];
        }
        else {
            ++i;
        }
    }
    for (var i = 0; i < pairs.length; ++i) {
        var splits = pairs[i].split(/=/);
        if (splits.length == 1) {
            continue;
        }
        var key = splits.shift();
        var value = splits.join('=');
        args[key.trim()] = value.trim();
    }
    return args;
}

/**
 * Creates a python-style keyword arguments string from an object.
 *
 * @param args        an associative array mapping strings to strings
 * @param sortedKeys  (optional) a list of keys of the args parameter that
 *                    specifies the order in which the arguments will appear in
 *                    the returned kwargs string
 *
 * @return            a kwarg string representation of args
 */
function to_kwargs(args, sortedKeys)
{
    var s = '';
    if (!sortedKeys) {
        var sortedKeys = keys(args).sort();
    }
    for (var i = 0; i < sortedKeys.length; ++i) {
        var k = sortedKeys[i];
        if (args[k] != undefined) {
            if (s) {
                s += ', ';
            }
            s += k + '=' + args[k];
        }
    }
    return s;
}

/**
 * Returns true if a node is an ancestor node of a target node, and false
 * otherwise.
 *
 * @param node    the node being compared to the target node
 * @param target  the target node
 * @return        true if node is an ancestor node of target, false otherwise.
 */
function is_ancestor(node, target)
{
    while (target.parentNode) {
        target = target.parentNode;
        if (node == target)
            return true;
    }
    return false;
}

//******************************************************************************
// parseUri 1.2.1
// MIT License

/*
Copyright (c) 2007 Steven Levithan <stevenlevithan.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
*/

function parseUri (str) {
    var o   = parseUri.options,
        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
};

parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
        name:   "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};

