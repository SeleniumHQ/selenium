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
        //if there is a testCase with a base URL return it
        //if not, return the value of the baseURL value
        return this.testCase && this.testCase.baseURL ?
            this.testCase.baseURL : this.baseURL;
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
    
    initOptions: function() {
        if (this.options.rememberBaseURL == 'true' && this.options.baseURL != null) {
            this.setBaseURL(this.options.baseURL);
        }
        this.setOptions(this.options); // to notify optionsChanged to views
    },

    getBooleanOption: function(option) {
        if (this.options[option]){
            return this.options[option].toLowerCase() == 'true';
        }
        return false;
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

    userSetCurrentFormat: function(format) {
        //Samit: TODO: this whole concept of format changing needs to be thought through again
        //if the testcase is manually changed
        var edited = this.testCase.edited;
        //if the format is reversible (implements the "parse" method)
        //or if the testcase isn't changed manually by user: all be fine
        //if not, the format isn't changed

        if (this.currentFormat != format) {
            //if (!(this.currentFormat.isReversible && this.currentFormat.isReversible())){
                //prompt that user will lose changes
                if (this.getBooleanOption('disableFormatChangeMsg') || confirm(Editor.getString('format.switch.warn'))){
                    //user wants to take the risk
                    //change the current format
                    this.setCurrentFormat(format);
                }
            //}
        }
    },

    setCurrentFormat: function(format) {
         //sync the testcase with the data view
        this.notify("currentFormatChanging");
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
            testCase.setBaseURL(this.baseURL);
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
        if (path) {
		if (this._loadTestCase(FileUtils.getFile(path))) {
			this.testSuite.addTestCaseFromContent(this.getTestCase());
			this.setTestCase(this.getTestCase());
		}
        }else {
		//Samit: Enh: Allow multiple test cases to be added in one operation
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, "Select one or more test cases to add", nsIFilePicker.modeOpenMultiple);
		fp.appendFilters(nsIFilePicker.filterAll);
		if (fp.show() == nsIFilePicker.returnOK) {
			var files = fp.files;
			while (files.hasMoreElements()) {
				try {
					if (this._loadTestCase(files.getNext().QueryInterface(Components.interfaces.nsILocalFile))) {
					    this.testSuite.addTestCaseFromContent(this.getTestCase());
					    this.setTestCase(this.getTestCase());
					}
				}catch(error) {
                                    this.log.error("AddTestCase: "+error);
				}
			}
		}
	}
    },

    loadTestCaseWithNewSuite: function(path) {
        var file = null;
        if (path) {
            file = FileUtils.getFile(path);
        } else {
            //Samit: We are going to need the file to retry it as a test suite
            file = showFilePicker(window, "Select a File",
                    Components.interfaces.nsIFilePicker.modeOpen,
                    Format.TEST_CASE_DIRECTORY_PREF,
                                 function(fp) {
                                     return fp.file;
                                 });
        }
        if (file) {
            try {
                if (this._loadTestCase(file, null, true)) {
                    this.setTestCaseWithNewSuite(this.getTestCase());
                }
            } catch(errorCase) {
                //Samit: Enh: Try to handle the common error of trying to open a test suite
                try {
                    this.loadTestSuite(file.path, true);
                } catch(e) {
                    //Since this failed, show them the original testcase load error
                    alert("error loading test case: " + errorCase);
                }
            }
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
            try {
                this._loadTestCase(testCase.getFile(), function(test) {
                        test.title = testCase.getTitle(); // load title from suite
                        testCase.content = test;
                    }, true);
            } catch(error) {
                if (error.name && error.name == "NS_ERROR_FILE_NOT_FOUND") {
                    alert("The test case does not exist. You should probably remove it from the suite. The path specified is " + testCase.getFile().path );
                }else {
                    alert("error loading test case: " + error);
                }
            }
        }
    },

    _loadTestCase: function(file, testCaseHandler, noErrorAlert) {
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
            if (noErrorAlert) {   //Samit: Enh: allow error messages to be supressed, so caller can make intelligent ux decisions
                throw error;
            }
            alert("error loading test case: " + error);
            return false;
        }
    },

    loadTestSuite: function(path, noErrorAlert) {
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
                //Samit: Fix: Switch to the first testcase in the newly loaded suite
                if (testSuite.tests.length > 0) {
                    var testCase = testSuite.tests[0];
                    if (testCase) this.showTestCaseFromSuite(testCase);
                }
            }
        } catch (error) {
            if (noErrorAlert) {   //Samit: Enh: allow error messages to be supressed, so caller can make intelligent ux decisions
                throw error;
            }
            alert("error loading test suite: " + error);
        }
    },
    
    saveTestSuite: function(suppressTestCasePrompt) {
    	//Samit: Enh: Added suppressTestCasePrompt to allow saving test suite and test cases without a yes/no prompt for each test case
        return this._saveTestSuiteAs(function(testSuite) {
                return testSuite.save(false);
            }, suppressTestCasePrompt);
    },

    saveNewTestSuite: function(suppressTestCasePrompt) {
    	//Samit: Enh: Added suppressTestCasePrompt to allow saving test suite and test cases without a yes/no prompt for each test case
    	return this._saveTestSuiteAs(function(testSuite) {
                return testSuite.save(true);
            }, suppressTestCasePrompt);
    },

    _saveTestSuiteAs: function(handler, suppressTestCasePrompt) {
        this.log.debug("saveTestSuite");
        var cancelled = false;
        this.getTestSuite().tests.forEach(function(test) {
                if (cancelled) return;
                if (test.content && (test.content.modified || !test.filename)) {
                	//Samit: Enh: Added suppressTestCasePrompt to allow saving test suite and test cases without a yes/no prompt for each test case
                    if (suppressTestCasePrompt || confirm("The test case " + test.getTitle() + " is modified. Do you want to save this test case?")) {
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
                return true;
            }
        }
        return false;
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
};

Application.prototype.log = Application.log = new Log("Application");
observable(Application);
