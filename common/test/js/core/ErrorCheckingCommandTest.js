function ErrorCheckingCommandTest(name) {
    TestCase.call(this,name);
}

ErrorCheckingCommandTest.prototype = new TestCase();
ErrorCheckingCommandTest.prototype.setUp = function() {
    this.selenium = new Selenium();
    this.commandFactory = new Mock();
    
    this.testCase = new Mock();
    this.testCase.expects("reset");
    
    this.testCase.testDocument = {
        getElementById : function() {},
        location: { href: "test.html" }
    }
    
    var metrics = {
        numCommandErrors : 0
    };
    
    this.oldHtmlTestRunner = htmlTestRunner;
    
    htmlTestRunner = {
        markFailed : function(){}
    };
    
    currentTest = new HtmlRunnerTestLoop(this.testCase, metrics, this.commandFactory);
    currentTest.currentRow = {
        markDone : function() {}
    }
}

ErrorCheckingCommandTest.prototype.tearDown = function() {
    htmlTestRunner = this.oldHtmlTestRunner;
    currentTest = null;
}

ErrorCheckingCommandTest.prototype.verifyMocks = function() {
    this.commandFactory.verify();
    this.testCase.verify();
}

ErrorCheckingCommandTest.prototype.testMustProvideMessageToExpectFailure = function() {
    try {
        this.selenium.assertFailureOnNext();
    }
    catch (expected) {
        return;
    }
    this.fail("Message is a required parameter");
};

ErrorCheckingCommandTest.prototype.testExpectFailureSucceedsWhenSubsequentCommandFails = function() {
    var failingCommand = new Mock();
    failingCommand.expects("execute").returns({failed:true, failureMessage: "Expected failure message"});
    this.commandFactory.expects("getCommandHandler", "cmd").returns(failingCommand);

    this.selenium.assertFailureOnNext("Expected failure message");
    currentTest.expectedFailureJustSet = false;
    var result = currentTest.commandFactory.getCommandHandler("cmd").execute();
    currentTest._checkExpectedFailure(result);
    this.assertTrue(result.passed);
    this.verifyMocks();
};

ErrorCheckingCommandTest.prototype.testExpectFailureFailsWhenSubsequentCommandFailsWithTheWrongMessage = function() {
    var failingCommand = new Mock();
    failingCommand.expects("execute").returns({failed:true, failureMessage: "foo"});
    this.commandFactory.expects("getCommandHandler", "cmd").returns(failingCommand);

    this.selenium.assertFailureOnNext("bar");
    currentTest.expectedFailureJustSet = false;
    var result = currentTest.commandFactory.getCommandHandler("cmd").execute();
    currentTest._checkExpectedFailure(result);
    this.assertTrue(result.failed);
    this.assertEquals("Expected failure message 'bar' but was 'foo'", result.failureMessage);
    this.verifyMocks();
};

ErrorCheckingCommandTest.prototype.testExpectFailureFailsWhenSubsequentCommandPasses = function() {
    var successCommand = new Mock();
    successCommand.expects("execute").returns({passed:true});
    this.commandFactory.expects("getCommandHandler", "foo").returns(successCommand);

    this.selenium.assertFailureOnNext("expectedFailureMessage");
    currentTest.expectedFailureJustSet = false;
    var result = currentTest.commandFactory.getCommandHandler("foo").execute();
    currentTest._checkExpectedFailure(result);
    this.assertTrue(result.failed);
    this.assertEquals("Expected failure did not occur.", result.failureMessage);
    this.verifyMocks();
};

ErrorCheckingCommandTest.prototype.testExpectFailureFailsWhenSubsequentCommandErrors = function() {
    var msg = "error message";
    this.selenium.assertFailureOnNext(msg);
    currentTest.expectedFailureJustSet = false;
    this.testCase.expects("addErrorMessage", "Expected failure, but error occurred instead", currentTest.currentRow);
    var handled = currentTest.commandError("error message");
    this.assertTrue(!handled);
    this.verifyMocks();
};

ErrorCheckingCommandTest.prototype.testMustProvideMessageToExpectError = function() {
    try {
        this.selenium.assertErrorOnNext();
    }
    catch (expected) {
        return;
    }
    this.fail("Message is a required parameter");
};

ErrorCheckingCommandTest.prototype.testExpectErrorSucceedsWhenSubsequentCommandErrors = function() {
    var msg = "error message";
    this.selenium.assertErrorOnNext(msg);
    currentTest.expectedFailureJustSet = false;
    var handled = currentTest.commandError("error message");
    this.assertTrue(handled);
    this.verifyMocks();
};

ErrorCheckingCommandTest.prototype.testExpectErrorFailsWhenSubsequentCommandErrorsWithTheWrongMessage = function() {
    this.selenium.assertErrorOnNext("expectedError");
    currentTest.expectedFailureJustSet = false;
    this.testCase.expects("addErrorMessage", "Expected error message 'expectedError' but was 'actualError'", currentTest.currentRow);
    var handled = currentTest.commandError("actualError");
    this.assertTrue(!handled);
    this.verifyMocks();
};

 ErrorCheckingCommandTest.prototype.testExpectErrorFailsWhenSubsequentCommandPasses = function() {
    var successCommand = new Mock();
    successCommand.expects("execute").returns({passed:true});
    this.commandFactory.expects("getCommandHandler", "foo").returns(successCommand);

    this.selenium.assertErrorOnNext("Expected error message");
    currentTest.expectedFailureJustSet = false;
    var result = currentTest.commandFactory.getCommandHandler("foo").execute();
    currentTest._checkExpectedFailure(result);
    this.assertTrue(result.failed);
    this.assertEquals("Expected error did not occur.", result.failureMessage);
    this.verifyMocks();
};

ErrorCheckingCommandTest.prototype.testExpectErrorFailsWhenSubsequentCommandFails = function() {
    var failingCommand = new Mock();
    failingCommand.expects("execute").returns({failed:true, failureMessage: "message"});
    this.commandFactory.expects("getCommandHandler", "cmd").returns(failingCommand);

    this.selenium.assertErrorOnNext("message");
    currentTest.expectedFailureJustSet = false;
    var result = currentTest.commandFactory.getCommandHandler("cmd").execute();
    currentTest._checkExpectedFailure(result);
    this.assertTrue(result.failed);
    
    this.assertEquals("Expected error, but failure occurred instead", result.failureMessage);
    this.verifyMocks();
};
