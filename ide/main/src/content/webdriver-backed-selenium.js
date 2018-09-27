function WebdriverBackedSelenium(baseUrl, useLastWindow, webDriverBrowserString, reuseBrowser, webDriverServer) {
  this.defaultTimeout = WebdriverBackedSelenium.DEFAULT_TIMEOUT;
  this.mouseSpeed = WebdriverBackedSelenium.DEFAULT_MOUSE_SPEED;
  this.baseUrl = baseUrl;
  this.webDriverBrowserString = webDriverBrowserString;
  this.webDriverServer = webDriverServer || "http://localhost:4444";
  this.webDriverServer = this.webDriverServer.replace(/\/\s*$/, "");
  WebdriverBackedSelenium.webDriverServer = this.webDriverServer;
  if ( reuseBrowser == 'never') { // never: Always open a new window, i.e. never reuse
    this.reuseBrowser = false;
    LOG.debug("Asked to always open a new window");
  } else if (reuseBrowser == 'always') { // always: Never open a new window, i.e. always reuse
    this.reuseBrowser = true;
    LOG.debug("Asked to always reuse an existing window");
  } else { // suite: Open a new window for a test suite, i.e. do not reuse for a play suite
    // TODO currently this results in a new window for every test case if you interactively play it. Fix it is there is demand
    this.reuseBrowser = useLastWindow ? true : false;
    LOG.debug("Asked to open a new window for a suite, will " + (this.reuseBrowser ? "reuse window if available" : "open a new window"));
  }
  this.browserbot = {
    baseUrl: baseUrl,
    runScheduledPollers: function() {
    }
  }
}

WebdriverBackedSelenium.prototype.reset = function() {
  //TODO destroy the current session and establish a new one?
};

WebdriverBackedSelenium.prototype.ensureNoUnhandledPopups = function() {

};

WebdriverBackedSelenium.prototype.preprocessParameter = function(value) {
  var match = value.match(/^javascript\{((.|\r?\n)+)\}$/);
  if (match && match[1]) {
    //TODO Samit: need an alternative!
    return eval(match[1]).toString();
  }
  return this.replaceVariables(value);
};

/*
 * Search through str and replace all variable references ${varName} with their
 * value in storedVars.
 */
WebdriverBackedSelenium.prototype.replaceVariables = function(str) {
  var stringResult = str;

  // Find all of the matching variable references
  var match = stringResult.match(/\$\{\w+\}/g);
  if (!match) {
    return stringResult;
  }

  // For each match, lookup the variable value, and replace if found
  for (var i = 0; match && i < match.length; i++) {
    var variable = match[i]; // The replacement variable, with ${}
    var name = variable.substring(2, variable.length - 1); // The replacement variable without ${}
    var replacement = storedVars[name];
    if (replacement && typeof(replacement) === 'string' && replacement.indexOf('$') != -1) {
      replacement = replacement.replace(/\$/g, '$$$$'); //double up on $'s because of the special meaning these have in 'replace'
    }
    if (replacement != undefined) {
      stringResult = stringResult.replace(variable, replacement);
    }
  }
  return stringResult;
};

