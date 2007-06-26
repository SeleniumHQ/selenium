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
    var handle = Utils.newInstance("@thoughtworks.com/webdriver/fxdriver;1", "nsISupports");
    return handle.wrappedJSObject;
}

Utils.getBrowser = function(context) {
    return fxbrowser;
};

Utils.getDocument = function(context) {
    return fxdocument;
};

Utils.getText = function(element) {
    var nodes = element.childNodes;
    var str = ""
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeName == "#text") {
            str += nodes[i].nodeValue;
        } else {
            str += this.getText(nodes[i]);
        }
    }
    return str;
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
    var isTextField = Utils.isTextField(element);

    var value = "";
    if (isTextField)
        element.setAttribute("value", value);
    for (var i = 0; i < text.length; i++) {
        var character = text.charAt(i);
        value += character;

        Utils.keyDownOrUp(context, element, true, character);
        Utils.keyPress(context, element, character);
        if (isTextField)
            element.setAttribute("value", value);
        Utils.keyDownOrUp(context, element, false, character);
    }
};

Utils.keyPress = function(context, element, text) {
    var event = Utils.getDocument(context).createEvent('KeyEvents');
    event.initKeyEvent('keypress', true, true, Utils.getBrowser(context).contentWindow, 0, 0, 0, 0, 0, text.charCodeAt(0));
    element.dispatchEvent(event);
};

Utils.keyDownOrUp = function(context, element, down, text) {
    var keyCode = text;
    // We should do something clever with non-text characters

    var event = Utils.getDocument(context).createEvent('KeyEvents');
    event.initKeyEvent(down ? 'keydown' : 'keyup', true, true, Utils.getBrowser(context).contentWindow, 0, 0, 0, 0, keyCode, 0);
    element.dispatchEvent(event);
};

Utils.fireHtmlEvent = function(context, element, eventName) {
    var doc = Utils.getDocument(context);
    var e = doc.createEvent("HTMLEvents");
	e.initEvent("change", true, true);
    element.dispatchEvent(e);
}

Utils.isTextField = function(element) {
    var name = element.tagName.toLowerCase();
    if (name == "textarea")
        return true;
    if (name == "input")
        return element.type == "text" || element.type == "password";
    return false;
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
    event.initMouseEvent(eventName, true, true, null, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    element.dispatchEvent(event);
}

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

            if (typeof(view[i])  == typeof(Function)) {
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
