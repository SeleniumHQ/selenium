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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.support.ui.FluentWait.formatTimeout;

import java.time.Duration;
import java.util.function.Function;
import org.jspecify.annotations.Nullable;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;

@Tag("UnitTests")
class FluentWaitTest {

  private static final Object ARBITRARY_VALUE = new Object();

  private final WebDriver mockDriver = mock();
  private final ExpectedCondition<Object> mockCondition = mock();
  private final java.time.Clock mockClock = mock();
  private final Sleeper mockSleeper = mock();

  @Test
  void shouldWaitUntilReturnValueOfConditionIsNotNull() throws InterruptedException {
    when(mockClock.instant()).thenReturn(EPOCH);
    when(mockCondition.apply(mockDriver)).thenReturn(null, ARBITRARY_VALUE);

    Wait<WebDriver> wait =
        new FluentWait<>(mockDriver, mockClock, mockSleeper)
            .withTimeout(Duration.ofMillis(0))
            .pollingEvery(Duration.ofSeconds(2))
            .ignoring(NoSuchElementException.class, NoSuchFrameException.class);

    assertThat(wait.until(mockCondition)).isEqualTo(ARBITRARY_VALUE);
    verify(mockSleeper, times(1)).sleep(Duration.ofSeconds(2));
  }

  @Test
  void shouldWaitUntilABooleanResultIsTrue() throws InterruptedException {
    when(mockClock.instant()).thenReturn(EPOCH);
    when(mockCondition.apply(mockDriver)).thenReturn(false, false, true);

    Wait<WebDriver> wait =
        new FluentWait<>(mockDriver, mockClock, mockSleeper)
            .withTimeout(Duration.ofMillis(0))
            .pollingEvery(Duration.ofSeconds(2))
            .ignoring(NoSuchElementException.class, NoSuchFrameException.class);

    assertThat(wait.until(mockCondition)).isEqualTo(true);

    verify(mockSleeper, times(2)).sleep(Duration.ofSeconds(2));
  }

