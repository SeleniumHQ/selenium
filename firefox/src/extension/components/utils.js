function Utils() {
}

Utils.newInstance = function(className, interfaceName) {
    var clazz = Components.classes[className];
    var iface = Components.interfaces[interfaceName];
    return clazz.createInstance(iface);
};

Utils.getService = function(className, serviceName) {
    var clazz = Components.classes[className];
    if (clazz == undefined) {
        throw new Exception();
    }

    return clazz.getService(Components.interfaces[serviceName]);
};

Utils.getServer = function() {
    var handle = Utils.newInstance("@googlecode.com/webdriver/fxdriver;1", "nsISupports");
    return handle.wrappedJSObject;
}

Utils.getBrowser = function(context) {
    return context.fxbrowser;
};

Utils.getDocument = function(context) {
    return context.fxdocument;
};

function getTextFromNode(node, toReturn, textSoFar, isPreformatted) {
    var children = node.childNodes;

    for (var i = 0; i < children.length; i++) {
        var child = children[i];

        // Do we need to collapse the text so far?
        if (child["tagName"] && child.tagName == "PRE") {
            toReturn += collapseWhitespace(textSoFar);
            textSoFar = "";
            var bits = getTextFromNode(child, toReturn, "", true);
            toReturn += bits[1];
            continue;
        }

        // Or is this just plain text?
        if (child.nodeName == "#text") {
            var textToAdd = child.nodeValue;
            textToAdd = textToAdd.replace(new RegExp(String.fromCharCode(160), "gm"), " ");
            textSoFar += textToAdd;
            continue;
        }

        // Treat as another child node.
        var bits = getTextFromNode(child, toReturn, textSoFar, false);
        toReturn = bits[0];
        textSoFar = bits[1];
    }

    if (isBlockLevel(node)) {
        if (node["tagName"] && node.tagName != "PRE") {
            toReturn += collapseWhitespace(textSoFar) + "\n";
            textSoFar = "";
        } else {
            toReturn += "\n";
        }
    }
    return [toReturn, textSoFar];
}
;

function isBlockLevel(node) {
    if (node["tagName"] && node.tagName == "BR")
        return true;

    try {
        // Should we think about getting hold of the current document?
        return "block" == Utils.getStyleProperty(node, "display");
    } catch (e) {
        return false;
    }
}

Utils.getStyleProperty = function(node, propertyName) {
    var value = node.ownerDocument.defaultView.getComputedStyle(node, null).getPropertyValue(propertyName);

    // Convert colours to hex if possible
    var raw = /rgb\((\d{1,3}),\s(\d{1,3}),\s(\d{1,3})\)/.exec(value);
    if (raw) {
        var temp = value.substr(0, raw.index);

        var hex = "#";
        for (var i = 1; i <= 3; i++) {
            var colour = (raw[i] - 0).toString(16);
            if (colour.length == 1)
                colour = "0" + colour;
            hex += colour
        }
        hex = hex.toLowerCase();
        value = temp + hex + value.substr(raw.index + raw[0].length);
    }

    return value;
};

function collapseWhitespace(textSoFar) {
    return textSoFar.replace(/\s+/g, " ");
}
;

function getPreformattedText(node) {
    var textToAdd = "";
    return getTextFromNode(node, "", textToAdd, true)[1];
}
;

function isWhiteSpace(character) {
    return character == '\n' || character == ' ' || character == '\t' || character == '\r';
}

Utils.getText = function(element) {
    var bits = getTextFromNode(element, "", "", element.tagName == "PRE");

    var text = bits[0] + collapseWhitespace(bits[1]);
    var index = text.length - 1;
    while (isWhiteSpace(text[index])) {
        index--;
    }

    return text.slice(0, index + 1);
};

Utils.addToKnownElements = function(element, context) {
    var doc = Utils.getDocument(context);
    if (!doc.fxdriver_elements) {
        doc.fxdriver_elements = new Array();
    }
    var start = doc.fxdriver_elements.length;
    doc.fxdriver_elements.push(element);
    return start;
};

