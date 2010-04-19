/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import org.openqa.selenium.internal.WrapsDriver;

/**
 * Tests for generic WebElement.
 * @author eran.mes@gmail.com (Eran Mes)
 *
 */
public class WebElementTest extends AbstractDriverTestCase {
  @Ignore(SELENESE)
  public void testElementImplementsWrapsDriver() {
    driver.get(pages.simpleTestPage);
    WebElement parent = driver.findElement(By.id("containsSomeDiv"));
    assertTrue(parent instanceof WrapsDriver);
  }
  
  @Ignore(SELENESE)
  public void testElementReturnsOriginDriver() {
    driver.get(pages.simpleTestPage);
    WebElement parent = driver.findElement(By.id("containsSomeDiv"));
    assertTrue(((WrapsDriver) parent).getWrappedDriver() == driver);
  }

}
