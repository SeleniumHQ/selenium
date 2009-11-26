function AlertHandlingTest(name) {
    TestCase.call(this,name);
}

AlertHandlingTest.prototype = new TestCase();
AlertHandlingTest.prototype.setUp = function() {
    this.alertTestWindow = windowMaker();
    alertTestBrowserBot = BrowserBot.createForWindow(this.alertTestWindow);
    alertTestBrowserBot.getCurrentPage();
    selenium = {}
}

AlertHandlingTest.prototype.testShouldNotReportAnyAlertsIfNoneHaveBeenGenerated = function() {
    this.assertFalse(alertTestBrowserBot.hasAlerts());
    this.assertUndefined(alertTestBrowserBot.getNextAlert());
}

AlertHandlingTest.prototype.testShouldReportMultipleAlertsInOrderIfGenerated = function() {
    this.alertTestWindow.alert("Warning: unfunny joke ahead");
    this.alertTestWindow.alert("Be Alert, We need more Lerts");

    this.assertTrue(alertTestBrowserBot.hasAlerts());
    this.assertEquals("Warning: unfunny joke ahead", alertTestBrowserBot.getNextAlert());
    this.assertTrue(alertTestBrowserBot.hasAlerts());
    this.assertEquals("Be Alert, We need more Lerts", alertTestBrowserBot.getNextAlert());
    this.assertFalse(alertTestBrowserBot.hasAlerts());
}

AlertHandlingTest.prototype.testShouldRemoveAlertWhenItIsRetreived = function() {
    this.alertTestWindow.alert("Be Alert, Not Alarmed");

    this.assertTrue(alertTestBrowserBot.hasAlerts());
    this.assertNotUndefined(alertTestBrowserBot.getNextAlert());
    this.assertFalse(alertTestBrowserBot.hasAlerts());
    this.assertUndefined(alertTestBrowserBot.getNextAlert());
}


AlertHandlingTest.prototype.testShouldReportSingleAlertIfGenerated = function() {
    this.alertTestWindow.alert("Be Alert, Not Alarmed");
    this.assertTrue(alertTestBrowserBot.hasAlerts());
    this.assertEquals("Be Alert, Not Alarmed", alertTestBrowserBot.getNextAlert());
}
