function FirefoxDriver(server, id) {
    this.server = server;
    this.context = new Context();
    this.id = id;
    this.mouseSpeed = 1; 
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
            respond.context = self.context;
            respond.response = responseText;
            respond.send();
        });
    }

    Utils.getBrowser(this.context).loadURI(url);

    if (!loadEventExpected) {
        respond.context = self.context;
        respond.send();
    }
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
    respond.context = this.context;
    respond.send();
}

FirefoxDriver.prototype.executeScript = function(respond, script) {
	var doc = Utils.getDocument(this.context);

        var window = Utils.getBrowser(this.context).contentWindow;

        script = "(function(){" + script + "})();"
	try {
                var window = window;
                var document = doc;
                var result = eval(script);

		// Sophisticated.
		if (result['tagName']) {
		  respond.setField('resultType', "ELEMENT");
                  respond.response = Utils.addToKnownElements(result, this.context);
                } else {
		  respond.setField('resultType', "OTHER");
                  respond.response = result;
                }


        } catch (e) {
		respond.isError = true;
		respond.response = e;
	}
	respond.send();
};

FirefoxDriver.prototype.getCurrentUrl = function(respond) {
    respond.context = this.context;
    respond.response = "" + Utils.getBrowser(this.context).contentWindow.location;
    respond.send();
}

FirefoxDriver.prototype.title = function(respond) {
    var browser = Utils.getBrowser(this.context);
    respond.context = this.context;
    respond.response = browser.contentTitle;
    respond.send();
};

FirefoxDriver.prototype.getPageSource = function(respond) {
    var source = Utils.getDocument(this.context).getElementsByTagName("html")[0].innerHTML;

    respond.context = this.context;
    respond.response = "<html>" + source + "</html>";
    respond.send();
};


