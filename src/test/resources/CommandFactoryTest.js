function CommandFactoryTest(name) {
    TestCase.call(this,name);
}

CommandFactoryTest.prototype = new TestCase();
CommandFactoryTest.prototype.setUp = function() {
    LOG = new DummyLogger();
    this.oldSelenium = Selenium;
    Selenium = new Object();
    Selenium.decorateFunctionWithTimeout = function(f, timeout) {
        return f;
    }
    // Allow mocking of Function.prototype.bind()
    String.prototype.bind = function(target) {
        return "commandTarget." + this;
    }
}

CommandFactoryTest.prototype.tearDown = function() {
    Selenium = this.oldSelenium;
}

CommandFactoryTest.prototype.testSample = function() {
    this.assertTrue(true);
}




CommandFactoryTest.prototype.testNullIsReturnedForUnknownCommands = function() {
    var factory = new CommandHandlerFactory();
    this.assertUndefined(factory.getCommandHandler("unknown"));
}

CommandFactoryTest.prototype.testActionHandlerConstructorWithNoValueForDontCheckAlerts = function() {
    var handler = new ActionHandler({}, false, this.someUndefinedProperty);
    this.assertTrue("Should be checking", handler.checkAlerts);
    this.assertEquals("action", handler.type);
    this.assertTrue("Should halt on failure", handler.haltOnFailure);
    this.assertUndefined("Should not be waiting", handler.wait);
};

CommandFactoryTest.prototype.testActionsAreTypedAndAvailableAfterRegistrationInCommandHandlerFactory = function() {
    var factory = new CommandHandlerFactory();
    factory.registerAction("myAction", fnBind("actionFunction", this));

    var myAction = factory.getCommandHandler("myAction");
    this.assertNotUndefined(myAction);
    this.assertEquals(CommandHandler, myAction.constructor);
    this.assertEquals("actionFunction", myAction.actionBlock.__method);
    this.assertEquals("action", myAction.type);
}

CommandFactoryTest.prototype.testAssertsAreTypedAndAvailableAfterRegistrationInCommandHandlerFactory = function() {
    var factory = new CommandHandlerFactory();
    factory.registerAssert("assertFoo", "assertFunction", true);

    var myAssert = factory.getCommandHandler("assertFoo");
    this.assertNotUndefined(myAssert);
    this.assertEquals(CommandHandler, myAssert.constructor);
    this.assertEquals("assertFunction", myAssert.assertBlock);
    this.assertEquals("assert", myAssert.type);
    this.assertTrue(myAssert.haltOnFailure);
}

CommandFactoryTest.prototype.testAccessorsAreTypedAndAvailableAfterRegistrationInCommandHandlerFactory = function() {
    var factory = new CommandHandlerFactory();
    factory.registerAccessor("getFoo", "accessorBlock");

    var myAccessor = factory.getCommandHandler("getFoo");
    this.assertNotUndefined(myAccessor);
    this.assertEquals(CommandHandler, myAccessor.constructor);
    this.assertEquals("accessorBlock", myAccessor.accessBlock);
    this.assertEquals("accessor", myAccessor.type);
}


CommandFactoryTest.prototype.testCreatePredicateFromSingleArgAccessorReturnsDesiredPredicate = function() {
    var factory = new CommandHandlerFactory();
    var self = this;
    var accessor = function(arg) {
        self.assertEquals("target", arg);
        return this.foo();
    };
    var seleniumApi = {foo: function() {
        return "theValue";
    }};
    var predicate = factory._predicateForSingleArgAccessor(accessor.bind(seleniumApi));

    var result = predicate("target", "regexp:theV[aeiou]lue");
    this.assertEquals("Actual value 'theValue' did match 'regexp:theV[aeiou]lue'", result.message);
    this.assertTrue("Should have matched", result.isTrue);

    var result = predicate("target", "betterNotMatch");
    this.assertEquals("Actual value 'theValue' did not match 'betterNotMatch'", result.message);
    this.assertFalse("Should not have matched", result.isTrue);
}

CommandFactoryTest.prototype.testCreatePredicateFromNoArgAccessorReturnsDesiredPredicate = function() {
    var factory = new CommandHandlerFactory();
    var accessor = function() {
        return this.foo();
    };
    var seleniumApi = {foo: function() {
        return "theValue";
    }};
    var predicate = factory._predicateForNoArgAccessor(accessor.bind(seleniumApi));

    var result = predicate("theV*e", "");
    this.assertEquals("Actual value 'theValue' did match 'theV*e'", result.message);
    this.assertTrue("Should have matched", result.isTrue);

    var result = predicate("betterNotMatch", "");
    this.assertEquals("Actual value 'theValue' did not match 'betterNotMatch'", result.message);
    this.assertFalse("Should not have matched", result.isTrue);
}

