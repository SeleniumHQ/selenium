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

package com.thoughtworks.selenium;

import com.thoughtworks.selenium.corebased.TestAddLocationStrategy;
import com.thoughtworks.selenium.corebased.TestAddSelection;
import com.thoughtworks.selenium.corebased.TestAlerts;
import com.thoughtworks.selenium.corebased.TestBasicAuth;
import com.thoughtworks.selenium.corebased.TestBrowserVersion;
import com.thoughtworks.selenium.corebased.TestCheckUncheck;
import com.thoughtworks.selenium.corebased.TestClick;
import org.junit.platform.suite.api.SelectClasses;
import org.junit.platform.suite.api.Suite;

@SelectClasses({
    TestAddLocationStrategy.class,
    TestAddSelection.class,
    TestAlerts.class,
    TestBasicAuth.class,
    TestBrowserVersion.class,
    TestCheckUncheck.class,
    TestClick.class,
//    TestClickAt.class,
//    TestClickBlankTarget.class,
//    TestClickJavascriptHref.class,
//    TestClickJavascriptHrefChrome.class,
//    TestClickJavascriptHrefWithVoidChrome.class,
//    TestCommandError.class,
//    TestComments.class,
//    TestConfirmations.class,
//    TestCookie.class,
//    TestCssLocators.class,
//    TestCursorPosition.class,
//    TestDojoDragAndDrop.class,
//    TestDomainCookie.class,
//    TestDragAndDrop.class,
//    TestEditable.class,
//    TestElementIndex.class,
//    TestElementOrder.class,
//    TestElementPresent.class,
//    TestErrorChecking.class,
//    TestEval.class,
//    TestEvilClosingWindow.class,
//    TestFailingAssert.class,
//    TestFailingVerifications.class,
//    TestFocusOnBlur.class,
//    TestFramesClick.class,
//    TestFramesClickJavascriptHref.class,
//    TestFramesNested.class,
//    TestFramesOpen.class,
//    TestFramesSpecialTargets.class,
//    TestFunkEventHandling.class,
//    TestGet.class,
//    TestGetTextContent.class,
//    TestGettingValueOfCheckbox.class,
//    TestGettingValueOfRadioButton.class,
//    TestGoBack.class,
//    TestHighlight.class,
//    TestHtmlSource.class,
//    TestImplicitLocators.class,
//    TestJavaScriptAttributes.class,
//    TestJavascriptParameters.class,
//    TestLocators.class,
//    TestLargeHtml.class,
//    TestModalDialog.class,
//    TestMultiSelect.class,
//    TestOpen.class,
//    TestOpenInTargetFrame.class,
//    TestPatternMatching.class,
//    TestPause.class,
//    TestPrompt.class,
//    TestProxy.class,
//    TestQuickOpen.class,
//    TestRefresh.class,
//    TestRollup.class,
//    TestSelect.class,
//    TestSelectMultiLevelFrame.class,
//    TestSelectPopUp.class,
//    TestSelectWindow.class,
//    TestSelectWindowTitle.class,
//    TestSetSpeed.class,
//    TestStore.class,
//    TestSubmit.class,
//    TestTextWhitespace.class,
//    TestType.class,
//    TestTypeRichText.class,
//    TestUIElementLocators.class,
//    TestUseXpathLibrary.class,
//    TestVerifications.class,
//    TestVisibility.class,
//    TestWait.class,
//    TestWaitFor.class,
//    TestWaitForNot.class,
//    TestWaitInPopupWindow.class,
//    TestXPathLocatorInXHtml.class,
//    TestXPathLocators.class,
//    RealDealIntegrationTest.class
})
@Suite
public class SeleniumRcTestSuite extends BaseSuite {
  // empty
}
