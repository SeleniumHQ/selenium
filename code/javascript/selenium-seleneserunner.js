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
    testLoop.testComplete = function() {window.status = "Selenium Tests Complete, for this Test"};

    document.getElementById("commandList").appendChild(cmd4);
    document.getElementById("commandList").appendChild(cmd3);
    document.getElementById("commandList").appendChild(cmd2);
    document.getElementById("commandList").appendChild(cmd1);

    testLoop.start();
}

function nextCommand() {

    var xmlHttp = XmlHttp.create();
    
    try {
        alert("postResult == " + postResult);
        if (postResult == "START") {
            xmlHttp.open("GET", "driver?seleniumStart=true", false);
        } else {
            xmlHttp.open("GET", "driver?commandResult=" + postResult, false);
        }
        xmlHttp.send(null);
    } catch(e) {
        return null;
    }
    return extractCommand(xmlHttp);
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

    return createCommandFromWikiRow(command);
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
        postResult = result.failureMessage;
        commandNode.title = result.failureMessage;
        commandNode.style.backgroundColor = failColor;
    } else if (result.passed) {
        postResult = "PASSED";
        commandNode.style.backgroundColor = passColor;
    } else {
        postResult = result.result;
        commandNode.style.backgroundColor = doneColor;
    }
}

function commandError(message) {
    postResult = "ERROR";
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

// Parses a Wiki table row into a Javascript expression
function createCommandFromWikiRow(wikiRow) {
    var tokens;
    if(tokens = wikiRow.trim().match(/^\|([^\|]*)\|([^\|]*)\|([^\|]*)\|$/m)) {
        var functionName = tokens[1].trim();
        var arg1 = tokens[2].trim();
        var arg2 = tokens[3].trim();
        return new SeleniumCommand(functionName, arg1, arg2);
    } else {
       throw new Error("Bad wiki row format:" + wikiRow);
    }
}
