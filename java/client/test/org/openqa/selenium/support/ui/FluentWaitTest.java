/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

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

package org.openqa.selenium.support.ui;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.MockTestBase;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;

import org.jmock.Expectations;

import java.util.concurrent.TimeUnit;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.fail;

public class FluentWaitTest extends MockTestBase {

  private static final Object ARBITRARY_VALUE = new Object();

  private WebDriver mockDriver;
  private ExpectedCondition<Object> mockCondition;
  private Clock mockClock;
  private Sleeper mockSleeper;

  @Before
  public void createMocks() {
    mockDriver = mock(WebDriver.class);
    mockCondition = mock(GenericCondition.class);
    mockClock = mock(Clock.class);
    mockSleeper = mock(Sleeper.class);
  }

  @Test
  public void shouldWaitUntilReturnValueOfConditionIsNotNull() throws InterruptedException {
    checking(new Expectations() {{
      one(mockClock).laterBy(0L); will(returnValue(2L));

      one(mockCondition).apply(mockDriver); will(returnValue(null));
      one(mockClock).isNowBefore(2L); will(returnValue(true));
      one(mockSleeper).sleep(new Duration(2, TimeUnit.SECONDS));

      one(mockCondition).apply(mockDriver); will(returnValue(ARBITRARY_VALUE));
    }});

    Wait<WebDriver> wait = new FluentWait<WebDriver>(mockDriver, mockClock, mockSleeper)
        .withTimeout(0, TimeUnit.MILLISECONDS)
        .pollingEvery(2, TimeUnit.SECONDS)
        .ignoring(NoSuchElementException.class, NoSuchFrameException.class);

    assertEquals(ARBITRARY_VALUE, wait.until(mockCondition));
  }

  @Test
  public void shouldWaitUntilABooleanResultIsTrue() throws InterruptedException {
    checking(new Expectations() {{
      one(mockClock).laterBy(0L); will(returnValue(2L));

      one(mockCondition).apply(mockDriver); will(returnValue(false));
      one(mockClock).isNowBefore(2L); will(returnValue(true));
      one(mockSleeper).sleep(new Duration(2, TimeUnit.SECONDS));

      one(mockCondition).apply(mockDriver); will(returnValue(false));
      one(mockClock).isNowBefore(2L); will(returnValue(true));
      one(mockSleeper).sleep(new Duration(2, TimeUnit.SECONDS));

      one(mockCondition).apply(mockDriver); will(returnValue(true));
    }});

    Wait<WebDriver> wait = new FluentWait<WebDriver>(mockDriver, mockClock, mockSleeper)
        .withTimeout(0, TimeUnit.MILLISECONDS)
        .pollingEvery(2, TimeUnit.SECONDS)
        .ignoring(NoSuchElementException.class, NoSuchFrameException.class);

    assertEquals(true, wait.until(mockCondition));
  }

  @Test
  public void checksTimeoutAfterConditionSoZeroTimeoutWaitsCanSucceed() {
    checking(new Expectations() {{
      one(mockClock).laterBy(0L); will(returnValue(2L));

      one(mockCondition).apply(mockDriver); will(returnValue(null));
      one(mockClock).isNowBefore(2L); will(returnValue(false));
    }});

    Wait<WebDriver> wait = new FluentWait<WebDriver>(mockDriver, mockClock, mockSleeper)
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
    checking(new Expectations() {{
      one(mockClock).laterBy(0L); will(returnValue(2L));

      one(mockCondition).apply(mockDriver); will(throwException(new NoSuchElementException("")));
      one(mockClock).isNowBefore(2L); will(returnValue(true));
      one(mockSleeper).sleep(new Duration(2, TimeUnit.SECONDS));

      one(mockCondition).apply(mockDriver); will(throwException(new NoSuchFrameException("")));
      one(mockClock).isNowBefore(2L); will(returnValue(true));
      one(mockSleeper).sleep(new Duration(2, TimeUnit.SECONDS));

      one(mockCondition).apply(mockDriver); will(returnValue(ARBITRARY_VALUE));
    }});

    Wait<WebDriver> wait = new FluentWait<WebDriver>(mockDriver, mockClock, mockSleeper)
        .withTimeout(0, TimeUnit.MILLISECONDS)
        .pollingEvery(2, TimeUnit.SECONDS)
        .ignoring(NoSuchElementException.class, NoSuchFrameException.class);

    assertEquals(ARBITRARY_VALUE, wait.until(mockCondition));
  }

  @Test
  public void propagatesUnIgnoredExceptions() {
    final NoSuchWindowException exception = new NoSuchWindowException("");

    checking(new Expectations() {{
      one(mockClock).laterBy(0L); will(returnValue(2L));
      one(mockCondition).apply(mockDriver); will(throwException(exception));
    }});

    Wait<WebDriver> wait = new FluentWait<WebDriver>(mockDriver, mockClock, mockSleeper)
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
  public void timeoutMessageIncludesLastIgnoredException() throws InterruptedException {
    final NoSuchWindowException exception = new NoSuchWindowException("");

    checking(new Expectations() {{
      one(mockClock).laterBy(0L); will(returnValue(2L));

      one(mockCondition).apply(mockDriver); will(throwException(exception));
      one(mockClock).isNowBefore(2L); will(returnValue(false));
    }});

    Wait<WebDriver> wait = new FluentWait<WebDriver>(mockDriver, mockClock, mockSleeper)
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

  public interface GenericCondition extends ExpectedCondition<Object> {
  }
}
