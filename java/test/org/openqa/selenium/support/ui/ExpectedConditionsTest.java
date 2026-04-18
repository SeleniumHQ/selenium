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

package org.openqa.selenium.support.ui;

import static java.lang.System.lineSeparator;
import static java.time.Instant.EPOCH;
import static java.util.Collections.emptyList;
import static java.util.Collections.singletonList;
import static java.util.regex.Pattern.compile;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.InstanceOfAssertFactories.LIST;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.support.ui.ExpectedConditions.alertIsPresent;
import static org.openqa.selenium.support.ui.ExpectedConditions.and;
import static org.openqa.selenium.support.ui.ExpectedConditions.attributeContains;
import static org.openqa.selenium.support.ui.ExpectedConditions.attributeToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.attributeToBeNotEmpty;
import static org.openqa.selenium.support.ui.ExpectedConditions.domAttributeToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.domPropertyToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.elementSelectionStateToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.elementToBeClickable;
import static org.openqa.selenium.support.ui.ExpectedConditions.elementToBeSelected;
import static org.openqa.selenium.support.ui.ExpectedConditions.frameToBeAvailableAndSwitchToIt;
import static org.openqa.selenium.support.ui.ExpectedConditions.invisibilityOf;
import static org.openqa.selenium.support.ui.ExpectedConditions.invisibilityOfAllElements;
import static org.openqa.selenium.support.ui.ExpectedConditions.invisibilityOfElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.invisibilityOfElementWithText;
import static org.openqa.selenium.support.ui.ExpectedConditions.javaScriptThrowsNoExceptions;
import static org.openqa.selenium.support.ui.ExpectedConditions.jsReturnsValue;
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.support.ui.ExpectedConditions.numberOfElementsToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.numberOfElementsToBeLessThan;
import static org.openqa.selenium.support.ui.ExpectedConditions.numberOfElementsToBeMoreThan;
import static org.openqa.selenium.support.ui.ExpectedConditions.numberOfWindowsToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.or;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfAllElementsLocatedBy;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfNestedElementLocatedBy;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfNestedElementsLocatedBy;
import static org.openqa.selenium.support.ui.ExpectedConditions.stalenessOf;
import static org.openqa.selenium.support.ui.ExpectedConditions.textMatches;
import static org.openqa.selenium.support.ui.ExpectedConditions.textToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.textToBePresentInElement;
import static org.openqa.selenium.support.ui.ExpectedConditions.textToBePresentInElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.textToBePresentInElementValue;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleContains;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.support.ui.ExpectedConditions.urlContains;
import static org.openqa.selenium.support.ui.ExpectedConditions.urlMatches;
import static org.openqa.selenium.support.ui.ExpectedConditions.urlToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfAllElements;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfAllElementsLocatedBy;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfNestedElementsLocatedBy;

import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

@Tag("UnitTests")
final class ExpectedConditionsTest {

  private final Driver mockDriver = mock("Driver");
  private final WebElement mockElement = mock("[By.id: title]");
  private final WebElement mockNestedElement = mock("[By.name: Age]");
  private final WebElement mockNestedElement2 = mock("[By.name: Gender]");
  private final WebDriver.TargetLocator mockTargetLocator = mock("TargetLocator");
  private final java.time.Clock mockClock = mock("Clock");
  private final Sleeper mockSleeper = mock("Sleeper");
  private final GenericCondition mockCondition = mock("Condition");
  private final By testSelector = By.cssSelector("#test-selector");
  private final By nestedSelector = By.cssSelector("#nested-selector");

  private final FluentWait<Driver> wait =
      new FluentWait<>(mockDriver, mockClock, mockSleeper)
          .withTimeout(Duration.ofMillis(1100))
          .pollingEvery(Duration.ofMillis(250));

  @BeforeEach
  public void setUpMocks() {
    // Set up a time series that extends past the end of our wait's timeout
    when(mockClock.instant())
        .thenReturn(
            EPOCH,
            EPOCH.plusMillis(250),
            EPOCH.plusMillis(500),
            EPOCH.plusMillis(1000),
            EPOCH.plusMillis(2000));
    when(mockDriver.switchTo()).thenReturn(mockTargetLocator);
  }

  @Nested
  class TitleIs {
    @Test
    void positive() {
      when(mockDriver.getTitle())
          .thenReturn("Loading")
          .thenReturn("Home page")
          .thenReturn("Landing page");
      assertThat(wait.until(titleIs("Landing page"))).isTrue();
    }

    @Test
    void negative() {
      when(mockDriver.getTitle()).thenReturn("Landing page");
      assertThatThrownBy(() -> wait.until(titleIs("Home page")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for title to be \"Home page\". Current title:"
                  + " \"Landing page\".");
    }
  }

  @Nested
  class TitleContains {
    @Test
    void positive() {
      when(mockDriver.getTitle())
          .thenReturn(null)
          .thenReturn("Loading")
          .thenReturn("Home page")
          .thenReturn("Landing page");
      assertThat(wait.until(titleContains("Landing page"))).isTrue();
      assertThat(wait.until(titleContains("and"))).isTrue();
      assertThat(wait.until(titleContains("g page"))).isTrue();
    }

    @Test
    void negative() {
      when(mockDriver.getTitle()).thenReturn(null, "Wait...", "Landing page");
      assertThatThrownBy(() -> wait.until(titleContains("Home page")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for title to contain \"Home page\". Current"
                  + " title: \"Landing page\".");
    }
  }

  @Nested
  class WaitingForUrlToBeOpened {
    @Test
    void urlToBe_positive() {
      when(mockDriver.getCurrentUrl()).thenReturn(null, "about:blank", "http://some_url");
      assertThat(wait.until(urlToBe("http://some_url"))).isTrue();
    }

