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
 
// This script contains some HTML utility functions that
// make it possible to handle elements in a way that is 
// compatible with both IE-like and Mozilla-like browsers

String.prototype.trim = function() {
  var result = this.replace( /^\s+/g, "" );// strip leading
  return result.replace( /\s+$/g, "" );// strip trailing
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
    text = "";

    if(element.textContent) {
        text = element.textContent;
    } else if(element.innerText) {
        text = element.innerText;
    }
    // Replace &nbsp; with a space
    // TODO - should this be in the match() code instead?
    text = text.replace(/\240/g, " ");
    return text.trim();
}

// Sets the text in this element
function setText(element, text) {
    if(element.textContent) {
        element.textContent = text;
    } else if(element.innerText) {
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
function triggerEvent(element, eventType, canBubble) {
    canBubble = (typeof(canBubble) == undefined) ? true : canBubble;
    if (element.fireEvent) {
        element.fireEvent('on' + eventType);
    }
    else {
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent(eventType, canBubble, true);
        element.dispatchEvent(evt);
    }
}

/* Fire a mouse event in a browser-compatible manner */
function triggerMouseEvent(element, eventType, canBubble) {
    canBubble = (typeof(canBubble) == undefined) ? true : canBubble;
    if (element.fireEvent) {
        element.fireEvent('on' + eventType);
    }
    else {
        var evt = document.createEvent('MouseEvents');
        evt.initMouseEvent(eventType, canBubble, true, document.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        element.dispatchEvent(evt);
    }
}

function removeLoadListener(element, command) {
    if (window.removeEventListener)
        element.removeEventListener("load", command, true);
    else if (window.detachEvent)
        element.detachEvent("onload", command);
}

function addLoadListener(element, command) {
    if (window.addEventListener)
        element.addEventListener("load",command, true);
    else if (window.attachEvent)
        element.attachEvent("onload",command);
}

function addUnloadListener(element, command) {
    if (window.addEventListener)
        element.addEventListener("unload",command, true);
    else if (window.attachEvent)
        element.attachEvent("onunload",command);
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

function describe(object, delimiter) {
    var props = new Array();
    for (var prop in object) {
        props.push(prop + " -> " + object[prop]);
    }
    return props.join(delimiter || '\n');
}

PatternMatcher = function(pattern) {
    this.selectStrategy(pattern);
};
PatternMatcher.prototype = {
    
    selectStrategy: function(pattern) {
        this.pattern = pattern;
        var strategyName = 'glob'; // by default
        if (/^([a-zA-Z]+):(.*)/.test(pattern)) {
            strategyName = RegExp.$1;
            pattern = RegExp.$2;
        }
        var matchStrategy = PatternMatcher.strategies[strategyName];
        if (!matchStrategy) {
            throw new SeleniumError("cannot find PatternMatcher.strategies." + strategyName);
        }
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

PatternMatcher.regexpFromGlob = function(glob) {
    var re = glob;
    re = re.replace(/([.^$+(){}\[\]\\|])/g, "\\$1");
    re = re.replace(/\?/g, "(.|[\r\n])");
    re = re.replace(/\*/g, "(.|[\r\n])*");
    return "^" + re + "$";
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
    this.failureMessage = message;
}

function SeleniumError(message) {
    var error = new Error(message);
    error.isSeleniumError = true;
    return error;
};
