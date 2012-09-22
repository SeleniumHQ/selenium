/*
Copyright 2010 Selenium committers

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

package org.openqa.selenium.v1;

import org.junit.Test;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverCommandProcessor;

import static org.junit.Assert.fail;

public class WebDriverCommandProcessorTest {
  @Test
  public void testDriverNeedNotImplementHasCapabilities() {
    WebDriver driver = new StubJsDriver();

    try {
      new WebDriverCommandProcessor("http://www.example.com", driver);
    } catch (ClassCastException e) {
      fail(e.getMessage());
    }
  }

  @Test
  public void testRequiresAJavascriptEnabledDriver() {
    WebDriver driver = new StubDriver();

    try {
      new WebDriverCommandProcessor("http://example.com", driver);
      fail("Was not expected to succeed");
    } catch (IllegalStateException expected) {
    }
  }

  private static class StubJsDriver extends StubDriver implements JavascriptExecutor {

    @Override
    public String getWindowHandle() {
      return null;
    }

    public Object executeScript(String script, Object... args) {
      return null;
    }

    public Object executeAsyncScript(String script, Object... args) {
      return null;
    }
  }
}
