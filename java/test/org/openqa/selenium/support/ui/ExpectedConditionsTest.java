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

import static java.time.Instant.EPOCH;
import static java.util.Collections.singletonList;
import static java.util.regex.Pattern.compile;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.support.ui.ExpectedConditions.and;
import static org.openqa.selenium.support.ui.ExpectedConditions.attributeContains;
import static org.openqa.selenium.support.ui.ExpectedConditions.attributeToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.attributeToBeNotEmpty;
import static org.openqa.selenium.support.ui.ExpectedConditions.elementSelectionStateToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.invisibilityOf;
import static org.openqa.selenium.support.ui.ExpectedConditions.invisibilityOfAllElements;
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.support.ui.ExpectedConditions.numberOfElementsToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.numberOfElementsToBeLessThan;
import static org.openqa.selenium.support.ui.ExpectedConditions.numberOfElementsToBeMoreThan;
import static org.openqa.selenium.support.ui.ExpectedConditions.numberOfWindowsToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.or;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfNestedElementLocatedBy;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfNestedElementsLocatedBy;
import static org.openqa.selenium.support.ui.ExpectedConditions.textMatches;
import static org.openqa.selenium.support.ui.ExpectedConditions.textToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.textToBePresentInElement;
import static org.openqa.selenium.support.ui.ExpectedConditions.textToBePresentInElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.urlContains;
import static org.openqa.selenium.support.ui.ExpectedConditions.urlMatches;
import static org.openqa.selenium.support.ui.ExpectedConditions.urlToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfAllElements;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfAllElementsLocatedBy;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfNestedElementsLocatedBy;

import com.google.common.collect.Sets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

@Tag("UnitTests")
class ExpectedConditionsTest {

  @Mock private WebDriver mockDriver;
  @Mock private WebElement mockElement;
  @Mock private WebElement mockNestedElement;
  @Mock private java.time.Clock mockClock;
  @Mock private Sleeper mockSleeper;
  @Mock private GenericCondition mockCondition;

  private FluentWait<WebDriver> wait;

  @BeforeEach
  public void setUpMocks() {
    MockitoAnnotations.initMocks(this);

    wait =
        new FluentWait<>(mockDriver, mockClock, mockSleeper)
            .withTimeout(Duration.ofSeconds(1))
            .pollingEvery(Duration.ofMillis(250));

    // Set up a time series that extends past the end of our wait's timeout
    when(mockClock.instant())
        .thenReturn(
            EPOCH,
            EPOCH.plusMillis(250),
            EPOCH.plusMillis(500),
            EPOCH.plusMillis(1000),
            EPOCH.plusMillis(2000));
  }

  @Test
  void waitingForUrlToBeOpened_urlToBe() {
    final String url = "http://some_url";
    when(mockDriver.getCurrentUrl()).thenReturn(url);

    wait.until(urlToBe(url));
  }

  @Test
  void waitingForUrlToBeOpened_urlContains() {
    final String url = "http://some_url";
    when(mockDriver.getCurrentUrl()).thenReturn(url);

    wait.until(urlContains("some_url"));
  }

  @Test
  void waitingForUrlToBeOpened_urlMatches() {
    final String url = "http://some-dynamic:4000/url";
    when(mockDriver.getCurrentUrl()).thenReturn(url);

    wait.until(urlMatches(".*:\\d{4}\\/url"));
  }

