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

import com.google.common.base.Function;
import org.openqa.selenium.NotFoundException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.concurrent.TimeUnit.SECONDS;

/**
 * An implementation of the Wait interface that makes use of WebDriver. The
 * expected usage is in conjunction with the {@link ExpectedCondition} interface.
 * <p>
 * Because waiting for elements to appear on a page is such a common use-case,
 * this class will silently swallow NotFoundException whilst waiting.
 */
public class WebDriverWait implements Wait<WebDriver> {
  private final Clock clock;
  private final WebDriver driver;
  private final long timeOutInMillis;
  private final long sleepTimeOut;
  private final static long DEFAULT_SLEEP_TIMEOUT = 500;

  /**
   * @param driver The WebDriver instance to pass to the expected conditions
   * @param timeOutInSeconds The timeout in seconds when an expectation is
   * called
   */
  public WebDriverWait(WebDriver driver, long timeOutInSeconds) {
    this(new SystemClock(), driver, timeOutInSeconds, DEFAULT_SLEEP_TIMEOUT);
  }

  /**
   * @param clock The clock to use when measuring the timeout
   * @param driver The WebDriver instance to pass to the expected conditions
   * @param timeOutInSeconds The timeout in seconds when an expectation is
   * @param sleepTimeOut The timeout used whilst sleeping. Defaults to 500ms
   * called
   */
  protected WebDriverWait(Clock clock, WebDriver driver,
      long timeOutInSeconds, long sleepTimeOut) {
    this.clock = clock;
    this.driver = driver;
    this.timeOutInMillis = SECONDS.toMillis(timeOutInSeconds);
    this.sleepTimeOut = sleepTimeOut;
  }

  /**
  * {@inheritDoc}
  */
  public <T> T until(Function<WebDriver, T> isTrue) {
    long end = clock.laterBy(timeOutInMillis);
    NotFoundException lastException = null;

    while (clock.isNowBefore(end)) {
      try {
        T value = isTrue.apply(driver);

        if (value != null && Boolean.class.equals(value.getClass())) {
          if (Boolean.TRUE.equals(value)) {
            return value;
          }
        } else if (value != null) {
          return value;
        }
      } catch (NotFoundException e) {
        // Common case in many conditions, so swallow here, but be ready to
        // rethrow if it the element never appears.
        lastException = e;
      }
      sleep();
    }

    throwTimeoutException(String.format("Timed out after %d seconds",
        SECONDS.convert(timeOutInMillis, MILLISECONDS)), lastException);

    throw new IllegalStateException(
        "'throwTimeoutException' should have thrown an exception!");
  }

  /**
   * Override this method to throw an exception that is idiomatic for a given
   * test infrastructure. E.g. JUnit4 should throw an {@link AssertionError}
   */
  protected void throwTimeoutException(String message, Exception lastException) {
    throw new TimeoutException(message, lastException);
  }

  private void sleep() {
    try {
      Thread.sleep(sleepTimeOut);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new WebDriverException(e);
    }
  }
}
                       
