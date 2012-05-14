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
import static org.openqa.selenium.lift.Finders.first;
import static org.openqa.selenium.lift.match.NumericalMatchers.atLeast;

import static org.hamcrest.Matchers.containsString;
import static org.junit.Assert.fail;

import org.openqa.selenium.testing.MockTestBase;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.lift.find.Finder;

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
public class TestContextTest extends MockTestBase {

  private WebDriver webdriver;
  private TestContext context;
  private WebElement element;

  @Before
  public void createMocks() {
    webdriver = mock(WebDriver.class);
    context = new WebDriverTestContext(webdriver);
    element = mock(WebElement.class);
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

  @SuppressWarnings("unchecked")
  @Test
  public void canAssertPresenceOfWebElements() throws Exception {

    final Finder<WebElement, WebDriver> finder = mock(Finder.class);

    checking(new Expectations() {{
      one(finder).findFrom(webdriver);
      will(returnValue(oneElement()));
    }});

    context.assertPresenceOf(finder);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void canCheckQuantitiesOfWebElementsAndThrowsExceptionOnMismatch() throws Exception {

    final Finder<WebElement, WebDriver> finder = mock(Finder.class);

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

  @SuppressWarnings("unchecked")
  @Test
  public void canDirectTextInputToSpecificElements() throws Exception {
    final Finder<WebElement, WebDriver> finder = mock(Finder.class);
    final String inputText = "test";

    checking(new Expectations() {{
      one(finder).findFrom(webdriver);
      will(returnValue(oneElement()));
      one(element).sendKeys(inputText);
    }});

    context.type(inputText, finder);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void canTriggerClicksOnSpecificElements() throws Exception {
    final Finder<WebElement, WebDriver> finder = mock(Finder.class);

    checking(new Expectations() {{
      one(finder).findFrom(webdriver);
      will(returnValue(oneElement()));
      one(element).click();
    }});

    context.clickOn(finder);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void canTriggerClicksOnFirstElement() throws Exception {
    final Finder<WebElement, WebDriver> finder = mock(Finder.class);

    checking(new Expectations() {{
      one(finder).findFrom(webdriver);
      will(returnValue(twoElements()));
      one(element).click();
    }});

    context.clickOn(first(finder));
  }

  @SuppressWarnings("unchecked")
  @Test
  public void throwsAnExceptionIfTheFinderReturnsAmbiguousResults() throws Exception {
    final Finder<WebElement, WebDriver> finder = mock(Finder.class);

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

  private Collection<WebElement> oneElement() {
    return Collections.singleton(element);
  }

  private Collection<WebElement> twoElements() {
    return Arrays.asList(new WebElement[] {element, element});
  }
}
