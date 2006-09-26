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

// A naming convention used in this file:
//
//   - a "Method" is an unbound function whose target must be supplied when it's called, ie.
//     it should be invoked using Function.call() or Function.apply()
//
//   - a "Block" is a function that has been bound to a target object, so can be called invoked directly
//     (or with a null target)

var CommandHandlerFactory = Class.create();
Object.extend(CommandHandlerFactory.prototype, {

    initialize: function() {
        this.handlers = {};
    },

    registerAction: function(name, actionBlock, wait, dontCheckAlertsAndConfirms) {
        this.handlers[name] = new ActionHandler(actionBlock, wait, dontCheckAlertsAndConfirms);
    },

    registerAccessor: function(name, accessorMethod) {
        this.handlers[name] = new AccessorHandler(accessorMethod);
    },

    registerAssert: function(name, assertionMethod, haltOnFailure) {
        this.handlers[name] = new AssertHandler(assertionMethod, haltOnFailure);
    },

    getCommandHandler: function(name) {
        return this.handlers[name];
    },

    // Methods of the form getFoo(target) result in commands:
    // getFoo, assertFoo, verifyFoo, assertNotFoo, verifyNotFoo
    // storeFoo, waitForFoo, and waitForNotFoo.
    _registerAllAccessors: function(commandTarget) {
        for (var functionName in commandTarget) {
            var match = /^(get|is)([A-Z].+)$/.exec(functionName);
            if (!match) {
                continue;
            }
            var accessorMethod = commandTarget[functionName];
            var accessorBlock = accessorMethod.bind(commandTarget);
            var baseName = match[2];
            this.registerAccessor(functionName, accessorMethod);
            this.registerStoreCommandBasedOnAccessor(baseName, accessorBlock, accessorMethod.length);
            var predicate;
            if (match[1] == "is") {
                var predicateMethod = this.createPredicateFromBooleanAccessor(accessorMethod);
            } else {
                predicateMethod = this.createPredicateFromAccessor(accessorMethod);
            }
            this.registerAssertionsForPredicate(baseName, predicateMethod);
            this.registerWaitForCommandsForPredicate(commandTarget, baseName, predicateMethod);
        }
    },

    _registerAllActions: function(commandTarget) {
        for (var functionName in commandTarget) {
            var result = /^do([A-Z].+)$/.exec(functionName);
            if (result != null) {
                var actionName = result[1].lcfirst();
                var actionMethod = commandTarget[functionName];
                var dontCheckPopups = actionMethod.dontCheckAlertsAndConfirms;
                var actionBlock = actionMethod.bind(commandTarget);
                this.registerAction(actionName, actionBlock, false, dontCheckPopups);
                this.registerAction(actionName + "AndWait", actionBlock, true, dontCheckPopups);
            }
        }
    },

    _registerAllAsserts: function(commandTarget) {
        for (var functionName in commandTarget) {
            var result = /^assert([A-Z].+)$/.exec(functionName);
            if (result != null) {
                var assert = commandTarget[functionName];

                // Register the assert with the "assert" prefix, and halt on failure.
                var assertName = functionName;
                this.registerAssert(assertName, assert, true);

                // Register the assert with the "verify" prefix, and do not halt on failure.
                var verifyName = "verify" + result[1];
                this.registerAssert(verifyName, assert, false);
            }
        }
    },

    registerAll: function(commandTarget) {
        this._registerAllAccessors(commandTarget);
        this._registerAllActions(commandTarget);
        this._registerAllAsserts(commandTarget);
    },

    // Given an accessor function getBlah(target),
    // return a "predicate" equivalient to isBlah(target, value) that
    // is true when the value returned by the accessor matches the specified value.
    createPredicateFromSingleArgAccessor: function(accessor) {
        return function(target, value) {
            var accessorResult = accessor.call(this, target);
            if (PatternMatcher.matches(value, accessorResult)) {
                return new PredicateResult(true, "Actual value '" + accessorResult + "' did match '" + value + "'");
            } else {
                return new PredicateResult(false, "Actual value '" + accessorResult + "' did not match '" + value + "'");
            }
        };
    },

    // Given a (no-arg) accessor function getBlah(),
    // return a "predicate" equivalient to isBlah(value) that
    // is true when the value returned by the accessor matches the specified value.
    createPredicateFromNoArgAccessor: function(accessor) {
        return function(value) {
            var accessorResult = accessor.call(this);
            if (PatternMatcher.matches(value, accessorResult)) {
                return new PredicateResult(true, "Actual value '" + accessorResult + "' did match '" + value + "'");
            } else {
                return new PredicateResult(false, "Actual value '" + accessorResult + "' did not match '" + value + "'");
            }
        };
    },

    // Given a boolean accessor function isBlah(),
    // return a "predicate" equivalient to isBlah() that
    // returns an appropriate PredicateResult value.
    createPredicateFromBooleanAccessor: function(accessorMethod) {
        return function() {
            var accessorResult;
            if (arguments.length > 2) throw new SeleniumError("Too many arguments! " + arguments.length);
            if (arguments.length == 2) {
                accessorResult = accessorMethod.call(this, arguments[0], arguments[1]);
            } else if (arguments.length == 1) {
                accessorResult = accessorMethod.call(this, arguments[0]);
            } else {
                accessorResult = accessorMethod.call(this);
            }
            if (accessorResult) {
                return new PredicateResult(true, "true");
            } else {
                return new PredicateResult(false, "false");
            }
        };
    },

    // Given an accessor fuction getBlah([target])  (target is optional)
    // return a predicate equivalent to isBlah([target,] value) that
    // is true when the value returned by the accessor matches the specified value.
    createPredicateFromAccessor: function(accessorMethod) {
        if (accessorMethod.length == 0) {
            return this.createPredicateFromNoArgAccessor(accessorMethod);
        }
        return this.createPredicateFromSingleArgAccessor(accessorMethod);
    },

    // Given a predicate, return the negation of that predicate.
    // Leaves the message unchanged.
    // Used to create assertNot, verifyNot, and waitForNot commands.
    _invertPredicate: function(predicateMethod) {
        return function(target, value) {
            var result = predicateMethod.call(this, target, value);
            result.isTrue = ! result.isTrue;
            return result;
        };
    },

    // Convert an isBlahBlah(target, value) function into an assertBlahBlah(target, value) function.
    createAssertionFromPredicate: function(predicateMethod) {
        return function(target, value) {
            var result = predicateMethod.call(this, target, value);
            if (!result.isTrue) {
                Assert.fail(result.message);
            }
        };
    },

    _invertPredicateName: function(baseName) {
        var matchResult = /^(.*)Present$/.exec(baseName);
        if (matchResult != null) {
            return matchResult[1] + "NotPresent";
        }
        return "Not" + baseName;
    },

    // Register an assertion, a verification, a negative assertion,
    // and a negative verification based on the specified accessor.
    registerAssertionsForPredicate: function(baseName, predicate) {
        var assertion = this.createAssertionFromPredicate(predicate);
        this.registerAssert("assert" + baseName, assertion, true);
        this.registerAssert("verify" + baseName, assertion, false);

        var invertedPredicate = this._invertPredicate(predicate);
        var negativeAssertion = this.createAssertionFromPredicate(invertedPredicate);
        this.registerAssert("assert" + this._invertPredicateName(baseName), negativeAssertion, true);
        this.registerAssert("verify" + this._invertPredicateName(baseName), negativeAssertion, false);
    },

    // Convert an isBlahBlah(target, value) function into a waitForBlahBlah(target, value) function.
    createWaitForActionFromPredicate: function(predicate) {
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
    },

    registerWaitForCommandsForPredicate: function(commandTarget, baseName, predicateMethod) {
        // Register a waitForBlahBlah and waitForNotBlahBlah based on the specified accessor.
        var waitForAction = this.createWaitForActionFromPredicate(predicateMethod);
        this.registerAction("waitFor" + baseName, waitForAction.bind(commandTarget), false, true);
        var invertedPredicate = this._invertPredicate(predicateMethod);
        var waitForNotAction = this.createWaitForActionFromPredicate(invertedPredicate);
        this.registerAction("waitFor" + this._invertPredicateName(baseName), waitForNotAction.bind(commandTarget), false, true);
        //TODO decide remove "waitForNot.*Present" action name or not
        //for the back compatiblity issues we still make waitForNot.*Present availble
        this.registerAction("waitForNot" + baseName, waitForNotAction.bind(commandTarget), false, true);
    },

    registerStoreCommandBasedOnAccessor: function(baseName, accessorBlock, accessorArity) {
        var action;
        if (accessorArity == 1) {
            action = function(target, varName) {
                storedVars[varName] = accessorBlock(target);
            };
        } else {
            action = function(varName) {
                storedVars[varName] = accessorBlock();
            };
        }
        this.registerAction("store" + baseName, action, false, true);
    }

});

