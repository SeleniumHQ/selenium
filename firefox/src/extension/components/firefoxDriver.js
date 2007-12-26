function FirefoxDriver(server, id) {
    this.server = server;
    this.context = new Context();
    this.id = id;
}

FirefoxDriver.prototype.get = function(respond, url) {
    var self = this;
    this.context.frameId = "?";

    // Check to see if the given url is the same as the current one, but
    // with a different anchor tag.
    var current = Utils.getBrowser(this.context).contentWindow.location
    var ioService = Utils.getService("@mozilla.org/network/io-service;1", "nsIIOService");
    var currentUri = ioService.newURI(current, "", null);
    var futureUri = ioService.newURI(url, "", currentUri);

    var loadEventExpected = true;

    if (currentUri && futureUri &&
        currentUri.prePath == futureUri.prePath &&
        currentUri.filePath == futureUri.filePath) {
        // Looks like we're at the same url with a ref
        // Being clever and checking the ref was causing me headaches. Brute force for now
        loadEventExpected = futureUri.path.indexOf("#") == -1;
    }

    if (loadEventExpected) {
        new WebLoadingListener(this, function(event) {
            // TODO: Rescue the URI and response code from the event
            var responseText = "";
            respond(self.context, "get", responseText);
        });
    }

    Utils.getBrowser(this.context).loadURI(url);

    if (!loadEventExpected) {
        respond(self.context, "get", "");
    }
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

    if (browser.canGoBack) {
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

FirefoxDriver.prototype.addCookie = function(respond, cookieString) {
    var doc = Utils.getDocument(this.context);
    doc.cookie = cookieString;
    respond(this.context, "addCookie");
}

FirefoxDriver.prototype.getCookie = function(respond) {
    var doc = Utils.getDocument(this.context);
    var cookieManager = Utils.getService("@mozilla.org/cookiemanager;1", "nsICookieManager2");
    var toReturn = "";
    
    var location = Utils.getBrowser(this.context).contentWindow.location;
    var isForCurrentHost = function(c) {
        try {
            return location.hostname.indexOf(c.host) != -1;
        } catch(e) {
            return false;
        }
    }
    
    var cookieToString = function(c) {
      return c.name + "=" + c.value + ";" + (c.isDomain ? "domain=" + c.host + ";": "")
          + (c.path == "/" ? "" : "path=" + c.path + ";") + "expires=" + c.expires + ";"
          +(c.isSecure ? "secure ;" : "");
    }

    var allCookies = cookieManager.enumerator;

    while (allCookies.hasMoreElements()) {
      var cookie = allCookies.getNext();
      cookie = cookie.QueryInterface(Components.interfaces.nsICookie)
      if (isForCurrentHost(cookie)) {
        toReturn += cookieToString(cookie) + "\n";
      }
    }
    respond(this.context, "getCookie", toReturn);
}

FirefoxDriver.prototype.deleteCookie = function(respond, nameAndPath) {
    var nameAndPathList = nameAndPath.split(";");
    var name = nameAndPathList[0];
    var path = nameAndPathList[1];
    var doc = Utils.getDocument(this.context);
    doc.cookie = name +"=;expires=Thu, 01-Jan-1970 00:00:01 GMT;path=" + path;
    respond(this.context, "deleteCookie");
}
