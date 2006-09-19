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

    var self = this;

    this.handlers = {};

    this.registerAction = function(name, action, wait, dontCheckAlertsAndConfirms) {
        var handler = new ActionHandler(action, wait, dontCheckAlertsAndConfirms);
        this.handlers[name] = handler;
    };

    this.registerAccessor = function(name, accessor) {
        var handler = new AccessorHandler(accessor);
        this.handlers[name] = handler;
    };

    this.registerAssert = function(name, assertion, haltOnFailure) {
        var handler = new AssertHandler(assertion, haltOnFailure);
        this.handlers[name] = handler;
    };

    this.getCommandHandler = function(name) {
        return this.handlers[name] ||  null; // todo: why null, and not undefined?
    };

    // Methods of the form getFoo(target) result in commands:
    // getFoo, assertFoo, verifyFoo, assertNotFoo, verifyNotFoo
    // storeFoo, waitForFoo, and waitForNotFoo.
    var _registerAllAccessors = function(commandObject) {
        for (var functionName in commandObject) {
            var matchForGetter = /^get([A-Z].+)$/.exec(functionName);
            if (matchForGetter != null) {
                var accessor = commandObject[functionName];
                var baseName = matchForGetter[1];
                self.registerAccessor(functionName, accessor);
                self.registerAssertionsBasedOnAccessor(accessor, baseName);
                self.registerStoreCommandBasedOnAccessor(accessor, baseName);
                self.registerWaitForCommandsBasedOnAccessor(accessor, baseName);
            }
            var matchForIs = /^is([A-Z].+)$/.exec(functionName);
            if (matchForIs != null) {
                var accessor = commandObject[functionName];
                var baseName = matchForIs[1];
                var predicate = self.createPredicateFromBooleanAccessor(accessor);
                self.registerAccessor(functionName, accessor);
                self.registerAssertionsBasedOnAccessor(accessor, baseName, predicate);
                self.registerStoreCommandBasedOnAccessor(accessor, baseName);
                self.registerWaitForCommandsBasedOnAccessor(accessor, baseName, predicate);
            }
        }
    };

    var _registerAllActions = function(commandObject) {
        for (var functionName in commandObject) {
            var result = /^do([A-Z].+)$/.exec(functionName);
            if (result != null) {
                var actionName = result[1].lcfirst();

                // Register the action without the wait flag.
                var action = commandObject[functionName];
                self.registerAction(actionName, action, false, action.dontCheckAlertsAndConfirms);

                // Register actionName + "AndWait" with the wait flag;
                var waitActionName = actionName + "AndWait";
                self.registerAction(waitActionName, action, true, action.dontCheckAlertsAndConfirms);
            }
        }
    };

    var _registerAllAsserts = function(commandObject) {
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

    this.registerAll = function(commandObject) {
        _registerAllAccessors(commandObject);
        _registerAllActions(commandObject);
        _registerAllAsserts(commandObject);
    };

    // Given an accessor function getBlah(target),
    // return a "predicate" equivalient to isBlah(target, value) that
    // is true when the value returned by the accessor matches the specified value.
    this.createPredicateFromSingleArgAccessor = function(accessor) {
        return function(target, value) {
            var accessorResult = accessor.call(this, target);
            if (PatternMatcher.matches(value, accessorResult)) {
                return new PredicateResult(true, "Actual value '" + accessorResult + "' did match '" + value + "'");
            } else {
                return new PredicateResult(false, "Actual value '" + accessorResult + "' did not match '" + value + "'");
            }
        };
    };

    // Given a (no-arg) accessor function getBlah(),
    // return a "predicate" equivalient to isBlah(value) that
    // is true when the value returned by the accessor matches the specified value.
    this.createPredicateFromNoArgAccessor = function(accessor) {
        return function(value) {
            var accessorResult = accessor.call(this);
            if (PatternMatcher.matches(value, accessorResult)) {
                return new PredicateResult(true, "Actual value '" + accessorResult + "' did match '" + value + "'");
            } else {
                return new PredicateResult(false, "Actual value '" + accessorResult + "' did not match '" + value + "'");
            }
        };
    };

    // Given a boolean accessor function isBlah(),
    // return a "predicate" equivalient to isBlah() that
    // returns an appropriate PredicateResult value.
    this.createPredicateFromBooleanAccessor = function(accessor) {
        return function() {
            var accessorResult;
            if (arguments.length > 2) throw new SeleniumError("Too many arguments! " + arguments.length);
            if (arguments.length == 2) {
                accessorResult = accessor.call(this, arguments[0], arguments[1]);
            } else if (arguments.length == 1) {
                accessorResult = accessor.call(this, arguments[0]);
            } else {
                accessorResult = accessor.call(this);
            }
            if (accessorResult) {
                return new PredicateResult(true, "true");
            } else {
                return new PredicateResult(false, "false");
            }
        };
    };

    // Given an accessor fuction getBlah([target])  (target is optional)
    // return a predicate equivalent to isBlah([target,] value) that
    // is true when the value returned by the accessor matches the specified value.
    this.createPredicateFromAccessor = function(accessor) {
        if (accessor.length == 0) {
            return self.createPredicateFromNoArgAccessor(accessor);
        }
        return self.createPredicateFromSingleArgAccessor(accessor);
    };

    // Given a predicate, return the negation of that predicate.
    // Leaves the message unchanged.
    // Used to create assertNot, verifyNot, and waitForNot commands.
    this.invertPredicate = function(predicate) {
        return function(target, value) {
            var result = predicate.call(this, target, value);
            result.isTrue = ! result.isTrue;
            return result;
        };
    };

    // Convert an isBlahBlah(target, value) function into an assertBlahBlah(target, value) function.
    this.createAssertionFromPredicate = function(predicate) {
        return function(target, value) {
            var result = predicate.call(this, target, value);
            if (!result.isTrue) {
                Assert.fail(result.message);
            }
        };
    };


    var _negtiveName = function(baseName) {
        var matchResult = /^(.*)Present$/.exec(baseName);
        if (matchResult != null) {
            return matchResult[1] + "NotPresent";
        }
        return "Not" + baseName;
    };

    // Register an assertion, a verification, a negative assertion,
    // and a negative verification based on the specified accessor.
    this.registerAssertionsBasedOnAccessor = function(accessor, baseName, predicate) {
        if (predicate == null) {
            predicate = self.createPredicateFromAccessor(accessor);
        }
        var assertion = self.createAssertionFromPredicate(predicate);
        self.registerAssert("assert" + baseName, assertion, true);
        self.registerAssert("verify" + baseName, assertion, false);

        var invertedPredicate = self.invertPredicate(predicate);
        var negativeAssertion = self.createAssertionFromPredicate(invertedPredicate);
        self.registerAssert("assert" + _negtiveName(baseName), negativeAssertion, true);
        self.registerAssert("verify" + _negtiveName(baseName), negativeAssertion, false);
    };

    // Convert an isBlahBlah(target, value) function into a waitForBlahBlah(target, value) function.
    this.createWaitForActionFromPredicate = function(predicate) {
        return function(target, value) {
            var seleniumApi = this;
            return function () {
                try {
                    return predicate.call(seleniumApi, target, value).isTrue;
                } catch (e) {
                    // Treat exceptions as meaning the condition is not yet met.
                    // Useful, for example, for waitForValue when the element has
                    // not even been created yet.
                    // TODO: possibly should rethrow some types of exception.
                    return false;
                }
            };
        };
    };

    // Register a waitForBlahBlah and waitForNotBlahBlah based on the specified accessor.
    this.registerWaitForCommandsBasedOnAccessor = function(accessor, baseName, predicate) {
        if (predicate==null) {
            predicate = self.createPredicateFromAccessor(accessor);
        }
        var waitForAction = self.createWaitForActionFromPredicate(predicate);
        self.registerAction("waitFor"+baseName, waitForAction, false, true);
        var invertedPredicate = self.invertPredicate(predicate);
        var waitForNotAction = self.createWaitForActionFromPredicate(invertedPredicate);
        self.registerAction("waitFor"+_negtiveName(baseName), waitForNotAction, false, true);
        //TODO decide remove "waitForNot.*Present" action name or not
        //for the back compatiblity issues we still make waitForNot.*Present availble
        self.registerAction("waitForNot"+baseName, waitForNotAction, false, true);
    }

    // Register a storeBlahBlah based on the specified accessor.
    this.registerStoreCommandBasedOnAccessor = function(accessor, baseName) {
        var action;
        if (accessor.length == 1) {
            action = function(target, varName) {
                storedVars[varName] = accessor.call(this, target);
            };
        } else {
            action = function(varName) {
                storedVars[varName] = accessor.call(this);
            };
        }
        self.registerAction("store"+baseName, action, false, accessor.dontCheckAlertsAndConfirms);
    };

}

