/*
* Copyright 2005 ThoughtWorks, Inc
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
*
*/

passColor = "#cfffcf";
failColor = "#ffcfcf";
errorColor = "#ffffff";
workingColor = "#DEE7EC";
doneColor = "#FFFFCC";

var injectedSessionId;

var postResult = "START";
var debugMode = false;
var relayToRC = null;
var proxyInjectionMode = false;
var uniqueId = 'sel_' + Math.round(100000 * Math.random());
var seleniumSequenceNumber = 0;
var cmd8 = "";
var cmd7 = "";
var cmd6 = "";
var cmd5 = "";
var cmd4 = "";
var cmd3 = "";
var cmd2 = "";
var cmd1 = "";
var lastCmd = "";
var lastCmdTime = new Date();

var RemoteRunnerOptions = classCreate();
objectExtend(RemoteRunnerOptions.prototype, URLConfiguration.prototype);
objectExtend(RemoteRunnerOptions.prototype, {
    initialize: function() {
        this._acquireQueryString();
    },
    isDebugMode: function() {
        return this._isQueryParameterTrue("debugMode");
    },

    getContinue: function() {
        return this._getQueryParameter("continue");
    },

    getDriverUrl: function() {
        return this._getQueryParameter("driverUrl");
    },

    // requires per-session extension Javascript as soon as this Selenium
    // instance becomes aware of the session identifier
    getSessionId: function() {
        var sessionId = this._getQueryParameter("sessionId");
        requireExtensionJs(sessionId);
        return sessionId;
    },

    _acquireQueryString: function () {
        if (this.queryString) return;
        if (browserVersion.isHTA) {
            var args = this._extractArgs();
            if (args.length < 2) return null;
            this.queryString = args[1];
        } else if (proxyInjectionMode) {
            this.queryString = window.location.search.substr(1);
        } else {
            this.queryString = top.location.search.substr(1);
        }
    }

});
var runOptions;

function runSeleniumTest() {
    runOptions = new RemoteRunnerOptions();
    var testAppWindow;

    if (runOptions.isMultiWindowMode()) {
        testAppWindow = openSeparateApplicationWindow('Blank.html', true);
    } else if (sel$('selenium_myiframe') != null) {
        var myiframe = sel$('selenium_myiframe');
        if (myiframe) {
            testAppWindow = myiframe.contentWindow;
        }
    }
    else {
        proxyInjectionMode = true;
        testAppWindow = window;
    }
    selenium = Selenium.createForWindow(testAppWindow, proxyInjectionMode);
    if (runOptions.getBaseUrl()) {
        selenium.browserbot.baseUrl = runOptions.getBaseUrl();
    }
    if (!debugMode) {
        debugMode = runOptions.isDebugMode();
    }
    if (proxyInjectionMode) {
        LOG.logHook = logToRc;
        selenium.browserbot._modifyWindow(testAppWindow);
    }
    else if (debugMode) {
        LOG.logHook = logToRc;
    }
    window.selenium = selenium;

    commandFactory = new CommandHandlerFactory();
    commandFactory.registerAll(selenium);

    currentTest = new RemoteRunner(commandFactory);

    var doContinue = runOptions.getContinue();
    if (doContinue != null) postResult = "OK";

    currentTest.start();
}

function buildDriverUrl() {
    var driverUrl = runOptions.getDriverUrl();
    if (driverUrl != null) {
        return driverUrl;
    }
    var s = window.location.href
    var slashPairOffset = s.indexOf("//") + "//".length
    var pathSlashOffset = s.substring(slashPairOffset).indexOf("/")
    return s.substring(0, slashPairOffset + pathSlashOffset) + "/selenium-server/driver/";
    //return "http://localhost" + uniqueId + "/selenium-server/driver/";
}

