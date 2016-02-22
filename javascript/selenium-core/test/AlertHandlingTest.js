// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

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
