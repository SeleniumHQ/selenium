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

package org.openqa.selenium.lift;

import static org.openqa.selenium.lift.match.NumericalMatchers.atLeast;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.StringDescription;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.lift.find.Finder;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.Sleeper;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Clock;
import java.util.Collection;

/**
 * Gives the context for a test, holds page state, and interacts with the {@link WebDriver}.
 */
public class WebDriverTestContext implements TestContext {

  private WebDriver driver;
  private final Clock clock;
  private final Sleeper sleeper;

  public WebDriverTestContext(WebDriver driver) {
    this(driver, Clock.systemDefaultZone(), Sleeper.SYSTEM_SLEEPER);
  }

  WebDriverTestContext(WebDriver driver, Clock clock, Sleeper sleeper) {
    this.driver = driver;
    this.clock = clock;
    this.sleeper = sleeper;
  }

  @Override
  public void quit() {
    driver.quit();
  }

  @Override
  public void goTo(String url) {
    driver.get(url);
  }

  @Override
  public void assertPresenceOf(Finder<WebElement, WebDriver> finder) {
    assertPresenceOf(atLeast(1), finder);
  }

  @Override
  public void assertPresenceOf(
      Matcher<Integer> cardinalityConstraint,
      Finder<WebElement, WebDriver> finder) {
    Collection<WebElement> foundElements = finder.findFrom(driver);
    if (!cardinalityConstraint.matches(foundElements.size())) {
      Description description = new StringDescription();
      description.appendText("\nExpected: ")
          .appendDescriptionOf(cardinalityConstraint)
          .appendText(" ")
          .appendDescriptionOf(finder)
          .appendText("\n     got: ")
          .appendValue(foundElements.size())
          .appendText(" ")
          .appendDescriptionOf(finder)
          .appendText("\n");

      failWith(description.toString());
    }
  }

  @Override
  public void type(String input, Finder<WebElement, WebDriver> finder) {
    WebElement element = findOneElementTo("type into", finder);
    element.sendKeys(input);
  }

  @Override
  public void clickOn(Finder<WebElement, WebDriver> finder) {
    WebElement element = findOneElementTo("click on", finder);
    element.click();
  }

  public void clickOnFirst(Finder<WebElement, WebDriver> finder) {
    WebElement element = findFirstElementTo("click on", finder);
    element.click();
  }

  private WebElement findFirstElementTo(String action, Finder<WebElement, WebDriver> finder) {
    Collection<WebElement> foundElements = finder.findFrom(driver);
    if (foundElements.isEmpty()) {
      failWith("could not find element to " + action);
    }

    return foundElements.iterator().next();
  }

  private WebElement findOneElementTo(String action, Finder<WebElement, WebDriver> finder) {
    Collection<WebElement> foundElements = finder.findFrom(driver);
    if (foundElements.isEmpty()) {
      failWith("could not find element to " + action);
    } else if (foundElements.size() > 1) {
      failWith("did not know what to " + action + " - ambiguous");
    }

    return foundElements.iterator().next();
  }

  private void failWith(String message) throws AssertionError {
    throw new java.lang.AssertionError(message);
  }

  @Override
  public void waitFor(final Finder<WebElement, WebDriver> finder, final long timeoutMillis) {
    final ExpectedCondition<Boolean> elementsDisplayedPredicate = driver ->
        finder.findFrom(driver).stream().anyMatch(WebElement::isDisplayed);

    final long defaultSleepTimeoutMillis = 500;
    final long sleepTimeout = (timeoutMillis > defaultSleepTimeoutMillis)
        ? defaultSleepTimeoutMillis : timeoutMillis / 2;

    Wait<WebDriver> wait =
        new WebDriverWait(
            driver,
            clock,
            sleeper,
            millisToSeconds(timeoutMillis),
            sleepTimeout) {
          @Override
          protected RuntimeException timeoutException(String message, Throwable lastException) {
            throw new AssertionError("Element was not rendered within " + timeoutMillis + "ms");
          }
        };
    wait.until(elementsDisplayedPredicate);
  }

  private static long millisToSeconds(final long timeoutMillis) {
    return ceiling(((double) timeoutMillis) / 1000);
  }

  private static long ceiling(final double value) {
    final long asLong = (long) value;
    final int additional = value - asLong > 0 ? 1 : 0;
    return asLong + additional;
  }

}
