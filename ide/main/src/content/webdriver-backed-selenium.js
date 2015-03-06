function WebdriverBackedSelenium(baseUrl, webDriverBrowserString) {
  this.defaultTimeout = WebdriverBackedSelenium.DEFAULT_TIMEOUT;
  this.mouseSpeed = WebdriverBackedSelenium.DEFAULT_MOUSE_SPEED;
  this.baseUrl = baseUrl;
  this.webDriverBrowserString = webDriverBrowserString;
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
//  return this.startNewWebdriverSession('firefox').pipe(function() {
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
    LOG.debug('Connecting to Selenium Server');
    HTTP.post('http://localhost:4444/wd/hub/session',
        JSON.stringify({
          'desiredCapabilities': {'browserName': browserName}
        }), {'Accept': 'application/json; charset=utf-8'}, function(response, success) {
          if (success && response) {
            self.webdriverResponse = JSON.parse(response.replace(/\0/g, ''));
            self.webdriverSID = self.webdriverResponse.sessionId;
            deferred.resolve(self.webdriverSID);
          } else {
            deferred.reject({message: {t: 'RemoteConnectError', m: 'Could not connect to Selenium Server. Have you started the Selenium Server yet?'}});
          }
        });
  });
};

WebdriverBackedSelenium.prototype.startNewBrowserSession = function(options, callback) {
  //options should be an array of items in the form key=value
  var self = this;
  var startArgs = ['*webdriver', self.baseUrl, ''];
  var sid = this.webdriverResponse.value['webdriver.remote.sessionid'];
  startArgs.push('webdriver.remote.sessionid=' + sid);
  if (options && options.length > 0) {
    startArgs.push(options.sort().join(';'));
  }
  return self.remoteControlCommand('getNewBrowserSession', startArgs).done(function(response) {
    self.sessionId = response;
  });
};

WebdriverBackedSelenium.prototype.remoteControlCommand = function(verb, args) {
  //TODO handle timeout stuff: timeout(@default_timeout_in_seconds) do
  var requestData = httpRequestFor(verb, args, this.sessionId);
//  alert("Sending server request: " + requestData);
  return new Deferred(function(deferred) {
    HTTP.post('http://localhost:4444/selenium-server/driver/', requestData, {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}, function(response, success) {
      if (success) {
        if (response.substr(0, 2) === 'OK') {
          deferred.resolve(response.substr(3)); //strip "OK," from response
        } else {
          //TODO raise CommandError, response unless status == "OK"
          if (response.substr(0, 5) === 'ERROR') {
            deferred.reject(response.substr(6));   //strip "ERROR," from response
          } else {
            alert("Received command response (!=OK/ERROR): " + response + "\n Request Data: " + requestData);
            deferred.reject(response);
          }
        }
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
  return new Deferred(function(deferred) {
    HTTP.request(requestMethod, 'http://localhost:4444/wd/hub/' + url, requestData, contentType, function(response, success, status) {
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
          deferred.reject(result.value.message);
        } else {
          deferred.reject('Error');
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
