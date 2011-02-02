function CommandHandlerTest(name) {
    TestCase.call(this,name);
}

CommandHandlerTest.prototype = new TestCase();
CommandHandlerTest.prototype.setUp = function() {
}

CommandHandlerTest.prototype.testActionCommandsShouldCheckForUnhandledPopups = function() {

     var mockSelenium = new Mock();
     mockSelenium.expects("ensureNoUnhandledPopups");

     var noop = function() {};
     var handler = new ActionHandler(noop, false);
     handler.execute(mockSelenium, "command");

     mockSelenium.verify();
}


CommandHandlerTest.prototype.testAccessorHandlerShouldReturnResultInCommandResult = function() {
        function MockSelenium() {
     }

        var executorCalled = false;
        var executor = function() { executorCalled = true; return "foo"; };
        var handler = new AccessorHandler(executor, false);

        result = handler.execute(new MockSelenium(), "command");

        this.assertTrue(executorCalled);
        this.assertEquals("foo", result.result);
}
