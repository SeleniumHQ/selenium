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

function getSuiteFrame() {
    return document.getElementById('testSuiteFrame');
}

function getTestFrame(){
	return document.getElementById('testFrame');
}

function loadAndRunIfAuto() {
    loadSuiteFrame();
}

function loadSuiteFrame()
{
    browserbot = new BrowserBot(document.getElementById('myiframe'));
    selenium = new Selenium(browserbot);
    registerCommandHandlers()

	testSuiteName = getQueryStringTestName();

	if( testSuiteName != "" ) {
        addLoadListener(getSuiteFrame(), loadTestFrame);
		getSuiteFrame().src = testSuiteName;
    }
    else
    	loadTestFrame();

}

function loadTestFrame()
{
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
	for (var i =0;i < myVars.length; i++)
	{
		nameVal = myVars[i].split('=')
		if( nameVal[0] == "test" )
			testName="/" + nameVal[1];
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

    testLoop = new TestLoop(commandFactory);
    testLoop.start();
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

function TestLoop(commandFactory) {
    this.commandFactory = commandFactory;
    var self = this;

    this.start = function() {
        clearRowColours();
        self.continueCurrentTest();
    }

    function clearRowColours() {
        for (var i = 0; i <= inputTableRows.length - 1; i++) {
            inputTableRows[i].bgColor = "white";
        }
    }

    this.continueCurrentTest = function() {
        processState = SELENIUM_PROCESS_CONTINUE;
        while (currentCommandRow < inputTableRows.length - 1) {
            currentCommandRow++;
            processState = self.executeNextCommand();
            if (processState == SELENIUM_WAIT_FOR_RELOAD) {
                return; // Will re-enter this loop on reload.
            }
            if (processState == SELENIUM_PROCESS_ABORT) { // TODO remove this flag, use exception
                break;
            }
        }

        // Test is finished.
        self.completeTest();
        window.setTimeout("runNextTest()", 100);
    }

    this.executeNextCommand = function() {
        //alert("executeNextCommand(" + commandIndex + ")");
        // Make the current row blue
        this.beginCommand();

        var command = getCellText(currentCommandRow, 0);
        var target = replaceVariables(getCellText(currentCommandRow, 1));
        var value = replaceVariables(getCellText(currentCommandRow, 2));

        handler = this.commandFactory.getCommandHandler(command);

        // TODO invert this horrible recursive thing...
        if(handler == null) {
            this.commandError("Unknown command", ERROR);
            return SELENIUM_PROCESS_ABORT;
        }
        else {
            try {
                var processNext = handler.executor.call(selenium, target, value);
                if (handler.type == "assert") {
                    this.assertionPassed();
                } else {
                    this.actionOK();
                }

                return processNext;
            } catch (e) {
                if (handler.type == "action") {
                    this.commandError(e.message);
                    return SELENIUM_PROCESS_ABORT;
                } else {
                    this.assertionFailed(e.message);
                    return SELENIUM_PROCESS_CONTINUE;
                }
            }
        }
    }

    function getCellText(rowNumber, columnNumber) {
        return getText(inputTableRows[rowNumber].cells[columnNumber]);
    }
}

TestLoop.prototype.beginCommand = function() {
    // Make the current row blue
    inputTableRows[currentCommandRow].bgColor = "#DEE7EC";

    // Scroll the test frame down by 25 pixels once we get past the first 5 cells.
    if(currentCommandRow >= 5)
        getTestFrame().contentWindow.scrollBy(0,25);

    printMetrics();
}

TestLoop.prototype.commandError = function(message) {
    this.setRowFailed(message, ERROR);
}

TestLoop.prototype.actionOK = function(message) {
    inputTableRows[currentCommandRow].bgColor = "white";
}

TestLoop.prototype.assertionPassed = function() {
    this.setRowPassed(currentCommandRow);
}

TestLoop.prototype.assertionFailed = function(message) {
    this.setRowFailed(message, FAILURE);
}

TestLoop.prototype.completeTest = function() {
     if(testFailed) {
         inputTableRows[0].bgColor = failColor;
         numTestFailures += 1;
     }
     else {
         inputTableRows[0].bgColor = passColor;
         numTestPasses += 1;
     }

     printMetrics();
}

TestLoop.prototype.setRowPassed = function() {
    numCommandPasses += 1;

    // Set cell background to green
    inputTableRows[currentCommandRow].bgColor = passColor;
}

TestLoop.prototype.setRowFailed = function(errorMsg, failureType) {
    if (failureType == ERROR)
        numCommandErrors += 1;
    else if (failureType == FAILURE)
        numCommandFailures += 1;

    // Set cell background to red
    inputTableRows[currentCommandRow].bgColor = failColor;

    // Set error message
    inputTableRows[currentCommandRow].cells[2].innerHTML = errorMsg;
    testFailed = true;
    suiteFailed = true;
}

// Register all of the built-in command handlers with the CommandFactory.
// TODO work out an easy way for people to register handlers without modifying the Selenium sources.
function registerCommandHandlers() {
    commandFactory = new CommandFactory();
    commandFactory.registerAll(selenium);

    // These actions are overridden for fitrunner, as they still involve some FitRunner smarts,
    // because of the wait/nowait behaviour modification. We need a generic solution to this.
    commandFactory.registerAction("click", selenium.doClickWithOptionalWait);
    commandFactory.registerAction("open", selenium.doOpenWithWait);
}

Selenium.prototype.doPause = function(waitTime) {
    setTimeout("testLoop.continueCurrentTest()", waitTime);
    return SELENIUM_WAIT_FOR_RELOAD;
}

// Reads the text of the page and stores it in a variable with the name of the target
Selenium.prototype.doStoreValue = function(target) {
    value = this.page().bodyText();
    storedVars[target] = value;
    return SELENIUM_PROCESS_CONTINUE;
}

Selenium.prototype.doClickWithOptionalWait = function(target, wait) {
    this.doClick(target);

    if(wait == "nowait") {
        return SELENIUM_PROCESS_CONTINUE;
    }
    this.callOnNextPageLoad(testLoop.continueCurrentTest);
    return SELENIUM_WAIT_FOR_RELOAD;
}

Selenium.prototype.doOpenWithWait = function(target) {
    this.doOpen(target);
    this.callOnNextPageLoad(testLoop.continueCurrentTest);
    return SELENIUM_WAIT_FOR_RELOAD;
}

