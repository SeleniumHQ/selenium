/*
Copyright 2010 Selenium committers

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


package org.openqa.selenium;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.junit.Assert.fail;

import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

/**
 * This helper class duplicates the functionality of the Wait class in the support classes. This
 * class is not thread-safe.
 */
public class TestWaiter {

  private static final long DEFAULT_TIME_OUT = 5;
  private static final TimeUnit DEFAULT_UNIT = SECONDS;

  /**
   * Wait for the callable to return either "not null" or "true". Exceptions are caught and only
   * rethrown if we time out.
   * 
   * @param until Condition that we're waiting for.
   * @return Whatever the condition returns.
   */
  public static <X> X waitFor(Callable<X> until) {
    return waitFor(until, DEFAULT_TIME_OUT, DEFAULT_UNIT);
  }

  /**
   * Wait for the callable to return either "not null" or "true". Exceptions are caught and only
   * rethrown if we time out.
   * 
   * @param until Condition that we're waiting for.
   * @param duration How long to wait.
   * @param in Unit in which duration is measured.
   * @return Whatever the condition returns.
   */
  public static <X> X waitFor(Callable<X> until, long duration, TimeUnit in) {
    long end = System.currentTimeMillis() + in.toMillis(duration);

    X value = null;
    Exception lastException = null;

    while (System.currentTimeMillis() < end) {
      try {
        value = until.call();

        if (value instanceof Boolean) {
          if ((Boolean) value) {
            return value;
          }
        } else if (value != null) {
          return value;
        }

        sleep(100);
      } catch (Exception e) {
        // Swallow for later re-throwing
        lastException = e;
      }
    }

    if (lastException != null) {
      throw propagate(lastException);
    }

    fail("Condition timed out: " + until);
    return null;
  }

  private static RuntimeException propagate(Exception lastException) {
    if (lastException instanceof RuntimeException) {
      throw (RuntimeException) lastException;
    }

    throw new RuntimeException(lastException);
  }


  private static void sleep(long duration) {
    try {
      Thread.sleep(duration);
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
  }
}
