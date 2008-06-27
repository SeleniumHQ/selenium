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
    // Convert to a number if we're dealing with a string....
    index = index - 0;

    var doc = Utils.getDocument(context);
    if (doc.fxdriver_elements)
        return doc.fxdriver_elements[index];
    return undefined;
};

Utils.type = function(context, element, text) {
    var isTextField = element["value"] !== undefined;
    var value = "";
    
    if (isTextField) {
        value = element.value;
    } else if (element.hasAttribute("value")) {
        value = element.getAttribute("value");
    }

    for (var i = 0; i < text.length; i++) {
        var character = text.charCodeAt(i);
        var c = text.charAt(i);
        var keyCode = character;
        value += c;

        if (c == '\uE002') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_UP;
            character = keyCode;
        } else if (c == '\uE004') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_DOWN;
            character = keyCode;
        } else if (c == '\uE001') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_LEFT;
            character = keyCode;
        } else if (c == '\uE003') {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_RIGHT;
            character = keyCode;
        } else if (c == "\n") {
            keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_RETURN;
            character = keyCode;
        }

//        var isShift = (character >= 65 && character <= 122 && c.toUpperCase() == c);
        var isShift = /A-Z/.test(c);
        if (isShift) {
            Utils.keyDownOrUp(context, element, true, Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT, Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT);
            Utils.keyPress(context, element, Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT, Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT);
        }

        Utils.keyDownOrUp(context, element, true, keyCode, character);
        Utils.keyPress(context, element, keyCode, character);

        // Strictly speaking, we should be able to get the same effect
        // without needing this piece of logic. We can for normal characters,
        // but not for characters such as '. Most odd. Leaving this in for now
        if (isTextField) {
            element.value = value;
        } else {
            element.setAttribute("value", value);
        }
        Utils.keyDownOrUp(context, element, false, keyCode, character);

        if (isShift) {
            Utils.keyDownOrUp(context, element, false, Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT, Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT);
        }
    }
};

Utils.keyPress = function(context, element, keyCode, charCode) {
    var event = Utils.getDocument(context).createEvent('KeyEvents');
    var c = String.fromCharCode(charCode);
    var isShift = /A-Z/.test(c);
    event.initKeyEvent('keypress', true, true, Utils.getBrowser(context).contentWindow, 0, 0, isShift, 0, keyCode, charCode);
    element.dispatchEvent(event);
};

Utils.keyDownOrUp = function(context, element, down, keyCode, charCode) {
    var event = Utils.getDocument(context).createEvent('KeyEvents');
    var c = String.fromCharCode(charCode);
    var isShift = /A-Z/.test(c);
    event.initKeyEvent(down ? 'keydown' : 'keyup', true, true, Utils.getBrowser(context).contentWindow, 0, 0, isShift, 0, keyCode, charCode);
    element.dispatchEvent(event);
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
//    dump("View is: " + view + "\n");
    event.initMouseEvent(eventName, true, true, null, 1, 0, 0, 0, 0, false, false, false, false, 0, element);
    element.dispatchEvent(event);
}

Utils.triggerMouseEvent = function(element, eventType, clientX, clientY) {
    var event = element.ownerDocument.createEvent("MouseEvents");
    event.initMouseEvent(eventType, true, true, null, 1, 0, 0, clientX, clientY, false, false, false, false, 0, element);
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

Utils.dump = function(element) {
    dump("=============\n");

    dump("Supported interfaces: ");
    for (var i in Components.interfaces) {
        try {
            var view = element.QueryInterface(Components.interfaces[i]);
            dump(i + ", ");
        } catch (e) {
            // Doesn't support the interface
        }
    }
    dump("\n------------\n");
    var rows = [];
    try {
        Utils.dumpProperties(element, rows);
    } catch (e) {
        dump("caught an exception: " + e);
    }

    rows.sort();
    for (var i in rows) {
        dump(rows[i] + "\n");
    }

    dump("=============\n\n\n");
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
    while (i && stack.caller) {
        stack = stack.caller;
        dump(stack + "\n");
    }
}

Utils.getElementLocation = function(element, context) {		
    var x = element.offsetLeft;
    var y = element.offsetTop;
    var elementParent = element.offsetParent;
  dump("1: "+x + ", " + y + "\n");
  dump("style: "+element.style.left + ", " + element.style.top + "\n");
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
    dump("2: "+x + ", " + y + "\n");
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