function logToRc(logLevel, message) {
    if (debugMode) {
        if (logLevel == null) {
            logLevel = "debug";
        }
        sendToRCAndForget("logLevel=" + logLevel + ":" + message.replace(/[\n\r\015]/g, " ") + "\n", "logging=true");
    }
}

function serializeString(name, s) {
    return name + "=unescape(\"" + escape(s) + "\");";
}

function serializeObject(name, x)
{
    var s = '';

    if (isArray(x))
    {
        s = name + "=new Array(); ";
        var len = x["length"];
        for (var j = 0; j < len; j++)
        {
            s += serializeString(name + "[" + j + "]", x[j]);
        }
    }
    else if (typeof x == "string")
    {
        s = serializeString(name, x);
    }
    else
    {
        throw "unrecognized object not encoded: " + name + "(" + x + ")";
    }
    return s;
}

function relayBotToRC(s) {
}

// seems like no one uses this, but in fact it is called using eval from server-side PI mode code; however,
// because multiple names can map to the same popup, assigning a single name confuses matters sometimes;
// thus, I'm disabling this for now.  -Nelson 10/21/06
function setSeleniumWindowName(seleniumWindowName) {
//selenium.browserbot.getCurrentWindow()['seleniumWindowName'] = seleniumWindowName;
}

