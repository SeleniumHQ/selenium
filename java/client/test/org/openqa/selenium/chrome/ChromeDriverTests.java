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

package org.openqa.selenium.chrome;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.model.InitializationError;

@RunWith(ChromeDriverTests.ChromeTestRunner.class)
public class ChromeDriverTests {
  /* Use a custom suite to enable use of Class.forName, which is not allowed
      by the annotations. This isolates tests run by ChromeDriver from changes
      in the build tools. */ 
  public static class ChromeTestRunner extends Suite {
    public ChromeTestRunner(Class<?> setupClass) throws InitializationError,
      ClassNotFoundException {
      super(setupClass, listTests());
    }
    
    public static Class[] listTests() throws ClassNotFoundException {
      return new Class[]{
        ChromeOptionsFunctionalTest.class,
        ChromeDriverFunctionalTest.class,
        
        Class.forName("org.openqa.selenium.AlertsTest"),
        Class.forName("org.openqa.selenium.AtomsInjectionTest"),
        Class.forName("org.openqa.selenium.ByTest"),
        Class.forName("org.openqa.selenium.ChildrenFindingTest"),
        Class.forName("org.openqa.selenium.ClearTest"),
        Class.forName("org.openqa.selenium.ClickScrollingTest"),
        Class.forName("org.openqa.selenium.ClickTest"),
        Class.forName("org.openqa.selenium.CookieImplementationTest"),
        Class.forName("org.openqa.selenium.ContentEditableTest"),
        Class.forName("org.openqa.selenium.CorrectEventFiringTest"),
        Class.forName("org.openqa.selenium.ElementAttributeTest"),
        Class.forName("org.openqa.selenium.ElementEqualityTest"),
        Class.forName("org.openqa.selenium.ElementFindingTest"),
        Class.forName("org.openqa.selenium.ElementSelectingTest"),
        Class.forName("org.openqa.selenium.ErrorsTest"),
        Class.forName("org.openqa.selenium.ExecutingAsyncJavascriptTest"),
        Class.forName("org.openqa.selenium.ExecutingJavascriptTest"),
        Class.forName("org.openqa.selenium.FormHandlingTest"),
        Class.forName("org.openqa.selenium.FrameSwitchingTest"),
        Class.forName("org.openqa.selenium.I18nTest"),
        Class.forName("org.openqa.selenium.ImplicitWaitTest"),
        Class.forName("org.openqa.selenium.JavascriptEnabledDriverTest"),
        Class.forName("org.openqa.selenium.MiscTest"),
        Class.forName("org.openqa.selenium.PageLoadingTest"),
        Class.forName("org.openqa.selenium.PositionAndSizeTest"),
        Class.forName("org.openqa.selenium.ProxySettingTest"),
        Class.forName("org.openqa.selenium.ReferrerTest"),
        Class.forName("org.openqa.selenium.CssValueTest"),
        Class.forName("org.openqa.selenium.RotatableTest"),
        Class.forName("org.openqa.selenium.SelectElementHandlingTest"),
        Class.forName("org.openqa.selenium.SessionHandlingTest"),
        Class.forName("org.openqa.selenium.SlowLoadingPageTest"),
        Class.forName("org.openqa.selenium.StaleElementReferenceTest"),
        Class.forName("org.openqa.selenium.SvgElementTest"),
        Class.forName("org.openqa.selenium.SvgDocumentTest"),
        Class.forName("org.openqa.selenium.TakesScreenshotTest"),
        Class.forName("org.openqa.selenium.TextHandlingTest"),
        Class.forName("org.openqa.selenium.TextPagesTest"),
        Class.forName("org.openqa.selenium.TypingTest"),
        Class.forName("org.openqa.selenium.UnexpectedAlertBehaviorTest"),
        Class.forName("org.openqa.selenium.UploadTest"),
        Class.forName("org.openqa.selenium.VisibilityTest"),
        Class.forName("org.openqa.selenium.WebElementTest"),
        Class.forName("org.openqa.selenium.WindowSwitchingTest"),
        Class.forName("org.openqa.selenium.ContextSwitchingTest"),
        Class.forName("org.openqa.selenium.WindowTest"),        

        Class.forName("org.openqa.selenium.devtools.ChromeDevToolsApplicationCacheTest"),
        Class.forName("org.openqa.selenium.devtools.ChromeDevToolsConsoleTest"),
        Class.forName("org.openqa.selenium.devtools.ChromeDevToolsFetchTest"),
        Class.forName("org.openqa.selenium.devtools.ChromeDevToolsInspectorTest"),
        Class.forName("org.openqa.selenium.devtools.ChromeDevToolsLogTest"),
        Class.forName("org.openqa.selenium.devtools.ChromeDevToolsNetworkTest"),
        Class.forName("org.openqa.selenium.devtools.ChromeDevToolsPerformanceTest"),
        Class.forName("org.openqa.selenium.devtools.ChromeDevToolsProfilerTest"),
        Class.forName("org.openqa.selenium.devtools.ChromeDevToolsSecurityTest"),
        Class.forName("org.openqa.selenium.devtools.ChromeDevToolsTargetTest"),

        Class.forName("org.openqa.selenium.html5.AppCacheTest"),
        Class.forName("org.openqa.selenium.html5.Html5CapabilitiesTest"),
        Class.forName("org.openqa.selenium.html5.LocalStorageTest"),
        Class.forName("org.openqa.selenium.html5.LocationContextTest"),
        Class.forName("org.openqa.selenium.html5.SessionStorageTest"),

        Class.forName("org.openqa.selenium.interactions.ActionsTest"),
        Class.forName("org.openqa.selenium.interactions.BasicKeyboardInterfaceTest"),
        Class.forName("org.openqa.selenium.interactions.BasicMouseInterfaceTest"),
        Class.forName("org.openqa.selenium.interactions.CombinedInputActionsTest"),
        Class.forName("org.openqa.selenium.interactions.CompositeActionTest"),
        Class.forName("org.openqa.selenium.interactions.DragAndDropTest"),
        Class.forName("org.openqa.selenium.interactions.IndividualKeyboardActionsTest"),
        Class.forName("org.openqa.selenium.interactions.IndividualMouseActionsTest"),
        
        Class.forName("org.openqa.selenium.logging.AvailableLogsTest"),
        Class.forName("org.openqa.selenium.logging.GetLogsTest"),
        Class.forName("org.openqa.selenium.logging.PerformanceLoggingTest"),
        Class.forName("org.openqa.selenium.logging.PerformanceLogTypeTest"),
        
        Class.forName("org.openqa.selenium.support.ui.SelectElementTest")
      };
    }
  }
}