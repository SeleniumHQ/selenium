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

function trim() {
  var result = this.replace( /^\s+/g, "" );// strip leading
  return result.replace( /\s+$/g, "" );// strip trailing
}
String.prototype.trim = trim;

function toCamelCase() {
   return this.charAt(0).toLowerCase() + this.substr(1);
}
String.prototype.toCamelCase = toCamelCase;

// Returns the text in this element
function getText(element) {
    text = "";

    if(element.textContent) {
        text = element.textContent;
    } else if(element.innerText) {
        text = element.innerText;
    }
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

function describe(object) {
    var props = new Array();
    for (var prop in object) {
        props.push(prop);
    }
    return props.join('\n');
}