RemoteRunner = classCreate();
objectExtend(RemoteRunner.prototype, new TestLoop());
objectExtend(RemoteRunner.prototype, {
    initialize : function(commandFactory) {
        this.commandFactory = commandFactory;
        this.requiresCallBack = true;
        this.commandNode = null;
        this.xmlHttpForCommandsAndResults = null;
    },

    nextCommand : function() {
        var urlParms = "";
        if (postResult == "START") {
            urlParms += "seleniumStart=true";
        }
        this.xmlHttpForCommandsAndResults = XmlHttp.create();
        sendToRC(postResult, urlParms, fnBind(this._HandleHttpResponse, this), this.xmlHttpForCommandsAndResults);
    },

    commandStarted : function(command) {
        this.commandNode = document.createElement("div");
        var cmdText = command.command + '(';
        if (command.target != null && command.target != "") {
            cmdText += command.target;
            if (command.value != null && command.value != "") {
                cmdText += ', ' + command.value;
            }
        }
        if (cmdText.length > 70) {
            cmdText = cmdText.substring(0, 70) + "...\n";
        } else {
            cmdText += ")\n";
        }

        if (cmdText == lastCmd) {
	        var rightNow = new Date();
	        var msSinceStart = rightNow.getTime() - lastCmdTime.getTime();
	        var sinceStart = msSinceStart + "ms";
	        if (msSinceStart > 1000) {
		        sinceStart = Math.round(msSinceStart / 1000) + "s";
		    }
            cmd1 = "Same command (" + sinceStart + "): " + lastCmd;
        } else {
	        lastCmdTime = new Date();
            cmd8 = cmd7;
            cmd7 = cmd6;
            cmd6 = cmd5;
            cmd5 = cmd4;
            cmd4 = cmd3;
            cmd3 = cmd2;
            cmd2 = cmd1;
            cmd1 = cmdText;
        }
        lastCmd = cmdText;
        
        if (! proxyInjectionMode) {
            var commandList = document.commands.commandList;
            commandList.value = cmd8 + cmd7 + cmd6 + cmd5 + cmd4 + cmd3 + cmd2 + cmd1;
            commandList.scrollTop = commandList.scrollHeight;
        }
    },

    commandComplete : function(result) {

        if (result.failed) {
            if (postResult == "CONTINUATION") {
                currentTest.aborted = true;
            }
            postResult = result.failureMessage;
            this.commandNode.title = result.failureMessage;
            this.commandNode.style.backgroundColor = failColor;
        } else if (result.passed) {
            postResult = "OK";
            this.commandNode.style.backgroundColor = passColor;
        } else {
            if (result.result == null) {
                postResult = "OK";
            } else {
                var actualResult = result.result;
                actualResult = selArrayToString(actualResult);
                postResult = "OK," + actualResult;
            }
            this.commandNode.style.backgroundColor = doneColor;
        }
    },

    commandError : function(message) {
        postResult = "ERROR: " + message;
        this.commandNode.style.backgroundColor = errorColor;
        this.commandNode.titcle = message;
    },

    testComplete : function() {
        window.status = "Selenium Tests Complete, for this Test"
        // Continue checking for new results
        this.continueTest();
        postResult = "START";
    },

    _HandleHttpResponse : function() {
        // When request is completed
        if (this.xmlHttpForCommandsAndResults.readyState == 4) {
            // OK
            if (this.xmlHttpForCommandsAndResults.status == 200) {
            	if (this.xmlHttpForCommandsAndResults.responseText=="") {
                    LOG.error("saw blank string xmlHttpForCommandsAndResults.responseText");
                    return;
                }
                var command = this._extractCommand(this.xmlHttpForCommandsAndResults);
                if (command.command == 'retryLast') {
                    setTimeout(fnBind(function() {
                        sendToRC("RETRY", "retry=true", fnBind(this._HandleHttpResponse, this), this.xmlHttpForCommandsAndResults, true);
                    }, this), 1000);
                } else {
                    this.currentCommand = command;
                    this.continueTestAtCurrentCommand();
                }
            }
            // Not OK 
            else {
                var s = 'xmlHttp returned: ' + this.xmlHttpForCommandsAndResults.status + ": " + this.xmlHttpForCommandsAndResults.statusText;
                LOG.error(s);
                this.currentCommand = null;
                setTimeout(fnBind(this.continueTestAtCurrentCommand, this), 2000);
            }

        }
    },

    _extractCommand : function(xmlHttp) {
        var command, text, json;
        text = command = xmlHttp.responseText;
        if (/^json=/.test(text)) {
            eval(text);
            if (json.rest) {
                eval(json.rest);
            }
            return json;
        }
        try {
            var re = new RegExp("^(.*?)\n((.|[\r\n])*)");
            if (re.exec(xmlHttp.responseText)) {
                command = RegExp.$1;
                var rest = RegExp.$2;
                rest = rest.trim();
                if (rest) {
                    eval(rest);
                }
            }
            else {
                command = xmlHttp.responseText;
            }
        } catch (e) {
            alert('could not get responseText: ' + e.message);
        }
        if (command.substr(0, '|testComplete'.length) == '|testComplete') {
            return null;
        }

        return this._createCommandFromRequest(command);
    },


    _delay : function(millis) {
        var startMillis = new Date();
        while (true) {
            milli = new Date();
            if (milli - startMillis > millis) {
                break;
            }
        }
    },

// Parses a URI query string into a SeleniumCommand object
    _createCommandFromRequest : function(commandRequest) {
        //decodeURIComponent doesn't strip plus signs
        var processed = commandRequest.replace(/\+/g, "%20");
        // strip trailing spaces
        var processed = processed.replace(/\s+$/, "");
        var vars = processed.split("&");
        var cmdArgs = new Object();
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            cmdArgs[pair[0]] = pair[1];
        }
        var cmd = cmdArgs['cmd'];
        var arg1 = cmdArgs['1'];
        if (null == arg1) arg1 = "";
        arg1 = decodeURIComponent(arg1);
        var arg2 = cmdArgs['2'];
        if (null == arg2) arg2 = "";
        arg2 = decodeURIComponent(arg2);
        if (cmd == null) {
            throw new Error("Bad command request: " + commandRequest);
        }
        return new SeleniumCommand(cmd, arg1, arg2);
    }

})


