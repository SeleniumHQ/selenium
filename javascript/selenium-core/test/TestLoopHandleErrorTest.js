function TestLoopHandleErrorTest(name) {
    TestCase.call(this,name);
}

TestLoopHandleErrorTest.prototype = new TestCase();
TestLoopHandleErrorTest.prototype.setUp = function() {
    this.oldLOG = LOG;
    this.oldSelenium = selenium;
    
    commandFactory = new Mock();
    // DGF We want to do assertions on the LOG, but only after setup
    LOG = { info: function() {} };
    
    selenium = new Selenium();
    htmlTestCase = new Object();
    htmlTestCase.reset = function() {
    };
    this.seleniumTest = new HtmlRunnerTestLoop(htmlTestCase, false, commandFactory);
    // We want to verify that testLoop.commandError() function is called appropriately
    // by testLoop.handleCommandError()
    LOG = new Mock();   
    commandErrorHandler = new Mock();
    this.seleniumTest.commandError = function(message) {
        commandErrorHandler.handleError(message);
    };
}

TestLoopHandleErrorTest.prototype.tearDown = function() {
    LOG = this.oldLOG;
    selenium = this.oldSelenium;
    htmlTestCase = undefined;
    commandFactory = undefined;
    commandErrorHandler = undefined;
}

TestLoopHandleErrorTest.prototype.verifyMocks = function() {
    this.commandFactory.verify();
    LOG.verify();
    commandErrorHandler.verify();
}

TestLoopHandleErrorTest.prototype.testOrdinaryCommandError = function() {
    var error = new SeleniumError("Test Error");
    LOG.expects("error", "Test Error");
    commandErrorHandler.expects("handleError", "Test Error");
    this.seleniumTest._handleCommandError(error);
};

TestLoopHandleErrorTest.prototype.testSeleniumMalfunction = function() {
    var error = new Error("Test Error");
    LOG.expects("exception", error);
    commandErrorHandler.expects("handleError", "Command execution failure. Please search the user group at https://groups.google.com/forum/#!forum/selenium-users for error details from the log window.");
    this.seleniumTest._handleCommandError(error);
};

