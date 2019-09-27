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

package org.openqa.selenium;

import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.html5.Html5Tests;
import org.openqa.selenium.interactions.InteractionTests;
import org.openqa.selenium.logging.AvailableLogsTest;
import org.openqa.selenium.logging.GetLogsTest;
import org.openqa.selenium.logging.PerformanceLogTypeTest;
import org.openqa.selenium.logging.PerformanceLoggingTest;
import org.openqa.selenium.support.ui.SelectElementTest;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    AlertsTest.class,
    AtomsInjectionTest.class,
    AvailableLogsTest.class,
    ByTest.class,
    ChildrenFindingTest.class,
    ClearTest.class,
    ClickScrollingTest.class,
    ClickTest.class,
    CookieImplementationTest.class,
    ContentEditableTest.class,
    CorrectEventFiringTest.class,
    ElementAttributeTest.class,
    ElementEqualityTest.class,
    ElementFindingTest.class,
    ElementSelectingTest.class,
    ErrorsTest.class,
    ExecutingAsyncJavascriptTest.class,
    ExecutingJavascriptTest.class,
    FormHandlingTest.class,
    FrameSwitchingTest.class,
    GetLogsTest.class,
    I18nTest.class,
    ImplicitWaitTest.class,
    JavascriptEnabledDriverTest.class,
    MiscTest.class,
    PageLoadingTest.class,
    PerformanceLoggingTest.class,
    PerformanceLogTypeTest.class,
    PositionAndSizeTest.class,
    ProxySettingTest.class,
    ReferrerTest.class,
    CssValueTest.class,
    RotatableTest.class,
    SelectElementTest.class,
    SelectElementHandlingTest.class,
    SessionHandlingTest.class,
    SlowLoadingPageTest.class,
    StaleElementReferenceTest.class,
    SvgElementTest.class,
    SvgDocumentTest.class,
    TakesScreenshotTest.class,
    TextHandlingTest.class,
    TextPagesTest.class,
    TypingTest.class,
    UnexpectedAlertBehaviorTest.class,
    UploadTest.class,
    VisibilityTest.class,
    WebElementTest.class,
    WindowSwitchingTest.class,
    ContextSwitchingTest.class,
    WindowTest.class,

    Html5Tests.class,
    InteractionTests.class
})
public class StandardSeleniumTests {

  @BeforeClass
  public static void prepareCommonEnvironment() {
    GlobalTestEnvironment.get(InProcessTestEnvironment.class);
  }
}
