// Copyright 2010 Google Inc. All Rights Reserved.
package org.openqa.selenium;

/**
 * This helper class duplicates the functionality of the Wait class
 * in the support classes.
 */
public class TestWaitingUtility {
  public static final long MAX_WAIT_TIME_MS = 5000;
  public static final long SLEEP_DURATION_MS = 50;

  public static String waitUntilElementValueEquals(WebElement element, String toValue)
      throws InterruptedException {
    long waitStartMs = System.currentTimeMillis();

    while (waitStartMs + MAX_WAIT_TIME_MS > System.currentTimeMillis() &&
           !(element.getValue().equals(toValue))) {
      Thread.sleep(SLEEP_DURATION_MS);
    }

    return element.getValue();
  }

  public static void waitUntilElementTextEquals(WebElement element, String toValue)
      throws InterruptedException {
    long waitStartMs = System.currentTimeMillis();

    while (waitStartMs + MAX_WAIT_TIME_MS > System.currentTimeMillis() &&
           !(element.getText().equals(toValue))) {
      Thread.sleep(SLEEP_DURATION_MS);
    }
  }

  public static WebElement waitForElementToExist(WebDriver driver, String elementId)
      throws InterruptedException {

    long waitStartMs = System.currentTimeMillis();

    while (waitStartMs + MAX_WAIT_TIME_MS > System.currentTimeMillis()) {
      try {
        return driver.findElement(By.id(elementId));
      } catch (NoSuchElementException e) {
        Thread.sleep(SLEEP_DURATION_MS);
      }
    }

    // To throw a NoSuchElementException in case it was not found.
    return driver.findElement(By.id(elementId));
  }

  public static String waitUntilElementTextContains(WebElement element, String partialValue)
      throws InterruptedException {
    long waitStartMs = System.currentTimeMillis();

    while (waitStartMs + MAX_WAIT_TIME_MS > System.currentTimeMillis() &&
           !(element.getText().contains(partialValue))) {
      Thread.sleep(SLEEP_DURATION_MS);
    }

    return element.getText();
  }

  public static String waitForPageTitle(WebDriver driver, String desiredTitle)
      throws InterruptedException {
    long waitStartMs = System.currentTimeMillis();

    while (waitStartMs + MAX_WAIT_TIME_MS > System.currentTimeMillis() &&
           !(driver.getTitle().equals(desiredTitle))) {
      Thread.sleep(SLEEP_DURATION_MS);
    }

    return driver.getTitle();
  }
}
