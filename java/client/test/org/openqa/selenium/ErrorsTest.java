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

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;

import static org.junit.Assert.assertEquals;

/**
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class ErrorsTest extends JUnit4TestBase {

  /**
   * Regression test for Selenium RC issue 363.
   * http://code.google.com/p/selenium/issues/detail?id=363
   * <p/>
   * This will trivially pass on browsers that do not support the onerror handler (e.g. Internet
   * Explorer).
   */
  @JavascriptEnabled
  @Ignore(value = Ignore.Driver.IE, reason = "IE does not support onerror")
  @Test
  public void testShouldNotGenerateErrorsWhenOpeningANewPage() {
    driver.get(pages.errorsPage);
    Object result = ((JavascriptExecutor) driver).
        executeScript("return window.ERRORS.join('\\n');");
    assertEquals("Should have no errors", "", result);
  }
}
