function FirefoxDriver(server) {
    this.server = server;
}

FirefoxDriver.prototype.get = function(url) {
    var server = this.server;
    new WebLoadingListener(function(request) {
        var responseText = request.originalURI ? request.originalURI.spec : request.name;

        try {
            var channel = request.QueryInterface(Components.interfaces.nsIHttpChannel);
            responseText += " " + channel.responseStatus + " " + channel.responseStatusText;
        } catch (e) {
            responseText += " undefined undefined";
        }

        try {
            request.QueryInterface(Components.interfaces.nsIXMLHttpRequest)
            dump("Is XmlHttpRequest\n");
        } catch (e) {
            // Do nothing
        }
        server.respond("get", responseText);

    });
    Utils.getBrowser().loadURI(url);
}

FirefoxDriver.prototype.title = function() {
    this.server.respond("title", Utils.getBrowser().contentTitle);
};

FirefoxDriver.prototype.selectText = function(xpath) {
    var result = Utils.getDocument().evaluate(xpath, Utils.getDocument(), null, Components.interfaces.nsIDOMXPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (result) {
        // Handle Title elements slightly differently. On the plus side, IE does this too :)
        if (result.tagName == "TITLE") {
            this.server.respond("selectText", Utils.getBrowser().contentTitle);
        } else {
            this.server.respond("selectText", Utils.getText(result));
        }
    } else {
        this.server.respond("selectText", "");
    }
}