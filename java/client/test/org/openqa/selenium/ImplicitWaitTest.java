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

package org.openqa.selenium;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.SAFARI;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NeedsLocalEnvironment;

import java.util.List;

@NeedsLocalEnvironment(reason =
    "Executing these tests over the wire doesn't work, because they relies on 100ms-specific timing")
public class ImplicitWaitTest extends JUnit4TestBase {

  @Before
  public void setUp() throws Exception {
    driver.manage().timeouts().implicitlyWait(0, MILLISECONDS);
  }

  @After
  public void tearDown() throws Exception {
    driver.manage().timeouts().implicitlyWait(0, MILLISECONDS);
  }

  @Test
  @JavascriptEnabled
  public void testShouldImplicitlyWaitForASingleElement() {
    driver.get(pages.dynamicPage);
    WebElement add = driver.findElement(By.id("adder"));

    driver.manage().timeouts().implicitlyWait(3000, MILLISECONDS);

    add.click();
    driver.findElement(By.id("box0")); // All is well if this doesn't throw.
  }

  @Test
  @JavascriptEnabled
  public void testShouldStillFailToFindAnElementWhenImplicitWaitsAreEnabled() {
    driver.get(pages.dynamicPage);
    driver.manage().timeouts().implicitlyWait(500, MILLISECONDS);
    try {
      driver.findElement(By.id("box0"));
      fail("Expected to throw.");
    } catch (NoSuchElementException expected) {
    }
  }

  @Test
  @JavascriptEnabled
  public void testShouldReturnAfterFirstAttemptToFindOneAfterDisablingImplicitWaits() {
    driver.get(pages.dynamicPage);
    driver.manage().timeouts().implicitlyWait(3000, MILLISECONDS);
    driver.manage().timeouts().implicitlyWait(0, MILLISECONDS);
    try {
      driver.findElement(By.id("box0"));
      fail("Expected to throw.");
    } catch (NoSuchElementException expected) {
    }
  }

  @Test
  @JavascriptEnabled
  public void testShouldImplicitlyWaitUntilAtLeastOneElementIsFoundWhenSearchingForMany() {
    driver.get(pages.dynamicPage);
    WebElement add = driver.findElement(By.id("adder"));

    driver.manage().timeouts().implicitlyWait(2000, MILLISECONDS);
    add.click();
    add.click();

    List<WebElement> elements = driver.findElements(By.className("redbox"));
    assertFalse(elements.isEmpty());
  }

  @Test
  @JavascriptEnabled
  public void testShouldStillFailToFindElementsWhenImplicitWaitsAreEnabled() {
    driver.get(pages.dynamicPage);
    driver.manage().timeouts().implicitlyWait(500, MILLISECONDS);
    List<WebElement> elements = driver.findElements(By.className("redbox"));
    assertTrue(elements.isEmpty());
  }

  @Test
  @JavascriptEnabled
  public void testShouldStillFailToFindElementsByIdWhenImplicitWaitsAreEnabled() {
    driver.get(pages.dynamicPage);
    driver.manage().timeouts().implicitlyWait(500, MILLISECONDS);
    List<WebElement> elements = driver.findElements(By.id("redbox"));
    assertTrue(elements.toString(), elements.isEmpty());
  }

  @Test
  @JavascriptEnabled
  public void testShouldReturnAfterFirstAttemptToFindManyAfterDisablingImplicitWaits() {
    driver.get(pages.dynamicPage);
    WebElement add = driver.findElement(By.id("adder"));

    driver.manage().timeouts().implicitlyWait(1100, MILLISECONDS);
    driver.manage().timeouts().implicitlyWait(0, MILLISECONDS);
    add.click();

    List<WebElement> elements = driver.findElements(By.className("redbox"));
    assertTrue(elements.isEmpty());
  }

  @Test
  @JavascriptEnabled
  @Ignore({IE, MARIONETTE, PHANTOMJS, SAFARI})
  public void testShouldImplicitlyWaitForAnElementToBeVisibleBeforeInteracting() {
    driver.get(pages.dynamicPage);

    WebElement reveal = driver.findElement(By.id("reveal"));
    WebElement revealed = driver.findElement(By.id("revealed"));
    driver.manage().timeouts().implicitlyWait(5000, MILLISECONDS);

    assertFalse("revealed should not be visible", revealed.isDisplayed());
    reveal.click();

    try {
      revealed.sendKeys("hello world");
      // This is what we want
    } catch (ElementNotVisibleException e) {
      fail("Element should have been visible");
    }
  }


  @Test
  @JavascriptEnabled
  @Ignore({IE, PHANTOMJS, SAFARI})
  public void testShouldRetainImplicitlyWaitFromTheReturnedWebDriverOfFrameSwitchTo() {
    driver.manage().timeouts().implicitlyWait(1, SECONDS);
    driver.get(pages.xhtmlTestPage);
    driver.findElement(By.name("windowOne")).click();

    Wait<WebDriver> wait = new WebDriverWait(driver, 1);
    wait.until(ExpectedConditions.numberOfwindowsToBe(2));
    String handle = (String)driver.getWindowHandles().toArray()[1];

    WebDriver newWindow = driver.switchTo().window(handle);

    long start = System.currentTimeMillis();

    newWindow.findElements(By.id("this-crazy-thing-does-not-exist"));

    long end = System.currentTimeMillis();

    long time = end - start;

    assertTrue(time >= 1000);

  }
}
