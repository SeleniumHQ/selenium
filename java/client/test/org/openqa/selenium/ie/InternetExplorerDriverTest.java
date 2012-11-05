/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium.ie;

import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import static org.junit.Assert.assertEquals;

@NeedsLocalEnvironment(reason = "Requires local browser launching environment")
public class InternetExplorerDriverTest extends JUnit4TestBase {

  @Test
  public void canRestartTheIeDriverInATightLoop() {
    for (int i = 0; i < 5; i++) {
      WebDriver driver = newIeDriver();
      driver.quit();
    }
  }
  
  @Test
  public void canStartMultipleIeDriverInstances() {
    WebDriver firstDriver = newIeDriver();
    WebDriver secondDriver = newIeDriver();
    try {
      firstDriver.get(pages.xhtmlTestPage);
      secondDriver.get(pages.formPage);
      assertEquals("XHTML Test Page", firstDriver.getTitle());
      assertEquals("We Leave From Here", secondDriver.getTitle());
    } finally {
      firstDriver.quit();
      secondDriver.quit();
    }
  }

  private WebDriver newIeDriver() {
    return new WebDriverBuilder().get();
  }
}
