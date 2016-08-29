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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.support.ui.ExpectedConditions.and;
import static org.openqa.selenium.support.ui.ExpectedConditions.attributeContains;
import static org.openqa.selenium.support.ui.ExpectedConditions.attributeToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.attributeToBeNotEmpty;
import static org.openqa.selenium.support.ui.ExpectedConditions.elementSelectionStateToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.invisibilityOfAllElements;
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.support.ui.ExpectedConditions.numberOfElementsToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.numberOfElementsToBeLessThan;
import static org.openqa.selenium.support.ui.ExpectedConditions.numberOfElementsToBeMoreThan;
import static org.openqa.selenium.support.ui.ExpectedConditions.numberOfWindowsToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.or;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfNestedElementLocatedBy;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfNestedElementsLocatedBy;
import static org.openqa.selenium.support.ui.ExpectedConditions.textToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.textMatches;
import static org.openqa.selenium.support.ui.ExpectedConditions.textToBePresentInElement;
import static org.openqa.selenium.support.ui.ExpectedConditions.textToBePresentInElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.urlContains;
import static org.openqa.selenium.support.ui.ExpectedConditions.urlMatches;
import static org.openqa.selenium.support.ui.ExpectedConditions.urlToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfAllElements;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfAllElementsLocatedBy;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfNestedElementsLocatedBy;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

/**
 * Tests for {@link ExpectedConditions}.
 */
@RunWith(JUnit4.class)
@SuppressWarnings("unchecked")
public class ExpectedConditionsTest {

  @Mock
  private WebDriver mockDriver;
  @Mock
  private WebElement mockElement;
  @Mock
  private WebElement mockNestedElement;
  @Mock
  private Clock mockClock;
  @Mock
  private Sleeper mockSleeper;
  @Mock
  private GenericCondition mockCondition;

  private FluentWait<WebDriver> wait;

  @Before
  public void setUpMocks() {
    MockitoAnnotations.initMocks(this);

    wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(1, TimeUnit.SECONDS)
      .pollingEvery(250, TimeUnit.MILLISECONDS);
  }

  @Test
  public void waitingForUrlToBeOpened_urlToBe() {
    final String url = "http://some_url";
    when(mockDriver.getCurrentUrl()).thenReturn(url);
    wait.until(urlToBe(url));
  }

  @Test
  public void waitingForUrlToBeOpened_urlContains() {
    final String url = "http://some_url";
    when(mockDriver.getCurrentUrl()).thenReturn(url);
    wait.until(urlContains("some_url"));
  }

  @Test
  public void waitingForUrlToBeOpened_urlMatches() {
    final String url = "http://some-dynamic:4000/url";
    when(mockDriver.getCurrentUrl()).thenReturn(url);
    wait.until(urlMatches(".*:\\d{4}\\/url"));
  }

  @Test
  public void negative_waitingForUrlToBeOpened_urlToBe() {
    final String url = "http://some_url";
    when(mockDriver.getCurrentUrl()).thenReturn(url);

    try {
      wait.until(urlToBe(url + "/malformed"));
      fail();
    } catch (TimeoutException ex) {
      // do nothing
    }
  }

  @Test
  public void negative_waitingForUrlToBeOpened_urlContains() {
    final String url = "http://some_url";
    when(mockDriver.getCurrentUrl()).thenReturn(url);

    try {
      wait.until(urlContains("/malformed"));
      fail();
    } catch (TimeoutException ex) {
      // do nothing
    }
  }

  @Test
  public void negative_waitingForUrlToBeOpened_urlMatches() {
    final String url = "http://some-dynamic:4000/url";
    when(mockDriver.getCurrentUrl()).thenReturn(url);

    try {
      wait.until(urlMatches(".*\\/malformed.*"));
      fail();
    } catch (TimeoutException ex) {
      // do nothing
    }
  }

  @Test
  public void waitingForVisibilityOfElement_elementAlreadyVisible() {
    when(mockElement.isDisplayed()).thenReturn(true);

    assertSame(mockElement, wait.until(visibilityOf(mockElement)));
    verifyZeroInteractions(mockSleeper);
  }

