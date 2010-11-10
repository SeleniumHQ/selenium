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

var SuiteTreeView = classCreate();
objectExtend(SuiteTreeView.prototype, XulUtils.TreeViewHelper.prototype);
objectExtend(SuiteTreeView.prototype, {
        initialize: function(editor, tree) {
            this.log = new Log("SuiteTreeView");
            XulUtils.TreeViewHelper.prototype.initialize.call(this, tree);
            this.editor = editor;
            this.rowCount = 0;
            this.currentTestCaseIndex = -1;
            var self = this;
            tree.addEventListener("dblclick", function(event) {
                    var testCase = self.getSelectedTestCase();
                    if (testCase) editor.app.showTestCaseFromSuite(testCase);
                }, false);
            editor.app.addObserver({
                    _testCaseObserver: {
                        modifiedStateUpdated: function() {
                            self.treebox.invalidateRow(self.currentTestCaseIndex);
                        }
                    },
                    
                    _testSuiteObserver: {
                        testCaseAdded: function() {
                            self.refresh();
                        },
                        testCaseRemoved: function() {
                            self.refresh();
                        },
                        //Samit: Fix: Update correctly when test cases are moved
                        testCaseMoved: function(testCase, fromIndex, toIndex) {
                            var start = fromIndex;
                            var end = toIndex;
                            if (start > end) {
                                start = toIndex;
                                end = fromIndex;
                            }
                            //Handle moves where position of the current test case is affected
                            if (self.currentTestCaseIndex >= start && self.currentTestCaseIndex <= end) {
                                var tests = self.getTestSuite().tests;
                                for (var i = start; i <= end; i++) {
                                    if (tests[i].content && tests[i].content == self.currentTestCase) {
                                        self.currentTestCaseIndex = i;
                                        break;
                                    }
                                }
                            }
                            self.rowsUpdated(start, end);
                        }
                    },

                    testCaseChanged: function(testCase) {
                        testCase.addObserver(this._testCaseObserver);
                        var tests = self.getTestSuite().tests;
                        for (var i = 0; i < tests.length; i++) {
                            if (tests[i].content && tests[i].content == testCase) {
                                self.currentTestCase = testCase;
                                self.currentTestCaseIndex = i;
                                self.rowUpdated(self.currentTestCaseIndex);
                                self.log.debug("testCaseLoaded: i=" + i);
                                break;
                            }
                        }
                        //self.refresh();
                    },
                        
                    testCaseUnloaded: function(testCase) {
                        testCase.removeObserver(this._testCaseObserver);
                        var index = self.currentTestCaseIndex;
                        self.currentTestCaseIndex = -1;
                        if (index >= 0) {
                            self.rowUpdated(index);
                        }
                    },

                    testSuiteChanged: function(testSuite) {
                        testSuite.addObserver(this._testSuiteObserver);
                    },

                    testSuiteUnloaded: function(testSuite) {
                        testSuite.removeObserver(this._testSuiteObserver);
                    }
                });
            var controller = {
                supportsCommand : function(cmd) {
                    switch (cmd) {
                        case "cmd_delete":
                        return true;
                    default:
                        return false;
                    }
                },
                isCommandEnabled : function(cmd){
                    self.log.debug("isCommandEnabled " + cmd);
                    switch (cmd) {
                    case "cmd_delete":
                        return self.selection.getRangeCount() > 0;
                    default:
                        return false;
                    }
                },
                doCommand : function(cmd) {
                    switch (cmd) {
                    case "cmd_delete": self.deleteSelected(); break;
                    }
                },
                onEvent : function(evt) {}
            };
            tree.controllers.appendController(controller);
        },

        getSelectedTestCase: function() {
            return this.getTestSuite().tests[this.tree.currentIndex];
        },
            
        getCurrentTestCase: function() {
            return this.getTestSuite().tests[this.currentTestCaseIndex];
        },
            
        getTestSuite: function() {
            return this.editor.app.getTestSuite();
        },
            
        refresh: function() {
            this.log.debug("refresh: old rowCount=" + this.rowCount);
            var length = this.getTestSuite().tests.length;
            this.treebox.rowCountChanged(0, -this.rowCount);
            this.treebox.rowCountChanged(0, length);
            this.rowCount = length;
            this.log.debug("refresh: new rowCount=" + this.rowCount);
        },
            
        currentRowUpdated: function() {
            this.rowUpdated(this.currentTestCaseIndex);
        },

        editProperties: function() {
            var testCase = this.getSelectedTestCase();
            var self = this;
            if (testCase) {
                window.openDialog('chrome://selenium-ide/content/testCaseProperties.xul', 'testCaseProperties', 'chrome,modal', testCase, function() {
                        self.treebox.invalidateRow(self.currentTestCaseIndex);
                    });
            }
        },
            
        deleteSelected: function() {
            this.getTestSuite().remove(this.getSelectedTestCase());
        },

        //
        // nsITreeView interfaces
        //
        getCellText : function(row, column){
            var testCase = this.getTestSuite().tests[row];
            var text = testCase.getTitle();
            if (testCase.content && testCase.content.modified) {
                text += " *";
            }
            return text;
        },
        getRowProperties: function(row, props) {
            if (this.selection.isSelected(row)) return;
            var testCase = this.getTestSuite().tests[row];
            if (testCase.testResult) {
                if (testCase.testResult == 'passed') {
                    props.AppendElement(XulUtils.atomService.getAtom("commandPassed"));
                } else if (testCase.testResult == 'failed') {
                    props.AppendElement(XulUtils.atomService.getAtom("commandFailed"));
                }
            }
        },
        getCellProperties: function(row, col, props) {
            if (row == this.currentTestCaseIndex) {
                props.AppendElement(XulUtils.atomService.getAtom("currentTestCase"));
            }
        },

        getParentIndex: function(index){return -1;},

        getSourceIndexFromDrag: function () {
            try{
                var dragService = Cc["@mozilla.org/widget/dragservice;1"].
                               getService().QueryInterface(Ci.nsIDragService);
                var dragSession = dragService.getCurrentSession();
                var transfer = Cc["@mozilla.org/widget/transferable;1"].
                               createInstance(Ci.nsITransferable);

                transfer.addDataFlavor("text/unicode");
                dragSession.getData(transfer, 0);

                var dataObj = {};
                var len = {};
                var sourceIndex = -1;
                var out = {};

                transfer.getAnyTransferData(out, dataObj, len);

                if (dataObj.value) {
                    sourceIndex = dataObj.value.QueryInterface(Ci.nsISupportsString).data;
                    sourceIndex = parseInt(sourceIndex.substring(0, len.value));
                }

                var start = new Object();
                var end = new Object();
                var numRanges = this.selection.getRangeCount();
                var n = 0;
                for (var t = 0; t < numRanges && n <=1; t++){
                    this.selection.getRangeAt(t,start,end);
                    for (var v = start.value; v <= end.value && n <=1; v++){
                       n++;
                    }
                }
                sourceIndex = n > 1 ? -1 : sourceIndex;
                
                return sourceIndex;

            }catch(e){
                new Log("DND").error("getSourceIndexFromDrag error: "+e);
            }
        },

        canDrop: function(targetIndex, orientation) {
                var sourceIndex = this.getSourceIndexFromDrag();

                return (sourceIndex != -1 &&
                        sourceIndex != targetIndex &&
                        sourceIndex != (targetIndex + orientation));
        },

        drop: function(dropIndex, orientation) {
            try{
               var sourceIndex = this.getSourceIndexFromDrag();

               if (sourceIndex != -1){

                   if (dropIndex > sourceIndex) {
                       if (orientation == Ci.nsITreeView.DROP_BEFORE)
                           dropIndex--;
                   }else{
                       if (orientation == Ci.nsITreeView.DROP_AFTER)
                           dropIndex++;
                   }

                   //Samit: Ref: Move is now part of the testSuite
                   this.getTestSuite().move(sourceIndex, dropIndex);

                   this.selection.clearSelection();
                   this.selection.select(dropIndex);
               }
           }catch(e){
               new Log("DND").error("drop error : "+e);
           }
        }
    });