FirefoxDriver.prototype.selectElementUsingXPath = function(respond, xpath) {
    var doc = Utils.getDocument(this.context);
    var result = doc.evaluate(xpath, doc, null, Components.interfaces.nsIDOMXPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    respond.context = this.context;

    if (result) {
        respond.response = Utils.addToKnownElements(result, this.context);
    } else {
        respond.isError = true;
        respond.response = "Unable to locate element using " + xpath;
    }

    respond.send();
};

FirefoxDriver.prototype.selectElementUsingClassName = function(respond, name) {
    var doc = Utils.getDocument(this.context);

    if (doc["getElementsByClassName"]) {
      var elements = doc.getElementsByClassName(name);
      respond.context = this.context;

      if (elements.length) {
        respond.response = Utils.addToKnownElements(elements[0], this.context);
      } else {
        respond.isError = true;
        respond.response = "Unable to find element with class name '" + name + "'";
      }

      respond.send();
    } else {
      this.selectElementUsingXPath(respond, "//*[contains(concat(' ',normalize-space(@class),' '),' " + name + " ')]");
    }
};

FirefoxDriver.prototype.selectElementsUsingClassName = function(respond, name) {
    var doc = Utils.getDocument(this.context)

    if (doc["getElementsByClassName"]) {
      var result = doc.getElementsByClassName(name);

      var response = "";
      for (var i = 0; i < result.length; i++) {
          var element = result[i];
          var index = Utils.addToKnownElements(element, this.context);
          response += index + ",";
      }
      // Strip the trailing comma
      response = response.substring(0, response.length - 1);

      respond.context = this.context;
      respond.response = response;
      respond.send();
    } else {
      this.selectElementsUsingXPath(respond, "//*[contains(concat(' ',normalize-space(@class),' '),' " + name + " ')]");
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

    respond.context = this.context;

    if (index !== undefined) {
        respond.response = index;
    } else {
        respond.isError = true;
        respond.response = "Unable to find element with link text '" + linkText + "'";
    }

    respond.send();
};

FirefoxDriver.prototype.selectElementById = function(respond, id) {
    var doc = Utils.getDocument(this.context);
    var element = doc.getElementById(id);

    respond.context = this.context;

    if (element) {
        respond.response = Utils.addToKnownElements(element, this.context);
    } else {
        respond.isError = true;
        respond.response = "Unable to find element with id '" + id + "'";
    }

    respond.send();
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

    respond.context = this.context;
    respond.response = response;
    respond.send();
};

FirefoxDriver.prototype.switchToFrame = function(respond, frameId) {
    var browser = Utils.getBrowser(this.context);
    var frameDoc = Utils.findDocumentInFrame(browser, frameId[0]);

    if (frameDoc) {
        this.context = new Context(this.context.windowId, frameId[0]);
        respond.context = this.context.toString();
        respond.send();
    } else {
        respond.isError = true;
        respond.response = "Cannot find frame with id: " + frameId;
        respond.send();
    }
}

FirefoxDriver.prototype.switchToDefaultContent = function(respond) {
    this.context.frameId = "?";
    respond.context = this.context.toString();
    respond.send();
}

FirefoxDriver.prototype.switchToActiveElement = function(respond) {
  var doc = Utils.getDocument(this.context);

  var element;
  if (doc["activeElement"]) {
    dump("Active element is present\n");
    element = doc.activeElement;
  } else {
    var commandDispatcher = Utils.getBrowser(this.context).ownerDocument.commandDispatcher;

    doc = Utils.getDocument(this.context);
    element = commandDispatcher.focusedElement;

    if (element && Utils.getDocument(this.context) != element.ownerDocument)
      element = null;
  }

  // Default to the body
  if (!element) {
    element = Utils.getDocument(this.context).body;
  }

  respond.response = Utils.addToKnownElements(element, this.context);
  respond.send();
};


FirefoxDriver.prototype.goBack = function(respond) {
    var browser = Utils.getBrowser(this.context);

    if (browser.canGoBack) {
      browser.goBack();
    }

    respond.context = this.context;
    respond.send();
}

FirefoxDriver.prototype.goForward = function(respond) {
    var browser = Utils.getBrowser(this.context);

    if (browser.canGoForward) {
      browser.goForward();
    }

    respond.context = this.context;
    respond.send();
}

FirefoxDriver.prototype.addCookie = function(respond, cookieString) {
    var cookie;
    cookie = eval('(' + cookieString[0] + ')');

    if (cookie.expiry) {
        cookie.expiry = new Date(cookie.expiry);
    } else {
        var date = new Date();
        date.setYear(2030);
        cookie.expiry = date;
    }

    cookie.expiry = cookie.expiry.getTime() / 1000; // Stored in seconds

    if (!cookie.domain) {
        var location = Utils.getBrowser(this.context).contentWindow.location
        cookie.domain = location.hostname; // + ":" + location.port;
    }

    var cookieManager = Utils.getService("@mozilla.org/cookiemanager;1", "nsICookieManager2");

    // The signature for "add" is different in firefox 3 and 2. We should sniff the browser version and call the right
    // version of the method, but for now we'll use brute-force.
    try {
      cookieManager.add(cookie.domain, cookie.path, cookie.name, cookie.value, cookie.secure, false, cookie.expiry);
    } catch(e) {
      cookieManager.add(cookie.domain, cookie.path, cookie.name, cookie.value, cookie.secure, false, false, cookie.expiry);  
    }

    respond.context = this.context;
    respond.send();
}

FirefoxDriver.prototype.getCookie = function(respond) {
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
    
    var isForCurrentPath = function(c) {
        try {
        	return location.pathname.indexOf(c.path) != -1;
        } catch(e) {
        	return false;
        }
    }
    
    var cookieToString = function(c) {
      return c.name + "=" + c.value + ";" + "domain=" + c.host + ";"
          + "path=" + c.path + ";" + "expires=" + c.expires + ";"
          +(c.isSecure ? "secure ;" : "");
    }

    var allCookies = cookieManager.enumerator;

    while (allCookies.hasMoreElements()) {
      var cookie = allCookies.getNext();

      cookie = cookie.QueryInterface(Components.interfaces.nsICookie)
      if (isForCurrentHost(cookie) && isForCurrentPath(cookie)) {
        toReturn += cookieToString(cookie) + "\n";
      }
    }

    respond.context = this.context;
    respond.response = toReturn;
    respond.send();
}

FirefoxDriver.prototype.deleteCookie = function(respond, cookieString) {
    var cookie = eval('(' + cookieString + ')');

    if (!cookie.domain) {
        var location = Utils.getBrowser(this.context).contentWindow.location
        cookie.domain = location.hostname; // + ":" + location.port;
    }

    if (!cookie.path) {
        cookie.path = "/";
    }

    var cookieManager = Utils.getService("@mozilla.org/cookiemanager;1", "nsICookieManager");
    cookieManager.remove(cookie.domain, cookie.name, cookie.path, false);

    respond.context = this.context;
    respond.send();
}


FirefoxDriver.prototype.setMouseSpeed = function(respond, speed) {
    this.mouseSpeed = speed;
    respond.context = this.context;
    respond.send();
};

FirefoxDriver.prototype.getMouseSpeed = function(respond, speed) {
    respond.context = this.context;
    respond.response = "" + this.mouseSpeed;
    respond.send();
};
