// Copyright 2010 Google Inc. All Rights Reserved.
package org.openqa.selenium;

/**
 * This helper class duplicates the functionality of the Wait class
 * in the support classes. This class is not thread-safe.
 */
public class TestWaitingUtility {
  public static final long MAX_WAIT_TIME_MS = 5000;
  public static final long SLEEP_DURATION_MS = 50;

  // This makes the class not thread-safe.
  private static long sleepStartTimeMs;

  public static void sleep() {
    try {
      Thread.sleep(SLEEP_DURATION_MS);
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
  }
  public static String waitUntilElementValueEquals(WebElement element, String toValue) {
    startSleep();

    while (shouldSleep() &&
           !(element.getValue().equals(toValue))) {
      sleep();
    }

    return element.getValue();
  }

  public static void waitUntilElementTextEquals(WebElement element, String toValue) {
    startSleep();

    while (shouldSleep() &&
           !(element.getText().equals(toValue))) {
      sleep();
    }
  }

  public static WebElement waitForElementToExist(WebDriver driver, String elementId) {
    startSleep();

    while (shouldSleep()) {
      try {
        return driver.findElement(By.id(elementId));
      } catch (NoSuchElementException e) {
        sleep();
      }
    }

    // To throw a NoSuchElementException in case it was not found.
    return driver.findElement(By.id(elementId));
  }

  public static String waitUntilElementTextContains(WebElement element, String partialValue) {
    startSleep();
    
    while (shouldSleep() &&
           !(element.getText().contains(partialValue))) {
      sleep();
    }

    return element.getText();
  }

  public static String waitForPageTitle(WebDriver driver, String desiredTitle) {
    startSleep();

    while (shouldSleep() &&
           !(driver.getTitle().equals(desiredTitle))) {
      sleep();
    }

    return driver.getTitle();
  }

  public static void startSleep() {
      sleepStartTimeMs = System.currentTimeMillis();
  }

  public static boolean shouldSleep() {
    return (sleepStartTimeMs + MAX_WAIT_TIME_MS > System.currentTimeMillis());
  }
}
