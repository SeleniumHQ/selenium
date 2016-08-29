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
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.google.common.base.Function;
import com.google.common.base.Supplier;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;

import java.util.concurrent.TimeUnit;

@RunWith(JUnit4.class)
public class FluentWaitTest {

  private static final Object ARBITRARY_VALUE = new Object();

  @Mock
  private WebDriver mockDriver;
  @Mock
  private ExpectedCondition<Object> mockCondition;
  @Mock
  private Clock mockClock;
  @Mock
  private Sleeper mockSleeper;

  @Before
  public void createMocks() {
    MockitoAnnotations.initMocks(this);
  }

  @Test
  public void shouldWaitUntilReturnValueOfConditionIsNotNull() throws InterruptedException {
    when(mockClock.laterBy(0L)).thenReturn(2L);
    when(mockClock.isNowBefore(2L)).thenReturn(true);
    when(mockCondition.apply(mockDriver)).thenReturn(null, ARBITRARY_VALUE);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(0, TimeUnit.MILLISECONDS)
      .pollingEvery(2, TimeUnit.SECONDS)
      .ignoring(NoSuchElementException.class, NoSuchFrameException.class);

    assertEquals(ARBITRARY_VALUE, wait.until(mockCondition));
    verify(mockSleeper, times(1)).sleep(new Duration(2, TimeUnit.SECONDS));
  }

  @Test
  public void shouldWaitUntilABooleanResultIsTrue() throws InterruptedException {
    when(mockClock.laterBy(0L)).thenReturn(2L);
    when(mockClock.isNowBefore(2L)).thenReturn(true);
    when(mockCondition.apply(mockDriver)).thenReturn(false, false, true);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(0, TimeUnit.MILLISECONDS)
      .pollingEvery(2, TimeUnit.SECONDS)
      .ignoring(NoSuchElementException.class, NoSuchFrameException.class);

    assertEquals(true, wait.until(mockCondition));

    verify(mockSleeper, times(2)).sleep(new Duration(2, TimeUnit.SECONDS));
  }

  @Test
  public void checksTimeoutAfterConditionSoZeroTimeoutWaitsCanSucceed() {
    when(mockClock.laterBy(0L)).thenReturn(2L);
    when(mockClock.isNowBefore(2L)).thenReturn(false);
    when(mockCondition.apply(mockDriver)).thenReturn(null);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(0, TimeUnit.MILLISECONDS);
    try {
      wait.until(mockCondition);
      fail();
    } catch (TimeoutException expected) {
      assertNull(expected.getCause());
    }
  }

  @Test
  public void canIgnoreMultipleExceptions() throws InterruptedException {
    when(mockClock.laterBy(0L)).thenReturn(2L);
    when(mockClock.isNowBefore(2L)).thenReturn(true);
    when(mockCondition.apply(mockDriver))
      .thenThrow(new NoSuchElementException(""))
      .thenThrow(new NoSuchFrameException(""))
      .thenReturn(ARBITRARY_VALUE);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(0, TimeUnit.MILLISECONDS)
      .pollingEvery(2, TimeUnit.SECONDS)
      .ignoring(NoSuchElementException.class, NoSuchFrameException.class);

    assertEquals(ARBITRARY_VALUE, wait.until(mockCondition));

    verify(mockSleeper, times(2)).sleep(new Duration(2, TimeUnit.SECONDS));
  }

  @Test
  public void propagatesUnIgnoredExceptions() {
    final NoSuchWindowException exception = new NoSuchWindowException("");

    when(mockClock.laterBy(0L)).thenReturn(2L);
    when(mockCondition.apply(mockDriver)).thenThrow(exception);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(0, TimeUnit.MILLISECONDS)
      .pollingEvery(2, TimeUnit.SECONDS)
      .ignoring(NoSuchElementException.class, NoSuchFrameException.class);

    try {
      wait.until(mockCondition);
      fail();
    } catch (NoSuchWindowException expected) {
      assertSame(exception, expected);
    }
  }

  @Test
  public void timeoutMessageIncludesLastIgnoredException() {
    final NoSuchWindowException exception = new NoSuchWindowException("");

    when(mockClock.laterBy(0L)).thenReturn(2L);
    when(mockCondition.apply(mockDriver))
      .thenThrow(exception)
      .thenReturn(null);
    when(mockClock.isNowBefore(2L)).thenReturn(false);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(0, TimeUnit.MILLISECONDS)
      .pollingEvery(2, TimeUnit.SECONDS)
      .ignoring(NoSuchWindowException.class);
    try {
      wait.until(mockCondition);
      fail();
    } catch (TimeoutException expected) {
      assertSame(exception, expected.getCause());
    }
  }

