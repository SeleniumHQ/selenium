function FirefoxDriver(server, id) {
    this.server = server;
    this.context = new Context();
	this.id = id;
}

FirefoxDriver.prototype.get = function(url) {
    var self = this;
	this.context.frameId = "?";

    new WebLoadingListener(this, function(event) {
        // TODO: Rescue the URI and response code from the event
        var responseText = "";
        self.server.respond(self.context, "get", responseText);
    });
    Utils.getBrowser(this.context).loadURI(url);
}

FirefoxDriver.prototype.close = function() {
       // Grab all the references we'll need. Once we call close all this might go away
       var wm = Utils.getService("@mozilla.org/appshell/window-mediator;1", "nsIWindowMediator");
       var appService = Utils.getService("@mozilla.org/toolkit/app-startup;1", "nsIAppStartup");
       var forceQuit = Components.interfaces.nsIAppStartup.eForceQuit;
       var server = this.server;

       var lastWindow;
       var allWindows = wm.getEnumerator("navigator:browser");
       
       // Here we go!
       try {
               var browser = Utils.getBrowser(this.context);
               browser.contentWindow.close();
       } catch(e) {
               dump(e);
       }
       
       // If we're on a Mac we might have closed all the windows but not quit, so ensure that we do actually quit :)
       var allWindows = wm.getEnumerator("navigator:browser");
       if (!allWindows.hasMoreElements()) {
               dump("Quitting. No more open windows\n");
               appService.quit(forceQuit);
       }
       
       // If we're still running, return
       server.respond(this.context, "close");
}

FirefoxDriver.prototype.getCurrentUrl = function() {
    this.server.respond(this.context, "getCurrentUrl", Utils.getBrowser(this.context).contentWindow.location);
}

FirefoxDriver.prototype.title = function() {
    var browser = Utils.getBrowser(this.context);
    this.server.respond(this.context, "title", browser.contentTitle);
};

FirefoxDriver.prototype.selectElementUsingXPath = function(xpath) {
    var doc = Utils.getDocument(this.context);
    var result = doc.evaluate(xpath, doc, null, Components.interfaces.nsIDOMXPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (result) {
        var index = Utils.addToKnownElements(result, this.context);
        this.server.respond(this.context, "selectElementUsingXPath", index);
    } else {
        this.server.respond(this.context, "selectElementUsingXPath");
    }
};

FirefoxDriver.prototype.selectElementUsingLink = function(linkText) {
    var allLinks = Utils.getDocument(this.context).getElementsByTagName("A");
    var index;
    for (var i = 0; i < allLinks.length && !index; i++) {
        var text = Utils.getText(allLinks[i], true);
        if (linkText == text) {
            index = Utils.addToKnownElements(allLinks[i], this.context);
        }
    }
    if (index !== undefined) {
        this.server.respond(this.context, "selectElementUsingLink", index);
    } else {
        this.server.respond(this.context, "selectElementUsingLink");
    }
};

FirefoxDriver.prototype.selectElementById = function(id) {
	var doc = Utils.getDocument(this.context);
    var element = doc.getElementById(id);

    if (element == null || !element) {
        this.server.respond(this.context, "selectElementById");
        return;
    }

    var index = Utils.addToKnownElements(element, this.context);

    this.server.respond(this.context, "selectElementById", index);
}

FirefoxDriver.prototype.selectElementsUsingXPath = function(xpath) {
    var doc = Utils.getDocument(this.context)
    var result = doc.evaluate(xpath, doc, null, Components.interfaces.nsIDOMXPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    var response = "";
    var element = result.iterateNext();
    while (element) {
        var index = Utils.addToKnownElements(element, this.context);
        response += index + ",";
        element = result.iterateNext();
    }
    // Strip the trailing comma
    response = response.substring(0, response.length - 1);
    this.server.respond(this.context, "selectElementsUsingXPath", response);
};

FirefoxDriver.prototype.switchToFrame = function(frameId) {
    var browser = Utils.getBrowser(this.context);

    var frames = browser.contentWindow.frames;

    var index = frameId - 0;
    if (frames.length > index) {
        this.context = new Context(this.context.windowId, frameId);
    }
    this.server.respond(this.context, "switchToFrame");
}

FirefoxDriver.prototype.switchToDefaultContent = function() {
	this.context.frameId = "?";
	this.server.respond(this.context, "switchToDefaultContent");
}