/*
 * Copyright 2004 ThoughtWorks, Inc
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
workingColor = "#DEE7EC";

// The current row in the list of commands (test script)
currentCommandRow = 0;
inputTableRows = null;

// The current row in the list of tests (test suite)
currentTestRow = 0;

// Whether or not the jsFT should run all tests in the suite
runAllTests = false;

// Whether or not the current test has any errors;
testFailed = false;
suiteFailed = false;

// Test Suite name got from query string
testSuiteName = "";

// Holds variables that are stored in a script
storedVars = new Object();

// Holds the handlers for each command.
commandHandlers = null;

// The number of tests run
numTestPasses = 0;

// The number of tests that have failed
numTestFailures = 0;

// The number of commands which have passed
numCommandPasses = 0;

// The number of commands which have failed
numCommandFailures = 0;

// The number of commands which have caused errors (element not found)
numCommandErrors = 0;

// The time that the test was started.
startTime = null;

// The current time.
currentTime = null;

// An simple enum for failureType
ERROR = 0;
FAILURE = 1;

runInterval = 0;

function setRunInterval() {
    runInterval = this.value;
}

function continueCurrentTest() {
    testLoop.finishCommandExecution()
}

function getSuiteFrame() {
    return document.getElementById('testSuiteFrame');
}

function getTestFrame(){
    return document.getElementById('testFrame');
}

function loadAndRunIfAuto() {
    loadSuiteFrame();
}

function loadSuiteFrame() {
    var testAppFrame = document.getElementById('myiframe');
    browserbot = new BrowserBot(testAppFrame);
    selenium = new Selenium(browserbot);
    registerCommandHandlers()

    document.getElementById("modeRun").onclick = setRunInterval;
    document.getElementById('modeWalk').onclick = setRunInterval;
    document.getElementById('modeStep').onclick = setRunInterval;
    document.getElementById('continueTest').onclick = continueCurrentTest;

    testSuiteName = getQueryStringTestName();

    if( testSuiteName != "" ) {
        addLoadListener(getSuiteFrame(), loadTestFrame);
        getSuiteFrame().src = testSuiteName;
    } else {
        loadTestFrame();
    }

    //testAppFrame.src = "http://selenium.thoughtworks.com";
}

function loadTestFrame() {
    removeLoadListener(getSuiteFrame(), loadTestFrame);
    suiteTable = getSuiteFrame().contentWindow.document.getElementsByTagName("table")[0];

    // Add an onclick function to each link in the suite table
    for(rowNum = 1;rowNum < suiteTable.rows.length; rowNum++) {
        addOnclick(suiteTable, rowNum);
    }

    if (isAutomatedRun())
        startTestSuite();
    else {
        testLink = suiteTable.rows[currentTestRow+1].cells[0].getElementsByTagName("a")[0];
        getTestFrame().src = testLink.href;
    }
}

// Adds an onclick function to the link in the given row in suite table.
// This function checks whether the test has already been run and the data is
// stored. If the data is stored, it sets the test frame to be the stored data.
// Otherwise, it loads the fresh page.
function addOnclick(suiteTable, rowNum) {
    aLink = suiteTable.rows[rowNum].cells[0].getElementsByTagName("a")[0];
    aLink.onclick = function(eventObj) {
        srcObj = null;

        // For mozilla-like browsers
        if(eventObj)
            srcObj = eventObj.target;

        // For IE-like browsers
        else if (getSuiteFrame().contentWindow.event)
            srcObj = getSuiteFrame().contentWindow.event.srcElement;

        // The target row
        row = srcObj.parentNode.parentNode.rowIndex;

        // If the row has a stored results table, use that
        if(suiteTable.rows[row].cells[1]) {
            getTestFrame().contentWindow.document.body.innerHTML = getText(suiteTable.rows[row].cells[1]);
        }
        // Otherwise, just open up the fresh page.
        else {
            getTestFrame().src = suiteTable.rows[row].cells[0].getElementsByTagName("a")[0].href;
        }

        return false;
    };
}

function getQueryStringTestName() {
    testName = "";
    myVars = location.search.substr(1).split('&');
    for (var i =0;i < myVars.length; i++) {
        nameVal = myVars[i].split('=')
        if( nameVal[0] == "test" ) {
            testName="/" + nameVal[1];
        }
    }
    return testName;
}

function isAutomatedRun() {
    myVars = location.search.substr(1).split('&');
    for (var i =0;i < myVars.length; i++) {
        nameVal = myVars[i].split('=')
        if( nameVal[0] == "auto" && nameVal[1].toLowerCase() == "true" )
            return true;
    }

    return false;
}

function resetMetrics() {
    numTestPasses = 0;
    numTestFailures = 0;
    numCommandPasses = 0;
    numCommandFailures = 0;
    numCommandErrors = 0;
    startTime = new Date().getTime();
}

function runSingleTest() {
    runAllTests = false;
    resetMetrics();
    startTest();
}

function startTest() {
    removeLoadListener(getTestFrame(), startTest);
    getTestFrame().contentWindow.scrollTo(0,0);
    inputTable = (getTestFrame().contentWindow.document.getElementsByTagName("table"))[0];
    inputTableRows = inputTable.rows;
    currentCommandRow = 0;
    testFailed = false;
    storedVars = new Object();

    clearRowColours();

    testLoop = initialiseTestLoop();
    testLoop.start();
}

function clearRowColours() {
    for (var i = 0; i <= inputTableRows.length - 1; i++) {
        inputTableRows[i].bgColor = "white";
    }
}

function startTestSuite() {
    resetMetrics();
    currentTestRow = 0;
    runAllTests = true;
    suiteFailed = false;

    runNextTest();
}

function runNextTest() {
    if (!runAllTests)
        return;

    // Scroll the suite frame down by 25 pixels once we get past the first cell.
    if(currentTestRow >= 1)
        getSuiteFrame().contentWindow.scrollBy(0,25);

    suiteTable = (getSuiteFrame().contentWindow.document.getElementsByTagName("table"))[0];

    // Do not change the row color of the first row
    if(currentTestRow > 0) {
        // Make the previous row green or red depending if the test passed or failed
        if(testFailed)
            setCellColor(suiteTable.rows, currentTestRow, 0, failColor);
        else
            setCellColor(suiteTable.rows, currentTestRow, 0, passColor);

        // Set the results from the previous test run
        setResultsData(suiteTable, currentTestRow);
    }

    currentTestRow++;

    // If we are done with all of the tests, set the title bar as pass or fail
    if(currentTestRow >= suiteTable.rows.length) {
        if(suiteFailed)
            setCellColor(suiteTable.rows, 0, 0, failColor);
        else
            setCellColor(suiteTable.rows, 0, 0, passColor);

        // If this is an automated run (i.e., build script), then submit
        // the test results by posting to a form
        if (isAutomatedRun())
            postTestResults(suiteFailed, suiteTable);
    }

    else {
        // Make the current row blue
        setCellColor(suiteTable.rows, currentTestRow, 0, workingColor);

        testLink = suiteTable.rows[currentTestRow].cells[0].getElementsByTagName("a")[0];

        addLoadListener(getTestFrame(), startTest);
        getTestFrame().src = testLink.href;
    }
}

function setCellColor(tableRows, row, col, colorStr) {
    tableRows[row].cells[col].bgColor = colorStr;
}

// Sets the results from a test into a hidden column on the suite table.  So,
// for each tests, the second column is set to the HTML from the test table.
function setResultsData(suiteTable, row) {
    // Create a text node of the test table
    tableContents = suiteTable.ownerDocument.createTextNode(getTestFrame().contentWindow.document.body.innerHTML);

    new_column = suiteTable.ownerDocument.createElement("td");
    new_column.appendChild(tableContents);

    // Set the column to be invisible
    new_column.style.cssText = "display: none;";

    // Add the invisible column
    suiteTable.rows[row].appendChild(new_column);
}

// Post the results to /postResults.  The parameters are:
//      result:         passed/failed depending on whether the suite passed or failed
//      totalTime:      the total running time in seconds for the suite.
//
//      numTestPasses:  the total number of tests which passed.
//      numTestFailures: the total number of tests which failed.
//
//      numCommandPasses: the total number of commands which passed.
//      numCommandFailures: the total number of commands which failed.
//      numCommandErrors: the total number of commands which errored.
//
//      suite:      the suite table, including the hidden column of test results
//      testTable.1 to testTable.N: the individual test tables
function postTestResults(suiteFailed, suiteTable) {
    form = document.createElement("form");
    form.id = "resultsForm";
    form.action = "/postResults"
    form.method="post";
    form.enctype="multipart/form-data"

    resultInput = createInputField("result", suiteFailed == true ? "failed" : "passed");
    form.appendChild(resultInput);

    timeInput = createInputField("totalTime", Math.floor((currentTime - startTime) / 1000));
    form.appendChild(timeInput);

    testPassesInput = createInputField("numTestPasses", numTestPasses);
    form.appendChild(testPassesInput);

    testFailuresInput = createInputField("numTestFailures", numTestFailures);
    form.appendChild(testFailuresInput);

    commandPassesInput = createInputField("numCommandPasses", numCommandPasses);
    form.appendChild(commandPassesInput);

    commandFailuresInput = createInputField("numCommandFailures", numCommandFailures);
    form.appendChild(commandFailuresInput);

    commandErrorsInput = createInputField("numCommandErrors", numCommandErrors);
    form.appendChild(commandErrorsInput);

    suiteInput = createInputField("suite", escape(suiteTable.parentNode.innerHTML));
    form.appendChild(suiteInput);

    // Create an input for each test table.  The inputs are named testTable.1, testTable.2, etc.
    for (rowNum = 1;rowNum < suiteTable.rows.length;rowNum++) {
        // If there is a second column, then add a new input
        if (suiteTable.rows[rowNum].cells.length > 1) {
            testInput = createInputField("testTable." + rowNum, escape(getText(suiteTable.rows[rowNum].cells[1])));
            form.appendChild(testInput);
        }
    }

    document.body.appendChild(form);

    form.submit();
}

function createInputField(name, value) {
    input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;

    return input;
}

function printMetrics() {
    setText(document.getElementById("commandPasses"), numCommandPasses);
    setText(document.getElementById("commandFailures"), numCommandFailures);
    setText(document.getElementById("commandErrors"), numCommandErrors);
    setText(document.getElementById("testRuns"), numTestPasses);
    setText(document.getElementById("testFailures"), numTestFailures);

    currentTime = new Date().getTime();

    timeDiff = currentTime - startTime;
    totalSecs = Math.floor(timeDiff / 1000);

    minutes = Math.floor(totalSecs / 60);
    seconds = totalSecs % 60;

    setText(document.getElementById("elapsedTime"), pad(minutes)+":"+pad(seconds));
}

// Puts a leading 0 on num if it is less than 10
function pad (num) {
    return (num > 9) ? num : "0" + num;
}

// Search through str and replace all variable references ${varName} with their
// value in storedVars.
function replaceVariables(str) {

     //handle the case of ${userid}.toUpper
     pattern = /\$\{(\w+)\}\.(.+)/

     var variableIndex = str;
     var variableFunction='';

     if(pattern.test(str)) {
         pieces = str.split('.');

         variableIndex = pieces[0];
         variableFunction = pieces[1];
    }


    regex = /\$\{(\w+)\}/g;

    var variableValue = variableIndex.replace(regex, function(match, word) {
                                return storedVars[word];
                              });

    if( variableFunction == '')
        return variableValue;
    else
    {
        return eval("variableValue."+ eval("variableFunction") + "()" )
    }
}
    // Register all of the built-in command handlers with the CommandHandlerFactory.
// TODO work out an easy way for people to register handlers without modifying the Selenium sources.
function registerCommandHandlers() {
    commandFactory = new CommandHandlerFactory();
    commandFactory.registerAll(selenium);

    // These actions are overridden for fitrunner, as they still involve some FitRunner smarts,
    // because of the wait/nowait behaviour modification. We need a generic solution to this.
    commandFactory.registerAction("click", selenium.doClickWithOptionalWait);

}

function initialiseTestLoop() {
    testLoop = new TestLoop(commandFactory);

    testLoop.getCommandInterval = function() { return runInterval };
    testLoop.firstCommand = nextCommand;
    testLoop.nextCommand = nextCommand;
    testLoop.commandStarted = commandStarted;
    testLoop.commandComplete = commandComplete;
    testLoop.commandError = commandError;
    testLoop.testComplete = testComplete;
    return testLoop
}

function nextCommand() {
    if (currentCommandRow >= inputTableRows.length - 1) {
        return null;
    }

    currentCommandRow++;

    var commandName = getCellText(currentCommandRow, 0);
    var target = replaceVariables(getCellText(currentCommandRow, 1));
    var value = replaceVariables(getCellText(currentCommandRow, 2));

    var command = new SeleniumCommand(commandName, target, value);
    return command;
}

function commandStarted() {
    // Make the current row blue
    inputTableRows[currentCommandRow].bgColor = "#DEE7EC";

    // Scroll the test frame down by 25 pixels once we get past the first 5 cells.
    if(currentCommandRow >= 5)
        getTestFrame().contentWindow.scrollBy(0,25);

    printMetrics();
}

function commandComplete(result) {
    if (result.failed) {
        setRowFailed(result.failureMessage, FAILURE);
    } else if (result.passed) {
        setRowPassed();
    } else {
        setRowWhite();
    }
}

function commandError(errorMessage) {
    setRowFailed(errorMessage, ERROR);
}

function setRowWhite() {
    inputTableRows[currentCommandRow].bgColor = "white";
}

function setRowPassed() {
    numCommandPasses += 1;

    // Set cell background to green
    inputTableRows[currentCommandRow].bgColor = passColor;
}

function setRowFailed(errorMsg, failureType) {
    if (failureType == ERROR)
        numCommandErrors += 1;
    else if (failureType == FAILURE)
        numCommandFailures += 1;

    // Set cell background to red
    inputTableRows[currentCommandRow].bgColor = failColor;

    // Set error message
    inputTableRows[currentCommandRow].cells[2].innerHTML = errorMsg;
    inputTableRows[currentCommandRow].title = errorMsg;
    testFailed = true;
    suiteFailed = true;
}

function testComplete() {
     if(testFailed) {
         inputTableRows[0].bgColor = failColor;
         numTestFailures += 1;
     }
     else {
         inputTableRows[0].bgColor = passColor;
         numTestPasses += 1;
     }

     printMetrics();

    window.setTimeout("runNextTest()", 1);
}

function getCellText(rowNumber, columnNumber) {
    return getText(inputTableRows[rowNumber].cells[columnNumber]);
}

Selenium.prototype.doPause = function(waitTime) {
    testLoop.pauseInterval = waitTime;
}

// Store the value of a form input in a variable
Selenium.prototype.doStoreValue = function(target, varName) {
    if (!varName) { 
        // Backward compatibility mode: read the ENTIRE text of the page 
        // and stores it in a variable with the name of the target
        value = this.page().bodyText();
        storedVars[target] = value;
        return;
    }
    var element = this.page().findElement(target);
    storedVars[varName] = getInputValue(element);
}

// Store the text of an element in a variable
Selenium.prototype.doStoreText = function(target, varName) {
    var element = this.page().findElement(target);
    storedVars[varName] = getText(element);
}

Selenium.prototype.doClickWithOptionalWait = function(target, wait) {
   
    this.doClick(target);
    
    if(wait != "nowait") {
        return SELENIUM_PROCESS_WAIT;
    }

}



