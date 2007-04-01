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

Utils.getBrowser = function() {
    var wm = Utils.getService("@mozilla.org/appshell/window-mediator;1", "nsIWindowMediator");
    var win = wm.getMostRecentWindow("navigator:browser");
    return win.getBrowser();
};

Utils.getDocument = function() {
    return Utils.getBrowser().contentDocument;
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

Utils.addToKnownElements = function(element) {
    if (!Utils.getDocument().fxdriver_elements) {
        Utils.getDocument().fxdriver_elements = new Array();
    }
    var start = Utils.getDocument().fxdriver_elements.length;
    Utils.getDocument().fxdriver_elements.push(element);
    return start;
};

Utils.getElementAt = function(index) {
    // Convert to a number if we're dealing with a string....
    index = index - 0;

    if (Utils.getDocument().fxdriver_elements)
        return Utils.getDocument().fxdriver_elements[index];
    return undefined;
};

Utils.type = function(element, text) {
    var isTextField = Utils.isTextField(element);

    var value = "";
    if (isTextField)
        element.setAttribute("value", value);
    for (var i = 0; i < text.length; i++) {
        var character = text.charAt(i);
        value += character;

        Utils.keyDownOrUp(element, true, character);
        Utils.keyPress(element, character);
        if (isTextField)
            element.setAttribute("value", value);
        Utils.keyDownOrUp(element, false, character);
    }
};

Utils.keyPress = function(element, text) {
    var event = Utils.getDocument().createEvent('KeyEvents');
    event.initKeyEvent('keypress', true, true, Utils.getBrowser().contentWindow, 0, 0, 0, 0, 0, text.charCodeAt(0));
    element.dispatchEvent(event);
};

Utils.keyDownOrUp = function(element, down, text) {
    var keyCode = text;
    // We should do something clever with non-text characters

    var event = Utils.getDocument().createEvent('KeyEvents');
    event.initKeyEvent(down ? 'keydown' : 'keyup', true, true, Utils.getBrowser().contentWindow, 0, 0, 0, 0, keyCode, 0);
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

Utils.fireMouseEventOn = function(element, eventName) {
    var event = Utils.getDocument().createEvent("MouseEvents");
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
