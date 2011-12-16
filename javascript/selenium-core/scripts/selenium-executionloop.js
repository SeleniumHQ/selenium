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
*/

function TestLoop(commandFactory) {
    this.commandFactory = commandFactory;
}

TestLoop.prototype = {

    start : function() {
        selenium.reset();
        LOG.debug("currentTest.start()");
        this.continueTest();
    },

    continueTest : function() {
        /**
         * Select the next command and continue the test.
         */
        LOG.debug("currentTest.continueTest() - acquire the next command");
        if (! this.aborted) {
            this.currentCommand = this.nextCommand();
        }
        if (! this.requiresCallBack) {
            this.continueTestAtCurrentCommand();
        } // otherwise, just finish and let the callback invoke continueTestAtCurrentCommand()
    },

    continueTestAtCurrentCommand : function() {
        LOG.debug("currentTest.continueTestAtCurrentCommand()");
        if (this.currentCommand) {
            // TODO: rename commandStarted to commandSelected, OR roll it into nextCommand
            this.commandStarted(this.currentCommand);
            this._resumeAfterDelay();
        } else {
            this._testComplete();
        }
    },

    _resumeAfterDelay : function() {
        /**
         * Pause, then execute the current command.
         */

        // Get the command delay. If a pauseInterval is set, use it once
        // and reset it.  Otherwise, use the defined command-interval.
        var delay = this.pauseInterval || this.getCommandInterval();
        this.pauseInterval = undefined;

        if (this.currentCommand.isBreakpoint || delay < 0) {
            // Pause: enable the "next/continue" button
            this.pause();
        } else {
            window.setTimeout(fnBind(this.resume, this), delay);
        }
    },

    resume: function() {
        /**
         * Select the next command and continue the test.
         */
        LOG.debug("currentTest.resume() - actually execute");
        try {
            selenium.browserbot.runScheduledPollers();
            this._executeCurrentCommand();
            this.continueTestWhenConditionIsTrue();
        } catch (e) {
            if (!this._handleCommandError(e)) {
                this.testComplete();
            } else {
                this.continueTest();
            }
        }
    },

    _testComplete : function() {
        selenium.ensureNoUnhandledPopups();
        this.testComplete();
    },

    _executeCurrentCommand : function() {
        /**
         * Execute the current command.
         *
         * @return a function which will be used to determine when
         * execution can continue, or null if we can continue immediately
         */
        var command = this.currentCommand;
        LOG.info("Executing: |" + command.command + " | " + command.target + " | " + command.value + " |");

        var handler = this.commandFactory.getCommandHandler(command.command);
        if (handler == null) {
            throw new SeleniumError("Unknown command: '" + command.command + "'");
        }

        command.target = selenium.preprocessParameter(command.target);
        command.value = selenium.preprocessParameter(command.value);
        LOG.debug("Command found, going to execute " + command.command);
        this.result = handler.execute(selenium, command);
        

        this.waitForCondition = this.result.terminationCondition;

    },

    _handleCommandError : function(e) {
        if (!e.isSeleniumError) {
            LOG.exception(e);
            var msg = "Command execution failure. Please search the user group at https://groups.google.com/forum/#!forum/selenium-users for error details from the log window.";
            msg += "  The error message is: " + extractExceptionMessage(e);
            return this.commandError(msg);
        } else {
            LOG.error(e.message);
            return this.commandError(e.message);
        }
    },

    continueTestWhenConditionIsTrue: function () {
        /**
         * Busy wait for waitForCondition() to become true, and then carry
         * on with test.  Fail the current test if there's a timeout or an
         * exception.
         */
        //LOG.debug("currentTest.continueTestWhenConditionIsTrue()");
        selenium.browserbot.runScheduledPollers();
        try {
            if (this.waitForCondition == null) {
                LOG.debug("null condition; let's continueTest()");
                LOG.debug("Command complete");
                this.commandComplete(this.result);
                this.continueTest();
            } else if (this.waitForCondition()) {
                LOG.debug("condition satisfied; let's continueTest()");
                this.waitForCondition = null;
                LOG.debug("Command complete");
                this.commandComplete(this.result);
                this.continueTest();
            } else {
                //LOG.debug("waitForCondition was false; keep waiting!");
                window.setTimeout(fnBind(this.continueTestWhenConditionIsTrue, this), 10);
            }
        } catch (e) {
            this.result = {};
            this.result.failed = true;
            this.result.failureMessage = extractExceptionMessage(e);
            this.commandComplete(this.result);
            this.continueTest();
        }
    },

    pause : function() {},
    nextCommand : function() {},
    commandStarted : function() {},
    commandComplete : function() {},
    commandError : function() {},
    testComplete : function() {},

    getCommandInterval : function() {
        return 0;
    }

}