Utils.getElementAt = function(index, context) {
    // Convert to a number if we're dealing with a string...
    index = index - 0;

    var doc = Utils.getDocument(context);
    if (doc.fxdriver_elements)
        return doc.fxdriver_elements[index];
    return undefined;
};

Utils.shiftCount = 0;

Utils.type = function(context, element, text) {
    // Special-case file input elements. This is ugly, but should be okay
    var inputtype = element.getAttribute("type");
    if (element.tagName == "INPUT" && inputtype && inputtype.toLowerCase() == "file") {
      element.value = text;
      return;
    }

    var controlKey = false;
    var shiftKey = false;
    var altKey = false;

    Utils.shiftCount = 0;

    var upper = text.toUpperCase();

    for (var i = 0; i < text.length; i++) {
        var charCode = 0;
        var keyCode = 0;

        var c = text.charAt(i);
        if (c == '\uE000') {      // null key, reset modifier key state
            shiftKey = controlKey = altKey = false;
            continue;
        } else if (c == '\uE001') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_CANCEL;
        } else if (c == '\uE002') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_HELP;
        } else if (c == '\uE003') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_BACK_SPACE;
        } else if (c == '\uE004') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_TAB;
        } else if (c == '\uE005') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_CLEAR;
        } else if (c == '\uE006') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_RETURN;
        } else if (c == '\uE007') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_ENTER;
        } else if (c == '\uE008') {
            shiftKey = !shiftKey;
            continue;
        } else if (c == '\uE009') {
            controlKey = !controlKey;
            continue;
        } else if (c == '\uE00A') {
            altKey = !altKey;
            continue;
        } else if (c == '\uE00B') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_PAUSE;
        } else if (c == '\uE00C') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_ESCAPE;
        } else if (c == '\uE00D') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SPACE;
        } else if (c == '\uE00E') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_PAGE_UP;
        } else if (c == '\uE00F') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_PAGE_DOWN;
        } else if (c == '\uE010') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_END;
        } else if (c == '\uE011') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_HOME;
        } else if (c == '\uE012') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_LEFT;
        } else if (c == '\uE013') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_UP;
        } else if (c == '\uE014') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_RIGHT;
        } else if (c == '\uE015') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_DOWN;
        } else if (c == '\uE016') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_INSERT;
        } else if (c == '\uE017') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_DELETE;
        } else if (c == '\n') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_RETURN;
            charCode = text.charCodeAt(i);
        } else if (c == ',') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_COMMA;
            charCode = text.charCodeAt(i);
        } else if (c == '.') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_PERIOD;
            charCode = text.charCodeAt(i);
        } else if (c == '/') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SLASH;
            charCode = text.charCodeAt(i);
        } else if (c == '`') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_BACK_QUOTE;
            charCode = text.charCodeAt(i);
        } else if (c == '{') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_OPEN_BRACKET;
            charCode = text.charCodeAt(i);
        } else if (c == '\\') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_BACK_SLASH;
            charCode = text.charCodeAt(i);
        } else if (c == '}') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_CLOSE_BRACKET;
            charCode = text.charCodeAt(i);
        } else if (c == '\'') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_QUOTE;
            charCode = text.charCodeAt(i);
        } else {
            keyCode = upper.charCodeAt(i);
            charCode = text.charCodeAt(i);
        }

        var needsShift = false;
        if (!charCode) {
          needsShift = shiftKey;
        } else {
          needsShift = /[A-Z\!\$\^\*\(\)\+\{\}\:\?\|"#%&<>@_~]/.test(c);
        }

        // modifiers down

        if (needsShift) {
          var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT;
          Utils.keyEvent(context, element, "keydown", kCode, 0,
              controlKey, true, altKey);
          Utils.shiftCount += 1;
        }

        if (controlKey) {
          var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_CONTROL;
          Utils.keyEvent(context, element, "keydown", kCode, 0,
              true, needsShift, altKey);
        }

        if (altKey) {
          var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_ALT;
          Utils.keyEvent(context, element, "keydown", kCode, 0,
              controlKey, needsShift, true);
        }

        // generate key[down/press/up] for key

        var pressCode = keyCode;
        if (charCode >= 32 && charCode < 127)
          pressCode = 0;

        Utils.keyEvent(context, element, "keydown", keyCode, 0,
            controlKey, needsShift, altKey);
        Utils.keyEvent(context, element, "keypress", pressCode, charCode,
            controlKey, needsShift, altKey);
        Utils.keyEvent(context, element, "keyup", keyCode, 0,
            controlKey, needsShift, altKey);

        // modifiers up

        var shiftKeyState = needsShift;
        if (shiftKeyState) {
          var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT;
          Utils.keyEvent(context, element, "keyup", kCode, 0,
              controlKey, shiftKeyState = false, altKey);
        }

        var controlKeyState = controlKey;
        if (controlKeyState) {
          var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_CONTROL;
          Utils.keyEvent(context, element, "keyup", kCode, 0,
              controlKeyState = false, shiftKeyState, altKey);
        }

        var altKeyState = altKey;
        if (altKeyState) {
          var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_ALT;
          Utils.keyEvent(context, element, "keyup", kCode, 0,
              controlKeyState, shiftKeyState, altKeyState = false);
        }

    }  // for text.length
};