CommandFactoryTest.prototype.testCreatePredicateFromAccessorWhenNoArgs = function() {
    var factory = new CommandHandlerFactory();
    factory._predicateForNoArgAccessor = function(accessor) {
        // mock
        return "predicate";
    }
    var accessor = function() {
        return 42;
    };
    var predicate = factory._predicateForAccessor(accessor, false);
    this.assertEquals("predicate", predicate);
};

CommandFactoryTest.prototype.testCreatePredicateFromAccessorWhenOneArg = function() {
    var factory = new CommandHandlerFactory();
    factory._predicateForSingleArgAccessor = function(accessor) {
        // mock
        return "predicate";
    }
    var accessor = function(arg) {
        return 42;
    };
    var predicate = factory._predicateForAccessor(accessor, true);
    this.assertEquals("predicate", predicate);
};

CommandFactoryTest.prototype.testInvertPredicateReturnsDesiredPredicate = function() {
    var factory = new CommandHandlerFactory();
    var seleniumApi = {foo: function() {
        return true;
    }};
    var predicate = function(target, value) {
        return new PredicateResult(this.foo(), "msg");
    };
    var invertedPredicate = factory._invertPredicate(predicate.bind(seleniumApi));
    var result = invertedPredicate("target", "value");
    this.assertFalse("Result should have been negated", result.isTrue);
    this.assertEquals("msg", result.message);
};

CommandFactoryTest.prototype.testCreateAssertionFromPredicateForPositiveCase = function() {
    // Make sure that the method looks at the isTrue property of the result.
    var mockPredicateResult = new Mock();
    mockPredicateResult.expectsProperty("isTrue").returns(true);

    // Make sure that the executeAssertion method invokes the predicate in
    // the context of the Selenium API.
    var mockSeleniumApi = new Mock();
    mockSeleniumApi.expects("foo");

    var self = this;
    var predicate = function(target, value) {
        self.assertEquals("target", target);
        self.assertEquals("value", value);
        this.foo();
        return mockPredicateResult;
    };
    var factory = new CommandHandlerFactory();
    var assertion = factory.createAssertionFromPredicate(predicate.bind(mockSeleniumApi));

    assertion("target", "value");

    mockPredicateResult.verify();
    mockSeleniumApi.verify();
};

CommandFactoryTest.prototype.testCreateAssertionFromPredicateForNegativeCase = function() {
    var predicate = function(target, value) {
        return new PredicateResult(false, "message");
    };
    var factory = new CommandHandlerFactory();
    var assertion = factory.createAssertionFromPredicate(predicate);

    try {
        assertion.call("seleniumApi", "target", "value");
    } catch(e) {
        if (!e.isAssertionFailedError) {
            throw e;
        }
        this.assertEquals("message", e.failureMessage);
        return;
    }
    fail("Should have thrown an exception");
};

CommandFactoryTest.prototype.testCreateWaitForActionFromPredicateSetsCurrentTest = function() {
    // Make sure that the method looks at the isTrue property of the result.
    var mockPredicateResult = new Mock();
    mockPredicateResult.expectsProperty("isTrue").returns(true);

    // Make sure that the executeAssertion method invokes the predicate in
    // the context of the Selenium API.
    var mockSeleniumApi = new Mock();
    mockSeleniumApi.expects("foo");

    var self = this;
    var predicate = function(target, value) {
        self.assertEquals("target", target);
        self.assertEquals("value", value);
        this.foo();
        return mockPredicateResult;
    };
    var factory = new CommandHandlerFactory();
    var actionBlock = factory._waitForActionForPredicate(predicate.bind(mockSeleniumApi));

    var terminationCondition = actionBlock("target", "value");
    this.assertEquals('function', typeof(terminationCondition));
    this.assertTrue(terminationCondition());

    mockPredicateResult.verify();
    mockSeleniumApi.verify();
};

CommandFactoryTest.prototype.testPredicateBasedWaitForActionReturnsFalseForExceptions = function() {
    // We treat exceptions as meaning that the condition is not yet true.
    // Handy for things like waitForValue when the specified element
    // has yet to be created!
    var predicate = function(target, value) {
        throw new Error("test exception");
    };
    var factory = new CommandHandlerFactory();
    var action = factory._waitForActionForPredicate(predicate);

    var terminationCondition = action.call("seleniumApi", "target", "value");
    this.assertFalse(terminationCondition());
};


