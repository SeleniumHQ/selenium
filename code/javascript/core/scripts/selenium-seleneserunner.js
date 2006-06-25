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

slowMode = false;

var injectedSessionId;
var cmd1 = document.createElement("div");
var cmd2 = document.createElement("div");
var cmd3 = document.createElement("div");
var cmd4 = document.createElement("div");

var postResult = "START";
var pendingMessagesToRC = "";
var debugMode = null;
var relayToRC = null;	// override in injection.html
var relayBotToRC = null;	// override in injection.html
var queryString = null;
var xmlHttpForCommandsAndResults = null;
var restoreSeleniumState = function(){}; // override in injection.html

function runTest() {
    debugMode = getQueryVariable("debugMode");
    if (debugMode=="false") {
    	debugMode = false;
    }
    var testAppFrame = document.getElementById('myiframe');
    if (testAppFrame==null) {
    	// proxy injection mode
    	testAppFrame = window;
        LOG.log = logToRc;
    }
    else
    {
        LOG.logHook = logToRc;
    }

    selenium = Selenium.createForFrame(testAppFrame);
    restoreSeleniumState();
    window.selenium = selenium;

    commandFactory = new CommandHandlerFactory();
    commandFactory.registerAll(selenium);

    testLoop = new TestLoop(commandFactory);

    testLoop.nextCommand = nextCommand;
    testLoop.commandStarted = commandStarted;
    testLoop.commandComplete = commandComplete;
    testLoop.commandError = commandError;
    testLoop.requiresCallBack = true;
    testLoop.testComplete = function() {
    	window.status = "Selenium Tests Complete, for this Test"
    	// Continue checking for new results
    	testLoop.continueTest();
    	postResult = "START";
    };

    if (document.getElementById("commandList") != null) {
    	document.getElementById("commandList").appendChild(cmd4);
        document.getElementById("commandList").appendChild(cmd3);
        document.getElementById("commandList").appendChild(cmd2);
        document.getElementById("commandList").appendChild(cmd1);
    }
    
    var doContinue = getQueryVariable("continue");
	if (doContinue != null) postResult = "OK";

    testLoop.start();
}

function getQueryString() {
	if (queryString != null) return queryString;
	if (browserVersion.isHTA) {
		var args = extractArgs();
		if (args.length < 2) return null;
		queryString = args[1];
		return queryString;
	} else {
		return location.search.substr(1);
	}
}

function extractArgs() {
	var str = SeleniumHTARunner.commandLine;
	if (str == null || str == "") return new Array();
    var matches = str.match(/(?:"([^"]+)"|(?!"([^"]+)")(\S+))/g);
    // We either want non quote stuff ([^"]+) surrounded by quotes
    // or we want to look-ahead, see that the next character isn't
    // a quoted argument, and then grab all the non-space stuff
    // this will return for the line: "foo" bar
    // the results "\"foo\"" and "bar"

    // So, let's unquote the quoted arguments:
    var args = new Array;
    for (var i = 0; i < matches.length; i++) {
        args[i] = matches[i];
        args[i] = args[i].replace(/^"(.*)"$/, "$1");
    }
    return args;
}

function getQueryVariable(variable) {
    var query = getQueryString();
    if (query == null) return null;
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
}

function buildBaseUrl() {
	var baseUrl = getQueryVariable("baseUrl");
        if (baseUrl != null) {
        	return baseUrl;
        }
        var s=window.location.href
        var slashPairOffset=s.indexOf("//") + "//".length
        var pathSlashOffset=s.substring(slashPairOffset).indexOf("/")
        return s.substring(0, slashPairOffset + pathSlashOffset) + "/selenium-server/core/";
}

function buildDriverParams() {
    var params = "";

    var host = getQueryVariable("driverhost");
    var port = getQueryVariable("driverport");
    if (host != undefined && port != undefined) {
        params = params + "&driverhost=" + host + "&driverport=" + port;
    }

    var sessionId = getQueryVariable("sessionId");
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

function nextCommand() {
    var urlParms = "";
    if (postResult == "START") {
    	urlParms += "seleniumStart=true";
    }
    xmlHttpForCommandsAndResults = XmlHttp.create();
    sendToRC(postResult, urlParms, handleHttpResponse, xmlHttpForCommandsAndResults);
}

function sendMessageToRClater(message) {
    pendingMessagesToRC = pendingMessagesToRC + message.replace(/[\n\r]/g, " ") + "\n";
}

function logToRc(message, logLevel) {
    if (debugMode) {
        sendToRC("logLevel=" + logLevel + ":" + message + "\n");
    }
}

function isArray(x) {
    return ((typeof x)=="object") && (x["length"]!=null);
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
        for (var j = 0; j<len; j++)
        {
            s += serializeString(name + "[" + j + "]", x[j]);
        }
    }
    else if (typeof x == "string")
    {
        return serializeString(name, x);
    }
    else
    {
        throw "unrecognized object not encoded: " + name + "(" + x + ")";
    }
    return s;
}

