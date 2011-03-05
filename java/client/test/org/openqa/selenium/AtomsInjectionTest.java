/*
Copyright 2007-2011 WebDriver committers
Copyright 2007-2011 Google Inc.

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

import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

public class AtomsInjectionTest extends AbstractDriverTestCase {

  /** http://code.google.com/p/selenium/issues/detail?id=1333 */
  @Ignore(value = {IE, SELENESE},
      reason = "Selenium executes script in the context of the Selenium window, so the test " +
          "script will fail with a ReferenceError.")
  @JavascriptEnabled
  public void testInjectingAtomShouldNotTrampleOnUnderscoreGlobal() {
    driver.get(pages.underscorePage);
    driver.findElement(By.tagName("body"));
    assertEquals("123", ((JavascriptExecutor)driver).executeScript("return _.join('');"));
  }
}