  @Test
  public void timeoutMessageIncludesCustomMessage() {
    TimeoutException expected = new TimeoutException(
        "Expected condition failed: Expected custom timeout message "
        + "(tried for 0 second(s) with 500 MILLISECONDS interval)");

    when(mockClock.laterBy(0L)).thenReturn(2L);
    when(mockCondition.apply(mockDriver)).thenReturn(null);
    when(mockClock.isNowBefore(2L)).thenReturn(false);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(0, TimeUnit.MILLISECONDS)
      .withMessage("Expected custom timeout message");

    try {
      wait.until(mockCondition);
      fail();
    } catch (TimeoutException actual) {
      assertEquals(expected.getMessage(), actual.getMessage());
    }
  }

  private String state = null;

  @Test
  public void timeoutMessageIncludesCustomMessageEvaluatedOnFailure() {
    TimeoutException expected = new TimeoutException(
        "Expected condition failed: external state "
        + "(tried for 0 second(s) with 500 MILLISECONDS interval)");

    when(mockClock.laterBy(0L)).thenReturn(2L);
    when(mockCondition.apply(mockDriver)).thenReturn(null);
    when(mockClock.isNowBefore(2L)).thenReturn(false);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(0, TimeUnit.MILLISECONDS)
      .withMessage(new Supplier<String>() {
        @Override
        public String get() {
          return state;
        }
      });

    state = "external state";

    try {
      wait.until(mockCondition);
      fail();
    } catch (TimeoutException actual) {
      assertEquals(expected.getMessage(), actual.getMessage());
    }
  }

  @Test
  public void timeoutMessageIncludesToStringOfCondition() {
    TimeoutException expected = new TimeoutException(
        "Expected condition failed: waiting for toString called "
        + "(tried for 0 second(s) with 500 MILLISECONDS interval)");

    Function<Object, Boolean> condition = new Function<Object, Boolean>() {
      public Boolean apply(Object ignored) {
        return false;
      }

      @Override
      public String toString() {
        return "toString called";
      }
    };

    Wait<Object> wait = new FluentWait<Object>("cheese")
      .withTimeout(0, TimeUnit.MILLISECONDS);

    try {
      wait.until(condition);
      fail();
    } catch (TimeoutException actual) {
      assertEquals(expected.getMessage(), actual.getMessage());
    }
  }

  @Test
  public void canIgnoreThrowables() {
    final AssertionError exception = new AssertionError();

    when(mockClock.laterBy(0L)).thenReturn(2L);
    when(mockCondition.apply(mockDriver)).thenThrow(exception);
    when(mockClock.isNowBefore(2L)).thenReturn(false);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(0, TimeUnit.MILLISECONDS)
      .pollingEvery(2, TimeUnit.SECONDS)
      .ignoring(AssertionError.class);

    try {
      wait.until(mockCondition);
      fail();
    } catch (TimeoutException expected) {
      assertSame(exception, expected.getCause());
    }
  }

  @Test
  public void callsDeprecatedHandlerForRuntimeExceptions() {
    final TimeoutException exception = new TimeoutException();

    when(mockClock.laterBy(0L)).thenReturn(2L);
    when(mockCondition.apply(mockDriver)).thenThrow(exception);
    when(mockClock.isNowBefore(2L)).thenReturn(false);

    final TestException sentinelException = new TestException();
    FluentWait<WebDriver> wait = new FluentWait<WebDriver>(mockDriver, mockClock, mockSleeper) {
      protected RuntimeException timeoutException(String message, Throwable lastException) {
        throw sentinelException;
      }
    };
    wait.withTimeout(0, TimeUnit.MILLISECONDS)
      .pollingEvery(2, TimeUnit.SECONDS)
      .ignoring(TimeoutException.class);

    try {
      wait.until(mockCondition);
      fail();
    } catch (TestException expected) {
      assertSame(sentinelException, expected);
    }
  }

  private static class TestException extends RuntimeException {

  }

  public interface GenericCondition extends ExpectedCondition<Object> {

  }
}
