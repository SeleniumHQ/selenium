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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.NotYetImplemented;

import java.time.Duration;
import java.util.List;

@NeedsLocalEnvironment(reason =
    "Executing these tests over the wire doesn't work, because they relies on 100ms-specific timing")
public class ImplicitWaitTest extends JUnit4TestBase {

  @Before
  public void setUp() {
    driver.manage().timeouts().implicitlyWait(Duration.ofMillis(0));
  }

  @After
  public void tearDown() {
    driver.manage().timeouts().implicitlyWait(Duration.ofMillis(0));
  }

  @Test
  public void shouldSetAndGetImplicitWaitTimeout() {
    Duration timeout = driver.manage().timeouts().getImplicitWaitTimeout();
    assertThat(timeout).hasMillis(0);
    driver.manage().timeouts().implicitlyWait(Duration.ofMillis(3000));
    Duration timeout2 = driver.manage().timeouts().getImplicitWaitTimeout();
    assertThat(timeout2).hasMillis(3000);
  }

  @Test
  public void testShouldImplicitlyWaitForASingleElement() {
    driver.get(pages.dynamicPage);
    WebElement add = driver.findElement(By.id("adder"));

    driver.manage().timeouts().implicitlyWait(Duration.ofMillis(3000));

    add.click();
    driver.findElement(By.id("box0")); // All is well if this doesn't throw.
  }

  @Test
  public void testShouldStillFailToFindAnElementWhenImplicitWaitsAreEnabled() {
    driver.get(pages.dynamicPage);
    driver.manage().timeouts().implicitlyWait(Duration.ofMillis(500));
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.id("box0")));
  }

  @Test
  public void testShouldReturnAfterFirstAttemptToFindOneAfterDisablingImplicitWaits() {
    driver.get(pages.dynamicPage);
    driver.manage().timeouts().implicitlyWait(Duration.ofMillis(3000));
    driver.manage().timeouts().implicitlyWait(Duration.ofMillis(0));
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.id("box0")));
  }

  @Test
  public void testShouldImplicitlyWaitUntilAtLeastOneElementIsFoundWhenSearchingForMany() {
    driver.get(pages.dynamicPage);
    WebElement add = driver.findElement(By.id("adder"));

    driver.manage().timeouts().implicitlyWait(Duration.ofMillis(2000));
    add.click();
    add.click();

    List<WebElement> elements = driver.findElements(By.className("redbox"));
    assertThat(elements).isNotEmpty();
  }

  @Test
  public void testShouldStillFailToFindElementsWhenImplicitWaitsAreEnabled() {
    driver.get(pages.dynamicPage);
    driver.manage().timeouts().implicitlyWait(Duration.ofMillis(500));
    List<WebElement> elements = driver.findElements(By.className("redbox"));
    assertThat(elements).isEmpty();
  }

  @Test
  public void testShouldStillFailToFindElementsByIdWhenImplicitWaitsAreEnabled() {
    driver.get(pages.dynamicPage);
    driver.manage().timeouts().implicitlyWait(Duration.ofMillis(500));
    List<WebElement> elements = driver.findElements(By.id("redbox"));
    assertThat(elements).isEmpty();
  }

  @Test
  public void testShouldReturnAfterFirstAttemptToFindManyAfterDisablingImplicitWaits() {
    driver.get(pages.dynamicPage);
    WebElement add = driver.findElement(By.id("adder"));

    driver.manage().timeouts().implicitlyWait(Duration.ofMillis(1100));
    driver.manage().timeouts().implicitlyWait(Duration.ofMillis(0));
    add.click();

    List<WebElement> elements = driver.findElements(By.className("redbox"));
    assertThat(elements).isEmpty();
  }

  @Test
  @Ignore(IE)
  @Ignore(FIREFOX)
  @NotYetImplemented(SAFARI)
  public void testShouldImplicitlyWaitForAnElementToBeVisibleBeforeInteracting() {
    driver.get(pages.dynamicPage);

    WebElement reveal = driver.findElement(By.id("reveal"));
    WebElement revealed = driver.findElement(By.id("revealed"));
    driver.manage().timeouts().implicitlyWait(Duration.ofMillis(5000));

    assertThat(revealed.isDisplayed()).isFalse();
    reveal.click();
    revealed.sendKeys("hello world");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldRetainImplicitlyWaitFromTheReturnedWebDriverOfFrameSwitchTo() {
    driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(1));
    driver.get(pages.xhtmlTestPage);
    driver.findElement(By.name("windowOne")).click();

    Wait<WebDriver> wait = new WebDriverWait(driver, Duration.ofSeconds(1));
    wait.until(ExpectedConditions.numberOfWindowsToBe(2));
    String handle = (String)driver.getWindowHandles().toArray()[1];

    WebDriver newWindow = driver.switchTo().window(handle);

    long start = System.currentTimeMillis();

    newWindow.findElements(By.id("this-crazy-thing-does-not-exist"));

    long end = System.currentTimeMillis();

    long time = end - start;

    assertThat(time).isGreaterThanOrEqualTo(1000);
  }
}
