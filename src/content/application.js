/*
 * Copyright 2005 Shinya Kasatani
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// shortcut
this.Preferences = SeleniumIDE.Preferences;

/*
 * A model that represents the state of the application.
 */
function Application() {
    this.baseURL = "";
    this.options = Preferences.load();
    this.baseURLHistory = Preferences.getArray("baseURLHistory");
    this.testCase = null;
    this.testSuite = null;
    this.formats = null;
    this.currentFormat = null;
    this.clipboardFormat = null;
}

Application.prototype = {
    clearOptions: function() {
        this.baseURLHistory = [];
    },
    
    saveState: function() {
        if (this.options.rememberBaseURL == 'true'){
            this.options.baseURL = this.baseURL;
            Preferences.save(this.options, 'baseURL');
        }
    },

    getBaseURL: function() {
        return this.baseURL;
    },

    setBaseURL: function(baseURL) {
        this.baseURL = baseURL;
        if (baseURL.length > 0) {
            this.baseURLHistory.delete(baseURL);
            this.baseURLHistory.unshift(baseURL);
            Preferences.setArray("baseURLHistory", this.baseURLHistory);
        }
        this.notify("baseURLChanged");
    },

    getBaseURLHistory: function() {
        return this.baseURLHistory;
    },

    initOptions: function() {
        if (this.options.rememberBaseURL == 'true' && this.options.baseURL != null){
            this.setBaseURL(this.options.baseURL);
        }
        this.setOptions(this.options); // to notify optionsChanged to views
    },
    
    getOptions: function(options) {
        return this.options;
    },

    setOptions: function(options) {
        this.options = options;
        this.formats = new FormatCollection(options);
        this.currentFormat = this.formats.selectFormat(options.selectedFormat || null);
        this.clipboardFormat = this.formats.selectFormat(options.clipboardFormat || null);
        this.notify("optionsChanged", options);
    },

    setCurrentFormat: function(format) {
        this.currentFormat = format;
        this.options.selectedFormat = format.id;
        Preferences.save(this.options, 'selectedFormat');
        this.setClipbaordFormat(format);
        this.notify("currentFormatChanged", format);
    },

    getCurrentFormat: function() {
        return this.currentFormat;
    },

    setClipboardFormat: function(format) {
        this.clipboardFormat = format;
        this.options.clipboardFormat = format.id;
        Preferences.save(this.options, 'clipboardFormat');
        this.notify("clipboardFormatChanged", format);
    },

    getClipbaordFormat: function() {
        return this.clipboardFormat;
    },

    getFormats: function() {
        return this.formats;
    },

    newTestSuite: function() {
        this.log.debug("newTestSuite");
        var testSuite = new TestSuite();
        var testCase = new TestCase();
        testSuite.addTestCaseFromContent(testCase);
        this.setTestSuite(testSuite);
        this.setTestCase(testCase);
    },

    setTestSuite: function(testSuite) {
        this.testSuite = testSuite;
        this.notify("testSuiteChanged");
    },
    
    getTestSuite: function() {
        return this.testSuite;
    },

    addRecentTestSuite: function(testSuite) {
        var recent = Preferences.getArray("recentTestSuites");
        var path = testSuite.file.path;
        recent.delete(path);
        recent.unshift(path);
        Preferences.setArray("recentTestSuites", recent);
    },

    setTestCase: function(testCase) {
        if (this.testCase) {
            if (testCase == this.testCase) return;
            this.notify("testCaseUnloaded", this.testCase);
        }
        this.testCase = testCase;
        this.notify("testCaseChanged", this.testCase);
    },

    getTestCase: function() {
        return this.testCase;
    },

    newTestCase: function() {
        var testCase = new TestCase(this.testSuite.generateNewTestCaseTitle());
        this.testSuite.addTestCaseFromContent(testCase);
        this.setTestCase(testCase);
    },

    loadTestCaseWithNewSuite: function(file) {
        if (this._loadTestCase(file)) {
            this.setTestCaseWithNewSuite(this.getTestCase());
        }
    },

    setTestCaseWithNewSuite: function(testCase) {
        var testSuite = new TestSuite();
        testSuite.addTestCaseFromContent(testCase);
        this.setTestSuite(testSuite);
        this.setTestCase(testCase);
    },
    
    // show specified TestSuite.TestCase object.
    showTestCaseFromSuite: function(testCase) {
        if (testCase.content) {
            this.setTestCase(testCase.content);
        } else {
            this._loadTestCase(testCase.getFile(), function(test) { testCase.content = test });
        }
    },

    _loadTestCase: function(file, testCaseHandler) {
        this.log.debug("loadTestCase");
        try {
            var testCase = null;
            if (file) {
                testCase = this.getCurrentFormat().loadFile(file, false);
            } else {
                testCase = this.getCurrentFormat().load();
            }
            if (testCase != null) {
                if (testCaseHandler) testCaseHandler(testCase);
                this.setTestCase(testCase);
                return true;
            }
            return false;
        } catch (error) {
            alert("error loading test case: " + error);
            return false;
        }
    },

    loadTestSuite: function(path) {
        this.log.debug("loadTestSuite");
        try {
            var testSuite = null;
            if (path) {
                testSuite = TestSuite.loadFile(FileUtils.getFile(path));
            } else {
                testSuite = TestSuite.load();
            }
            if (testSuite) {
                this.setTestSuite(testSuite);
                this.addRecentTestSuite(testSuite);
            }
        } catch (error) {
            alert("error loading test suite: " + error);
        }
    },
    
    saveTestSuite: function() {
        this.log.debug("saveTestSuite");
        var cancelled = false;
        this.getTestSuite().tests.forEach(function(test) {
                if (cancelled) return;
                if (test.content && test.content.modified) {
                    if (confirm("The test case is modified. Do you want to save this test case?")) {
                        if (!this.getCurrentFormat().save(test.content)) {
                            cancelled = true;
                        }
                    } else {
                        cancelled = true;
                    }
                }
            }, this);
        if (!cancelled) {
            if (this.getTestSuite().save()) {
                this.addRecentTestSuite(this.getTestSuite());
            }
        }
    },

    saveTestCase: function() {
        return this.getCurrentFormat().save(this.getTestCase());
    },

    saveNewTestCase: function() {
        return this.getCurrentFormat().saveAsNew(this.getTestCase());
    }
}

Application.prototype.log = Application.log = new Log("Application");
observable(Application);