CommandFactoryTest.prototype.testAllMethodsWithGetPrefixAreRegisteredAsAccessorsByRegisterAll = function() {
    var actionSet = {getOne: "get1", getTwo: "get2", getdontGet: "another"};
    var factory = new CommandHandlerFactory();
    factory.registerAll(actionSet);

    this.assertUndefined(factory.getCommandHandler("getdontGet"));
    this.assertUndefined(factory.getCommandHandler("notEvenClose"));

    this.assertEquals("get1", factory.getCommandHandler("getOne").accessBlock.__method);
    this.assertEquals("get2", factory.getCommandHandler("getTwo").accessBlock.__method);
}

CommandFactoryTest.prototype.testAllMethodsWithGetPrefixAreRegisteredAsAssertsByRegisterAll = function() {
    var actionSet = {getOne: function(target) {
        return target + "foo";
    }, getTwo: "get2", getdontGet: "another"};
    var factory = new CommandHandlerFactory();
    factory.registerAll(actionSet);

    this.assertUndefined(factory.getCommandHandler("assertdontGet"));
    this.assertUndefined(factory.getCommandHandler("notEvenClose"));

    var myAssert = factory.getCommandHandler("assertOne");
    this.assertEquals(CommandHandler, myAssert.constructor);
    this.assertNotUndefined(myAssert.assertBlock);
    this.assertEquals("assert", myAssert.type);
    this.assertTrue(myAssert.haltOnFailure);
}

CommandFactoryTest.prototype.testAllMethodsWithGetPrefixAreRegisteredAsVerifiesByRegisterAll = function() {
    var actionSet = {getOne: function(target) {
        return target + "foo";
    }, getTwo: "get2", getdontGet: "another"};
    var factory = new CommandHandlerFactory();
    factory.registerAll(actionSet);

    var myAssert = factory.getCommandHandler("verifyOne");
    this.assertEquals(CommandHandler, myAssert.constructor);
    this.assertNotUndefined(myAssert.assertBlock);
    this.assertEquals("assert", myAssert.type);
    this.assertFalse(myAssert.haltOnFailure);
}

CommandFactoryTest.prototype.testAllMethodsWithGetPrefixAreRegisteredAsAssertNotsByRegisterAll = function() {
    var actionSet = {getOne: function(target) {
        return target + "foo";
    }, getTwo: "get2", getdontGet: "another"};
    var factory = new CommandHandlerFactory();
    factory.registerAll(actionSet);

    var myAssert = factory.getCommandHandler("assertNotOne");
    this.assertEquals(CommandHandler, myAssert.constructor);
    this.assertNotUndefined(myAssert.assertBlock);
    this.assertEquals("assert", myAssert.type);
    this.assertTrue(myAssert.haltOnFailure);
    try {
        myAssert.assertBlock("blah", "blahfoo");
        fail("Should have thrown an exception");
    }
    catch (e) {
        // Expected.
    }
}

CommandFactoryTest.prototype.testAllMethodsWithGetPrefixAreRegisteredAsVerifyNotsByRegisterAll = function() {
    var actionSet = {getOne: function(target) {
        return target + "foo";
    }, getTwo: "get2", getdontGet: "another"};
    var factory = new CommandHandlerFactory();
    factory.registerAll(actionSet);

    var myAssert = factory.getCommandHandler("verifyNotOne");
    this.assertEquals(CommandHandler, myAssert.constructor);
    this.assertNotUndefined(myAssert.assertBlock);
    this.assertEquals("assert", myAssert.type);
    this.assertFalse(myAssert.haltOnFailure);
    try {
        myAssert.assertBlock("blah", "blahfoo");
        fail("Should have thrown an exception");
    }
    catch (e) {
        // Expected.
    }
}

// This object is normally declared in selenium-api.js
storedVars = new Object();

CommandFactoryTest.prototype.testAllMethodsWithGetPrefixAreRegisteredAsStoreCommandsByRegisterAll = function() {
    var actionSet = {getOne: function(target) {
        return target + "foo";
    }, getTwo: "get2", getdontGet: "another"};
    var factory = new CommandHandlerFactory();
    factory.registerAll(actionSet);

    var storeCommand = factory.getCommandHandler("storeOne");
    this.assertEquals(CommandHandler, storeCommand.constructor);
    this.assertNotUndefined(storeCommand.actionBlock);
    this.assertEquals("action", storeCommand.type);
    this.assertTrue(storeCommand.haltOnFailure);
    storeCommand.actionBlock("mytarget", "myvar");
    this.assertEquals("mytargetfoo", storedVars["myvar"]);
}

