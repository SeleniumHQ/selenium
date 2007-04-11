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

Utils.getBrowser = function(location) {
    var wm = Utils.getService("@mozilla.org/appshell/window-mediator;1", "nsIWindowMediator");
    var win = wm.getMostRecentWindow("navigator:browser");
    return win.getBrowser();
};

Utils.getDocument = function(location) {
    var browser = Utils.getBrowser(location);
    var frameId = location.split(" ")[1] - 0;

    if (browser.contentWindow.frames[frameId]) {
        return browser.contentWindow.frames[frameId].document;
    }
    return browser.contentDocument;
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

Utils.addToKnownElements = function(element, location) {
    var doc = Utils.getDocument(location);
    if (!doc.fxdriver_elements) {
        doc.fxdriver_elements = new Array();
    }
    var start = doc.fxdriver_elements.length;
    doc.fxdriver_elements.push(element);
    return start;
};

Utils.getElementAt = function(index, location) {
    // Convert to a number if we're dealing with a string....
    index = index - 0;

    var doc = Utils.getDocument(location);
    if (doc.fxdriver_elements)
        return doc.fxdriver_elements[index];
    return undefined;
};

Utils.type = function(location, element, text) {
    var isTextField = Utils.isTextField(element);

    var value = "";
    if (isTextField)
        element.setAttribute("value", value);
    for (var i = 0; i < text.length; i++) {
        var character = text.charAt(i);
        value += character;

        Utils.keyDownOrUp(location, element, true, character);
        Utils.keyPress(location, element, character);
        if (isTextField)
            element.setAttribute("value", value);
        Utils.keyDownOrUp(location, element, false, character);
    }
};

Utils.keyPress = function(location, element, text) {
    var event = Utils.getDocument(location).createEvent('KeyEvents');
    event.initKeyEvent('keypress', true, true, Utils.getBrowser(location).contentWindow, 0, 0, 0, 0, 0, text.charCodeAt(0));
    element.dispatchEvent(event);
};

Utils.keyDownOrUp = function(location, element, down, text) {
    var keyCode = text;
    // We should do something clever with non-text characters

    var event = Utils.getDocument(location).createEvent('KeyEvents');
    event.initKeyEvent(down ? 'keydown' : 'keyup', true, true, Utils.getBrowser(location).contentWindow, 0, 0, 0, 0, keyCode, 0);
    element.dispatchEvent(event);
};

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

Utils.fireMouseEventOn = function(location, element, eventName) {
    var event = Utils.getDocument(location).createEvent("MouseEvents");
    event.initMouseEvent(eventName, true, true, null, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    element.dispatchEvent(event);
}

Utils.dump = function(element) {
    var views = new Object();
    dump("Supported interfaces: ");
    for (var i in Components.interfaces) {
        try {
            var view = element.QueryInterface(Components.interfaces[i]);
            dump(i + ":\n");
            Utils.dumpProperties(view);
        } catch (e) {
            // Doesn't support the interface
        }
    }
    dump("\n");
    Utils.dumpProperties(views);
    dump("=============\n\n\n");
}

Utils.dumpProperties = function(view) {
    for (var i in view) {
        dump("\t" + i + "\n");
    }
}

function funcname(f) {
    var s = f.toString().match(/function (\w*)/)[1];
    if ((s == null) || (s.length == 0)) return "anonymous";
    return s;
}

Utils.stackTrace = function() {
    var s = "";

    for(var a = arguments.caller; a != null; a = a.caller) {
        s += funcname(a.callee) + "\n";
    }
    dump(s);
}