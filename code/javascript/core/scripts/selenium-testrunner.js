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

// An object representing the current test, used external
var currentTest = null; // TODO: get rid of this global, which mirrors the htmlTestRunner.currentTest
var selenium = null;

var htmlTestRunner;
var HtmlTestRunner = Class.create();
Object.extend(HtmlTestRunner.prototype, {
    initialize: function() {
        this.metrics = new Metrics();
        this.controlPanel = new HtmlTestRunnerControlPanel();
        this.htmlTestSuite = null;
        this.testFailed = false;
        this.currentTest = null;
        this.runAllTests = false;
        this.appWindow = null;
        // we use a timeout here to make sure the LOG has loaded first, so we can see _every_ error
        setTimeout(function() {
            this.loadSuiteFrame();
        }.bind(this), 500);
    },

    markFailed: function() {
        this.testFailed = true;
        this.htmlTestSuite.markFailed();
    },

    loadSuiteFrame: function() {
        if (selenium == null) {
            selenium = Selenium.createForWindow(this._getApplicationWindow());
            this._registerCommandHandlers();
        }
        this.controlPanel.setHighlightOption();
        var testSuiteName = this.controlPanel.getTestSuiteName();
        if (testSuiteName) {
            suiteFrame.load(testSuiteName, this._onloadTestSuite.bind(this));
        }
    },

    _getApplicationWindow: function () {
        if (this.controlPanel.isMultiWindowMode()) {
            return this._getSeparateApplicationWindow();
        }
        return $('myiframe').contentWindow;
    },

    _getSeparateApplicationWindow: function () {
        if (this.appWindow == null) {
            this.appWindow = openSeparateApplicationWindow('TestRunner-splash.html');
        }
        return this.appWindow;
    },

    _onloadTestSuite:function () {
        this.htmlTestSuite = new HtmlTestSuite(suiteFrame.getDocument());
        if (! this.htmlTestSuite.isAvailable()) {
            return;
        }
        if (this.controlPanel.isAutomatedRun()) {
            htmlTestRunner.startTestSuite();
        } else if (this.controlPanel.getAutoUrl()) {
            //todo what is the autourl doing, left to check it out
            addLoadListener(this._getApplicationWindow(), this._startSingleTest.bind(this));
            this._getApplicationWindow().src = this.controlPanel.getAutoUrl();
        } else {
            this.htmlTestSuite.getSuiteRows()[0].loadTestCase();
        }
    },

    _startSingleTest:function () {
        removeLoadListener(getApplicationWindow(), this._startSingleTest.bind(this));
        var singleTestName = this.controlPanel.getSingleTestName();
        testFrame.load(singleTestName, this.startTest.bind(this));
    },

    _registerCommandHandlers: function () {
        this.commandFactory = new CommandHandlerFactory();
        this.commandFactory.registerAll(selenium);
    },

    startTestSuite: function() {
        this.controlPanel.reset();
        this.metrics.resetMetrics();
        this.htmlTestSuite.reset();
        this.runAllTests = true;
        this.runNextTest();
    },

    runNextTest: function () {
        if (!this.runAllTests) {
            return;
        }
        this.htmlTestSuite.runNextTestInSuite();
    },

    startTest: function () {
        this.controlPanel.reset();
        testFrame.scrollToTop();
        //todo: move testFailed and storedVars to TestCase
        this.testFailed = false;
        storedVars = new Object();
        this.currentTest = new HtmlRunnerTestLoop(testFrame.getCurrentTestCase(), this.metrics, this.commandFactory);
        currentTest = this.currentTest;
        this.currentTest.start();
    },

    runSingleTest:function() {
        this.runAllTests = false;
        this.metrics.resetMetrics();
        this.startTest();
    }
});

var FeedbackColors = Class.create();
Object.extend(FeedbackColors, {
    passColor : "#ccffcc",
    doneColor : "#eeffee",
    failColor : "#ffcccc",
    workingColor : "#ffffcc",
    breakpointColor : "#cccccc"
});


var runInterval = 0;


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
        if (browserVersion.isSafari) {
			// safari doesn't reload the page when the location equals to current location.
			// hence, set the location to blank so that the page will reload automatically.
			this.frame.src = "about:blank";
            this.frame.src = location;
        } else {
            this.frame.contentWindow.location.replace(location);
        }
    },

    load: function(/* url, [callback] */) {
        if (arguments.length > 1) {
            this.loadCallback = arguments[1];

        }
        this._setLocation(arguments[0]);
    }

});