function sendToRC(dataToBePosted, urlParms, callback, xmlHttpObject, async) {
    if (async == null) {
        async = true;
    }
    if (xmlHttpObject == null) {
        xmlHttpObject = XmlHttp.create();
    }
    var url = buildDriverUrl() + "?"
    if (urlParms) {
        url += urlParms;
    }
    url = addUrlParams(url);
    url += "&sequenceNumber=" + seleniumSequenceNumber++;
    
    var postedData = "postedData=" + encodeURIComponent(dataToBePosted);

    //xmlHttpObject.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttpObject.open("POST", url, async);
    if (callback) xmlHttpObject.onreadystatechange = callback;
    xmlHttpObject.send(postedData);
    return null;
}

function addUrlParams(url) {
    return url + "&localFrameAddress=" + (proxyInjectionMode ? makeAddressToAUTFrame() : "top")
    + getSeleniumWindowNameURLparameters()
    + "&uniqueId=" + uniqueId
    + buildDriverParams() + preventBrowserCaching()
}

function sendToRCAndForget(dataToBePosted, urlParams) {
    var url;
    if (!(browserVersion.isChrome || browserVersion.isHTA)) { 
        // DGF we're behind a proxy, so we can send our logging message to literally any host, to avoid 2-connection limit
        var protocol = "http:";
        if (window.location.protocol == "https:") {
            // DGF if we're in HTTPS, use another HTTPS url to avoid security warning
            protocol = "https:";
        }
        // we don't choose a super large random value, but rather 1 - 16, because this matches with the pre-computed
        // tunnels waiting on the Selenium Server side. This gives us higher throughput than the two-connection-per-host
        // limitation, but doesn't require we generate an extremely large ammount of fake SSL certs either.
        url = protocol + "//" + Math.floor(Math.random()* 16 + 1) + ".selenium.doesnotexist/selenium-server/driver/?" + urlParams;
    } else {
        url = buildDriverUrl() + "?" + urlParams;
    }
    url = addUrlParams(url);
    
    var method = "GET";
    if (method == "POST") {
        // DGF submit a request using an iframe; we can't see the response, but we don't need to
        // TODO not using this mechanism because it screws up back-button
        var loggingForm = document.createElement("form");
        loggingForm.method = "POST";
        loggingForm.action = url;
        loggingForm.target = "seleniumLoggingFrame";
        var postedDataInput = document.createElement("input");
        postedDataInput.type = "hidden";
        postedDataInput.name = "postedData";
        postedDataInput.value = dataToBePosted;
        loggingForm.appendChild(postedDataInput);
        document.body.appendChild(loggingForm);
        loggingForm.submit();
        document.body.removeChild(loggingForm);
    } else {
        var postedData = "&postedData=" + encodeURIComponent(dataToBePosted);
        var scriptTag = document.createElement("script");
        scriptTag.src = url + postedData;
        document.body.appendChild(scriptTag);
        document.body.removeChild(scriptTag);
    }
}

function buildDriverParams() {
    var params = "";

    var sessionId = runOptions.getSessionId();
    if (sessionId == undefined) {
        sessionId = injectedSessionId;
    }
    if (sessionId != undefined) {
        params = params + "&sessionId=" + sessionId;
    }
    return params;
}

function preventBrowserCaching() {
    var t = (new Date()).getTime();
    return "&counterToMakeURsUniqueAndSoStopPageCachingInTheBrowser=" + t;
}

//
// Return URL parameters pertaining to the name(s?) of the current window
//
// In selenium, the main (i.e., first) window's name is a blank string.
//
// Additional pop-ups are associated with either 1.) the name given by the 2nd parameter to window.open, or 2.) the name of a
// property on the opening window which points at the window.
//
// An example of #2: if window X contains JavaScript as follows:
//
// 	var windowABC = window.open(...)
//
// Note that the example JavaScript above is equivalent to
//
// 	window["windowABC"] = window.open(...)
//
function getSeleniumWindowNameURLparameters() {
    var w = (proxyInjectionMode ? selenium.browserbot.getCurrentWindow() : window).top;
    var s = "&seleniumWindowName=";
    if (w.opener == null) {
        return s;
    }
    if (w["seleniumWindowName"] == null) {
        if (w.name) {
            w["seleniumWindowName"] = w.name;
        } else {
    	    w["seleniumWindowName"] = 'generatedSeleniumWindowName_' + Math.round(100000 * Math.random());
    	}
    }
    s += w["seleniumWindowName"];
    var windowOpener = w.opener;
    for (key in windowOpener) {
        var val = null;
        try {
    	    val = windowOpener[key];
        }
        catch(e) {
        }
        if (val==w) {
	    s += "&jsWindowNameVar=" + key;			// found a js variable in the opener referring to this window
        }
    }
    return s;
}

