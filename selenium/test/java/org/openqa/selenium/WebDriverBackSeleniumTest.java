/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import junit.framework.TestCase;

import org.jmock.Expectations;
import org.jmock.Mockery;

public class WebDriverBackSeleniumTest extends TestCase {

  public void testShouldConvertScriptsProperly() {
    String script = "return selenium.browserbot.getCurrentWindow().title;";
    final String expectedScript = "return eval(\"return window.title;\");";

    Mockery context = new Mockery();
    final JsDriver driver = context.mock(JsDriver.class);

    context.checking(new Expectations() {{
      one(driver).executeScript(expectedScript); will(returnValue("foo"));
      allowing(driver).getWindowHandle();
    }});

    WebDriverBackedSelenium selenium =
        new WebDriverBackedSelenium(driver, "http://www.example/com");

    String value = selenium.getEval(script);

    assertEquals("foo", value);
    context.assertIsSatisfied();
  }

  public void testShouldConvertScriptsThatReferenceWindowByPageFnProperly() {
    String script = "return selenium.page().getCurrentWindow().title;";
    final String expectedScript = "return eval(\"return window.title;\");";

    Mockery context = new Mockery();
    final JsDriver driver = context.mock(JsDriver.class);

    context.checking(new Expectations() {{
      one(driver).executeScript(expectedScript); will(returnValue("foo"));
      allowing(driver).getWindowHandle();
    }});

    WebDriverBackedSelenium selenium =
        new WebDriverBackedSelenium(driver, "http://www.example/com");

    String value = selenium.getEval(script);

    assertEquals("foo", value);
    context.assertIsSatisfied();
  }

  public void testShouldConvertScriptsThatReferenceDocumentByBrowserbotProperly() {
    String script = "return selenium.browserbot.getDocument().body.innerHTML;";
    final String expectedScript = "return eval(\"return window.document.body.innerHTML;\");";

    Mockery context = new Mockery();
    final JsDriver driver = context.mock(JsDriver.class);

    context.checking(new Expectations() {{
      one(driver).executeScript(expectedScript); will(returnValue("<div>foo</div>"));
      allowing(driver).getWindowHandle();
    }});

    WebDriverBackedSelenium selenium =
        new WebDriverBackedSelenium(driver, "http://www.example/com");

    String value = selenium.getEval(script);

    assertEquals("<div>foo</div>", value);
    context.assertIsSatisfied();
  }

  public void testShouldConvertScriptsThatReferenceDocumentByPageFnProperly() {
    String script = "return selenium.page().getDocument().body.innerHTML;";
    final String expectedScript = "return eval(\"return window.document.body.innerHTML;\");";

    Mockery context = new Mockery();
    final JsDriver driver = context.mock(JsDriver.class);

    context.checking(new Expectations() {{
      one(driver).executeScript(expectedScript); will(returnValue("<div>foo</div>"));
      allowing(driver).getWindowHandle();
    }});

    WebDriverBackedSelenium selenium =
        new WebDriverBackedSelenium(driver, "http://www.example/com");

    String value = selenium.getEval(script);

    assertEquals("<div>foo</div>", value);
    context.assertIsSatisfied();
  }

  public void testShouldConvertScriptsWithMultipleBrowserbotAndPageReferences() {
    String script = "return "
        + "selenium.browserbot.getCurrentWindow().title + "
        + "selenium.page().getCurrentWindow().title + "
        + "selenium.browserbot.getDocument().body.innerHTML + "
        + "selenium.page().getDocument().body.innerHTML;";
    final String expectedScript = "return eval(\"return "
        + "window.title + window.title + "
        + "window.document.body.innerHTML + window.document.body.innerHTML;\");";

    Mockery context = new Mockery();
    final JsDriver driver = context.mock(JsDriver.class);

    context.checking(new Expectations() {{
      one(driver).executeScript(expectedScript); will(returnValue("abc123"));
      allowing(driver).getWindowHandle();
    }});

    WebDriverBackedSelenium selenium =
        new WebDriverBackedSelenium(driver, "http://www.example/com");

    String value = selenium.getEval(script);

    assertEquals("abc123", value);
    context.assertIsSatisfied();
  }

  public static interface JsDriver extends WebDriver, JavascriptExecutor {}
}
