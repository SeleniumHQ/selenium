function ConfirmHandlingTest(name) {
    TestCase.call(this,name);
}

ConfirmHandlingTest.prototype = new TestCase();
ConfirmHandlingTest.prototype.setUp = function() {
    this.testWindow = windowMaker();
    browserBot = BrowserBot.createForWindow(this.testWindow);
    browserBot.getCurrentPage();
}

ConfirmHandlingTest.prototype.testShouldConfirmConfirmationsByDefault = function() {
    this.assertTrue(this.testWindow.confirm("Continue?"));
}

ConfirmHandlingTest.prototype.testShouldCancelConfirmationIfPreviouslyInstructedTo = function() {
    browserBot.cancelNextConfirmation(false);
    this.assertFalse(this.testWindow.confirm("Continue?"));
}

ConfirmHandlingTest.prototype.testShouldRevertToDefaultBehaviourAfterCancellingConfirmation = function() {
    browserBot.cancelNextConfirmation(false);
    this.testWindow.confirm("Continue?");
    this.testShouldConfirmConfirmationsByDefault();
}

ConfirmHandlingTest.prototype.testShouldNotReportAnyConfirmationsIfNoneHaveBeenGenerated = function() {
    this.assertFalse(browserBot.hasConfirmations());
    this.assertUndefined(browserBot.getNextConfirmation());
}

ConfirmHandlingTest.prototype.testShouldReportSingleConfirmationIfGenerated = function() {
    this.testWindow.confirm("Continue?");

    this.assertTrue(browserBot.hasConfirmations());
    this.assertEquals("Continue?", browserBot.getNextConfirmation());
}

ConfirmHandlingTest.prototype.testShouldReportMultipleConfirmationsInOrderIfGenerated = function() {
    this.testWindow.confirm("Continue?");
    this.testWindow.confirm("Really Continue?");

    this.assertTrue(browserBot.hasConfirmations());
    this.assertEquals("Continue?", browserBot.getNextConfirmation());
    this.assertTrue(browserBot.hasConfirmations());
    this.assertEquals("Really Continue?", browserBot.getNextConfirmation());
    this.assertFalse(browserBot.hasConfirmations());
}

ConfirmHandlingTest.prototype.testShouldRemoveConfirmationWhenItIsRetreived = function() {
    this.testWindow.confirm("Continue?");

    this.assertTrue(browserBot.hasConfirmations());
    this.assertNotUndefined(browserBot.getNextConfirmation());
    this.assertFalse(browserBot.hasConfirmations());
    this.assertUndefined(browserBot.getNextConfirmation());
}