// construct a JavaScript expression which leads to my frame (i.e., the frame containing the window
// in which this code is operating)
function makeAddressToAUTFrame(w, frameNavigationalJSexpression)
{
    if (w == null)
    {
        w = top;
        frameNavigationalJSexpression = "top";
    }

    if (w == selenium.browserbot.getCurrentWindow())
    {
        return frameNavigationalJSexpression;
    }
    for (var j = 0; j < w.frames.length; j++)
    {
        var t = makeAddressToAUTFrame(w.frames[j], frameNavigationalJSexpression + ".frames[" + j + "]");
        if (t != null)
        {
            return t;
        }
    }
    return null;
}

Selenium.prototype.doSetContext = function(context) {
    /**
   * Writes a message to the status bar and adds a note to the browser-side
   * log.
   *
   * @param context
   *            the message to be sent to the browser
   */
    //set the current test title
    var ctx = document.getElementById("context");
    if (ctx != null) {
        ctx.innerHTML = context;
    }
};

/**
 * Adds a script tag referencing a specially-named user extensions "file". The
 * resource handler for this special file (which won't actually exist) will use
 * the session ID embedded in its name to retrieve per-session specified user
 * extension javascript.
 *
 * @param sessionId
 */
function requireExtensionJs(sessionId) {
    var src = 'scripts/user-extensions.js[' + sessionId + ']';
    if (document.getElementById(src) == null) {
        var scriptTag = document.createElement('script');
        scriptTag.language = 'JavaScript';
        scriptTag.type = 'text/javascript';
        scriptTag.src = src;
        scriptTag.id = src;
        var headTag = document.getElementsByTagName('head')[0];
        headTag.appendChild(scriptTag);
    }
}

Selenium.prototype.doAttachFile = function(fieldLocator,fileLocator) {
   /**
   * Sets a file input (upload) field to the file listed in fileLocator
   *
   *  @param fieldLocator an <a href="#locators">element locator</a>
   *  @param fileLocator a URL pointing to the specified file. Before the file
   *  can be set in the input field (fieldLocator), Selenium RC may need to transfer the file  
   *  to the local machine before attaching the file in a web page form. This is common in selenium
   *  grid configurations where the RC server driving the browser is not the same
   *  machine that started the test.
   *
   *  Supported Browsers: Firefox ("*chrome") only.
   *   
   */
   // This doesn't really do anything on the JS side; we let the Selenium Server take care of this for us! 
};

Selenium.prototype.doCaptureScreenshot = function(filename) {
    /**
    * Captures a PNG screenshot to the specified file.
    *
    * @param filename the absolute path to the file to be written, e.g. "c:\blah\screenshot.png"
    */
    // This doesn't really do anything on the JS side; we let the Selenium Server take care of this for us!
};

Selenium.prototype.doCaptureScreenshotToString = function() {
    /**
    * Capture a PNG screenshot.  It then returns the file as a base 64 encoded string. 
    * 
    * @return string The base 64 encoded string of the screen shot (PNG file)
    */
    // This doesn't really do anything on the JS side; we let the Selenium Server take care of this for us!
};

