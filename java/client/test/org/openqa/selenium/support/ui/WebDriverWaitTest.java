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

import static org.junit.Assert.assertSame;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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
import org.openqa.selenium.WebElement;

@RunWith(JUnit4.class)
public class WebDriverWaitTest {

  @Mock private WebDriver mockDriver;
  @Mock private WebElement mockElement;

  @Before
  public void createMocks() {
    MockitoAnnotations.initMocks(this);
  }

  @Test
  public void shouldThrowAnExceptionIfTheTimerRunsOut() {
    TickingClock clock = new TickingClock(200);
    WebDriverWait wait = new WebDriverWait(mockDriver, clock, clock, 1, 200);

    try {
      wait.until(new FalseExpectation());
      fail();
    } catch (TimeoutException e) {
      // this is expected
    }
  }

  @SuppressWarnings("unchecked")
  @Test
  public void shouldSilentlyCaptureNoSuchElementExceptions() {
    final ExpectedCondition<WebElement> condition = mock(ExpectedCondition.class);
    when(condition.apply(mockDriver))
        .thenThrow(new NoSuchElementException("foo"))
        .thenReturn(mockElement);

    TickingClock clock = new TickingClock(500);
    Wait<WebDriver> wait = new WebDriverWait(mockDriver, clock, clock, 5, 500);
    assertSame(mockElement, wait.until(condition));
  }

  @SuppressWarnings("unchecked")
  @Test
  public void shouldSilentlyCaptureNoSuchFrameExceptions() {
    final ExpectedCondition<WebElement> condition = mock(ExpectedCondition.class);
    when(condition.apply(mockDriver))
        .thenThrow(new NoSuchFrameException("foo"))
        .thenReturn(mockElement);

    TickingClock clock = new TickingClock(500);
    Wait<WebDriver> wait = new WebDriverWait(mockDriver, clock, clock, 5, 500);
    wait.until(condition);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void shouldSilentlyCaptureNoSuchWindowExceptions() {

    final ExpectedCondition<WebElement> condition = mock(ExpectedCondition.class);
    when(condition.apply(mockDriver))
        .thenThrow(new NoSuchWindowException("foo"))
        .thenReturn(mockElement);

    TickingClock clock = new TickingClock(500);
    Wait<WebDriver> wait = new WebDriverWait(mockDriver, clock, clock, 5, 500);
    wait.until(condition);
  }

  private static class FalseExpectation implements ExpectedCondition<Boolean> {
    public Boolean apply(WebDriver driver) {
      return false;
    }
  }
}

