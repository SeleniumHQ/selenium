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
breakpointColor = "#cccccc"

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

/** SeleniumFrame encapsulates an iframe element */
var SeleniumFrame = Class.create();
Object.extend(SeleniumFrame.prototype, {

    initialize : function(frame) {
        this.frame = frame;
        addLoadListener(this.frame, this._handleLoad.bind(this));
    },

    getDocument : function() {
        return this.frame.contentWindow.document;
    },

    _handleLoad: function() {
        this._onLoad();
        if (this.loadCallback) {
            this.loadCallback();
            this.loadCallback = null;
        }
    },

    _onLoad: function() {
    },

    scrollToTop : function() {
        this.frame.contentWindow.scrollTo(0, 0);
    },

    _setLocation: function(location) {
        this.frame.contentWindow.location.replace(location);
    },

    load: function(/* url, [callback] */) {
        if (arguments.length > 1) {
            this.loadCallback = arguments[1];
        }
        this._setLocation(arguments[0]);
    }

});

var HtmlTestFrame = Class.create();
Object.extend(HtmlTestFrame.prototype, SeleniumFrame.prototype);
Object.extend(HtmlTestFrame.prototype, {

    _onLoad: function() {
        this.setCurrentTestCase();
    },

    setCurrentTestCase: function() {
        this.currentTestCase = new HtmlTestCase(this.getDocument());
    },

    getCurrentTestCase: function() {
        return this.currentTestCase;
    }

});

var suiteFrame;
var testFrame;

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
    var f = $('testSuiteFrame');
    if (f == null) {
        f = top;
        // proxyInjection mode does not set myiframe
    }
    return f;
}

function getTestFrame() {
    var f = $('testFrame');
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
    suiteFrame = new SeleniumFrame(getSuiteFrame());
    testFrame = new HtmlTestFrame(getTestFrame());

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
    $('highlightOption').checked = getQueryParameter("highlight")

    var testSuiteName = getQueryParameter("test");

    if (testSuiteName) {
        suiteFrame.load(testSuiteName, onloadTestSuite);
    } else {
        onloadTestSuite();
    }
}

function startSingleTest() {
    removeLoadListener(getApplicationWindow(), startSingleTest);
    var singleTestName = getQueryParameter("singletest");
    testFrame.load(singleTestName, startTest);
}

var suiteTable;