  @Test
  void negative_waitingForUrlToBeOpened_urlToBe() {
    final String url = "http://some_url";
    when(mockDriver.getCurrentUrl()).thenReturn(url);

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(urlToBe(url + "/malformed")));
  }

  @Test
  void negative_waitingForUrlToBeOpened_urlContains() {
    final String url = "http://some_url";
    when(mockDriver.getCurrentUrl()).thenReturn(url);

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(urlContains("/malformed")));
  }

  @Test
  void negative_waitingForUrlToBeOpened_urlMatches() {
    final String url = "http://some-dynamic:4000/url";
    when(mockDriver.getCurrentUrl()).thenReturn(url);

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(urlMatches(".*\\/malformed.*")));
  }

  @Test
  void waitingForVisibilityOfElement_elementAlreadyVisible() {
    when(mockElement.isDisplayed()).thenReturn(true);

    assertThat(wait.until(visibilityOf(mockElement))).isSameAs(mockElement);
    verifyNoInteractions(mockSleeper);
  }

  @Test
  void waitingForVisibilityOfElement_elementBecomesVisible() throws InterruptedException {
    when(mockElement.isDisplayed()).thenReturn(false, false, true);

    assertThat(wait.until(visibilityOf(mockElement))).isSameAs(mockElement);
    verify(mockSleeper, times(2)).sleep(Duration.ofMillis(250));
  }

  @Test
  void waitingForVisibilityOfElement_elementNeverBecomesVisible() throws InterruptedException {
    Mockito.reset(mockClock);
    when(mockClock.instant()).thenReturn(EPOCH, EPOCH.plusMillis(500), EPOCH.plusMillis(3000));
    when(mockElement.isDisplayed()).thenReturn(false, false);

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(visibilityOf(mockElement)));
    verify(mockSleeper, times(1)).sleep(Duration.ofMillis(250));
  }

  @Test
  void waitingForVisibilityOfElementInverse_elementNotVisible() {
    when(mockElement.isDisplayed()).thenReturn(false);

    assertThat(wait.until(not(visibilityOf(mockElement)))).isTrue();
    verifyNoInteractions(mockSleeper);
  }

  @Test
  void booleanExpectationsCanBeNegated() {
    ExpectedCondition<Boolean> expectation = not(obj -> false);

    assertThat(expectation.apply(mockDriver)).isTrue();
  }

  @Test
  void waitingForVisibilityOfElementInverse_elementStaysVisible() throws InterruptedException {
    Mockito.reset(mockClock);
    when(mockClock.instant()).thenReturn(EPOCH, EPOCH.plusMillis(500), EPOCH.plusMillis(3000));
    when(mockElement.isDisplayed()).thenReturn(true, true);

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(not(visibilityOf(mockElement))));
    verify(mockSleeper, times(1)).sleep(Duration.ofMillis(250));
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
  void invertingAConditionThatAlwaysReturnsTrueTimesout() {
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

  @Test
  void waitingForVisibilityOfAllElementsLocatedByReturnsListOfElements() {
    List<WebElement> webElements = singletonList(mockElement);
    String testSelector = "testSelector";

    when(mockDriver.findElements(By.cssSelector(testSelector))).thenReturn(webElements);
    when(mockElement.isDisplayed()).thenReturn(true);

    List<WebElement> returnedElements =
        wait.until(visibilityOfAllElementsLocatedBy(By.cssSelector(testSelector)));
    assertThat(returnedElements).isEqualTo(webElements);
  }

  @Test
  void waitingForVisibilityOfAllElementsLocatedByThrowsTimeoutExceptionWhenElementNotDisplayed() {
    List<WebElement> webElements = singletonList(mockElement);
    String testSelector = "testSelector";

    when(mockDriver.findElements(By.cssSelector(testSelector))).thenReturn(webElements);
    when(mockElement.isDisplayed()).thenReturn(false);

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(
            () -> wait.until(visibilityOfAllElementsLocatedBy(By.cssSelector(testSelector))));
  }

  @Test
  void waitingForVisibilityOfAllElementsLocatedByThrowsStaleExceptionWhenElementIsStale() {
    List<WebElement> webElements = singletonList(mockElement);
    String testSelector = "testSelector";

    when(mockDriver.findElements(By.cssSelector(testSelector))).thenReturn(webElements);
    when(mockElement.isDisplayed()).thenThrow(new StaleElementReferenceException("Stale element"));

    assertThatExceptionOfType(StaleElementReferenceException.class)
        .isThrownBy(
            () -> wait.until(visibilityOfAllElementsLocatedBy(By.cssSelector(testSelector))));
  }

  @Test
  void waitingForVisibilityOfAllElementsLocatedByThrowsTimeoutExceptionWhenNoElementsFound() {
    List<WebElement> webElements = new ArrayList<>();
    String testSelector = "testSelector";

    when(mockDriver.findElements(By.cssSelector(testSelector))).thenReturn(webElements);

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(
            () -> wait.until(visibilityOfAllElementsLocatedBy(By.cssSelector(testSelector))));
  }

  @Test
  void waitingForVisibilityOfAllElementsReturnsListOfElements() {
    List<WebElement> webElements = singletonList(mockElement);
    when(mockElement.isDisplayed()).thenReturn(true);

    List<WebElement> returnedElements = wait.until(visibilityOfAllElements(webElements));
    assertThat(returnedElements).isEqualTo(webElements);
  }

  @Test
  void waitingForVisibilityOfAllElementsThrowsTimeoutExceptionWhenElementNotDisplayed() {
    List<WebElement> webElements = singletonList(mockElement);
    when(mockElement.isDisplayed()).thenReturn(false);

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(visibilityOfAllElements(webElements)));
  }

  @Test
  void waitingForVisibilityOfAllElementsThrowsStaleElementReferenceExceptionWhenElementIsStale() {
    List<WebElement> webElements = singletonList(mockElement);

    when(mockElement.isDisplayed()).thenThrow(new StaleElementReferenceException("Stale element"));

    assertThatExceptionOfType(StaleElementReferenceException.class)
        .isThrownBy(() -> wait.until(visibilityOfAllElements(webElements)));
  }

  @Test
  void waitingForVisibilityOfAllElementsThrowsTimeoutExceptionWhenNoElementsFound() {
    List<WebElement> webElements = new ArrayList<>();

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(visibilityOfAllElements(webElements)));
  }

  @Test
  void waitingForVisibilityOfReturnsElement() {
    when(mockElement.isDisplayed()).thenReturn(true);

    WebElement returnedElement = wait.until(visibilityOf(mockElement));
    assertThat(returnedElement).isEqualTo(mockElement);
  }

  @Test
  void waitingForVisibilityOfThrowsTimeoutExceptionWhenElementNotDisplayed() {

    when(mockElement.isDisplayed()).thenReturn(false);

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(visibilityOf(mockElement)));
  }

  @Test
  void waitingForVisibilityOfThrowsStaleElementReferenceExceptionWhenElementIsStale() {

    when(mockElement.isDisplayed()).thenThrow(new StaleElementReferenceException("Stale element"));

    assertThatExceptionOfType(StaleElementReferenceException.class)
        .isThrownBy(() -> wait.until(visibilityOf(mockElement)));
  }

  @Test
  void waitingForTextToBePresentInElementLocatedReturnsElement() {
    String testSelector = "testSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getText()).thenReturn("testText");

    assertThat(
            wait.until(textToBePresentInElementLocated(By.cssSelector(testSelector), "testText")))
        .isTrue();
  }

  @Test
  void waitingForTextToBePresentInElementLocatedReturnsElementWhenTextContainsSaidText() {
    String testSelector = "testSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getText()).thenReturn("testText");

    assertThat(wait.until(textToBePresentInElementLocated(By.cssSelector(testSelector), "test")))
        .isTrue();
  }

  @Test
  void
      waitingForHtmlAttributeToBeEqualForElementLocatedReturnsTrueWhenAttributeIsEqualToSaidText() {
    String testSelector = "testSelector";
    String attributeName = "attributeName";
    String attributeValue = "attributeValue";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getAttribute(attributeName)).thenReturn(attributeValue);
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    assertThat(
            wait.until(attributeToBe(By.cssSelector(testSelector), attributeName, attributeValue)))
        .isTrue();
  }

  @Test
  void waitingForCssAttributeToBeEqualForElementLocatedReturnsTrueWhenAttributeIsEqualToSaidText() {
    String testSelector = "testSelector";
    String attributeName = "attributeName";
    String attributeValue = "attributeValue";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn(attributeValue);

    assertThat(
            wait.until(attributeToBe(By.cssSelector(testSelector), attributeName, attributeValue)))
        .isTrue();
  }

  @Test
  void
      waitingForCssAttributeToBeEqualForElementLocatedThrowsTimeoutExceptionWhenAttributeIsNotEqual() {
    String testSelector = "testSelector";
    String attributeName = "attributeName";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(
            () -> wait.until(attributeToBe(By.cssSelector(testSelector), attributeName, "test")));
  }

  @Test
  void waitingForHtmlAttributeToBeEqualForWebElementReturnsTrueWhenAttributeIsEqualToSaidText() {
    String attributeName = "attributeName";
    String attributeValue = "attributeValue";
    when(mockElement.getAttribute(attributeName)).thenReturn(attributeValue);
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    assertThat(wait.until(attributeToBe(mockElement, attributeName, attributeValue))).isTrue();
  }

  @Test
  void waitingForCssAttributeToBeEqualForWebElementReturnsTrueWhenAttributeIsEqualToSaidText() {
    String attributeName = "attributeName";
    String attributeValue = "attributeValue";
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn(attributeValue);

    assertThat(wait.until(attributeToBe(mockElement, attributeName, attributeValue))).isTrue();
  }

  @Test
  void waitingForCssAttributeToBeEqualForWebElementThrowsTimeoutExceptionWhenAttributeIsNotEqual() {
    String attributeName = "attributeName";
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(attributeToBe(mockElement, attributeName, "test")));
  }

  @Test
  void
      waitingForHtmlAttributeToBeEqualForElementLocatedReturnsTrueWhenAttributeContainsEqualToSaidText() {
    String testSelector = "testSelector";
    String attributeName = "attributeName";
    String attributeValue = "test attributeValue test";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getAttribute(attributeName)).thenReturn(attributeValue);
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    assertThat(
            wait.until(
                attributeContains(By.cssSelector(testSelector), attributeName, "attributeValue")))
        .isTrue();
  }

  @Test
  void
      waitingForCssAttributeToBeEqualForElementLocatedReturnsTrueWhenAttributeContainsEqualToSaidText() {
    String testSelector = "testSelector";
    String attributeName = "attributeName";
    String attributeValue = "test attributeValue test";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn(attributeValue);

    assertThat(
            wait.until(
                attributeContains(By.cssSelector(testSelector), attributeName, "attributeValue")))
        .isTrue();
  }

  @Test
  void
      waitingForCssAttributeToBeEqualForElementLocatedThrowsTimeoutExceptionWhenAttributeContainsNotEqual() {
    By parent = By.cssSelector("parent");
    String attributeName = "attributeName";
    when(mockDriver.findElement(parent)).thenReturn(mockElement);
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(attributeContains(parent, attributeName, "test")));
  }

  @Test
  void
      waitingForHtmlAttributeToBeEqualForWebElementReturnsTrueWhenAttributeContainsEqualToSaidText() {
    String attributeName = "attributeName";
    String attributeValue = "test attributeValue test";
    when(mockElement.getAttribute(attributeName)).thenReturn(attributeValue);
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    assertThat(wait.until(attributeContains(mockElement, attributeName, "attributeValue")))
        .isTrue();
  }

  @Test
  void
      waitingForCssAttributeToBeEqualForWebElementReturnsTrueWhenAttributeContainsEqualToSaidText() {
    String attributeName = "attributeName";
    String attributeValue = "test attributeValue test";
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn(attributeValue);

    assertThat(wait.until(attributeContains(mockElement, attributeName, "attributeValue")))
        .isTrue();
  }

  @Test
  void
      waitingForCssAttributeToBeEqualForWebElementThrowsTimeoutExceptionWhenAttributeContainsNotEqual() {
    String attributeName = "attributeName";
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(attributeContains(mockElement, attributeName, "test")));
  }

  @Test
  void waitingForTextToBeEqualForElementLocatedReturnsTrueWhenTextIsEqualToSaidText() {
    String testSelector = "testSelector";
    String testText = "test text";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getText()).thenReturn(testText);

    assertThat(wait.until(textToBe(By.cssSelector(testSelector), testText))).isTrue();
  }

  @Test
  void waitingForAttributeToBeNotEmptyForElementLocatedReturnsTrueWhenAttributeIsNotEmptyCss() {
    String attributeName = "test";
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn("test1");

    assertThat(wait.until(attributeToBeNotEmpty(mockElement, attributeName))).isTrue();
  }

  @Test
  void waitingForAttributeToBeNotEmptyForElementLocatedReturnsTrueWhenAttributeIsNotEmptyHtml() {
    String attributeName = "test";
    when(mockElement.getAttribute(attributeName)).thenReturn("test1");
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    assertThat(wait.until(attributeToBeNotEmpty(mockElement, attributeName))).isTrue();
  }

  @Test
  void waitingForTextToBeEqualForElementLocatedThrowsTimeoutExceptionWhenTextIsNotEqual() {
    String testSelector = "testSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getText()).thenReturn("");

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(textToBe(By.cssSelector(testSelector), "test")));
  }

  @Test
  void
      waitingForAttributeToBeNotEmptyForElementLocatedThrowsTimeoutExceptionWhenAttributeIsEmpty() {
    String attributeName = "test";
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(attributeToBeNotEmpty(mockElement, attributeName)));
  }

  @Test
  void waitingForOneOfExpectedConditionsToHavePositiveResultWhenAllFailed() {
    String attributeName = "test";
    when(mockElement.getText()).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn("");
    when(mockElement.getAttribute(attributeName)).thenReturn("");

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(
            () ->
                wait.until(
                    or(
                        textToBePresentInElement(mockElement, "test"),
                        attributeToBe(mockElement, attributeName, "test"))));
  }

  @Test
  void waitForOneOfExpectedConditionsToHavePositiveResultWhenFirstPositive() {
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
  void waitForOneOfExpectedConditionsToHavePositiveResultWhenAllPositive() {
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
  void waitForOneOfExpectedConditionsToHavePositiveResultWhenSecondPositive() {
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
  void waitForOneOfExpectedConditionsToHavePositiveResultWhenOneThrows() {
    String attributeName = "test";
    when(mockElement.getAttribute(attributeName)).thenReturn(attributeName);
    when(mockElement.getCssValue(attributeName)).thenReturn(attributeName);
    when(mockElement.getText()).thenThrow(new NoSuchElementException(""));

    assertThat(
            wait.until(
                or(
                    textToBePresentInElement(mockElement, attributeName),
                    attributeToBe(mockElement, attributeName, attributeName))))
        .isTrue();
  }

  @Test
  void waitForOneOfExpectedConditionsToHavePositiveResultWhenAllThrow() {
    String attributeName = "test";
    when(mockElement.getAttribute(attributeName)).thenThrow(new NoSuchElementException(""));
    when(mockElement.getCssValue(attributeName)).thenThrow(new NoSuchElementException(""));
    when(mockElement.getText()).thenThrow(new NoSuchElementException(""));

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(
            () ->
                wait.until(
                    or(
                        textToBePresentInElement(mockElement, attributeName),
                        attributeToBe(mockElement, attributeName, attributeName))));
  }

  @Test
  void waitingForAllExpectedConditionsToHavePositiveResultWhenAllFailed() {
    String attributeName = "test";
    when(mockElement.getText()).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn("");
    when(mockElement.getAttribute(attributeName)).thenReturn("");

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(
            () ->
                wait.until(
                    and(
                        textToBePresentInElement(mockElement, "test"),
                        attributeToBe(mockElement, attributeName, "test"))));
  }

  @Test
  void waitingForAllExpectedConditionsToHavePositiveResultWhenFirstFailed() {
    String attributeName = "test";
    when(mockElement.getText()).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn(attributeName);
    when(mockElement.getAttribute(attributeName)).thenReturn(attributeName);
    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(
            () ->
                wait.until(
                    and(
                        textToBePresentInElement(mockElement, "test"),
                        attributeToBe(mockElement, attributeName, attributeName))));
  }

  @Test
  void waitingForAllExpectedConditionsToHavePositiveResultWhenSecondFailed() {
    String attributeName = "test";
    when(mockElement.getText()).thenReturn(attributeName);
    when(mockElement.getCssValue(attributeName)).thenReturn("");
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(
            () ->
                wait.until(
                    and(
                        textToBePresentInElement(mockElement, attributeName),
                        attributeToBe(mockElement, attributeName, attributeName))));
  }

  @Test
  void waitingForAllExpectedConditionsToHavePositiveResultWhenAllPositive() {
    String attributeName = "test";
    when(mockElement.getText()).thenReturn(attributeName);
    when(mockElement.getCssValue(attributeName)).thenReturn(attributeName);
    when(mockElement.getAttribute(attributeName)).thenReturn(attributeName);
    assertThat(
            wait.until(
                and(
                    textToBePresentInElement(mockElement, attributeName),
                    attributeToBe(mockElement, attributeName, attributeName))))
        .isTrue();
  }

  @Test
  void waitingForTextMatchingPatternWhenTextExists() {
    String testSelector = "testSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getText()).thenReturn("123");
    assertThat(wait.until(textMatches(By.cssSelector(testSelector), compile("\\d")))).isTrue();
  }

  @Test
  void waitingForTextMatchingPatternWhenTextDoesntExist() {
    String testSelector = "testSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getText()).thenReturn("test");
    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(
            () -> wait.until(textMatches(By.cssSelector(testSelector), Pattern.compile("\\d"))));
  }

  @Test
  void waitingForSpecificNumberOfElementsMoreThanSpecifiedWhenNumberIsEqual() {
    String testSelector = "testSelector";
    when(mockDriver.findElements(By.cssSelector(testSelector)))
        .thenReturn(singletonList(mockElement));
    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(
            () -> wait.until(numberOfElementsToBeMoreThan(By.cssSelector(testSelector), 1)));
  }

  @Test
  void waitingForSpecificNumberOfElementsMoreThanSpecifiedPositive() {
    String testSelector = "testSelector";
    when(mockDriver.findElements(By.cssSelector(testSelector)))
        .thenReturn(Arrays.asList(mockElement, mockElement));
    assertThat(wait.until(numberOfElementsToBeMoreThan(By.cssSelector(testSelector), 1)).size())
        .isEqualTo(2);
  }

  @Test
  void waitingForSpecificNumberOfElementsLessThanSpecifiedWhenNumberIsEqual() {
    String testSelector = "testSelector";
    when(mockDriver.findElements(By.cssSelector(testSelector)))
        .thenReturn(Arrays.asList(mockElement, mockElement));
    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(
            () -> wait.until(numberOfElementsToBeLessThan(By.cssSelector(testSelector), 2)));
  }

  @Test
  void waitingForSpecificNumberOfElementsLessThanSpecifiedPositive() {
    String testSelector = "testSelector";
    when(mockDriver.findElements(By.cssSelector(testSelector)))
        .thenReturn(singletonList(mockElement));
    assertThat(wait.until(numberOfElementsToBeLessThan(By.cssSelector(testSelector), 2)).size())
        .isEqualTo(1);
  }

  @Test
  void waitingForSpecificNumberOfElementsPositive() {
    String testSelector = "testSelector";
    when(mockDriver.findElements(By.cssSelector(testSelector)))
        .thenReturn(Arrays.asList(mockElement, mockElement));
    assertThat(wait.until(numberOfElementsToBe(By.cssSelector(testSelector), 2)).size())
        .isEqualTo(2);
  }

  @Test
  void waitingForSpecificNumberOfElementsWhenNumberIsLess() {
    String testSelector = "testSelector";
    when(mockDriver.findElements(By.cssSelector(testSelector)))
        .thenReturn(singletonList(mockElement));
    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(numberOfElementsToBe(By.cssSelector(testSelector), 2)));
  }

  @Test
  void waitingForVisibilityOfNestedElementWhenElementIsVisible() {
    String testSelector = "testSelector";
    when(mockElement.findElements(By.cssSelector(testSelector)))
        .thenReturn(singletonList(mockNestedElement));
    when(mockElement.findElement(By.cssSelector(testSelector))).thenReturn(mockNestedElement);
    when(mockNestedElement.isDisplayed()).thenReturn(true);
    wait.until(visibilityOfNestedElementsLocatedBy(mockElement, By.cssSelector(testSelector)));
  }

  @Test
  void waitingForPresenceOfNestedElementWhenElementPresents() {
    String testSelector = "testSelector";
    when(mockElement.findElement(By.cssSelector(testSelector))).thenReturn(mockNestedElement);
    wait.until(presenceOfNestedElementLocatedBy(mockElement, By.cssSelector(testSelector)));
  }

  @Test
  void waitingForVisibilityOfNestedElementByLocatorWhenElementIsVisible() {
    String testSelector = "testSelector";
    String testNestedSelector = "testNestedSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockDriver.findElements(By.cssSelector(testSelector)))
        .thenReturn(singletonList(mockElement));

    when(mockElement.findElements(By.cssSelector(testNestedSelector)))
        .thenReturn(singletonList(mockNestedElement));
    when(mockElement.findElement(By.cssSelector(testNestedSelector))).thenReturn(mockNestedElement);

    when(mockNestedElement.isDisplayed()).thenReturn(true);
    wait.until(
        visibilityOfNestedElementsLocatedBy(
            By.cssSelector(testSelector), By.cssSelector(testNestedSelector)));
  }

  @Test
  void waitingForPresenceOfNestedElementByLocatorWhenElementPresents() {
    String testSelector = "testSelector";
    String testNestedSelector = "testNestedSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.findElement(By.cssSelector(testNestedSelector))).thenReturn(mockNestedElement);
    wait.until(
        presenceOfNestedElementLocatedBy(
            By.cssSelector(testSelector), By.cssSelector(testNestedSelector)));
  }

  @Test
  void waitingForPresenceOfNestedElementsWhenElementsPresent() {
    By parent = By.cssSelector("parent");
    By child = By.cssSelector("child");

    when(mockDriver.findElement(parent)).thenReturn(mockElement);
    when(mockElement.findElements(child)).thenReturn(singletonList(mockNestedElement));

    List<WebElement> elements = wait.until(presenceOfNestedElementsLocatedBy(parent, child));

    assertThat(mockNestedElement).isEqualTo(elements.get(0));
  }

  @Test
  void waitingForAllElementsInvisibility() {
    when(mockElement.isDisplayed()).thenReturn(false);
    assertThat(wait.until(invisibilityOfAllElements(singletonList(mockElement)))).isTrue();
  }

  @Test
  void waitingForAllElementsInvisibilityWhenElementsAreVisible() {
    when(mockElement.isDisplayed()).thenReturn(true);
    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(invisibilityOfAllElements(singletonList(mockElement))));
  }

  @Test
  void waitingForElementInvisibilityWhenElementIsVisible() {
    when(mockElement.isDisplayed()).thenReturn(true);
    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(invisibilityOf(mockElement)));
  }

  @Test
  void waitingForTextToBePresentInElementLocatedThrowsTimeoutExceptionWhenTextNotPresent() {
    String testSelector = "testSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getText()).thenReturn("testText");

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(
            () ->
                wait.until(
                    textToBePresentInElementLocated(By.cssSelector(testSelector), "failText")));
  }

  @Test
  void waitingForTextToBePresentInElementLocatedThrowsTimeoutExceptionWhenElementIsStale() {
    String testSelector = "testSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getText()).thenThrow(new StaleElementReferenceException("Stale element"));

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(
            () ->
                wait.until(
                    textToBePresentInElementLocated(By.cssSelector(testSelector), "testText")));
  }

  @Test
  void waitingTextToBePresentInElementLocatedThrowsTimeoutExceptionWhenNoElementFound() {
    String testSelector = "testSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector)))
        .thenThrow(new NoSuchElementException("Element not found"));

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(
            () ->
                wait.until(
                    textToBePresentInElementLocated(By.cssSelector(testSelector), "testText")));
  }

  @Test
  void waitingElementSelectionStateToBeTrueReturnsTrue() {
    when(mockElement.isSelected()).thenReturn(true);

    assertThat(wait.until(elementSelectionStateToBe(mockElement, true))).isTrue();
  }

  @Test
  void waitingElementSelectionStateToBeFalseReturnsTrue() {
    when(mockElement.isSelected()).thenReturn(false);

    assertThat(wait.until(elementSelectionStateToBe(mockElement, false))).isTrue();
  }

  @Test
  void waitingElementSelectionStateToBeThrowsTimeoutExceptionWhenStateDontMatch() {
    when(mockClock.instant()).thenReturn(Instant.now(), Instant.now().plusMillis(2000));
    when(mockElement.isSelected()).thenReturn(true);

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(elementSelectionStateToBe(mockElement, false)));
  }

  @Test
  void waitingElementSelectionStateToBeThrowsStaleExceptionWhenElementIsStale() {
    when(mockElement.isSelected()).thenThrow(new StaleElementReferenceException("Stale element"));

    assertThatExceptionOfType(StaleElementReferenceException.class)
        .isThrownBy(() -> wait.until(elementSelectionStateToBe(mockElement, false)));
  }

  @Test
  void waitingNumberOfWindowsToBeTwoWhenThereAreTwoWindowsOpen() {
    Set<String> twoWindowHandles = Sets.newHashSet("w1", "w2");
    when(mockDriver.getWindowHandles()).thenReturn(twoWindowHandles);

    assertThat(wait.until(numberOfWindowsToBe(2))).isTrue();
  }

  @Test
  void waitingNumberOfWindowsToBeTwoThrowsTimeoutExceptionWhenThereAreThreeWindowsOpen() {
    Set<String> threeWindowHandles = Sets.newHashSet("w1", "w2", "w3");
    when(mockDriver.getWindowHandles()).thenReturn(threeWindowHandles);

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(numberOfWindowsToBe(2)));
  }

  @Test
  void
      waitingNumberOfWindowsToBeThrowsTimeoutExceptionWhenGetWindowHandlesThrowsWebDriverException() {
    when(mockDriver.getWindowHandles()).thenThrow(WebDriverException.class);

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(numberOfWindowsToBe(2)));
  }

  interface GenericCondition extends ExpectedCondition<Object> {}
}
