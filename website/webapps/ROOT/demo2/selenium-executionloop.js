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

starting_up  = true;
TEST_FINISHED = true;
TEST_CONTINUE = false;

function TestLoop(commandFactory) {
    this.commandFactory = commandFactory;

    var self = this;

    this.start = function() {
        selenium.reset();
        this.continueCurrentTest();
    };

    this.continueCurrentTest = function() {
        var testStatus = this.kickoffNextCommandExecution();

        if (testStatus == TEST_FINISHED) {
            this.testComplete();
        }
    };

    this.kickoffNextCommandExecution = function() {

        var command;
        if (starting_up == true) {
            command = this.firstCommand();
            starting_up = false;
        } else {
            command = this.nextCommand();
        }

        if (!command) return TEST_FINISHED;

        // Make the current row blue
        this.commandStarted(command);

        LOG.debug("Executing: |" + command.command + " | " + command.target + " | " + command.value + " |");

        var result;
        try {
            var handler = this.commandFactory.getCommandHandler(command.command);
            if(handler == null) {
                throw new Error("Unknown command: '" + command.command + "'");
            }

            command.target = selenium.preprocessParameter(command.target);
            command.value = selenium.preprocessParameter(command.value);

            result = handler.execute(selenium, command);
        } catch (e) {
            LOG.error(e);
            // TODO: only throw typed errors from commands so that we can perform better error handling
            // to differentiate between expected command errors and unexpected javascript errors.
            if (e instanceof TypeError) {
                // Not a command error.
                throw e;
            }
            this.commandError(e.message);
            return TEST_FINISHED;
        }

        // Record the result so that we can continue the execution using window.setTimeout()
        this.lastCommandResult = result;
        if (result.processState == SELENIUM_PROCESS_WAIT) {
            // Since we're waiting for page to reload, we can't continue command execution
            // directly, we need use a page load listener.

            // TODO there is a potential race condition by attaching a load listener after
            // the command has completed execution.
            selenium.callOnNextPageLoad(function() {eval("testLoop.continueCommandExecutionWithDelay()");});

        } else {
            // Continue processing
            this.continueCommandExecutionWithDelay();
        }

        // Test is not finished.
        return TEST_CONTINUE;
    };

    /**
    * Continues the command execution, after waiting for the specified delay.
    */
    this.continueCommandExecutionWithDelay = function() {
        // Get the interval to use for this command execution, using the pauseInterval as
        // specified. Reset the pause interval, since it's a one-off thing.
        var interval = this.pauseInterval || this.getCommandInterval();
        this.pauseInterval = undefined;

        if (interval < 0) {
            // Enable the "next/continue" button
            this.waitingForNext();
        }
        else {
            // Continue processing
            window.setTimeout("testLoop.finishCommandExecution()", interval);
        }
    };

    /**
    * Finishes the execution of the previous command, and continues the test
    */
    this.finishCommandExecution = function() {
        this.commandComplete(this.lastCommandResult);
        this.continueCurrentTest();
    };
}

/** The default is not to have any interval between commands. */
TestLoop.prototype.getCommandInterval = function() {
    return 0;
};

TestLoop.prototype.firstCommand = noop;

TestLoop.prototype.nextCommand = noop;

TestLoop.prototype.commandStarted = noop;

TestLoop.prototype.commandError = noop;

TestLoop.prototype.commandComplete = noop;

TestLoop.prototype.testComplete = noop;

TestLoop.prototype.waitingForNext = noop;

function noop() {

};

/**
 * A selenium command that tells selenium to expect a failure on the next command
 * execution. This command temporarily installs a new CommandFactory, that generates
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
 * A selenium command that tells selenium to expect a failure on the next command
 * execution. This command temporarily installs a new CommandFactory, that generates
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
                if (baseFailureMessage != expectedErrorMessage) {
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

