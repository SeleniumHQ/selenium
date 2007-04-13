function FirefoxDriver(server) {
    this.server = server;
    this.location = new Location("0 0");
    new WindowListener(this);
}

FirefoxDriver.prototype.get = function(url) {
    var server = this.server;
    var driver = this;

    new WebLoadingListener(this, function(event) {
        // TODO: Rescue the URI and response code from the event
        var responseText = "";
        server.respond(driver.location, "get", responseText);
    });
    Utils.getBrowser(this.location).loadURI(url);
}

FirefoxDriver.prototype.getCurrentUrl = function() {
    this.server.respond(this.location, "getCurrentUrl", Utils.getBrowser(this.location).contentWindow.location.href);
}

FirefoxDriver.prototype.title = function() {
    this.server.respond(this.location, "title", Utils.getBrowser(this.location).contentTitle);
};

FirefoxDriver.prototype.selectText = function(xpath) {
    var doc = Utils.getDocument(this.location);
    var result = doc.evaluate(xpath, doc, null, Components.interfaces.nsIDOMXPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (result) {
        // Handle Title elements slightly differently. On the plus side, IE does this too :)
        if (result.tagName == "TITLE") {
            this.server.respond(this.location, "selectText", Utils.getBrowser(this.location).contentTitle);
        } else {
            this.server.respond(this.location, "selectText", Utils.getText(result));
        }
    } else {
        this.server.respond(this.location, "selectText", "");
    }
};

FirefoxDriver.prototype.selectElementUsingXPath = function(xpath) {
    var doc = Utils.getDocument(this.location);
    var result = doc.evaluate(xpath, doc, null, Components.interfaces.nsIDOMXPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (result) {
        var index = Utils.addToKnownElements(result, this.location);
        this.server.respond(this.location, "selectElementUsingXPath", index);
    } else {
        this.server.respond(this.location, "selectElementUsingXPath");
    }
};

FirefoxDriver.prototype.selectElementUsingLink = function(linkText) {
    var allLinks = Utils.getDocument(this.location).getElementsByTagName("A");
    var index;
    for (var i = 0; i < allLinks.length && !index; i++) {
        var text = Utils.getText(allLinks[i]);
        if (linkText == text) {
            index = Utils.addToKnownElements(allLinks[i], this.location);
        }
    }
    if (index !== undefined) {
        this.server.respond(this.location, "selectElementUsingLink", index);
    } else {
        this.server.respond(this.location, "selectElementUsingLink");
    }
};

FirefoxDriver.prototype.selectElementById = function(id) {
    var element = Utils.getDocument(this.location).getElementById(id);

    if (element == null || !element) {
        this.server.respond(this.location, "selectElementById");
        return;
    }

    var index = Utils.addToKnownElements(element, this.location);

    this.server.respond(this.location, "selectElementById", index);
}

FirefoxDriver.prototype.selectElementsUsingXPath = function(xpath) {
    var doc = Utils.getDocument(this.location)
    var result = doc.evaluate(xpath, doc, null, Components.interfaces.nsIDOMXPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    var response = "";
    var element = result.iterateNext();
    while (element) {
        var index = Utils.addToKnownElements(element, this.location);
        response += index + ",";
        element = result.iterateNext();
    }
    response = response.substring(0, response.length - 1);
    // Strip the trailing comma
    this.server.respond(this.location, "selectElementsUsingXPath", response);
};

FirefoxDriver.prototype.switchToFrame = function(frameId) {
    var browser = Utils.getBrowser(this.location);

    var frames = browser.contentWindow.frames;

    var index = frameId - 0;
    if (frames.length > index) {
        this.location.frame = frameId;
    }
    this.server.respond(this.location, "switchToFrame");
}

FirefoxDriver.prototype.switchToWindow = function(windowIndex) {
    this.location.window = windowIndex;
    this.location.frame = 0;
    dump("New location is: " + this.location + "\n");
    this.server.respond(this.location, "switchToWindow");
}