Utils.keyEvent = function(context, element, type, keyCode, charCode,
    controlState, shiftState, altState) {

  var document = Utils.getDocument(context);
  var view = Utils.getDocument(context).defaultView;

  var evt = document.createEvent('KeyEvents');
  evt.initKeyEvent(
    type,         //  in DOMString typeArg,
    true,         //  in boolean canBubbleArg
    true,         //  in boolean cancelableArg
    view,      //  in nsIDOMAbstractView viewArg
    controlState, //  in boolean ctrlKeyArg
    altState,     //  in boolean altKeyArg
    shiftState,   //  in boolean shiftKeyArg
    false,        //  in boolean metaKeyArg
    keyCode,      //  in unsigned long keyCodeArg
    charCode);    //  in unsigned long charCodeArg

  element.dispatchEvent(evt);
};


Utils.fireHtmlEvent = function(context, element, eventName) {
    var doc = Utils.getDocument(context);
    var e = doc.createEvent("HTMLEvents");
    e.initEvent(eventName, true, true);
    element.dispatchEvent(e);
}

Utils.findForm = function(element) {
    // Are we already on an element that can be used to submit the form?
    try {
        element.QueryInterface(Components.interfaces.nsIDOMHTMLButtonElement);
        return element;
    } catch(e) {
    }

    try {
        var input = element.QueryInterface(Components.interfaces.nsIDOMHTMLInputElement);
        if (input.type == "image" || input.type == "submit")
            return input;
    } catch(e) {
    }

    var form = element;
    while (form) {
        if (form["submit"])
            return form;
        form = form.parentNode;
    }
    return undefined;
}

Utils.fireMouseEventOn = function(context, element, eventName) {
    var event = Utils.getDocument(context).createEvent("MouseEvents");
    var view = Utils.getDocument(context).defaultView;

    event.initMouseEvent(eventName, true, true, view, 1, 0, 0, 0, 0, false, false, false, false, 0, element);
    element.dispatchEvent(event);
}

Utils.triggerMouseEvent = function(element, eventType, clientX, clientY) {
    var event = element.ownerDocument.createEvent("MouseEvents");
    var view = element.ownerDocument.defaultView;

    event.initMouseEvent(eventType, true, true, view, 1, 0, 0, clientX, clientY, false, false, false, false, 0, element);
    element.dispatchEvent(event);
}

Utils.findDocumentInFrame = function(browser, frameId) {
    var frame = Utils.findFrame(browser, frameId);
    return frame ? frame.document : null;
};

