/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;

import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.html5.Html5Tests;
import org.openqa.selenium.interactions.InteractionTests;
import org.openqa.selenium.logging.AvailableLogsTest;
import org.openqa.selenium.logging.GetLogsTest;
import org.openqa.selenium.logging.PerformanceLoggingTest;
import org.openqa.selenium.support.ui.SelectElementTest;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.ParallelSuite;

@RunWith(ParallelSuite.class)
@Suite.SuiteClasses({
    AlertsTest.class,
    AtomsInjectionTest.class,
    AuthenticatedPageLoadingTest.class,
    AvailableLogsTest.class,
    ByTest.class,
    ChildrenFindingTest.class,
    ClearTest.class,
    ClickScrollingTest.class,
    ClickTest.class,
    CookieImplementationTest.class,
    CorrectEventFiringTest.class,
    DragAndDropTest.class,
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
    GetMultipleAttributeTest.class,
    I18nTest.class,
    ImplicitWaitTest.class,
    JavascriptEnabledDriverTest.class,
    MiscTest.class,
    ObjectStateAssumptionsTest.class,
    OpacityTest.class,
    PageLoadingTest.class,
    PartialLinkTextMatchTest.class,
    PerformanceLoggingTest.class,
    ProxySettingTest.class,
    RenderedWebElementTest.class,
    RotatableTest.class,
    SelectElementTest.class,
    SelectElementHandlingTest.class,
    SessionHandlingTest.class,
    SlowLoadingPageTest.class,
    StaleElementReferenceTest.class,
    SvgElementTest.class,
    TagNameTest.class,
    TakesScreenshotTest.class,
    TextHandlingTest.class,
    TextPagesTest.class,
    TypingTest.class,
    UnexpectedAlertBehaviorTest.class,
    UploadTest.class,
    VisibilityTest.class,
    WebElementTest.class,
    WindowSwitchingTest.class,
    WindowTest.class,
    XPathElementFindingTest.class,

    Html5Tests.class,
    InteractionTests.class
})
public class StandardSeleniumTests {

  @BeforeClass
  public static void prepareCommonEnvironment() {
    GlobalTestEnvironment.get(InProcessTestEnvironment.class);
  }

  @AfterClass
  public static void cleanUpDriver() {
    JUnit4TestBase.removeDriver();
  }
}