function onloadTestSuite() {
    htmlTestSuite = new HtmlTestSuite(suiteFrame.getDocument());

    if (htmlTestSuite.isAvaliable()) {
        if (isAutomatedRun()) {
            startTestSuite();
        } else if (getQueryParameter("autoURL")) {
            //todo what is the autourl doing, left to check it out
            addLoadListener(getApplicationWindow(), startSingleTest);
            getApplicationWindow().src = getQueryParameter("autoURL");
        } else {
            htmlTestSuite.getSuiteRows()[0].loadTestCase();
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

    $('pauseTest').innerHTML = "Pause";
    $('pauseTest').onclick = pauseCurrentTest;
}

function stepCurrentTest() {
    runInterval = -1;
    currentTest.resume();
}

var HtmlTestCaseRow = Class.create();
Object.extend(HtmlTestCaseRow.prototype, {
    initialize: function(trElement) {
        this.trElement = trElement;
    },

    getCommand: function () {
        return new SeleniumCommand(getText(this.trElement.cells[0]),
                getText(this.trElement.cells[1]),
                getText(this.trElement.cells[2]),
                this.isBreakpoint());
    },

    markWorking: function() {
        this.trElement.bgColor = workingColor;
        safeScrollIntoView(this.trElement);
    },

    markPassed: function() {
        this.trElement.bgColor = passColor;
    },

    markDone: function() {
        this.trElement.bgColor = doneColor;
    },

    markFailed: function(errorMsg) {
        this.trElement.bgColor = failColor;
        this.setMessage(errorMsg);
    },

    setMessage: function(message) {
        this.trElement.cells[2].innerHTML = message;
    },

    reset: function() {
        this.trElement.bgColor = '';
        var thirdCell = this.trElement.cells[2];
        if (thirdCell) {
            if (thirdCell.originalHTML) {
                thirdCell.innerHTML = thirdCell.originalHTML;
            } else {
                thirdCell.originalHTML = thirdCell.innerHTML;
            }
        }
    },

    onClick: function() {
        if (this.trElement.isBreakpoint == undefined) {
            this.trElement.isBreakpoint = true;
            this.trElement.beforeBackgroundColor = Element.getStyle(this.trElement, "backgroundColor");
            Element.setStyle(this.trElement, {"background-color" : breakpointColor});
        } else {
            this.trElement.isBreakpoint = undefined;
            Element.setStyle(this.trElement, {"background-color" : this.trElement.beforeBackgroundColor});
        }
    },

    addBreakpointSupport: function() {
        Element.setStyle(this.trElement, {"cursor" : "pointer"});
        this.trElement.onclick = function() {
            this.onClick();
        }.bindAsEventListener(this);
    },

    isBreakpoint: function() {
        if (this.trElement.isBreakpoint == undefined || this.trElement.isBreakpoint == null) {
            return false
        }
        return this.trElement.isBreakpoint;
    }
});


var HtmlTestSuiteRow = Class.create();
Object.extend(HtmlTestSuiteRow.prototype, {

    initialize: function(trElement, testFrame) {
        this.trElement = trElement;
        this.testFrame = testFrame;
        this.link = trElement.getElementsByTagName("a")[0];
        this.link.onclick = this._onClick.bindAsEventListener(this);
    },

    _onClick: function(eventObj) {
        currentRowInSuite = this.trElement.rowIndex;
        this.loadTestCase();
        return false;
    },

    loadTestCase: function() {
        // If the row has a stored results table, use that
        var resultsFromPreviousRun = this.trElement.cells[1];
        if (resultsFromPreviousRun) {
            // this.testFrame.restoreTestCase(resultsFromPreviousRun.innerHTML);
            var testBody = this.testFrame.getDocument().body;
            testBody.innerHTML = resultsFromPreviousRun.innerHTML;
            // todo: this duplicates onloadTestCase
            testFrame.setCurrentTestCase();
        } else {
            this.testFrame.load(this.link.href);
        }
    }
});

var HtmlTestSuite = Class.create();
Object.extend(HtmlTestSuite.prototype, {

    initialize: function(suiteDocument) {
        this.suiteDocument = suiteDocument;
        this.suiteRows = this._collectSuiteRows();
        this.titleRow = this.getTestTable().rows[0];
        this.title = this.titleRow.cells[0].innerHTML;
    },

    getTitle: function() {
        return this.title;
    },

    getSuiteRows: function() {
        return this.suiteRows;
    },

    getTestTable: function() {
        var tables = $A(this.suiteDocument.getElementsByTagName("table"));
        return tables[0];
    },

    isAvaliable: function() {
        return this.getTestTable() != null;
    },

    _collectSuiteRows: function () {
        var result = [];
        for (rowNum = 1; rowNum < this.getTestTable().rows.length; rowNum++) {
            var rowElement = this.getTestTable().rows[rowNum];
            result.push(new HtmlTestSuiteRow(rowElement, testFrame));
        }
        return result;
    },

    markFailed: function() {
        this.titleRow.bgColor = failColor;
    },

    markPassed: function() {
        this.titleRow.bgColor = passColor;
    }

});

/** HtmlTestCase encapsulates an HTML test document */
var HtmlTestCase = Class.create();
Object.extend(HtmlTestCase.prototype, {

    initialize: function(testDocument) {
        this.testDocument = testDocument;
        this.commandRows = this._collectCommandRows();
        this.nextCommandRowIndex = 0;
        this._addBreakpointSupport();
    },

    _collectCommandRows: function () {
        var commandRows = [];
        var tables = $A(this.testDocument.getElementsByTagName("table"));
        var self = this;
        tables.each(function (table) {
            $A(table.rows).each(function(candidateRow) {
                if (self.isCommandRow(candidateRow)) {
                    commandRows.push(new HtmlTestCaseRow(candidateRow));
                }
            }.bind(this));
        });
        return commandRows;
    },

    isCommandRow:  function (row) {
        return row.cells.length >= 3;
    },

    reset: function() {
        /**
         * reset the test to runnable state
         */
        this.nextCommandRowIndex = 0;
        this.testDocument.bgColor = "";

        this.commandRows.each(function(row) {
            row.reset();
        });

        // remove any additional fake "error" row added to the end of the document
        var errorElement = this.testDocument.getElementById('error');
        if (errorElement) {
            Element.remove(errorElement);
        }
    },

    getCommandRows: function () {
        return this.commandRows;
    },

    _setResultColor: function(resultColor) {
        var headerRow = this.testDocument.getElementsByTagName("tr")[0];
        if (headerRow) {
            headerRow.bgColor = resultColor;
        }
    },

    markFailed: function() {
        this._setResultColor(failColor);
    },

    markPassed: function() {
        this._setResultColor(passColor);
    },

    addErrorMessage: function(errorMsg, currentRow) {
        if (currentRow) {
            currentRow.markFailed(errorMsg);
        } else {
            var errorElement = this.testDocument.createElement("p");
            errorElement.id = "error";
            errorElement.innerHTML = errorMsg;
            this.testDocument.body.appendChild(errorElement);
            Element.setStyle(errorElement, {'backgroundColor': failColor});
        }
    },

    _addBreakpointSupport: function() {
        this.commandRows.each(function(row) {
            row.addBreakpointSupport();
        });
    },

    hasMoreCommandRows: function() {
        return this.nextCommandRowIndex < this.commandRows.length;
    },

    getNextCommandRow: function() {
        if (this.hasMoreCommandRows()) {
            return this.commandRows[this.nextCommandRowIndex++];
        }
        return null;
    }

});

function startTest() {
    setHighlightOption();
    testFrame.scrollToTop();

    //todo: move testFailed and storedVars to TestCase
    testFailed = false;
    storedVars = new Object();

    currentTest = new HtmlRunnerTestLoop(testFrame.getCurrentTestCase(), commandFactory);
    currentTest.start();
}

// TODO: split out an JavascriptTestCase class to handle the "sejs" stuff

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
    return row_array;
};

function startTestSuite() {
    resetMetrics();
    currentRowInSuite = 0;
    runAllTests = true;
    suiteFailed = false;

    runNextTest();
}

function runNextTest() {
    if (!runAllTests) {
        return;
    }

    suiteTable = htmlTestSuite.getTestTable();

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
    // mark the current row as "working"
    setCellColor(suiteTable.rows, currentRowInSuite, 0, workingColor);

    testLink = suiteTable.rows[currentRowInSuite].cells[0].getElementsByTagName("a")[0];
    safeScrollIntoView(testLink);

    testFrame.load(testLink.href, startTest);
}

function isTestSuiteComplete() {

    if (suiteFailed) {
        htmlTestSuite.markFailed();
    } else {
        htmlTestSuite.markPassed();
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
    var resultTable = testFrame.getDocument().body.innerHTML;
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
    setText($('commandPasses'), numCommandPasses);
    setText($('commandFailures'), numCommandFailures);
    setText($('commandErrors'), numCommandErrors);
    setText($('testRuns'), numTestPasses + numTestFailures);
    setText($('testFailures'), numTestFailures);

    currentTime = new Date().getTime();

    timeDiff = currentTime - startTime;
    totalSecs = Math.floor(timeDiff / 1000);

    minutes = Math.floor(totalSecs / 60);
    seconds = totalSecs % 60;

    setText($('elapsedTime'), pad(minutes) + ":" + pad(seconds));
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

function safeScrollIntoView(element) {
    if (element.scrollIntoView) {
        element.scrollIntoView(false);
        return;
    }
    // TODO: work out how to scroll browsers that don't support
    // scrollIntoView (like Konqueror)
}

function setHighlightOption() {
    var isHighlight = $('highlightOption').checked;
    selenium.browserbot.getCurrentPage().setHighlightElement(isHighlight);
}


var HtmlRunnerTestLoop = Class.create();
Object.extend(HtmlRunnerTestLoop.prototype, new TestLoop());
Object.extend(HtmlRunnerTestLoop.prototype, {
    initialize : function(htmlTestCase, commandFactory) {

        this.commandFactory = commandFactory;
        this.waitForConditionTimeout = 30 * 1000;
        // 30 seconds

        this.htmlTestCase = htmlTestCase;

        se = selenium;
        global.se = selenium;

        this.currentRow = null;
        this.currentRowIndex = 0;

        // used for selenium tests in javascript
        this.currentItem = null;
        this.commandAgenda = new Array();

        this.htmlTestCase.reset();

        this.sejsElement = this.htmlTestCase.testDocument.getElementById('sejs');
        if (this.sejsElement) {
            var fname = 'Selenium JavaScript';
            parse_result = parse(this.sejsElement.innerHTML, fname, 0);

            var x2 = new ExecutionContext(GLOBAL_CODE);
            ExecutionContext.current = x2;

            execute(parse_result, x2)
        }
    },

    _advanceToNextRow: function() {
        if (this.htmlTestCase.hasMoreCommandRows())   {
            this.currentRow = this.htmlTestCase.getNextCommandRow();
            if (this.sejsElement) {
                this.currentItem = agenda.pop();
                this.currentRowIndex++;
            }
        } else  {
            this.currentRow = null;
            this.currentItem = null;
        }
    },

    nextCommand : function() {
        this._advanceToNextRow();
        if (this.currentRow == null) {
            return null;
        }
        return this.currentRow.getCommand();
    },

    commandStarted : function() {
        $('pauseTest').disabled = false;
        this.currentRow.markWorking();
        printMetrics();
    },

    commandComplete : function(result) {
        if (result.failed) {
            numCommandFailures += 1;
            this._recordFailure(result.failureMessage);
        } else if (result.passed) {
            numCommandPasses += 1;
            this.currentRow.markPassed();
        } else {
            this.currentRow.markDone();
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
        this.htmlTestCase.addErrorMessage(errorMsg, this.currentRow);
    },

    testComplete : function() {
        $('pauseTest').disabled = true;
        $('stepTest').disabled = true;
        if (testFailed) {
            this.htmlTestCase.markFailed();
            numTestFailures += 1;
        } else {
            this.htmlTestCase.markPassed();
            numTestPasses += 1;
        }

        printMetrics();

        window.setTimeout("runNextTest()", 1);
    },

    getCommandInterval : function() {
        return runInterval;
    },

    pause : function() {
        runInterval = -1;
        $('stepTest').disabled = false;
        $('pauseTest').innerHTML = "Continue";
        $('pauseTest').onclick = continueCurrentTest;
    },

    doNextCommand: function() {
        var _n = this.currentItem[0];
        var _x = this.currentItem[1];

        new_block = new Array()
        execute(_n, _x);
        if (new_block.length > 0) {
            var the_table = this.htmlTestCase.testDocument.getElementById("se-js-table")
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
    currentTest.currentRow.setMessage(message);
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