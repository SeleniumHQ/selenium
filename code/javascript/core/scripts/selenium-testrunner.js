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

// The current row in the list of tests (test suite)
currentRowInSuite = 0;

// An object representing the current test
currentTest = null;

// Whether or not the jsFT should run all tests in the suite
runAllTests = false;

// Whether or not the current test has any errors;
testFailed = false;
suiteFailed = false;

// Colors used to provide feedback
passColor = "#ccffcc";
doneColor = "#eeffee";
failColor = "#ffcccc";
workingColor = "#ffffcc";

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

selenium = null;
queryString = null;

warned = null;

// todo: could this just be "SeleniumWindow" instead?
var SeleniumFrame = Class.create();
Object.extend(SeleniumFrame.prototype, {
    initialize : function(iframe) {
        this.iframe = iframe;
    },

    getDocument : function() {
        return this.iframe.contentWindow.document;
    },

    addLoadListener : function(listener) {
        addLoadListener(this.iframe, listener);
    },

    removeLoadListener : function(listener) {
        removeLoadListener(this.iframe, listener);
    },

    scrollToTop : function() {
        this.iframe.contentWindow.scrollTo(0, 0);
    },

    setLocation : function(location) {
        if (location == this.iframe.src) {
            // reload
            this.iframe.contentWindow.location.reload(true);
        } else {
            this.iframe.src = location;
        }
    }

});

var suiteIFrame;
var testIFrame;

var appWindow;
/**
 * Get the window that will hold the AUT.
 *
 * If the query-pamemeter "multiWindow" is set, this returns a separate
 * top-level window, suitable for testing "frame-busting" applications.
 * Otherwise, it returns an embedded iframe window.
 */
function getApplicationWindow() {
    if (isQueryParameterTrue('multiWindow')) {
        return getSeparateApplicationWindow();
    }
    return $('myiframe').contentWindow;
}

/**
 * Get (or create) the separate top-level AUT window.
 */
function getSeparateApplicationWindow() {
    if (appWindow == null) {
        appWindow = openSeparateApplicationWindow('TestRunner-splash.html');
    }
    return appWindow;
}

function getSuiteFrame() {
    var f = document.getElementById('testSuiteFrame');
    if (f == null) {
        f = top;
        // proxyInjection mode does not set myiframe
    }
    return f;
}

function getTestFrame() {
    var f = document.getElementById('testFrame');
    if (f == null) {
        f = top;
        // proxyInjection mode does not set myiframe
    }
    return f;
}

function loadAndRunIfAuto() {
    loadSuiteFrame();
}

function onSeleniumLoad() {
    suiteIFrame = new SeleniumFrame(getSuiteFrame());
    testIFrame = new SeleniumFrame(getTestFrame());

    queryString = null;
    runInterval = 0;

    // we use a timeout here to make sure the LOG has loaded first, so we can see _every_ error
    setTimeout('loadSuiteFrame()', 500);
}

function loadSuiteFrame() {
    var testAppWindow = getApplicationWindow();
    //testAppWindow.foo = '123';
    if (selenium == null) {
        selenium = Selenium.createForWindow(testAppWindow);
        registerCommandHandlers();
    }

    //set the runInterval if there is a queryParameter for it
    var tempRunInterval = getQueryParameter("runInterval");
    if (tempRunInterval) {
        runInterval = tempRunInterval;
    }

    speedController = new Control.Slider('speedHandle', 'speedTrack', {
        range:$R(0, 1000),
        onSlide:function(v) {
            runInterval = v;
        } ,
        onChange:function(v) {
            runInterval = v;
        }});
    document.getElementById("highlightOption").checked = getQueryParameter("highlight")

    var testSuiteName = getQueryParameter("test");

    if (testSuiteName) {
        suiteIFrame.addLoadListener(onloadTestSuite);
        getSuiteFrame().src = testSuiteName;
    } else {
        onloadTestSuite();
    }
}

function startSingleTest() {
    removeLoadListener(getApplicationWindow(), startSingleTest);
    var singleTestName = getQueryParameter("singletest");
    testIFrame.addLoadListener(startTest);
    getTestFrame().src = singleTestName;
}

var suiteTable;

