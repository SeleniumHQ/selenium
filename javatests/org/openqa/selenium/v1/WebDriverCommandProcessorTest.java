/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

import junit.framework.TestCase;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverCommandProcessor;

public class WebDriverCommandProcessorTest extends TestCase {
  public void testRequiresAJavascriptEnabledDriver() {
    WebDriver driver = new StubDriver();

    try {
      new WebDriverCommandProcessor("http://example.com", driver);
      fail("Was not expected to succeed");
    } catch (IllegalStateException expected) {
    }
  }

  public void testRequiresJavascriptToBeEnabled() {
    WebDriver driver = new StubJsDriver();

    try {
      new WebDriverCommandProcessor("http://example.com", driver);
      fail("Was not expected to succeed");
    } catch (IllegalStateException expected) {
    }
  }
  
  private static class StubJsDriver extends StubDriver implements JavascriptExecutor {

    public Object executeScript(String script, Object... args) {
      return null;
    }

    public Object executeAsyncScript(String script, Object... args) {
      return null;
    }

    public boolean isJavascriptEnabled() {
      return false;
    }
  }
}
