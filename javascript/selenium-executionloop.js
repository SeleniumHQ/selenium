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
 */

SELENIUM_PROCESS_CONTINUE = "continue";
SELENIUM_PROCESS_WAIT = "wait";
SELENIUM_PROCESS_PAUSED = "paused";
SELENIUM_PROCESS_COMPLETE = "complete";

function TestLoop(commandFactory) {
    this.commandFactory = commandFactory;
    this.commandInterval = 0;

    this.processState == SELENIUM_PROCESS_CONTINUE;

    var self = this;

    this.start = function() {
        self.continueCurrentTest();
    }

    this.continueCurrentTest = function() {
        this.processState = self.executeNextCommand();
        if (this.processState == SELENIUM_PROCESS_WAIT) {
            //window.setTimeout("continueCurrentTest()", 500);
            selenium.callOnNextPageLoad(function() {eval("testLoop.continueCurrentTest()")});
            return;
        }
        if (this.processState == SELENIUM_PROCESS_PAUSED) {
            return; // Will re-enter this loop on reload.
        }
        if (this.processState != SELENIUM_PROCESS_COMPLETE) {
            // Continue processing
            if (this.commandInterval >= 0) {
                window.setTimeout("testLoop.continueCurrentTest();", this.commandInterval);
            }
            return;
        }

        this.onTestComplete();
    }

    this.executeNextCommand = function() {

        var command = this.nextCommand();
        if (!command) return SELENIUM_PROCESS_COMPLETE;

        handler = this.commandFactory.getCommandHandler(command.command);

        // Make the current row blue
        this.beginCommand();

        if(handler == null) {
            this.commandError("Unknown command", ERROR);
            return SELENIUM_PROCESS_COMPLETE;
        }
        else {
            try {
                var processNext = handler.executor.call(selenium, command.target, command.value);
                if (handler.type == "assert") {
                    this.assertionPassed();
                } else {
                    this.actionOK();
                }

                return processNext;
            } catch (e) {
                if (e.isJsUnitException && handler.type == "assert") {
                    this.assertionFailed(e.jsUnitMessage);
                } else {
                    this.commandError(e.message);
                }
            }
        }
    }
}
TestLoop.prototype.nextCommand = function(){};

TestLoop.prototype.beginCommand = function(){};

TestLoop.prototype.commandError = function(){};

TestLoop.prototype.actionOK = function(){};

TestLoop.prototype.assertionPassed = function(){}

TestLoop.prototype.assertionFailed = function(){};

TestLoop.prototype.onTestComplete = function(){};


function SeleniumCommand(command, target, value) {
    this.command = command;
    this.target = target;
    this.value = value;
}