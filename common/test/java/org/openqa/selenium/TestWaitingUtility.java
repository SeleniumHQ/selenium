// Copyright 2010 Google Inc. All Rights Reserved.
package org.openqa.selenium;

import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import static org.junit.Assert.fail;

/**
 * This helper class duplicates the functionality of the Wait class
 * in the support classes. This class is not thread-safe.
 */
public class TestWaitingUtility {

  /**
   * Wait for the callable to return either "not null" or "true". Exceptions are
   * caught and only rethrown if we time out.
   *
   * @param until Condition that we're waiting for.
   * @param duration How long to wait.
   * @param in Unit in which duration is measured.
   * @return Whatever the condition returns.
   */
  public <X> X waitFor(Callable<X> until, long duration, TimeUnit in) {
    long end = System.currentTimeMillis() + in.toMillis(duration);

    X value = null;
    Exception lastException = null;

    while (System.currentTimeMillis() < end) {
      try {
        value = until.call();

        System.out.println("value = " + value);

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

    System.out.println("Timed out");

    if (lastException != null) {
      System.out.println("pushing out the exception");
      throw propagate(lastException);
    }

    fail("Condition timed out: " + until);
    return null;
  }

  private RuntimeException propagate(Exception lastException) {
    if (lastException instanceof RuntimeException) {
      throw (RuntimeException) lastException;
    }

    throw new RuntimeException(lastException);
  }


  public static void sleep(long duration) {
    try {
      Thread.sleep(duration);
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
  }

  public static Callable<WebElement> elementToExist(
      final WebDriver driver, final String elementId) {
    return new Callable<WebElement>() {

      public WebElement call() throws Exception {
        return driver.findElement(By.id(elementId));
      }
    };
  }

  public static Callable<String> elementTextToEqual(
      final WebElement element, final String value) {
    return new Callable<String>() {

      public String call() throws Exception {
        String text = element.getText();
        if (value.equals(text)) {
          return text;
        }

        return null;
      }

      @Override
      public String toString() {
        return "element text did not equal: " + value;
      }
    };
  }

  public static Callable<String> elementTextToContain(
      final WebElement element, final String value) {
    return new Callable<String>() {

      public String call() throws Exception {
        String text = element.getText();
        if (text.contains(value)) {
          return text;
        }

        return null;
      }
    };
  }

  public static Callable<String> elementValueToEqual(
      final WebElement element, final String expectedValue) {
    return new Callable<String>() {

      public String call() throws Exception {
        String value = element.getValue();
        if (expectedValue.equals(value)) {
          return value;
        }

        return null;
      }
    };
  }

  public static Callable<String> pageTitleToBe(
      final WebDriver driver, final String expectedTitle) {
    return new Callable<String>() {

      public String call() throws Exception {
        String title = driver.getTitle();

        if (expectedTitle.equals(title)) {
          return title;
        }

        return null;
      }
    };
  }
}