/** HtmlTestFrame - encapsulates the test-case iframe element */
var HtmlTestFrame = Class.create();
Object.extend(HtmlTestFrame.prototype, SeleniumFrame.prototype);
Object.extend(HtmlTestFrame.prototype, {

    _onLoad: function() {
        this.setCurrentTestCase();
    },

    setCurrentTestCase: function() {
        //todo: this is not good looking
        this.currentTestCase = new HtmlTestCase(this.getDocument(), htmlTestRunner.htmlTestSuite.getCurrentRow());
    },

    getCurrentTestCase: function() {
        return this.currentTestCase;
    }

});

function onSeleniumLoad() {
    suiteFrame = new SeleniumFrame(getSuiteFrame());
    testFrame = new HtmlTestFrame(getTestFrame());
    htmlTestRunner = new HtmlTestRunner();
}


var suiteFrame;
var testFrame;
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

var HtmlTestRunnerControlPanel = Class.create();
Object.extend(HtmlTestRunnerControlPanel.prototype, URLConfiguration.prototype);
Object.extend(HtmlTestRunnerControlPanel.prototype, {
    initialize: function() {
        this._acquireQueryString();

        this.runInterval = 0;

        this.highlightOption = $('highlightOption');
        this.pauseButton = $('pauseTest');
        this.stepButton = $('stepTest');

        this.highlightOption.onclick = (function() {
            this.setHighlightOption();
        }).bindAsEventListener(this);
        this.pauseButton.onclick = this.pauseCurrentTest.bindAsEventListener(this);
        this.stepButton.onclick = this.stepCurrentTest.bindAsEventListener(this);

        this.speedController = new Control.Slider('speedHandle', 'speedTrack', {
            range: $R(0, 1000),
            onSlide: this.setRunInterval.bindAsEventListener(this),
            onChange: this.setRunInterval.bindAsEventListener(this)
        });

        this._parseQueryParameter();
    },

    setHighlightOption: function () {
        var isHighlight = this.highlightOption.checked;
        selenium.browserbot.getCurrentPage().setHighlightElement(isHighlight);
    },

    _parseQueryParameter: function() {
        var tempRunInterval = this._getQueryParameter("runInterval");
        if (tempRunInterval) {
            this.setRunInterval(tempRunInterval);
        }
        this.highlightOption.checked = this._getQueryParameter("highlight");
    },

    setRunInterval: function(runInterval) {
        this.runInterval = runInterval;
    },

    setToPauseAtNextCommand: function() {
        this.runInterval = -1;
    },

    pauseCurrentTest: function () {
        this.setToPauseAtNextCommand();
        this._switchPauseButtonToContinue();
    },

    continueCurrentTest: function () {
        this.reset();
        currentTest.resume();
    },

    reset: function() {
        this.runInterval = this.speedController.value;
        this._switchContinueButtonToPause();
    },

    _switchContinueButtonToPause: function() {
        this.pauseButton.innerHTML = "Pause";
        this.pauseButton.onclick = this.pauseCurrentTest.bindAsEventListener(this);
    },

    _switchPauseButtonToContinue: function() {
        $('stepTest').disabled = false;
        this.pauseButton.innerHTML = "Continue";
        this.pauseButton.onclick = this.continueCurrentTest.bindAsEventListener(this);
    },

    stepCurrentTest: function () {
        this.setToPauseAtNextCommand();
        currentTest.resume();
    },

    isAutomatedRun: function() {
        return this._isQueryParameterTrue("auto");
    },

    shouldSaveResultsToFile: function() {
        return this._isQueryParameterTrue("save");
    },

    closeAfterTests: function() {
        return this._isQueryParameterTrue("close");
    },

    getTestSuiteName: function() {
        return this._getQueryParameter("test");
    },

    getSingleTestName: function() {
        return this._getQueryParameter("singletest");
    },

    getAutoUrl: function() {
        return this._getQueryParameter("autoURL");
    },

    getResultsUrl: function() {
        return this._getQueryParameter("resultsUrl");
    },

    _acquireQueryString: function() {
        if (this.queryString) return;
        if (browserVersion.isHTA) {
            var args = this._extractArgs();
            if (args.length < 2) return null;
            this.queryString = args[1];
        } else {
            this.queryString = location.search.substr(1);
        }
    }

});


