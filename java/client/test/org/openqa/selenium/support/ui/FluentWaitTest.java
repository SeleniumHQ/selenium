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
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;

import java.time.Duration;
import java.util.function.Function;

public class FluentWaitTest {

  private static final Object ARBITRARY_VALUE = new Object();

  @Mock
  private WebDriver mockDriver;
  @Mock
  private ExpectedCondition<Object> mockCondition;
  @Mock
  private java.time.Clock mockClock;
  @Mock
  private Sleeper mockSleeper;

  @Before
  public void createMocks() {
    MockitoAnnotations.initMocks(this);
  }

  @Test
  public void shouldWaitUntilReturnValueOfConditionIsNotNull() throws InterruptedException {
    when(mockClock.instant()).thenReturn(EPOCH);
    when(mockCondition.apply(mockDriver)).thenReturn(null, ARBITRARY_VALUE);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(Duration.ofMillis(0))
      .pollingEvery(Duration.ofSeconds(2))
      .ignoring(NoSuchElementException.class, NoSuchFrameException.class);

    assertThat(wait.until(mockCondition)).isEqualTo(ARBITRARY_VALUE);
    verify(mockSleeper, times(1)).sleep(Duration.ofSeconds(2));
  }

  @Test
  public void shouldWaitUntilABooleanResultIsTrue() throws InterruptedException {
    when(mockClock.instant()).thenReturn(EPOCH);
    when(mockCondition.apply(mockDriver)).thenReturn(false, false, true);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(Duration.ofMillis(0))
      .pollingEvery(Duration.ofSeconds(2))
        .ignoring(NoSuchElementException.class, NoSuchFrameException.class);

    assertThat(wait.until(mockCondition)).isEqualTo(true);

    verify(mockSleeper, times(2)).sleep(Duration.ofSeconds(2));
  }

  @Test
  public void checksTimeoutAfterConditionSoZeroTimeoutWaitsCanSucceed() {
    when(mockClock.instant()).thenReturn(EPOCH, EPOCH.plusMillis(250));
    when(mockCondition.apply(mockDriver)).thenReturn(null);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(Duration.ofMillis(0));
    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(mockCondition))
        .withNoCause();
  }

  @Test
  public void canIgnoreMultipleExceptions() throws InterruptedException {
    when(mockClock.instant()).thenReturn(EPOCH);
    when(mockCondition.apply(mockDriver))
      .thenThrow(new NoSuchElementException(""))
      .thenThrow(new NoSuchFrameException(""))
      .thenReturn(ARBITRARY_VALUE);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(Duration.ofMillis(0))
      .pollingEvery(Duration.ofSeconds(2))
      .ignoring(NoSuchElementException.class, NoSuchFrameException.class);

    assertThat(wait.until(mockCondition)).isEqualTo(ARBITRARY_VALUE);

    verify(mockSleeper, times(2)).sleep(Duration.ofSeconds(2));
  }

  @Test
  public void propagatesUnIgnoredExceptions() {
    final NoSuchWindowException exception = new NoSuchWindowException("");

    when(mockClock.instant()).thenReturn(EPOCH);
    when(mockCondition.apply(mockDriver)).thenThrow(exception);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(Duration.ofMillis(0))
      .pollingEvery(Duration.ofSeconds(2))
      .ignoring(NoSuchElementException.class, NoSuchFrameException.class);

    assertThatExceptionOfType(NoSuchWindowException.class)
        .isThrownBy(() -> wait.until(mockCondition))
        .satisfies(expected -> assertThat(expected).isSameAs(exception));
  }

  @Test
  public void timeoutMessageIncludesLastIgnoredException() {
    final NoSuchWindowException exception = new NoSuchWindowException("");

    when(mockClock.instant()).thenReturn(EPOCH, EPOCH.plusMillis(500), EPOCH.plusMillis(1500), EPOCH.plusMillis(2500));
    when(mockCondition.apply(mockDriver))
      .thenThrow(exception)
      .thenReturn(null);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(Duration.ofMillis(0))
      .pollingEvery(Duration.ofSeconds(2))
      .ignoring(NoSuchWindowException.class);

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(mockCondition))
        .satisfies(expected -> assertThat(exception).isSameAs(expected.getCause()));
  }

  @Test
  public void timeoutMessageIncludesCustomMessage() {
    TimeoutException exception = new TimeoutException(
        "Expected condition failed: Expected custom timeout message "
        + "(tried for 0 second(s) with 500 milliseconds interval)");

    when(mockClock.instant()).thenReturn(EPOCH, EPOCH.plusMillis(1000));
    when(mockCondition.apply(mockDriver)).thenReturn(null);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(Duration.ofMillis(0))
      .withMessage("Expected custom timeout message");

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(mockCondition))
        .withMessage(exception.getMessage());
  }

  private String state = null;

  @Test
  public void timeoutMessageIncludesCustomMessageEvaluatedOnFailure() {
    TimeoutException exception = new TimeoutException(
        "Expected condition failed: external state "
        + "(tried for 0 second(s) with 500 milliseconds interval)");

    when(mockClock.instant()).thenReturn(EPOCH, EPOCH.plusMillis(1000));
    when(mockCondition.apply(mockDriver)).thenReturn(null);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(Duration.ofMillis(0))
      .withMessage(() -> state);

    state = "external state";

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(mockCondition))
        .withMessage(exception.getMessage());
  }

  @Test
  public void timeoutMessageIncludesToStringOfCondition() {
    TimeoutException exception = new TimeoutException(
        "Expected condition failed: waiting for toString called "
        + "(tried for 0 second(s) with 500 milliseconds interval)");

    Function<Object, Boolean> condition = new Function<Object, Boolean>() {
      @Override
      public Boolean apply(Object ignored) {
        return false;
      }

      @Override
      public String toString() {
        return "toString called";
      }
    };

    Wait<Object> wait = new FluentWait<Object>("cheese")
      .withTimeout(Duration.ofMillis(0));

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(condition))
        .withMessage(exception.getMessage());
  }

  @Test
  public void canIgnoreThrowables() {
    final AssertionError exception = new AssertionError();

    when(mockClock.instant()).thenReturn(EPOCH, EPOCH.plusMillis(1000));
    when(mockCondition.apply(mockDriver)).thenThrow(exception);

    Wait<WebDriver> wait = new FluentWait<>(mockDriver, mockClock, mockSleeper)
      .withTimeout(Duration.ofMillis(0))
      .pollingEvery(Duration.ofSeconds(2))
      .ignoring(AssertionError.class);

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(mockCondition))
        .satisfies(expected -> assertThat(exception).isSameAs(expected.getCause()));
  }

  @Test
  public void callsDeprecatedHandlerForRuntimeExceptions() {
    final TimeoutException exception = new TimeoutException();

    when(mockClock.instant()).thenReturn(EPOCH, EPOCH.plusMillis(2500));
    when(mockCondition.apply(mockDriver)).thenThrow(exception);

    final TestException sentinelException = new TestException();
    FluentWait<WebDriver> wait = new FluentWait<WebDriver>(mockDriver, mockClock, mockSleeper) {
      @Override
      protected RuntimeException timeoutException(String message, Throwable lastException) {
        throw sentinelException;
      }
    };
    wait.withTimeout(Duration.ofMillis(0))
      .pollingEvery(Duration.ofSeconds(2))
      .ignoring(TimeoutException.class);

    assertThatExceptionOfType(TestException.class)
        .isThrownBy(() -> wait.until(mockCondition))
        .satisfies(expected -> assertThat(sentinelException).isSameAs(expected));
  }

  private static class TestException extends RuntimeException {

  }
}
