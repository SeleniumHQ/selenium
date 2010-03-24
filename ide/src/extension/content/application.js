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
    this.showDeveloperTools = false;
    this.options = Preferences.load();
    this.baseURLHistory = new StoredHistory("baseURLHistory", 20);
    this.testCase = null;
    this.testSuite = null;
    this.formats = null;
    this.currentFormat = null;
    this.clipboardFormat = null;
    this.recentTestSuites = new StoredHistory("recentTestSuites");
    this.recentTestCases = new StoredHistory("recentTestCases");
}

Application.prototype = {
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
        this.baseURLHistory.add(baseURL);
        if (this.testCase) {
            this.testCase.setBaseURL(baseURL);
        }
        this.notify("baseURLChanged");
    },

    getBaseURLHistory: function() {
        return this.baseURLHistory.list();
    },
    
    //get the "showDeveloperTools" state
    getShowDeveloperTools: function(){
    	return this.showDeveloperTools;
    },
    
    //set the "showDeveloperTools" state by the given state "show"
    setShowDeveloperTools: function(show){
    	this.showDeveloperTools = show == 'true' ? true : false;
    	this.notify("showDevToolsChanged", this.showDeveloperTools);
    },

    initOptions: function() {
        if (this.options.rememberBaseURL == 'true' && this.options.baseURL != null){
            this.setBaseURL(this.options.baseURL);
        }
        //initializing the reload button
        this.setShowDeveloperTools(this.options.showDeveloperTools);
        this.setOptions(this.options); // to notify optionsChanged to views
    },
    
    getOptions: function(options) {
        return this.options;
    },

    setOptions: function(options) {
        this.options = options;
        this.setShowDeveloperTools(this.options.showDeveloperTools+"");
        this.formats = new FormatCollection(options);
        this.currentFormat = this.formats.selectFormat(options.selectedFormat || null);
        this.clipboardFormat = this.formats.selectFormat(options.clipboardFormat || null);
        this.notify("optionsChanged", options);
    },

    setCurrentFormat: function(format) {
        this.currentFormat = format;
        this.options.selectedFormat = format.id;
        Preferences.save(this.options, 'selectedFormat');
        this.notify("currentFormatChanged", format);
    },

    getCurrentFormat: function() {
        return this.currentFormat;
    },

    isPlayable: function() {
        return this.getCurrentFormat().getFormatter().playable;
    },

    setClipboardFormat: function(format) {
        this.clipboardFormat = format;
        this.options.clipboardFormat = format.id;
        Preferences.save(this.options, 'clipboardFormat');
        this.notify("clipboardFormatChanged", format);
    },

    getClipboardFormat: function() {
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
        if (this.testSuite) {
            this.notify("testSuiteUnloaded", this.testSuite);
        }
        this.testSuite = testSuite;
        this.notify("testSuiteChanged", testSuite);
    },
    
    getTestSuite: function() {
        return this.testSuite;
    },

    addRecentTestSuite: function(testSuite) {
        this.recentTestSuites.add(testSuite.file.path);
    },

    setTestCase: function(testCase) {
        if (this.testCase) {
            if (testCase == this.testCase) return;
            this.notify("testCaseUnloaded", this.testCase);
        }
        this.testCase = testCase;
        if (testCase.baseURL) {
            this.setBaseURL(testCase.baseURL);
        } else {
            //testCase.setBaseURL(this.baseURL);
        }
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
    
    /**
     * Adds a testcase to the current suite
     */
    addTestCase: function(path) {
        var file = null;
        if (path) {
            file = FileUtils.getFile(path);
        }
        if (this._loadTestCase(file)) {
            this.testSuite.addTestCaseFromContent(this.getTestCase());
            this.setTestCase(this.getTestCase());
        }
    },

    loadTestCaseWithNewSuite: function(path) {
        var file = null;
        if (path) {
            file = FileUtils.getFile(path);
        }
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
            this._loadTestCase(testCase.getFile(), function(test) {
                    test.title = testCase.getTitle(); // load title from suite
                    testCase.content = test;
                });
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
                this.recentTestCases.add(testCase.file.path);
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
        this._saveTestSuiteAs(function(testSuite) {
                return testSuite.save(false);
            });
    },

    saveNewTestSuite: function() {
        this._saveTestSuiteAs(function(testSuite) {
                return testSuite.save(true);
            });
    },

    _saveTestSuiteAs: function(handler) {
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
            if (handler(this.getTestSuite())) {
                this.addRecentTestSuite(this.getTestSuite());
            }
        }
    },

    saveTestCase: function() {
        var result = this.getCurrentFormat().save(this.getTestCase());
        if (result) {
            this.recentTestCases.add(this.getTestCase().file.path);
        }
        return result;
    },

    saveNewTestCase: function() {
        var result = this.getCurrentFormat().saveAsNew(this.getTestCase());
        if (result) {
            this.recentTestCases.add(this.getTestCase().file.path);
        }
    }
}

Application.prototype.log = Application.log = new Log("Application");
observable(Application);
