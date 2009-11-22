/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import org.jmock.Expectations;
import org.jmock.integration.junit3.MockObjectTestCase;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class WebDriverWaitTest extends MockObjectTestCase {
  @SuppressWarnings("unchecked")
  public void testShouldWaitUntilReturnValueOfConditionIsNotNull() {
    final ExpectedCondition<String> condition = mock(ExpectedCondition.class);

    checking(new Expectations() {{
      one(condition).apply(null); will(returnValue(null));
      one(condition).apply(null); will(returnValue("done"));
    }});


    WebDriverWait wait = new WebDriverWait(new FakeClock(), null, 5, 0);
    wait.until(condition);
  }

  @SuppressWarnings("unchecked")
  public void testShouldWaitUntilABooleanResultIsTrue() {
    final ExpectedCondition<Boolean> condition = mock(ExpectedCondition.class);

    checking(new Expectations() {{
      one(condition).apply(null); will(returnValue(false));
      one(condition).apply(null); will(returnValue(true));
    }});


    WebDriverWait wait = new WebDriverWait(new FakeClock(), null, 5, 0);
    wait.until(condition);
  }

  public void testShouldThrowAnExceptionIfTheTimerRunsOut() {
    Clock clock = new TickingClock(500);
    WebDriverWait wait = new WebDriverWait(clock, null, 1, 0);

    try {
      wait.until(new FalseExpectation());
      fail();
    } catch (TimeoutException e) {
      // this is expected
    }
  }

  @SuppressWarnings("unchecked")
  public void testShouldSilentlyCaptureNoSuchElementExceptions() {
    final WebElement element = mock(WebElement.class);

    final ExpectedCondition<WebElement> condition = mock(ExpectedCondition.class);
    checking(new Expectations() {{
      one(condition).apply(null); will(throwException(new NoSuchElementException("foo")));
      one(condition).apply(null); will(returnValue(element));
    }});

    Clock clock = new TickingClock(500);
    Wait wait = new WebDriverWait(clock, null, 5, 0);

    wait.until(condition);
  }

  @SuppressWarnings("unchecked")
  public void testShouldPassWebDriverFromConstructorToExpectation() {
    final WebDriver driver = mock(WebDriver.class);
    final ExpectedCondition<String> condition = mock(ExpectedCondition.class);

    checking(new Expectations() {{
      one(condition).apply(driver); will(returnValue("foo"));
    }});

    Clock clock = new TickingClock(500);
    Wait wait = new WebDriverWait(clock, driver, 5, 0);

    wait.until(condition);
  }

  @SuppressWarnings("unchecked")
  public void testShouldChainNoSuchElementExceptionWhenTimingOut() {
    final ExpectedCondition<WebElement> expectation = mock(ExpectedCondition.class);

    checking(new Expectations() {{
      allowing(expectation).apply(null); will(returnValue(new NoSuchElementException("foo")));
    }});

    Clock clock = new TickingClock(500);
    Wait wait = new WebDriverWait(clock, null, 1, 0);

    try {
      wait.until(expectation);
    } catch (TimeoutException e) {
      assertTrue(e.getCause() instanceof NoSuchElementException);
    }
  }

  private static class FalseExpectation implements ExpectedCondition<Boolean> {
    public Boolean apply(WebDriver driver) {
      return false;
    }
  }

  private static class TickingClock implements Clock {
    private final long incrementMillis;
    private long now = 0;

    public TickingClock(long incrementMillis) {
      this.incrementMillis = incrementMillis;
    }

    public long now() {
      return now;
    }

    public long laterBy(long durationInMillis) {
      return now + durationInMillis;
    }

    public boolean isNowBefore(long endInMillis) {
      now += incrementMillis;
      return now < endInMillis;
    }
  }
}
      
