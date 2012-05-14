/*
Copyright 2007-2009 Selenium committers

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

import static org.junit.Assert.assertSame;
import static org.junit.Assert.fail;

import org.openqa.selenium.testing.MockTestBase;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import org.jmock.Expectations;
import org.junit.Before;
import org.junit.Test;

public class WebDriverWaitTest extends MockTestBase {

  private WebDriver mockDriver;

  @Before
  public void createMocks() {
    mockDriver = mock(WebDriver.class);
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
    final WebElement element = mock(WebElement.class);

    final ExpectedCondition<WebElement> condition = mock(ExpectedCondition.class);
    checking(new Expectations() {{
      one(condition).apply(mockDriver);
      will(throwException(new NoSuchElementException("foo")));
      one(condition).apply(mockDriver);
      will(returnValue(element));
    }});

    TickingClock clock = new TickingClock(500);
    Wait wait = new WebDriverWait(mockDriver, clock, clock, 5, 500);
    assertSame(element, wait.until(condition));
  }

  @SuppressWarnings("unchecked")
  @Test
  public void shouldSilentlyCaptureNoSuchFrameExceptions() {

    final ExpectedCondition<WebElement> condition = mock(ExpectedCondition.class);
    checking(new Expectations() {{
      one(condition).apply(mockDriver);
      will(throwException(new NoSuchFrameException("foo")));
      one(condition).apply(mockDriver);
      will(returnValue(true));
    }});

    TickingClock clock = new TickingClock(500);
    Wait wait = new WebDriverWait(mockDriver, clock, clock, 5, 500);
    wait.until(condition);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void shouldSilentlyCaptureNoSuchWindowExceptions() {

    final ExpectedCondition<WebElement> condition = mock(ExpectedCondition.class);
    checking(new Expectations() {{
      one(condition).apply(mockDriver);
      will(throwException(new NoSuchWindowException("foo")));
      one(condition).apply(mockDriver);
      will(returnValue(true));
    }});

    TickingClock clock = new TickingClock(500);
    Wait wait = new WebDriverWait(mockDriver, clock, clock, 5, 500);
    wait.until(condition);
  }

  private static class FalseExpectation implements ExpectedCondition<Boolean> {
    public Boolean apply(WebDriver driver) {
      return false;
    }
  }
}
      
