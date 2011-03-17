function RemoteRunnerTest(name) {
    TestCase.call(this,name);
}

RemoteRunnerTest.prototype = new TestCase();
RemoteRunnerTest.prototype.setUp = function() {
    postResult = "START";
    debugMode = false;
    relayToRC = null;
    proxyInjectionMode = false;
    uniqueId = 'sel_654321';
    
    this.oldSelenium = Selenium;
    this.oldRemoteRunnerOptions = RemoteRunnerOptions;
    this.oldWindowSetTimeout = window.setTimeout;
    
    window.document.getElementById = function() {}
    top = window;
    window.top = window;
    document.createElement = function() {
        return {
            style: {}
        };
    };
    document.commands = {
        commandList: {}
    };
    
    Selenium = function() {
        return {
            browserbot: {
                _modifyWindow: function() {},
                getCurrentWindow: function() { return window; },
                runScheduledPollers: function() {}
            },
            reset: function() {},
            preprocessParameter: function(arg) { return (arg); },
            ensureNoUnhandledPopups: function() {},
            doSpecialTestCommand: function() {},
            getSpecialTestValue: function() { return "foo"; },
            isSpecialTestBoolean: function() { return true; }
        }
    };
    
    Selenium.createForWindow = function() {
        return new Selenium();
    };
    
    RemoteRunnerOptions = function() {
        return {
            initialize: function() {},
            isDebugMode: function() { return false; },
            isMultiWindowMode: function() { return false; },
            getContinue: function() { return null; },
            getDriverUrl: function() { return "http://localhost:4444/selenium-server/driver/";},
            getBaseUrl: function() { return "http://localhost:4444/";},
            getSessionId: function() { return "123456"; }
        }
    };
    
    xhrs = [];
    xhr = null;
    
    MockXhr = function() {};
    MockXhr.prototype.open = function(method, url, async) {
        if (!async) {
            throw new Error("MockXhr can only handle asynchronous requests");
        }
        this.url = url;
        this.method = method;
    }
    MockXhr.prototype.send = function(body) {
        this.body = body;
    }
    MockXhr.prototype.respond = function(body) {
        this.readyState = 4;
        this.status = 200;
        this.responseText = body;
        this.onreadystatechange();
        while (timeouts.length > 0) {
            timeouts.pop().call();
        }
    }
            
    
    XmlHttp = {
        create: function() {
            var xhr = new MockXhr();
            xhrs.push(xhr);
            return xhr;
        }
    }
    
    this.parseArgs = function(str) {
        var clauses = str.split('&');
        var result = {};
        for (var i in result) {
            delete result[i];
        }
        for (var i = 0; i < clauses.length; i++) {
            var keyValuePair = clauses[i].split('=', 2);
            var key = unescape(keyValuePair[0]);
            var value = unescape(keyValuePair[1]);
            result[key] = value;
        }
        return result;
    }
    
    
    
    
    timeouts = [];
    window.setTimeout = function(arg) {
        timeouts.push(arg);
    }
    setTimeout = window.setTimeout;
}

RemoteRunnerTest.prototype.tearDown = function() {
    Selenium = this.oldSelenium;
    RemoteRunnerOptions = this.oldRemoteRunnerOptions;
    XmlHttp = undefined;
    window.setTimeout = this.oldWindowSetTimeout;
    setTimeout = this.oldWindowSetTimeout;
}

RemoteRunnerTest.prototype.assertEvalNotNull = function(str) {
    this.assertNotNull(str, eval(str));
}
    
RemoteRunnerTest.prototype.assertEvalEquals = function(expected, str) {
    this.assertEquals(str, expected, eval(str));
}

RemoteRunnerTest.prototype.testRemoteRunnerStart = function() {
    runSeleniumTest();
    this.assertEvalNotNull("currentTest");
    this.assertEvalNotNull("currentTest.xmlHttpForCommandsAndResults");
    xhr = currentTest.xmlHttpForCommandsAndResults;
    this.assertEvalEquals("POST", "xhr.method");
    this.assertEvalEquals("postedData=START", "xhr.body");
    url = parseUrl(xhr.url);
    args = this.parseArgs(url.search);
    baseUrl = url;
    baseUrl.search = "";
    baseUrlStr = reassembleLocation(baseUrl);
    this.assertEquals("url", "http://localhost:4444/selenium-server/driver/", baseUrlStr);
    this.assertEvalEquals("123456", "args.sessionId");
    this.assertEvalEquals("true", "args.seleniumStart");
    this.assertEvalEquals("", "args.seleniumWindowName");
    // DGF should we be asserting on localFrameAddress?  It seems like this might be fragile
    // No, we shouldn't...
    //this.assertEvalEquals("top.frames[2].frames[1]", "args.localFrameAddress");
    this.assertEvalEquals("sel_654321", "args.uniqueId");
    this.assertEvalNotNull("args.counterToMakeURsUniqueAndSoStopPageCachingInTheBrowser"); // DGF randomly generated
}

RemoteRunnerTest.prototype.testInvalidCommand = function() {
    this.testRemoteRunnerStart();
    xhr.respond("json={command:\"invalidCommand\",target:\"\",value:\"\"}");
    xhr = currentTest.xmlHttpForCommandsAndResults;
    this.assertEquals("Couldn't get handle to XHR", xhr, currentTest.xmlHttpForCommandsAndResults);
    response = this.parseArgs(xhr.body).postedData;
    this.assertEquals("ERROR: Unknown command: 'invalidCommand'", response);
}

RemoteRunnerTest.prototype.testNormalCommands = function() {
    this.testRemoteRunnerStart();
    xhr.respond("json={command:\"specialTestCommand\",target:\"\",value:\"\"}");
    xhr = currentTest.xmlHttpForCommandsAndResults;
    response = this.parseArgs(xhr.body).postedData;
    this.assertEvalEquals("OK", "response");
    
    xhr.respond("json={command:\"getSpecialTestValue\",target:\"\",value:\"\"}");
    xhr = currentTest.xmlHttpForCommandsAndResults;
    response = this.parseArgs(xhr.body).postedData;
    this.assertEvalEquals("OK,foo", "response");
    
    xhr.respond("json={command:\"isSpecialTestBoolean\",target:\"\",value:\"\"}");
    xhr = currentTest.xmlHttpForCommandsAndResults;
    response = this.parseArgs(xhr.body).postedData;
    this.assertEvalEquals("OK,true", "response");
}

RemoteRunnerTest.prototype.testRetryLast = function() {
    this.testRemoteRunnerStart();
    xhr.respond("json={command:\"retryLast\",target:\"\",value:\"\"}");
    
    xhr = currentTest.xmlHttpForCommandsAndResults;
    url = parseUrl(xhr.url);
    args = this.parseArgs(url.search);
    this.assertEvalEquals("true", "args.retry");
    response = this.parseArgs(xhr.body).postedData;
    this.assertEvalEquals("RETRY", "response");
    xhr.respond("json={command:\"retryLast\",target:\"\",value:\"\"}");

    xhr = currentTest.xmlHttpForCommandsAndResults;
    url = parseUrl(xhr.url);
    args = this.parseArgs(url.search);
    this.assertEvalEquals("true", "args.retry");
    response = this.parseArgs(xhr.body).postedData;
    this.assertEvalEquals("RETRY", "response");
}