    @Test
    void urlToBe_negative() {
      when(mockDriver.getCurrentUrl()).thenReturn(null, "about:blank", "http://some_url");

      assertThatThrownBy(() -> wait.until(urlToBe("http://some_url/malformed")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for url to be \"http://some_url/malformed\"."
                  + " Current url: \"http://some_url\"")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }

    @Test
    void urlContains_positive() {
      when(mockDriver.getCurrentUrl()).thenReturn(null, "about:blank", "http://some_url");
      assertThat(wait.until(urlContains("some_url"))).isTrue();
    }

    @Test
    void urlContains_negative() {
      when(mockDriver.getCurrentUrl()).thenReturn(null, "about:blank", "http://some_url");

      assertThatThrownBy(() -> wait.until(urlContains("/malformed")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for url to contain \"/malformed\". Current url:"
                  + " \"http://some_url\"")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }

    @Test
    void urlMatches_positive() {
      when(mockDriver.getCurrentUrl())
          .thenReturn(null, "about:blank", "http://some-dynamic:4000/url");
      assertThat(wait.until(urlMatches(".*:\\d{4}\\/url"))).isTrue();
    }

    @Test
    void urlMatches_negative() {
      when(mockDriver.getCurrentUrl())
          .thenReturn(null, "about:blank", "http://some-dynamic:4000/url");

      assertThatThrownBy(() -> wait.until(urlMatches(".*\\/malformed.*")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for url to match the regex \".*\\/malformed.*\"."
                  + " Current url: \"http://some-dynamic:4000/url\"")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }
  }

  @Nested
  class WaitingForVisibilityOfElement {
    @Test
    void elementAlreadyVisible() {
      when(mockElement.isDisplayed()).thenReturn(true);

      assertThat(wait.until(visibilityOf(mockElement))).isSameAs(mockElement);
      verifyNoInteractions(mockSleeper);
    }

    @Test
    void elementBecomesVisible() throws InterruptedException {
      when(mockElement.isDisplayed()).thenReturn(false, false, true);

      assertThat(wait.until(visibilityOf(mockElement))).isSameAs(mockElement);
      verify(mockSleeper, times(2)).sleep(Duration.ofMillis(250));
    }

    @Test
    void elementNeverBecomesVisible() throws InterruptedException {
      Mockito.reset(mockClock);
      when(mockClock.instant()).thenReturn(EPOCH, EPOCH.plusMillis(500), EPOCH.plusMillis(3000));
      when(mockElement.isDisplayed()).thenReturn(false, false);

      assertThatThrownBy(() -> wait.until(visibilityOf(mockElement)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for visibility of [By.id: title]")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
      verify(mockSleeper, times(1)).sleep(Duration.ofMillis(250));
    }
  }

  @Nested
  class WaitingForVisibilityOfElementLocated {
    @Test
    void elementBecomesVisible() {
      when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
      when(mockElement.isDisplayed()).thenReturn(false, false, false, true);

      assertThat(wait.until(visibilityOfElementLocated(testSelector))).isSameAs(mockElement);
    }

    @Test
    void elementAppearsAfterSomeTime() {
      when(mockDriver.findElement(testSelector))
          .thenThrow(new NoSuchElementException("Initially, not found"))
          .thenThrow(new NoSuchElementException("Still not found"))
          .thenReturn(mockElement);
      when(mockElement.isDisplayed()).thenReturn(false, true);

      assertThat(wait.until(visibilityOfElementLocated(testSelector))).isSameAs(mockElement);
    }

    @Test
    void elementNeverBecomesVisible() {
      when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
      when(mockElement.isDisplayed()).thenReturn(false);

      assertThatThrownBy(() -> wait.until(visibilityOfElementLocated(testSelector)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for visibility of element found by"
                  + " By.cssSelector: #test-selector")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }

    @Test
    void elementNotFound() {
      when(mockDriver.findElement(testSelector))
          .thenThrow(new NoSuchElementException("Oops, not found"));

      assertThatThrownBy(() -> wait.until(visibilityOfElementLocated(testSelector)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for visibility of element found by"
                  + " By.cssSelector: #test-selector, but..."
                  + " org.openqa.selenium.NoSuchElementException: Oops, not found.");
      verifyNoInteractions(mockElement);
    }

    @Test
    void elementDisappeared() {
      when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
      when(mockElement.isDisplayed())
          .thenReturn(false, false, false)
          .thenThrow(new StaleElementReferenceException("Element disappeared"));

      assertThatThrownBy(() -> wait.until(visibilityOfElementLocated(testSelector)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for visibility of element found by"
                  + " By.cssSelector: #test-selector, but..."
                  + " org.openqa.selenium.StaleElementReferenceException: Element disappeared.")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }
  }

  @Nested
  class WaitingForInvisibilityOfElement {
    @Test
    void elementNotVisible() {
      when(mockElement.isDisplayed()).thenReturn(false);

      assertThat(wait.until(not(visibilityOf(mockElement)))).isTrue();
      verifyNoInteractions(mockSleeper);
    }

    @Test
    void elementStaysVisible() throws InterruptedException {
      Mockito.reset(mockClock);
      when(mockClock.instant()).thenReturn(EPOCH, EPOCH.plusMillis(500), EPOCH.plusMillis(3000));
      when(mockElement.isDisplayed()).thenReturn(true, true);

      assertThatThrownBy(() -> wait.until(not(visibilityOf(mockElement))))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for condition not to be valid: visibility of"
                  + " [By.id: title]")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
      verify(mockSleeper, times(1)).sleep(Duration.ofMillis(250));
    }
  }

  @Nested
  class BooleanOperations {
    @Test
    void booleanExpectationsCanBeNegated() {
      ExpectedCondition<Boolean> expectation = not(obj -> false);

      assertThat(expectation.apply(mockDriver)).isTrue();
    }

    @Test
    void invertingAConditionThatReturnsFalse() {
      ExpectedCondition<Boolean> expectation = not(obj -> false);

      assertThat(expectation.apply(mockDriver)).isTrue();
    }

    @Test
    void invertingAConditionThatReturnsNull() {
      when(mockCondition.apply(mockDriver)).thenReturn(null);

      assertThat(wait.until(not(mockCondition))).isTrue();
      verifyNoInteractions(mockSleeper);
    }

    @Test
    void invertingAConditionThatAlwaysReturnsTrueTimesOut() {
      ExpectedCondition<Boolean> expectation = not(obj -> true);

      assertThat(expectation.apply(mockDriver)).isFalse();
    }

    @Test
    void doubleNegatives_conditionThatReturnsFalseTimesOut() {
      ExpectedCondition<Boolean> expectation = not(not(obj -> false));

      assertThat(expectation.apply(mockDriver)).isFalse();
    }

    @Test
    void doubleNegatives_conditionThatReturnsNull() {
      ExpectedCondition<Boolean> expectation = not(not(obj -> null));

      assertThat(expectation.apply(mockDriver)).isFalse();
    }
  }

  @Nested
  class VisibilityOfAllElementsLocatedBy {
    @Test
    void returnsListOfElements() {
      when(mockDriver.findElements(testSelector))
          .thenReturn(List.of(mockElement, mockNestedElement));
      when(mockElement.isDisplayed()).thenReturn(true);
      when(mockNestedElement.isDisplayed()).thenReturn(true);

      List<WebElement> returnedElements =
          wait.until(visibilityOfAllElementsLocatedBy(testSelector));

      assertThat(returnedElements).containsExactly(mockElement, mockNestedElement);
    }

    @Test
    void throwsTimeoutException_whenAtLeastOneElementNotDisplayed() {
      when(mockDriver.findElements(testSelector))
          .thenReturn(List.of(mockElement, mockNestedElement));
      when(mockElement.isDisplayed()).thenReturn(true);
      when(mockNestedElement.isDisplayed()).thenReturn(false);

      assertThatThrownBy(() -> wait.until(visibilityOfAllElementsLocatedBy(testSelector)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for visibility of all elements located by"
                  + " By.cssSelector: #test-selector, but element #1 was invisible: [By.name: Age]")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }

    @Test
    void throwsStaleException_whenAtLeastOneElementIsStale() {
      when(mockDriver.findElements(testSelector))
          .thenReturn(List.of(mockElement, mockNestedElement));
      when(mockElement.isDisplayed()).thenReturn(true);
      when(mockNestedElement.isDisplayed())
          .thenThrow(new StaleElementReferenceException("Stale element"));

      assertThatThrownBy(() -> wait.until(visibilityOfAllElementsLocatedBy(testSelector)))
          .isInstanceOf(StaleElementReferenceException.class)
          .hasMessageStartingWith("Stale element");
    }

    @Test
    void canIgnoreStaleException() {
      when(mockDriver.findElements(testSelector))
          .thenReturn(List.of(mockNestedElement, mockElement));
      when(mockNestedElement.isDisplayed()).thenReturn(true);
      when(mockElement.isDisplayed())
          .thenThrow(new StaleElementReferenceException("Stale element #1"))
          .thenThrow(new StaleElementReferenceException("Stale element #2"))
          .thenReturn(false);

      assertThatThrownBy(
              () ->
                  wait.ignoring(StaleElementReferenceException.class)
                      .until(visibilityOfAllElementsLocatedBy(testSelector)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for visibility of all elements located by"
                  + " By.cssSelector: #test-selector, but element #1 was invisible: [By.id: title]")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }

    @Test
    void throwsTimeoutExceptionWhenNoElementsFound() {
      when(mockDriver.findElements(testSelector)).thenReturn(emptyList());

      assertThatThrownBy(() -> wait.until(visibilityOfAllElementsLocatedBy(testSelector)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for visibility of all elements located by"
                  + " By.cssSelector: #test-selector, but no elements were found")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }
  }

  @Nested
  class VisibilityOfAllElements {
    @Test
    void returnsListOfElements() {
      when(mockElement.isDisplayed()).thenReturn(true);

      List<WebElement> returnedElements = wait.until(visibilityOfAllElements(List.of(mockElement)));
      assertThat(returnedElements).containsExactly(mockElement);
    }

    @Test
    void checksThatAllElementsAreVisible() {
      when(mockElement.isDisplayed()).thenReturn(true);
      when(mockNestedElement.isDisplayed()).thenReturn(true);

      List<WebElement> returnedElements =
          wait.until(visibilityOfAllElements(mockElement, mockNestedElement));
      assertThat(returnedElements).containsExactly(mockElement, mockNestedElement);
    }

    @Test
    void throwsTimeoutException_whenAtLeastOneElementNotDisplayed() {
      when(mockElement.isDisplayed()).thenReturn(true);
      when(mockNestedElement.isDisplayed()).thenReturn(false);

      assertThatThrownBy(
              () -> wait.until(visibilityOfAllElements(List.of(mockElement, mockNestedElement))))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for visibility of all 2 elements, but element #1"
                  + " was invisible: [By.name: Age]")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }

    @Test
    void throwsTimeoutException_whenAtLeastOneElementNotDisplayed_2() {
      when(mockElement.isDisplayed()).thenReturn(true);
      when(mockNestedElement.isDisplayed()).thenReturn(false);

      assertThatThrownBy(
              () -> wait.until(visibilityOfAllElements(List.of(mockNestedElement, mockElement))))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for visibility of all 2 elements, but element #0"
                  + " was invisible: [By.name: Age]")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }

    @Test
    void throwsStaleElementException_whenAtLeastOneElementIsStale() {
      List<WebElement> webElements = singletonList(mockElement);

      when(mockElement.isDisplayed())
          .thenThrow(new StaleElementReferenceException("Stale element"));

      assertThatThrownBy(() -> wait.until(visibilityOfAllElements(webElements)))
          .isInstanceOf(StaleElementReferenceException.class)
          .hasMessageStartingWith("Stale element");
    }

    @Test
    void throwsTimeoutException_whenNoElementsFound() {
      assertThatThrownBy(() -> wait.until(visibilityOfAllElements(emptyList())))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for visibility of all 0 elements, but no elements"
                  + " were found")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }
  }

  @Nested
  class VisibilityOf {
    @Test
    void returnsTheElement_ifItIsVisible() {
      when(mockElement.isDisplayed()).thenReturn(true);

      WebElement returnedElement = wait.until(visibilityOf(mockElement));
      assertThat(returnedElement).isEqualTo(mockElement);
    }

    @Test
    void throwsTimeoutException_whenElementNotDisplayed() {
      when(mockElement.isDisplayed()).thenReturn(false);

      assertThatThrownBy(() -> wait.until(visibilityOf(mockElement)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for visibility of [By.id: title]")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }

    @Test
    void throwsStaleElementException_whenElementIsStale() {
      when(mockElement.isDisplayed())
          .thenThrow(new StaleElementReferenceException("Stale element"));

      assertThatThrownBy(() -> wait.until(visibilityOf(mockElement)))
          .isInstanceOf(StaleElementReferenceException.class)
          .hasMessageStartingWith("Stale element");
    }
  }

  @Nested
  class TextToBePresentInElementLocated {
    @BeforeEach
    void setUp() {
      when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
      when(mockElement.getText()).thenReturn("testText");
    }

    @Test
    void waitsUntilElementTextContainsGivenSubstring() {
      when(mockDriver.findElement(testSelector))
          .thenThrow(new NoSuchElementException("Element not found 1"))
          .thenThrow(new NoSuchElementException("Element not found 2"))
          .thenThrow(new NoSuchElementException("Element not found 3"))
          .thenReturn(mockElement);

      assertThat(wait.until(textToBePresentInElementLocated(testSelector, "testText"))).isTrue();
      assertThat(wait.until(textToBePresentInElementLocated(testSelector, "test"))).isTrue();
      assertThat(wait.until(textToBePresentInElementLocated(testSelector, "estTex"))).isTrue();
    }

    @Test
    void throwsTimeoutException_whenTextIsDifferent() {
      assertThatThrownBy(
              () -> wait.until(textToBePresentInElementLocated(testSelector, "failText")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for element found by By.cssSelector:"
                  + " #test-selector to contain text \"failText\". Current text: \"testText\".")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }

    @Test
    void throwsTimeoutException_whenElementIsStale() {
      when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
      when(mockElement.getText()).thenThrow(new StaleElementReferenceException("Stale element"));

      assertThatThrownBy(
              () -> wait.until(textToBePresentInElementLocated(testSelector, "testText")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for element found by By.cssSelector:"
                  + " #test-selector to contain text \"testText\", but..."
                  + " org.openqa.selenium.StaleElementReferenceException: Stale element.");
    }

    @Test
    void throwsTimeoutException_whenNoElementFound() {
      when(mockDriver.findElement(testSelector))
          .thenThrow(new NoSuchElementException("Element not found"));

      assertThatThrownBy(
              () -> wait.until(textToBePresentInElementLocated(testSelector, "testText")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for element found by By.cssSelector:"
                  + " #test-selector to contain text \"testText\", but..."
                  + " org.openqa.selenium.NoSuchElementException: Element not found.");
    }
  }

  @Nested
  class AttributeToBe {
    @Nested
    class BySelector {
      @Test
      void checksAttributeValue() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockElement.getAttribute("data-test-id")).thenReturn("report123");
        when(mockElement.getCssValue("data-test-id")).thenReturn("");

        assertThat(wait.until(attributeToBe(testSelector, "data-test-id", "report123"))).isTrue();
      }

      @Test
      void checksCssValue() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockElement.getAttribute("background-color")).thenReturn("");
        when(mockElement.getCssValue("background-color"))
            .thenReturn("red")
            .thenReturn("blue")
            .thenReturn("rgb(0, 255, 0)");

        assertThat(wait.until(attributeToBe(testSelector, "background-color", "rgb(0, 255, 0)")))
            .isTrue();
      }

      @Test
      void negative() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockElement.getAttribute("name")).thenReturn("Bilbo");
        when(mockElement.getCssValue("name")).thenReturn("");

        assertThatThrownBy(() -> wait.until(attributeToBe(testSelector, "name", "Frodo")))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element found by By.cssSelector:"
                    + " #test-selector to have attribute or CSS value \"name\"=\"Frodo\". Current"
                    + " value: \"Bilbo\".")
            .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
      }
    }

    @Nested
    class ForElement {
      @Test
      void checksAttributeValue() {
        when(mockElement.getAttribute("name")).thenReturn("Frodo");
        when(mockElement.getCssValue("name")).thenReturn("");

        assertThat(wait.until(attributeToBe(mockElement, "name", "Frodo"))).isTrue();
      }

      @Test
      void checksCssValue() {
        when(mockElement.getAttribute("background-color")).thenReturn("");
        when(mockElement.getCssValue("background-color")).thenReturn("rgb(255, 255, 0)");

        assertThat(wait.until(attributeToBe(mockElement, "background-color", "rgb(255, 255, 0)")))
            .isTrue();
      }

      @Test
      void negative() {
        when(mockElement.getAttribute("data-test-id")).thenReturn("report-456");
        when(mockElement.getCssValue("data-test-id")).thenReturn("");

        assertThatThrownBy(
                () -> wait.until(attributeToBe(mockElement, "data-test-id", "report-123")))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for attribute or CSS value"
                    + " \"data-test-id\"=\"report-123\". Current value: \"report-456\".")
            .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
      }
    }
  }

  @Nested
  class AttributeContains {
    @Nested
    class BySelector {
      @Test
      void returnsTrue_whenAttributeContainsSaidGivenText() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockElement.getAttribute("title")).thenReturn("test attributeValue test");
        when(mockElement.getCssValue("title")).thenReturn("");

        assertThat(wait.until(attributeContains(testSelector, "title", "attributeValue"))).isTrue();
        assertThat(wait.until(attributeContains(testSelector, "title", "test attribute"))).isTrue();
        assertThat(wait.until(attributeContains(testSelector, "title", "buteValue test"))).isTrue();
      }

      @Test
      void returnsTrue_whenCssValueContainsGivenText() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockElement.getAttribute("background-color")).thenReturn("");
        when(mockElement.getCssValue("background-color")).thenReturn("rgba(100, 200, 255, 0.8)");

        assertThat(
                wait.until(
                    attributeContains(
                        testSelector, "background-color", "rgba(100, 200, 255, 0.8)")))
            .isTrue();
        assertThat(wait.until(attributeContains(testSelector, "background-color", "rgba")))
            .isTrue();
        assertThat(wait.until(attributeContains(testSelector, "background-color", "200, 255")))
            .isTrue();
      }

      @Test
      void throwsTimeoutException_whenAttributeDoesNotContainGivenText() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockElement.getAttribute("data-test-id")).thenReturn("salary-yearly-report");
        when(mockElement.getCssValue("data-test-id")).thenReturn("");

        assertThatThrownBy(
                () -> wait.until(attributeContains(testSelector, "data-test-id", "weekly-report")))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element found by By.cssSelector:"
                    + " #test-selector to have attribute or CSS value \"data-test-id\" containing"
                    + " \"weekly-report\", but the attribute had value \"salary-yearly-report\".")
            .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
      }
    }

