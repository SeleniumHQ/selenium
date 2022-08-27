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

import org.hamcrest.Description;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.lift.find.Finder;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.lift.Finders.first;
import static org.openqa.selenium.lift.match.NumericalMatchers.atLeast;

/**
 * Unit test for {@link WebDriverTestContext}.
 *
 * @author rchatley (Robert Chatley)
 */
public class TestContextTest {

  private WebDriver webdriver;
  private TestContext context;
  private WebElement element1;
  private WebElement element2;

  @BeforeEach
  public void createMocks() {
    webdriver = mock(WebDriver.class);
    context = new WebDriverTestContext(webdriver);
    element1 = mock(WebElement.class);
    element2 = mock(WebElement.class);
  }

  @Test
  public void isCreatedWithAWebDriverImplementation() {
    new WebDriverTestContext(webdriver);
  }

  @Test
  public void canNavigateToAGivenUrl() {

    final String url = "http://www.example.com";

    context.goTo(url);
    verify(webdriver).get(url);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void canAssertPresenceOfWebElements() {

    final Finder<WebElement, WebDriver> finder = mock(Finder.class);

    when(finder.findFrom(webdriver)).thenReturn(oneElement());

    context.assertPresenceOf(finder);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void canCheckQuantitiesOfWebElementsAndThrowsExceptionOnMismatch() {

    final Finder<WebElement, WebDriver> finder = mock(Finder.class);

    when(finder.findFrom(webdriver)).thenReturn(oneElement());

    try {
      context.assertPresenceOf(atLeast(2), finder);
      fail("should have failed as only one element found");
    } catch (AssertionError error) {
      // expected
      assertThat(error.getMessage()).contains("a value greater than <1>");
    }

    // From producing the error message.
    verify(finder, times(2)).describeTo(any(Description.class));
  }

  @SuppressWarnings("unchecked")
  @Test
  public void canDirectTextInputToSpecificElements() {
    final Finder<WebElement, WebDriver> finder = mock(Finder.class);
    final String inputText = "test";

    when(finder.findFrom(webdriver)).thenReturn(oneElement());

    context.type(inputText, finder);
    verify(element1).sendKeys(inputText);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void canTriggerClicksOnSpecificElements() {
    final Finder<WebElement, WebDriver> finder = mock(Finder.class);

    when(finder.findFrom(webdriver)).thenReturn(oneElement());

    context.clickOn(finder);
    verify(element1).click();
  }

  @SuppressWarnings("unchecked")
  @Test
  public void canTriggerClicksOnFirstElement() {
    final Finder<WebElement, WebDriver> finder = mock(Finder.class);

    when(finder.findFrom(webdriver)).thenReturn(twoElements());

    context.clickOn(first(finder));
    verify(element1).click();
  }

  @SuppressWarnings("unchecked")
  @Test
  public void throwsAnExceptionIfTheFinderReturnsAmbiguousResults() {
    final Finder<WebElement, WebDriver> finder = mock(Finder.class);

    when(finder.findFrom(webdriver)).thenReturn(twoElements());

    try {
      context.clickOn(finder);
      fail("should have failed as more than one element found");
    } catch (AssertionError error) {
      // expected
      assertThat(error.getMessage()).contains("did not know what to click on");
    }
  }

  private Collection<WebElement> oneElement() {
    return Collections.singleton(element1);
  }

  private Collection<WebElement> twoElements() {
    return Arrays.asList(element1, element2);
  }
}