function onloadTestSuite() {
    suiteIFrame.removeLoadListener(onloadTestSuite);
    testIFrame.addLoadListener(addBreakpointSupport);

    // Add an onclick function to each link in all suite tables
    var allTables = suiteIFrame.getDocument().getElementsByTagName("table");
    for (var tableNum = 0; tableNum < allTables.length; tableNum++)
    {
        var skippedTable = allTables[tableNum];
        for (rowNum = 1; rowNum < skippedTable.rows.length; rowNum++) {
            addOnclick(skippedTable, rowNum);
        }
    }

    suiteTable = suiteIFrame.getDocument().getElementsByTagName("table")[0];
    if (suiteTable != null) {

        if (isAutomatedRun()) {
            startTestSuite();
        } else if (getQueryParameter("autoURL")) {

            addLoadListener(getApplicationWindow(), startSingleTest);

            getApplicationWindow().src = getQueryParameter("autoURL");

        } else {
            testLink = suiteTable.rows[currentRowInSuite + 1].cells[0].getElementsByTagName("a")[0];
            getTestFrame().src = testLink.href;
        }
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
        if (eventObj)
            srcObj = eventObj.target;

        // For IE-like browsers
        else if (getSuiteFrame().contentWindow.event)
            srcObj = getSuiteFrame().contentWindow.event.srcElement;

        // The target row (the event source is not consistently reported by browsers)
        row = srcObj.parentNode.parentNode.rowIndex || srcObj.parentNode.parentNode.parentNode.rowIndex;
        currentRowInSuite = row;

        // If the row has a stored results table, use that
        if (suiteTable.rows[row].cells[1]) {
            var bodyElement = testIFrame.getDocument().body;

            // Create a div element to hold the results table.
            var tableNode = testIFrame.getDocument().createElement("div");
            var resultsCell = suiteTable.rows[row].cells[1];
            tableNode.innerHTML = resultsCell.innerHTML;

            // Append this text node, and remove all the preceding nodes.
            bodyElement.appendChild(tableNode);
            while (bodyElement.firstChild != bodyElement.lastChild) {
                bodyElement.removeChild(bodyElement.firstChild);
            }

            addBreakpointSupport(getIframeDocument(getTestFrame()));
        }
        // Otherwise, just open up the fresh page.
        else {
            testIFrame.setLocation(suiteTable.rows[row].cells[0].getElementsByTagName("a")[0].href);
        }

        return false;
    };
}

function onloadTestCase() {
    addBreakpointSupport(testIFrame.getDocument());
}

function addBreakpointSupport(testDocument) {
    var tables = testDocument.getElementsByTagName("table");
    for (var i = 0; i < tables.length; i++) {
        var rows = tables[i].rows;
        for (var j = 0; j < rows.length; j++) {
            if (isCommandRow(rows[j])) {
                Element.setStyle(rows[j], {"cursor" : "pointer"});
                Event.observe(rows[j], 'click', getBreakpointEventHandler(rows[j]), false);
            }
        }
    }
}