    @Nested
    class ForElement {
      @Test
      void attributeContainsGivenText() {
        when(mockElement.getAttribute("data-test-id")).thenReturn("salary-yearly-report");
        when(mockElement.getCssValue("data-test-id")).thenReturn("");

        assertThat(
                wait.until(attributeContains(mockElement, "data-test-id", "salary-yearly-report")))
            .isTrue();
        assertThat(wait.until(attributeContains(mockElement, "data-test-id", "salary"))).isTrue();
        assertThat(wait.until(attributeContains(mockElement, "data-test-id", "early-repo")))
            .isTrue();
      }

      @Test
      void cssValueContainsGivenText() {
        when(mockElement.getAttribute("color")).thenReturn("");
        when(mockElement.getCssValue("color")).thenReturn("lightblue");

        assertThat(wait.until(attributeContains(mockElement, "color", "blue"))).isTrue();
        assertThat(wait.until(attributeContains(mockElement, "color", "ightbl"))).isTrue();
        assertThat(wait.until(attributeContains(mockElement, "color", "lightblue"))).isTrue();
      }

      @Test
      void negative() {
        when(mockElement.getAttribute("data-test-id")).thenReturn("salary-yearly-report");
        when(mockElement.getCssValue("data-test-id")).thenReturn("");

        assertThatThrownBy(
                () -> wait.until(attributeContains(mockElement, "data-test-id", "weekly-report")))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for attribute or CSS value \"data-test-id\" to"
                    + " contain \"weekly-report\". Current value: \"salary-yearly-report\".");
      }
    }
  }

  @Nested
  class TextToBe {
    @Test
    void returnsTrue_whenTextIsEqualToGivenText() {
      when(mockDriver.findElement(testSelector))
          .thenThrow(new NoSuchElementException("not yet found"))
          .thenReturn(mockElement);
      when(mockElement.getText())
          .thenReturn("wrong text")
          .thenReturn("another wrong text")
          .thenReturn("Hello, World!");

      assertThat(wait.until(textToBe(testSelector, "Hello, World!"))).isTrue();
    }

    @Test
    void fails_ifTextDoesNotMatch() {
      when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
      when(mockElement.getText()).thenReturn("Goodbye, World...");

      assertThatThrownBy(() -> wait.until(textToBe(testSelector, "Hello, World!")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for element found by By.cssSelector:"
                  + " #test-selector to have text \"Hello, World!\". Current text: \"Goodbye,"
                  + " World...\".");
    }

    @Test
    void fails_ifElementDisappeared() {
      when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
      when(mockElement.getText()).thenThrow(new StaleElementReferenceException("Stale element"));

      assertThatThrownBy(() -> wait.until(textToBe(testSelector, "Hello, World!")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for element found by By.cssSelector:"
                  + " #test-selector to have text \"Hello, World!\", but..."
                  + " org.openqa.selenium.StaleElementReferenceException: Stale element.");
    }
  }

  @Nested
  class AttributeToBeNotEmpty {
    @Test
    void returnsTrue_whenAttributeIsNotEmpty() {
      when(mockElement.getAttribute("name")).thenReturn("").thenReturn("").thenReturn("Bilbo");
      when(mockElement.getCssValue("name")).thenReturn("");

      assertThat(wait.until(attributeToBeNotEmpty(mockElement, "name"))).isTrue();
    }

    @Test
    void returnsTrue_whenCssValueIsNotEmpty() {
      when(mockElement.getAttribute("background-color")).thenReturn("");
      when(mockElement.getCssValue("background-color"))
          .thenReturn("")
          .thenReturn("")
          .thenReturn("blue");

      assertThat(wait.until(attributeToBeNotEmpty(mockElement, "background-color"))).isTrue();
    }

    @Test
    void negative() {
      when(mockElement.getAttribute("data-test-id")).thenReturn("");
      when(mockElement.getCssValue("data-test-id")).thenReturn("");

      assertThatThrownBy(() -> wait.until(attributeToBeNotEmpty(mockElement, "data-test-id")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for attribute or CSS value \"data-test-id\" not"
                  + " to be empty");
    }
  }

  @Nested
  class WaitingForOneOfExpectedConditions {
    @Test
    void whenFirstPositive() {
      String attributeName = "test";
      when(mockElement.getAttribute(attributeName)).thenReturn(attributeName);
      when(mockElement.getCssValue(attributeName)).thenReturn(attributeName);
      when(mockElement.getText()).thenReturn("");

      assertThat(
              wait.until(
                  or(
                      attributeToBe(mockElement, attributeName, attributeName),
                      textToBePresentInElement(mockElement, attributeName))))
          .isTrue();
    }

    @Test
    void whenSecondPositive() {
      String attributeName = "test";
      when(mockElement.getAttribute(attributeName)).thenReturn(attributeName);
      when(mockElement.getCssValue(attributeName)).thenReturn(attributeName);
      when(mockElement.getText()).thenReturn("");

      assertThat(
              wait.until(
                  or(
                      textToBePresentInElement(mockElement, attributeName),
                      attributeToBe(mockElement, attributeName, attributeName))))
          .isTrue();
    }

    @Test
    void whenAllPositive() {
      String attributeName = "test";
      when(mockElement.getAttribute(attributeName)).thenReturn(attributeName);
      when(mockElement.getCssValue(attributeName)).thenReturn(attributeName);
      when(mockElement.getText()).thenReturn(attributeName);

      assertThat(
              wait.until(
                  or(
                      attributeToBe(mockElement, attributeName, attributeName),
                      textToBePresentInElement(mockElement, attributeName))))
          .isTrue();
    }

    @Test
    void whenAllFailed() {
      when(mockElement.getText()).thenReturn("Hello, World!");
      when(mockElement.getCssValue("data-test-id")).thenReturn("");
      when(mockElement.getAttribute("data-test-id")).thenReturn("67890");

      assertThatThrownBy(
              () ->
                  wait.until(
                      or(
                          textToBePresentInElement(mockElement, "Good bye, World."),
                          attributeToBe(mockElement, "data-test-id", "12345"))))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for at least one condition to be valid:"
                  + lineSeparator()
                  + "1. element to have text \"Good bye, World.\". Current text: \"Hello, World!\"."
                  + lineSeparator()
                  + "2. attribute or CSS value \"data-test-id\"=\"12345\". Current value:"
                  + " \"67890\".")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }

    @Test
    void whenOneThrows() {
      when(mockElement.getAttribute("font-size")).thenReturn(null);
      when(mockElement.getCssValue("font-size"))
          .thenReturn("15pt")
          .thenReturn("16pt")
          .thenReturn("17pt")
          .thenReturn("18pt");
      when(mockElement.getText()).thenThrow(new NoSuchElementException("Element disappeared"));

      assertThat(
              wait.until(
                  or(
                      textToBePresentInElement(mockElement, "Hello, world"),
                      attributeToBe(mockElement, "font-size", "18pt"))))
          .isTrue();
    }

    @Test
    void whenAllThrow() {
      String attributeName = "test";
      when(mockElement.getAttribute(attributeName))
          .thenThrow(new NoSuchElementException("Disappeared 1"));
      when(mockElement.getCssValue(attributeName))
          .thenThrow(new StaleElementReferenceException("Disappeared 2"));
      when(mockElement.getText()).thenThrow(new StaleElementReferenceException("Disappeared 3"));

      assertThatThrownBy(
              () ->
                  wait.until(
                      or(
                          textToBePresentInElement(mockElement, attributeName),
                          attributeToBe(mockElement, attributeName, attributeName))))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for at least one condition to be valid:"
                  + lineSeparator()
                  + "1. element to have text \"test\", but..."
                  + " org.openqa.selenium.StaleElementReferenceException: Disappeared 3."
                  + lineSeparator()
                  + "2. attribute or CSS value \"test\"=\"test\". Current value: \"null\". (caused"
                  + " by: org.openqa.selenium.NoSuchElementException: Disappeared 1)")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }
  }

  @Nested
  class WaitingForAllExpectedConditions {
    @Test
    void whenFirstFailed() {
      when(mockElement.getText()).thenReturn("Goodbye, brown brick road");
      when(mockElement.getCssValue("data-test-id")).thenReturn("");
      when(mockElement.getAttribute("data-test-id")).thenReturn("report-123");

      assertThatThrownBy(
              () ->
                  wait.until(
                      and(
                          textToBePresentInElement(mockElement, "Goodbye, yellow brick road"),
                          attributeToBe(mockElement, "data-test-id", "report-456"))))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              String.format(
                  "Expected condition failed: waiting for all conditions to be valid, but condition"
                      + " #0 failed:%nExpected element to have text \"Goodbye, yellow brick road\"."
                      + " Current text: \"Goodbye, brown brick road\"."))
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }

    @Test
    void whenSecondFailed() {
      when(mockDriver.findElement(testSelector))
          .thenThrow(new NoSuchElementException("Initially, not found"))
          .thenThrow(new NoSuchElementException("Still not found"))
          .thenReturn(mockElement);
      when(mockElement.getCssValue("data-test-id")).thenReturn("");
      when(mockElement.getAttribute("data-test-id")).thenReturn("report-123");
      assertThatThrownBy(
              () ->
                  wait.until(
                      and(
                          presenceOfElementLocated(testSelector),
                          attributeToBe(mockElement, "data-test-id", "report-456"))))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              String.format(
                  "Expected condition failed: waiting for all conditions to be valid, but condition"
                      + " #1 failed:%nExpected attribute or CSS value"
                      + " \"data-test-id\"=\"report-456\". Current value: \"report-123\"."));
    }

    @Test
    void whenAllPositive() {
      when(mockElement.getText()).thenReturn("All right");
      when(mockElement.getCssValue("data-test-id")).thenReturn("");
      when(mockElement.getAttribute("data-test-id")).thenReturn("report-123");
      assertThat(
              wait.until(
                  and(
                      textToBePresentInElement(mockElement, "All right"),
                      attributeToBe(mockElement, "data-test-id", "report-123"))))
          .isTrue();
    }
  }

  @Nested
  class TextMatches {
    @Test
    void checksThatElementTextMatchesGivenRegex() {
      when(mockDriver.findElement(testSelector))
          .thenThrow(new NoSuchElementException("not found"))
          .thenReturn(mockElement);
      when(mockElement.getText())
          .thenThrow(new StaleElementReferenceException("Stale element"))
          .thenReturn("123");
      assertThat(wait.until(textMatches(testSelector, compile("\\d")))).isTrue();
    }

    @Test
    void fails_ifElementTextDoesNotMatchGivenRegex() {
      when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
      when(mockElement.getText()).thenReturn("test");
      assertThatThrownBy(() -> wait.until(textMatches(testSelector, Pattern.compile("\\d"))))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for text of element found by By.cssSelector:"
                  + " #test-selector to match pattern \"\\d\". Current text: \"test\".");
    }

    @Test
    void fails_ifElementDisappeared() {
      when(mockDriver.findElement(testSelector))
          .thenThrow(new NoSuchElementException("element not found"));
      assertThatThrownBy(() -> wait.until(textMatches(testSelector, Pattern.compile("\\d"))))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for text of element found by By.cssSelector:"
                  + " #test-selector to match pattern \"\\d\", but..."
                  + " org.openqa.selenium.NoSuchElementException: element not found.");
    }
  }

  @Nested
  class NumberOfElementsToBeMoreThan {
    @Test
    void negative() {
      when(mockDriver.findElements(testSelector))
          .thenReturn(List.of(mockElement, mockNestedElement));
      assertThatThrownBy(() -> wait.until(numberOfElementsToBeMoreThan(testSelector, 2)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for number of elements found by By.cssSelector:"
                  + " #test-selector to be more than 2. Found: 2 element(s).");
    }

    @Test
    void positive() {
      when(mockDriver.findElements(testSelector)).thenReturn(List.of(mockElement, mockElement));
      assertThat(wait.until(numberOfElementsToBeMoreThan(testSelector, 1))).hasSize(2);
    }
  }

  @Nested
  class NumberOfElementsToBeLessThan {
    @Test
    void negative() {
      when(mockDriver.findElements(testSelector))
          .thenReturn(List.of(mockElement, mockNestedElement, mockNestedElement2));
      assertThatThrownBy(() -> wait.until(numberOfElementsToBeLessThan(testSelector, 3)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for number of elements found by By.cssSelector:"
                  + " #test-selector to be less than 3. Found: 3 element(s).");
    }

    @Test
    void positive() {
      when(mockDriver.findElements(testSelector))
          .thenReturn(List.of(mockElement, mockNestedElement, mockNestedElement2))
          .thenReturn(List.of(mockElement, mockNestedElement, mockNestedElement2))
          .thenReturn(List.of(mockNestedElement, mockNestedElement2));

      assertThat(wait.until(numberOfElementsToBeLessThan(testSelector, 3))).hasSize(2);
    }
  }

  @Nested
  class NumberOfElementsToBe {
    @Test
    void positive() {
      when(mockDriver.findElements(testSelector))
          .thenReturn(List.of(mockElement, mockNestedElement));
      assertThat(wait.until(numberOfElementsToBe(testSelector, 2))).hasSize(2);
    }

    @Test
    void negative() {
      when(mockDriver.findElements(testSelector)).thenReturn(singletonList(mockElement));
      assertThatThrownBy(() -> wait.until(numberOfElementsToBe(testSelector, 2)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for number of elements found by By.cssSelector:"
                  + " #test-selector to be 2. Found: 1 element(s).");
    }
  }

  @Nested
  class VisibilityOfNestedElementsLocatedBy {
    @BeforeEach
    void setUp() {
      when(mockElement.findElements(nestedSelector))
          .thenReturn(List.of(mockNestedElement, mockNestedElement2));
      when(mockNestedElement.isDisplayed()).thenReturn(true);
    }

    @Nested
    class ForElement {
      @BeforeEach
      void setUp() {
        when(mockElement.findElements(testSelector))
            .thenReturn(List.of(mockNestedElement, mockNestedElement2));
        when(mockNestedElement.isDisplayed()).thenReturn(true);
      }

      @Test
      void element_whenElementIsVisible() {
        when(mockNestedElement2.isDisplayed()).thenReturn(true);

        List<WebElement> result =
            wait.until(visibilityOfNestedElementsLocatedBy(mockElement, testSelector));

        assertThat(result).containsExactly(mockNestedElement, mockNestedElement2);
      }

      @Test
      void element_negative() {
        when(mockNestedElement2.isDisplayed()).thenReturn(false);

        assertThatThrownBy(
                () -> wait.until(visibilityOfNestedElementsLocatedBy(mockElement, testSelector)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for visibility of all child elements located by"
                    + " [By.id: title] -> By.cssSelector: #test-selector, but child element #1 was"
                    + " invisible: [By.name: Gender]");
      }

      @Nested
      class BySelector {
        @BeforeEach
        void setUp() {
          when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        }

        @Test
        void positive() {
          when(mockNestedElement2.isDisplayed()).thenReturn(true);

          List<WebElement> nestedElements =
              wait.until(visibilityOfNestedElementsLocatedBy(testSelector, nestedSelector));

          assertThat(nestedElements).containsExactly(mockNestedElement, mockNestedElement2);
        }

        @Test
        void negative() {
          when(mockNestedElement2.isDisplayed()).thenReturn(false);

          assertThatThrownBy(
                  () ->
                      wait.until(visibilityOfNestedElementsLocatedBy(testSelector, nestedSelector)))
              .isInstanceOf(TimeoutException.class)
              .hasMessageStartingWith(
                  "Expected condition failed: waiting for visibility of all child elements located"
                      + " by By.cssSelector: #test-selector -> By.cssSelector: #nested-selector,"
                      + " but child element #1 was invisible: [By.name: Gender]");
        }
      }
    }
  }

  @Nested
  class PresenceOfElementLocated {
    @Test
    void positive() {
      when(mockDriver.findElement(testSelector))
          .thenThrow(new NoSuchElementException("Not found 1"))
          .thenThrow(new NoSuchElementException("Not found 2"))
          .thenReturn(mockElement);
      assertThat(wait.until(presenceOfElementLocated(testSelector))).isEqualTo(mockElement);
    }

    @Test
    void negative() {
      when(mockDriver.findElement(testSelector)).thenThrow(new NoSuchElementException("Not found"));
      assertThatThrownBy(() -> wait.until(presenceOfElementLocated(testSelector)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for presence of element found by"
                  + " By.cssSelector: #test-selector")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }
  }

  @Nested
  class PresenceOfAllElementsLocatedBy {
    @Test
    void positive() {
      when(mockDriver.findElements(testSelector))
          .thenReturn(emptyList())
          .thenReturn(emptyList())
          .thenReturn(List.of(mockElement, mockNestedElement));
      assertThat(wait.until(presenceOfAllElementsLocatedBy(testSelector)))
          .containsExactly(mockElement, mockNestedElement);
    }

    @Test
    void negative() {
      when(mockDriver.findElements(testSelector)).thenReturn(emptyList());
      assertThatThrownBy(() -> wait.until(presenceOfAllElementsLocatedBy(testSelector)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for presence of any elements located by"
                  + " By.cssSelector: #test-selector");
    }
  }

  @Nested
  class PresenceOfNestedElementLocatedBy {
    @Nested
    class ForElement {
      @Test
      void positive() {
        when(mockElement.findElement(testSelector)).thenReturn(mockNestedElement);
        WebElement result = wait.until(presenceOfNestedElementLocatedBy(mockElement, testSelector));
        assertThat(result).isEqualTo(mockNestedElement);
      }

      @Test
      void negative() {
        when(mockElement.findElement(testSelector)).thenThrow(new NoSuchElementException("Ooops"));
        assertThatThrownBy(
                () -> wait.until(presenceOfNestedElementLocatedBy(mockElement, testSelector)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for presence of child element found by"
                    + " By.cssSelector: #test-selector")
            .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
      }
    }

    @Nested
    class BySelector {
      @Test
      void positive() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockElement.findElement(nestedSelector)).thenReturn(mockNestedElement);

        WebElement result =
            wait.until(presenceOfNestedElementLocatedBy(testSelector, nestedSelector));

        assertThat(result).isEqualTo(mockNestedElement);
      }

      @Test
      void negative() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockElement.findElement(nestedSelector))
            .thenThrow(new NoSuchElementException("Ooops"));

        assertThatThrownBy(
                () -> wait.until(presenceOfNestedElementLocatedBy(testSelector, nestedSelector)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for presence of element found by"
                    + " By.cssSelector: #test-selector -> By.cssSelector: #nested-selector");
      }
    }
  }

  @Nested
  class PresenceOfNestedElementsLocatedBy {
    private final By parent = By.cssSelector(".parent");
    private final By child = By.cssSelector(".child");

    @Test
    void whenElementsPresent() {
      when(mockDriver.findElement(parent)).thenReturn(mockElement);
      when(mockElement.findElements(child))
          .thenReturn(List.of(mockNestedElement, mockNestedElement2));

      List<WebElement> elements = wait.until(presenceOfNestedElementsLocatedBy(parent, child));

      assertThat(elements).containsExactly(mockNestedElement, mockNestedElement2);
    }

    @Test
    void negative() {
      when(mockDriver.findElement(parent)).thenReturn(mockElement);
      when(mockElement.findElements(child)).thenReturn(emptyList());

      assertThatThrownBy(() -> wait.until(presenceOfNestedElementsLocatedBy(parent, child)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for presence of element(s) located by"
                  + " By.cssSelector: .parent -> By.cssSelector: .child");
    }
  }

  @Nested
  class InvisibilityOfAllElements {
    @Test
    void allInvisible() {
      when(mockElement.isDisplayed()).thenReturn(false);
      when(mockNestedElement.isDisplayed()).thenReturn(false);
      assertThat(wait.until(invisibilityOfAllElements(List.of(mockElement, mockNestedElement))))
          .isTrue();
      assertThat(wait.until(invisibilityOfAllElements(mockElement, mockNestedElement))).isTrue();
    }

    @Test
    void fails_whenAtLeastOneElementIsVisible() {
      when(mockElement.isDisplayed()).thenReturn(false);
      when(mockNestedElement.isDisplayed()).thenReturn(true);
      assertThatThrownBy(
              () -> wait.until(invisibilityOfAllElements(List.of(mockElement, mockNestedElement))))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for all elements to become invisible, but element"
                  + " #1 was visible: [By.name: Age]");
    }
  }

  @Nested
  class InvisibilityOf {
    @Test
    void positive() {
      when(mockElement.isDisplayed()).thenReturn(false);
      assertThat(wait.until(invisibilityOf(mockElement))).isTrue();
    }

    @Test
    void fails_ifElementIsVisible() {
      when(mockElement.isDisplayed()).thenReturn(true);
      assertThatThrownBy(() -> wait.until(invisibilityOf(mockElement)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for element [By.id: title] to become invisible");
    }
  }

  @Nested
  class InvisibilityOfElementLocated {
    @Test
    void elementNotFound() {
      when(mockDriver.findElement(testSelector))
          .thenReturn(mockElement)
          .thenReturn(mockElement)
          .thenThrow(new NoSuchElementException("Oops, not found"));
      when(mockElement.isDisplayed()).thenReturn(true);

      assertThat(wait.until(invisibilityOfElementLocated(testSelector))).isTrue();
    }

    @Test
    void elementNotVisible() {
      when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
      when(mockElement.isDisplayed()).thenReturn(false);

      assertThat(wait.until(invisibilityOfElementLocated(testSelector))).isTrue();
    }

    @Test
    void elementHasDisappeared() {
      when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
      when(mockElement.isDisplayed())
          .thenThrow(new StaleElementReferenceException("Element disappeared"));

      assertThat(wait.until(invisibilityOfElementLocated(testSelector))).isTrue();
    }

    @Test
    void fails_ifElementIsVisible() {
      when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
      when(mockElement.isDisplayed()).thenReturn(true);
      assertThatThrownBy(() -> wait.until(invisibilityOfElementLocated(testSelector)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for element found by By.cssSelector:"
                  + " #test-selector to become invisible");
    }
  }

  @Nested
  class InvisibilityOfElementWithText {
    @Test
    void allElementsAreHidden() {
      when(mockDriver.findElements(testSelector))
          .thenReturn(List.of(mockElement, mockNestedElement));
      when(mockElement.getText()).thenReturn("Hello");
      when(mockNestedElement.getText()).thenReturn("Hello");
      when(mockElement.isDisplayed()).thenReturn(false);
      when(mockNestedElement.isDisplayed()).thenReturn(false);

      assertThat(wait.until(invisibilityOfElementWithText(testSelector, "Hello"))).isTrue();
    }

    @Test
    void fails_ifAtLeastOneElementIsVisible() {
      when(mockDriver.findElements(testSelector))
          .thenReturn(List.of(mockElement, mockNestedElement));
      when(mockElement.getText()).thenReturn("Hello");
      when(mockNestedElement.getText()).thenReturn("Hello");
      when(mockElement.isDisplayed()).thenReturn(false);
      when(mockNestedElement.isDisplayed()).thenReturn(true);

      assertThatThrownBy(() -> wait.until(invisibilityOfElementWithText(testSelector, "Hello")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for element with text \"Hello\" located by"
                  + " \"By.cssSelector: #test-selector\" to become invisible: [By.name: Age]");
    }

    @Test
    void disappearedElementsAreTreatedAsInvisible() {
      when(mockDriver.findElements(testSelector))
          .thenReturn(List.of(mockElement, mockNestedElement));
      when(mockElement.getText()).thenReturn("Hello");
      when(mockNestedElement.getText()).thenReturn("Hello");
      when(mockElement.isDisplayed())
          .thenThrow(new StaleElementReferenceException("Element disappeared 1"));
      when(mockNestedElement.isDisplayed())
          .thenThrow(new StaleElementReferenceException("Element disappeared 2"));

      assertThat(wait.until(invisibilityOfElementWithText(testSelector, "Hello"))).isTrue();
    }
  }

  @Nested
  class TextToBePresentInElement {
    @Test
    void checkThatElementContainsText() {
      when(mockElement.getText()).thenReturn("Hello, World!");
      assertThat(wait.until(textToBePresentInElement(mockElement, "Hello, World!"))).isTrue();
      assertThat(wait.until(textToBePresentInElement(mockElement, "Hello"))).isTrue();
      assertThat(wait.until(textToBePresentInElement(mockElement, ", Wor"))).isTrue();
      assertThat(wait.until(textToBePresentInElement(mockElement, "ld!"))).isTrue();
    }

    @Test
    void throwsTimeoutException_whenTextNotPresent() {
      when(mockElement.getText()).thenReturn("Goodbye, World.");

      assertThatThrownBy(() -> wait.until(textToBePresentInElement(mockElement, "Hello, World!")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for element to have text \"Hello, World!\"."
                  + " Current text: \"Goodbye, World.\".")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }
  }

  @Nested
  class TextToBePresentInElementValue {
    @Nested
    class ForElement {
      @Test
      void checkThatValueAttributeContainsText() {
        when(mockElement.getAttribute("value"))
            .thenThrow(new StaleElementReferenceException("element disappeared"))
            .thenReturn(null)
            .thenReturn("Hello, World!");
        assertThat(wait.until(textToBePresentInElementValue(mockElement, "Hello, World!")))
            .isTrue();
        assertThat(wait.until(textToBePresentInElementValue(mockElement, "Hello"))).isTrue();
        assertThat(wait.until(textToBePresentInElementValue(mockElement, ", Wor"))).isTrue();
        assertThat(wait.until(textToBePresentInElementValue(mockElement, "ld!"))).isTrue();
      }

      @Test
      void throwsTimeoutException_whenValueDoesNotContainGivenText() {
        when(mockElement.getAttribute("value")).thenReturn("Goodbye, World.");

        assertThatThrownBy(
                () -> wait.until(textToBePresentInElementValue(mockElement, "Hello, World!")))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element \"value\" attribute to contain"
                    + " \"Hello, World!\". Current value: \"Goodbye, World.\".")
            .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
      }

      @Test
      void throwsTimeoutException_whenElementDisappeared() {
        when(mockElement.getAttribute("value"))
            .thenThrow(new StaleElementReferenceException("element disappeared"));

        assertThatThrownBy(
                () -> wait.until(textToBePresentInElementValue(mockElement, "Hello, World!")))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element \"value\" attribute to contain"
                    + " \"Hello, World!\", but..."
                    + " org.openqa.selenium.StaleElementReferenceException: element disappeared.")
            .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
      }
    }

    @Nested
    class BySelector {
      @Test
      void checkThatValueAttributeContainsText() {
        when(mockDriver.findElement(testSelector))
            .thenThrow(new NoSuchElementException("Oops, not found"))
            .thenThrow(new NoSuchElementException("Oops, not found again"))
            .thenReturn(mockElement);
        when(mockElement.getAttribute("value")).thenReturn(null).thenReturn("Hello, World!");

        assertThat(wait.until(textToBePresentInElementValue(testSelector, "Hello, World!")))
            .isTrue();
        assertThat(wait.until(textToBePresentInElementValue(testSelector, "Hello"))).isTrue();
        assertThat(wait.until(textToBePresentInElementValue(testSelector, ", Wor"))).isTrue();
        assertThat(wait.until(textToBePresentInElementValue(testSelector, "ld!"))).isTrue();
      }

      @Test
      void throwsTimeoutException_whenElementNotFound() {
        when(mockDriver.findElement(testSelector))
            .thenThrow(new NoSuchElementException("Oops, not found"));

        assertThatThrownBy(
                () -> wait.until(textToBePresentInElementValue(testSelector, "Hello, World!")))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element found by By.cssSelector:"
                    + " #test-selector to have \"value\" attribute containing \"Hello, World!\","
                    + " but... org.openqa.selenium.NoSuchElementException: Oops, not found.")
            .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
      }

      @Test
      void throwsTimeoutException_whenElementDisappeared() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockElement.getAttribute("value"))
            .thenThrow(new StaleElementReferenceException("Element disappeared"));

        assertThatThrownBy(
                () -> wait.until(textToBePresentInElementValue(testSelector, "Hello, World!")))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element found by By.cssSelector:"
                    + " #test-selector to have \"value\" attribute containing \"Hello, World!\","
                    + " but... org.openqa.selenium.StaleElementReferenceException: Element"
                    + " disappeared.")
            .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
      }

      @Test
      void throwsTimeoutException_whenValueDoesNotContainGivenText() {
        when(mockDriver.findElement(testSelector))
            .thenThrow(new NoSuchElementException("Oops, not found"))
            .thenReturn(mockElement);
        when(mockElement.getAttribute("value"))
            .thenReturn("Loading...")
            .thenReturn("Goodbye, World.");

        assertThatThrownBy(
                () -> wait.until(textToBePresentInElementValue(testSelector, "Hello, World!")))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element found by By.cssSelector:"
                    + " #test-selector to have \"value\" attribute containing \"Hello, World!\"."
                    + " Current value: \"Goodbye, World.\".")
            .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
      }
    }
  }

  @Nested
  class ElementSelectionStateToBe {
    @Nested
    class ForElement {
      @Test
      void waitingElementToBeSelected() {
        when(mockElement.isSelected()).thenReturn(false).thenReturn(false).thenReturn(true);

        assertThat(wait.until(elementSelectionStateToBe(mockElement, true))).isTrue();
        assertThat(wait.until(elementToBeSelected(mockElement))).isTrue();
      }

      @Test
      void waitingElementToBeUnselected() {
        when(mockElement.isSelected()).thenReturn(true).thenReturn(true).thenReturn(false);

        assertThat(wait.until(elementSelectionStateToBe(mockElement, false))).isTrue();
      }

      @Test
      void throwsTimeoutException_whenSelected() {
        when(mockElement.isSelected()).thenReturn(true);

        assertThatThrownBy(() -> wait.until(elementSelectionStateToBe(mockElement, false)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element ([By.id: title]) not to be"
                    + " selected");
      }

      @Test
      void throwsTimeoutException_whenNotSelected() {
        when(mockElement.isSelected()).thenReturn(false);

        assertThatThrownBy(() -> wait.until(elementSelectionStateToBe(mockElement, true)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element ([By.id: title]) to be selected");
      }

      @Test
      void throwsStaleException_whenElementIsStale() {
        when(mockElement.isSelected())
            .thenThrow(new StaleElementReferenceException("Element has disappeared from DOM"));

        assertThatThrownBy(() -> wait.until(elementSelectionStateToBe(mockElement, true)))
            .isInstanceOf(StaleElementReferenceException.class)
            .hasMessageStartingWith("Element has disappeared from DOM");
      }

      @Test
      void canIgnoreStaleException() {
        when(mockElement.isSelected())
            .thenThrow(new StaleElementReferenceException("Stale element 1"))
            .thenThrow(new StaleElementReferenceException("Stale element 2"))
            .thenReturn(false);

        assertThat(
                wait.ignoring(StaleElementReferenceException.class)
                    .until(elementSelectionStateToBe(mockElement, false)))
            .isTrue();
      }
    }

    @Nested
    class BySelector {
      @Test
      void waitingForElementToBeSelected() {
        when(mockDriver.findElement(testSelector))
            .thenThrow(new NoSuchElementException("Not found"))
            .thenReturn(mockElement);
        when(mockElement.isSelected())
            .thenThrow(new StaleElementReferenceException("Stale element"))
            .thenReturn(false, true);

        assertThat(wait.until(elementSelectionStateToBe(testSelector, true))).isTrue();
        assertThat(wait.until(elementToBeSelected(testSelector))).isTrue();
      }

      @Test
      void waitingForElementToBeUnselected() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockElement.isSelected())
            .thenThrow(new StaleElementReferenceException("Stale element 1"))
            .thenThrow(new StaleElementReferenceException("Stale element 2"))
            .thenReturn(true, false);

        assertThat(wait.until(elementSelectionStateToBe(testSelector, false))).isTrue();
      }

      @Test
      void throwsTimeoutException_whenSelected() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockElement.isSelected()).thenReturn(true);

        assertThatThrownBy(() -> wait.until(elementSelectionStateToBe(testSelector, false)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element found by By.cssSelector:"
                    + " #test-selector not to be selected");
      }

      @Test
      void throwsTimeoutException_whenNotSelected() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockElement.isSelected()).thenReturn(false);

        assertThatThrownBy(() -> wait.until(elementSelectionStateToBe(testSelector, true)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element found by By.cssSelector:"
                    + " #test-selector to be selected");
      }

      @Test
      void throwsTimeoutException_ifElementNotFound() {
        when(mockDriver.findElement(testSelector))
            .thenThrow(new NoSuchElementException("not found"));

        assertThatThrownBy(() -> wait.until(elementSelectionStateToBe(testSelector, true)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element found by By.cssSelector:"
                    + " #test-selector to be selected, but..."
                    + " org.openqa.selenium.NoSuchElementException: not found.");
      }

      @Test
      void throwsTimeoutException_onStaleException() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockElement.isSelected())
            .thenThrow(new StaleElementReferenceException("Stale element"));

        assertThatThrownBy(() -> wait.until(elementSelectionStateToBe(testSelector, true)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element found by By.cssSelector:"
                    + " #test-selector to be selected, but..."
                    + " org.openqa.selenium.StaleElementReferenceException: Stale element.");
      }
    }
  }

  @Nested
  class NumberOfWindowsToBe {
    @Test
    void positive() {
      when(mockDriver.getWindowHandles()).thenReturn(Set.of("w1", "w2"));

      assertThat(wait.until(numberOfWindowsToBe(2))).isTrue();
    }

    @Test
    void negative() {
      when(mockDriver.getWindowHandles()).thenReturn(Set.of("w1", "w2", "w3"));

      assertThatThrownBy(() -> wait.until(numberOfWindowsToBe(2)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for number of open windows to be 2, but was: 3");
    }

    @Test
    void throwsTimeoutException_whenWebDriverException() {
      WebDriverException cause = new WebDriverException("Oops, failed to count browser windows");
      when(mockDriver.getWindowHandles()).thenThrow(cause);

      assertThatThrownBy(() -> wait.until(numberOfWindowsToBe(2)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for number of open windows to be 2, but..."
                  + " org.openqa.selenium.WebDriverException: Oops, failed to count browser"
                  + " windows.");
    }
  }

  @Nested
  class FrameToBeAvailableAndSwitchToIt {
    @Nested
    class ByFrameSelector {
      @Test
      void waitsForTheFrame() {
        when(mockDriver.findElement(testSelector))
            .thenThrow(new NoSuchElementException("Frame not found 1"))
            .thenThrow(new NoSuchElementException("Frame not found 2"))
            .thenReturn(mockElement);
        when(mockTargetLocator.frame(mockElement))
            .thenThrow(new NoSuchFrameException("No frame found 1"))
            .thenReturn(mockDriver);

        assertThat(wait.until(frameToBeAvailableAndSwitchToIt(testSelector))).isEqualTo(mockDriver);

        verify(mockDriver, times(2)).switchTo();
        verify(mockTargetLocator, times(2)).frame(mockElement);
      }

      @Test
      void frameNotFound() {
        when(mockDriver.findElement(testSelector))
            .thenThrow(new NoSuchElementException("Frame not found"));
        assertThatThrownBy(() -> wait.until(frameToBeAvailableAndSwitchToIt(testSelector)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for frame to be available: By.cssSelector:"
                    + " #test-selector, but... org.openqa.selenium.NoSuchElementException: Frame"
                    + " not found.");
      }

      @Test
      void switchingToFrameFailed() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockTargetLocator.frame(mockElement))
            .thenThrow(new NoSuchFrameException("No frame found"));
        assertThatThrownBy(() -> wait.until(frameToBeAvailableAndSwitchToIt(testSelector)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for frame to be available: By.cssSelector:"
                    + " #test-selector, but... org.openqa.selenium.NoSuchFrameException: No frame"
                    + " found.");
      }
    }

    @Nested
    class ByFrameNameOrId {
      @Test
      void waitsForTheFrame() {
        when(mockTargetLocator.frame("paymentFrame"))
            .thenThrow(new NoSuchFrameException("No frame found 1"))
            .thenThrow(new NoSuchFrameException("No frame found 2"))
            .thenThrow(new NoSuchFrameException("No frame found 3"))
            .thenReturn(mockDriver);

        assertThat(wait.until(frameToBeAvailableAndSwitchToIt("paymentFrame")))
            .isEqualTo(mockDriver);

        verify(mockDriver, times(4)).switchTo();
        verify(mockTargetLocator, times(4)).frame("paymentFrame");
      }

      @Test
      void frameNotFound() {
        when(mockTargetLocator.frame("paymentFrame"))
            .thenThrow(new NoSuchFrameException("No frame found"));

        assertThatThrownBy(() -> wait.until(frameToBeAvailableAndSwitchToIt("paymentFrame")))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for frame with name or id \"paymentFrame\" to"
                    + " be available, but... org.openqa.selenium.NoSuchFrameException: No frame"
                    + " found.");
      }
    }

    @Nested
    class ByFrameIndex {
      @Test
      void waitsForTheFrame() {
        when(mockTargetLocator.frame(42))
            .thenThrow(new NoSuchFrameException("No frame found 1"))
            .thenThrow(new NoSuchFrameException("No frame found 2"))
            .thenReturn(mockDriver);

        assertThat(wait.until(frameToBeAvailableAndSwitchToIt(42))).isEqualTo(mockDriver);

        verify(mockDriver, times(3)).switchTo();
        verify(mockTargetLocator, times(3)).frame(42);
      }

      @Test
      void frameNotFound() {
        when(mockTargetLocator.frame(42)).thenThrow(new NoSuchFrameException("No frame found"));

        assertThatThrownBy(() -> wait.until(frameToBeAvailableAndSwitchToIt(42)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for frame #42 to be available, but..."
                    + " org.openqa.selenium.NoSuchFrameException: No frame found.");
      }
    }

    @Nested
    class ByFrameElement {
      @Test
      void waitsForTheFrame() {
        when(mockTargetLocator.frame(mockElement))
            .thenThrow(new NoSuchFrameException("No frame found 1"))
            .thenThrow(new NoSuchFrameException("No frame found 2"))
            .thenReturn(mockDriver);

        assertThat(wait.until(frameToBeAvailableAndSwitchToIt(mockElement))).isEqualTo(mockDriver);

        verify(mockDriver, times(3)).switchTo();
        verify(mockTargetLocator, times(3)).frame(mockElement);
      }

      @Test
      void frameNotFound() {
        when(mockTargetLocator.frame(mockElement))
            .thenThrow(new NoSuchFrameException("No frame found"));

        assertThatThrownBy(() -> wait.until(frameToBeAvailableAndSwitchToIt(mockElement)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for frame to be available, but..."
                    + " org.openqa.selenium.NoSuchFrameException: No frame found.");
      }
    }
  }

  @Nested
  class JavaScriptThrowsNoExceptions {
    @Test
    void positive() {
      when(mockDriver.executeScript(anyString()))
          .thenThrow(new JavascriptException("ReferenceError: names is not defined"))
          .thenThrow(new JavascriptException("ReferenceError: names is not defined"))
          .thenReturn(42);
      assertThat(wait.until(javaScriptThrowsNoExceptions("return 2 + names.length;"))).isTrue();
      verify(mockDriver, times(3)).executeScript("return 2 + names.length;");
    }

    @Test
    void fails_ifJsCodeThrowsException() {
      when(mockDriver.executeScript("return 2 + foo.bar;"))
          .thenThrow(new JavascriptException("ReferenceError: foo is not defined"));
      assertThatThrownBy(() -> wait.until(javaScriptThrowsNoExceptions("return 2 + foo.bar;")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for JS code `return 2 + foo.bar;` to be"
                  + " executable, but... org.openqa.selenium.JavascriptException: ReferenceError:"
                  + " foo is not defined");
    }
  }

  @Nested
  class JsReturnsValue {
    @Test
    void positive() {
      when(mockDriver.executeScript(anyString()))
          .thenThrow(new JavascriptException("ReferenceError: names is not defined"))
          .thenThrow(new JavascriptException("ReferenceError: names is not defined"))
          .thenReturn(42);
      assertThat(wait.until(jsReturnsValue("return 2 + names.length;"))).isEqualTo(42);
      verify(mockDriver, times(3)).executeScript("return 2 + names.length;");
    }

    @Test
    void fails_ifJsCodeThrowsException() {
      when(mockDriver.executeScript("return 2 + foo.bar;"))
          .thenThrow(new JavascriptException("ReferenceError: foo is not defined"));
      assertThatThrownBy(() -> wait.until(jsReturnsValue("return 2 + foo.bar;")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for JS code `return 2 + foo.bar;` to return a"
                  + " value, but... org.openqa.selenium.JavascriptException: ReferenceError: foo is"
                  + " not defined");
    }

    @Test
    void ok_ifJsCodeReturnsNonEmptyString() {
      when(mockDriver.executeScript("return user.name;")).thenReturn("John");
      assertThat(wait.until(jsReturnsValue("return user.name;"))).isEqualTo("John");
    }

    @Test
    void fails_ifJsCodeReturnsEmptyString() {
      when(mockDriver.executeScript("return user.name;")).thenReturn("");
      assertThatThrownBy(() -> wait.until(jsReturnsValue("return user.name;")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for JS code `return user.name;` to return a"
                  + " value");
    }

    @Test
    void ok_ifJsCodeReturnsNonEmptyCollection() {
      when(mockDriver.executeScript("return users;")).thenReturn(List.of("john", "admin"));
      assertThat(wait.until(jsReturnsValue("return users;")))
          .asInstanceOf(LIST)
          .containsExactly("john", "admin");
    }

    @Test
    void fails_ifJsCodeReturnsEmptyCollection() {
      when(mockDriver.executeScript("return users;")).thenReturn(emptyList());
      assertThatThrownBy(() -> wait.until(jsReturnsValue("return users;")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for JS code `return users;` to return a value");
    }
  }

  @Nested
  class ElementToBeClickable {
    @Nested
    class BySelector {
      @Test
      void checksThatElementIsVisibleAndEnabled() {
        when(mockDriver.findElement(testSelector))
            .thenThrow(new NoSuchElementException("Initially, not found"))
            .thenThrow(new NoSuchElementException("Still not found"))
            .thenReturn(mockElement);
        when(mockElement.isDisplayed()).thenReturn(true);
        when(mockElement.isEnabled()).thenReturn(true);

        assertThat(wait.until(elementToBeClickable(testSelector))).isEqualTo(mockElement);
      }

      @Test
      void fails_ifElementNotFound() {
        when(mockDriver.findElement(testSelector))
            .thenThrow(new NoSuchElementException("Not found"));
        assertThatThrownBy(() -> wait.until(elementToBeClickable(testSelector)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element found by By.cssSelector:"
                    + " #test-selector to be clickable, but the element was not found:"
                    + " org.openqa.selenium.NoSuchElementException: Not found.");
      }

      @Test
      void fails_ifElementNotVisible() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockElement.isDisplayed()).thenReturn(false);
        assertThatThrownBy(() -> wait.until(elementToBeClickable(testSelector)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element found by By.cssSelector:"
                    + " #test-selector to be clickable, but the element was not visible.");
      }

      @Test
      void fails_ifElementNotEnabled() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockElement.isDisplayed()).thenReturn(true);
        when(mockElement.isEnabled()).thenReturn(false);
        assertThatThrownBy(() -> wait.until(elementToBeClickable(testSelector)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element found by By.cssSelector:"
                    + " #test-selector to be clickable, but the element was not enabled.");
      }

      @Test
      void fails_ifElementDisappeared() {
        when(mockDriver.findElement(testSelector)).thenReturn(mockElement);
        when(mockElement.isDisplayed()).thenReturn(true);
        when(mockElement.isEnabled())
            .thenReturn(false, false)
            .thenThrow(new StaleElementReferenceException("Element disappeared"));
        assertThatThrownBy(() -> wait.until(elementToBeClickable(mockElement)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element to be clickable, but the element"
                    + " was not found: org.openqa.selenium.StaleElementReferenceException: Element"
                    + " disappeared.");
      }
    }

    @Nested
    class ForElement {
      @Test
      void checksThatElementIsVisibleAndEnabled() {
        when(mockElement.isDisplayed()).thenReturn(true);
        when(mockElement.isEnabled()).thenReturn(true);

        assertThat(wait.until(elementToBeClickable(mockElement))).isEqualTo(mockElement);
      }

      @Test
      void fails_ifElementNotVisible() {
        when(mockElement.isDisplayed()).thenReturn(false);
        assertThatThrownBy(() -> wait.until(elementToBeClickable(mockElement)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element to be clickable, but the element"
                    + " was not visible.");
      }

      @Test
      void fails_ifElementNotEnabled() {
        when(mockElement.isDisplayed()).thenReturn(true);
        when(mockElement.isEnabled()).thenReturn(false);
        assertThatThrownBy(() -> wait.until(elementToBeClickable(mockElement)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element to be clickable, but the element"
                    + " was not enabled.");
      }

      @Test
      void fails_ifElementDisappeared() {
        when(mockElement.isDisplayed()).thenReturn(true);
        when(mockElement.isEnabled())
            .thenReturn(false, false)
            .thenThrow(new StaleElementReferenceException("Element disappeared"));
        assertThatThrownBy(() -> wait.until(elementToBeClickable(mockElement)))
            .isInstanceOf(TimeoutException.class)
            .hasMessageStartingWith(
                "Expected condition failed: waiting for element to be clickable, but the element"
                    + " was not found: org.openqa.selenium.StaleElementReferenceException: Element"
                    + " disappeared.");
      }
    }
  }

  @Nested
  class StalenessOf {
    @Test
    void waitsUntilElementDisappears() {
      when(mockElement.isEnabled())
          .thenReturn(true)
          .thenReturn(false)
          .thenThrow(new StaleElementReferenceException("Element disappeared"));
      assertThat(wait.until(stalenessOf(mockElement))).isTrue();
    }

    @Test
    void fails_ifElementStillExists() {
      when(mockElement.isEnabled()).thenReturn(true, false, true, false);
      assertThatThrownBy(() -> wait.until(stalenessOf(mockElement)))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for element ([By.id: title]) to become stale");
    }
  }

  @Nested
  class DomPropertyToBe {
    @Test
    void checksDomProperty() {
      when(mockElement.getDomProperty("value")).thenReturn("Loading...", "Wait...", "Hello");
      assertThat(wait.until(domPropertyToBe(mockElement, "value", "Hello"))).isTrue();
    }

    @Test
    void fails_ifDomPropertyIsNotEqual() {
      when(mockElement.getDomProperty("value")).thenReturn("Loading...", "Wait...", "Goodbye");
      assertThatThrownBy(() -> wait.until(domPropertyToBe(mockElement, "value", "Hello")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for DOM property \"value\" to be \"Hello\"."
                  + " Current value: \"Goodbye\".");
    }
  }

  @Nested
  class DomAttributeToBe {
    @Test
    void checksDomProperty() {
      when(mockElement.getDomAttribute("value")).thenReturn("Loading...", "Wait...", "Hello");
      assertThat(wait.until(domAttributeToBe(mockElement, "value", "Hello"))).isTrue();
    }

    @Test
    void fails_ifDomPropertyIsNotEqual() {
      when(mockElement.getDomAttribute("value")).thenReturn("Loading...", "Wait...", "Goodbye");
      assertThatThrownBy(() -> wait.until(domAttributeToBe(mockElement, "value", "Hello")))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith(
              "Expected condition failed: waiting for DOM attribute \"value\" to be \"Hello\"."
                  + " Current value: \"Goodbye\".");
    }
  }

  @Nested
  class AlertIsPresent {
    private final Alert alert = mock();

    @Test
    void positive() {
      when(mockTargetLocator.alert())
          .thenThrow(new NoAlertPresentException("no dialogs yet"))
          .thenThrow(new NoAlertPresentException("still no dialogs..."))
          .thenReturn(alert);
      assertThat(wait.until(alertIsPresent())).isEqualTo(alert);
      verify(mockTargetLocator, times(3)).alert();
    }

    @Test
    void negative() {
      when(mockTargetLocator.alert()).thenThrow(new NoAlertPresentException("no dialogs"));
      assertThatThrownBy(() -> wait.until(alertIsPresent()))
          .isInstanceOf(TimeoutException.class)
          .hasMessageStartingWith("Expected condition failed: waiting for alert to be present")
          .hasMessageContaining("tried for 1.1 seconds with 250 milliseconds interval");
    }
  }

  interface GenericCondition extends ExpectedCondition<Object> {}

  interface Driver extends WebDriver, JavascriptExecutor {}
}
