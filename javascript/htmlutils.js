// This script contains some HTML utility functions that
// make it possible to handle elements in a way that is 
// compatible with both IE-like and Mozilla-like browsers

String.prototype.trim = function() {
  var result = this.replace( /^\s+/g, "" );// strip leading
  return result.replace( /\s+$/g, "" );// strip trailing
}

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