  @Test
  void checksTimeoutAfterConditionSoZeroTimeoutWaitsCanSucceed() {
    when(mockClock.instant()).thenReturn(EPOCH, EPOCH.plusMillis(250));
    when(mockCondition.apply(mockDriver)).thenReturn(null);

    Wait<WebDriver> wait =
        new FluentWait<>(mockDriver, mockClock, mockSleeper).withTimeout(Duration.ofMillis(0));
    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(mockCondition))
        .withNoCause();
  }

  @Test
  void canIgnoreMultipleExceptions() throws InterruptedException {
    when(mockClock.instant()).thenReturn(EPOCH);
    when(mockCondition.apply(mockDriver))
        .thenThrow(new NoSuchElementException(""))
        .thenThrow(new NoSuchFrameException(""))
        .thenReturn(ARBITRARY_VALUE);

    Wait<WebDriver> wait =
        new FluentWait<>(mockDriver, mockClock, mockSleeper)
            .withTimeout(Duration.ofMillis(0))
            .pollingEvery(Duration.ofSeconds(2))
            .ignoring(NoSuchElementException.class, NoSuchFrameException.class);

    assertThat(wait.until(mockCondition)).isEqualTo(ARBITRARY_VALUE);

    verify(mockSleeper, times(2)).sleep(Duration.ofSeconds(2));
  }

  @Test
  void propagatesUnIgnoredExceptions() {
    final NoSuchWindowException exception = new NoSuchWindowException("");

    when(mockClock.instant()).thenReturn(EPOCH);
    when(mockCondition.apply(mockDriver)).thenThrow(exception);

    Wait<WebDriver> wait =
        new FluentWait<>(mockDriver, mockClock, mockSleeper)
            .withTimeout(Duration.ofMillis(0))
            .pollingEvery(Duration.ofSeconds(2))
            .ignoring(NoSuchElementException.class, NoSuchFrameException.class);

    assertThatExceptionOfType(NoSuchWindowException.class)
        .isThrownBy(() -> wait.until(mockCondition))
        .satisfies(expected -> assertThat(expected).isSameAs(exception));
  }

  @Test
  void timeoutMessageIncludesLastIgnoredException() {
    final NoSuchWindowException exception = new NoSuchWindowException("");

    when(mockClock.instant())
        .thenReturn(EPOCH, EPOCH.plusMillis(500), EPOCH.plusMillis(1500), EPOCH.plusMillis(2500));
    when(mockCondition.apply(mockDriver)).thenThrow(exception).thenReturn(null);

    Wait<WebDriver> wait =
        new FluentWait<>(mockDriver, mockClock, mockSleeper)
            .withTimeout(Duration.ofMillis(0))
            .pollingEvery(Duration.ofSeconds(2))
            .ignoring(NoSuchWindowException.class);

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(mockCondition))
        .satisfies(expected -> assertThat(exception).isSameAs(expected.getCause()));
  }

  @Test
  void timeoutMessageIncludesCustomMessage() {
    TimeoutException exception =
        new TimeoutException(
            String.format(
                "%s%n%s",
                "Expected condition failed: Expected custom timeout message",
                "(tried for 0 seconds with 500 milliseconds interval)"));

    when(mockClock.instant()).thenReturn(EPOCH, EPOCH.plusMillis(1000));
    when(mockCondition.apply(mockDriver)).thenReturn(null);

    Wait<WebDriver> wait =
        new FluentWait<>(mockDriver, mockClock, mockSleeper)
            .withTimeout(Duration.ofMillis(0))
            .withMessage("Expected custom timeout message");

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(mockCondition))
        .withMessage(exception.getMessage());
  }

  private String state = null;

  @Test
  void timeoutMessageIncludesCustomMessageEvaluatedOnFailure() {
    TimeoutException exception =
        new TimeoutException(
            String.format(
                "%s%n%s",
                "Expected condition failed: external state",
                "(tried for 0 seconds with 500 milliseconds interval)"));

    when(mockClock.instant()).thenReturn(EPOCH, EPOCH.plusMillis(1000));
    when(mockCondition.apply(mockDriver)).thenReturn(null);

    Wait<WebDriver> wait =
        new FluentWait<>(mockDriver, mockClock, mockSleeper)
            .withTimeout(Duration.ofMillis(0))
            .withMessage(() -> state);

    state = "external state";

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(mockCondition))
        .withMessage(exception.getMessage());
  }

  @Test
  void timeoutMessageIncludesToStringOfCondition() {
    TimeoutException exception =
        new TimeoutException(
            String.format(
                "%s%n%s",
                "Expected condition failed: waiting for toString called",
                "(tried for 0 seconds with 500 milliseconds interval)"));

    Function<Object, Boolean> condition =
        new Function<>() {
          @Override
          public Boolean apply(Object ignored) {
            return false;
          }

          @Override
          public String toString() {
            return "toString called";
          }
        };

    Wait<Object> wait = new FluentWait<Object>("cheese").withTimeout(Duration.ofMillis(0));

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(condition))
        .withMessage(exception.getMessage());
  }

  @Test
  void canIgnoreThrowables() {
    final AssertionError exception = new AssertionError();

    when(mockClock.instant()).thenReturn(EPOCH, EPOCH.plusMillis(1000));
    when(mockCondition.apply(mockDriver)).thenThrow(exception);

    Wait<WebDriver> wait =
        new FluentWait<>(mockDriver, mockClock, mockSleeper)
            .withTimeout(Duration.ofMillis(0))
            .pollingEvery(Duration.ofSeconds(2))
            .ignoring(AssertionError.class);

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(mockCondition))
        .satisfies(expected -> assertThat(exception).isSameAs(expected.getCause()));
  }

  @Test
  void callsDeprecatedHandlerForRuntimeExceptions() {
    final TimeoutException exception = new TimeoutException();

    when(mockClock.instant()).thenReturn(EPOCH, EPOCH.plusMillis(2500));
    when(mockCondition.apply(mockDriver)).thenThrow(exception);

    final TestException sentinelException = new TestException();
    FluentWait<WebDriver> wait =
        new FluentWait<>(mockDriver, mockClock, mockSleeper) {
          @Override
          protected RuntimeException timeoutException(
              String message, @Nullable Throwable lastException) {
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

  @Test
  void showsTimeoutInHumanReadableFormat() {
    assertThat(formatTimeout(Duration.ofSeconds(0))).isEqualTo("0 seconds");
    assertThat(formatTimeout(Duration.ofSeconds(1))).isEqualTo("1 second");
    assertThat(formatTimeout(Duration.ofSeconds(2))).isEqualTo("2 seconds");
    assertThat(formatTimeout(Duration.ofMillis(500))).isEqualTo("0.5 seconds");
    assertThat(formatTimeout(Duration.ofMillis(1500))).isEqualTo("1.5 seconds");
    assertThat(formatTimeout(Duration.ofMillis(1245678901234L)))
        .isEqualTo("1245678901.234 seconds");
  }

  private static class TestException extends RuntimeException {}
}