  @Test
  public void waitingForVisibilityOfElement_elementBecomesVisible() throws InterruptedException {
    when(mockClock.laterBy(1000L)).thenReturn(3000L);
    when(mockClock.isNowBefore(3000L)).thenReturn(true);
    when(mockElement.isDisplayed()).thenReturn(false, false, true);

    assertSame(mockElement, wait.until(visibilityOf(mockElement)));
    verify(mockSleeper, times(2)).sleep(new Duration(250, TimeUnit.MILLISECONDS));
  }

  @Test
  public void waitingForVisibilityOfElement_elementNeverBecomesVisible()
    throws InterruptedException {
    when(mockClock.laterBy(1000L)).thenReturn(3000L);
    when(mockClock.isNowBefore(3000L)).thenReturn(true, false);
    when(mockElement.isDisplayed()).thenReturn(false, false);

    try {
      wait.until(visibilityOf(mockElement));
      fail();
    } catch (TimeoutException expected) {
      // Do nothing.
    }
    verify(mockSleeper, times(1)).sleep(new Duration(250, TimeUnit.MILLISECONDS));
  }

  @Test
  public void waitingForVisibilityOfElementInverse_elementNotVisible() {
    when(mockElement.isDisplayed()).thenReturn(false);

    assertTrue(wait.until(not(visibilityOf(mockElement))));
    verifyZeroInteractions(mockSleeper);
  }

  @Test
  public void waitingForVisibilityOfElementInverse_elementDisappears() throws InterruptedException {
    when(mockClock.laterBy(1000L)).thenReturn(3000L);
    when(mockClock.isNowBefore(3000L)).thenReturn(true);
    when(mockElement.isDisplayed()).thenReturn(true, true, false);

    assertTrue(wait.until(not(visibilityOf(mockElement))));
    verify(mockSleeper, times(2)).sleep(new Duration(250, TimeUnit.MILLISECONDS));
  }

  @Test
  public void waitingForVisibilityOfElementInverse_elementStaysVisible()
    throws InterruptedException {
    when(mockClock.laterBy(1000L)).thenReturn(3000L);
    when(mockClock.isNowBefore(3000L)).thenReturn(true, false);
    when(mockElement.isDisplayed()).thenReturn(true, true);

    try {
      wait.until(not(visibilityOf(mockElement)));
      fail();
    } catch (TimeoutException expected) {
      // Do nothing.
    }
    verify(mockSleeper, times(1)).sleep(new Duration(250, TimeUnit.MILLISECONDS));
  }

  @Test
  public void invertingAConditionThatReturnsFalse() {
    when(mockCondition.apply(mockDriver)).thenReturn(false);

    assertTrue(wait.until(not(mockCondition)));
    verifyZeroInteractions(mockSleeper);
  }

  @Test
  public void invertingAConditionThatReturnsNull() {
    when(mockCondition.apply(mockDriver)).thenReturn(null);

    assertTrue(wait.until(not(mockCondition)));
    verifyZeroInteractions(mockSleeper);
  }

  @Test
  public void invertingAConditionThatAlwaysReturnsTrueTimesout() throws InterruptedException {
    when(mockClock.laterBy(1000L)).thenReturn(3000L);
    when(mockClock.isNowBefore(3000L)).thenReturn(true, false);
    when(mockCondition.apply(mockDriver)).thenReturn(true);

    try {
      wait.until(not(mockCondition));
      fail();
    } catch (TimeoutException expected) {
      // Do nothing.
    }
    verify(mockSleeper, times(1)).sleep(new Duration(250, TimeUnit.MILLISECONDS));
  }

  @Test
  public void doubleNegatives_conditionThatReturnsFalseTimesOut() throws InterruptedException {
    when(mockClock.laterBy(1000L)).thenReturn(3000L);
    when(mockClock.isNowBefore(3000L)).thenReturn(true, false);
    when(mockCondition.apply(mockDriver)).thenReturn(false);

    try {
      wait.until(not(not(mockCondition)));
      fail();
    } catch (TimeoutException expected) {
      // Do nothing.
    }
    verify(mockSleeper, times(1)).sleep(new Duration(250, TimeUnit.MILLISECONDS));
  }