function webdriverBackedSeleniumBuilder() {
  for (var fn in Selenium.prototype) {
    var match = /^(get|is|do)([A-Z].+)$/.exec(fn);
    if (match) {
      var baseName = match[2];
      var isBoolean = (match[1] == "is");
      var argsLen = Selenium.prototype[fn].length;
      var cmd = (match[1] != "do") ? fn : baseName.substr(0, 1).toLowerCase() + baseName.substr(1);
      if (!WebdriverBackedSelenium.prototype[fn]) {
        WebdriverBackedSelenium.prototype[fn] = webdriverBackedSeleniumFnBuilder(cmd, argsLen);
      }
    }
  }
  WebdriverBackedSelenium.DEFAULT_TIMEOUT = Selenium.DEFAULT_TIMEOUT;
  WebdriverBackedSelenium.DEFAULT_MOUSE_SPEED = Selenium.DEFAULT_MOUSE_SPEED;
  WebdriverBackedSelenium.webDriverServer = "http://localhost:4444";

  //The following do* are from selenium-runner.js
  //TODO: Samit: find a way to eliminate the copied code
  WebdriverBackedSelenium.prototype.doPause = function(waitTime) {
    currentTest.pauseInterval = waitTime;
  };

  WebdriverBackedSelenium.prototype.doEcho = function(message) {
    LOG.info("echo: " + message);
  };

  WebdriverBackedSelenium.prototype.doSetSpeed = function(speed) {
    var milliseconds = parseInt(speed);
    if (milliseconds < 0) milliseconds = 0;
    editor.setInterval(milliseconds);
  };

  WebdriverBackedSelenium.prototype.getSpeed = function() {
    return editor.getInterval();
  };

  WebdriverBackedSelenium.prototype.doSetTimeout = function() {

  };

	WebdriverBackedSelenium.prototype.doStore = function(value, varName) {
	  storedVars[varName] = value;
	};

  WebdriverBackedSelenium.prototype._elementLocator = function(sel1Locator) {
    var locator = parse_locator(sel1Locator);
    if (sel1Locator.match(/^\/\//) || locator.type == 'xpath') {
      locator.type = 'xpath';
      return locator;
    }
    if (locator.type == 'css') {
      return locator;
    }
    if (locator.type == 'id') {
      return locator;
    }
    if (locator.type == 'link') {
      locator.string = locator.string.replace(/^exact:/, '');
      return locator;
    }
    if (locator.type == 'name') {
      return locator;
    }
    return null;
  };

  WebdriverBackedSelenium.prototype.findElement = function(locator) {
    var l = this._elementLocator(locator);
    if (l) {
//      alert("findElement - how: " + l.type + ", what: " + l.string);
      return this.webDriverCommand('session/:sessionId/element', {}, {using: l.type, value: l.string});
    } else {
      return new Deferred(function(deferred) {
        deferred.reject('This types of locators cannot be used in webdriver playback mode. locator: ' + locator);
      });
    }
  };

  WebdriverBackedSelenium.prototype.doSendKeys = function(locator, value) {
//    alert("doSendKeys - Locator: " + locator + ", value: " + value);
    var self = this;
    var keys = value.split(/(.)/);

    return this.findElement(locator).pipe(function (webElement) {
      return self.webDriverCommand('session/:sessionId/element/:id/value', {id: webElement.ELEMENT}, {value: keys});
    });
  };

//  WebdriverBackedSelenium.prototype.doStoreText = function(target, varName) {
//    var element = this.page().findElement(target);
//    storedVars[varName] = getText(element);
//  };
//
//  WebdriverBackedSelenium.prototype.doStoreAttribute = function(target, varName) {
//    storedVars[varName] = this.page().findAttribute(target);
//  };
//
//  WebdriverBackedSelenium.prototype.doStore = function(value, varName) {
//    storedVars[varName] = value;
//  };

}

function webdriverBackedSeleniumFnBuilder(cmd, argsLen) {
  if (argsLen != 1) {
    return function() {
      //TODO return a promise
      var self = this;
      var cmdArgs = Array.prototype.slice.call(arguments);
      this.waitingForRemoteResult = true;
      function invokeCommand() {
        return self.remoteControlCommand(cmd, cmdArgs).done(function(response) {
          self.waitingForRemoteResult = false;
          //TODO do something with the response
          //alert("Received response to " + cmd + ": " + response);
        }).fail(function(response) {
          self.waitingForRemoteResult = false;
          //alert("Received response to " + cmd + ": " + response);
        });
      }

      if (!self.sessionId) {
        return self.startNewSession().pipe(invokeCommand);
      } else {
        return invokeCommand();
      }
    };
  }
  //There is no difference between this and the above fn, except the argument list
  // This argument list is required for correct dispatching of the call
  return function(arg1) {
    //TODO return a promise
    var self = this;
    var cmdArgs = Array.prototype.slice.call(arguments);
    this.waitingForRemoteResult = true;
    function invokeCommand() {
      return self.remoteControlCommand(cmd, cmdArgs).done(function(response) {
        self.waitingForRemoteResult = false;
        //TODO do something with the response
        //alert("Received response to " + cmd + ": " + response);
      }).fail(function(response) {
        self.waitingForRemoteResult = false;
        //alert("Received response to " + cmd + ": " + response);
      });
    }

    if (!self.sessionId) {
      return self.startNewSession().pipe(invokeCommand);
    } else {
      return invokeCommand();
    }
  };
}

// Populate the WebdriverBackedSelenium with Selenium API functions
webdriverBackedSeleniumBuilder();

//TODO Samit: get these on some other object
WebdriverBackedSelenium.prototype.startNewSession = function() {
  var self = this;
  return this.startNewWebdriverSession(this.webDriverBrowserString).pipe(function() {
    return self.startNewBrowserSession({});
  }, function (msg) {
    //TODO failed to connect
//    alert('Failed to start new session');
    return msg;
  });
};

WebdriverBackedSelenium.prototype.startNewWebdriverSession = function(browserName) {
  var self = this;
  return new Deferred(function(deferred) {
    if (self.reuseBrowser && WebdriverBackedSelenium.webdriverSID) {
      LOG.debug('Reusing existing connection to Selenium Server');
      self.webdriverSID = WebdriverBackedSelenium.webdriverSID;
      self.webdriverResponse = WebdriverBackedSelenium.webdriverResponse;
      deferred.resolve(self.webdriverSID);
      return;
    }
    LOG.debug('Connecting to Selenium Server');
    HTTP.post(self.webDriverServer + '/wd/hub/session',
        JSON.stringify({
          'desiredCapabilities': {'browserName': browserName}
        }), {'Accept': 'application/json; charset=utf-8'}, function(response, success) {
          if (success && response) {
            self.webdriverResponse = JSON.parse(response.replace(/\0/g, ''));
            self.webdriverSID = self.webdriverResponse.sessionId;
            WebdriverBackedSelenium.webdriverSID = self.webdriverSID;
            WebdriverBackedSelenium.webdriverResponse = self.webdriverResponse;
            deferred.resolve(self.webdriverSID);
          } else {
            if (response) {
              var result = JSON.parse(response.replace(/\0/g, ''));
              if (result.value.class && result.value.class == "org.openqa.selenium.WebDriverException") {
                deferred.reject({message: {t: 'RemoteConnectError', m: 'Could not start browser. Have you installed the driver correctly? Error message was: ' + result.value.message }});
                return;
              }
            }
            deferred.reject({message: {t: 'RemoteConnectError', m: 'Could not connect to Selenium Server. Have you started the Selenium Server yet?'}});
          }
        });
  });
};

WebdriverBackedSelenium.closeWebdriverSession = function() {
  return new Deferred(function(deferred) {
    if (WebdriverBackedSelenium.webdriverSID) {
      LOG.debug('Closing existing connection to Selenium Server');
      var webdriverSID = WebdriverBackedSelenium.webdriverSID;
      WebdriverBackedSelenium.webdriverSID = null;
      WebdriverBackedSelenium.sessionId = null;

      HTTP._delete(WebdriverBackedSelenium.webDriverServer + '/wd/hub/session/' + webdriverSID,
        {'Accept': 'application/json; charset=utf-8'}, function(response, success) {
          if (success && response) {
            deferred.resolve();
          } else {
            deferred.reject({message: {t: 'RemoteConnectError', m: 'Could not close session, probably none existed.'}});
          }
        }
      );
    } else {
      deferred.resolve();
    }
  });
};

WebdriverBackedSelenium.prototype.startNewBrowserSession = function(options, callback) {
  //options should be an array of items in the form key=value
  var self = this;
  if (self.reuseBrowser && WebdriverBackedSelenium.sessionId) {
    return new Deferred(function(deferred) {
      self.sessionId = WebdriverBackedSelenium.sessionId;
      deferred.resolve(self.sessionId);
    });
  }
  var startArgs = ['*webdriver', self.baseUrl, ''];
  var sid = this.webdriverResponse.value['webdriver.remote.sessionid'];
  startArgs.push('webdriver.remote.sessionid=' + sid);
  if (options && options.length > 0) {
    startArgs.push(options.sort().join(';'));
  }
  return self.remoteControlCommand('getNewBrowserSession', startArgs).done(function(response) {
    self.sessionId = response;
    WebdriverBackedSelenium.sessionId = response;
  });
};

WebdriverBackedSelenium.prototype.remoteControlCommand = function(verb, args) {
  var self = this;
  //TODO handle timeout stuff: timeout(@default_timeout_in_seconds) do
  var requestData = httpRequestFor(verb, args, this.sessionId);
//  alert("Sending server request: " + requestData);
  return new Deferred(function(deferred) {
    HTTP.post(self.webDriverServer + '/selenium-server/driver/', requestData, {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}, function(response, success, status) {
      if (success) {
        if (response.substr(0, 2) === 'OK') {
          deferred.resolve(response.substr(3)); //strip "OK," from response
        } else {
          //TODO raise CommandError, response unless status == "OK"
          if (response.substr(0, 5) === 'ERROR') {
            if (response.substr(6, 58) === "Window not found. The browser window may have been closed.") {
              deferred.reject({message: {t: 'RemoteConnectError', m: 'It seems like the old window was closed. Close session and run test again to start over.'}});
            } else if (response.substr(6, 79).match(/Server Exception: sessionId [0-9a-f-]+ doesn't exist;/)) {
              deferred.reject({message: {t: 'RemoteConnectError', m: 'It seems like Selenium server was restarted. Close session and run test again to start over.'}});
            } else {
              deferred.reject(response.substr(6));   //strip "ERROR," from response
            }
          } else {
            alert("Received command response (!=OK/ERROR): " + response + "\n Request Data: " + requestData);
            deferred.reject(response);
          }
        }
      } else if ( ! status ) {
        deferred.reject({message: {t: 'RemoteConnectError', m: 'Could not connect to Selenium Server. Have you started the Selenium Server yet?'}});
      } else {
        deferred.reject('Received an invalid status code from Selenium Server');
      }
    });
  });
};

WebdriverBackedSelenium.prototype.webDriverCommand = function(url, opts, args) {
  //TODO handle timeout stuff: timeout(@default_timeout_in_seconds) do
  if (this.webdriverSID) {
    url = url.replace(':sessionId', this.webdriverSID);
  }
  for (var opt in opts) {
     if (opts.hasOwnProperty(opt) && url.indexOf(':' + opt) >= 0) {
       url = url.replace(':' + opt, encodeURIComponent(opts[opt]));
     }
  }
  var requestData = null;
  var requestMethod = 'GET';
  var contentType = {};
  if (args) {
    requestMethod = 'POST';
    requestData = JSON.stringify(args);
    contentType = {'Content-Type': 'application/json; charset=utf-8'};
  }
//  alert("Sending server request: " + requestData);
  var self = this;
  return new Deferred(function(deferred) {
    HTTP.request(requestMethod, self.webDriverServer + '/wd/hub/' + url, requestData, contentType, function(response, success, status) {
      var result;
      if (response) {
//          alert("Response: " + response);
        result = JSON.parse(response.replace(/\0/g, ''));
      }
      if (success) {
        if (response) {
          deferred.resolve(result.value);
        }else {
          deferred.resolve();
        }
      } else {
        if (response) {
          if (result.value.class && result.value.class == "org.openqa.selenium.remote.SessionNotFoundException" ) {
            self.webdriverSID = null;
            WebdriverBackedSelenium.webdriverSID = null;
            self.sessionId = null;
            WebdriverBackedSelenium.sessionId = null;
            deferred.reject({message: {t: 'RemoteConnectError', m: 'It seems like Selenium server was restarted. Run test again to start over.'}});
          } else if (result.value.class && result.value.class == "org.openqa.selenium.NoSuchWindowException" ) {
            self.sessionId = null;
            WebdriverBackedSelenium.sessionId = null;
            deferred.reject({message: {t: 'RemoteConnectError', m: 'It seems like the old window was closed. Please close session and run test again to start over.'}});
          } else {
            deferred.reject(result.value.message);
          }
        } else {
          deferred.reject('Unknown webdriver error');
        }
      }
    });
  });
};

function httpRequestFor(verb, args, sessionId) {
  var data = 'cmd=' + encodeURIComponent(verb);
  if (args) {
    args.forEach(function(arg, index) {
      data += '&' + (index + 1) + '=' + encodeURIComponent(arg);
    });
  }
  if (sessionId) {
    data += '&sessionId=' + sessionId;
  }
  return data;
}
