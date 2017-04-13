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

package org.openqa.selenium.ie;

import static org.junit.Assert.assertEquals;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.ie.InternetExplorerDriver.ENABLE_PERSISTENT_HOVERING;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.awt.*;

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

  @NoDriverAfterTest
  @NeedsLocalEnvironment
  @Test
  public void testPersistentHoverCanBeTurnedOff() throws Exception {
    assumeTrue(TestUtilities.isInternetExplorer(driver));
    // Destroy the previous driver to make sure the hovering thread is
    // stopped.
    driver.quit();

    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(ENABLE_PERSISTENT_HOVERING, false);
    WebDriverBuilder builder = new WebDriverBuilder().setDesiredCapabilities(caps);
    driver = builder.get();

    try {
      driver.get(pages.javascriptPage);
      // Move to a different element to make sure the mouse is not over the
      // element with id 'item1' (from a previous test).
      new Actions(driver).moveToElement(driver.findElement(By.id("keyUp"))).build().perform();
      WebElement element = driver.findElement(By.id("menu1"));

      final WebElement item = driver.findElement(By.id("item1"));
      assertEquals("", item.getText());

      ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);
      new Actions(driver).moveToElement(element).build().perform();

      // Move the mouse somewhere - to make sure that the thread firing the events making
      // hover persistent is not active.
      Robot robot = new Robot();
      robot.mouseMove(50, 50);

      // Intentionally wait to make sure hover DOES NOT persist.
      Thread.sleep(1000);

      wait.until(elementTextToEqual(item, ""));

      assertEquals("", item.getText());

    } finally {
      driver.quit();
    }
  }

  private WebDriver newIeDriver() {
    return new WebDriverBuilder().get();
  }
}
