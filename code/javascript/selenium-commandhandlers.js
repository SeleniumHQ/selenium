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
function CommandHandlerFactory() {
    this.actions = {};
    this.asserts = {};
    this.accessors = {};

    var self = this;

    this.registerAction = function(name, action, wait) {
        var handler = new ActionHandler(action, wait);
        this.actions[name] = handler;
    };

    this.registerAccessor = function(name, accessor) {
        var handler = new AccessorHandler(accessor);
        this.accessors[name] = handler;
    };

    this.registerAssert = function(name, assertion, haltOnFailure) {
        var handler = new AssertHandler(assertion, haltOnFailure);
        this.asserts[name] = handler;
    };
    
    this.registerAssertUsingMatcherHandler = function(name, matcherHandler, haltOnFailure) {
        var handler = new AssertUsingMatcherHandler(matcherHandler, haltOnFailure);
        this.asserts[name] = handler;
    }

    this.getCommandHandler = function(name) {
        return this.actions[name] || this.accessors[name] || this.asserts[name] || null;
    };

    this.registerAll = function(commandObject) {
        registerAllActions(commandObject);
        registerAllAsserts(commandObject);
        registerAllAccessors(commandObject);
    };

    var registerAllActions = function(commandObject) {
        for (var functionName in commandObject) {
            var result = /^do([A-Z].+)$/.exec(functionName);
            if (result != null) {
                var actionName = result[1].lcfirst();

                // Register the action without the wait flag.
                var action = commandObject[functionName];
                self.registerAction(actionName, action, false);

                // Register actionName + "AndWait" with the wait flag;
                var waitActionName = actionName + "AndWait";
                self.registerAction(waitActionName, action, true);
            }
        }
    };

    var registerAllAsserts = function(commandObject) {
        for (var functionName in commandObject) {
            var result = /^assert([A-Z].+)$/.exec(functionName);
            if (result != null) {
                var assert = commandObject[functionName];

                // Register the assert with the "assert" prefix, and halt on failure.
                var assertName = functionName;
                self.registerAssert(assertName, assert, true);

                // Register the assert with the "verify" prefix, and do not halt on failure.
                var verifyName = "verify" + result[1];
                self.registerAssert(verifyName, assert, false);
            }
        }
    };

    // Given an accessor function, return a function that matches against the command.value
    // the value returned by the accessor when applied to a command.target.
    // Used by commands that take a target and a value (e.g. assertValue | target | value)
    this.createMatcherHandlerFromSingleArgAccessor = function(accessor) {
        return function(seleniumApi, command) {
            var accessorResult = accessor.call(seleniumApi, command.target);
            if (PatternMatcher.matches(command.value, accessorResult)) {
                return new MatcherHandlerResult(true, "Actual value '" + accessorResult + "' did match '" + command.value + "'");
            } else {
                return new MatcherHandlerResult(false, "Actual value '" + accessorResult + "' did not match '" + command.value + "'");
            }
        };
    };
    
    // Given an accessor function, return a function that matches against the command.target
    // the value returned by the (no-arg) accessor returns a value that matches against the command.target
    // Used by commands that only take a target (e.g. assertTitle | target | &nbsp;)
    this.createMatcherHandlerFromNoArgAccessor = function(accessor) {
        return function(seleniumApi, command) {
            var accessorResult = accessor.call(seleniumApi);
            if (PatternMatcher.matches(command.target, accessorResult)) {
                return new MatcherHandlerResult(true, "Actual value '" + accessorResult + "' did match '" + command.target + "'");
            } else {
                return new MatcherHandlerResult(false, "Actual value '" + accessorResult + "' did not match '" + command.target + "'");
            }
        };
    };
    
    // Given a matcherHandler function, return a function that returns the same result
    // as the matcherHandler, but with the result negated.
    // Used to create assertNot and verifyNot commands (and soon hopefully waitForNot commands).
    this.createMatcherHandlerNegator = function(matcherHandler) {
        return function(seleniumApi, command) {
            var result = matcherHandler(seleniumApi, command);
            result.didMatch = ! result.didMatch;
            return result;
        };
    };
    
    // Register an assertion, a verification, a negative assertion,
    // and a negative verification based on the specified accessor.
    this.registerAssertionsBasedOnAccessor = function(accessor, baseName) {
        if (accessor.length > 1) {
            return;
        }
        var matcherHandler;
        if (accessor.length == 1) {
            matcherHandler = self.createMatcherHandlerFromSingleArgAccessor(accessor);
        } else {
            matcherHandler = self.createMatcherHandlerFromNoArgAccessor(accessor);
        }
        // Register an assert with the "assert" prefix, and halt on failure.
        self.registerAssertUsingMatcherHandler("assert" + baseName, matcherHandler, true);
        // Register a verify with the "verify" prefix, and do not halt on failure.
        self.registerAssertUsingMatcherHandler("verify" + baseName, matcherHandler, false);
        
        var negativeMatcherHandler = self.createMatcherHandlerNegator(matcherHandler);
        // Register an assertNot with the "assertNot" prefix, and halt on failure.
        self.registerAssertUsingMatcherHandler("assertNot"+baseName, negativeMatcherHandler, true);
        // Register a verifyNot with the "verifyNot" prefix, and do not halt on failure.
        self.registerAssertUsingMatcherHandler("verifyNot"+baseName, negativeMatcherHandler, false);
    };

    // Methods of the form getFoo(target) result in commands:
    // getFoo, assertFoo, verifyFoo, assertNotFoo, verifyNotFoo
    var registerAllAccessors = function(commandObject) {
        for (var functionName in commandObject) {
            var match = /^get([A-Z].+)$/.exec(functionName);
            if (match != null) {
                var accessor = commandObject[functionName];
                var baseName = match[1];
                self.registerAccessor(functionName, accessor);
                self.registerAssertionsBasedOnAccessor(accessor, baseName);
            }
        }
    };
    
    
}

