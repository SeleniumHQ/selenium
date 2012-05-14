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

package org.openqa.selenium.lift;

import static org.junit.Assert.assertThat;
import static org.openqa.selenium.lift.match.NumericalMatchers.atLeast;

import static org.hamcrest.Matchers.containsString;
import static org.junit.Assert.fail;

import org.openqa.selenium.testing.MockTestBase;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.lift.find.Finder;
import org.openqa.selenium.support.ui.TickingClock;

import org.hamcrest.Description;
import org.jmock.Expectations;
import org.junit.Before;
import org.junit.Test;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;

/**
 * Unit test for {@link WebDriverTestContext}.
 * 
 * @author rchatley (Robert Chatley)
 * 
 */
public class WebDriverTestContextTest extends MockTestBase {

  WebDriver webdriver;
  TestContext context;
  WebElement element;
  Finder<WebElement, WebDriver> finder;
  TickingClock clock;
  private static final int CLOCK_INCREMENT = 300;
  final int TIMEOUT = CLOCK_INCREMENT * 3;

  @Before
  public void createMocks() {
    webdriver = mock(WebDriver.class);
    context = new WebDriverTestContext(webdriver);
    element = mock(WebElement.class);
    finder = mockFinder();
    clock = new TickingClock(CLOCK_INCREMENT);
  }

  @Test
  public void isCreatedWithAWebDriverImplementation() throws Exception {
    new WebDriverTestContext(webdriver);
  }

  @Test
  public void canNavigateToAGivenUrl() throws Exception {
    final String url = "http://www.example.com";

    checking(new Expectations() {{
      one(webdriver).get(url);
    }});

    context.goTo(url);
  }

  @Test
  public void canAssertPresenceOfWebElements() throws Exception {
    checking(new Expectations() {{
      one(finder).findFrom(webdriver);
      will(returnValue(oneElement()));
    }});

    context.assertPresenceOf(finder);
  }

  @Test
  public void canCheckQuantitiesOfWebElementsAndThrowsExceptionOnMismatch() throws Exception {
    checking(new Expectations() {{
      allowing(finder).findFrom(webdriver);
      will(returnValue(oneElement()));
      exactly(2).of(finder).describeTo(with(any(Description.class))); // in producing the error
                                                                      // msg
    }});

    try {
      context.assertPresenceOf(atLeast(2), finder);
      fail("should have failed as only one element found");
    } catch (AssertionError error) {
      // expected
      assertThat(error.getMessage(), containsString("a value greater than <1>"));
    }
  }

  @Test
  public void canDirectTextInputToSpecificElements() throws Exception {
    final String inputText = "test";

    checking(new Expectations() {{
      one(finder).findFrom(webdriver);
      will(returnValue(oneElement()));
      one(element).sendKeys(inputText);
    }});

    context.type(inputText, finder);
  }

  @Test
  public void canTriggerClicksOnSpecificElements() throws Exception {

    checking(new Expectations() {{
      one(finder).findFrom(webdriver);
      will(returnValue(oneElement()));
      one(element).click();
    }});

    context.clickOn(finder);
  }

  @Test
  public void throwsAnExceptionIfTheFinderReturnsAmbiguousResults() throws Exception {
    checking(new Expectations() {{
      one(finder).findFrom(webdriver);
      will(returnValue(twoElements()));
    }});

    try {
      context.clickOn(finder);
      fail("should have failed as more than one element found");
    } catch (AssertionError error) {
      // expected
      assertThat(error.getMessage(), containsString("did not know what to click on"));
    }
  }

  @Test
  public void supportsWaitingForElementToAppear() throws Exception {
    context = new WebDriverTestContext(webdriver, clock, clock);

    checking(new Expectations() {{
      one(finder).findFrom(webdriver);
      will(returnValue(oneElement()));
      one(element).isDisplayed();
      will(returnValue(true));
    }});

    context.waitFor(finder, TIMEOUT);
  }

  @Test
  public void supportsWaitingForElementToAppearWithTimeout() throws Exception {
    context = new WebDriverTestContext(webdriver, clock, clock);

    checking(new Expectations() {{
      exactly(2).of(finder).findFrom(webdriver);
      will(returnValue(oneElement()));
      exactly(2).of(element).isDisplayed();
      will(onConsecutiveCalls(returnValue(false), returnValue(true)));
    }});

    context.waitFor(finder, TIMEOUT);
  }

  @Test
  public void failsAssertionIfElementNotDisplayedBeforeTimeout() throws Exception {
    context = new WebDriverTestContext(webdriver, clock, clock);

    checking(new Expectations() {{
      atLeast(1).of(finder).findFrom(webdriver);
      will(returnValue(oneElement()));
      atLeast(1).of(element).isDisplayed();
      will(returnValue(false));
    }});

    try {
      context.waitFor(finder, TIMEOUT);
      fail("should have failed as element not displayed before timeout");
    } catch (AssertionError error) {
      // expected
      assertThat(error.getMessage(),
          containsString(String.format("Element was not rendered within %dms", TIMEOUT)));
    }
  }

  @SuppressWarnings("unchecked")
  Finder<WebElement, WebDriver> mockFinder() {
    return mock(Finder.class);
  }

  private Collection<? extends WebElement> oneElement() {
    return Collections.singleton(element);
  }

  private Collection<WebElement> twoElements() {
    return Arrays.asList(element, element);
  }
}
