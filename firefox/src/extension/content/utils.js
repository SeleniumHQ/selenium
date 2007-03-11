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
    element.setAttribute("value", "");
    for (var i = 0; i < text.length; i++) {
        var character = text.charAt(i);

        Utils.keyDownOrUp(element, true, character);
        Utils.keyPress(element, character);
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