function PredicateResult(isTrue, message) {
    this.isTrue = isTrue;
    this.message = message;
}

// NOTE: The CommandHandler is effectively an abstract base for
// various handlers including ActionHandler, AccessorHandler and AssertHandler.
// Subclasses need to implement an execute(seleniumApi, command) function,
// where seleniumApi is the Selenium object, and command a SeleniumCommand object.
function CommandHandler(type, haltOnFailure, executor) {
    this.type = type;
    this.haltOnFailure = haltOnFailure;
    this.executor = executor;
}

// An ActionHandler is a command handler that executes the sepcified action,
// possibly checking for alerts and confirmations (if checkAlerts is set), and
// possibly waiting for a page load if wait is set.
function ActionHandler(action, wait, dontCheckAlerts) {
    CommandHandler.call(this, "action", true, action);
    if (wait) {
        this.wait = true;
    }
    // note that dontCheckAlerts could be undefined!!!
    this.checkAlerts = (dontCheckAlerts) ? false : true;
}
ActionHandler.prototype = new CommandHandler;
ActionHandler.prototype.execute = function(seleniumApi, command) {
    if (this.checkAlerts && (null==/(Alert|Confirmation)(Not)?Present/.exec(command.command))) {
        seleniumApi.ensureNoUnhandledPopups();
    }
    var terminationCondition = this.executor.call(seleniumApi, command.target, command.value);
    // If the handler didn't return a wait flag, check to see if the
    // handler was registered with the wait flag.
    if (terminationCondition == undefined && this.wait) {
        terminationCondition = seleniumApi.makePageLoadCondition();
    }
    return new ActionResult(terminationCondition);
};