  @Test
  public void doubleNegatives_conditionThatReturnsNullTimesOut() throws InterruptedException {
    when(mockClock.laterBy(1000L)).thenReturn(3000L);
    when(mockClock.isNowBefore(3000L)).thenReturn(true, false);
    when(mockCondition.apply(mockDriver)).thenReturn(null);

    try {
      wait.until(not(not(mockCondition)));
      fail();
    } catch (TimeoutException expected) {
      // Do nothing.
    }
    verify(mockSleeper, times(1)).sleep(new Duration(250, TimeUnit.MILLISECONDS));
  }

  @Test
  public void waitingForVisibilityOfAllElementsLocatedByReturnsListOfElements() {
    List<WebElement> webElements = Lists.newArrayList(mockElement);
    String testSelector = "testSelector";

    when(mockDriver.findElements(By.cssSelector(testSelector))).thenReturn(webElements);
    when(mockElement.isDisplayed()).thenReturn(true);

    List<WebElement> returnedElements =
      wait.until(visibilityOfAllElementsLocatedBy(By.cssSelector(testSelector)));
    assertEquals(webElements, returnedElements);
  }

  @Test(expected = TimeoutException.class)
  public void waitingForVisibilityOfAllElementsLocatedByThrowsTimeoutExceptionWhenElementNotDisplayed() {
    List<WebElement> webElements = Lists.newArrayList(mockElement);
    String testSelector = "testSelector";

    when(mockDriver.findElements(By.cssSelector(testSelector))).thenReturn(webElements);
    when(mockElement.isDisplayed()).thenReturn(false);

    wait.until(visibilityOfAllElementsLocatedBy(By.cssSelector(testSelector)));
  }

