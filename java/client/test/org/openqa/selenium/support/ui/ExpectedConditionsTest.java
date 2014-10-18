package org.openqa.selenium.support.ui;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.support.ui.ExpectedConditions.elementSelectionStateToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.support.ui.ExpectedConditions.textToBePresentInElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfAllElements;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfAllElementsLocatedBy;

import com.google.common.collect.Lists;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Tests for {@link ExpectedConditions}.
 */
public class ExpectedConditionsTest {

  @Mock private WebDriver mockDriver;
  @Mock private WebElement mockElement;
  @Mock private Clock mockClock;
  @Mock private Sleeper mockSleeper;
  @Mock private GenericCondition mockCondition;

  private FluentWait<WebDriver> wait;

  @Before
  public void setUpMocks() {
    MockitoAnnotations.initMocks(this);

    wait = new FluentWait<WebDriver>(mockDriver, mockClock, mockSleeper)
        .withTimeout(1, TimeUnit.SECONDS)
        .pollingEvery(250, TimeUnit.MILLISECONDS);
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
    List webElements = Lists.newArrayList(mockElement);
    String testSelector = "testSelector";

    when(mockDriver.findElements(By.cssSelector(testSelector))).thenReturn(webElements);
    when(mockElement.isDisplayed()).thenReturn(true);

    List returnedElements =
        wait.until(visibilityOfAllElementsLocatedBy(By.cssSelector(testSelector)));
    assertEquals(webElements, returnedElements);
  }

  @Test(expected = TimeoutException.class)
  public void waitingForVisibilityOfAllElementsLocatedByThrowsTimeoutExceptionWhenElementNotDisplayed() {
    List webElements = Lists.newArrayList(mockElement);
    String testSelector = "testSelector";

    when(mockDriver.findElements(By.cssSelector(testSelector))).thenReturn(webElements);
    when(mockElement.isDisplayed()).thenReturn(false);

    wait.until(visibilityOfAllElementsLocatedBy(By.cssSelector(testSelector)));
  }

  @Test(expected = StaleElementReferenceException.class)
  public void waitingForVisibilityOfAllElementsLocatedByThrowsStaleExceptionWhenElementIsStale() {
    List webElements = Lists.newArrayList(mockElement);
    String testSelector = "testSelector";

    when(mockDriver.findElements(By.cssSelector(testSelector))).thenReturn(webElements);
    when(mockElement.isDisplayed()).thenThrow(new StaleElementReferenceException("Stale element"));

    wait.until(visibilityOfAllElementsLocatedBy(By.cssSelector(testSelector)));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForVisibilityOfAllElementsLocatedByThrowsTimeoutExceptionWhenNoElementsFound() {
    List webElements = Lists.newArrayList();
    String testSelector = "testSelector";

    when(mockDriver.findElements(By.cssSelector(testSelector))).thenReturn(webElements);

    wait.until(visibilityOfAllElementsLocatedBy(By.cssSelector(testSelector)));
  }

  @Test
  public void waitingForVisibilityOfAllElementsReturnsListOfElements() {
    List webElements = Lists.newArrayList(mockElement);
    when(mockElement.isDisplayed()).thenReturn(true);

    List<WebElement> returnedElements = wait.until(visibilityOfAllElements(webElements));
    assertEquals(webElements, returnedElements);
  }

  @Test(expected = TimeoutException.class)
  public void waitingForVisibilityOfAllElementsThrowsTimeoutExceptionWhenElementNotDisplayed() {
    List webElements = Lists.newArrayList(mockElement);
    when(mockElement.isDisplayed()).thenReturn(false);

    wait.until(visibilityOfAllElements(webElements));
  }

  @Test(expected = StaleElementReferenceException.class)
  public void waitingForVisibilityOfAllElementsThrowsStaleElementReferenceExceptionWhenElementIsStale() {
    List webElements = Lists.newArrayList(mockElement);

    when(mockElement.isDisplayed()).thenThrow(new StaleElementReferenceException("Stale element"));

    wait.until(visibilityOfAllElements(webElements));
  }

  @Test(expected = TimeoutException.class)
  public void waitingForVisibilityOfAllElementsThrowsTimeoutExceptionWhenNoElementsFound() {
    List webElements = Lists.newArrayList();

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

    assertTrue(wait.until(elementSelectionStateToBe(mockElement, false)));
  }

  @Test(expected = StaleElementReferenceException.class)
  public void waitingElementSelectionStateToBeThrowsStaleExceptionWhenElementIsStale() {
    when(mockElement.isSelected()).thenThrow(new StaleElementReferenceException("Stale element"));

    assertTrue(wait.until(elementSelectionStateToBe(mockElement, false)));
  }

  interface GenericCondition extends ExpectedCondition<Object> {}
}