function getBreakpointEventHandler(commandRow) {
    return function() {
        if (commandRow.isBreakpoint == undefined) {
            commandRow.isBreakpoint = true;
            commandRow.beforeBackgroundColor = Element.getStyle(commandRow, "backgroundColor");
            Element.setStyle(commandRow, {"background-color" : "#cccccc"});
        } else {
            commandRow.isBreakpoint = undefined;
            Element.setStyle(commandRow, {"background-color" : commandRow.beforeBackgroundColor});
        }
    }
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
    var matches = str.match(/(?:\"([^\"]+)\"|(?!\"([^\"]+)\")(\S+))/g);
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

function isNewWindow() {
    return isQueryParameterTrue("newWindow");
}

function isAutomatedRun() {
    return isQueryParameterTrue("auto");
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

function pauseCurrentTest() {
    runInterval = -1;
}

function continueCurrentTest() {
    runInterval = speedController.value;
    currentTest.resume();

    document.getElementById('pauseTest').innerHTML = "Pause";
    document.getElementById('pauseTest').onclick = pauseCurrentTest;
}

function stepCurrentTest() {
    runInterval = -1;
    currentTest.resume();
}

function startTest() {
    testIFrame.removeLoadListener(startTest);
    setHighlightOption();

    testIFrame.scrollToTop();

    var isJavascriptTest = testIFrame.getDocument().getElementById('se-js-table');
    currentTest = new HtmlRunnerTestLoop(testIFrame.getDocument(), isJavascriptTest, commandFactory);

    //todo: move testFailed and storedVars to TestCase
    testFailed = false;
    storedVars = new Object();

    currentTest.start();

    // PL: for the purpose of testing
    //testLoop.waitForConditionTimeout = 2000;
}

get_new_rows = function() {
    var row_array = new Array();
    for (var i = 0; i < new_block.length; i++) {

        var new_source = (new_block[i][0].tokenizer.source.slice(new_block[i][0].start,
                new_block[i][0].end));

        var row = '<td style="display:none;" class="js">getEval</td>' +
                  '<td style="display:none;">currentTest.doNextCommand()</td>' +
                  '<td style="white-space: pre;">' + new_source + '</td>' +
                  '<td></td>'

        row_array.push(row);
    }
    ;
    return row_array
};

function startTestSuite() {
    resetMetrics();
    currentRowInSuite = 0;
    runAllTests = true;
    suiteFailed = false;

    runNextTest();
}

function runNextTest() {
    if (!runAllTests)
        return;

    suiteTable = suiteIFrame.getDocument().getElementsByTagName("table")[0];

    updateSuiteWithResultOfPreviousTest();

    currentRowInSuite++;

    // If we are done with all of the tests, set the title bar as pass or fail
    if (currentRowInSuite >= suiteTable.rows.length) {
        isTestSuiteComplete();
    } else {
        startCurrentTestCase();
    }
}

function startCurrentTestCase() {
    // Make the current row blue
    setCellColor(suiteTable.rows, currentRowInSuite, 0, workingColor);

    testLink = suiteTable.rows[currentRowInSuite].cells[0].getElementsByTagName("a")[0];
    //todo: use scrollIntoView instead?
    testLink.focus();

    testIFrame.addLoadListener(startTest);
    testIFrame.setLocation(testLink.href);

}

function isTestSuiteComplete() {
    if (suiteFailed) {
        setCellColor(suiteTable.rows, 0, 0, failColor);
    } else {
        setCellColor(suiteTable.rows, 0, 0, passColor);
    }

    // If this is an automated run (i.e., build script), then submit
    // the test results by posting to a form
    if (isAutomatedRun()) {
        postTestResults(suiteFailed, suiteTable);
    }
}

function updateSuiteWithResultOfPreviousTest() {
    // Do not change the row color of the first row
    if (currentRowInSuite > 0) {
        // Provide test-status feedback
        if (testFailed) {
            setCellColor(suiteTable.rows, currentRowInSuite, 0, failColor);
        } else {
            setCellColor(suiteTable.rows, currentRowInSuite, 0, passColor);
        }

        // Set the results from the previous test run
        setResultsData(suiteTable, currentRowInSuite);
    }
}

function setCellColor(tableRows, row, col, colorStr) {
    tableRows[row].cells[col].bgColor = colorStr;
}

// Sets the results from a test into a hidden column on the suite table.  So,
// for each tests, the second column is set to the HTML from the test table.
function setResultsData(suiteTable, row) {
    // Create a text node of the test table
    var resultTable = testIFrame.getDocument().body.innerHTML;
    if (!resultTable) return;

    var tableNode = suiteTable.ownerDocument.createElement("div");
    tableNode.innerHTML = resultTable;

    var new_column = suiteTable.ownerDocument.createElement("td");
    new_column.appendChild(tableNode);

    // Set the column to be invisible
    new_column.style.display = "none";

    // Add the invisible column
    suiteTable.rows[row].appendChild(new_column);
}

// Post the results to a servlet, CGI-script, etc.  The URL of the
// results-handler defaults to "/postResults", but an alternative location
// can be specified by providing a "resultsUrl" query parameter.
//
// Parameters passed to the results-handler are:
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
//
function postTestResults(suiteFailed, suiteTable) {

    form = document.createElement("form");
    document.body.appendChild(form);

    form.id = "resultsForm";
    form.method = "post";
    form.target = "myiframe";

    var resultsUrl = getQueryParameter("resultsUrl");
    if (!resultsUrl) {
        resultsUrl = "./postResults";
    }

    var actionAndParameters = resultsUrl.split('?', 2);
    form.action = actionAndParameters[0];
    var resultsUrlQueryString = actionAndParameters[1];

    form.createHiddenField = function(name, value) {
        input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        this.appendChild(input);
    };

    if (resultsUrlQueryString) {
        var clauses = resultsUrlQueryString.split('&');
        for (var i = 0; i < clauses.length; i++) {
            var keyValuePair = clauses[i].split('=', 2);
            var key = unescape(keyValuePair[0]);
            var value = unescape(keyValuePair[1]);
            form.createHiddenField(key, value);
        }
    }

    form.createHiddenField("selenium.version", Selenium.version);
    form.createHiddenField("selenium.revision", Selenium.revision);

    form.createHiddenField("result", suiteFailed == true ? "failed" : "passed");

    form.createHiddenField("totalTime", Math.floor((currentTime - startTime) / 1000));
    form.createHiddenField("numTestPasses", numTestPasses);
    form.createHiddenField("numTestFailures", numTestFailures);
    form.createHiddenField("numCommandPasses", numCommandPasses);
    form.createHiddenField("numCommandFailures", numCommandFailures);
    form.createHiddenField("numCommandErrors", numCommandErrors);

    // Create an input for each test table.  The inputs are named
    // testTable.1, testTable.2, etc.
    for (rowNum = 1; rowNum < suiteTable.rows.length; rowNum++) {
        // If there is a second column, then add a new input
        if (suiteTable.rows[rowNum].cells.length > 1) {
            var resultCell = suiteTable.rows[rowNum].cells[1];
            form.createHiddenField("testTable." + rowNum, resultCell.innerHTML);
            // remove the resultCell, so it's not included in the suite HTML
            resultCell.parentNode.removeChild(resultCell);
        }
    }

    form.createHiddenField("numTestTotal", rowNum);

    // Add HTML for the suite itself
    form.createHiddenField("suite", suiteTable.parentNode.innerHTML);

    if (isQueryParameterTrue("save")) {
        saveToFile(resultsUrl, form);
    } else {
        form.submit();
    }
    document.body.removeChild(form);
    if (isQueryParameterTrue("close")) {
        window.top.close();
    }
}

function saveToFile(fileName, form) {
    // This only works when run as an IE HTA
    var inputs = new Object();
    for (var i = 0; i < form.elements.length; i++) {
        inputs[form.elements[i].name] = form.elements[i].value;
    }
    var objFSO = new ActiveXObject("Scripting.FileSystemObject")
    var scriptFile = objFSO.CreateTextFile(fileName);
    scriptFile.WriteLine("<html><body>\n<h1>Test suite results </h1>" +
                         "\n\n<table>\n<tr>\n<td>result:</td>\n<td>" + inputs["result"] + "</td>\n" +
                         "</tr>\n<tr>\n<td>totalTime:</td>\n<td>" + inputs["totalTime"] + "</td>\n</tr>\n" +
                         "<tr>\n<td>numTestPasses:</td>\n<td>" + inputs["numTestPasses"] + "</td>\n</tr>\n" +
                         "<tr>\n<td>numTestFailures:</td>\n<td>" + inputs["numTestFailures"] + "</td>\n</tr>\n" +
                         "<tr>\n<td>numCommandPasses:</td>\n<td>" + inputs["numCommandPasses"] + "</td>\n</tr>\n" +
                         "<tr>\n<td>numCommandFailures:</td>\n<td>" + inputs["numCommandFailures"] + "</td>\n</tr>\n" +
                         "<tr>\n<td>numCommandErrors:</td>\n<td>" + inputs["numCommandErrors"] + "</td>\n</tr>\n" +
                         "<tr>\n<td>" + inputs["suite"] + "</td>\n<td>&nbsp;</td>\n</tr>");
    var testNum = inputs["numTestTotal"];
    for (var rowNum = 1; rowNum < testNum; rowNum++) {
        scriptFile.WriteLine("<tr>\n<td>" + inputs["testTable." + rowNum] + "</td>\n<td>&nbsp;</td>\n</tr>");
    }
    scriptFile.WriteLine("</table></body></html>");
    scriptFile.Close();
}

function printMetrics() {
    setText(document.getElementById("commandPasses"), numCommandPasses);
    setText(document.getElementById("commandFailures"), numCommandFailures);
    setText(document.getElementById("commandErrors"), numCommandErrors);
    setText(document.getElementById("testRuns"), numTestPasses + numTestFailures);
    setText(document.getElementById("testFailures"), numTestFailures);

    currentTime = new Date().getTime();

    timeDiff = currentTime - startTime;
    totalSecs = Math.floor(timeDiff / 1000);

    minutes = Math.floor(totalSecs / 60);
    seconds = totalSecs % 60;

    setText(document.getElementById("elapsedTime"), pad(minutes) + ":" + pad(seconds));
}

// Puts a leading 0 on num if it is less than 10
function pad(num) {
    return (num > 9) ? num : "0" + num;
}

/*
 * Register all of the built-in command handlers with the CommandHandlerFactory.
 * TODO work out an easy way for people to register handlers without modifying the Selenium sources.
 */
function registerCommandHandlers() {
    commandFactory = new CommandHandlerFactory();
    commandFactory.registerAll(selenium);

}

function removeNbsp(value) {
    return value.replace(/\240/g, "");
}

function scrollIntoView(element) {
    if (element.scrollIntoView) {
        element.scrollIntoView(false);
        return;
    }
    // TODO: work out how to scroll browsers that don't support
    // scrollIntoView (like Konqueror)
}

function setHighlightOption() {
    var isHighlight = document.getElementById("highlightOption").checked;
    selenium.browserbot.getCurrentPage().setHighlightElement(isHighlight);
}

function isCommandRow(row) {
    return row.cells.length >= 3;
}

var HtmlRunnerTestLoop = Class.create();
Object.extend(HtmlRunnerTestLoop.prototype, new TestLoop());
Object.extend(HtmlRunnerTestLoop.prototype, {
    initialize : function(testDocument, isJavaScript, commandFactory) {

        this.commandFactory = commandFactory;
        this.waitForConditionTimeout = 30 * 1000;
        // 30 seconds

        this.isJavaScript = isJavaScript;
        se = selenium;
        global.se = selenium;
        this.document = testDocument;
        this.document.bgColor = "";
        this.currentRow = null;
        this.currentRowIndex = 0;
        this.commandRows = new Array();
        this.headerRow = null;

        // used for selenium tests in javascript
        this.currentItem = null;
        this.commandAgenda = new Array();

        if (this.document.originalBody == undefined) {
            this.document.originalBody = this.document.body.innerHTML;
        } else {
            this.document.body.innerHTML = this.document.originalBody;
            addBreakpointSupport(this.document);
        }

        var tables = this.document.getElementsByTagName("table");
        for (var i = 0; i < tables.length; i++) {
            var candidateRows = tables[i].rows;
            for (var j = 0; j < candidateRows.length; j++) {
                if (!this.headerRow) {
                    this.headerRow = candidateRows[j];
                }
                if (isCommandRow(candidateRows[j])) {
                    this._addCommandRow(candidateRows[j]);
                }
            }
        }

        if (isJavaScript) {
            var script = this.document.getElementById('sejs')  // the script source
            var fname = 'Selenium JavaScript';
            parse_result = parse(script.innerHTML, fname, 0);

            var x2 = new ExecutionContext(GLOBAL_CODE);
            ExecutionContext.current = x2;

            execute(parse_result, x2)
        }
    },

    _addCommandRow: function(row) {
        this.commandRows.push(row);
    },

    _nextCommandRow: function() {
        if (this.commandRows.length > 0) {
            this.currentRow = this.commandRows.shift();
            if (this.isJavaScript) {
                this.currentItem = agenda.pop();
                this.currentRowIndex++;
            }
        } else {
            this.currentRow = null;
            this.currentItem = null;
        }
        return this.currentRow;
    },

    nextCommand : function() {
        var row = this._nextCommandRow();
        if (row == null) {
            return null;
        }
        return new SeleniumCommand(getText(row.cells[0]),
                getText(row.cells[1]),
                getText(row.cells[2]),
                row.isBreakpoint);
    },

    commandStarted : function() {
        document.getElementById('pauseTest').disabled = false;

        this.currentRow.bgColor = workingColor;
        scrollIntoView(this.currentRow.cells[0]);
        printMetrics();
    },

    commandComplete : function(result) {
        if (result.failed) {
            numCommandFailures += 1;
            this._recordFailure(result.failureMessage);
        } else if (result.passed) {
            numCommandPasses += 1;
            this.currentRow.bgColor = passColor;
        } else {
            this.currentRow.bgColor = doneColor;
        }
    },

    commandError : function(errorMessage) {
        numCommandErrors += 1;
        this._recordFailure(errorMessage);
    },

    _recordFailure : function(errorMsg) {
        LOG.warn("currentTest.recordFailure: " + errorMsg);

        testFailed = true;
        suiteFailed = true;

        var testDocument = testIFrame.getDocument();

        var errorRow = this.currentRow;
        if (!errorRow) {
            // At the end of the test, we might not have a "current" row
            var fakeTable = testDocument.createElement("table");
            fakeTable.innerHTML = "<tr><td></td><td></td><td></td></tr>";
            testDocument.body.appendChild(fakeTable);
            errorRow = fakeTable.rows[0];
        }

        errorRow.bgColor = failColor;
        errorRow.cells[2].innerHTML = errorMsg;
        errorRow.title = errorMsg;

    },

    testComplete : function() {
        document.getElementById('pauseTest').disabled = true;
        document.getElementById('stepTest').disabled = true;
        var resultColor = passColor;
        if (testFailed) {
            resultColor = failColor;
            numTestFailures += 1;
        } else {
            numTestPasses += 1;
        }

        if (this.headerRow) {
            this.headerRow.bgColor = resultColor;
        }

        printMetrics();

        window.setTimeout("runNextTest()", 1);
    },

    getCommandInterval : function() {
        return runInterval;
    },

    pause : function() {
        runInterval = -1;
        document.getElementById('stepTest').disabled = false;
        document.getElementById('pauseTest').innerHTML = "Continue";
        document.getElementById('pauseTest').onclick = continueCurrentTest;
    },

    doNextCommand: function() {
        var _n = this.currentItem[0];
        var _x = this.currentItem[1];

        new_block = new Array()
        execute(_n, _x);
        if (new_block.length > 0) {
            var the_table = this.document.getElementById("se-js-table")
            var loc = this.currentRowIndex
            var new_rows = get_new_rows()

            // make the new statements visible on screen...
            for (var i = 0; i < new_rows.length; i++) {
                the_table.insertRow(loc + 1);
                the_table.rows[loc + 1].innerHTML = new_rows[i];
                this.commandRows.unshift(the_table.rows[loc + 1])
            }

        }
    }

});


Selenium.prototype.doPause = function(waitTime) {
    /** Wait for the specified amount of time (in milliseconds)
     * @param waitTime the amount of time to sleep (in milliseconds)
     */
    currentTest.pauseInterval = waitTime;
};

Selenium.prototype.doPause.dontCheckAlertsAndConfirms = true;

Selenium.prototype.doBreak = function() {
    /** Halt the currently running test, and wait for the user to press the Continue button.
     * This command is useful for debugging, but be careful when using it, because it will
     * force automated tests to hang until a user intervenes manually.
     */
    runInterval = -1;
};

Selenium.prototype.doStore = function(expression, variableName) {
    /** This command is a synonym for storeExpression.
     * @param expression the value to store
     * @param variableName the name of a <a href="#storedVars">variable</a> in which the result is to be stored.
     */
    storedVars[variableName] = expression;
}

/*
 * Click on the located element, and attach a callback to notify
 * when the page is reloaded.
 */
// DGF TODO this code has been broken for some time... what is it trying to accomplish?
Selenium.prototype.XXXdoModalDialogTest = function(returnValue) {
    this.browserbot.doModalDialogTest(returnValue);
};

Selenium.prototype.doEcho = function(message) {
    /** Prints the specified message into the third table cell in your Selenese tables.
     * Useful for debugging.
     * @param message the message to print
     */
    currentTest.currentRow.cells[2].innerHTML = message;
}

Selenium.prototype.assertSelected = function(selectLocator, optionLocator) {
    /**
     * Verifies that the selected option of a drop-down satisfies the optionSpecifier.  <i>Note that this command is deprecated; you should use assertSelectedLabel, assertSelectedValue, assertSelectedIndex, or assertSelectedId instead.</i>
     *
     * <p>See the select command for more information about option locators.</p>
     *
     * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
     * @param optionLocator an option locator, typically just an option label (e.g. "John Smith")
     */
    var element = this.page().findElement(selectLocator);
    var locator = this.optionLocatorFactory.fromLocatorString(optionLocator);
    if (element.selectedIndex == -1)
    {
        Assert.fail("No option selected");
    }
    locator.assertSelected(element);
};