  @Test(expected = StaleElementReferenceException.class)
  public void waitingForVisibilityOfAllElementsLocatedByThrowsStaleExceptionWhenElementIsStale() {
    List<WebElement> webElements = Lists.newArrayList(mockElement);
    String testSelector = "testSelector";

    when(mockDriver.findElements(By.cssSelector(testSelector))).thenReturn(webElements);
    when(mockElement.isDisplayed()).thenThrow(new StaleElementReferenceException("Stale element"));

    wait.until(visibilityOfAllElementsLocatedBy(By.cssSelector(testSelector)));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForVisibilityOfAllElementsLocatedByThrowsTimeoutExceptionWhenNoElementsFound() {
    List<WebElement> webElements = Lists.newArrayList();
    String testSelector = "testSelector";

    when(mockDriver.findElements(By.cssSelector(testSelector))).thenReturn(webElements);

    wait.until(visibilityOfAllElementsLocatedBy(By.cssSelector(testSelector)));
  }

  @Test
  public void waitingForVisibilityOfAllElementsReturnsListOfElements() {
    List<WebElement> webElements = Lists.newArrayList(mockElement);
    when(mockElement.isDisplayed()).thenReturn(true);

    List<WebElement> returnedElements = wait.until(visibilityOfAllElements(webElements));
    assertEquals(webElements, returnedElements);
  }

  @Test(expected = TimeoutException.class)
  public void waitingForVisibilityOfAllElementsThrowsTimeoutExceptionWhenElementNotDisplayed() {
    List<WebElement> webElements = Lists.newArrayList(mockElement);
    when(mockElement.isDisplayed()).thenReturn(false);

    wait.until(visibilityOfAllElements(webElements));
  }

  @Test(expected = StaleElementReferenceException.class)
  public void waitingForVisibilityOfAllElementsThrowsStaleElementReferenceExceptionWhenElementIsStale() {
    List<WebElement> webElements = Lists.newArrayList(mockElement);

    when(mockElement.isDisplayed()).thenThrow(new StaleElementReferenceException("Stale element"));

    wait.until(visibilityOfAllElements(webElements));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForVisibilityOfAllElementsThrowsTimeoutExceptionWhenNoElementsFound() {
    List<WebElement> webElements = Lists.newArrayList();

    wait.until(visibilityOfAllElements(webElements));
  }

  @Test
  public void waitingForVisibilityOfReturnsElement() {
    when(mockElement.isDisplayed()).thenReturn(true);

    WebElement returnedElement = wait.until(visibilityOf(mockElement));
    assertEquals(mockElement, returnedElement);
  }

  @Test(expected = TimeoutException.class)
  public void waitingForVisibilityOfThrowsTimeoutExceptionWhenElementNotDisplayed() {

    when(mockElement.isDisplayed()).thenReturn(false);

    wait.until(visibilityOf(mockElement));
  }

  @Test(expected = StaleElementReferenceException.class)
  public void waitingForVisibilityOfThrowsStaleElementReferenceExceptionWhenElementIsStale() {

    when(mockElement.isDisplayed()).thenThrow(new StaleElementReferenceException("Stale element"));

    wait.until(visibilityOf(mockElement));
  }

  @Test
  public void waitingForTextToBePresentInElementLocatedReturnsElement() {
    String testSelector = "testSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getText()).thenReturn("testText");

    assertTrue(
      wait.until(textToBePresentInElementLocated(By.cssSelector(testSelector), "testText")));
  }

  @Test
  public void waitingForTextToBePresentInElementLocatedReturnsElementWhenTextContainsSaidText() {
    String testSelector = "testSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getText()).thenReturn("testText");

    assertTrue(wait.until(textToBePresentInElementLocated(By.cssSelector(testSelector), "test")));
  }

  @Test
  public void waitingForHtmlAttributeToBeEqualForElementLocatedReturnsTrueWhenAttributeIsEqualToSaidText() {
    String testSelector = "testSelector";
    String attributeName = "attributeName";
    String attributeValue = "attributeValue";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getAttribute(attributeName)).thenReturn(attributeValue);
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    assertTrue(
      wait.until(
        ExpectedConditions.attributeToBe(By.cssSelector(testSelector), attributeName, attributeValue)));
  }

  @Test
  public void waitingForCssAttributeToBeEqualForElementLocatedReturnsTrueWhenAttributeIsEqualToSaidText() {
    String testSelector = "testSelector";
    String attributeName = "attributeName";
    String attributeValue = "attributeValue";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn(attributeValue);

    assertTrue(
      wait.until(
        ExpectedConditions.attributeToBe(By.cssSelector(testSelector), attributeName, attributeValue)));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForCssAttributeToBeEqualForElementLocatedThrowsTimeoutExceptionWhenAttributeIsNotEqual() {
    String testSelector = "testSelector";
    String attributeName = "attributeName";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    wait.until(ExpectedConditions.attributeToBe(By.cssSelector(testSelector), attributeName, "test"));
  }

  @Test
  public void waitingForHtmlAttributeToBeEqualForWebElementReturnsTrueWhenAttributeIsEqualToSaidText() {
    String attributeName = "attributeName";
    String attributeValue = "attributeValue";
    when(mockElement.getAttribute(attributeName)).thenReturn(attributeValue);
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    assertTrue(
      wait.until(attributeToBe(mockElement, attributeName, attributeValue)));
  }

  @Test
  public void waitingForCssAttributeToBeEqualForWebElementReturnsTrueWhenAttributeIsEqualToSaidText() {
    String attributeName = "attributeName";
    String attributeValue = "attributeValue";
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn(attributeValue);

    assertTrue(
      wait.until(attributeToBe(mockElement, attributeName, attributeValue)));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForCssAttributeToBeEqualForWebElementThrowsTimeoutExceptionWhenAttributeIsNotEqual() {
    String attributeName = "attributeName";
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    wait.until(attributeToBe(mockElement, attributeName, "test"));
  }

  @Test
  public void waitingForHtmlAttributeToBeEqualForElementLocatedReturnsTrueWhenAttributeContainsEqualToSaidText() {
    String testSelector = "testSelector";
    String attributeName = "attributeName";
    String attributeValue = "test attributeValue test";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getAttribute(attributeName)).thenReturn(attributeValue);
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    assertTrue(
      wait.until(attributeContains(By.cssSelector(testSelector), attributeName, "attributeValue")));
  }

  @Test
  public void waitingForCssAttributeToBeEqualForElementLocatedReturnsTrueWhenAttributeContainsEqualToSaidText() {
    String testSelector = "testSelector";
    String attributeName = "attributeName";
    String attributeValue = "test attributeValue test";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn(attributeValue);

    assertTrue(
      wait.until(attributeContains(By.cssSelector(testSelector), attributeName, "attributeValue")));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForCssAttributeToBeEqualForElementLocatedThrowsTimeoutExceptionWhenAttributeContainsNotEqual() {
    String testSelector = "testSelector";
    String attributeName = "attributeName";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    wait.until(attributeContains(By.cssSelector(testSelector), attributeName, "test"));
  }

  @Test
  public void waitingForHtmlAttributeToBeEqualForWebElementReturnsTrueWhenAttributeContainsEqualToSaidText() {
    String attributeName = "attributeName";
    String attributeValue = "test attributeValue test";
    when(mockElement.getAttribute(attributeName)).thenReturn(attributeValue);
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    assertTrue(
      wait.until(attributeContains(mockElement, attributeName, "attributeValue")));
  }

  @Test
  public void waitingForCssAttributeToBeEqualForWebElementReturnsTrueWhenAttributeContainsEqualToSaidText() {
    String attributeName = "attributeName";
    String attributeValue = "test attributeValue test";
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn(attributeValue);

    assertTrue(
      wait.until(attributeContains(mockElement, attributeName, "attributeValue")));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForCssAttributeToBeEqualForWebElementThrowsTimeoutExceptionWhenAttributeContainsNotEqual() {
    String attributeName = "attributeName";
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    wait.until(attributeContains(mockElement, attributeName, "test"));
  }

  @Test
  public void waitingForTextToBeEqualForElementLocatedReturnsTrueWhenTextIsEqualToSaidText() {
    String testSelector = "testSelector";
    String testText = "test text";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getText()).thenReturn(testText);

    assertTrue(
      wait.until(textToBe(By.cssSelector(testSelector), testText)));
  }

  @Test
  public void waitingForAttributeToBeNotEmptyForElementLocatedReturnsTrueWhenAttributeIsNotEmptyCss() {
    String attributeName = "test";
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn("test1");

    assertTrue(wait.until(attributeToBeNotEmpty(mockElement, attributeName)));
  }

  @Test
  public void waitingForAttributeToBeNotEmptyForElementLocatedReturnsTrueWhenAttributeIsNotEmptyHtml() {
    String attributeName = "test";
    when(mockElement.getAttribute(attributeName)).thenReturn("test1");
    when(mockElement.getCssValue(attributeName)).thenReturn("");

    assertTrue(wait.until(attributeToBeNotEmpty(mockElement, attributeName)));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForTextToBeEqualForElementLocatedThrowsTimeoutExceptionWhenTextIsNotEqual() {
    String testSelector = "testSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getText()).thenReturn("");
    wait.until(textToBe(By.cssSelector(testSelector), "test"));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForAttributetToBeNotEmptyForElementLocatedThrowsTimeoutExceptionWhenAttributeIsEmpty() {
    String attributeName = "test";
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn("");
    wait.until(attributeToBeNotEmpty(mockElement, attributeName));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForOneOfExpectedConditionsToHavePositiveResultWhenAllFailed() {
    String attributeName = "test";
    when(mockElement.getText()).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn("");
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    wait.until(or(textToBePresentInElement(mockElement, "test"),
                  attributeToBe(mockElement, attributeName, "test")));
  }

  @Test
  public void waitForOneOfExpectedConditionsToHavePositiveResultWhenFirstPositive() {
    String attributeName = "test";
    when(mockElement.getAttribute(attributeName)).thenReturn(attributeName);
    when(mockElement.getCssValue(attributeName)).thenReturn(attributeName);
    when(mockElement.getText()).thenReturn("");

    assertTrue(wait.until(or(attributeToBe(mockElement, attributeName, attributeName),
                             textToBePresentInElement(mockElement, attributeName))));
  }

  @Test
  public void waitForOneOfExpectedConditionsToHavePositiveResultWhenAllPositive() {
    String attributeName = "test";
    when(mockElement.getAttribute(attributeName)).thenReturn(attributeName);
    when(mockElement.getCssValue(attributeName)).thenReturn(attributeName);
    when(mockElement.getText()).thenReturn(attributeName);

    assertTrue(wait.until(or(attributeToBe(mockElement, attributeName, attributeName),
                             textToBePresentInElement(mockElement, attributeName))));
  }

  @Test
  public void waitForOneOfExpectedConditionsToHavePositiveResultWhenSecondPositive() {
    String attributeName = "test";
    when(mockElement.getAttribute(attributeName)).thenReturn(attributeName);
    when(mockElement.getCssValue(attributeName)).thenReturn(attributeName);
    when(mockElement.getText()).thenReturn("");

    assertTrue(wait.until(or(textToBePresentInElement(mockElement, attributeName),
                             attributeToBe(mockElement, attributeName, attributeName))));
  }


  @Test(expected = TimeoutException.class)
  public void waitingForAllExpectedConditionsToHavePositiveResultWhenAllFailed() {
    String attributeName = "test";
    when(mockElement.getText()).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn("");
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    wait.until(and(textToBePresentInElement(mockElement, "test"),
                   attributeToBe(mockElement, attributeName, "test")));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForAllExpectedConditionsToHavePositiveResultWhenFirstFailed() {
    String attributeName = "test";
    when(mockElement.getText()).thenReturn("");
    when(mockElement.getCssValue(attributeName)).thenReturn(attributeName);
    when(mockElement.getAttribute(attributeName)).thenReturn(attributeName);
    wait.until(and(textToBePresentInElement(mockElement, "test"),
                   attributeToBe(mockElement, attributeName, attributeName)));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForAllExpectedConditionsToHavePositiveResultWhenSecondFailed() {
    String attributeName = "test";
    when(mockElement.getText()).thenReturn(attributeName);
    when(mockElement.getCssValue(attributeName)).thenReturn("");
    when(mockElement.getAttribute(attributeName)).thenReturn("");
    wait.until(and(textToBePresentInElement(mockElement, attributeName),
                   attributeToBe(mockElement, attributeName, attributeName)));
  }

  @Test
  public void waitingForAllExpectedConditionsToHavePositiveResultWhenAllPositive() {
    String attributeName = "test";
    when(mockElement.getText()).thenReturn(attributeName);
    when(mockElement.getCssValue(attributeName)).thenReturn(attributeName);
    when(mockElement.getAttribute(attributeName)).thenReturn(attributeName);
    assertTrue(wait.until(and(textToBePresentInElement(mockElement, attributeName),
                              attributeToBe(mockElement, attributeName, attributeName))));
  }

  @Test
  public void waitingForTextMatchingPatternWhenTextExists() {
    String testSelector = "testSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getText()).thenReturn("123");
    assertTrue(wait.until(textMatches(By.cssSelector(testSelector), Pattern.compile("\\d"))));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForTextMatchingPatternWhenTextDoesntExist() {
    String testSelector = "testSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getText()).thenReturn("test");
    wait.until(textMatches(By.cssSelector(testSelector), Pattern.compile("\\d")));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForSpecificNumberOfElementsMoreThanSpecifiedWhenNumberIsEqual() {
    String testSelector = "testSelector";
    when(mockDriver.findElements(By.cssSelector(testSelector)))
      .thenReturn(Arrays.asList(mockElement));
    wait.until(numberOfElementsToBeMoreThan(By.cssSelector(testSelector), 1));
  }

  @Test
  public void waitingForSpecificNumberOfElementsMoreThanSpecifiedPositive() {
    String testSelector = "testSelector";
    when(mockDriver.findElements(By.cssSelector(testSelector)))
      .thenReturn(Arrays.asList(mockElement, mockElement));
    assertEquals(2, wait.until(numberOfElementsToBeMoreThan(By.cssSelector(testSelector), 1)).size());
  }

  @Test(expected = TimeoutException.class)
  public void waitingForSpecificNumberOfElementsLessThanSpecifiedWhenNumberIsEqual() {
    String testSelector = "testSelector";
    when(mockDriver.findElements(By.cssSelector(testSelector)))
      .thenReturn(Arrays.asList(mockElement, mockElement));
    wait.until(numberOfElementsToBeLessThan(By.cssSelector(testSelector), 2));
  }

  @Test
  public void waitingForSpecificNumberOfElementsLessThanSpecifiedPositive() {
    String testSelector = "testSelector";
    when(mockDriver.findElements(By.cssSelector(testSelector)))
      .thenReturn(Arrays.asList(mockElement));
    assertEquals(1, wait.until(numberOfElementsToBeLessThan(By.cssSelector(testSelector), 2)).size());
  }

  @Test
  public void waitingForSpecificNumberOfElementsPositive() {
    String testSelector = "testSelector";
    when(mockDriver.findElements(By.cssSelector(testSelector)))
      .thenReturn(Arrays.asList(mockElement, mockElement));
    assertEquals(2, wait.until(numberOfElementsToBe(By.cssSelector(testSelector), 2)).size());
  }

  @Test(expected = TimeoutException.class)
  public void waitingForSpecificNumberOfElementsWhenNumberIsLess() {
    String testSelector = "testSelector";
    when(mockDriver.findElements(By.cssSelector(testSelector)))
      .thenReturn(Arrays.asList(mockElement));
    wait.until(numberOfElementsToBe(By.cssSelector(testSelector), 2));
  }

  @Test
  public void waitingForVisibilityOfNestedElementWhenElementIsVisible() {
    String testSelector = "testSelector";
    when(mockElement.findElements(By.cssSelector(testSelector)))
      .thenReturn(Arrays.asList(mockNestedElement));
    when(mockElement.findElement(By.cssSelector(testSelector))).thenReturn(mockNestedElement);
    when(mockNestedElement.isDisplayed()).thenReturn(true);
    wait.until(visibilityOfNestedElementsLocatedBy(mockElement, By.cssSelector(testSelector)));
  }

  @Test
  public void waitingForPresenseOfNestedElementWhenElementPresents() {
    String testSelector = "testSelector";
    when(mockElement.findElement(By.cssSelector(testSelector))).thenReturn(mockNestedElement);
    wait.until(presenceOfNestedElementLocatedBy(mockElement, By.cssSelector(testSelector)));
  }

  @Test
  public void waitingForVisibilityOfNestedElementByLocatorWhenElementIsVisible() {
    String testSelector = "testSelector";
    String testNestedSelector = "testNestedSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockDriver.findElements(By.cssSelector(testSelector))).thenReturn(Arrays.asList(mockElement));

    when(mockElement.findElements(By.cssSelector(testNestedSelector))).thenReturn(Arrays.asList(mockNestedElement));
    when(mockElement.findElement(By.cssSelector(testNestedSelector))).thenReturn(mockNestedElement);

    when(mockNestedElement.isDisplayed()).thenReturn(true);
    wait.until(visibilityOfNestedElementsLocatedBy(By.cssSelector(testSelector),
                                                   By.cssSelector(testNestedSelector)));
  }

  @Test
  public void waitingForPresenseOfNestedElementByLocatorWhenElementPresents() {
    String testSelector = "testSelector";
    String testNestedSelector = "testNestedSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.findElement(By.cssSelector(testNestedSelector))).thenReturn(mockNestedElement);
    wait.until(presenceOfNestedElementLocatedBy(By.cssSelector(testSelector),
                                                By.cssSelector(testNestedSelector)));
  }

  @Test
  public void waitingForPresenseOfNestedElementsWhenElementsPresent() {
    String testSelector = "testSelector";
    String testNestedSelector = "testNestedSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.findElement(By.cssSelector(testSelector))).thenReturn(mockNestedElement);
    when(mockElement.findElements(By.cssSelector(testSelector)))
      .thenReturn(Arrays.asList(mockNestedElement));
    wait.until(presenceOfNestedElementsLocatedBy(By.cssSelector(testSelector),
                                                 By.cssSelector(testNestedSelector)));
  }

  @Test
  public void waitingForAllElementsInvisibility() {
    when(mockElement.isDisplayed()).thenReturn(false);
    assertTrue(wait.until(invisibilityOfAllElements(Arrays.asList(mockElement))));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForAllElementsInvisibilityWhenElementsAreVisible() {
    when(mockElement.isDisplayed()).thenReturn(true);
    wait.until(invisibilityOfAllElements(Arrays.asList(mockElement)));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForTextToBePresentInElementLocatedThrowsTimeoutExceptionWhenTextNotPresent() {
    String testSelector = "testSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getText()).thenReturn("testText");

    wait.until(textToBePresentInElementLocated(By.cssSelector(testSelector), "failText"));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForTextToBePresentInElementLocatedThrowsTimeoutExceptionWhenElementIsStale() {
    String testSelector = "testSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenReturn(mockElement);
    when(mockElement.getText()).thenThrow(new StaleElementReferenceException("Stale element"));

    wait.until(textToBePresentInElementLocated(By.cssSelector(testSelector), "testText"));
  }

  @Test(expected = NoSuchElementException.class)
  public void waitingTextToBePresentInElementLocatedThrowsTimeoutExceptionWhenNoElementFound() {
    String testSelector = "testSelector";
    when(mockDriver.findElement(By.cssSelector(testSelector))).thenThrow(
      new NoSuchElementException("Element not found"));

    wait.until(textToBePresentInElementLocated(By.cssSelector(testSelector), "testText"));
  }

  @Test
  public void waitingElementSelectionStateToBeTrueReturnsTrue() {
    when(mockElement.isSelected()).thenReturn(true);

    assertTrue(wait.until(elementSelectionStateToBe(mockElement, true)));
  }

  @Test
  public void waitingElementSelectionStateToBeFalseReturnsTrue() {
    when(mockElement.isSelected()).thenReturn(false);

    assertTrue(wait.until(elementSelectionStateToBe(mockElement, false)));
  }

  @Test(expected = TimeoutException.class)
  public void waitingElementSelectionStateToBeThrowsTimeoutExceptionWhenStateDontMatch() {
    when(mockElement.isSelected()).thenReturn(true);

    wait.until(elementSelectionStateToBe(mockElement, false));
  }

  @Test(expected = StaleElementReferenceException.class)
  public void waitingElementSelectionStateToBeThrowsStaleExceptionWhenElementIsStale() {
    when(mockElement.isSelected()).thenThrow(new StaleElementReferenceException("Stale element"));

    wait.until(elementSelectionStateToBe(mockElement, false));
  }

  @Test
  public void waitingNumberOfWindowsToBeTwoWhenThereAreTwoWindowsOpen() {
    Set<String> twoWindowHandles = Sets.newHashSet("w1", "w2");
    when(mockDriver.getWindowHandles()).thenReturn(twoWindowHandles);

    assertTrue(wait.until(numberOfWindowsToBe(2)));
  }

  @Test(expected = TimeoutException.class)
  public void waitingNumberOfWindowsToBeTwoThrowsTimeoutExceptionWhenThereAreThreeWindowsOpen() {
    Set<String> threeWindowHandles = Sets.newHashSet("w1", "w2", "w3");
    when(mockDriver.getWindowHandles()).thenReturn(threeWindowHandles);

    wait.until(numberOfWindowsToBe(2));

    // then TimeoutException is thrown
  }

  @Test(expected = TimeoutException.class)
  public void waitingNumberOfWindowsToBeThrowsTimeoutExceptionWhenGetWindowHandlesThrowsWebDriverException() {
    when(mockDriver.getWindowHandles()).thenThrow(WebDriverException.class);

    wait.until(numberOfWindowsToBe(2));

    // then TimeoutException is thrown
  }

  interface GenericCondition extends ExpectedCondition<Object> {

  }
}
