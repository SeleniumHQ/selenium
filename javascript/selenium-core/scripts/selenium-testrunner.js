/*
* Copyright 2011 Software Freedom Conservancy
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
var HtmlTestRunner = classCreate();
objectExtend(HtmlTestRunner.prototype, {
    initialize: function() {
        this.metrics = new Metrics();
        this.controlPanel = new HtmlTestRunnerControlPanel();
        this.testFailed = false;
        this.currentTest = null;
        this.runAllTests = false;
        this.appWindow = null;
        // we use a timeout here to make sure the LOG has loaded first, so we can see _every_ error
        setTimeout(fnBind(function() {
            this.loadSuiteFrame();
        }, this), 500);
    },

    getTestSuite: function() {
        return suiteFrame.getCurrentTestSuite();
    },

    markFailed: function() {
        this.testFailed = true;
        this.getTestSuite().markFailed();
    },

    loadSuiteFrame: function() {
        var logLevel = this.controlPanel.getDefaultLogLevel();
        if (logLevel) {
            LOG.setLogLevelThreshold(logLevel);
        }

        var self = this;
        if (selenium == null) {
            var appWindow = self._getApplicationWindow();
            try { appWindow.location; }
            catch (e) { 
                // when reloading, we may be pointing at an old window (Perm Denied)
                setTimeout(fnBind(function() {
                    self.loadSuiteFrame();
                }, this), 50);
                return;
            }

            // TODO(simon): This gets things working on Firefox 4, but's not an ideal solution
            window.setTimeout(function() {
              selenium = Selenium.createForWindow(appWindow);
              self._registerCommandHandlers();
              self.loadSuiteFrame();
            }, 250);
            return;
        }
        self.controlPanel.setHighlightOption();
        var testSuiteName = self.controlPanel.getTestSuiteName();
        if (testSuiteName) {
            suiteFrame.load(testSuiteName, function() {setTimeout(fnBind(self._onloadTestSuite, self), 50)} );
            selenium.browserbot.baseUrl = absolutify(testSuiteName, window.location.href);
        }
        // DGF or should we use the old default?
        // selenium.browserbot.baseUrl = window.location.href;
        if (self.controlPanel.getBaseUrl()) {
            selenium.browserbot.baseUrl = self.controlPanel.getBaseUrl();
        }
    },

    _getApplicationWindow: function () {
        if (this.controlPanel.isMultiWindowMode()) {
            return this._getSeparateApplicationWindow();
        }
        return sel$('selenium_myiframe').contentWindow;
    },

    _getSeparateApplicationWindow: function () {
        if (this.appWindow == null) {
            this.appWindow = openSeparateApplicationWindow('TestRunner-splash.html', this.controlPanel.isAutomatedRun());
        }
        return this.appWindow;
    },

    _onloadTestSuite:function () {
        suiteFrame = new HtmlTestSuiteFrame(getSuiteFrame());
        if (! this.getTestSuite().isAvailable()) {
            return;
        }
        if (this.controlPanel.isAutomatedRun()) {
            this.startTestSuite();
        } else if (this.controlPanel.getAutoUrl()) {
            //todo what is the autourl doing, left to check it out
            addLoadListener(this._getApplicationWindow(), fnBind(this._startSingleTest, this));
            this._getApplicationWindow().src = this.controlPanel.getAutoUrl();
        } else {
            var testCaseLoaded = fnBind(function(){this.testCaseLoaded=true;},this);
            var testNumber = 0;
            if (this.controlPanel.getTestNumber() != null){
                var testNumber = this.controlPanel.getTestNumber() - 1; 
            }
            this.getTestSuite().getSuiteRows()[testNumber].loadTestCase(testCaseLoaded);
        }
    },

    _startSingleTest:function () {
        removeLoadListener(getApplicationWindow(), fnBind(this._startSingleTest, this));
        var singleTestName = this.controlPanel.getSingleTestName();
        testFrame.load(singleTestName, fnBind(this.startTest, this));
    },

    _registerCommandHandlers: function () {
        this.commandFactory = new CommandHandlerFactory();
        this.commandFactory.registerAll(selenium);
    },

    startTestSuite: function() {
        this.controlPanel.reset();
        this.metrics.resetMetrics();
        this.getTestSuite().reset();
        this.runAllTests = true;
        this.runNextTest();
    },

    runNextTest: function () {
        this.getTestSuite().updateSuiteWithResultOfPreviousTest();
        if (!this.runAllTests) {
            return;
        }
        this.getTestSuite().runNextTestInSuite();
    },

    startTest: function () {
        this.controlPanel.reset();
        testFrame.scrollToTop();
        //todo: move testFailed and storedVars to TestCase
        this.testFailed = false;
        storedVars = new Object();
        storedVars.nbsp = String.fromCharCode(160);
        storedVars.space = ' ';
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

var runInterval = 0;

/** SeleniumFrame encapsulates an iframe element */
var SeleniumFrame = classCreate();
objectExtend(SeleniumFrame.prototype, {

    initialize : function(frame) {
        this.frame = frame;
        addLoadListener(this.frame, fnBind(this._handleLoad, this));
    },

    getWindow : function() {
        return this.frame.contentWindow;
    },

    getDocument : function() {
        return this.frame.contentWindow.document;
    },

    _handleLoad: function() {
        this._attachStylesheet();
        this._onLoad();
        if (this.loadCallback) {
            this.loadCallback();
        }
    },

    _attachStylesheet: function() {
        var d = this.getDocument();
        var head = d.getElementsByTagName('head').item(0);
        var styleLink = d.createElement("link");
        styleLink.rel = "stylesheet";
        styleLink.type = "text/css";
        if (browserVersion && browserVersion.isChrome) {
            // DGF We have to play a clever trick to get the right absolute path.
            // This trick works on most browsers, (not IE), but is only needed in
            // chrome
            var tempLink = window.document.createElement("link");
            tempLink.href = "selenium-test.css"; // this will become an absolute href
            styleLink.href = tempLink.href;
        } else {
            // this works in every browser (except Firefox in chrome mode)
            var styleSheetPath = window.location.pathname.replace(/[^\/\\]+$/, "selenium-test.css");
            if (browserVersion.isIE && window.location.protocol == "file:") {
                styleSheetPath = "file:///" + styleSheetPath;
            }
            styleLink.href = styleSheetPath;
        }
        // DGF You're only going to see this log message if you set defaultLogLevel=debug
        LOG.debug("styleLink.href="+styleLink.href);
        head.appendChild(styleLink);
    },

    _onLoad: function() {
    },

    scrollToTop : function() {
        this.frame.contentWindow.scrollTo(0, 0);
    },

    _setLocation: function(location) {
        var isChrome = browserVersion.isChrome || false;
        var isHTA = browserVersion.isHTA || false;
        // DGF TODO multiWindow
        location += (location.indexOf("?") == -1 ? "?" : "&");
        location += "thisIsChrome=" + isChrome + "&thisIsHTA=" + isHTA; 
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

/** HtmlTestSuiteFrame - encapsulates the suite iframe element */
var HtmlTestSuiteFrame = classCreate();
objectExtend(HtmlTestSuiteFrame.prototype, SeleniumFrame.prototype);
objectExtend(HtmlTestSuiteFrame.prototype, {

    getCurrentTestSuite: function() {
        if (!this.currentTestSuite) {
            this.currentTestSuite = new HtmlTestSuite(this.getDocument());
        }
        return this.currentTestSuite;
    }

});

/** HtmlTestFrame - encapsulates the test-case iframe element */
var HtmlTestFrame = classCreate();
objectExtend(HtmlTestFrame.prototype, SeleniumFrame.prototype);
objectExtend(HtmlTestFrame.prototype, {

    _onLoad: function() {
        this.currentTestCase = new HtmlTestCase(this.getWindow(), htmlTestRunner.getTestSuite().getCurrentRow());
    },

    getCurrentTestCase: function() {
        return this.currentTestCase;
    }

});

function onSeleniumLoad() {
    suiteFrame = new HtmlTestSuiteFrame(getSuiteFrame());
    testFrame = new HtmlTestFrame(getTestFrame());
    htmlTestRunner = new HtmlTestRunner();
}

var suiteFrame;
var testFrame;

function getSuiteFrame() {
    var f = sel$('testSuiteFrame');
    if (f == null) {
        f = top;
        // proxyInjection mode does not set selenium_myiframe
    }
    return f;
}

function getTestFrame() {
    var f = sel$('testFrame');
    if (f == null) {
        f = top;
        // proxyInjection mode does not set selenium_myiframe
    }
    return f;
}

var HtmlTestRunnerControlPanel = classCreate();
objectExtend(HtmlTestRunnerControlPanel.prototype, URLConfiguration.prototype);
objectExtend(HtmlTestRunnerControlPanel.prototype, {
    initialize: function() {
        this._acquireQueryString();

        this.runInterval = 0;

        this.highlightOption = sel$('highlightOption');
        this.pauseButton = sel$('pauseTest');
        this.stepButton = sel$('stepTest');

        this.highlightOption.onclick = fnBindAsEventListener((function() {
            this.setHighlightOption();
        }), this);
        this.pauseButton.onclick = fnBindAsEventListener(this.pauseCurrentTest, this);
        this.stepButton.onclick = fnBindAsEventListener(this.stepCurrentTest, this);


        this.speedController = new Control.Slider('speedHandle', 'speedTrack', {
            range: $R(0, 1000),
            onSlide: fnBindAsEventListener(this.setRunInterval, this),
            onChange: fnBindAsEventListener(this.setRunInterval, this)
        });

        this._parseQueryParameter();
    },

    setHighlightOption: function () {
        var isHighlight = this.highlightOption.checked;
        selenium.browserbot.setShouldHighlightElement(isHighlight);
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
        this.pauseButton.className = "cssPauseTest";
        this.pauseButton.onclick = fnBindAsEventListener(this.pauseCurrentTest, this);
    },

    _switchPauseButtonToContinue: function() {
        sel$('stepTest').disabled = false;
        this.pauseButton.className = "cssContinueTest";
        this.pauseButton.onclick = fnBindAsEventListener(this.continueCurrentTest, this);
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

    getTestNumber: function() {
        return this._getQueryParameter("testNumber");
    },

    getSingleTestName: function() {
        return this._getQueryParameter("singletest");
    },

    getAutoUrl: function() {
        return this._getQueryParameter("autoURL");
    },
    
    getDefaultLogLevel: function() {
        return this._getQueryParameter("defaultLogLevel");
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

var AbstractResultAwareRow = classCreate();
objectExtend(AbstractResultAwareRow.prototype, {

    initialize: function(trElement) {
        this.trElement = core.firefox.unwrap(trElement);
    },

    setStatus: function(status) {
        this.unselect();
        this.trElement.className = this.trElement.className.replace(/status_[a-z]+/, "");
        if (status) {
            addClassName(this.trElement, "status_" + status);
        }
    },

    select: function() {
        addClassName(this.trElement, "selected");
        safeScrollIntoView(this.trElement);
    },

    unselect: function() {
        removeClassName(this.trElement, "selected");
    },

    markPassed: function() {
        this.setStatus("passed");
    },

    markDone: function() {
        this.setStatus("done");
    },

    markFailed: function() {
        this.setStatus("failed");
    }

});

var TitleRow = classCreate();
objectExtend(TitleRow.prototype, AbstractResultAwareRow.prototype);
objectExtend(TitleRow.prototype, {

    initialize: function(trElement) {
        this.trElement = trElement;
        trElement.className = "title";
    }

});

var HtmlTestCaseRow = classCreate();
objectExtend(HtmlTestCaseRow.prototype, AbstractResultAwareRow.prototype);
objectExtend(HtmlTestCaseRow.prototype, {

    getCommand: function () {
        return new SeleniumCommand(getText(this.trElement.cells[0]),
                getText(this.trElement.cells[1]),
                getText(this.trElement.cells[2]),
                this.isBreakpoint());
    },

    markFailed: function(errorMsg) {
        AbstractResultAwareRow.prototype.markFailed.call(this, errorMsg);
        this.setMessage(errorMsg);
    },

    setMessage: function(message) {
        setText(this.trElement.cells[2], message);
    },

    reset: function() {
        this.setStatus(null);
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
            addClassName(this.trElement, "breakpoint");
        } else {
            this.trElement.isBreakpoint = undefined;
            removeClassName(this.trElement, "breakpoint");
        }
    },

    addBreakpointSupport: function() {
        elementSetStyle(this.trElement, {"cursor" : "pointer"});
        this.trElement.onclick = fnBindAsEventListener(function() {
            this.onClick();
        }, this);
    },

    isBreakpoint: function() {
        if (this.trElement.isBreakpoint == undefined || this.trElement.isBreakpoint == null) {
            return false
        }
        return this.trElement.isBreakpoint;
    }
});

var HtmlTestSuiteRow = classCreate();
objectExtend(HtmlTestSuiteRow.prototype, AbstractResultAwareRow.prototype);
objectExtend(HtmlTestSuiteRow.prototype, {

    initialize: function(trElement, testFrame, htmlTestSuite) {
        this.trElement = trElement;
        this.testFrame = testFrame;
        this.htmlTestSuite = htmlTestSuite;
        this.link = core.firefox.unwrap(trElement.getElementsByTagName("a")[0]);
        this.link.onclick = fnBindAsEventListener(this._onClick, this);
    },

    reset: function() {
        this.setStatus(null);
    },

    _onClick: function() {
        this.loadTestCase(null);
        return false;
    },

    loadTestCase: function(onloadFunction) {
        this.htmlTestSuite.unselectCurrentRow();
        this.select();
        this.htmlTestSuite.currentRowInSuite = this.trElement.rowIndex - 1;
        // If the row has a stored results table, use that
        var resultsFromPreviousRun = this.trElement.cells[1];
        if (resultsFromPreviousRun) {
            // todo: delegate to TestFrame, e.g.
            //   this.testFrame.restoreTestCase(resultsFromPreviousRun.innerHTML);
            var testBody = this.testFrame.getDocument().body;
            testBody.innerHTML = resultsFromPreviousRun.innerHTML;
            this.testFrame._onLoad();
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

var HtmlTestSuite = classCreate();
objectExtend(HtmlTestSuite.prototype, {

    initialize: function(suiteDocument) {
        this.suiteDocument = suiteDocument;
        this.suiteRows = this._collectSuiteRows();
        var testTable = this.getTestTable();
        if (!testTable) return;
        this.titleRow = new TitleRow(testTable.rows[0]);
        this.reset();
    },

    reset: function() {
        this.failed = false;
        this.currentRowInSuite = -1;
        this.titleRow.setStatus(null);
        for (var i = 0; i < this.suiteRows.length; i++) {
            var row = this.suiteRows[i];
            row.reset();
        }
    },

    getSuiteRows: function() {
        return this.suiteRows;
    },

    getTestTable: function() {
        var tables = sel$A(this.suiteDocument.getElementsByTagName("table"));
        return tables[0];
    },

    isAvailable: function() {
        return this.getTestTable() != null;
    },

    _collectSuiteRows: function () {
        var result = [];
        var tables = sel$A(this.suiteDocument.getElementsByTagName("table"));
        var testTable = tables[0];
        if (!testTable) return;
        for (rowNum = 1; rowNum < testTable.rows.length; rowNum++) {
            var rowElement = testTable.rows[rowNum];
            result.push(new HtmlTestSuiteRow(rowElement, testFrame, this));
        }
        
        // process the unsuited rows as well
        for (var tableNum = 1; tableNum < sel$A(this.suiteDocument.getElementsByTagName("table")).length; tableNum++) {
            testTable = tables[tableNum];
            for (rowNum = 1; rowNum < testTable.rows.length; rowNum++) {
                var rowElement = testTable.rows[rowNum];
                new HtmlTestSuiteRow(rowElement, testFrame, this);
            }
        }
        return result;
    },

    getCurrentRow: function() {
        if (this.currentRowInSuite == -1) {
            return null;
        }
        return this.suiteRows[this.currentRowInSuite];
    },

    unselectCurrentRow: function() {
        var currentRow = this.getCurrentRow()
        if (currentRow) {
            currentRow.unselect();
        }
    },

    markFailed: function() {
        this.failed = true;
        this.titleRow.markFailed();
    },

    markDone: function() {
        if (!this.failed) {
            this.titleRow.markPassed();
        }
    },

    _startCurrentTestCase: function() {
        this.getCurrentRow().loadTestCase(fnBind(htmlTestRunner.startTest, htmlTestRunner));
    },

    _onTestSuiteComplete: function() {
        this.markDone();
        new SeleniumTestResult(this.failed, this.getTestTable()).post();
    },

    updateSuiteWithResultOfPreviousTest: function() {
        if (this.currentRowInSuite >= 0) {
            this.getCurrentRow().saveTestResults();
        }
    },

    runNextTestInSuite: function() {
        this.currentRowInSuite++;

        // If we are done with all of the tests, set the title bar as pass or fail
        if (this.currentRowInSuite >= this.suiteRows.length) {
            this._onTestSuiteComplete();
        } else {
            this._startCurrentTestCase();
        }
    }



});

var SeleniumTestResult = classCreate();
objectExtend(SeleniumTestResult.prototype, {

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
        form.target = "selenium_myiframe";

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

        form.createHiddenField("numTestTotal", rowNum-1);

        // Add HTML for the suite itself
        form.createHiddenField("suite", this.suiteTable.parentNode.innerHTML);

        var logMessages = [];
        while (LOG.pendingMessages.length > 0) {
            var msg = LOG.pendingMessages.shift();
            logMessages.push(msg.type);
            logMessages.push(": ");
            logMessages.push(msg.msg);
            logMessages.push('\n');
        }
        var logOutput = logMessages.join("");
        form.createHiddenField("log", logOutput);

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
        
        // DGF get CSS
        var styles = "";
        try {
            var styleSheetPath = window.location.pathname.replace(/[^\/\\]+$/, "selenium-test.css");
            if (window.location.protocol == "file:") {
                var stylesFile = objFSO.OpenTextFile(styleSheetPath, 1);
                styles = stylesFile.ReadAll();
            } else {
                var xhr = XmlHttp.create();
                xhr.open("GET", styleSheetPath, false);
                xhr.send("");
                styles = xhr.responseText;
            }
        } catch (e) {}
        
        var scriptFile = objFSO.CreateTextFile(fileName);
        
        
        scriptFile.WriteLine("<html><head><title>Test suite results</title><style>");
        scriptFile.WriteLine(styles);
        scriptFile.WriteLine("</style>");
        scriptFile.WriteLine("<body>\n<h1>Test suite results</h1>" +
             "\n\n<table>\n<tr>\n<td>result:</td>\n<td>" + inputs["result"] + "</td>\n" +
             "</tr>\n<tr>\n<td>totalTime:</td>\n<td>" + inputs["totalTime"] + "</td>\n</tr>\n" +
             "<tr>\n<td>numTestTotal:</td>\n<td>" + inputs["numTestTotal"] + "</td>\n</tr>\n" +
             "<tr>\n<td>numTestPasses:</td>\n<td>" + inputs["numTestPasses"] + "</td>\n</tr>\n" +
             "<tr>\n<td>numTestFailures:</td>\n<td>" + inputs["numTestFailures"] + "</td>\n</tr>\n" +
             "<tr>\n<td>numCommandPasses:</td>\n<td>" + inputs["numCommandPasses"] + "</td>\n</tr>\n" +
             "<tr>\n<td>numCommandFailures:</td>\n<td>" + inputs["numCommandFailures"] + "</td>\n</tr>\n" +
             "<tr>\n<td>numCommandErrors:</td>\n<td>" + inputs["numCommandErrors"] + "</td>\n</tr>\n" +
             "<tr>\n<td>" + inputs["suite"] + "</td>\n<td>&nbsp;</td>\n</tr></table><table>");
        var testNum = inputs["numTestTotal"];
        
        for (var rowNum = 1; rowNum <= testNum; rowNum++) {
            scriptFile.WriteLine("<tr>\n<td>" + inputs["testTable." + rowNum] + "</td>\n<td>&nbsp;</td>\n</tr>");
        }
        scriptFile.WriteLine("</table><pre>");
        var log = inputs["log"];
        log=log.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;").replace(/'/gm,"&apos;");
        scriptFile.WriteLine(log);
        scriptFile.WriteLine("</pre></body></html>");
        scriptFile.Close();
    }
});

/** HtmlTestCase encapsulates an HTML test document */
var HtmlTestCase = classCreate();
objectExtend(HtmlTestCase.prototype, {

    initialize: function(testWindow, htmlTestSuiteRow) {
        if (testWindow == null) {
            throw "testWindow should not be null";
        }
        if (htmlTestSuiteRow == null) {
            throw "htmlTestSuiteRow should not be null";
        }
        this.testWindow = testWindow;
        this.testDocument = testWindow.document;
        this.pathname = "'unknown'";
        try {
            if (this.testWindow.location) {
                this.pathname = this.testWindow.location.pathname;
            }
        } catch (e) {}
            
        this.htmlTestSuiteRow = htmlTestSuiteRow;
        this.headerRow = new TitleRow(this.testDocument.getElementsByTagName("tr")[0]);
        this.commandRows = this._collectCommandRows();
        this.nextCommandRowIndex = 0;
        this._addBreakpointSupport();
    },

    _collectCommandRows: function () {
        var commandRows = [];
        var tables = sel$A(this.testDocument.getElementsByTagName("table"));
        var self = this;
        for (var i = 0; i < tables.length; i++) {
            var table = tables[i];
            var tableRows = sel$A(table.rows);
            for (var j = 0; j < tableRows.length; j++) {
                var candidateRow = tableRows[j];
                if (self.isCommandRow(candidateRow)) {
                    commandRows.push(new HtmlTestCaseRow(candidateRow));
                }
            }
        }
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

        this.setStatus('');
        for (var i = 0; i < this.commandRows.length; i++) {
            var row = this.commandRows[i];
            row.reset();
        }

        // remove any additional fake "error" row added to the end of the document
        var errorElement = this.testDocument.getElementById('error');
        if (errorElement) {
            errorElement.parentNode.removeChild(errorElement);
        }
    },

    getCommandRows: function () {
        return this.commandRows;
    },

    setStatus: function(status) {
        this.headerRow.setStatus(status);
    },

    markFailed: function() {
        this.setStatus("failed");
        this.htmlTestSuiteRow.markFailed();
    },

    markPassed: function() {
        this.setStatus("passed");
        this.htmlTestSuiteRow.markPassed();
    },

    addErrorMessage: function(errorMsg, currentRow) {
        errorMsg = errorMsg.replace(/ /g, String.fromCharCode(160)).replace("\n", '\\n');
        if (currentRow) {
            currentRow.markFailed(errorMsg);
        } else {
            var errorElement = this.testDocument.createElement("p");
            errorElement.id = "error";
            setText(errorElement, errorMsg);
            this.testDocument.body.appendChild(errorElement);
            errorElement.className = "status_failed";
        }
    },

    _addBreakpointSupport: function() {
        for (var i = 0; i < this.commandRows.length; i++) {
            var row = this.commandRows[i];
            row.addBreakpointSupport();
        }
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


var Metrics = classCreate();
objectExtend(Metrics.prototype, {
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
        setText(sel$('commandPasses'), this.numCommandPasses);
        setText(sel$('commandFailures'), this.numCommandFailures);
        setText(sel$('commandErrors'), this.numCommandErrors);
        setText(sel$('testRuns'), this.numTestPasses + this.numTestFailures);
        setText(sel$('testFailures'), this.numTestFailures);

        this.currentTime = new Date().getTime();

        var timeDiff = this.currentTime - this.startTime;
        var totalSecs = Math.floor(timeDiff / 1000);

        var minutes = Math.floor(totalSecs / 60);
        var seconds = totalSecs % 60;

        setText(sel$('elapsedTime'), this._pad(minutes) + ":" + this._pad(seconds));
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

var HtmlRunnerCommandFactory = classCreate();
objectExtend(HtmlRunnerCommandFactory.prototype, {

    initialize: function(seleniumCommandFactory, testLoop) {
        this.seleniumCommandFactory = seleniumCommandFactory;
        this.testLoop = testLoop;
        this.handlers = {};
        //todo: register commands
    },

    getCommandHandler: function(command) {
        if (this.handlers[command]) {
            return this.handlers[command];
        }
        return this.seleniumCommandFactory.getCommandHandler(command);
    }

});

var HtmlRunnerTestLoop = classCreate();
objectExtend(HtmlRunnerTestLoop.prototype, new TestLoop());
objectExtend(HtmlRunnerTestLoop.prototype, {
    initialize: function(htmlTestCase, metrics, seleniumCommandFactory) {

        this.commandFactory = new HtmlRunnerCommandFactory(seleniumCommandFactory, this);
        this.metrics = metrics;

        this.htmlTestCase = htmlTestCase;
        LOG.info("Starting test " + htmlTestCase.pathname);

        this.currentRow = null;
        this.currentRowIndex = 0;

        // used for selenium tests in javascript
        this.currentItem = null;
        this.commandAgenda = new Array();
        this.expectedFailure = null;
        this.expectedFailureType = null;

        this.htmlTestCase.reset();
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
        sel$('pauseTest').disabled = false;
        this.currentRow.select();
        this.metrics.printMetrics();
    },

    commandComplete : function(result) {
        this._checkExpectedFailure(result);
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

    _checkExpectedFailure : function(result) {
        if (this.expectedFailure != null) {
            if (this.expectedFailureJustSet) {
                this.expectedFailureJustSet = false;
                return;
            }
            if (!result.failed) {
                result.passed = false;
                result.failed = true;
                result.failureMessage = "Expected " + this.expectedFailureType + " did not occur.";
            } else {
                if (PatternMatcher.matches(this.expectedFailure, result.failureMessage)) {
                    var failureType = result.error ? "error" : "failure";
                    if (failureType == this.expectedFailureType) {
                        result.failed = false;
                        result.passed = true;
                    } else {
                        result.failed = true;
                        result.failureMessage = "Expected "+this.expectedFailureType+", but "+failureType+" occurred instead";
                    }
                } else {
                    result.failed = true;
                    result.failureMessage = "Expected " + this.expectedFailureType + " message '" + this.expectedFailure
                                            + "' but was '" + result.failureMessage + "'";
                }
            }
            this.expectedFailure = null;
            this.expectedFailureType = null;
        }
    },

    commandError : function(errorMessage) {
        var tempResult = {};
        tempResult.passed = false;
        tempResult.failed = true;
        tempResult.error = true;
        tempResult.failureMessage = errorMessage;
        this._checkExpectedFailure(tempResult);
        if (tempResult.passed) {
            this.currentRow.markDone();
            return true;
        }
        errorMessage = tempResult.failureMessage;
        this.metrics.numCommandErrors += 1;
        this._recordFailure(errorMessage);
    },

    _recordFailure : function(errorMsg) {
        LOG.warn("currentTest.recordFailure: " + errorMsg);
        htmlTestRunner.markFailed();
        this.htmlTestCase.addErrorMessage(errorMsg, this.currentRow);
    },

    testComplete : function() {
        sel$('pauseTest').disabled = true;
        sel$('stepTest').disabled = true;
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

Selenium.prototype.doPause = function(waitTime) {
    /** Wait for the specified amount of time (in milliseconds)
     * @param waitTime the amount of time to sleep (in milliseconds)
     */
    // todo: should not refer to currentTest directly
    currentTest.pauseInterval = waitTime;
};

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

/*
 * doSetSpeed and getSpeed are already defined in selenium-api.js,
 * so we're defining these functions in a tricky way so that doc.js doesn't
 * try to read API doc from the function definitions here.
 */
Selenium.prototype._doSetSpeed = function(value) {
    var milliseconds = parseInt(value);
    if (milliseconds < 0) milliseconds = 0;
    htmlTestRunner.controlPanel.speedController.setValue(milliseconds);
    htmlTestRunner.controlPanel.setRunInterval(milliseconds);
}
Selenium.prototype.doSetSpeed = Selenium.prototype._doSetSpeed;

Selenium.prototype._getSpeed = function() {
    return htmlTestRunner.controlPanel.runInterval;
}
Selenium.prototype.getSpeed = Selenium.prototype._getSpeed;

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

Selenium.prototype.assertFailureOnNext = function(message) {
    /**
     * Tell Selenium to expect a failure on the next command execution. 
     * @param message The failure message we should expect.  This command will fail if the wrong failure message appears.
     */
    if (!message) {
        throw new SeleniumError("Message must be provided");
    }

    currentTest.expectedFailure = message;
    currentTest.expectedFailureType = "failure";
    currentTest.expectedFailureJustSet = true;
};

Selenium.prototype.assertErrorOnNext = function(message) {
    /**
     * Tell Selenium to expect an error on the next command execution. 
     * @param message The error message we should expect.  This command will fail if the wrong error message appears.
     */
     // This command temporarily installs a CommandFactory that generates
     // CommandHandlers that expect an error.
    if (!message) {
        throw new SeleniumError("Message must be provided");
    }

    currentTest.expectedFailure = message;
    currentTest.expectedFailureType = "error";
    currentTest.expectedFailureJustSet = true;
};