function PredicateResult(isTrue, message) {
    this.isTrue = isTrue;
    this.message = message;
}

// NOTE: The CommandHandler is effectively an abstract base for
// various handlers including ActionHandler, AccessorHandler and AssertHandler.
// Subclasses need to implement an execute(seleniumApi, command) function,
// where seleniumApi is the Selenium object, and command a SeleniumCommand object.
function CommandHandler(type, haltOnFailure) {
    this.type = type;
    this.haltOnFailure = haltOnFailure;
}

// An ActionHandler is a command handler that executes the sepcified action,
// possibly checking for alerts and confirmations (if checkAlerts is set), and
// possibly waiting for a page load if wait is set.
function ActionHandler(actionBlock, wait, dontCheckAlerts) {
    this.actionBlock = actionBlock;
    CommandHandler.call(this, "action", true);
    if (wait) {
        this.wait = true;
    }
    // note that dontCheckAlerts could be undefined!!!
    this.checkAlerts = (dontCheckAlerts) ? false : true;
}
ActionHandler.prototype = new CommandHandler;
ActionHandler.prototype.execute = function(seleniumApi, command) {
    if (this.checkAlerts && (null==/(Alert|Confirmation)(Not)?Present/.exec(command.command))) {
        // todo: this conditional logic is ugly
        seleniumApi.ensureNoUnhandledPopups();
    }
    var terminationCondition = this.actionBlock(command.target, command.value);
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

function AccessorHandler(accessorMethod) {
    this.accessorMethod = accessorMethod;
    CommandHandler.call(this, "accessor", true);
}
AccessorHandler.prototype = new CommandHandler;
AccessorHandler.prototype.execute = function(seleniumApi, command) {
    var returnValue = this.accessorMethod.call(seleniumApi, command.target, command.value);
    return new AccessorResult(returnValue);
};

function AccessorResult(result) {
    this.result = result;
}

/**
 * Handler for assertions and verifications.
 */
function AssertHandler(assertMethod, haltOnFailure) {
    this.assertMethod = assertMethod;
    CommandHandler.call(this, "assert", haltOnFailure || false);
}
AssertHandler.prototype = new CommandHandler;
AssertHandler.prototype.execute = function(seleniumApi, command) {
    var result = new AssertResult();
    try {
        this.assertMethod.call(seleniumApi, command.target, command.value);
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

