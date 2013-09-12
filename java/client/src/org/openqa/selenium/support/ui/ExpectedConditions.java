/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy.

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

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Canned {@link ExpectedCondition}s which are generally useful within webdriver
 * tests.
 */
public class ExpectedConditions {

  private final static Logger log = Logger.getLogger(ExpectedConditions.class.getName());

  private ExpectedConditions() {
    // Utility class
  }

  /**
   * An expectation for checking the title of a page.
   *
   * @param title the expected title, which must be an exact match
   * @return true when the title matches, false otherwise
   */
  public static ExpectedCondition<Boolean> titleIs(final String title) {
    return new ExpectedCondition<Boolean>() {
      private String currentTitle = "";

      @Override
      public Boolean apply(WebDriver driver) {
        currentTitle = driver.getTitle();
        return title.equals(currentTitle);
      }

      @Override
      public String toString() {
        return String.format("title to be \"%s\". Current title: \"%s\"", title, currentTitle);
      }
    };
  }

  /**
   * An expectation for checking that the title contains a case-sensitive
   * substring
   *
   * @param title the fragment of title expected
   * @return true when the title matches, false otherwise
   */
  public static ExpectedCondition<Boolean> titleContains(final String title) {
    return new ExpectedCondition<Boolean>() {
      private String currentTitle = "";

      @Override
      public Boolean apply(WebDriver driver) {
        currentTitle = driver.getTitle();
        return currentTitle != null && currentTitle.contains(title);
      }

      @Override
      public String toString() {
        return String.format("title to contain \"%s\". Current title: \"%s\"", title, currentTitle);
      }
    };
  }

  /**
   * An expectation for checking whether the given frame is available to switch
   * to. <p> If the frame is available it switches the given driver to the
   * specified frame.
   */
  public static ExpectedCondition<WebDriver> frameToBeAvailableAndSwitchToIt(
      final String frameLocator) {
    return new ExpectedCondition<WebDriver>() {
      @Override
      public WebDriver apply(WebDriver driver) {
        try {
          return driver.switchTo().frame(frameLocator);
        } catch (NoSuchFrameException e) {
          return null;
        }
      }

      @Override
      public String toString() {
        return "frame to be available: " + frameLocator;
      }
    };
  }

  public static ExpectedCondition<Alert> alertIsPresent() {
    return new ExpectedCondition<Alert>() {
      @Override
      public Alert apply(WebDriver driver) {
        try {
          return driver.switchTo().alert();
        } catch (NoAlertPresentException e) {
          return null;
        }
      }

      @Override
      public String toString() {
        return "alert to be present";
      }
    };
  }

  /**
   * @see GenericConditions#not(com.google.common.base.Function)
   */

  public static ExpectedCondition<Boolean> not(ExpectedCondition<?> condition) {
    return (ExpectedCondition<Boolean>)GenericConditions.not(condition);
  }

  /**
   * @see GenericConditions#refreshed(com.google.common.base.Function)
   */

  public static <T> ExpectedCondition<T> refreshed(ExpectedCondition<T> condition) {
    return (ExpectedCondition<T>)GenericConditions.refreshed(condition);
  }

  /**
   * Looks up an element. Logs and re-throws WebDriverException if thrown. <p/>
   * Method exists to gather data for http://code.google.com/p/selenium/issues/detail?id=1800
   */
  private static WebElement findElement(By by, WebDriver driver) {
    try {
      return driver.findElement(by);
    } catch (NoSuchElementException e) {
      throw e;
    } catch (WebDriverException e) {
      log.log(Level.WARNING,
          String.format("WebDriverException thrown by findElement(%s)", by), e);
      throw e;
    }
  }

  /**
   * @see #findElement(By, WebDriver)
   */
  private static List<WebElement> findElements(By by, WebDriver driver) {
    try {
      return driver.findElements(by);
    } catch (WebDriverException e) {
      log.log(Level.WARNING,
          String.format("WebDriverException thrown by findElement(%s)", by), e);
      throw e;
    }
  }
}