Selenium.prototype.doCaptureEntirePageScreenshotToString = function(kwargs) {
    /**
    * Downloads a screenshot of the browser current window canvas to a 
    * based 64 encoded PNG file. The <em>entire</em> windows canvas is captured,
    * including parts rendered outside of the current view port.
    *
	* Currently this only works in Mozilla and when running in chrome mode. 
    * 
    * @param kwargs  A kwargs string that modifies the way the screenshot is captured. Example: "background=#CCFFDD". This may be useful to set for capturing screenshots of less-than-ideal layouts, for example where absolute positioning causes the calculation of the canvas dimension to fail and a black background is exposed  (possibly obscuring black text).
    *
    * @return string The base 64 encoded string of the page screenshot (PNG file)
    */
    // This doesn't really do anything on the JS side; we let the Selenium Server take care of this for us!
};

Selenium.prototype.doShutDownSeleniumServer = function(keycode) {
    /**
    * Kills the running Selenium Server and all browser sessions.  After you run this command, you will no longer be able to send
    * commands to the server; you can't remotely start the server once it has been stopped.  Normally
    * you should prefer to run the "stop" command, which terminates the current browser session, rather than 
    * shutting down the entire server.
    *
    */
    // This doesn't really do anything on the JS side; we let the Selenium Server take care of this for us!
};

Selenium.prototype.doRetrieveLastRemoteControlLogs = function() {
    /**
    * Retrieve the last messages logged on a specific remote control. Useful for error reports, especially
    * when running multiple remote controls in a distributed environment. The maximum number of log messages
    * that can be retrieve is configured on remote control startup.
    *
    * @return string The last N log messages as a multi-line string.
    */
    // This doesn't really do anything on the JS side; we let the Selenium Server take care of this for us!
};

Selenium.prototype.doKeyDownNative = function(keycode) {
    /**
    * Simulates a user pressing a key (without releasing it yet) by sending a native operating system keystroke.
    * This function uses the java.awt.Robot class to send a keystroke; this more accurately simulates typing
    * a key on the keyboard.  It does not honor settings from the shiftKeyDown, controlKeyDown, altKeyDown and
    * metaKeyDown commands, and does not target any particular HTML element.  To send a keystroke to a particular
    * element, focus on the element first before running this command.
    *
    * @param keycode an integer keycode number corresponding to a java.awt.event.KeyEvent; note that Java keycodes are NOT the same thing as JavaScript keycodes!
    */
    // This doesn't really do anything on the JS side; we let the Selenium Server take care of this for us!
};

Selenium.prototype.doKeyUpNative = function(keycode) {
    /**
    * Simulates a user releasing a key by sending a native operating system keystroke.
    * This function uses the java.awt.Robot class to send a keystroke; this more accurately simulates typing
    * a key on the keyboard.  It does not honor settings from the shiftKeyDown, controlKeyDown, altKeyDown and
    * metaKeyDown commands, and does not target any particular HTML element.  To send a keystroke to a particular
    * element, focus on the element first before running this command.
    *
    * @param keycode an integer keycode number corresponding to a java.awt.event.KeyEvent; note that Java keycodes are NOT the same thing as JavaScript keycodes!
    */
    // This doesn't really do anything on the JS side; we let the Selenium Server take care of this for us!
};

Selenium.prototype.doKeyPressNative = function(keycode) {
    /**
    * Simulates a user pressing and releasing a key by sending a native operating system keystroke.
    * This function uses the java.awt.Robot class to send a keystroke; this more accurately simulates typing
    * a key on the keyboard.  It does not honor settings from the shiftKeyDown, controlKeyDown, altKeyDown and
    * metaKeyDown commands, and does not target any particular HTML element.  To send a keystroke to a particular
    * element, focus on the element first before running this command.
    *
    * @param keycode an integer keycode number corresponding to a java.awt.event.KeyEvent; note that Java keycodes are NOT the same thing as JavaScript keycodes!
    */
    // This doesn't really do anything on the JS side; we let the Selenium Server take care of this for us!
};