function sendToRC(dataToBePosted, urlParms, callback, xmlHttpObject) {
    if (xmlHttpObject==null) {
 	xmlHttpObject = XmlHttp.create();
    }
    var url = buildBaseUrl() + "driver/?"
    if (urlParms) {
    	url += urlParms;
    }
    url += "&frameAddress=" + makeAddressToMyFrame();
    
    if (callback==null) {
    	callback = function(){};
    }
    url += buildDriverParams() + preventBrowserCaching();
    xmlHttpObject.open("POST", url, true);
    xmlHttpObject.onreadystatechange = callback;
    xmlHttpObject.send(pendingMessagesToRC + dataToBePosted);
        
    return null;
}

 function handleHttpResponse() {
 	if (xmlHttpForCommandsAndResults.readyState == 4) {
 		if (xmlHttpForCommandsAndResults.status == 200) {
                	var command = extractCommand(xmlHttpForCommandsAndResults);
 			testLoop.currentCommand = command;
 			testLoop.beginNextTest();
 		} else {
 			var s = 'xmlHttp returned: ' + xmlHttpForCommandsAndResults.status + ": " + xmlHttpForCommandsAndResults.statusText;
 			LOG.error(s);
 			testLoop.currentCommand = null;
 			setTimeout("testLoop.beginNextTest();", 2000);
 		}
 		
 	}
 }


function extractCommand(xmlHttp) {
    if (slowMode) {
        delay(2000);
    }

    var command;
    try {
        var re = new RegExp("^(.*?)\n(.*)");
        if (re.exec(xmlHttp.responseText)) {
            command = RegExp.$1;
            var rest = RegExp.$2;
            // DOCTODO:
            eval(rest);
        }
        else {
            command = xmlHttp.responseText;
        }
    } catch (e) {
        alert('could not get responseText: ' + e.message);
    }
    if (command.substr(0,'|testComplete'.length)=='|testComplete') {
        return null;
    }

    return createCommandFromRequest(command);
}

function commandStarted(command) {
    commandNode = document.createElement("div");
    innerHTML = command.command + '(';
    if (command.target != null && command.target != "") {
        innerHTML += command.target;
        if (command.value != null && command.value != "") {
            innerHTML += ', ' + command.value;
        }
    }
    innerHTML += ")";
    commandNode.innerHTML = innerHTML;
    commandNode.style.backgroundColor = workingColor;
    if (document.getElementById("commandList") != null) {
    	document.getElementById("commandList").removeChild(cmd1);
        document.getElementById("commandList").removeChild(cmd2);
        document.getElementById("commandList").removeChild(cmd3);
        document.getElementById("commandList").removeChild(cmd4);
        cmd4 = cmd3;
        cmd3 = cmd2;
        cmd2 = cmd1;
        cmd1 = commandNode;
        document.getElementById("commandList").appendChild(cmd4);
        document.getElementById("commandList").appendChild(cmd3);
        document.getElementById("commandList").appendChild(cmd2);
        document.getElementById("commandList").appendChild(cmd1);
    }
}

function commandComplete(result) {
    if (result.failed) {
    	if (postResult == "CONTINUATION") {
    		testLoop.aborted = true;
    	}
        postResult = result.failureMessage;
        commandNode.title = result.failureMessage;
        commandNode.style.backgroundColor = failColor;
    } else if (result.passed) {
        postResult = "OK";
        commandNode.style.backgroundColor = passColor;
    } else {
    	if (result.result == null) {
    		postResult = "OK";
    	} else {
    		postResult = "OK," + result.result;
    	}
        commandNode.style.backgroundColor = doneColor;
    }
}

function commandError(message) {
    postResult = "ERROR: " + message;
    commandNode.style.backgroundColor = errorColor;
    commandNode.title = message;
}

function slowClicked() {
    slowMode = !slowMode;
}

function delay(millis) {
    startMillis = new Date();
    while (true) {
        milli = new Date();
        if (milli-startMillis > millis) {
            break;
        }
    }
}

function getIframeDocument(iframe) {
    if (iframe.contentDocument) {
        return iframe.contentDocument;
    }
    else {
        return iframe.contentWindow.document;
    }
}

// Parses a URI query string into a SeleniumCommand object
function createCommandFromRequest(commandRequest) {
	//decodeURIComponent doesn't strip plus signs
	var processed = commandRequest.replace(/\+/g, "%20");
	// strip trailing spaces
	var processed = processed.replace(/\s+$/, "");
    var vars = processed.split("&");
    var cmdArgs = new Object();
    for (var i=0;i<vars.length;i++) {
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

// construct a JavaScript expression which leads to my frame (i.e., the frame containing the window
// in which this code is operating)
function makeAddressToMyFrame(w, frameNavigationalJSexpression)
{
    if (w==null)
    {
        w=top;
        frameNavigationalJSexpression = "top";
    }
         
    if (w==window)
    {
        return frameNavigationalJSexpression;
    }
    for (var j = 0; j < w.frames.length; j++)
    {
        var t = makeAddressToMyFrame(w.frames[j], frameNavigationalJSexpression + ".frames[" + j + "]");
        if (t!=null)
        {
            return t;
        }
    }
    return null;
}