CommandFactoryTest.prototype.testAllMethodsWithGetPrefixAreRegisteredAsWaitForCommandsByRegisterAll = function() {
    var actionSet = {getOne: function(target) {
        return target + "foo";
    }, getTwo: "get2", getdontGet: "another"};
    var factory = new CommandHandlerFactory();
    factory.registerAll(actionSet);

    var command = factory.getCommandHandler("waitForOne");
    this.assertEquals(CommandHandler, command.constructor);
    this.assertNotUndefined(command.actionBlock);
    this.assertEquals("action", command.type);
    this.assertTrue(command.haltOnFailure);
}

CommandFactoryTest.prototype.testAllMethodsWithGetPrefixAreRegisteredAsWaitForNotCommandsByRegisterAll = function() {
    var actionSet = {getOne: function(target) {
        return target + "foo";
    }, getTwo: "get2", getdontGet: "another"};
    var factory = new CommandHandlerFactory();
    factory.registerAll(actionSet);

    var command = factory.getCommandHandler("waitForNotOne");
    this.assertEquals(CommandHandler, command.constructor);
    this.assertNotUndefined(command.actionBlock);
    this.assertEquals("action", command.type);
    this.assertTrue(command.haltOnFailure);
}

CommandFactoryTest.prototype.testHaltOnFailureDefaultsToFalseForAsserts = function() {
    var factory = new CommandHandlerFactory();
    factory.registerAssert("doHalt", "assertFunction", true);
    factory.registerAssert("dontHalt", "assertFunction");

    this.assertTrue(factory.getCommandHandler("doHalt").haltOnFailure);
    this.assertFalse(factory.getCommandHandler("dontHalt").haltOnFailure);
}

CommandFactoryTest.prototype.testAllMethodsWithDoPrefixAreRegisteredAsActionsByRegisterAll = function() {
    var actionSet = {doAnAction: "action1", doAnotherAction: "action2", dontRegister: "another"};
    var factory = new CommandHandlerFactory();
    factory.registerAll(actionSet);

    this.assertUndefined(factory.getCommandHandler("dontRegister"));
    this.assertUndefined(factory.getCommandHandler("notEvenClose"));

    this.assertEquals("action1", factory.getCommandHandler("anAction").actionBlock.__method);
    this.assertEquals("action2", factory.getCommandHandler("anotherAction").actionBlock.__method);
}

CommandFactoryTest.prototype.testActionsAreRegisteredWithAndWaitSuffix = function() {
    var actionSet = {doAnAction: "action1"};
    var factory = new CommandHandlerFactory();
    factory.registerAll(actionSet);

    this.assertEquals("action1", factory.getCommandHandler("anAction").actionBlock.__method);
    this.assertEquals("action1", factory.getCommandHandler("anActionAndWait").actionBlock.__method);
    this.assertUndefined(factory.getCommandHandler("anAction").wait);
    this.assertTrue(factory.getCommandHandler("anActionAndWait").wait);
}

CommandFactoryTest.prototype.testAllMethodsWithAssertPrefixAreRegisteredForAssertAndVerifyByRegisterAll = function() {
    var actionSet = {assertSomething: "assert1", assertSomeOtherThing: "assert2", assertionOther: "shouldn't register"};
    var factory = new CommandHandlerFactory();
    factory.registerAll(actionSet);

    this.assertUndefined(factory.getCommandHandler("assertionOther"));
    this.assertUndefined(factory.getCommandHandler("notEvenClose"));

    var myAssert = factory.getCommandHandler("assertSomething");
    this.assertEquals("assert1", myAssert.assertBlock.__method);
    this.assertTrue(myAssert.haltOnFailure);
    this.assertEquals("assert", myAssert.type);

    var myVerify = factory.getCommandHandler("verifySomething");
    this.assertEquals("assert1", myVerify.assertBlock.__method);
    this.assertFalse(myVerify.haltOnFailure);
    this.assertEquals("assert", myVerify.type);

    this.assertEquals("assert2", factory.getCommandHandler("assertSomeOtherThing").assertBlock.__method);
    this.assertEquals("assert2", factory.getCommandHandler("verifySomeOtherThing").assertBlock.__method);
}
