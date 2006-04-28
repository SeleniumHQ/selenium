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

var cmd1 = document.createElement("div");
var cmd2 = document.createElement("div");
var cmd3 = document.createElement("div");
var cmd4 = document.createElement("div");

var postResult = "START";

function runTest() {
    var testAppFrame = document.getElementById('myiframe');
    selenium = Selenium.createForFrame(testAppFrame);

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

    document.getElementById("commandList").appendChild(cmd4);
    document.getElementById("commandList").appendChild(cmd3);
    document.getElementById("commandList").appendChild(cmd2);
    document.getElementById("commandList").appendChild(cmd1);
    
    var doContinue = getQueryVariable("continue");
	if (doContinue != null) postResult = "OK";

    testLoop.start();
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
}

function buildBaseUrl() {
	var lastSlash = window.location.href.lastIndexOf('/');
	var baseUrl = window.location.href.substring(0, lastSlash+1);
	return baseUrl;
}

function buildDriverParams() {
    var params = "";

    var host = getQueryVariable("driverhost");
    var port = getQueryVariable("driverport");
    if (host != undefined && port != undefined) {
        params = params + "&driverhost=" + host + "&driverport=" + port;
    }

    var sessionId = getQueryVariable("sessionId");
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
    xmlHttp = XmlHttp.create();
    try {
    	
    	var url = buildBaseUrl();
        if (postResult == "START") {
        	url = url + "driver/?seleniumStart=true" + buildDriverParams() + preventBrowserCaching();
        } else {
        	url = url + "driver/?" + buildDriverParams() + preventBrowserCaching();
        }
        LOG.debug("XMLHTTPRequesting " + url);
        xmlHttp.open("POST", url, true);
        xmlHttp.onreadystatechange=handleHttpResponse;
        xmlHttp.send(postResult);
    } catch(e) {
       	var s = 'xmlHttp returned:\n'
        for (key in e) {
            s += "\t" + key + " -> " + e[key] + "\n"
        }
        LOG.error(s);
        return null;
    }
    return null;
}

 function handleHttpResponse() {
 	if (xmlHttp.readyState == 4) {
 		if (xmlHttp.status == 200) {
 			var command = extractCommand(xmlHttp);
 			testLoop.currentCommand = command;
 			testLoop.beginNextTest();
 		} else {
 			var s = 'xmlHttp returned: ' + xmlHttp.status + ": " + xmlHttp.statusText;
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
        command = xmlHttp.responseText;
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

