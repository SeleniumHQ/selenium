package org.openqa.selenium.support.ui;

import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.concurrent.TimeUnit;

/**
 * Tests for {@link ExpectedConditions}.
 */
@RunWith(JUnit4.class)
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

  interface GenericCondition extends ExpectedCondition<Object> {}
}
