function FirefoxDriver(server, id) {
    this.server = server;
    this.context = new Context();
    this.id = id;
}

FirefoxDriver.prototype.get = function(respond, url) {
    var self = this;
    this.context.frameId = "?";

    new WebLoadingListener(this, function(event) {
        // TODO: Rescue the URI and response code from the event
        var responseText = "";
        respond(self.context, "get", responseText);
    });
    Utils.getBrowser(this.context).loadURI(url);
}

FirefoxDriver.prototype.quit = function(respond) {
    var appService = Utils.getService("@mozilla.org/toolkit/app-startup;1", "nsIAppStartup");
    appService.quit(Components.interfaces.nsIAppStartup.eForceQuit);
}

FirefoxDriver.prototype.close = function(respond) {
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
        appService.quit(forceQuit);
        return;  // The client should catch the fact that the socket suddenly closes
    }

    // If we're still running, return
    respond(this.context, "close");
}

FirefoxDriver.prototype.getCurrentUrl = function(respond) {
    respond(this.context, "getCurrentUrl", Utils.getBrowser(this.context).contentWindow.location);
}

FirefoxDriver.prototype.title = function(respond) {
    var browser = Utils.getBrowser(this.context);
    respond(this.context, "title", browser.contentTitle);
};

FirefoxDriver.prototype.getPageSource = function(respond) {
    var source = Utils.getDocument(this.context).getElementsByTagName("html")[0].innerHTML;
    respond(this.context, "getPageSource", "<html>" + source + "</html>");
};


FirefoxDriver.prototype.selectElementUsingXPath = function(respond, xpath) {
    var doc = Utils.getDocument(this.context);
    var result = doc.evaluate(xpath, doc, null, Components.interfaces.nsIDOMXPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (result) {
        var index = Utils.addToKnownElements(result, this.context);
        respond(this.context, "selectElementUsingXPath", index);
    } else {
        respond(this.context, "selectElementUsingXPath");
    }
};

FirefoxDriver.prototype.selectElementUsingLink = function(respond, linkText) {
    var allLinks = Utils.getDocument(this.context).getElementsByTagName("A");
    var index;
    for (var i = 0; i < allLinks.length && !index; i++) {
        var text = Utils.getText(allLinks[i], true);
        if (linkText == text) {
            index = Utils.addToKnownElements(allLinks[i], this.context);
        }
    }
    if (index !== undefined) {
        respond(this.context, "selectElementUsingLink", index);
    } else {
        respond(this.context, "selectElementUsingLink");
    }
};

FirefoxDriver.prototype.selectElementById = function(respond, id) {
    var doc = Utils.getDocument(this.context);
    var element = doc.getElementById(id);

    if (element == null || !element) {
        respond(this.context, "selectElementById");
        return;
    }

    var index = Utils.addToKnownElements(element, this.context);

    respond(this.context, "selectElementById", index);
}

FirefoxDriver.prototype.selectElementsUsingXPath = function(respond, xpath) {
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
    respond(this.context, "selectElementsUsingXPath", response);
};

FirefoxDriver.prototype.switchToFrame = function(respond, frameId) {
    var browser = Utils.getBrowser(this.context);

    var frames = browser.contentWindow.frames;

    var index = frameId - 0;
    if (frames.length > index) {
        this.context = new Context(this.context.windowId, frameId);
    }
    respond(this.context, "switchToFrame");
}

FirefoxDriver.prototype.switchToNamedFrame = function(respond, frameId) {
	this.context = new Context(this.context.windowId, frameId);
	respond(this.context, "switchToNamedFrame");
}

FirefoxDriver.prototype.switchToDefaultContent = function(respond) {
    this.context.frameId = "?";
    respond(this.context, "switchToDefaultContent");
}

FirefoxDriver.prototype.goBack = function(respond) {
    var browser = Utils.getBrowser(this.context);

    dump("Can we go back?\n");
    if (browser.canGoBack) {
      dump("Yes we can\n");
      Utils.dump(browser);
      browser.goBack();
    }

    respond(this.context, "goBack");
}

FirefoxDriver.prototype.goForward = function(respond) {
    var browser = Utils.getBrowser(this.context);

    if (browser.canGoForward) {
      browser.goForward();
    }

    respond(this.context, "goForward");
}