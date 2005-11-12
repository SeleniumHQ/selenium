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

SELENIUM_PROCESS_WAIT = "wait";

function TestLoop(commandFactory) {

    this.commandFactory = commandFactory;

    this.start = function() {
        selenium.reset();
        this.continueTest();
    };

    /**
     * Select the next command and continue the test.
     */
    this.continueTest = function() {
        if (! this.aborted) {
            this.currentCommand = this.nextCommand();
        }
        if (this.currentCommand) {
            // TODO: rename commandStarted to commandSelected, OR roll it into nextCommand
            this.commandStarted(this.currentCommand);
            this.resumeAfterDelay();
        } else {
            this.testComplete();
        }
    };
    
    /**
     * Pause, then execute the current command.
     */
    this.resumeAfterDelay = function() {

        // Get the command delay. If a pauseInterval is set, use it once
        // and reset it.  Otherwise, use the defined command-interval.
        var delay = this.pauseInterval || this.getCommandInterval();
        this.pauseInterval = undefined;

        if (delay < 0) {
            // Pause: enable the "next/continue" button
            this.pause();
        } else {
            window.setTimeout("testLoop.resume()", delay);
        }
    };

    /**
     * Select the next command and continue the test.
     */
    this.resume = function() {
        try {
            this.executeCurrentCommand();
            this.continueTestWhenConditionIsTrue();
        } catch (e) {
            this.handleCommandError(e);
            this.testComplete();
            return;
        }
    };

    /**
     * Execute the current command.  
     * 
     * The return value, if not null, should be a function which will be
     * used to determine when execution can continue.
     */
    this.executeCurrentCommand = function() {

        var command = this.currentCommand;
        LOG.info("Executing: |" + command.command + " | " + command.target + " | " + command.value + " |");
        
        var handler = this.commandFactory.getCommandHandler(command.command);
        if (handler == null) {
            throw new Error("Unknown command: '" + command.command + "'");
        }
        
        command.target = selenium.preprocessParameter(command.target);
        command.value = selenium.preprocessParameter(command.value);
        var result = handler.execute(selenium, command);

        this.commandComplete(result);

        if (result.processState == SELENIUM_PROCESS_WAIT) {
            this.waitForCondition = function() {
                return selenium.browserbot.isNewPageLoaded();
            };
        }
    };
    
    this.handleCommandError = function(e) {
       if (!e.isSeleniumError) {
            LOG.exception(e);
            var msg = "Selenium failure. Please report to selenium-devel@lists.public.thoughtworks.org, with details from the logs at the base of the page.";
            if (e.message) {
               msg += "  The error message is: " + e.message;
            }
            this.commandError(msg);
        } else {
            LOG.error(e.message);
            this.commandError(e.message);
        }
    };

    /**
     * Busy wait for waitForCondition() to become true, and then carry on
     * with test.
     */
    this.continueTestWhenConditionIsTrue = function () {
        if (this.waitForCondition == null || this.waitForCondition()) {
            this.waitForCondition = null;
            this.continueTest();
        } else {
            window.setTimeout("testLoop.continueTestWhenConditionIsTrue()", 10);
        }
    };

}

/** The default is not to have any interval between commands. */
TestLoop.prototype.getCommandInterval = function() {
    return 0;
};

TestLoop.prototype.nextCommand = noop;

TestLoop.prototype.commandStarted = noop;

TestLoop.prototype.commandError = noop;

TestLoop.prototype.commandComplete = noop;

TestLoop.prototype.testComplete = noop;

TestLoop.prototype.pause = noop;

function noop() {

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
        new ExpectFailureCommandFactory(testLoop.commandFactory, message);
    expectFailureCommandFactory.baseExecutor = executeCommandAndReturnFailureMessage;
    testLoop.commandFactory = expectFailureCommandFactory;
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
        new ExpectFailureCommandFactory(testLoop.commandFactory, message);
    expectFailureCommandFactory.baseExecutor = executeCommandAndReturnErrorMessage;
    testLoop.commandFactory = expectFailureCommandFactory;
};

function ExpectFailureCommandFactory(originalCommandFactory, expectedErrorMessage) {
    this.getCommandHandler = function(name) {
        var baseHandler = originalCommandFactory.getCommandHandler(name);
        var baseExecutor = this.baseExecutor;
        var expectFailureCommand = {};
        expectFailureCommand.execute = function() {
            var baseFailureMessage = baseExecutor(baseHandler, arguments);
            var result = new CommandResult();
            if (!baseFailureMessage) {
                result.failed = true;
                result.failureMessage = "Command should have failed.";
            }
            else {
                if (! PatternMatcher.matches(expectedErrorMessage, baseFailureMessage)) {
                    result.failed = true;
                    result.failureMessage = "Expected failure message '" + expectedErrorMessage
                                            + "' but was '" + baseFailureMessage + "'";
                }
                else {
                    result.passed = true;
                    result.result = baseFailureMessage;
                }
            }
            testLoop.commandFactory = originalCommandFactory;
            return result;
        };
        return expectFailureCommand;
    };
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