Utils.findFrame = function(browser, frameId) {
    var stringId = "" + frameId;
    var names = stringId.split(".");
    var frame = browser.contentWindow;
    for (var i = 0; i < names.length; i++) {
        // Try a numerical index first
        var index = names[i] - 0;
        if (!isNaN(index)) {
            frame = frame.frames[index];
            if (!frame) {
                return null;
            }
        } else {
            // Fine. Use the name and loop
            var found = false;
            for (var j = 0; j < frame.frames.length; j++) {
                var f = frame.frames[j];
                if (f.name == names[i] || f.frameElement.id == names[i]) {
                    frame = f;
                    found = true;
                    break;
                }
            }

            if (!found) {
                return null;
            }
        }
    }

    return frame;
};

Utils.dumpText = function(text) {
	var consoleService = Utils.getService("@mozilla.org/consoleservice;1", "nsIConsoleService");
	if (consoleService)
		consoleService.logStringMessage(text);
	else
		dump(text);
}

Utils.dumpn = function(text) {
	Utils.dumpText(text + "\n");
}

Utils.dump = function(element) {
    var dump = "=============\n";

    var rows = [];

    dump += "Supported interfaces: ";
    for (var i in Components.interfaces) {
        try {
            var view = element.QueryInterface(Components.interfaces[i]);
            dump += i + ", ";
        } catch (e) {
            // Doesn't support the interface
        }
    }
    dump += "\n------------\n";

    try {
        Utils.dumpProperties(element, rows);
    } catch (e) {
        Utils.dumpText("caught an exception: " + e);
    }

    rows.sort();
    for (var i in rows) {
        dump += rows[i] + "\n";
    }

    dump += "=============\n\n\n";
    Utils.dumpText(dump);
}

Utils.dumpProperties = function(view, rows) {
    for (var i in view) {
        var value = "\t" + i + ": ";
        try {
            if (typeof(view[i]) == typeof(Function)) {
                value += " function()";
            } else {
                value += String(view[i]);
            }
        } catch (e) {
            value += " Cannot obtain value";
        }

        rows.push(value);
    }
}

Utils.stackTrace = function() {
    var stack = Components.stack;
    var i = 5;
    var dump = "";
    while (i && stack.caller) {
        stack = stack.caller;
        dump += stack + "\n";
    }

    Utils.dumpText(dump);
}

Utils.getElementLocation = function(element, context) {
    var x = element.offsetLeft;
    var y = element.offsetTop;
    var elementParent = element.offsetParent;
    while (elementParent != null) {
        if(elementParent.tagName == "TABLE") {
            var parentBorder = parseInt(elementParent.border);
            if(isNaN(parentBorder)) {
                var parentFrame = elementParent.getAttribute('frame');
                if(parentFrame != null) {
                    x += 1;
                    y += 1;
                }
            } else if(parentBorder > 0) {
                x += parentBorder;
                y += parentBorder;
            }
        }
        x += elementParent.offsetLeft;
        y += elementParent.offsetTop;
        elementParent = elementParent.offsetParent;
    }

    // Netscape can get confused in some cases, such that the height of the parent is smaller
    // than that of the element (which it shouldn't really be). If this is the case, we need to
    // exclude this element, since it will result in too large a 'top' return value.
    if (element.offsetParent && element.offsetParent.offsetHeight && element.offsetParent.offsetHeight < element.offsetHeight) {
        // skip the parent that's too small
        element = element.offsetParent.offsetParent;
    } else {
        // Next up...
        element = element.offsetParent;
    }
    var location = new Object();
    location.x = x;
    location.y = y;
    return location;
};

Utils.findElementsByXPath = function (xpath, contextNode, context) {
    var doc = Utils.getDocument(context);
    var result = doc.evaluate(xpath, contextNode, null, Components.interfaces.nsIDOMXPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    var indices = [];
    var element = result.iterateNext();
    while (element) {
        var index = Utils.addToKnownElements(element, context);
        indices.push(index);
        element = result.iterateNext();
    }
    return indices;
};
