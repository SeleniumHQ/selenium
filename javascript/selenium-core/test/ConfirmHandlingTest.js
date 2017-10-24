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