function ActionResult(terminationCondition) {
    this.terminationCondition = terminationCondition;
}

function AccessorHandler(accessor) {
    CommandHandler.call(this, "accessor", true, accessor);
}
AccessorHandler.prototype = new CommandHandler;
AccessorHandler.prototype.execute = function(seleniumApi, command) {
    var returnValue = this.executor.call(seleniumApi, command.target, command.value);
    return new AccessorResult(returnValue);
};

function AccessorResult(result) {
    this.result = result;
}

/**
 * Handler for assertions and verifications.
 */
function AssertHandler(assertion, haltOnFailure) {
    CommandHandler.call(this, "assert", haltOnFailure || false, assertion);
}
AssertHandler.prototype = new CommandHandler;
AssertHandler.prototype.execute = function(seleniumApi, command) {
    var result = new AssertResult();
    try {
        this.executor.call(seleniumApi, command.target, command.value);
    } catch (e) {
        // If this is not a AssertionFailedError, or we should haltOnFailure, rethrow.
        if (!e.isAssertionFailedError) {
            throw e;
        }
        if (this.haltOnFailure) {
            var error = new SeleniumError(e.failureMessage);
            throw error;
        }
        result.setFailed(e.failureMessage);
    }
    return result;
};

function AssertResult() {
    this.passed = true;
}
AssertResult.prototype.setFailed = function(message) {
    this.passed = null;
    this.failed = true;
    this.failureMessage = message;
}

function SeleniumCommand(command, target, value, isBreakpoint) {
    this.command = command;
    this.target = target;
    this.value = value;
    this.isBreakpoint = isBreakpoint;
}

