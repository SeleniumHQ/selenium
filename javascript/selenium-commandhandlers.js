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
    }

    this.registerAccessor = function(name, accessor) {
        var handler = new AccessorHandler(accessor);
        this.accessors[name] = handler;
    }

    this.registerAssert = function(name, assertion, haltOnFailure) {
        var handler = new AssertHandler(assertion, haltOnFailure);
        this.asserts[name] = handler;
    }

    this.getCommandHandler = function(name) {
        return this.actions[name] || this.accessors[name] || this.asserts[name] || null;
    }

    this.registerAll = function(commandObject) {
        registerAllActions(commandObject);
        registerAllAsserts(commandObject);
        registerAllAccessors(commandObject);
    }

    var registerAllActions = function(commandObject) {
        for (var functionName in commandObject) {
            if (/^do([A-Z].+)$/.exec(functionName) != null) {
                var actionName = RegExp["$1"].toCamelCase();
                // Register the action without the wait flag.
                var action = commandObject[functionName];
                self.registerAction(actionName, action, false);

                // Register actionName + "AndWait" with the wait flag;
                var waitActionName = actionName + "AndWait";
                self.registerAction(waitActionName, action, true);
            }
        }
    }

    var registerAllAsserts = function(commandObject) {
        for (var functionName in commandObject) {
            if (/^assert([A-Z].+)$/.exec(functionName) != null) {
                var assertName = functionName;
                var verifyName = "verify" + RegExp["$1"];
                var assert = commandObject[functionName];
                self.registerAssert(assertName, assert, true);
                self.registerAssert(verifyName, assert, false);
            }
        }
    }

    var registerAllAccessors = function(commandObject) {
        for (var functionName in commandObject) {
            if (/^get[A-Z].+$/.exec(functionName) != null) {
                var accessor = commandObject[functionName];
                self.registerAccessor(functionName, accessor);
            }
        }
    }
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
}

function ActionHandler(action, wait) {
    this.base = CommandHandler;
    this.base("action", true, action);
    if (wait) {
        this.wait = true;
    }
}
ActionHandler.prototype = new CommandHandler;
ActionHandler.prototype.execute = function(seleniumApi, command) {
    if ( seleniumApi.browserbot.hasAlerts() ) {
       throw new Error("There was an unexpected Alert! [" + seleniumApi.browserbot.getNextAlert() + "]");
    }
    var processState = this.executor.call(seleniumApi, command.target, command.value)
    // If the handler didn't return a wait flag, check to see if the
    // handler was registered with the wait flag.
    if (processState == undefined && this.wait) {
       processState = SELENIUM_PROCESS_WAIT;
    }
    return new CommandResult(processState);
}

function AccessorHandler(accessor) {
    this.base = CommandHandler;
    this.base("accessor", true, accessor);
}
AccessorHandler.prototype = new CommandHandler;

function AssertHandler(assertion, haltOnFailure) {
    this.base = CommandHandler;
    this.base("assert", haltOnFailure || false, assertion);
}
AssertHandler.prototype = new CommandHandler;
AssertHandler.prototype.execute = function(seleniumApi, command) {
    var result = new CommandResult();
    try {
        var processState = this.executor.call(seleniumApi, command.target, command.value);
        result.passed = true;
    } catch (e) {
        // If this is not a JsUnitException, or we should haltOnFailure, rethrow.
        if (!e.isJsUnitException) {
            throw e;
        }
        if (this.haltOnFailure) {
            throw new Error(e.jsUnitMessage);
        }
        result.failed = true;
        result.failureMessage = e.jsUnitMessage;
    }
    return result;
}

function CommandResult(processState) {
    this.processState = processState;
    this.result = "OK";
}

function SeleniumCommand(command, target, value) {
    this.command = command;
    this.target = target;
    this.value = value;
}