function MatcherHandlerResult(didMatch, message) {
    this.didMatch = didMatch;
    this.message = message;
}

// NOTE: The CommandHandler is effectively an abstract base for ActionHandler,
//      AccessorHandler and AssertHandler.
function CommandHandler(type, haltOnFailure, executor) {
    this.type = type;
    this.haltOnFailure = haltOnFailure;
    this.executor = executor;
}
CommandHandler.prototype.execute = function(seleniumApi, command) {
    return new CommandResult(this.executor.call(seleniumApi, command.target, command.value));
};

function ActionHandler(action, wait) {
    CommandHandler.call(this, "action", true, action);
    if (wait) {
        this.wait = true;
    }
}
ActionHandler.prototype = new CommandHandler;
ActionHandler.prototype.execute = function(seleniumApi, command) {
    if ( seleniumApi.browserbot.hasAlerts() ) {
        throw new SeleniumCommandError("There was an unexpected Alert! [" + seleniumApi.browserbot.getNextAlert() + "]");
    }
    if ( seleniumApi.browserbot.hasConfirmations() ) {
        throw new SeleniumCommandError("There was an unexpected Confirmation! [" + seleniumApi.browserbot.getNextConfirmation() + "]");
    }
    var processState = this.executor.call(seleniumApi, command.target, command.value);
    // If the handler didn't return a wait flag, check to see if the
    // handler was registered with the wait flag.
    if (processState == undefined && this.wait) {
        processState = SELENIUM_PROCESS_WAIT;
    }
    return new CommandResult(processState);
};

function AccessorHandler(accessor) {
    CommandHandler.call(this, "accessor", true, accessor);
}
AccessorHandler.prototype = new CommandHandler;
AccessorHandler.prototype.execute = function(seleniumApi, command) {
    var returnValue = this.executor.call(seleniumApi, command.target, command.value);
    var result = new CommandResult();
    result.result = returnValue;
    return result;
};

/**
 * Abstract handler for assertions and verifications.
 * Subclasses need to override executeAssertion() which in turn
 * should throw an AssertFailedError if the assertion is to fail. 
 */
function AbstractAssertHandler(assertion, haltOnFailure) {
    CommandHandler.call(this, "assert", haltOnFailure || false, assertion);
}
AbstractAssertHandler.prototype = new CommandHandler;
AbstractAssertHandler.prototype.execute = function(seleniumApi, command) {
    var result = new CommandResult();
    try {
        this.executeAssertion(seleniumApi, command);
        result.passed = true;
    } catch (e) {
        // If this is not a AssertionFailedError, or we should haltOnFailure, rethrow.
        if (!e.isAssertionFailedError) {
            throw e;
        }
        if (this.haltOnFailure) {
            var error = new SeleniumCommandError(e.failureMessage);
            throw error;
        }
        result.failed = true;
        result.failureMessage = e.failureMessage;
    }
    return result;
};

/**
 * Simple assertion handler whose command is expected to do the actual assertion.
 */
function AssertHandler(assertion, haltOnFailure) {
    CommandHandler.call(this, "assert", haltOnFailure || false, assertion);
};
AssertHandler.prototype = new AbstractAssertHandler;
AssertHandler.prototype.executeAssertion = function(seleniumApi, command) {
        this.executor.call(seleniumApi, command.target, command.value);
};

/**
 * Assertion handler whose command is expected to be a matcher-handler
 */
function AssertUsingMatcherHandler(matcherHandler, haltOnFailure) {
    CommandHandler.call(this, "assert", haltOnFailure || false, matcherHandler);
};
AssertUsingMatcherHandler.prototype = new AbstractAssertHandler;
AssertUsingMatcherHandler.prototype.executeAssertion = function(seleniumApi, command) {
        var matcherResult = this.executor(seleniumApi, command);
        if (!matcherResult.didMatch) {
            Assert.fail(matcherResult.message);
        }
};


function CommandResult(processState) {
    this.processState = processState;
    this.result = "OK";
}

function SeleniumCommand(command, target, value) {
    this.command = command;
    this.target = target;
    this.value = value;
}

// TODO: dkemp - This is the same as SeleniumError as defined in selenium-browserbot.js
// I defined a new error simply to avoid creating a new dependency.
// Need to revisit to avoid this duplication.
function SeleniumCommandError(message) {
    var error = new Error(message);
    error.isSeleniumError = true;
    return error;
};
