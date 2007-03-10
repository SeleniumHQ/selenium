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