var AbstractResultAwareRow = Class.create();
Object.extend(AbstractResultAwareRow.prototype, {

    initialize: function(trElement) {
        this.trElement = trElement;
    },

    markWorking: function() {
        this.trElement.bgColor = FeedbackColors.workingColor;
        safeScrollIntoView(this.trElement);
    },

    markPassed: function() {
        this.trElement.bgColor = FeedbackColors.passColor;
    },

    markDone: function() {
        this.trElement.bgColor = FeedbackColors.doneColor;
    },

    markFailed: function() {
        this.trElement.bgColor = FeedbackColors.failColor;
    }

});

var HtmlTestCaseRow = Class.create();
Object.extend(HtmlTestCaseRow.prototype, AbstractResultAwareRow.prototype);
Object.extend(HtmlTestCaseRow.prototype, {

    getCommand: function () {
        return new SeleniumCommand(getText(this.trElement.cells[0]),
                getText(this.trElement.cells[1]),
                getText(this.trElement.cells[2]),
                this.isBreakpoint());
    },

    markFailed: function(errorMsg) {
        this.trElement.bgColor = FeedbackColors.failColor;
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
            Element.setStyle(this.trElement, {"background-color" : FeedbackColors.breakpointColor});
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
Object.extend(HtmlTestSuiteRow.prototype, AbstractResultAwareRow.prototype);
Object.extend(HtmlTestSuiteRow.prototype, {

    initialize: function(trElement, testFrame, htmlTestSuite) {
        this.trElement = trElement;
        this.testFrame = testFrame;
        this.htmlTestSuite = htmlTestSuite;
        this.link = trElement.getElementsByTagName("a")[0];
        this.link.onclick = this._onClick.bindAsEventListener(this);
    },

    reset: function() {
        this.trElement.bgColor = '';
    },

    _onClick: function() {
        // todo: just send a message to the testSuite
        this.loadTestCase(null);
        return false;
    },

    loadTestCase: function(onloadFunction) {
        this.htmlTestSuite.currentRowInSuite = this.trElement.rowIndex - 1;
        // If the row has a stored results table, use that
        var resultsFromPreviousRun = this.trElement.cells[1];
        if (resultsFromPreviousRun) {
            // this.testFrame.restoreTestCase(resultsFromPreviousRun.innerHTML);
            var testBody = this.testFrame.getDocument().body;
            testBody.innerHTML = resultsFromPreviousRun.innerHTML;
            testFrame.setCurrentTestCase();
            if (onloadFunction) {
                onloadFunction();
            }
        } else {
			this.testFrame.load(this.link.href, onloadFunction);
        }
    },

    saveTestResults: function() {
        // todo: GLOBAL ACCESS!
        var resultHTML = this.testFrame.getDocument().body.innerHTML;
        if (!resultHTML) return;

        // todo: why create this div?
        var divElement = this.trElement.ownerDocument.createElement("div");
        divElement.innerHTML = resultHTML;

        var hiddenCell = this.trElement.ownerDocument.createElement("td");
        hiddenCell.appendChild(divElement);
        hiddenCell.style.display = "none";

        this.trElement.appendChild(hiddenCell);
    }

});

var HtmlTestSuite = Class.create();
Object.extend(HtmlTestSuite.prototype, {

    initialize: function(suiteDocument) {
        this.suiteDocument = suiteDocument;
        this.suiteRows = this._collectSuiteRows();
        this.titleRow = this.getTestTable().rows[0];
        this.title = this.titleRow.cells[0].innerHTML;
        this.reset();
    },

    reset: function() {
        this.failed = false;
        this.currentRowInSuite = -1;
        this.titleRow.bgColor = '';
        this.suiteRows.each(function(row) {
            row.reset();
        });
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

    isAvailable: function() {
        return this.getTestTable() != null;
    },

    _collectSuiteRows: function () {
        var result = [];
        for (rowNum = 1; rowNum < this.getTestTable().rows.length; rowNum++) {
            var rowElement = this.getTestTable().rows[rowNum];
            result.push(new HtmlTestSuiteRow(rowElement, testFrame, this));
        }
        return result;
    },

    getCurrentRow: function() {
        return this.suiteRows[this.currentRowInSuite];
    },

    markFailed: function() {
        this.failed = true;
        this.titleRow.bgColor = FeedbackColors.failColor;
    },

    markDone: function() {
        if (!this.failed) {
            this.titleRow.bgColor = FeedbackColors.passColor;
        }
    },

    _startCurrentTestCase: function() {
        this.getCurrentRow().markWorking();
        this.getCurrentRow().loadTestCase(htmlTestRunner.startTest.bind(htmlTestRunner));
    },

    _onTestSuiteComplete: function() {
        this.markDone();
        new TestResult(this.failed, this.getTestTable()).post();
    },

    _updateSuiteWithResultOfPreviousTest: function() {
        if (this.currentRowInSuite >= 0) {
            this.getCurrentRow().saveTestResults();
        }
    },

    runNextTestInSuite: function() {
        this._updateSuiteWithResultOfPreviousTest();
        this.currentRowInSuite++;

        // If we are done with all of the tests, set the title bar as pass or fail
        if (this.currentRowInSuite >= this.suiteRows.length) {
            this._onTestSuiteComplete();
        } else {
            this._startCurrentTestCase();
        }
    }



});

var TestResult = Class.create();
Object.extend(TestResult.prototype, {

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
    initialize: function (suiteFailed, suiteTable) {
        this.controlPanel = htmlTestRunner.controlPanel;
        this.metrics = htmlTestRunner.metrics;
        this.suiteFailed = suiteFailed;
        this.suiteTable = suiteTable;
    },

    post: function () {
        if (!this.controlPanel.isAutomatedRun()) {
            return;
        }
        var form = document.createElement("form");
        document.body.appendChild(form);

        form.id = "resultsForm";
        form.method = "post";
        form.target = "myiframe";

        var resultsUrl = this.controlPanel.getResultsUrl();
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

        form.createHiddenField("result", this.suiteFailed ? "failed" : "passed");

        form.createHiddenField("totalTime", Math.floor((this.metrics.currentTime - this.metrics.startTime) / 1000));
        form.createHiddenField("numTestPasses", this.metrics.numTestPasses);
        form.createHiddenField("numTestFailures", this.metrics.numTestFailures);
        form.createHiddenField("numCommandPasses", this.metrics.numCommandPasses);
        form.createHiddenField("numCommandFailures", this.metrics.numCommandFailures);
        form.createHiddenField("numCommandErrors", this.metrics.numCommandErrors);

        // Create an input for each test table.  The inputs are named
        // testTable.1, testTable.2, etc.
        for (rowNum = 1; rowNum < this.suiteTable.rows.length; rowNum++) {
            // If there is a second column, then add a new input
            if (this.suiteTable.rows[rowNum].cells.length > 1) {
                var resultCell = this.suiteTable.rows[rowNum].cells[1];
                form.createHiddenField("testTable." + rowNum, resultCell.innerHTML);
                // remove the resultCell, so it's not included in the suite HTML
                resultCell.parentNode.removeChild(resultCell);
            }
        }

        form.createHiddenField("numTestTotal", rowNum);

        // Add HTML for the suite itself
        form.createHiddenField("suite", this.suiteTable.parentNode.innerHTML);

        if (this.controlPanel.shouldSaveResultsToFile()) {
            this._saveToFile(resultsUrl, form);
        } else {
            form.submit();
        }
        document.body.removeChild(form);
        if (this.controlPanel.closeAfterTests()) {
            window.top.close();
        }
    },

    _saveToFile: function (fileName, form) {
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
});

/** HtmlTestCase encapsulates an HTML test document */
var HtmlTestCase = Class.create();
Object.extend(HtmlTestCase.prototype, {

    initialize: function(testDocument, htmlTestSuiteRow) {
        if (testDocument == null) {
            throw "testDocument should not be null";
        }
        if (htmlTestSuiteRow == null) {
            throw "htmlTestSuiteRow should not be null";
        }
        this.testDocument = testDocument;
        this.htmlTestSuiteRow = htmlTestSuiteRow;
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

        this._setTitleColor('');
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

    _setTitleColor: function(color) {
        var headerRow = this.testDocument.getElementsByTagName("tr")[0];
        if (headerRow) {
            headerRow.bgColor = color;
        }
    },

    markFailed: function() {
        this._setTitleColor(FeedbackColors.failColor);
        this.htmlTestSuiteRow.markFailed();
    },

    markPassed: function() {
        this._setTitleColor(FeedbackColors.passColor);
        this.htmlTestSuiteRow.markPassed();
    },

    addErrorMessage: function(errorMsg, currentRow) {
        if (currentRow) {
            currentRow.markFailed(errorMsg);
        } else {
            var errorElement = this.testDocument.createElement("p");
            errorElement.id = "error";
            errorElement.innerHTML = errorMsg;
            this.testDocument.body.appendChild(errorElement);
            Element.setStyle(errorElement, {'backgroundColor': FeedbackColors.failColor});
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


// TODO: split out an JavascriptTestCase class to handle the "sejs" stuff

var get_new_rows = function() {
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


var Metrics = Class.create();
Object.extend(Metrics.prototype, {
    initialize: function() {
        // The number of tests run
        this.numTestPasses = 0;
        // The number of tests that have failed
        this.numTestFailures = 0;
        // The number of commands which have passed
        this.numCommandPasses = 0;
        // The number of commands which have failed
        this.numCommandFailures = 0;
        // The number of commands which have caused errors (element not found)
        this.numCommandErrors = 0;
        // The time that the test was started.
        this.startTime = null;
        // The current time.
        this.currentTime = null;
    },

    printMetrics: function() {
        setText($('commandPasses'), this.numCommandPasses);
        setText($('commandFailures'), this.numCommandFailures);
        setText($('commandErrors'), this.numCommandErrors);
        setText($('testRuns'), this.numTestPasses + this.numTestFailures);
        setText($('testFailures'), this.numTestFailures);

        this.currentTime = new Date().getTime();

        var timeDiff = this.currentTime - this.startTime;
        var totalSecs = Math.floor(timeDiff / 1000);

        var minutes = Math.floor(totalSecs / 60);
        var seconds = totalSecs % 60;

        setText($('elapsedTime'), this._pad(minutes) + ":" + this._pad(seconds));
    },

// Puts a leading 0 on num if it is less than 10
    _pad: function(num) {
        return (num > 9) ? num : "0" + num;
    },

    resetMetrics: function() {
        this.numTestPasses = 0;
        this.numTestFailures = 0;
        this.numCommandPasses = 0;
        this.numCommandFailures = 0;
        this.numCommandErrors = 0;
        this.startTime = new Date().getTime();
    }

});

var HtmlRunnerCommandFactory = Class.create();
Object.extend(HtmlRunnerCommandFactory.prototype, {

    initialize: function(seleniumCommandFactory, testLoop) {
        this.seleniumCommandFactory = seleniumCommandFactory;
        this.testLoop = testLoop;
        this.handlers = {
            pause: {
                execute: function(selenium, command) {
                    testLoop.pauseInterval = command.target;
                    return {};
                }
            }
        };
        //todo: register commands
    },

    getCommandHandler: function(command) {
        if (this.handlers[command]) {
            return this.handlers[command];
        }
        return this.seleniumCommandFactory.getCommandHandler(command);
    }

});

var HtmlRunnerTestLoop = Class.create();
Object.extend(HtmlRunnerTestLoop.prototype, new TestLoop());
Object.extend(HtmlRunnerTestLoop.prototype, {
    initialize: function(htmlTestCase, metrics, seleniumCommandFactory) {

        this.commandFactory = new HtmlRunnerCommandFactory(seleniumCommandFactory, this);
        this.metrics = metrics;

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
        if (this.htmlTestCase.hasMoreCommandRows()) {
            this.currentRow = this.htmlTestCase.getNextCommandRow();
            if (this.sejsElement) {
                this.currentItem = agenda.pop();
                this.currentRowIndex++;
            }
        } else {
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
        this.metrics.printMetrics();
    },

    commandComplete : function(result) {
        if (result.failed) {
            this.metrics.numCommandFailures += 1;
            this._recordFailure(result.failureMessage);
        } else if (result.passed) {
            this.metrics.numCommandPasses += 1;
            this.currentRow.markPassed();
        } else {
            this.currentRow.markDone();
        }
    },

    commandError : function(errorMessage) {
        this.metrics.numCommandErrors += 1;
        this._recordFailure(errorMessage);
    },

    _recordFailure : function(errorMsg) {
        LOG.warn("currentTest.recordFailure: " + errorMsg);
        htmlTestRunner.markFailed();
        this.htmlTestCase.addErrorMessage(errorMsg, this.currentRow);
    },

    testComplete : function() {
        $('pauseTest').disabled = true;
        $('stepTest').disabled = true;
        if (htmlTestRunner.testFailed) {
            this.htmlTestCase.markFailed();
            this.metrics.numTestFailures += 1;
        } else {
            this.htmlTestCase.markPassed();
            this.metrics.numTestPasses += 1;
        }

        this.metrics.printMetrics();

        window.setTimeout(function() {
            htmlTestRunner.runNextTest();
        }, 1);
    },

    getCommandInterval : function() {
        return htmlTestRunner.controlPanel.runInterval;
    },

    pause : function() {
        htmlTestRunner.controlPanel.pauseCurrentTest();
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


Selenium.prototype.doBreak = function() {
    /** Halt the currently running test, and wait for the user to press the Continue button.
     * This command is useful for debugging, but be careful when using it, because it will
     * force automated tests to hang until a user intervenes manually.
     */
    // todo: should not refer to controlPanel directly
    htmlTestRunner.controlPanel.setToPauseAtNextCommand();
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

/**
 * Tell Selenium to expect a failure on the next command execution. This
 * command temporarily installs a CommandFactory that generates
 * CommandHandlers that expect a failure.
 */
Selenium.prototype.assertFailureOnNext = function(message) {
    if (!message) {
        throw new Error("Message must be provided");
    }

    var expectFailureCommandFactory =
        new ExpectFailureCommandFactory(currentTest.commandFactory, message, "failure", executeCommandAndReturnFailureMessage);
    currentTest.commandFactory = expectFailureCommandFactory;
};

/**
 * Tell Selenium to expect an error on the next command execution. This
 * command temporarily installs a CommandFactory that generates
 * CommandHandlers that expect a failure.
 */
Selenium.prototype.assertErrorOnNext = function(message) {
    if (!message) {
        throw new Error("Message must be provided");
    }

    var expectFailureCommandFactory =
        new ExpectFailureCommandFactory(currentTest.commandFactory, message, "error", executeCommandAndReturnErrorMessage);
    currentTest.commandFactory = expectFailureCommandFactory;
};

function executeCommandAndReturnFailureMessage(baseHandler, originalArguments) {
    var baseResult = baseHandler.execute.apply(baseHandler, originalArguments);
    if (baseResult.passed) {
        return null;
    }
    return baseResult.failureMessage;
};

function executeCommandAndReturnErrorMessage(baseHandler, originalArguments) {
    try {
        baseHandler.execute.apply(baseHandler, originalArguments);
        return null;
    }
    catch (expected) {
        return expected.message;
    }
};

function ExpectFailureCommandHandler(baseHandler, originalCommandFactory, expectedErrorMessage, errorType, decoratedExecutor) {
    this.execute = function() {
        var baseFailureMessage = decoratedExecutor(baseHandler, arguments);
        var result = {};
        if (!baseFailureMessage) {
            result.failed = true;
            result.failureMessage = "Expected " + errorType + " did not occur.";
        }
        else {
            if (! PatternMatcher.matches(expectedErrorMessage, baseFailureMessage)) {
                result.failed = true;
                result.failureMessage = "Expected " + errorType + " message '" + expectedErrorMessage
                                        + "' but was '" + baseFailureMessage + "'";
            }
            else {
                result.passed = true;
                result.result = baseFailureMessage;
            }
        }
        currentTest.commandFactory = originalCommandFactory;
        return result;
    };
}

function ExpectFailureCommandFactory(originalCommandFactory, expectedErrorMessage, errorType, decoratedExecutor) {
    this.getCommandHandler = function(name) {
        var baseHandler = originalCommandFactory.getCommandHandler(name);
        return new ExpectFailureCommandHandler(baseHandler, originalCommandFactory, expectedErrorMessage, errorType, decoratedExecutor);
    };
};
